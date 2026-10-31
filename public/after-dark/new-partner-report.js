/* The Other Drawer — getting to know me, for a new partner.
 * Locally drafted and printed. Nothing is uploaded or shared automatically.
 * Psychology evidence and sexual topics require separate item-by-item opt-in. */
(()=>{'use strict';
const KEY='otherdrawer_new_partner_profile_v1';
const $=id=>document.getElementById(id);
const make=(tag,str,cls)=>{const x=document.createElement(tag);if(str!==undefined)x.textContent=String(str);if(cls)x.className=cls;return x;};
const add=(node,tag,str,cls)=>{const x=make(tag,str,cls);node.append(x);return x};
const btn=(label,cb,cls='btn')=>{const b=make('button',label,cls);b.type='button';b.addEventListener('click',cb);return b;};
const fields=[
 ['introduction','Who I am beyond first impressions','What would you like a new partner to understand about your personality, your world, or what matters most to you?'],
 ['everyday','A good ordinary day together','How do you like to spend time, socialize, recharge, and share a quiet evening?'],
 ['communication','How I like to communicate','What helps you feel heard? How direct is best? What do you prefer when something is unclear?'],
 ['care','What makes me feel appreciated','Kind gestures, time together, helpful actions, reassurance, affection, humor, or something specific.'],
 ['stress','When life gets overwhelming','What helps? Space, reassurance, a practical solution, a slower conversation?'],
 ['boundaries','My everyday boundaries and needs','Personal space, schedules, privacy, pacing, limits, accessibility or sensory preferences.'],
 ['relationship','What I hope for in a relationship','What does a mutually supportive and enjoyable relationship look like to you?'],
 ['fun','My quirks, favorite things, and little joys','Music, food, hobbies, unexpected habits, favorite experiences or a story that sums you up.']
];
const sexFields=[
 ['intimacy','What connection and intimacy mean to me','In your own words: the emotional qualities of intimacy you enjoy.'],
 ['fantasy','Things I prefer to keep as fantasy','Optional. You control whether to include this.'],
 ['comfort','My intimate boundaries and pace','How would you like to discuss comfort, consent, or what is off limits?'],
 ['talk','How I like to talk about intimacy','What is a good way for a new partner to ask a question or check in?']
];
let draft={};try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&typeof x==='object'&&!Array.isArray(x))draft=x}catch{}
const selectedPsych=new Set(),selectedSex=new Set();
let showPsych=false,showSex=false,panel=null,preview=null,message=null;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(draft))}catch{if(message)message.textContent='Local storage is full. Copy your text somewhere safe.'}}
function summaryData(){return window.AfterDarkCanonicalReport?.buildData?.()||null;}
function selectedQuestions(data){return(data?.psych?.questions||[]).filter(q=>q.selected?.length).map(q=>({
 id:'p'+q.number,heading:q.question,answer:q.selected.map(x=>x.text).join(' / ').slice(0,320),axes:[...new Set(q.selected.flatMap(x=>x.axes))],number:q.number
 }));}
