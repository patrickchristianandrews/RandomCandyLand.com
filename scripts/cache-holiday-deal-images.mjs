/**
 * Best-effort image cache for the holiday catalog.
 * Only already identified exact-product images, or product-page metadata that
 * matches the retailer's product, are accepted. The build remains usable if
 * image providers block automated downloads.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root='public/black-friday';
const imageDir=path.join(root,'product-images');
const manifestPath=path.join(root,'product-photos-cache.js');
// Keep the work bounded, but allow new live-feed listings to be reached.
const budgetEnds=Date.now()+125000;
const maxBytes=3*1024*1024;
const read=async name=>readFile(name,'utf8').catch(()=>null);
const html=await read(path.join(root,'all/index.html'))||'';
const source=await read(path.join(root,'product-photos.js'))||'';
// A GitHub Actions cache restores this locally validated manifest and its files
// from the last deployment. Never replace it with an empty fresh-run manifest.
const priorManifest=await read(manifestPath)||'';
const feed=JSON.parse(await read(path.join(root,'live-feed.json'))||'{"deals":[]}');
const curatedMatch=html.match(/const deals=(\[\[.*?\]\])\.map\(/s);
const fields=['id','name','category','store','price','reference','spec','source','sourceType','checked','why','catch','featured'];
const curated=curatedMatch?JSON.parse(curatedMatch[1]).map(row=>Object.fromEntries(fields.map((key,i)=>[key,row[i]]))):[];
const windowObj={};
const context={window:windowObj,document:{addEventListener(){}},URL};
if(priorManifest)try{runInNewContext(priorManifest,context,{timeout:1000})}catch{console.warn('Ignoring invalid prior product photo manifest');}
const pinned=JSON.parse(await read(path.join(root,'product-photo-seeds.json'))||'{"photos":{}}').photos;
const priorPhotos=windowObj.RCLCachedDealPhotos&&typeof windowObj.RCLCachedDealPhotos==='object'?windowObj.RCLCachedDealPhotos:{};
runInNewContext(source,context,{timeout:1000});
const photos=windowObj.RCLProductPhotos;
const upcoming=JSON.parse(await read(path.join(root,'upcoming-deals.json'))||'{"deals":[]}');
const incoming=Array.isArray(feed.deals)?feed.deals:[];
const all=[...curated,...incoming,...(Array.isArray(upcoming.deals)?upcoming.deals.filter(d=>directProductUrl(d?.source)):[])];
const seen=new Set();
const tasks=all.filter(d=>d&&typeof d.id==='string'&&!seen.has(d.id)&&seen.add(d.id));
const cached={};
let index=0,attempted=0,usedSource=0,discovered=0,reused=0;

function safeRemote(raw){
 try{
  const url=new URL(String(raw));
  const h=url.hostname.toLowerCase();
  if(url.protocol!=='https:'||!h.includes('.')||h==='localhost'||h.endsWith('.localhost')||h.endsWith('.internal')||h.endsWith('.local')||/^(?:127|10|0|169\.254|192\.168)\./.test(h)||/^\d+\.\d+\.\d+\.\d+$/.test(h))return null;
  return url;
 }catch{return null;}
}
async function remote(url,accept='image/avif,image/webp,image/png,image/jpeg,*/*',timeout=4800){
 let current=safeRemote(url);
 for(let step=0;step<4&&current&&Date.now()<budgetEnds;step++){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
   const response=await fetch(current,{redirect:'manual',signal:ctrl.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; RandomCandyLandDealPhotos/1.0; +https://randomcandyland.com/)','Accept':accept}});
   if(response.status>=300&&response.status<400){
    const target=response.headers.get('location');
    current=target?safeRemote(new URL(target,current).href):null;
    continue;
   }
   if(!response.ok)return null;
   return response;
  }catch{return null}
  finally{clearTimeout(timer);}
 }
 return null;
}
async function imageBytes(url){
 const res=await remote(url);
 if(!res)return null;
 const contentType=String(res.headers.get('content-type')||'').toLowerCase();
 if(!/^image\/(?:jpeg|png|webp|jpg)\b/.test(contentType))return null;
 if(Number(res.headers.get('content-length'))>maxBytes)return null;
 const reader=res.body?.getReader();if(!reader)return null;
 const chunks=[];let total=0;
 while(true){
  let chunk,timer;
  try{
   chunk=await Promise.race([
    reader.read(),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Image download timed out')),4200);})
   ]);
  }catch{void reader.cancel().catch(()=>{});return null;}
  finally{clearTimeout(timer);}
  const {value,done}=chunk;
  if(done)break;
  total+=value.byteLength;
  if(total>maxBytes){void reader.cancel().catch(()=>{});return null;}
  chunks.push(value);
 }
 if(total<3000)return null;
 const bytes=Buffer.concat(chunks.map(c=>Buffer.from(c)),total);
 const jpg=bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 return jpg?{bytes,ext:'jpg'}:png?{bytes,ext:'png'}:webp?{bytes,ext:'webp'}:null;
}
function decode(s){
 return String(s||'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
}
function normalize(s){return String(s||'').toLowerCase().replace(/&amp;/g,'&').match(/[a-z0-9]+/g)||[]}
function titleAgrees(deal,title,page){
 const avoid=new Set(['with','and','the','new','2026','product','black','friday','sale','deal','inch','wireless','kit','set']);
 const words=normalize(deal.name).filter(w=>w.length>=4&&!avoid.has(w));
 const titleWords=new Set(normalize(title));
 const overlap=words.filter(w=>titleWords.has(w)).length;
 const first=String(deal.spec||'').split('·')[0];
 const model=(first.match(/\b(?=[A-Z0-9-]*\d)[A-Z0-9]{2,}(?:-[A-Z0-9]{2,})+\b|\b[A-Z]{2,}\d[A-Z0-9-]{2,}\b/i)||[])[0];
 if(model&&!page.toLowerCase().includes(model.toLowerCase()))return false;
 return overlap>=Math.min(3,words.length)&&overlap>=2;
}
function directProductUrl(value){
 const url=safeRemote(value);if(!url)return false;
 const h=url.hostname.replace(/^www\./,'');
 if(h==='walmart.com')return /^\/ip\/(?:[^/]+\/)?\d+/.test(url.pathname);
 if(h==='uncommongoods.com')return /^\/product\/[^/]+/.test(url.pathname);
 if(h==='target.com')return /^\/p\/.+\/A-\d+/.test(url.pathname);
 if(h==='bestbuy.com')return /^\/product\/.+|^\/site\/.+\/\d+\.p$/.test(url.pathname);
 if(h==='amazon.com')return /\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:\/|$)/i.test(url.pathname);
 if(h==='costco.com')return /\/p\/.+|\.product\.\d+\.html$/.test(url.pathname);
 if(h==='newegg.com')return /\/p\/[A-Z0-9-]+/i.test(url.pathname);
 if(h==='lowes.com')return /^\/pd\/.+\/\d+/.test(url.pathname);
 if(h==='staples.com')return /\/product_\d+/.test(url.pathname);
 if(h==='homedepot.com')return /^\/p\/(?:[^/]+\/)?\d+/.test(url.pathname);
 if(h==='epson.com')return /\/p\/[A-Za-z0-9-]+/.test(url.pathname);
 if(h==='jbl.com')return /\.html$/.test(url.pathname);
 if(h==='abt.com')return /\/p\/\d+\.html/.test(url.pathname);
 if(h==='hexclad.com')return /\/products\//.test(url.pathname);
 return false;
}
async function fromRetailerPage(deal){
 if(!directProductUrl(deal.source))return null;
 const response=await remote(deal.source,'text/html,application/xhtml+xml',4800);
 if(!response||!String(response.headers.get('content-type')||'').includes('text/html'))return null;
 if(Number(response.headers.get('content-length'))>2*1024*1024)return null;
 const page=(await response.text()).slice(0,2*1024*1024);
 const metas={};
 for(const hit of page.matchAll(/<meta\b[^>]*>/gi)){
  const attrs={};
  for(const p of hit[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))attrs[p[1].toLowerCase()]=decode(p[2]??p[3]);
  const key=attrs.property||attrs.name;
  if(key&&attrs.content)metas[key.toLowerCase()]=attrs.content;
 }
 const title=metas['og:title']||decode(page.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 const photo=metas['og:image:secure_url']||metas['og:image'];
 if(!titleAgrees(deal,title,page))return null;
 const target=photo?new URL(photo,deal.source).href:null;
 if(target&&safeRemote(target)&&!genericPhoto(target)){discovered++;return target;}
 return null;
}
function genericPhoto(url){
 try{return /(?:logo|banner|sprite|avatar|placeholder|default[-_]?image|tracking|pixel|social[-_]?share|favicon|advert)/i.test(new URL(url).pathname)}catch{return true}
}
const publisherHosts=new Set(['dealnews.com','slickdeals.net','techbargains.com','bensbargains.net','bensbargains.com','9to5toys.com','hip2save.com','allthingstarget.com','southernsavers.com','retailmenot.com','moneysavingmom.com','totallytarget.com','commonsensewithmoney.com','freestufffinder.com','thekrazycouponlady.com','passionforsavings.com','thefreebieguy.com']);
function productWords(value){
 const stop=new Set(['black','friday','cyber','monday','deal','deals','sale','save','off','coupon','discount','today','only','shipping','shipped','free','with','from','this','that','price','product','image','photo','amazon','walmart','target','best','buy','2026','2025','lowest','holiday','select','your','just','original','regular','limited']);
 return [...new Set(normalize(value).filter(w=>w.length>=3&&!stop.has(w)&&!/^\d+$/.test(w)))];
}
function imageNamesProduct(deal,label){
 const words=productWords(deal.name), candidate=new Set(productWords(label));
 const models=words.filter(w=>/[a-z]/.test(w)&&/\d/.test(w));
 if(models.length&&!models.some(w=>candidate.has(w)))return false;
 const hits=words.filter(w=>candidate.has(w)).length;
 return hits>=2&&hits>=Math.ceil(Math.min(words.length,6)*.5);
}
function readAttrs(tag){
 const out={};
 for(const p of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))out[p[1].toLowerCase()]=decode(p[2]??p[3]);
 return out;
}
async function fromPublisherPage(deal){
 const url=safeRemote(deal.source);if(!url)return [];
 const host=url.hostname.toLowerCase();
 if(![...publisherHosts].some(h=>host===h||host.endsWith('.'+h)))return [];
 const response=await remote(url.href,'text/html,application/xhtml+xml',4000);
 if(!response||!String(response.headers.get('content-type')||'').includes('text/html'))return [];
 const reader=response.body?.getReader();if(!reader)return [];
 const chunks=[];let total=0;const deadline=Date.now()+5000;
 try{
  while(total<1500000&&Date.now()<deadline&&Date.now()<budgetEnds){
   let timer;let chunk;
   try{chunk=await Promise.race([reader.read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Page read timeout')),Math.max(1,deadline-Date.now()))})]);}finally{clearTimeout(timer);}
   if(chunk.done)break;
   chunks.push(Buffer.from(chunk.value));total+=chunk.value.byteLength;
  }
 }catch{}finally{void reader.cancel().catch(()=>{});}
 const page=Buffer.concat(chunks).toString('utf8').slice(0,1500000);
 const meta={};
 for(const hit of page.matchAll(/<meta\b[^>]*>/gi)){const a=readAttrs(hit[0]);if(a.property||a.name)meta[(a.property||a.name).toLowerCase()]=a.content||'';}
 const title=meta['og:title']||decode(page.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');
 if(!imageNamesProduct(deal,title))return [];
 const results=[];
 const add=(raw,label)=>{
  if(!raw)return;
  try{const target=new URL(raw,url).href;
   const filename=decodeURIComponent(new URL(target).pathname);
   if(!safeRemote(target)||genericPhoto(target)||/\.(svg|gif)$/i.test(filename))return;
   if(!imageNamesProduct(deal,label||'')&&!imageNamesProduct(deal,filename))return;
   if(!results.includes(target))results.push(target);
  }catch{}
 };
 add(meta['og:image:secure_url']||meta['og:image'],meta['og:image:alt']);
 add(meta['twitter:image'],meta['twitter:image:alt']);
 for(const m of page.matchAll(/<img\b[^>]*>/gi)){
  const a=readAttrs(m[0]);
  const label=[a.alt,a.title].filter(Boolean).join(' ');
  for(const raw of [a['data-src'],a['data-lazy-src'],a.src])add(raw,label);
  if(results.length>=6)break;
 }
 if(results.length)discovered++;
 return results.slice(0,4);
}
await mkdir(imageDir,{recursive:true});
// Only accept the exact cached file previously saved for this listing, and
// verify its image header before publishing a URL. Never trust stale manifests.
async function validLocalPhoto(raw){
 const match=typeof raw==='string'&&raw.match(/^\/black-friday\/product-images\/([a-z0-9_-]+)\.(jpg|png|webp)$/i);
 if(!match)return false;
 try{
  const bytes=await readFile(path.join(imageDir,match[1]+'.'+match[2]));
  if(bytes.length<3000||bytes.length>maxBytes)return false;
  const jpeg=bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  return (match[2]==='jpg'&&jpeg)||(match[2]==='png'&&png)||(match[2]==='webp'&&webp);
 }catch{return false;}
}
// Restore every valid image before the timed network pass, including entries
// that sit beyond the download budget. An hourly refresh must never erase them.
for(const deal of tasks){
 const local=pinned?.[deal.id]||priorPhotos[deal.id];
 if(pinned?.[deal.id]&&!await validLocalPhoto(local))throw Error('Missing pinned product photo: '+deal.id);
 if(await validLocalPhoto(local)){cached[deal.id]=local;reused++;}
}
const pending=tasks.filter(deal=>!cached[deal.id]).sort((a,b)=>
 Number(Boolean(b.imageVerified||directProductUrl(b.source)))-Number(Boolean(a.imageVerified||directProductUrl(a.source)))||
 Number(Boolean(b.featured||b.popular))-Number(Boolean(a.featured||a.popular))||
 (b.publishedAt||b.checked||'').localeCompare(a.publishedAt||a.checked||''));
async function processDeal(deal){
 if(Date.now()>=budgetEnds)return;
 let candidates=(photos?.photoURLs(deal)||[]).filter(x=>/^https:\/\//i.test(x));
 // Only try a retailer-provided photo for a product-specific listing.
 if(!candidates.length&&directProductUrl(deal.source)){
  const productImage=await fromRetailerPage(deal).catch(()=>null);
  if(productImage)candidates=[productImage];
 }
 const id=deal.id.replace(/[^a-z0-9_-]/gi,'_').slice(0,70);
 const tried=new Set();
 async function save(list){
 for(const url of list.slice(0,4)){
  if(tried.has(url))continue;
  tried.add(url);
  if(Date.now()>=budgetEnds)break;
  attempted++;
  const image=await imageBytes(url).catch(()=>null);
  if(!image)continue;
  const filename=id+'.'+image.ext;
  await writeFile(path.join(imageDir,filename),image.bytes);
  cached[deal.id]='/black-friday/product-images/'+filename;
  usedSource++;
  return true;
 }
 return false;
 }
 if(await save(candidates))return;
 if(Date.now()<budgetEnds)await save(await fromPublisherPage(deal).catch(()=>[]));
}
// Prioritize verified candidates and recent hot listings, then discover photos for the rest.
const workers=Array.from({length:16},async()=>{
 while(index<pending.length&&Date.now()<budgetEnds){
  const deal=pending[index++];
  try{await processDeal(deal)}catch(e){console.warn('Photo cache skip:',deal.id,String(e.message||e).slice(0,80));}
 }
});
await Promise.all(workers);
const manifest='/* Generated product-specific images cached on the site. */\nwindow.RCLCachedDealPhotos=Object.freeze('+JSON.stringify(cached)+');\n';
await writeFile(manifestPath,manifest);
// The old permanently pinned query string made browsers retain a stale manifest.
// Version each generated page by the actual manifest bytes, not the day.
const version=createHash('sha256').update(manifest).digest('hex').slice(0,16);
for(const pagePath of [path.join(root,'index.html'),path.join(root,'all/index.html')]){
 const page=await readFile(pagePath,'utf8');
 const updated=page.replace(/(\/black-friday\/product-photos-cache\.js)(?:\?[^"']*)?(?=["'])/g,'$1?v='+version);
 if(!updated.includes('/black-friday/product-photos-cache.js?v='+version))throw Error('Photo manifest script missing from '+pagePath);
 if(updated!==page)await writeFile(pagePath,updated);
}
console.log('Holiday product images:',Object.keys(cached).length,'validated local photos for',tasks.length,'eligible listings ('+reused+' reused, '+usedSource+' downloaded);',attempted,'remote requests;',discovered,'new retailer photo candidates. Missing or unverifiable product images keep the honest fallback.');

