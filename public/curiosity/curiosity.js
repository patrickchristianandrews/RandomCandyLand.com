/* Wonder Index: original explainers and public research feed; no copied publisher text. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ideas=(window.WonderIndexIdeas||[]).map(x=>({id:x[0],category:x[1],title:x[2],hook:x[3],depth:x[4],example:x[5],try:x[6],source:x[7]}));
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(cls)el.className=cls;return el};
let category='all',search='',expanded=false,active=null,lastFetch=0;
function dateIndex(){const d=new Date();return Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000)%Math.max(1,ideas.length)}
function detail(item){
 const panel=make('article',undefined,'idea-details');panel.id='idea-reading';panel.tabIndex=-1;
 panel.append(make('span','THE WONDER INDEX · '+item.category.toUpperCase(),'eyebrow'),make('h3',item.title),make('p',item.hook));
 for(const [title,text] of [['The bigger idea',item.depth],['An everyday example',item.example],['Try thinking about it this way',item.try]])panel.append(make('h4',title),make('p',text));
 const link=make('a','Explore deeper reading and background ↗');link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';panel.append(link);
 const close=make('button','Close this idea','detail-close');close.type='button';close.onclick=()=>{active=null;render()};panel.append(close);return panel;
}
function render(){
 const match=ideas.filter(x=>(category==='all'||x.category===category)&&(!search||[x.title,x.hook,x.depth,x.example].join(' ').toLowerCase().includes(search))),list=expanded||search||category!=='all'?match:match.slice(0,12);
 const root=$('ideas-grid');if(!root)return;root.replaceChildren();
 for(const item of list){
  const card=make('article',undefined,'idea-card');card.dataset.idea=item.id;card.setAttribute('aria-expanded',String(active===item.id));
  card.append(make('span',item.category.toUpperCase()+' · SHORT READ','idea-tag'),make('h3',item.title),make('p',item.hook));
  const button=make('button','Read the idea ↗');button.type='button';button.dataset.readIdea=item.id;button.setAttribute('aria-expanded',String(active===item.id));card.append(button);root.append(card);
  if(item.id===active)root.append(detail(item));
 }
 if(!match.length)root.append(make('p','Nothing matched. Try a different keyword or topic.'));
 $('idea-results-count').textContent=match.length+' independent ideas to explore';
 const more=$('show-more-ideas');more.hidden=Boolean(search||category!=='all'||match.length<=12);more.textContent=expanded?'Show fewer ideas ↑':'See all '+ideas.length+' ideas ↓';
}
function read(id,scroll=true){if(!ideas.some(x=>x.id===id))return;active=active===id?null:id;render();if(active&&scroll){const p=$('idea-reading');p?.focus({preventScroll:true});p?.scrollIntoView({behavior:'smooth',block:'center'})}}
function reset(){category='all';search='';expanded=true;active=null;$('idea-search').value='';$('idea-categories').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.category==='all')))}
function research(data){
 const root=$('research-grid');if(!root)return;root.replaceChildren();const list=Array.isArray(data?.research)?data.research:[];
 if(!list.length){
  const empty=make('article',undefined,'research-card');empty.append(make('span','FEED STATUS','idea-tag'),make('h3','The public research feed is temporarily unavailable'),make('p','The original articles above remain available. The scheduled update retries the free academic index. No research headlines are invented.'));
  const link=make('a','Browse OpenAlex publications ↗');link.href='https://openalex.org/works';link.target='_blank';link.rel='noopener noreferrer';empty.append(link);root.append(empty);return;
 }
 for(const entry of list.slice(0,9)){
  try{const url=new URL(entry.url);if(url.protocol!=='https:')continue;
   const card=make('article',undefined,'research-card');card.append(make('span','INDEXED '+entry.published,'idea-tag'),make('h3',String(entry.title||'Untitled').slice(0,210)),make('p',String(entry.source||'Scholarly source').slice(0,120),'research-meta'));
   const link=make('a','Open publication / research record ↗');link.href=url.href;link.rel='noopener noreferrer';link.target='_blank';card.append(link);root.append(card);
  }catch{}
 }
}
async function loadData(){
 lastFetch=Date.now();
 try{
  const res=await fetch('/curiosity/live-data.json?refresh='+Math.floor(Date.now()/3600000),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);
  const data=await res.json();if(data.version!==1||!data.series||typeof data.series!=='object')throw Error('Invalid source catalog');
  research(data);
  const when=data.researchUpdatedAt||data.updatedAt;
  if($('freshness'))$('freshness').textContent=when?'Source last checked '+new Date(when).toLocaleString():'Source update not yet available';
  window.WonderData=data;window.dispatchEvent(new CustomEvent('wonder-data-ready',{detail:{data}}));
 }catch(error){
  research(null);if($('freshness'))$('freshness').textContent='Public feed unavailable; retry on next update';
  window.dispatchEvent(new CustomEvent('wonder-data-error',{detail:{error:String(error)}}));
 }
}
function start(){
 const daily=$('today-feature'),today=ideas[dateIndex()];
 if(daily&&today){
  if($('today-date'))$('today-date').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'});
  daily.replaceChildren();daily.append(make('h2',today.title),make('p',today.hook+' '+today.try));
  const btn=make('button','Read the full idea ↗','feature-link');btn.type='button';btn.onclick=()=>{reset();render();read(today.id,false);$('ideas')?.scrollIntoView({behavior:'smooth'})};daily.append(btn);
 }
 if($('ideas-grid')){
  const params=new URLSearchParams(location.search),story=params.get('story');
  if(story&&ideas.some(x=>x.id===story)){expanded=true;active=story}
  render();
  $('idea-categories')?.addEventListener('click',e=>{
   const b=e.target.closest('[data-category]');if(!b)return;
   category=b.dataset.category;active=null;$('idea-categories').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));render();
  });
  $('idea-search')?.addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();active=null;render()});
  $('ideas-grid').addEventListener('click',e=>{const b=e.target.closest('[data-read-idea]');if(b)read(b.dataset.readIdea)});
  if($('surprise-idea'))$('surprise-idea').onclick=()=>{reset();render();const pick=ideas[Math.floor(Math.random()*ideas.length)];if(pick)read(pick.id)};
  if($('show-more-ideas'))$('show-more-ideas').onclick=()=>{expanded=!expanded;render()};
  if(active)requestAnimationFrame(()=>document.querySelector('#idea-reading')?.scrollIntoView({block:'start'}));
 }
 if($('research-grid')||$('corr-country')){
  void loadData();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastFetch>30*60000)void loadData()});
 }
}
window.WonderIndexIdeasAPI=Object.freeze({all:()=>ideas.slice(),today:()=>ideas[dateIndex()],reload:loadData});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