function sexualInterests(data){
 const chosen=new Map();
 const topics=window.AfterDarkNotebookBridge?.getTopics?.()||[];
 const marks=window.AfterDarkNotebookBridge?.getChoices?.()||{};
 for(const t of topics){if(marks[t.id]==='yes'||marks[t.id]==='maybe')chosen.set(String(t.id),{
 id:'s'+t.id,title:t.name,label:marks[t.id]==='yes'?'I marked Interested':'I marked Curious',description:t.description||''
 });}
 for(const t of data?.interests||[]){
  if(!t.directSelection&&!t.specificSelected)continue;
  const id='s'+t.id;
  if(chosen.has(id.slice(1)))continue;
  chosen.set(id.slice(1),{id,title:t.name,
   label:t.directSelection===2?'I marked Interested':t.directSelection===1?'I marked Curious':'I chose this in my direct quiz',
   description:t.description||''});
 }
 return[...chosen.values()].sort((a,b)=>a.title.localeCompare(b.title));
}
function choiceList(parent,items,which){
 parent.replaceChildren();
 if(!items.length){add(parent,'p','Complete the corresponding quiz or mark interests in the Curiosity Cabinet to see choices here.','new-partner-muted');return;}
 for(const item of items){
  const line=make('label',undefined,'new-partner-choice');
  const input=document.createElement('input');input.type='checkbox';input.checked=which.has(item.id);
  input.addEventListener('change',()=>{if(input.checked)which.add(item.id);else which.delete(item.id);if(preview)preview.hidden=true;});
  const label=make('span');add(label,'strong',item.title||item.heading);
  add(label,'small',item.label||item.answer);
  line.append(input,label);parent.append(line);
 }
}
function draftField(section,id,title,placeholder){
 const label=make('label',undefined,'new-partner-field');label.setAttribute('for','new-partner-'+id);
 add(label,'span',title);
 const area=document.createElement('textarea');area.id='new-partner-'+id;area.maxLength=900;
 area.rows=3;area.placeholder=placeholder;area.value=String(draft[id]||'').slice(0,900);
 area.addEventListener('input',()=>{draft[id]=area.value;persist();if(preview)preview.hidden=true;});
 label.append(area);section.append(label);
}
function content(){
 const data=summaryData(),root=make('div',undefined,'partner-pdf-report new-partner-report');
 const cover=make('header',undefined,'partner-report-cover new-partner-cover');
 add(cover,'p','THE OTHER DRAWER · A PERSONAL INTRODUCTION','partner-report-eyebrow');
 add(cover,'h1','Getting to know me.');
 add(cover,'p','The person, the little things, and what connection looks like to me.','partner-report-subtitle');
 const intro=draft.introduction?.trim();
 add(cover,'p',intro||'A few things I chose to share about myself, in my own words.');
 add(cover,'p','This is an invitation to get to know me, not a test or a request for agreement.','partner-pdf-muted');
 root.append(cover);
 let included=0;
 const section=(title,subtitle)=>{
  const s=make('section',undefined,'partner-report-section');add(s,'h2',title);
  if(subtitle)add(s,'p',subtitle,'partner-pdf-muted');root.append(s);return s;
 };
 const everyday=section('01 · The person you are getting to know','Everyday life, communication, connection, and the details I want to share.');
 for(const [id,title] of fields.filter(x=>x[0]!=='introduction')){
  const v=String(draft[id]||'').trim().slice(0,900);if(!v)continue;
  const c=make('article',undefined,'partner-report-card');add(c,'h3',title);add(c,'p',v);everyday.append(c);included++;
 }
 if(!included)add(everyday,'p','I have not added my own everyday reflections yet.','partner-pdf-muted');
 if(showPsych&&selectedPsych.size){
  const psy=section('02 · Some everyday answers I chose to show you','Actual responses I selected in the nonsexual Psychology Quiz. These are reflections, not a personality diagnosis.');
  for(const q of selectedQuestions(data).filter(x=>selectedPsych.has(x.id))){
   const c=make('article',undefined,'partner-report-card');
   add(c,'h3',q.heading);add(c,'p',q.answer);psy.append(c);included++;
  }
 }
 if(showSex){
  const selected=sexualInterests(data).filter(x=>selectedSex.has(x.id));
  const anyWritten=sexFields.some(([id])=>String(draft['sex-'+id]||'').trim());
  if(selected.length||anyWritten){
   const sex=section('03 · Intimacy and what I choose to share','Only interests I specifically selected for this copy, plus my own words. Curiosity and fantasy are not consent or plans.');
   for(const [id,title] of sexFields){
    const v=String(draft['sex-'+id]||'').trim().slice(0,900);if(!v)continue;
    const c=make('article',undefined,'partner-report-card');add(c,'h3',title);add(c,'p',v);sex.append(c);included++;
   }
   for(const x of selected){const c=make('article',undefined,'partner-report-card');
    add(c,'p',x.label,'partner-report-status');add(c,'h3',x.title);if(x.description)add(c,'p',x.description);sex.append(c);included++;}
  }
 }
 const conversation=section('A conversation we could have','Suggested questions, not assumptions.');
 const prompts=[
  'What kinds of little gestures help you feel cared for?',
  'How do we each like to handle a misunderstanding or request for space?',
  'What is something you love that another person might not immediately guess?',
  'What are the boundaries and privacy expectations we should respect?',
  'What would a relaxed, enjoyable day together look like?',
 ];
 if(showSex&&(selectedSex.size||sexFields.some(([id])=>String(draft['sex-'+id]||'').trim())))
  prompts.push('Is there anything about intimacy you would like to discuss, leave as fantasy, or keep private?');
 const ul=make('ul',undefined,'partner-report-list');for(const q of prompts)add(ul,'li',q);conversation.append(ul);
 add(root,'footer','Prepared locally on this device. No questionnaire notes or sexual answers were automatically included. Review the finished copy before sharing.','report-footer');
 if(!included&&!intro)throw Error('Write something about yourself or explicitly choose a quiz answer before creating the partner report.');
 return root;
}
function doPreview(){
 try{preview.replaceChildren(content());preview.hidden=false;message.textContent='Preview ready. Review everything before sharing.'}
 catch(e){message.textContent=e.message;preview.hidden=true}
}
function print(){
 try{
  const report=content();
  let doc=$('print-document');if(!doc){doc=make('div');doc.id='print-document';document.body.append(doc);}
  doc.replaceChildren(report);
  document.body.classList.add('print-notebook','print-detailed-report','print-partner-report');
  message.textContent='Use your browser’s Print menu to save this preview as a PDF.';
  requestAnimationFrame(()=>window.print());
 }catch(e){message.textContent=e.message;}
}
function mount(){
 const host=$('new-partner-report');if(!host||host.dataset.ready)return;
 host.dataset.ready='yes';
 panel=make('div',undefined,'new-partner-editor');
 add(panel,'span','INTRODUCTIONS · BUILD YOUR OWN','eyebrow');
 add(panel,'h2','Getting to know me.');
 add(panel,'p','Create a private introduction for a new partner that covers who you are outside the bedroom first. Add intimate details only if you want to. Nothing is sent or shared automatically.','new-partner-lead');
 const about=make('div',undefined,'new-partner-fields');
 for(const [id,title,placeholder] of fields)draftField(about,id,title,placeholder);panel.append(about);
 const psy=make('details',undefined,'new-partner-options');add(psy,'summary','Include selected nonsexual quiz answers (optional)');
 const togglePsych=make('label',undefined,'new-partner-toggle');
 const pc=document.createElement('input');pc.type='checkbox';pc.checked=false;
 pc.addEventListener('change',()=>{showPsych=pc.checked;if(preview)preview.hidden=true;});
 togglePsych.append(pc,make('span','Yes, I want to include the individual answers I check below'));psy.append(togglePsych);
 add(psy,'p','Uncheck anything you prefer not to disclose. No quiz answer or private note is included by default.','new-partner-muted');
 const ps=make('div',undefined,'new-partner-choices');psy.append(ps);
 panel.append(psy);
 const sexual=make('details',undefined,'new-partner-options');add(sexual,'summary','Add an intimate / sexual introduction (optional)');
 const toggleSex=make('label',undefined,'new-partner-toggle');
 const sc=document.createElement('input');sc.type='checkbox';sc.checked=false;
 sc.addEventListener('change',()=>{showSex=sc.checked;if(preview)preview.hidden=true;});
 toggleSex.append(sc,make('span','Yes, include sexual details I explicitly write or select'));sexual.append(toggleSex);
 add(sexual,'p','Sexual interests are never included unless this switch is on and you choose individual interests below. Unconfirmed recommendations and Not for me topics are never shared.','new-partner-muted');
 const sexualNotes=make('div',undefined,'new-partner-fields');
 for(const [id,title,placeholder] of sexFields)draftField(sexualNotes,'sex-'+id,title,placeholder);
 sexual.append(sexualNotes);
 const st=make('div',undefined,'new-partner-choices');sexual.append(st);panel.append(sexual);
 const actions=make('div',undefined,'new-partner-actions');
 actions.append(btn('Preview this introduction',doPreview,'btn alt'));
 actions.append(btn('Save the introduction as PDF',print,'btn'));
 actions.append(btn('Refresh quiz choices',()=>{choiceList(ps,selectedQuestions(summaryData()),selectedPsych);
 choiceList(st,sexualInterests(summaryData()),selectedSex);message.textContent='Available quiz choices refreshed.'},'btn alt'));
 panel.append(actions);
 message=make('p','Your writing autosaves on this device. Quiz disclosures start turned off every time.','new-partner-status');
 message.setAttribute('role','status');panel.append(message);
 preview=make('div',undefined,'new-partner-preview');preview.hidden=true;panel.append(preview);
 host.append(panel);
 const refreshChoices=()=>{
  choiceList(ps,selectedQuestions(summaryData()),selectedPsych);
  choiceList(st,sexualInterests(summaryData()),selectedSex);
 };
 refreshChoices();
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-tab="notebook"],[data-new-partner]'))setTimeout(refreshChoices,70);
 });
 document.querySelectorAll('[data-new-partner]').forEach(button=>button.addEventListener('click',()=>{
  requestAnimationFrame(()=>requestAnimationFrame(()=>host.scrollIntoView({block:'start',behavior:'smooth'})));
 }));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.AfterDarkNewPartnerReport=Object.freeze({mount,build:content,preview:doPreview,exportPDF:print,sexualChoices:()=>sexualInterests(summaryData()).map(x=>x.title)});
})();