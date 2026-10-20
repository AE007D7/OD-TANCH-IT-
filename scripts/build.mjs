import {readFile,writeFile,readdir} from 'node:fs/promises';
const origin='https://od-etancheite.vercel.app';
for(const entry of await readdir('public'))if(/\.(html|xml|txt)$/.test(entry)){const path='public/'+entry;let s=await readFile(path,'utf8');s=s.replaceAll('https://od-etancheite-atelier.ae007d.chatgpt.site',origin);await writeFile(path,s)}
console.log('Static pages prepared for Vercel.');
