/* After Dark navigation: accessible mobile drawer and active-section feedback.
   Keeps native section navigation and existing page hash behavior intact. */
(() => {
 'use strict';
 const header=document.querySelector('.top.od-simple-site-header');
 const nav=header?.querySelector('.od-ribbon-nav');
 const toggle=document.getElementById('od-nav-toggle');
 if(!header||!nav||!toggle)return;
 const menus=[...nav.querySelectorAll('.od-ribbon-menu')];
 const mobile=()=>matchMedia('(max-width:760px)').matches;
 function setOpen(open) {
  nav.classList.toggle('is-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.querySelector('.od-nav-text').textContent=open?'Close menu':'Explore menu';
  if(!open)menus.forEach(menu=>menu.open=false);
 }
 header.classList.add('od-navigation-ready');
 setOpen(false);
 toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('is-open')));
 menus.forEach(menu=>menu.addEventListener('toggle',()=>{
  if(menu.open)menus.forEach(other=>{if(other!==menu)other.open=false});
  syncCurrent();
 }));
 function syncCurrent(){
  const tab=document.querySelector('.tab.visible')?.id||'home';
  for(const button of nav.querySelectorAll('[data-tab]')){
   const selected=button.dataset.tab===tab;
   button.classList.toggle('selected',selected);
   if(selected)button.setAttribute('aria-current','page');
   else button.removeAttribute('aria-current');
  }
  for(const menu of menus){
   const selected=!!menu.querySelector('[data-tab="'+tab+'"]');
   menu.classList.toggle('is-current',selected);
  }
 }
 nav.addEventListener('click',event=>{
  if(event.target.closest('button[data-tab]')){
   menus.forEach(menu=>menu.open=false);
   if(mobile())setOpen(false);
   requestAnimationFrame(syncCurrent);
  }
 });
 document.addEventListener('click',event=>{
  if(!header.contains(event.target)&&mobile()&&nav.classList.contains('is-open')){
   setOpen(false);
  }
 });
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  const openMenu=menus.find(menu=>menu.open);
  if(openMenu){openMenu.open=false;openMenu.querySelector('summary')?.focus();return}
  if(nav.classList.contains('is-open')){setOpen(false);toggle.focus()}
 });
 matchMedia('(max-width:760px)').addEventListener?.('change',()=>setOpen(false));
 const observer=new MutationObserver(syncCurrent);
 document.querySelectorAll('.tab').forEach(tab=>observer.observe(tab,{attributes:true,attributeFilter:['class']}));
 syncCurrent();
})();
