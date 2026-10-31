/* The Other Drawer — category-aware, explicitly unconfirmed discovery prompts.
 * Self-reported "Not for me" and already-selected topics are never recommendations.
 * Scores are relative reading relevance, never probabilities of attraction. */
(()=>{'use strict';
const get=()=>window.AfterDarkCanonicalReport?.buildData?.();
const topics=()=>window.AfterDarkNotebookBridge?.getTopics?.()||[];
const selectedNames=d=>new Set((d.direct?.specificSelections||[])
 .flatMap(s=>s.context==='Adult media watched / imagined'?[]:s.interests||[])
 .map(s=>String(s).trim().toLowerCase()));
const classify=t=>String(t.name||'').toLowerCase();
const val=n=>Math.max(0,Number(n)||0);
const safe=a=>Array.isArray(a)?a:[];
const negativeChoice=s=>/^(?:none|neither|not interested|no interest|i (?:don't|do not) |prefer not|nothing|unsure|i am not sure|not for me|skip)/i.test(String(s||''));
const directEvidence=(d,tags)=>safe(d.direct?.questions).filter(q=>safe(q.selected).some(opt=>
  !negativeChoice(opt.text)&&safe(opt.axes).some(tag=>tags.includes(tag)))).slice(0,2)
  .map(q=>({question:q.question,answer:safe(q.selected).filter(opt=>safe(opt.axes).some(tag=>tags.includes(tag)))
  .filter(x=>!negativeChoice(x.text)).map(x=>x.text).slice(0,2).join(' / '),intent:q.intentLabel||''}));
const psychEvidence=(d,tags)=>safe(d.psych?.questions).filter(q=>safe(q.selected).some(opt=>
  safe(opt.axes).some(tag=>tags.includes(tag)))).slice(0,2)
 .map(q=>({question:q.question,answer:safe(q.selected).filter(opt=>safe(opt.axes).some(tag=>tags.includes(tag)))
 .map(x=>x.text).slice(0,2).join(' / ')}));
function evaluate(d=get()){
 if(!d||d.direct?.answered<4)return{suggestions:[],categories:[],eligible:false,reason:'Complete more of the Sexual Preferences Quiz to explore possible new topics. Everyday psychology answers alone do not establish sexual interests.'};
 // Recount affirmative direct-quiz selections only: negation options such as
 // "None of these" have theme tags for quiz navigation, not evidence of desire.
 const negative=/^(?:none|neither|not interested|no interest|i (?:don't|do not) |prefer not|nothing|unsure|i am not sure|not for me|skip)/i;
 const direct={};
 for(const q of safe(d.direct?.questions)){
  if(q?.coreId===61||/adult.media|pornograph/i.test(q?.question||''))continue;
  for(const option of safe(q?.selected)){
   if(negative.test(option.text||''))continue;
   for(const axis of safe(option.axes)){direct[axis]=(direct[axis]||0)+1;}
  }
 }
 const psych=d.axes?.psych||{},lenses=d.lenses||{};
 const marked=new Set(Object.keys(d.selections||{}).filter(id=>['yes','maybe','no'].includes(d.selections[id])));
 const already=selectedNames(d);
 const topDirect=Math.max(1,...Object.values(direct).map(val));
 const topPsych=Math.max(1,...Object.values(psych).map(val));
 const declaredCategory={};
 safe(d.interests).forEach(item=>{
  if(!item.directSelection&&!item.specificSelected)return;
  declaredCategory[item.category]=(declaredCategory[item.category]||0)+1;
 });
 const ranked=[];
 for(const t of topics()){
  if(!t?.id||!t.name||!t.cat||t.warning||t.warn||marked.has(String(t.id))||already.has(classify(t)))continue;
  // Avoid topics requiring risk warnings or violating consent.
  if(/(non.?consensual|coercive|underage|minor|strangulat|asphyx|breath.*restrict|blood|knife|needle)/i.test(t.name+' '+t.cat))continue;
  const tags=safe(t.tags).filter(x=>typeof x==='string'&&!!direct[x]&&val(direct[x])>0);
  if(!tags.length)continue;
  const directValue=tags.reduce((s,k)=>s+val(direct[k])/topDirect,0);
  const psychTags=safe(t.tags).filter(x=>val(psych[x])>0);
  const psychValue=psychTags.reduce((s,k)=>s+val(psych[k])/topPsych,0);
  const both=tags.filter(x=>psychTags.includes(x));
  // Score is editorial relevance, driven primarily by actual direct-quiz evidence.
  const base=directValue*.78 + psychValue*.18 + Math.min(2,both.length)*.12;
  const affinity=Math.min(.16,(declaredCategory[t.cat]||0)*.035);
  const score=base*(1+affinity);
  if(score<.16)continue;
  const shared=tags.sort((a,b)=>val(direct[b])-val(direct[a])).slice(0,3);
  ranked.push({id:t.id,name:t.name,category:t.cat,description:t.description||'',
   tags:shared,overlap:both,raw:score,directStrength:directValue,psychStrength:psychValue,
   evidenceDirect:directEvidence(d,shared),evidencePsych:psychEvidence(d,psychTags)});
 }
 ranked.sort((a,b)=>b.raw-a.raw||a.name.localeCompare(b.name));
 const cats=new Map();
 ranked.forEach(t=>{const g=cats.get(t.category)||{category:t.category,total:0,count:0};
 g.total+=t.raw;g.count++;cats.set(t.category,g);});
 const categories=[...cats.values()].sort((a,b)=>(b.total/Math.sqrt(b.count))-(a.total/Math.sqrt(a.count)))
  .map(c=>({category:c.category,score:c.total/Math.sqrt(c.count),count:c.count}));
 const top=Math.max(1,...ranked.map(x=>x.raw));
 const maxCat=Math.max(1,...categories.map(x=>x.score));
 const diversified=[],counts={};
 // First pass ensures genuinely different categories can be explored.
 for(const candidate of ranked){
  if(diversified.length>=14)break;
  const count=counts[candidate.category]||0;
  if(count>=2)continue;
  counts[candidate.category]=count+1;diversified.push(candidate);
 }
 for(const candidate of ranked){
  if(diversified.length>=14)break;
  if(!diversified.includes(candidate)){diversified.push(candidate);}
 }
 const suggestions=diversified.map(t=>({...t,
  // Fit labels are relative theme matches, not measured likelihood.
  fit:Math.round(100*t.raw/top),
  why:'From the direct quiz: '+t.tags.map(tag=>lenses[tag]?.label||tag).join(', ')+
    (t.overlap.length?'. Related everyday responses also mention '+t.overlap.map(tag=>lenses[tag]?.label||tag).join(', ')+'.':'.'),
  status:'Unconfirmed reading suggestion · not a stated interest'}));
 return{suggestions,categories:categories.map(c=>({...c,relative:Math.round(c.score/maxCat*100)})),
  eligible:true,reason:'Suggestions come from shared editorial theme tags, not a scientific probability, an inferred fetish, or a recommendation to act.'};
}
function render(root=document.createElement('section')){
 const d=get(),info=evaluate(d),make=(tag,label,cls)=>{
 const node=document.createElement(tag);if(label!==undefined)node.textContent=String(label);if(cls)node.className=cls;return node;};
 root.classList.add('report-discover');
 const heading=make('h3','You might not have considered…');root.append(heading);
 root.append(make('p','New topics from across the Curiosity Cabinet, selected for overlap with what you actually answered. No suggestion is treated as a declared preference.','report-muted'));
 if(!info.eligible){root.append(make('p',info.reason,'report-muted'));return root;}
 const categories=make('div',undefined,'report-discover-categories');
 categories.append(make('h4','Which categories connect with your answers?'));
 categories.append(make('p','Relative reading relevance within this report—not desire probabilities. Only categories with matching direct-quiz themes are shown.','report-muted'));
 for(const cat of info.categories.slice(0,9)){
  const line=make('div',undefined,'report-discover-category');
  line.append(make('span',cat.category));
  const track=make('div',undefined,'report-discover-track'),fill=make('span',undefined,'report-discover-fill');
  fill.style.width=cat.relative+'%';track.append(fill);line.append(track);
  line.append(make('small',cat.count+' possible topics'));categories.append(line);
 }
 root.append(categories);
 let previous='';
 for(const candidate of info.suggestions){
  if(candidate.category!==previous){previous=candidate.category;root.append(make('h4',previous,'report-discover-group'));}
  const card=make('article',undefined,'report-discover-card');
  card.append(make('span','UNCONFIRMED · EXPLORE OR DISMISS','report-discover-eyebrow'));
  card.append(make('h5',candidate.name));
  if(candidate.description)card.append(make('p',candidate.description,'report-discover-description'));
  card.append(make('p',candidate.why,'report-discover-why'));
  const direct=candidate.evidenceDirect[0];
  if(direct)card.append(make('p','Direct quiz: “'+direct.answer+'”','report-discover-answer'));
  const psych=candidate.evidencePsych[0];
  if(psych)card.append(make('p','Everyday quiz: “'+psych.answer+'”','report-discover-answer'));
  card.append(make('p','Why explore it? To see whether this specific interest resonates—not because the report says you want it.','report-muted'));
  root.append(card);
 }
 root.append(make('p','Your explicit Not for me selections and previously chosen topics are excluded. Fantasy-only choices are never treated as plans to act.','report-muted'));
 return root;
}
window.AfterDarkDiscovery=Object.freeze({evaluate,render});
const baseReport=window.AfterDarkDetailedReport;
if(baseReport&&typeof baseReport.build==='function'){
 window.AfterDarkDetailedReport=Object.freeze({...baseReport,build(){
  const doc=baseReport.build();
  const section=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('05'));
  if(section){
   const s=document.createElement('div');s.className='report-discover-module';
   section.append(window.AfterDarkDiscovery.render(s));
  }
  return doc;
 }});
}
})();