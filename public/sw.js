/* A single network-first offline shell for the site's separately installed PWAs.
 * Do not cache API responses, media, uploads, or cross-origin resources.
 * Never delete caches belonging to WebLLM, models, or other browser runtimes.
 */
const CACHE='random-candy-land-public-v15-pixel-play-3';
const SHELL=['/','/index.html','/manifest.json','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('random-candy-land-public-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin || url.pathname.startsWith('/api/'))return;
  const allowed=req.mode==='navigate'||['script','style','image','font','manifest'].includes(req.destination)
    || url.pathname.endsWith('.webmanifest');
  if(!allowed)return;
  // Bypass HTTP caches for HTML/CSS/JS so installed PWAs don't keep old goo and navigation.
  const fresh=(req.mode==='navigate'||['script','style'].includes(req.destination))
    ?new Request(req,{cache:'no-store'}):req;
  event.respondWith(fetch(fresh).then(resp=>{
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

/* iOS and Android installed app Web Push. A visible notification is always
 * displayed; Apple disables silent web pushes. No arbitrary external links.
 */
const GAME_PUSH_PATHS=new Set(['/','/the-corridors/','/the-docket/','/osint-academy/','/trumpagotchi-fm1/','/trump/']);
self.addEventListener('push',event=>{
 let data={title:'Random Candy Land',body:'Your next adventure is waiting.',url:'/',tag:'rcl-game-reminder'};
 try{const incoming=event.data?.json();if(incoming&&typeof incoming==='object')data={...data,...incoming}}catch{}
 const title=String(data.title||'Random Candy Land').slice(0,90);
 const body=String(data.body||'Your next adventure is waiting.').slice(0,160);
 const url=GAME_PUSH_PATHS.has(data.url)?data.url:'/';
 const tag=String(data.tag||'rcl-game-reminder').slice(0,60);
 event.waitUntil(self.registration.showNotification(title,{
  body,icon:'/icon-192.png',badge:'/icon-192.png',tag,
  renotify:false,data:{url},timestamp:Date.now()
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const path=GAME_PUSH_PATHS.has(event.notification.data?.url)?event.notification.data.url:'/';
 event.waitUntil((async()=>{
  const destination=new URL(path,self.location.origin).href;
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   try{
    const open=new URL(client.url);
    if(open.origin===self.location.origin&&open.pathname===path){
     await client.focus();return;
    }
   }catch{}
  }
  if(self.clients.openWindow)await self.clients.openWindow(destination);
 })());
});
