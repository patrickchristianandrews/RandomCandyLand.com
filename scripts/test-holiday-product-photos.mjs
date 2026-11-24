/** Validate the generated exact-product photo cache and shared retry handler. */
import {readFile,stat} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';

const root='public/black-friday';
const cacheSource=await readFile(path.join(root,'product-photos-cache.js'),'utf8');
const resolverSource=await readFile(path.join(root,'product-photos.js'),'utf8');
const listeners=[];
class TestImage {constructor(){this.dataset={};this.src='';this.removed=false;this.replacement=null;}}
const win={};
const doc={
 addEventListener(type,fn,capture){if(type==='error'&&capture)listeners.push(fn)},
 createElement(){return {textContent:''}}
};
runInNewContext(cacheSource,{window:win},{timeout:1000});
runInNewContext(resolverSource,{window:win,document:doc,URL,HTMLImageElement:TestImage},{timeout:1000});
const cached=win.RCLCachedDealPhotos;
assert(cached&&typeof cached==='object','Missing product photo cache manifest');
let count=0;
for(const [id,url] of Object.entries(cached)){
 assert(/^\/black-friday\/product-images\/[a-z0-9_-]+\.(jpg|png|webp)$/i.test(url),'Invalid local image path for '+id);
 const target=path.join('public',url.replace(/^\//,''));
 const info=await stat(target);
 assert(info.size>=3000&&info.size<=3*1024*1024,'Invalid cached image size for '+id);
 const resolved=win.RCLProductPhotos.photoURLs({id,imageVerified:true,image:'https://example.com/a.jpg'});
 assert.equal(resolved[0],url,'Verified local photo must load before remote images');
 count++;
}
// Every curated product must ship with a real local image, not just pass an empty cache.
const catalog=await readFile(path.join(root,'all/index.html'),'utf8');
const rows=JSON.parse(catalog.match(/const deals=(\[\[.*?\]\])\.map/s)[1]);
for(const row of rows)assert(cached[row[0]],'Curated product photo missing: '+row[0]);
// Error recovery must try another exact photo before removing the failed one.
assert.equal(listeners.length,1,'Expected a single shared photo error handler');
const img=new TestImage();
img.dataset.photoSources=JSON.stringify(['https://example.com/one.jpg','https://example.com/two.jpg']);
img.matches=()=>true;
img.closest=(selector)=>selector==='.hot-art'?{}:null;
img.remove=()=>{img.removed=true};
const event={target:img,stopImmediatePropagation(){}};
listeners[0](event);
assert.equal(img.src,'https://example.com/two.jpg','Image retry did not switch sources');
assert(!img.removed,'An image was removed before its backup was attempted');
listeners[0](event);
assert(img.removed,'Exhausted source retries must show the existing fallback');
console.log('Holiday photos validated:',count,'site-hosted product images; exact-product retry handler passed.');

