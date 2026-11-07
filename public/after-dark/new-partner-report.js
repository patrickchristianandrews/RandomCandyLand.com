/* Unwrapped — quiz-derived new-partner introduction.\n * No additional profile fields; only disclosure choices are editable.\n * Nothing is uploaded or shared automatically. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const make=(tag,str,cls)=>{const x=document.createElement(tag);if(str!==undefined)x.textContent=String(str);if(cls)x.className=cls;return x};
const add=(node,tag,str,cls)=>{const x=make(tag,str,cls);node.append(x);return x};
const btn=(label,cb,cls='btn')=>{const b=make('button',label,cls);b.type='button';b.addEventListener('click',cb);return b};
const selectedPsych=new Set(),selectedSex=new Set(),knownPsych=new Set();
let showPsych=true,showSex=false,showToys=false,panel=null,preview=null,message=null;
function summaryData(){return window.AfterDarkCanonicalReport?.buildData?.()||null;}
function selectedQuestions(data){return(data?.psych?.questions||[]).filter(q=>q.selected?.length).map(q=>({
 id:'p'+q.number,heading:q.question,answer:q.selected.map(x=>x.text).join(' / ').slice(0,320),axes:[...new Set(q.selected.flatMap(x=>x.axes))],number:q.number
 }));}
function sexualInterests(data){
 // Only preferences explicitly named by the direct quiz may appear as optional partner disclosures.
 // A separate Curiosity Cabinet mark is never treated as a quiz answer.
 return(data?.interests||[]).filter(t=>t.specificSelected&&!t.warn).map(t=>({
  id:'s'+t.id,title:t.name,
  label:'Named in my sexual preferences quiz',
  description:t.description||''
 })).sort((a,b)=>a.title.localeCompare(b.title));
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
function content(){
 const data=summaryData(),root=make('div',undefined,'partner-pdf-report new-partner-report');
 const cover=make('header',undefined,'partner-report-cover new-partner-cover');
 add(cover,'p','UNWRAPPED · GETTING TO KNOW THE PERSON','partner-report-eyebrow');
 add(cover,'h1','Getting to know me.');
 add(cover,'p','The person, the little things, and what connection looks like to me.','partner-report-subtitle');
 const answered=selectedQuestions(data).filter(x=>showPsych&&selectedPsych.has(x.id));
 const intro=answered.length
  ? 'My psychology quiz responses suggest some starting points for understanding how I think, connect and communicate.'
  : 'This introduction is generated entirely from the quiz answers I chose to share.';
 add(cover,'p',intro);
 add(cover,'p','This is an invitation to get to know me, not a test or a request for agreement.','partner-pdf-muted');
 root.append(cover);
 let included=0;
 const section=(title,subtitle)=>{
  const s=make('section',undefined,'partner-report-section');add(s,'h2',title);
  if(subtitle)add(s,'p',subtitle,'partner-pdf-muted');root.append(s);return s;
 };
 const everyday=section('01 · My answers at a glance','A brief introduction based on actual nonsexual quiz answers, not an additional profile or a personality diagnosis.');
 const highlights=selectedQuestions(data).filter(x=>selectedPsych.has(x.id)).slice(0,5);
 for(const q of highlights){
  const card=make('article',undefined,'partner-report-card');
  add(card,'h3',q.heading);
  add(card,'p','My answer: '+q.answer);
  const themes=q.axes.filter(x=>data?.lenses?.[x]?.label).slice(0,2).map(x=>data.lenses[x].label);
  if(themes.length)add(card,'p','A possible conversation connection: '+themes.join(' and ')+'. These themes are exploratory, not certain descriptions of me.','partner-pdf-muted');
  everyday.append(card);included++;
 }
 if(!highlights.length)add(everyday,'p','I have not chosen a psychology answer to include in this copy.','partner-pdf-muted');
 if(showPsych&&selectedPsych.size){
  const psy=section('02 · Some everyday answers I chose to show you','Actual responses I selected in the nonsexual Psychology Quiz. These are reflections, not a personality diagnosis.');
  const permitted=selectedQuestions(data).filter(x=>selectedPsych.has(x.id));
  for(const q of permitted){
   const c=make('article',undefined,'partner-report-card');
   add(c,'h3',q.heading);add(c,'p',q.answer);psy.append(c);included++;
  }
  // Non-intimate suggestions use only specific psychology answers selected for sharing.
  // Neither private intimate answers nor unselected psychology responses are read.
  const scripts={
   trust:'Could we make our expectations clear and allow either person to change their mind?',
   attachment:'When one of us needs closeness or quiet time, how can we reconnect afterward?',
   affirmation:'What kind of specific appreciation helps each of us feel noticed?',
   anticipation:'Would we prefer planning ahead or choosing together in the moment?',
   sensation:'Would changing the environment help us talk and relax more comfortably?',
   control:'Do we like taking turns deciding, choosing together or delegating sometimes?',
   novelty:'What small new experience feels fun while keeping important things familiar?',
   narrative:'Can we share hypothetical ideas as stories without treating them as requests?',
   aesthetics:'What kind of atmosphere or style helps us feel at home together?',
   ritual:'Would a small repeated gesture feel meaningful without becoming obligatory?'
  };
  const tags=[...new Set(permitted.flatMap(q=>q.axes))].filter(k=>scripts[k]).slice(0,4);
  if(tags.length){
   const insight=make('article',undefined,'partner-report-card');
   add(insight,'h3','How to talk about these everyday patterns');
   add(insight,'p','These conversation ideas use only the individual answers I chose to share. They are not a diagnosis, or a disclosure of any unselected preferences.');
   for(const tag of tags){
    const witness=permitted.find(q=>q.axes.includes(tag));
    const card=make('div',undefined,'new-partner-conversation-topic');
    add(card,'strong',(data?.lenses?.[tag]?.label||tag)+' · psychology Q'+witness.number);
    add(card,'p','My answer: '+witness.answer);
    add(card,'p','Conversation starter: '+scripts[tag]);
    insight.append(card);
   }
   psy.append(insight);included++;
  }
 }
 if(showSex){
  const selected=sexualInterests(data).filter(x=>selectedSex.has(x.id));
  if(selected.length){
   const sex=section('03 · Intimacy and what I choose to share','Only interests I specifically selected from the quiz. Curiosity and fantasy are not consent or plans.');
   for(const x of selected){const c=make('article',undefined,'partner-report-card');
    add(c,'p',x.label,'partner-report-status');add(c,'h3',x.title);if(x.description)add(c,'p',x.description);sex.append(c);included++;}
  }
  // A SECOND opt-in beyond the broader intimate-content switch.
  // A general sexual disclosure cannot silently reveal toy suggestions.
  if(showToys){
   const toyIdeas=window.UnwrappedToyLibrary?.recommend?.(data)||[];
   if(toyIdeas.length){
    const toys=section('03A · Specific toy topics I elected to share',
     'Only directly supported interests appear, with anatomy-specific and partner-use guidance. Fantasy-only remains reading-only. This is not an invitation to use anything.');
    const fit=window.UnwrappedToyLibrary?.fitLabels||{};
    for(const item of toyIdeas){
     const c=make('article',undefined,'partner-report-card toy-report-rec');
     add(c,'p',item.mode,'partner-report-status');
     add(c,'h3',item.name);
     add(c,'p',item.why);
     if(item.evidence?.length)add(c,'p','Relevant quiz selection: '+item.evidence[0],'partner-pdf-muted');
     if(item.bodyUses){
      add(c,'p','Male anatomy: '+(fit[item.bodyUses.male.fit]||item.bodyUses.male.fit)+' — '+item.bodyUses.male.note,'partner-pdf-muted');
      add(c,'p','Female anatomy: '+(fit[item.bodyUses.female.fit]||item.bodyUses.female.fit)+' — '+item.bodyUses.female.note,'partner-pdf-muted');
      add(c,'p','With a partner: '+item.bodyUses.together,'partner-pdf-muted');
     }
     add(c,'p','Safety and comfort: '+item.safety,'partner-pdf-muted');
     toys.append(c);included++;
    }
   }
  }
 }
 const conversation=section('A conversation we could have','Suggested questions, not assumptions.');
 const prompts=[
  'What kinds of little gestures help you feel cared for?',
  'How do we each like to handle a misunderstanding or request for space?',
  'What is something you love that another person might not immediately guess?',
  'What are the boundaries and privacy expectations we should respect?',
  'What would a relaxed, enjoyable day together look like?',
   'When is a sincere apology most helpful, and what comes after it?',
   'How do we each balance personal space with closeness?',
   'What is a small habit or sensory preference you would like me to know?',
 ];
 if(showSex&&selectedSex.size)
  prompts.push('Is there anything about intimacy you would like to discuss, leave as fantasy, or keep private?');
 const ul=make('ul',undefined,'partner-report-list');for(const q of prompts)add(ul,'li',q);conversation.append(ul);
 add(root,'footer','Created from selected quiz responses. Intimate topics and toy suggestions require separate permission. Review the finished report before sharing.','report-footer');
 if(window.AfterDarkReportQR?.create)root.append(window.AfterDarkReportQR.create());
 if(!included)throw Error('Complete a quiz and select at least one response to include. No separate writing is needed.');
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
 add(panel,'span','AUTOMATIC · QUIZ-BASED REPORT','eyebrow');
 add(panel,'h2','Getting to know me.');
 add(panel,'p','Your quiz answers create the introduction and conversation ideas automatically. No profile, essays, or extra report questions. Nothing is sent or shared without your action.','new-partner-lead');
 const psy=make('details',undefined,'new-partner-options');psy.open=true;
 add(psy,'summary','Everyday personality and communication · from the psychology quiz');
 const togglePsych=make('label',undefined,'new-partner-toggle');
 const pc=document.createElement('input');pc.type='checkbox';pc.checked=true;
 pc.addEventListener('change',()=>{showPsych=pc.checked;if(preview)preview.hidden=true;});
 togglePsych.append(pc,make('span','Include the nonsexual quiz answers I select below'));psy.append(togglePsych);
 add(psy,'p','Answers are preselected so the report is ready automatically. Uncheck anything you prefer not to share.','new-partner-muted');
 const ps=make('div',undefined,'new-partner-choices');psy.append(ps);panel.append(psy);
 const sexual=make('details',undefined,'new-partner-options');
 add(sexual,'summary','Optional · Include specific intimate quiz results');
 const toggleSex=make('label',undefined,'new-partner-toggle');
 const sc=document.createElement('input');sc.type='checkbox';sc.checked=false;
 sc.addEventListener('change',()=>{showSex=sc.checked;if(!showSex){showToys=false;toyChoice.checked=false}if(preview)preview.hidden=true;});
 toggleSex.append(sc,make('span','Include only intimate quiz interests I explicitly select below'));sexual.append(toggleSex);
 add(sexual,'p','OFF by default. Select specific interests to share; fantasy-only is never permission to act.','new-partner-muted');
 const st=make('div',undefined,'new-partner-choices');sexual.append(st);
 const toyDisclosure=make('div',undefined,'new-partner-toy-choice'),toyLabel=make('label',undefined,'new-partner-toggle');
 const toyChoice=document.createElement('input');toyChoice.type='checkbox';toyChoice.checked=false;toyChoice.id='new-partner-share-toys';
 toyChoice.addEventListener('change',()=>{
  if(toyChoice.checked&&!sc.checked){sc.checked=true;showSex=true}
  showToys=toyChoice.checked;if(preview)preview.hidden=true;
 });
 toyLabel.append(toyChoice,make('span','Separately include toy suggestions supported by directly selected quiz interests'));
 toyDisclosure.append(toyLabel);
 add(toyDisclosure,'p','OFF by default. Uses only directly selected quiz interests, with anatomy-specific and safety guidance.','new-partner-muted');
 sexual.append(toyDisclosure);panel.append(sexual);
 const actions=make('div',undefined,'new-partner-actions');
 actions.append(btn('Preview my automatic report',doPreview,'btn alt'),
  btn('Save my report as PDF',print,'btn'),
  btn('Refresh from quiz answers',()=>{refreshChoices();message.textContent='Responses refreshed from the quiz. No extra writing needed.'},'btn alt'));
 panel.append(actions);
 message=make('p','No manual report writing. Nonsexual responses preselected; intimate topics and toys off by default.','new-partner-status');
 message.setAttribute('role','status');panel.append(message);
 preview=make('div',undefined,'new-partner-preview');preview.hidden=true;panel.append(preview);host.append(panel);
 function refreshChoices(){
  const data=summaryData(),available=selectedQuestions(data);
  for(const q of available){if(!knownPsych.has(q.id)){selectedPsych.add(q.id);knownPsych.add(q.id)}}
  choiceList(ps,available,selectedPsych);
  choiceList(st,sexualInterests(data),selectedSex);
 }
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