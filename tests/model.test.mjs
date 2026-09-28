import test from 'node:test';import assert from 'node:assert/strict';
import {recipients,filterContacts,sortContacts,imageURL,csv,validateProfile} from '../src/model.js';
import {AREAS,STATUSES} from '../src/key.js';
const base={firstName:'A',lastName:'Person',email:'a@example.org',altEmail:'',areas:['graphic','illustration-animation'],newsletterOptIn:true,status:'very-active'};
test('newsletter recipients respect consent, holds/removals, validation and duplicates',()=>{
 const result=recipients([base,{...base,email:'A@EXAMPLE.ORG'},{...base,email:'b@example.org',newsletterOptIn:false},{...base,email:'c@example.org',status:'on-hold'},{...base,email:'d@example.org',status:'removed'},{...base,email:'bad\nBcc:other@example.org'}]);assert.deepEqual(result.emails,['a@example.org']);assert.equal(result.excluded,4);
 assert.equal(recipients([base,{...base,email:'b@example.org',newsletterOptIn:false}],'board').emails.length,2);
});
test('multi-area any/all filters and sorting',()=>{const rows=[base,{...base,lastName:'Alpha',areas:['graphic']},{...base,lastName:'Zeta',areas:['exhibit']}];assert.equal(filterContacts(rows,{areas:['graphic','illustration-animation'],areaMode:'all'}).length,1);assert.equal(filterContacts(rows,{areas:['graphic','illustration-animation']}).length,2);assert.equal(filterContacts(rows,{search:'illustration'}).length,1);assert.equal(sortContacts(rows)[0].lastName,'Alpha');});
test('CSV escapes formula injection and quotes',()=>{const text=csv([{...base,company:'=HYPERLINK("bad")'}]);assert.ok(text.includes('"\'=HYPERLINK(""bad"")"'));});
test('image links reject script, data and filesystem URLs',()=>{for(const url of ['javascript:alert(1)','data:image/svg+xml,bad','http://x.com/a.jpg','//evil.com/img','assets/../key.json','https://secret:pass@x.com/img'])assert.equal(imageURL(url),'');assert.equal(imageURL('assets/portfolio-review.jpg'),'assets/portfolio-review.jpg');assert.ok(imageURL('https://example.org/a.jpg'));});
test('workbook key has all nine statuses and ten pathways',()=>{assert.equal(STATUSES.length,9);assert.equal(AREAS.length,10);assert.equal(STATUSES.find(s=>s.id==='needs-immediate-action').color,'#C00000');assert.equal(AREAS.find(a=>a.id==='interactive').color,'#385724');assert.equal(validateProfile({...base,areas:[]}), 'Please select at least one program area.');});
