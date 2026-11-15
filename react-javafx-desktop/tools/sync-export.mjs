import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const exported=path.join(root,'web','out');
const target=path.join(root,'desktop','src','main','resources','ui');
if(!fs.existsSync(path.join(exported,'index.html')))throw new Error('Build web/out first.');
const files=[];
function visit(dir,rel=''){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())throw new Error('Unexpected symbolic link in static export');
  const next=path.join(rel,entry.name);
  if(entry.isDirectory())visit(path.join(dir,entry.name),next);else if(entry.isFile())files.push(next.split(path.sep).join('/'));
 }
}
visit(exported);files.sort();
fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(target,{recursive:true});fs.cpSync(exported,target,{recursive:true});
fs.writeFileSync(path.join(root,'desktop','src','main','resources','ui-files.txt'),files.join('\n')+'\n');
console.log(`Bundled ${files.length} static files for the desktop runtime.`);
