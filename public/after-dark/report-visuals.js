/* Unwrapped visual report system.
 * Uses only canonical, already-approved report data; never uploads or alters answers.
 * Bars are descriptive counts/relative coded themes—not probabilities, diagnoses or predictions.
 * Runs before preview and print because the existing build() functions call these helpers.
 */
(()=>{'use strict';
const node=(tag,cls,value)=>{
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(value!==undefined)x.textContent=String(value);
 return x;
};
const put=(to,tag,cls,value)=>{const x=node(tag,cls,value);to.append(x);return x};
const finite=x=>Number.isFinite(Number(x))?Math.max(0,Number(x)):0;
const clamp=x=>Math.min(100,Math.max(0,Math.round(Number(x)||0)));
const percent=(num,den)=>den>0?clamp(100*finite(num)/den):0;
const getSection=(root,prefix)=>[...root.querySelectorAll(':scope > section')].find(s=>s.querySelector('h2')?.textContent.trim().startsWith(prefix));
const intro=(title,sub)=>{
 const panel=node('section','report-visual-panel');
 put(panel,'span','report-visual-kicker','VISUAL REPORT · YOUR ANSWERS');
 put(panel,'h3','report-visual-title',title);
 if(sub)put(panel,'p','report-visual-note',sub);
 return panel;
};
function meter(parent,label,answered,total){
 const row=put(parent,'div','report-visual-completion-row');
 const top=put(row,'div','report-visual-completion-top');
 put(top,'strong','',label);
 put(top,'span','',finite(answered)+' / '+finite(total)+' answered');
 const track=put(row,'div','report-visual-completion-track');
 track.setAttribute('role','progressbar');
 track.setAttribute('aria-label',label+' completion');
 track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
 track.setAttribute('aria-valuenow',String(percent(answered,total)));
 const fill=put(track,'span','report-visual-completion-fill');
 fill.style.width=percent(answered,total)+'%';
 put(row,'small','report-visual-completion-caption',percent(answered,total)+'% complete');
 return row;
}
const statuses=[
 {key:'interested',label:'Marked Interested',explain:'You explicitly chose Interested'},
 {key:'curious',label:'Marked Curious',explain:'You explicitly chose Curious'},
 {key:'named',label:'Named in quiz',explain:'You chose a specific topic in your answers'},
 {key:'suggested',label:'Unconfirmed idea',explain:'Suggested from shared themes; not a declared interest'}
];
function classify(item){
 if(item.directSelection===2)return 'interested';
 if(item.directSelection===1)return 'curious';
 return item.specificSelected?'named':'suggested';
}
function classificationTable(parent,interests){
 const count=new Map(statuses.map(s=>[s.key,0]));
 for(const item of interests||[])count.set(classify(item),(count.get(classify(item))||0)+1);
 const total=[...count.values()].reduce((sum,n)=>sum+n,0);
 const wrap=put(parent,'div','report-visual-classification');
 put(wrap,'h4','', 'What these results represent');
 const desc=put(wrap,'p','report-visual-note',
 'Counts are for topics displayed in this report, not a measure of compatibility or likelihood. Suggestions must never be treated as your preferences.');
 const band=put(wrap,'div','report-visual-segments');
 band.setAttribute('role','img');
 band.setAttribute('aria-label',statuses.map(s=>s.label+': '+count.get(s.key)).join('; '));
 if(total){for(const s of statuses){const n=count.get(s.key);if(!n)continue;
   const seg=put(band,'span','report-visual-segment is-'+s.key);
   seg.style.width=percent(n,total)+'%';
 }}
 else put(wrap,'p','report-visual-note','No topics are displayed yet.');
 const table=put(wrap,'table','report-visual-table report-visual-status-table');
 const caption=put(table,'caption','','Selection and suggestion categories');
 const head=put(table,'thead'),headrow=put(head,'tr');
 for(const value of ['Category','Topics','How to interpret'])put(headrow,'th','',value).scope='col';
 const body=put(table,'tbody');
 for(const s of statuses){
  const tr=put(body,'tr');
  const td=put(tr,'th');
  td.scope='row';put(td,'span','report-visual-status-dot is-'+s.key);td.append(document.createTextNode(s.label));
  put(tr,'td','report-visual-number',count.get(s.key));
  put(tr,'td','',s.explain);
 }
 return wrap;
}
function axisItems(d){
 const direct=d?.axes?.direct||{},psych=d?.axes?.psych||{},combined=d?.axes?.combined||{};
 const lenses=d?.lenses||{};
 return Object.keys(lenses).filter(k=>finite(direct[k])>0||finite(psych[k])>0)
 .sort((a,b)=>finite(combined[b])-finite(combined[a])||a.localeCompare(b))
 .slice(0,6).map(k=>({id:k,label:lenses[k].label||k,direct:finite(direct[k]),psych:finite(psych[k])}));
}
function comparisonTable(parent,d){
 const entries=axisItems(d);
 const section=put(parent,'div','report-visual-matrix-wrap');
 put(section,'h4','', 'Where the two quizzes meet');
 put(section,'p','report-visual-note',
  'Each bar is scaled to the most frequent theme within its own quiz. The bars show relative emphasis, not probabilities; the two quizzes have different question counts.');
 if(!entries.length){put(section,'p','report-visual-note','Complete some quiz questions to see a comparison.');return section;}
 const maxDirect=Math.max(1,...entries.map(x=>x.direct));
 const maxPsych=Math.max(1,...entries.map(x=>x.psych));
 const table=put(section,'table','report-visual-table report-visual-matrix');
 put(table,'caption','','Relative coded theme emphasis by questionnaire');
 const thead=put(table,'thead'),header=put(thead,'tr');
 for(const name of ['Theme','Sexual preferences','Everyday psychology'])put(header,'th','',name).scope='col';
 const tbody=put(table,'tbody');
 for(const e of entries){
  const tr=put(tbody,'tr');
  const label=put(tr,'th','',e.label);label.scope='row';
  for(const [v,max,kind] of [[e.direct,maxDirect,'direct'],[e.psych,maxPsych,'psych']]){
   const td=put(tr,'td','report-visual-data');
   const track=put(td,'span','report-visual-mini-track');
   track.setAttribute('role','img');
   track.setAttribute('aria-label',e.label+'; '+(kind==='direct'?'preferences':'psychology')+' relative emphasis: '+percent(v,max)+' percent of that quiz’s highest theme');
   const bar=put(track,'span','report-visual-mini-fill is-'+kind);bar.style.width=percent(v,max)+'%';
   put(td,'small','',v?percent(v,max)+'% relative':'No coded match');
  }
 }
 put(section,'p','report-visual-footnote','Shared labels are prompts for reflection; they do not establish causes, prove preferences, or override a “Not for me” response.');
 return section;
}
function addConnectionMap(panel,d){
 const entries=axisItems(d).slice(0,5);
 const wrap=put(panel,'div','report-connection-map');
 put(wrap,'h4','','How your two sides connect');
 put(wrap,'p','report-visual-note','Follow each line from intimate interests through a shared theme to everyday psychology. Lines indicate recurring answer categories, not causes or hidden traits.');
 if(!entries.length){put(wrap,'p','report-visual-note','Answer either quiz to reveal your theme connections.');return}
 const chart=put(wrap,'div','report-connection-lanes');
 for(const item of entries){
  const lane=put(chart,'div','report-connection-lane');
  const left=put(lane,'span','report-connection-node is-intimate',item.direct?'Intimate quiz':'Not selected');
  const bridge=put(lane,'span','report-connection-bridge');
  put(bridge,'i','report-connection-line'+(item.direct&&item.psych?' is-linked':''));
  put(bridge,'strong','',item.label);
  const right=put(lane,'span','report-connection-node is-psych',item.psych?'Psychology quiz':'Not selected');
  if(!item.direct)left.classList.add('is-empty');
  if(!item.psych)right.classList.add('is-empty');
 }
 const notes=put(wrap,'div','report-connection-explanations');
 for(const item of entries.slice(0,3)){
  const c=put(notes,'article','report-connection-explanation');
  put(c,'strong','',item.label);
  put(c,'p','',String(d.lenses?.[item.id]?.detail||'This theme appears in your selected answers.').slice(0,440));
  put(c,'small','',item.direct&&item.psych?'This theme appears in both quizzes. Explore how its meaning changes with context.':item.direct?'Only the intimate quiz currently shows this theme; no broader connection is established.':'Only the psychology quiz currently shows this theme; it does not establish an intimate preference.');
 }
 put(wrap,'p','report-visual-footnote','The detailed narrative, answer evidence and individual reflections remain part of your report.');
}
function enhancePersonal(root,d){
 if(!root||root.querySelector('.report-visual-dashboard'))return root;
 const overview=getSection(root,'01');if(!overview)return root;
 const panel=intro('Your results, clearly mapped','A reading guide to the responses you saved—not a clinical or predictive assessment.');
 panel.classList.add('report-visual-dashboard');
 const progress=put(panel,'div','report-visual-progress');
 meter(progress,'Sexual Preferences Quiz',d.direct?.answered,(d.direct?.questions||[]).length);
 meter(progress,'Everyday Psychology Quiz',d.psych?.answered,(d.psych?.questions||[]).length);
 classificationTable(panel,d.interests||[]);
 comparisonTable(panel,d);
 addConnectionMap(panel,d);
 const first=overview.querySelector('.report-insight,.report-glance');
 overview.insertBefore(panel,first||overview.children[2]||null);
 return root;
}
function enhancePartner(root,d,sections){
 if(!root||root.querySelector('.report-visual-partner'))return root;
 const enabled=sections instanceof Set?sections:new Set(sections||[]);
 if(enabled.has('overview')){
  const overview=[...root.querySelectorAll(':scope > section')].find(s=>s.querySelector('h2')?.textContent==='The highlights');
  if(overview){
   const wrap=put(overview,'div','report-visual-partner report-visual-partner-progress');
   put(wrap,'h3','', 'Quiz completion');
   meter(wrap,'Preferences',d.direct?.answered,(d.direct?.questions||[]).length);
   meter(wrap,'Psychology',d.psych?.answered,(d.psych?.questions||[]).length);
  }
 }
 if(enabled.has('themes')){
  const themes=[...root.querySelectorAll(':scope > section')].find(s=>s.querySelector('h2')?.textContent==='The themes behind my answers');
  if(themes){comparisonTable(themes,d);addConnectionMap(themes,d)}
 }
 if(enabled.has('interests')){
  const interests=[...root.querySelectorAll(':scope > section')].find(s=>s.querySelector('h2')?.textContent==='Interests I picked');
  if(interests){
   // Only named/explicitly selected topics; do not reveal optional suggestions.
   const chosen=(d.interests||[]).filter(x=>x.directSelection||x.specificSelected);
   const wrap=put(interests,'div','report-visual-partner report-visual-named');
   put(wrap,'h3','','My selected topics by category');
   const byCategory=new Map();
   for(const item of chosen)byCategory.set(item.category,(byCategory.get(item.category)||0)+1);
   const table=put(wrap,'table','report-visual-table');
   const caption=put(table,'caption','','Topic groups I chose to share');
   const h=put(put(table,'thead'),'tr');
   for(const x of ['Category','Selected topics'])put(h,'th','',x).scope='col';
   const tbody=put(table,'tbody');
   for(const [name,count] of [...byCategory.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))){
    const tr=put(tbody,'tr');put(tr,'th','',name).scope='row';put(tr,'td','report-visual-number',count);
   }
   if(!byCategory.size)put(wrap,'p','report-visual-note','No directly selected topics yet.');
  }
 }
 return root;
}
function enhanceIntroduction(root,draft){
 if(!root||root.querySelector('.report-visual-introduction'))return root;
 const everyday=[...root.querySelectorAll(':scope > section')].find(s=>s.querySelector('h2')?.textContent.startsWith('01 · The person'));
 if(!everyday)return root;
 const labels=[['communication','Communication'],['care','Feeling appreciated'],['stress','When things get stressful'],['boundaries','Boundaries & privacy']];
 const filled=labels.filter(([key])=>String(draft?.[key]||'').trim());
 if(!filled.length)return root;
 const wrap=node('div','report-visual-introduction');
 put(wrap,'h3','', 'My everyday connection guide');
 put(wrap,'p','report-visual-note','A quick reference from my own words. Read the complete reflections below for context.');
 const table=put(wrap,'table','report-visual-table report-visual-intro-table');
 put(table,'caption','','What I chose to tell you');
 const head=put(put(table,'thead'),'tr');
 put(head,'th','','Topic').scope='col';put(head,'th','','In my words').scope='col';
 const body=put(table,'tbody');
 for(const [key,label] of filled){
  const row=put(body,'tr');put(row,'th','',label).scope='row';
  const full=String(draft[key]).trim();
  put(row,'td','',full.length>140?full.slice(0,137)+'…':full);
 }
 everyday.insertBefore(wrap,everyday.children[2]||null);
 return root;
}
window.AfterDarkReportVisuals=Object.freeze({enhancePersonal,enhancePartner,enhanceIntroduction});
})();