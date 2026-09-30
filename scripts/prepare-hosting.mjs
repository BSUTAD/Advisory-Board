import {mkdir,copyFile,cp,writeFile,rm} from 'node:fs/promises';
// Publish only the website. Never include repository metadata, tests or private files.
await rm('hosting-dist',{recursive:true,force:true});
await mkdir('hosting-dist',{recursive:true});
for(const file of ['index.html','account.html','directory.html','albums.html','portal.js','portal.css','style.css','header-fit.js','portal-config.json','migration.js'])await copyFile(file,'hosting-dist/'+file);
await cp('assets','hosting-dist/assets',{recursive:true});
await writeFile('hosting-dist/migration-ready.json',JSON.stringify({site:'tad-advisory-board',version:1}));
console.log('Firebase Hosting files ready in hosting-dist');
