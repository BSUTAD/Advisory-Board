import {effectiveStatus} from './model.js';
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendEmailVerification,sendPasswordResetEmail,reload,connectAuthEmulator,updatePassword,verifyBeforeUpdateEmail,EmailAuthProvider,reauthenticateWithCredential,deleteUser} from 'firebase/auth';
import {getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,collection,query,where,orderBy,limit,startAfter,serverTimestamp,runTransaction,connectFirestoreEmulator,writeBatch,deleteDoc,Timestamp} from 'firebase/firestore';
import {initializeAppCheck,ReCaptchaV3Provider} from 'firebase/app-check';
let db,auth,sessionCallback;
export let session={user:null,role:'member'};
export class NotConfigured extends Error {}
export async function connect(onSession){
  const config=await fetch('portal-config.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('The connection settings could not be loaded.');return r.json();});
  if(!config.firebase?.projectId)throw new NotConfigured('Member services are being prepared. Account registration will open soon.');
  const app=initializeApp(config.firebase);auth=getAuth(app);db=getFirestore(app);
  if(config.appCheckSiteKey)initializeAppCheck(app,{provider:new ReCaptchaV3Provider(config.appCheckSiteKey),isTokenAutoRefreshEnabled:true});
  // Emulators are available only on a local development host, never on GitHub Pages.
  if(['localhost','127.0.0.1'].includes(location.hostname)&&config.emulators){connectAuthEmulator(auth,'http://127.0.0.1:9099');connectFirestoreEmulator(db,'127.0.0.1',8080);}
  sessionCallback=onSession;
  onAuthStateChanged(auth,async user=>{
    session={user,role:'member'};
    try {if(user?.emailVerified){const r=await getDoc(doc(db,'roles',user.uid));if(r.exists())session.role=r.data().role;}}
    catch {onSession({...session,roleError:true});return;}
    onSession(session);
  });
}
export const staff=()=>session.user?.emailVerified && ['faculty','admin'].includes(session.role);
export const admin=()=>session.user?.emailVerified && session.role==='admin';
const actionSettings=()=>({url:new URL('account.html'+(sessionStorage.getItem('tad-invite')?'#invite='+encodeURIComponent(sessionStorage.getItem('tad-invite')):''),location.href).href});
export async function register(email,password){const result=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(result.user,actionSettings());return result.user;}
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
export const logout=()=>signOut(auth);
export const resetPassword=email=>sendPasswordResetEmail(auth,email,actionSettings());
export const changePassword=password=>updatePassword(auth.currentUser,password);
export const changeLoginEmail=email=>verifyBeforeUpdateEmail(auth.currentUser,email,actionSettings());
export const verifyEmail=()=>sendEmailVerification(auth.currentUser,actionSettings());
export async function refreshSession(){await reload(auth.currentUser);await auth.currentUser.getIdToken(true);session.user=auth.currentUser;if(session.user.emailVerified){const r=await getDoc(doc(db,'roles',session.user.uid));session.role=r.exists()?r.data().role:'member';}sessionCallback(session);}
export async function profile(id=session.user.uid){const s=await getDoc(doc(db,'profiles',id));return s.exists()?{id:s.id,...s.data()}:null;}
export async function saveProfile(p,id=session.user.uid){
  return runTransaction(db,async tx=>{const ref=doc(db,'profiles',id);const before=await tx.get(ref);const now=serverTimestamp();
    if(before.exists())tx.update(ref,{...p,...(id===session.user.uid?{accountEmail:session.user.email}:{}),updatedAt:now,updatedBy:session.user.uid});
    else tx.set(ref,{...p,accountEmail:session.user.email,createdAt:now,updatedAt:now,updatedBy:session.user.uid});
  });
}
export async function directory(){
  const rows=[];let after=null;
  do {const q=query(collection(db,'profiles'),orderBy('__name__'),...(after?[startAfter(after)]:[]),limit(250));const page=await getDocs(q);rows.push(...page.docs.map(s=>({id:s.id,...s.data()})));after=page.size===250?page.docs.at(-1):null;}while(after);
  const meta=await getDocs(query(collection(db,'memberAdmin'),limit(2000)));const map=new Map(meta.docs.map(s=>[s.id,s.data()]));
  return Promise.all(rows.map(async r=>{const role=await accountRole(r.id);return {...r,role,status:effectiveStatus(map.get(r.id)?.status,role),notes:map.get(r.id)?.notes||''};}));
}
export async function accountRole(id){const s=await getDoc(doc(db,'roles',id));return s.exists()?s.data().role:'member';}
export async function saveAdminRecord(id,p,metadata,expectedUpdatedAt){
  await runTransaction(db,async tx=>{
    const ref=doc(db,'profiles',id), old=await tx.get(ref);if(!old.exists())throw Error('This contact is no longer available.');
    if((old.data().updatedAt?.toMillis?.()||0)!==(expectedUpdatedAt?.toMillis?.()||0))throw Error('This profile changed while you were editing. Close it and refresh the directory before saving.');
    const roleDoc=await tx.get(doc(db,'roles',id));
    metadata={...metadata,status:effectiveStatus(metadata.status,roleDoc.exists()?roleDoc.data().role:'member')};
    const now=serverTimestamp();tx.update(ref,{...p,updatedAt:now,updatedBy:session.user.uid});
    tx.set(doc(db,'memberAdmin',id),{...metadata,updatedAt:now,updatedBy:session.user.uid});
  });
}
export async function changeRole(id,role){if(id===session.user.uid)throw Error('Ask another administrator to change your access.');await setDoc(doc(db,'roles',id),{role,updatedAt:serverTimestamp(),updatedBy:session.user.uid});}
export async function listAlbums(){const q=staff()?query(collection(db,'albums'),limit(200)):query(collection(db,'albums'),where('published','==',true),limit(200));return (await getDocs(q)).docs.map(s=>({id:s.id,...s.data()})).sort((a,b)=>b.eventDate.localeCompare(a.eventDate));}
export async function saveAlbum(data,id){
  const ref=id?doc(db,'albums',id):doc(collection(db,'albums'));const now=serverTimestamp();
  if(id)await updateDoc(ref,{...data,updatedAt:now});else await setDoc(ref,{...data,createdBy:session.user.uid,createdAt:now,updatedAt:now});return ref.id;
}
export async function albumPhotos(albumId){return (await getDocs(query(collection(db,'albums',albumId,'photos'),...(staff()?[]:[where('hidden','==',false)]),orderBy('position'),limit(200)))).docs.map(s=>({id:s.id,...s.data()}));}
export async function savePhoto(albumId,data,id){const ref=id?doc(db,'albums',albumId,'photos',id):doc(collection(db,'albums',albumId,'photos'));await setDoc(ref,{...data,updatedAt:serverTimestamp()});return ref.id;}
export async function archivePhoto(albumId,id){await updateDoc(doc(db,'albums',albumId,'photos',id),{hidden:true,updatedAt:serverTimestamp()});}

export async function deleteAccount(password){
  const user=auth.currentUser;
  if(!user)throw Error('Please sign in before deleting your account.');
  await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,password));
  await user.getIdToken(true);
  const batch=writeBatch(db);
  for(const collection of ['profiles','memberAdmin','roles'])batch.delete(doc(db,collection,user.uid));
  await batch.commit();
  try {await deleteUser(user);}
  catch(error){throw Error('Your contact profile and directory information have been removed, but your login could not be deleted. Please retry Delete my account to finish. '+(error.code||''));}
}

