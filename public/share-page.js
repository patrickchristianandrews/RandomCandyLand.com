/* Random Candy Land: share public pages, not personal progress or private invitations. */
(()=>{'use strict';
const ID='rcl-share-page';
const sections=new Set(['home','atlas','quiz','psych-quiz','psych','ideas','chat','howto','guide','notebook']);
function cleanURL(){
 const url=new URL(location.pathname,location.origin);
 // Only include well-known public sections. No query strings, game-room codes,
 // report links, personal answers, bookmarks or private hash payloads.
 if(/^\/after-dark(?:\/|\/index\.html)?$/i.test(url.pathname)){
  const tab=document.querySelector('.tab.visible')?.id;
  if(tab&&sections.has(tab))url.hash=tab;
  else if(sections.has(location.hash.slice(1)))url.hash=location.hash.slice(1);
 }
 return url.href;
}
function dialog(url){
 let shade=document.getElementById('rcl-share-fallback');
 if(!shade){
  shade=document.createElement('div');shade.id='rcl-share-fallback';shade.className='rcl-share-overlay';
  const panel=document.createElement('div');panel.className='rcl-share-dialog';
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-label','Share page link');
  const heading=document.createElement('h2');heading.textContent='Share this page';
  const note=document.createElement('p');note.textContent='This link opens the public page. Private quiz answers and saved progress are not included.';
  const address=document.createElement('input');address.id='rcl-share-url';address.type='text';address.readOnly=true;address.setAttribute('aria-label','Shareable page link');
  const actions=document.createElement('div');actions.className='rcl-share-actions';
  const copy=document.createElement('button');copy.type='button';copy.textContent='Copy link';copy.id='rcl-share-copy';
  copy.addEventListener('click',async()=>{
   try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(address.value);copy.textContent='Copied!'}
   catch{address.focus();address.select();try{if(document.execCommand?.('copy')){copy.textContent='Copied!';return}}catch{}copy.textContent='Copy the selected link';}
  });
  const close=document.createElement('button');close.type='button';close.textContent='Close';
  close.addEventListener('click',()=>{shade.hidden=true});
  actions.append(copy,close);panel.append(heading,note,address,actions);shade.append(panel);document.body.append(shade);
  shade.addEventListener('click',event=>{if(event.target===shade)shade.hidden=true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!shade.hidden)shade.hidden=true});
 }
 document.getElementById('rcl-share-url').value=url;
 document.getElementById('rcl-share-copy').textContent='Copy link';
 shade.hidden=false;
 document.getElementById('rcl-share-url').focus();
 document.getElementById('rcl-share-url').select();
}
async function share(){
 const url=cleanURL();
 if(typeof navigator.share==='function'){
  try{await navigator.share({title:document.title||'Random Candy Land',url});return}
  catch(e){if(e?.name==='AbortError')return}
 }
 dialog(url);
}
function makeButton(inToolbar=false){
 const button=document.createElement('button');button.type='button';button.id=ID;
 button.className=inToolbar?'od-bookmark-button rcl-share-button':'rcl-share-button';
 button.textContent='↗ Share Page';button.setAttribute('aria-label','Share this page');
 button.addEventListener('click',share);return button;
}
function install(){
 if(document.getElementById(ID))return;
 if(/^\/after-dark(?:\/|\/index\.html)?$/i.test(location.pathname)){
  // Its permanent "Your Place" toolbar owns the button; wait for that toolbar.
  const bar=document.getElementById('od-bookmark-bar');
  if(bar){const menu=document.getElementById('od-bookmark-menu');const btn=makeButton(true);if(menu)bar.insertBefore(btn,menu);else bar.append(btn);}
  return;
 }
 const strip=document.createElement('div');strip.className='rcl-share-strip';strip.setAttribute('role','region');strip.setAttribute('aria-label','Page sharing');
 strip.append(makeButton());const head=document.querySelector('.candyland-navbar,header.candyland-game-site-header,header.top,header.site-header,header.header,header');
 if(head?.parentElement)head.insertAdjacentElement('afterend',strip);
 else (document.querySelector('main')||document.body).prepend(strip);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.RandomCandyLandShare=Object.freeze({share,cleanURL,install,makeButton});
})();
