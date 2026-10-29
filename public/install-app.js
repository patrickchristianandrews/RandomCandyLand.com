/* Accessible, device-specific PWA install entrypoint for every current attraction.
 * Each attraction has a distinct Web App Manifest id and scoped start URL.
 * No tracking, permissions or automatic prompts on page load.
 */
(() => {
  'use strict';
  const apps = [{"id":"tiny-pet","path":"/trumpagotchi-fm1/","title":"Trumpagotchi Tiny Pet","short":"Tiny Pet"},{"id":"pocket-pet","path":"/trump/","title":"Donald’s Pocket Pet","short":"Pocket Pet"},{"id":"goo-rush","path":"/goo-rush/","title":"Goo Rush Candy Arcade","short":"Goo Rush"},{"id":"candy-simon","path":"/candy-simon/","title":"Candy Simon Says","short":"Candy Simon"},{"id":"candy-match","path":"/candy-match/","title":"Candy Match","short":"Candy Match"},{"id":"candy-pulse","path":"/music-visualizer/","title":"Candy Pulse Music Visualizer","short":"Candy Pulse"},{"id":"after-dark","path":"/after-dark/","title":"After Dark Curiosity Atlas","short":"After Dark"},{"id":"clue-compass","path":"/after-dark/psychology-lab/","title":"Clue Compass Psychology Lab","short":"Clue Compass"}];
  const current = () => apps.find(app => location.pathname === app.path.slice(0,-1)
    || location.pathname.startsWith(app.path)) || {id:'site',path:'/',title:'Random Candy Land',short:'Candy Land'};
  const app=current();
  const manifest=document.querySelector('link[rel="manifest"]')||document.createElement('link');
  manifest.rel='manifest';
  manifest.href=app.id==='site'?'/manifest.json':'/app-manifests/'+app.id+'.webmanifest';
  if(!manifest.parentElement)document.head.append(manifest);
  let apple=document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if(!apple){apple=document.createElement('meta');apple.name='apple-mobile-web-app-title';document.head.append(apple);}
  apple.content=app.short;
  if(navigator.serviceWorker && location.protocol==='https:') {
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}),{once:true});
  }
  let pending=null;
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    pending=event;
  });
  function isInstalled(){return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;}
  function dialog(){
    const overlay=document.createElement('div');
    overlay.className='rcl-install-overlay';
    overlay.setAttribute('role','presentation');
    overlay.style.cssText='position:fixed;inset:0;background:#050314d9;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:18px';
    const box=document.createElement('section');
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label','Install '+app.title);
    box.style.cssText='background:#24143e;color:#fff;border:2px solid #ffa9db;border-radius:22px;max-width:390px;width:100%;padding:22px 20px;box-shadow:0 18px 50px #000c;font:14px/1.6 system-ui,sans-serif';
    const heading=document.createElement('h2');heading.textContent='📲 Install '+app.title;heading.style.cssText='font:bold 20px/1.2 system-ui;margin:0 0 12px;color:#ffdc91';
    const desc=document.createElement('div');desc.style.cssText='font:14px/1.65 system-ui';
    const isiOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
    desc.textContent=isiOS?
      'On iPhone: open this page in Safari, tap Share (the square with an arrow), choose Add to Home Screen, turn on Open as Web App if offered, and tap Add. This creates a separate home-screen app for '+app.title+'.':
      'On Android: open this page in Chrome, tap the ⋮ menu and choose Install app or Add to Home screen. Confirm to add '+app.title+' to your phone.';
    const note=document.createElement('p');
    note.textContent='Each attraction can be installed separately. This is a web app, not an App Store or Google Play download; internet may be needed for features or content that have not been loaded before.';
    note.style.cssText='opacity:.82;font-size:12px;margin:12px 0';
    const done=document.createElement('button');done.type='button';done.textContent='GOT IT';done.style.cssText='background:#ffe1a8;color:#211136;border-radius:12px;padding:12px 20px;font-weight:900;border:0;min-height:44px;width:100%;cursor:pointer';
    done.onclick=()=>overlay.remove();
    box.append(heading,desc,note,done);overlay.append(box);
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
    document.body.append(overlay);done.focus();
  }
  async function install(){
    if(isInstalled()){dialog();return;}
    if(pending){
      const prompt=pending;pending=null;
      try{await prompt.prompt();await prompt.userChoice;return;}catch(e){}
    }
    dialog();
  }
  function mount(){
    if(document.getElementById('rcl-install-app'))return;
    const button=document.createElement('button');
    button.id='rcl-install-app';button.type='button';
    button.textContent='📲 Install '+app.short;
    button.setAttribute('aria-label','Install '+app.title+' on Android or iPhone');
    button.style.cssText='cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:38px;padding:7px 12px;margin:4px;border:1px solid #ffe3aa;border-radius:20px;background:#3d215c;color:#fff6d0;font:800 12px system-ui,sans-serif;white-space:nowrap;position:relative;z-index:10;box-shadow:0 2px 8px #0004';
    button.addEventListener('click',install);
    // Top-of-page, accessible button avoids a fixed overlay over the game.
    const target=document.querySelector('.candyland-navbar nav,header.topbar,header.top nav,header nav,nav.top,header,body');
    target.append(button);
    const params=new URLSearchParams(location.search);
    if(params.get('install')==='1'){
      // Explicitly requested by a user following an installation link.
      dialog();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
