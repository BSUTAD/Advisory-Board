import {build} from 'esbuild';
await import('./pages.mjs');
await build({entryPoints:['src/portal.js'],outfile:'portal.js',bundle:true,minify:true,format:'esm',target:['es2022'],legalComments:'none'});
