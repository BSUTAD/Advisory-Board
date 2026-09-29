import test from 'node:test';import assert from 'node:assert/strict';
import {recipients,filterContacts,sortContacts,imageURL,csv,validateProfile,effectiveStatus} from '../src/model.js';
import {AREAS,STATUSES} from '../src/key.js';
const base={connection:'active',firstName:'A',lastName:'Person',email:'a@example.org',altEmail:'',areas:['graphic','illustration-animation'],newsletterOptIn:true,status:'very-active'};
test('newsletter recipients respect consent, holds/removals, validation and duplicates',()=>{
 const result=recipients([base,{...base,email:'A@EXAMPLE.ORG'},{...base,email:'b@example.org',newsletterOptIn:false},{...base,email:'c@example.org',status:'on-hold'},{...base,email:'d@example.org',status:'removed'},{...base,email:'bad\nBcc:other@example.org'}]);assert.deepEqual(result.emails,['a@example.org']);assert.equal(result.excluded,4);
 assert.equal(recipients([base,{...base,email:'b@example.org',newsletterOptIn:false}],'board').emails.length,2);
});
test('multi-area any/all filters and sorting',()=>{const rows=[base,{...base,lastName:'Alpha',areas:['graphic']},{...base,lastName:'Zeta',areas:['exhibit']}];assert.equal(filterContacts(rows,{areas:['graphic','illustration-animation'],areaMode:'all'}).length,1);assert.equal(filterContacts(rows,{areas:['graphic','illustration-animation']}).length,2);assert.equal(filterContacts(rows,{search:'illustration'}).length,1);assert.equal(sortContacts(rows)[0].lastName,'Alpha');});
test('CSV escapes formula injection and quotes',()=>{const text=csv([{...base,company:'=HYPERLINK("bad")'}]);assert.ok(text.includes('"\'=HYPERLINK(""bad"")"'));});
test('image links reject script, data and filesystem URLs',()=>{for(const url of ['javascript:alert(1)','data:image/svg+xml,bad','http://x.com/a.jpg','//evil.com/img','assets/../key.json','https://secret:pass@x.com/img'])assert.equal(imageURL(url),'');assert.equal(imageURL('assets/portfolio-review.jpg'),'assets/portfolio-review.jpg');assert.ok(imageURL('https://example.org/a.jpg'));});
test('workbook key has the original key plus Ineligible and ten pathways',()=>{assert.equal(STATUSES.length,10);assert.equal(AREAS.length,10);assert.equal(STATUSES.find(s=>s.id==='needs-immediate-action').color,'#C00000');assert.equal(AREAS.find(a=>a.id==='interactive').color,'#385724');assert.equal(validateProfile({...base,areas:[]}), 'Please select at least one program area.');});

test('staff are automatically ineligible and excluded from both email modes',()=>{for(const role of ['faculty','admin']){assert.equal(effectiveStatus('very-active',role),'ineligible');for(const mode of ['newsletter','board'])assert.equal(recipients([{...base,role}],mode).emails.length,0);}assert.equal(effectiveStatus('very-active','member'),'very-active');assert.equal(recipients([{...base,status:'ineligible'}],'board').emails.length,0);});

test('newsletters-only contacts stay out of board coordination',()=>{const p={...base,connection:'supporter'};assert.equal(recipients([p],'board').emails.length,0);assert.equal(recipients([p]).emails.length,1);assert.equal(validateProfile({...base,connection:'invented'}),'Please choose your connection to TAD.');});

test('explicit admin status overrides survive staff defaults and recipient filtering',()=>{for(const role of ['faculty','admin']){assert.equal(effectiveStatus('ready-for-contact',role,true),'ready-for-contact');assert.equal(recipients([{...base,role,statusOverride:true}]).emails.length,1);assert.equal(recipients([{...base,role,status:'ineligible',statusOverride:true}]).emails.length,0);}});

test('member activity sorts chronologically and exports missing activity honestly',()=>{
 const stamp=ms=>({toMillis:()=>ms,toDate:()=>new Date(ms)});
 const rows=[{id:'recent',lastAccessAt:stamp(2000),lastSelfUpdateAt:stamp(3000)},{id:'unknown'},{id:'old',lastAccessAt:stamp(1000)}];
 assert.deepEqual(sortContacts(rows,'lastAccessAt',-1).map(r=>r.id),['recent','old','unknown']);
 assert.deepEqual(sortContacts(rows,'lastSelfUpdateAt',-1).map(r=>r.id),['recent','unknown','old']);
 assert.match(csv(rows),/Last accessed \(UTC\)/);assert.match(csv(rows),/1970-01-01T00:00:03.000Z/);assert.match(csv(rows),/Not recorded/);
});
