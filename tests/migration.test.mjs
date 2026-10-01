import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const script=readFileSync('migration.js','utf8');
async function redirect(url,{ready=true,fail=false,invite=null}={}){
 const original=new URL(url);let result=null,calls=0;
 await runInNewContext(script,{URL,AbortSignal,location:{hostname:original.hostname,pathname:original.pathname,search:original.search,hash:original.hash,replace:value=>{result=value;}},sessionStorage:{getItem:()=>invite},fetch:async()=>{calls++;if(fail)throw Error('offline');return{ok:ready,json:async()=>({site:'tad-advisory-board',version:1})};}});
 return{result,calls};
}
test('home, pages, query strings and invitation fragments retain their destination',async()=>{
 for(const path of ['/','/account.html#invite=ABCDEFGHIJKLMNOPQRST','/albums.html?event=2026','/#members','/directory.html'])assert.equal((await redirect('https://bsutad.github.io/Advisory-Board'+path)).result,'https://tad-advisory.web.app'+path);
 assert.equal((await redirect('https://bsutad.github.io/Advisory-Board')).result,'https://tad-advisory.web.app/');
});
test('new host and other GitHub projects never redirect or probe readiness',async()=>{
 for(const url of ['https://tad-advisory.web.app/account.html','https://bsutad.github.io/Other/','https://bsutad.github.io/Advisory-Board-Other/'])assert.deepEqual(await redirect(url),{result:null,calls:0});
});
test('old site remains usable until new host is ready and if unavailable',async()=>{
 for(const options of [{ready:false},{fail:true}])assert.equal((await redirect('https://bsutad.github.io/Advisory-Board/',options)).result,null);
});
test('pending invitation survives domain move and does not replace explicit fragments',async()=>{
 const invite='ABCDEFGHIJKLMNOPQRST';assert.equal((await redirect('https://bsutad.github.io/Advisory-Board/account.html',{invite})).result,'https://tad-advisory.web.app/account.html#invite='+invite);
 assert.equal((await redirect('https://bsutad.github.io/Advisory-Board/account.html#other',{invite})).result,'https://tad-advisory.web.app/account.html#other');
});

test('Firebase aliases preserve paths, queries, fragments and pending invitations',async()=>{
 for(const host of ['tad-advisory-board.web.app','tad-advisory-board.firebaseapp.com','tad-advisory.firebaseapp.com']){
  const path='/account.html?source=invite#invite=ABCDEFGHIJKLMNOPQRST';
  assert.equal((await redirect('https://'+host+path)).result,'https://tad-advisory.web.app'+path);
  assert.equal((await redirect('https://'+host+'/account.html',{invite:'ABCDEFGHIJKLMNOPQRST'})).result,'https://tad-advisory.web.app/account.html#invite=ABCDEFGHIJKLMNOPQRST');
  assert.deepEqual(await redirect('https://'+host+'/__/auth/action?mode=verifyEmail'),{result:null,calls:0});
 }
});
