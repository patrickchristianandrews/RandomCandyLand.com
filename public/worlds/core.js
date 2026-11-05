/* Shared local-only helpers for three fictional simulations. */
(function(){
'use strict';
const clamp=(n,lo=0,hi=100)=>Math.max(lo,Math.min(hi,Number(n)||0));
const escape=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=(x)=>JSON.parse(JSON.stringify(x));
const load=(key,defaults)=>{
  try {
    const stored=JSON.parse(localStorage.getItem(key)||'null');
    return stored&&typeof stored==='object'&&!Array.isArray(stored)?Object.assign(copy(defaults),stored):copy(defaults);
  }catch{return copy(defaults);}
};
const save=(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch{return false}};
const stat=(title,value,unit='',max=100)=>{
  const n=Number(value)||0,pct=clamp(max===0?0:n/max*100);
  return '<div class="stat"><small>'+escape(title)+'</small><strong>'+escape(n)+escape(unit)+'</strong><div class="meter"><i style="width:'+pct+'%"></i></div></div>';
};
const journal=(items,label='Decision journal')=>{
  if(!items||!items.length)return '<p class="empty">Your decisions will appear here as the world changes.</p>';
  return '<ol class="log" aria-label="'+escape(label)+'">'+items.slice().reverse().slice(0,22).map(item=>'<li><time>'+escape(item.when||'EVENT')+'</time>'+escape(item.text||'')+'</li>').join('')+'</ol>';
};
const download=(filename,content)=>{
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const toast=(msg)=>{
  document.querySelector('.toast')?.remove();
  const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=msg;document.body.append(el);
  setTimeout(()=>el.remove(),2500);
};
const chronicle=(origin,text)=>{
  try{
    const arr=JSON.parse(localStorage.getItem('meridian-universe-v1')||'[]');
    const entries=Array.isArray(arr)?arr:[];
    entries.push({origin,text,date:new Date().toISOString().slice(0,10)});
    localStorage.setItem('meridian-universe-v1',JSON.stringify(entries.slice(-60)));
  }catch{}
};
const shared=(skip)=>{
  try{
    const entries=JSON.parse(localStorage.getItem('meridian-universe-v1')||'[]');
    return (Array.isArray(entries)?entries:[]).filter(x=>x.origin!==skip).slice(-4).reverse();
  }catch{return[]}
};
const cross=(skip)=>{
  const entries=shared(skip);
  if(!entries.length)return '<p class="note">Other game stories are stored privately on this device.</p>';
  return '<ul class="log">'+entries.map(x=>'<li><time>'+escape(x.origin)+' · '+escape(x.date)+'</time>'+escape(x.text)+'</li>').join('')+'</ul>';
};
const reset=(key,label)=>{if(confirm('Reset '+label+' progress on this device? This cannot be undone.')){localStorage.removeItem(key);location.reload()}};
window.WorldKit={clamp,escape,copy,load,save,stat,journal,download,toast,chronicle,cross,reset};
})();