export async function pendingInvitations(){return (await getDocs(query(collection(db,'invitations'),limit(250)))).docs.map(s=>({id:s.id,...s.data()}));}
export async function createInvitation(p,loginEmail){
  if(!admin())throw Error('Administrator access is required.');
  const existing=await getDocs(query(collection(db,'profiles'),where('accountEmail','==',loginEmail),limit(1)));
  if(!existing.empty)throw Error('This login email already has a profile. Use the directory to edit it, or ask the member to reset their password.');
  const pending=await getDocs(query(collection(db,'invitations'),where('loginEmail','==',loginEmail),limit(1)));
  if(!pending.empty)throw Error('An invitation already exists for this email. Copy that invitation, or cancel it before creating a replacement.');
  const ref=doc(collection(db,'invitations'));const now=serverTimestamp();
  const profile={...p,newsletterOptIn:false,accountEmail:loginEmail,createdAt:now,updatedAt:now,updatedBy:session.user.uid};
  await setDoc(ref,{loginEmail,profile,createdAt:now,createdBy:session.user.uid,expiresAt:Timestamp.fromMillis(Date.now()+30*86400000)});
  return ref.id;
}
export const cancelInvitation=id=>deleteDoc(doc(db,'invitations',id));
export async function invitation(id){const s=await getDoc(doc(db,'invitations',id));if(!s.exists())throw Error('This invitation is no longer available. Ask the sender for a new one.');const i=s.data();if(i.expiresAt.toMillis()<Date.now())throw Error('This invitation has expired. Ask the sender for a new one.');return {id,...i};}
export async function claimInvitation(id,p){
  const user=session.user;
  await runTransaction(db,async tx=>{
    const ref=doc(db,'invitations',id),target=doc(db,'profiles',user.uid);
    const invite=await tx.get(ref),old=await tx.get(target);
    if(!invite.exists())throw Error('This invitation is no longer available.');
    if(old.exists())throw Error('You already have a contact profile. Your information has not been overwritten. Ask the sender to cancel the duplicate invitation.');
    if(invite.data().loginEmail!==user.email.toLowerCase()||invite.data().expiresAt.toMillis()<Date.now())throw Error('Sign in with the verified invited email, or request a new invitation.');
    const now=serverTimestamp();
    tx.set(target,{...p,accountEmail:user.email,createdAt:now,updatedAt:now,updatedBy:user.uid});
    tx.delete(ref);
  });
}
