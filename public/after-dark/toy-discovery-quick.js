/* Unwrapped: quick search, accessible discovery, and library-backed random ideas.
 * Enhances existing pages without overriding quiz answers, storing queries or calling a network.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node};
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim();
const includes=(t,q)=>norm([t.name,t.summary,t.group,...(t.tags||[]),...(t.uses||[])].join(' ')).includes(norm(q));
const lib=()=>window.UnwrappedToyLibrary;
const fit=(t,kind)=>['direct','conditional'].includes(lib()?.bodyUses(t.id)?.[kind]?.fit);
const choose=(arr,history)=>{if(!arr.length)return null;const fresh=arr.filter(t=>!history.has(t.id)),pool=fresh.length?fresh:arr;if(!fresh.length)history.clear();const item=pool[Math.floor(Math.random()*pool.length)];history.add(item.id);return item};
const randomHistory=new Set(),studioHistory=new Set();
function openGuide(toy){
 document.querySelector('[data-tab="toys"]')?.click();
 const q=$('toy-search'),filter=$('toy-filter');
 if(filter)filter.value='';
 if(q){q.value=toy.name;q.dispatchEvent(new Event('input',{bubbles:true}))}
 const trigger=$('toy-grid')?.querySelector('[data-toy-open="'+toy.id+'"]');
 if(trigger)trigger.click();
 $('toy-detail')?.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function initStudio(){
 const studio=$('toy-idea-studio'),library=lib();
 if(!studio||!library||!window.UnwrappedToyIdeas)return;
 const choices=studio.querySelector('.unwrapped-toy-idea-choices');
 if(choices){
  const details=make('details',undefined,'toy-idea-advanced'),summary=make('summary','Choose exact toys for each person (optional)');
  choices.parentNode.insertBefore(details,choices);
  details.append(summary,choices);
 }
 const search=make('section',undefined,'toy-quick-discovery');
 search.setAttribute('aria-label','Fast search of sex toy types');
 const label=make('label','Find a toy or sensation');
 const input=make('input');input.type='search';input.id='toy-idea-search';input.autocomplete='off';input.placeholder='Search names, uses, feelings, safety…';input.setAttribute('aria-controls','toy-idea-search-results');
 label.append(input);
 const random=make('button','🎲 Surprise me','btn toy-surprise');random.type='button';
 const top=make('div',undefined,'toy-quick-search-top');top.append(label,random);search.append(top);
 const chips=make('div',undefined,'toy-quick-chips');chips.setAttribute('role','group');chips.setAttribute('aria-label','Explore toy categories');
 const categories=[
  ['All',''],['External','External stimulation'],['Internal','Internal options'],
  ['Penis & body','Penis & body'],['Anal & pelvic','Anal & pelvic'],
  ['Partner','Partner options'],['Strap-ons','Strap-ons & harnesses'],
  ['Sensory','Sensory & boundaries'],['Comfort','Comfort & accessibility']
 ];
 let activeGroup='';
 const buttons=[];
 for(const [label,group] of categories){
  const button=make('button',label,'toy-chip');button.type='button';button.setAttribute('aria-pressed',String(!group));
  button.addEventListener('click',()=>{activeGroup=group;buttons.forEach(([b,g])=>b.setAttribute('aria-pressed',String(g===group)));render()});
  buttons.push([button,group]);chips.append(button);
 }
 search.append(chips);
 const status=make('p','Search all '+library.types.length+' categories, or pick a quick filter.','toy-quick-help');
 const results=make('div',undefined,'toy-quick-results');results.id='toy-idea-search-results';results.setAttribute('aria-live','polite');
 search.append(status,results);
 const heading=studio.querySelector('.unwrapped-toy-idea-heading');
 if(heading)heading.insertAdjacentElement('afterend',search);else studio.prepend(search);
 const candidates=()=>library.types.filter(t=>(!activeGroup||t.group===activeGroup||(activeGroup==='Anal & pelvic'&&t.group==='Strap-ons & harnesses'))&&(!input.value.trim()||includes(t,input.value)));
 function selectToy(toy){
  const him=$('toy-idea-him'),her=$('toy-idea-her');
  if(him)him.value=fit(toy,'male')?toy.id:'';
  if(her)her.value=fit(toy,'female')?toy.id:'';
  const mode=fit(toy,'male')&&fit(toy,'female')?'together':fit(toy,'male')?'him':'her';
  window.UnwrappedToyIdeas.generate(mode);
  $('toy-idea-output')?.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 function render(){
  results.replaceChildren();
  const found=candidates(),text=input.value.trim(),filtered=Boolean(text||activeGroup);
  status.textContent=filtered?found.length+' matching categories · choose a result or tap Surprise me.':'Explore '+library.types.length+' types with quick categories or search by name, use or sensation.';
  if(!filtered)return;
  if(!found.length){results.append(make('p','No matches. Try a shorter keyword or clear the category filter.','toy-quick-none'));return}
  const limit=12;
  for(const toy of found.slice(0,limit)){
   const button=make('button',undefined,'toy-quick-result');button.type='button';
   button.append(make('strong',toy.name),make('small',toy.group),make('span',toy.summary));
   button.setAttribute('aria-label','Explore '+toy.name);
   button.addEventListener('click',()=>selectToy(toy));
   results.append(button);
  }
  if(found.length>limit)results.append(make('p','Showing '+limit+' of '+found.length+'. Refine your search to narrow the list.','toy-quick-help'));
 }
 input.addEventListener('input',render);
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results.querySelector('button');if(first){e.preventDefault();first.click()}}});
 random.addEventListener('click',()=>{
  const found=candidates().filter(t=>fit(t,'male')||fit(t,'female'));
  const chosen=choose(found,studioHistory);
  if(!chosen){status.textContent='No matching suggestions. Clear your filter or try a shorter search.';return}
  selectToy(chosen);
 });
 render();
}
function initGuide(){
 const root=$('toy-library'),library=lib();
 if(!root||!library)return;
 const filters=root.querySelector('.toy-filters'),q=$('toy-search'),category=$('toy-filter'),focus=$('toy-body-focus');
 if(!filters||!q||!category)return;
 const controls=make('div',undefined,'toy-guide-actions');
 const surprise=make('button','🎲 Random toy to explore','btn toy-surprise');surprise.type='button';
 const clear=make('button','Clear search & filters','btn alt');clear.type='button';
 const status=make('span','','toy-guide-action-status');status.setAttribute('role','status');
 controls.append(surprise,clear,status);
 filters.insertAdjacentElement('afterend',controls);
 clear.addEventListener('click',()=>{q.value='';category.value='';if(focus)focus.value='both';q.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='Showing all categories.';q.focus()});
 surprise.addEventListener('click',()=>{
  const term=q.value.trim();
  const kind=focus?.value||'both';
  const pool=library.types.filter(t=>(!category.value||t.group===category.value)&&(!term||includes(t,term))&&(kind==='male'?fit(t,'male'):kind==='female'?fit(t,'female'):true));
  const chosen=choose(pool,randomHistory);
  if(!chosen){status.textContent='No match for those filters. Clear the search and try again.';return}
  category.value='';q.value=chosen.name;q.dispatchEvent(new Event('input',{bubbles:true}));
  const button=$('toy-grid')?.querySelector('[data-toy-open="'+chosen.id+'"]');
  button?.click();
  status.textContent='Random pick: '+chosen.name+'.';
 });
}
function renderRandomToy(){
 const library=lib(),card=$('ideaResult');if(!library||!card)return;
 const interests=window.AfterDarkCanonicalReport?.buildData?.();
 const matches=library.recommend(interests)||[];
 const matched=matches.filter(x=>library.find(x.id)).map(x=>library.find(x.id));
 const pool=library.types.filter(x=>!['Care, materials & barriers','Comfort & accessibility'].includes(x.group));
 const eligible=matched.length&&Math.random()<.55?matched:pool;
 const toy=choose(eligible,randomHistory);
 if(!toy)return;
 const match=matches.find(x=>x.id===toy.id);
 card.replaceChildren();
 const title=match?'BASED ON A TOPIC YOU NAMED · OPTIONAL READING':'A RANDOM TOPIC TO EXPLORE';
 card.append(make('span',title,'eyebrow'),make('h3',toy.name),make('p',toy.summary),
  make('h4','Ways to think about it'));
 const ul=make('ul');(toy.uses||[]).slice(0,2).forEach(u=>ul.append(make('li',u)));card.append(ul);
 const body=library.bodyUses(toy.id);
 if(body?.together)card.append(make('p','For partners: '+body.together));
 if(match?.mode.includes('Fantasy-only'))card.append(make('p','Your saved preference was fantasy-only. Treat this as something to read about, not a suggestion to try.','tiny'));
 card.append(make('p','Safety: '+toy.safety,'tiny'));
 const actions=make('div',undefined,'toy-quick-random-actions');
 const next=make('button','🎲 Another random suggestion','btn');next.type='button';next.addEventListener('click',renderRandomToy);
 const open=make('button','Explore this toy →','btn alt');open.type='button';open.addEventListener('click',()=>openGuide(toy));
 actions.append(next,open);card.append(actions);
}
function initRandomSuggestion(){
 const button=$('drawIdea'),category=$('mood');if(!button||!category||!lib())return;
 const original=button.onclick;
 if(typeof original!=='function')return;
 button.textContent='🎲 GIVE ME A RANDOM SUGGESTION';
 button.onclick=function(event){
  const theme=category.value,level=$('ideaLevel')?.value;
  if(theme==='toys'||(theme==='any'&&level!=='direct'&&Math.random()<.40))return renderRandomToy();
  return original.call(this,event);
 };
}
function init(){initStudio();initGuide();initRandomSuggestion()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();