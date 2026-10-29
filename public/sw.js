/* A single network-first offline shell for the site's separately installed PWAs.
 * Do not cache API responses, media, uploads, or cross-origin resources.
 */
const CACHE='random-candy-land-public-v1';
const SHELL=['/','/index.html','/manifest.json','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin || url.pathname.startsWith('/api/'))return;
  const allowed=req.mode==='navigate'||['script','style','image','font','manifest'].includes(req.destination)
    || url.pathname.endsWith('.webmanifest');
  if(!allowed)return;
  event.respondWith(fetch(req).then(resp=>{
    if(resp.ok&&resp.type==='basic') {
      const response=resp.clone();
      event.waitUntil(caches.open(CACHE).then(c=>c.put(req,response)).catch(()=>{}));
    }
    return resp;
  }).catch(async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    if(req.mode==='navigate')return (await caches.match('/index.html'))||Response.error();
    return Response.error();
  }));
});
