/* Real-answer Unwrapped visual psychology cross-reference.
 * Derives every displayed link from the canonical combined 69+32 data object.
 * Never invents causal links, hidden desires, diagnoses, or preferences.
 */
(()=>{
'use strict';
const neg=/\b(?:none|neither|not interested|no interest|prefer not|rather skip|not for me|i don't|do not want)\b/i;
const make=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
const add=(to,tag,cls,value)=>{const x=make(tag,cls,value);to.append(x);return x};
const label=(d,key)=>d.lenses?.[key]?.label||key;
const chosen=item=>item.directSelection>0||item.specificSelected;
function collect(d,source){
 const questions=d[source]?.questions||[];
 const exclude=new Set((d.direct?.specificSelections||[])
   .filter(x=>x.context==='Adult media watched / imagined').map(x=>x.questionNumber));
 const rows=[];
 for(const q of questions){
  if(source==='direct'&&exclude.has(q.number))continue;
  for(const selection of q.selected||[]){
   if(source==='direct'&&neg.test(selection.text))continue;
   for(const tag of selection.axes||[])if(d.lenses?.[tag])rows.push({
    tag,question:q.question,number:q.number,answer:selection.text,
    intent:source==='direct'?q.intentLabel||'':null,source
   });
  }
 }
 return rows;
}
function evidenceFor(records,tag){return records.filter(x=>x.tag===tag)}
const fmt=x=>'Q'+x.number+' · '+x.answer;
function evidenceCell(to,records,kind,expanded=false){
 const box=make('div','report-cross-evidence');
 if(!records.length){add(box,'p','report-cross-missing',kind==='direct'?'No matching self-reported preference answer.':'No matching everyday-psychology answer.');to.append(box);return}
 const distinct=[...new Map(records.map(x=>[x.number+'|'+x.answer,x])).values()];
 add(box,'p','report-cross-mini',distinct.length+' relevant selected answer'+(distinct.length===1?'':'s'));
 for(const x of distinct.slice(0,2))add(box,'p','report-cross-response',fmt(x)+(x.intent&&x.intent!=='Not specified'?' · '+x.intent:''));
 if(distinct.length>2){
  const detail=add(box,'details','report-cross-more');
  if(expanded)detail.open=true;
  add(detail,'summary','', 'See '+(distinct.length-2)+' more answer links');
  const list=add(detail,'ol','report-cross-list');
  for(const x of distinct.slice(2))add(list,'li','',fmt(x)+(x.intent&&x.intent!=='Not specified'?' · '+x.intent:''));
 }
 to.append(box);
}
function pairCounts(direct,psych){
 const map=new Map();
 for(const [source,questions] of [['direct',direct],['psych',psych]]){
  const indexed=new Map();
  for(const row of questions){const set=indexed.get(row.number)||new Set();set.add(row.tag);indexed.set(row.number,set)}
  for(const tags of indexed.values()){
   const a=[...tags].sort();
   for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
    const key=a[i]+'|'+a[j],p=map.get(key)||{a:a[i],b:a[j],direct:0,psych:0};
    p[source]++;map.set(key,p);
   }
  }
 }
 return [...map.values()].sort((a,b)=>Number(b.direct>0&&b.psych>0)-Number(a.direct>0&&a.psych>0)||
  b.direct+b.psych-a.direct-a.psych||a.a.localeCompare(b.a));
}
function build(d){
 const sec=make('section','report-section report-deep-connections');
 sec.dataset.reportConnections='complete';
 add(sec,'p','report-kicker','THE CONNECTION MAP · EVIDENCE, NOT INFERENCE');
 add(sec,'h2','','The connections behind your answers');
 add(sec,'p','report-cross-lead','Follow the actual answer in each quiz to its coded psychological theme, then to the selected interests and smaller related patterns. A shared label describes a possible association for reflection. It does not prove a cause, diagnose a trait, or discover an interest you did not select.');
 const direct=collect(d,'direct'),psych=collect(d,'psych');
 const active=Object.keys(d.lenses||{}).filter(tag=>direct.some(x=>x.tag===tag)||psych.some(x=>x.tag===tag));
 const shared=active.filter(tag=>direct.some(x=>x.tag===tag)&&psych.some(x=>x.tag===tag));
 const confirmed=(d.interests||[]).filter(chosen);
 const stats=add(sec,'div','report-cross-summary');
 for(const [val,title,detail] of [
  [active.length,'themes in your selected answers','Coded reflection categories'],
  [shared.length,'themes appearing in both quizzes','Descriptive overlap, not validation'],
  [confirmed.length,'directly selected or named topics','Unconfirmed ideas kept separate']
 ]){
  const card=add(stats,'article','report-cross-stat');
  add(card,'strong','',String(val));add(card,'span','',title);add(card,'small','',detail);
 }
 const matrix=add(sec,'div','report-cross-matrix');
 add(matrix,'h3','','1. Full connection matrix');
 add(matrix,'p','report-muted','Every theme supported by a saved answer appears below, not just the top five. Expand a cell to see all contributing question-and-answer links. An answer about adult-media viewing is not counted as an intimate preference.');
 const table=add(matrix,'table','report-cross-table');
 add(table,'caption','','Answer-linked themes across both questionnaires');
 const header=add(add(table,'thead'),'tr');
 for(const name of ['Psychological theme','Intimate preference answers','Everyday psychology answers','Link status'])add(header,'th','',name).scope='col';
 const tbody=add(table,'tbody');
 for(const tag of active){
  const row=add(tbody,'tr');
  const l=add(row,'th','report-cross-theme',label(d,tag));l.scope='row';
  evidenceCell(add(row,'td'),evidenceFor(direct,tag),'direct');
  evidenceCell(add(row,'td'),evidenceFor(psych,tag),'psych');
  add(row,'td','report-cross-status',shared.includes(tag)?'Both quizzes · thematic overlap':direct.some(x=>x.tag===tag)?'Intimate responses only':'Everyday responses only');
 }
 if(!active.length)add(matrix,'p','report-muted','Answer the questionnaires to populate the evidence matrix.');
 const sub=add(sec,'div','report-cross-subpatterns');
 add(sub,'h3','','2. Smaller patterns that travel together');
 add(sub,'p','report-muted','A sub-connection is a pair of themes occurring in the same selected answer. These are not proof of a psychological relationship, cause, or new preference.');
 const pairs=pairCounts(direct,psych);
 const top=pairs.slice(0,45);
 const pairTable=add(sub,'table','report-cross-table report-cross-pair-table');
 const hp=add(add(pairTable,'thead'),'tr');
 for(const name of ['Theme pair','Intimate answers','Everyday answers','Evidence'])add(hp,'th','',name).scope='col';
 const tb=add(pairTable,'tbody');
 for(const p of top){
  const row=add(tb,'tr');
  const th=add(row,'th','',label(d,p.a)+' + '+label(d,p.b));th.scope='row';
  add(row,'td','',p.direct+' question'+(p.direct===1?'':'s'));
  add(row,'td','',p.psych+' question'+(p.psych===1?'':'s'));
  add(row,'td','',p.direct&&p.psych?'Occurs in both kinds of answer':'Appears in one questionnaire only');
 }
 if(pairs.length>top.length)add(sub,'p','report-muted', 'Showing '+top.length+' of '+pairs.length+' theme pairs to keep the export readable.');
 const chosenSection=add(sec,'div','report-cross-topics');
 add(chosenSection,'h3','','3. Interest-by-interest connection paths');
 add(chosenSection,'p','report-muted','Only your actual Interested / Curious marks or specifically named quiz topics appear as personal profiles below. Each pathway shows every relevant theme, supporting questions on both sides, and other *selected* topics that share the theme.');
 if(!confirmed.length)add(chosenSection,'p','report-muted','No directly confirmed or specifically named topics are available yet. Complete or mark some questions to populate this section.');
 for(const item of confirmed){
  const art=add(chosenSection,'article','report-cross-topic');
  const status=item.directSelection===2?'You marked Interested':item.directSelection===1?'You marked Curious':'Specifically named in your answers';
  add(art,'p','report-kicker',status+' · '+item.category);
  add(art,'h4','',item.name);
  add(art,'p','report-cross-small','This is your selected topic. Its connections below are interpretations of answer categories, not an explanation of its origin.');
  const relevant=[...new Set(item.themeTags||[])].filter(tag=>d.lenses?.[tag]);
  for(const tag of relevant){
   const block=add(art,'div','report-cross-topic-lens');
   add(block,'h5','',label(d,tag));
   const questions=add(block,'div','report-cross-two-sides');
   const a=add(questions,'div','report-cross-side');add(a,'h6','','Intimate questionnaire');
   evidenceCell(a,evidenceFor(direct,tag),'direct');
   const b=add(questions,'div','report-cross-side');add(b,'h6','','Everyday psychology');
   evidenceCell(b,evidenceFor(psych,tag),'psych');
   add(block,'p','report-cross-interpret','Reflection: '+(d.lenses[tag].detail||'Consider whether this theme feels relevant in your own words.'));
   const neighbors=confirmed.filter(other=>other.id!==item.id&&(other.themeTags||[]).includes(tag));
   if(neighbors.length)add(block,'p','report-cross-neighbor','Other selected topics sharing this theme: '+neighbors.map(x=>x.name).slice(0,8).join(' · '));
  }
  if(!relevant.length)add(art,'p','report-muted','No shared coded theme was identified for this named interest.');
 }
 const caution=add(sec,'p','report-cross-caution','Read this as a map of your answers, not a map of hidden desires. Explicit boundaries and fantasy-only choices take priority; they never become inferred real-world intentions. The psychology quiz is not a second independent measure of intimate preference.');
 return sec;
}
// The readable PDF keeps every original questionnaire answer in its appendices,
// but does not print the same evidence dozens of times in multiple themed maps.
// Expanded evidence remains available through the full-detail report choice.
function compactReport(root){
 if(!root||root.dataset.readableReport==='true')return root;
 root.dataset.readableReport='true';
 // The interest profiles below already contain dedicated, source-linked analysis.
 // Reprinting the cross-map once per theme for every interest adds enormous duplication.
 const duplicated=root.querySelector('.report-deep-connections .report-cross-topics');
 if(duplicated)duplicated.remove();
 root.querySelectorAll('.report-cross-more').forEach(detail=>detail.remove());
 const pairs=[...root.querySelectorAll('.report-cross-pair-table tbody tr')];
 for(const row of pairs.slice(12))row.remove();
 const sections=[...root.querySelectorAll('section.report-section')];
 const activities=sections.find(el=>el.querySelector('h2')?.textContent.startsWith('Your selected activities and how they intersect'));
 if(activities){
  const answers=[...activities.querySelectorAll('article.report-answer')];
  for(const card of answers.slice(5))card.remove();
  if(answers.length>5){
   const note=make('p','report-muted','Showing five representative selections here to prevent repetition. All original question responses remain in Appendices A and B.');
   activities.append(note);
  }
 }
 const interests=sections.find(el=>el.querySelector('h2')?.textContent.startsWith('04 ·'));
 if(interests){
  const profiles=[...interests.querySelectorAll('article.report-interest')];
  const extra=profiles.slice(8);
  // One readable, answer-linked profile instead of repeating an entire
  // multi-page chapter for each interest. Full evidence is still in the
  // separately available expanded edition and original-answer appendices.
  for(const original of profiles.slice(0,8)){
   const card=make('article','report-interest report-interest-readable');
   const title=original.querySelector('h3')?.textContent||'Selected interest';
   add(card,'p','report-kicker','PERSONAL INTEREST · READABLE PROFILE');
   add(card,'h3','',title);
   const status=original.querySelector('.report-status')?.textContent;
   if(status)add(card,'p','report-status',status);
   const lead=original.querySelector('.report-lead')?.textContent;
   if(lead)add(card,'p','',lead);
   const sections=[...original.querySelectorAll(':scope > h4')];
   const following=label=>sections.find(x=>x.textContent.includes(label))?.nextElementSibling?.textContent||'';
   const reason=following('What the results actually indicate');
   const psychology=following('The psychology tied');
   if(reason)add(card,'p','',reason);
   if(psychology)add(card,'p','',psychology);
   const proof=[...original.querySelectorAll('.report-evidence li')].slice(0,2);
   if(proof.length){
    add(card,'strong','','Examples from my actual answers');
    const list=add(card,'ul','report-evidence');
    for(const item of proof)add(list,'li','',item.textContent.trim().replace(/\s+/g,' ').slice(0,360));
   }
   const script=original.querySelector('.report-script')?.textContent;
   if(script)add(card,'p','report-script',script);
   add(card,'p','report-muted','For further evidence, original answers and personal notes, see the appendices or select the expanded report. Curiosity and fantasy are not consent.');
   original.replaceWith(card);
  }
  for(const item of extra)item.remove();
  for(const cluster of interests.querySelectorAll('.report-cluster'))if(!cluster.querySelector('article.report-interest'))cluster.remove();
  if(extra.length){
   const summary=make('div','report-readable-remaining');
   add(summary,'h3','','Other topics included in my results');
   add(summary,'p','report-muted','These topics remain recorded in my selected-interest overview and original answers. The expanded report offers an individual deep-dive for every topic.');
   const list=add(summary,'ul','');
   for(const item of extra){
    const title=item.querySelector('h3')?.textContent||'Selected topic';
    add(list,'li','',title);
   }
   interests.append(summary);
  }
 }
 const note=make('p','report-muted','READABLE EDITION · Prioritizes practical insights and key supporting examples. Full questionnaire responses remain in the appendices; an expanded evidence edition is available separately.');
 const first=root.querySelector('.report-visual-dashboard');
 if(first)first.prepend(note);else root.prepend(note);
 return root;
}
function enhancePersonal(root,d){
 if(!root||root.querySelector('.report-deep-connections')||!d)return root;
 const child=build(d);
 const overview=[...root.children].find(el=>el.matches?.('section')&&el.querySelector('h2')?.textContent.startsWith('01'));
 if(overview?.nextSibling)root.insertBefore(child,overview.nextSibling);
 else root.append(child);
 return root;
}
window.UnwrappedReportConnections=Object.freeze({build,enhancePersonal,compactReport});
})();