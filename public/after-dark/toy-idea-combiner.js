/* Unwrapped Idea Lab — anatomically accurate, privacy-first toy conversation prompts.
 * Uses the SAME toy catalog, uses, care and suitability notes as the Toy Guide and reports.
 * For him / her are convenient prompts, not claims about gender or orientation.
 */
(()=>{
'use strict';
const library=()=>window.UnwrappedToyLibrary;
const $=id=>document.getElementById(id);
const el=(name,contents,cls)=>{const e=document.createElement(name);if(contents!==undefined)e.textContent=String(contents);if(cls)e.className=cls;return e};
const modes=[['him','Male anatomy / penile or prostate context'],['her','Female anatomy / vulvar or vaginal context']];
const readableFit={
 direct:'Made for this anatomical context when correctly rated',
 conditional:'Only certain models are appropriate; verify the intended body area',
 partner:'Relevant when discussing a partner, not as a direct body fit',
 'not-targeted':'Not designed for this anatomical context'
};
let last={him:'',her:''},used=new Set();
function appropriate(toy,kind){
 const guide=library()?.bodyUses(toy.id);
 return guide&&['direct','conditional'].includes(guide[kind==='him'?'male':'female']?.fit);
}
function pick(kind){
 const toys=(library()?.types||[]).filter(t=>appropriate(t,kind)), fresh=toys.filter(t=>!used.has(t.id));
 const pool=fresh.length?fresh:toys;
 if(!pool.length)return null;
 const item=pool[Math.floor(Math.random()*pool.length)];
 used.add(item.id);if(used.size>Math.max(15,Math.floor(toys.length*.75)))used=new Set([item.id]);
 return item;
}
function selected(kind){
 const select=$(kind==='him'?'toy-idea-him':'toy-idea-her');
 if(!select)return null;
 const item=select.value?library()?.find(select.value):pick(kind);
 return item&&appropriate(item,kind)?item:null;
}
function addHeader(root,title,subtitle){
 root.append(el('span','ONE OPTION TO DISCUSS · NOT A REQUIREMENT','eyebrow'),el('h4',title),el('p',subtitle));
}
function lead(thing,kind){
 const body=library()?.bodyUses(thing.id),fit=body?.[kind==='him'?'male':'female'];
 const row=el('article',undefined,'unwrapped-toy-idea-recommendation');
 row.append(el('strong',thing.name),el('small',readableFit[fit.fit]||'Check actual anatomical fit'));
 row.append(el('p',thing.summary),el('p','Body suitability: '+fit.note));
 row.append(el('p','An idea to discuss: '+(thing.talk||'What makes this type interesting, and is it a fantasy or something you would like to learn more about?')));
 return row;
}
function safety(root,items){
 const unique=[...new Map(items.map(x=>[x.id,x])).values()];
 const note=el('details',undefined,'unwrapped-toy-idea-safety');
 note.append(el('summary','Safety, materials and compatibility'));
 for(const item of unique){
  const line=el('p',undefined);
  line.append(el('strong',item.name+': '),document.createTextNode(item.safety));
  if(item.care)line.append(document.createTextNode(' Care: '+item.care));
  note.append(line);
 }
 root.append(note);
}
function openGuideButton(root,id){
 const button=el('button','Read '+(library()?.find(id)?.name||'this type')+' in the Sex Toy Guide ↗','btn alt');
 button.type='button';button.onclick=()=>{
  const trigger=document.querySelector('[data-tab="toys"]');trigger?.click();
  const q=$('toy-search');if(q){q.value=library()?.find(id)?.name||'';q.dispatchEvent(new Event('input',{bubbles:true}));}
  document.querySelector('#toy-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
 };
 root.append(button);
}
function generate(mode){
 const root=$('toy-idea-output');if(!root||!library())return;
 root.replaceChildren();
 const kind=mode==='him'?'him':'her';
 if(mode!=='together'){
  const item=selected(kind);
  if(!item){root.append(el('p','The chosen device is not rated for this anatomy. Select a compatible topic or Choose for me.'));return}
  last[kind]=item.id;
  addHeader(root,mode==='him'?'An idea for him':'An idea for her','Use the appropriate anatomy guidance, not assumptions about identity or sexual orientation.');
  root.append(lead(item,kind));
  root.append(el('p','Discuss interest, comfort, who controls the device and whether this is fantasy only. A partner can always say no.','unwrapped-toy-idea-caution'));
  safety(root,[item]);openGuideButton(root,item.id);
 }else{
  const him=selected('him'),her=selected('her');
  if(!him||!her){root.append(el('p','Select two individually compatible topics or use Choose for me on both menus.'));return}
  last={him:him.id,her:her.id};
  addHeader(root,'An idea to understand together','Two independently chosen interests. Combining them means comparing preferences, not putting two devices into use at the same time.');
  const two=el('div',undefined,'unwrapped-toy-idea-pair');two.append(lead(him,'him'),lead(her,'her'));root.append(two);
  const overlap=him.id===her.id?'You selected the same device for both people. That can be a shared topic, with separate anatomy and safety considerations.':
   'These are two different interests. One person may prefer one option, both may like either, or neither may want to act on them. Do not assume they work together physically.';
  const action=el('div',undefined,'unwrapped-toy-idea-combine');
  action.append(el('h5','Find the common ground'),el('p',overlap),
   el('p','Each person privately marks their own choice as Yes to discuss / Fantasy only / Not for me. If both welcome a discussion, compare why the ideas appeal and what precautions apply. A no is final; no one has to try an activity.'));
  const shared=library().bodyUses(him.id)?.together;
  if(shared)action.append(el('p','Partner considerations for '+him.name+': '+shared));
  if(her.id!==him.id&&library().bodyUses(her.id)?.together)action.append(el('p','Partner considerations for '+her.name+': '+library().bodyUses(her.id).together));
  root.append(action);safety(root,[him,her]);openGuideButton(root,him.id);
  if(her.id!==him.id)openGuideButton(root,her.id);
 }
}
function init(){
 const area=$('toy-idea-studio'),libraryObj=library();if(!area||!libraryObj)return;
 for(const [kind,label] of modes){
  const select=$(kind==='him'?'toy-idea-him':'toy-idea-her');
  const items=libraryObj.types.filter(x=>appropriate(x,kind)).sort((a,b)=>{
   const aStrap=a.group==='Strap-ons & harnesses',bStrap=b.group==='Strap-ons & harnesses';
   return Number(bStrap)-Number(aStrap)||a.name.localeCompare(b.name);
  });
  for(const item of items){const opt=el('option',item.name);opt.value=item.id;select.append(opt);}
  select.setAttribute('title',label);
 }
 area.querySelectorAll('[data-toy-idea-mode]').forEach(button=>button.addEventListener('click',()=>generate(button.dataset.toyIdeaMode)));
 const search=new URLSearchParams(location.search);
 if(search.get('toy')&&libraryObj.find(search.get('toy')))setFromToy(search.get('toy'));
}
function setFromToy(id,kind='together'){
 const item=library()?.find(id);if(!item)return false;
 const guide=library()?.bodyUses(item.id);
 const male=['direct','conditional'].includes(guide.male.fit),female=['direct','conditional'].includes(guide.female.fit);
 if(male&&$('toy-idea-him'))$('toy-idea-him').value=item.id;
 if(female&&$('toy-idea-her'))$('toy-idea-her').value=item.id;
 if(kind==='together')generate('together');
 else generate(male?'him':'her');
 return true;
}
window.UnwrappedToyIdeas=Object.freeze({generate,setFromToy,pick,appropriate,selected:()=>({...last})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
