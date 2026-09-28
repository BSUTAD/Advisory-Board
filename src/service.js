import {effectiveStatus} from './model.js';
import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendEmailVerification,sendPasswordResetEmail,reload,connectAuthEmulator,updatePassword} from 'firebase/auth';
import {getFirestore,doc,getDoc,getDocs,setDoc,updateDoc,collection,query,where,orderBy,limit,startAfter,serverTimestamp,runTransaction,connectFirestoreEmulator} from 'firebase/firestore';
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
const actionSettings=()=>({url:new URL('account.html',location.href).href});
export async function register(email,password){const result=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(result.user,actionSettings());return result.user;}
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
export const logout=()=>signOut(auth);
export const resetPassword=email=>sendPasswordResetEmail(auth,email,actionSettings());
export const changePassword=password=>updatePassword(auth.currentUser,password);
export const verifyEmail=()=>sendEmailVerification(auth.currentUser,actionSettings());
export async function refreshSession(){await reload(auth.currentUser);await auth.currentUser.getIdToken(true);session.user=auth.currentUser;if(session.user.emailVerified){const r=await getDoc(doc(db,'roles',session.user.uid));session.role=r.exists()?r.data().role:'member';}sessionCallback(session);}
export async function profile(id=session.user.uid){const s=await getDoc(doc(db,'profiles',id));return s.exists()?{id:s.id,...s.data()}:null;}
export async function saveProfile(p,id=session.user.uid){
  return runTransaction(db,async tx=>{const ref=doc(db,'profiles',id);const before=await tx.get(ref);const now=serverTimestamp();
    if(before.exists())tx.update(ref,{...p,updatedAt:now,updatedBy:session.user.uid});
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
