import {CONNECTIONS,AREAS, areaName, connectionName, statusFor} from './key.js';
export const effectiveStatus = (status,role,statusOverride=false) => !statusOverride && ['faculty','admin'].includes(role) ? 'ineligible' : (status||'not-started');
export const emailValid = value => /^[^\s@;,<>]+@[^\s@;,<>]+\.[^\s@;,<>]+$/.test(value);
export function imageURL(value) {
  if (/^assets\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp)$/i.test(value)) return value;
  try { const u=new URL(value); if(u.protocol==='https:' && !u.username && !u.password) return u.href; } catch {}
  return '';
}
export function filterContacts(rows,{search='',areas=[],areaMode='any',status='',connection='',consent='all'}={}) {
  const q=search.trim().toLocaleLowerCase();
  return rows.filter(r=> {
    const hay=[r.firstName,r.lastName,r.email,r.altEmail,r.phone,r.company,r.jobTitle,r.location,r.specialties,r.connection,connectionName(r.connection),statusFor(r.status).label,...(r.areas||[]).map(areaName)].join(' ').toLocaleLowerCase();
    return (!q||hay.includes(q)) && (!status||r.status===status) && (!connection||r.connection===connection) && (consent!=='subscribed'||r.newsletterOptIn===true) && (!areas.length || (areaMode==='all'?areas.every(a=>r.areas?.includes(a)):areas.some(a=>r.areas?.includes(a))));
  });
}
export function sortContacts(rows,key='lastName',direction=1){
  const value=r=>key==='areas'?(r.areas||[]).map(areaName).join(', '):key==='status'?statusFor(r.status).label:key==='connection'?connectionName(r.connection):key==='updatedAt'?(r.updatedAt?.toMillis?.() || 0):r[key]??'';
  return [...rows].sort((a,b)=>typeof value(a)==='number'?(value(a)-value(b))*direction:String(value(a)).localeCompare(String(value(b)),undefined,{numeric:true,sensitivity:'base'})*direction);
}
export function recipients(rows,mode='newsletter') {
  const seen=new Set(); const eligible=[];let excluded=0;
  for(const r of rows){
    if(['on-hold','removed','ineligible'].includes(effectiveStatus(r.status,r.role,r.statusOverride)) || (mode==='newsletter'&&!r.newsletterOptIn) || (mode==='board'&&r.connection==='supporter') || !emailValid(r.email||'')){excluded++;continue;}
    const email=r.email.trim().toLowerCase();if(!seen.has(email)){seen.add(email);eligible.push(email);}
  }
  return {emails:eligible,excluded};
}
export function csv(rows){
  const cell=value=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const fields=['First name','Last name','Email','Alternate email','Phone','Company','Job title','Location','Areas','Connection','Status','Newsletter opt-in'];
  return '\uFEFF'+[fields,...rows.map(r=>[r.firstName,r.lastName,r.email,r.altEmail,r.phone,r.company,r.jobTitle,r.location,(r.areas||[]).map(areaName).join('; '),connectionName(r.connection),statusFor(r.status).label,r.newsletterOptIn?'Yes':'No'])].map(r=>r.map(cell).join(',')).join('\r\n');
}
export function validateProfile(p){
  if(!p.firstName.trim()||!p.lastName.trim())return 'Please enter your first and last name.';
  if(!emailValid(p.email))return 'Please enter a valid contact email address.';
  if(p.altEmail&&!emailValid(p.altEmail))return 'Please enter one valid alternate email address.';
  if(!CONNECTIONS.some(c=>c.id===p.connection))return 'Please choose your connection to TAD.';
  if(!p.areas.length||p.areas.some(id=>!AREAS.some(a=>a.id===id)))return 'Please select at least one program area.';
  return '';
}
