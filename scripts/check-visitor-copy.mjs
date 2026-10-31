/* Keep the visitor-facing Random Candy Land experience free of provider branding.
 * This checks public assets and client-side source. Server-only implementation
 * identifiers are not visitor copy and are intentionally not rewritten. */
import fs from 'node:fs';
import path from 'node:path';
const roots=['public','src','index.html'];
const formats=/\.(html|js|jsx|ts|tsx|css|svg|json|webmanifest)$/i;
const branded=/\bAI\b|\b(?:OpenAI|ChatGPT|Claude|Gemini)\b|\bartificial[ -]+intelligence\b|\b(?:GPT-[0-9]|LLM)\b/g;
const exceptions=[];
let files=0;const found=[];
function scan(file){
 if(!formats.test(file))return;
 const content=fs.readFileSync(file,'utf8');
 const matches=[...content.matchAll(branded)];
 files++;
 for(const match of matches){
  if(exceptions.includes(file))continue;
  const line=content.slice(0,match.index).split('\n').length;
  found.push(file+':'+line+' — '+match[0]);
 }
}
function visit(root){
 if(!fs.existsSync(root))return;
 const info=fs.statSync(root);
 if(info.isFile()){scan(root);return}
 for(const name of fs.readdirSync(root)){
  const file=path.join(root,name);
  const st=fs.statSync(file);
  if(st.isDirectory())visit(file);
  else if(st.isFile())scan(file);
 }
}
roots.forEach(visit);
if(found.length){console.error('Visitor-facing branding references found:\n'+found.join('\n'));process.exitCode=1}
else console.log('Visitor copy check passed across '+files+' files.');
