/* A thoughtfully chosen partner PDF: no server, no automatic sharing. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const data=()=>window.AfterDarkCanonicalReport?.buildData?.();
const make=(tag,value,cls)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=String(value);if(cls)n.className=cls;return n};
const add=(to,tag,value,cls)=>{const n=make(tag,value,cls);to.append(n);return n};
const menu=[
 ['overview','The highlights','A quick look at my answers'],
 ['interests','Interests I picked','Topics I marked or specifically selected'],
 ['themes','The themes behind my answers','The patterns that stood out'],
 ['ideas','Other possibilities','Possible interests to read about'],
 ['connections','How the two quizzes connect','Themes shared between both quizzes'],
 ['conversations','Conversation starters','Conversation ideas and friendly prompts'],
 ['boundaries','My boundaries','Stated intentions and boundaries'],
 ['answers','My exact quiz answers','Selected options, without personal notes'],
 ['notes','My personal notes','Private written reflections, included only if checked']
];
const selected=new Set(['overview','interests','themes','conversations']);
let panel=null,previewArea=null,noteBox=null;
function section(root,title,description){
 const s=make('section',undefined,'partner-report-section');
 add(s,'h2',title);
 if(description)add(s,'p',description,'partner-pdf-muted');
 root.append(s);return s;
}
function bullets(root,items){
 const ul=make('ul',undefined,'partner-report-list');
 items.filter(Boolean).forEach(x=>add(ul,'li',x));
 root.append(ul);return ul;
}
function topic(root,title,label,description){
 const c=make('article',undefined,'partner-report-card');
 add(c,'p',label,'partner-report-status');
 add(c,'h3',title);
 if(description)add(c,'p',description);
 root.append(c);return c;
}
function identified(d){return(d.interests||[]).filter(x=>x.directSelection||x.specificSelected)}
function build(){
 const d=data();if(!d||(!d.direct?.answered&&!d.psych?.answered))throw Error('Answer at least one quiz question first.');
 if(!selected.size)throw Error('Choose at least one section to share.');
 const root=make('div',undefined,'afterdark-detailed-report report-editorial partner-pdf-report');
 const cover=make('header',undefined,'partner-report-cover');
 add(cover,'p','THE OTHER DRAWER · WHAT DESIRES REVEAL ABOUT US','partner-report-eyebrow');
 add(cover,'h1','Something I wanted to share');
 add(cover,'p','A conversation, not a checklist.','partner-report-subtitle');
 add(cover,'h2','Before you read');
 add(cover,'p','I chose these pages because they say something about what catches my attention. Some are interests I know; others are ideas I am still thinking about. I wanted you to have the context, not just the headlines.');
 add(cover,'p','No expectations attached. We can talk about whatever stands out, ask each other questions, or leave a topic right here.');
 const note=noteBox?.value?.trim();
 if(note){
  const c=make('div',undefined,'partner-report-personal-note');
  add(c,'strong','In my own words');
  add(c,'p',note.slice(0,900));cover.append(c);
 }
 add(cover,'p','This copy contains only the sections I chose to share.','partner-pdf-muted');
 root.append(cover);
 const toc=make('div',undefined,'partner-report-contents');
 add(toc,'h2','What’s inside');
 bullets(toc,menu.filter(x=>selected.has(x[0])).map(x=>x[1]));root.append(toc);
 if(selected.has('overview')){
  const s=section(root,'The highlights','A quick look at the questions I answered.');
  const stats=make('div',undefined,'partner-summary-tiles');
  for(const [value,label] of [[d.direct.answered+'/'+d.direct.questions.length,'Preferences answered'],[d.psych.answered+'/'+d.psych.questions.length,'Psychology answered'],[identified(d).length,'Interests I named']]){
   const c=make('div',undefined,'partner-summary-tile');add(c,'strong',value);add(c,'span',label);stats.append(c);
  }
  s.append(stats);add(s,'p','These results are a way of organizing my reflections, not a test of whether we are a good match.','partner-pdf-muted');
 }
 if(selected.has('interests')){
  const s=section(root,'Interests I picked','These are topics I marked or chose in my answers. Being curious does not always mean wanting to do something.');
  const groups=new Map();
  for(const item of identified(d)){
   if(!groups.has(item.category))groups.set(item.category,[]);
   groups.get(item.category).push(item);
  }
  if(!groups.size)add(s,'p','I have not named specific interests yet.');
  for(const [category,items] of groups){
   add(s,'h3',category,'partner-topic-group');
   for(const item of items){
    const label=item.directSelection===2?'Marked Interested':item.directSelection===1?'Marked Curious':'Something I picked in the quiz';
    topic(s,item.name,label,item.description);
   }
  }
 }
 if(selected.has('themes')){
  const s=section(root,'The themes behind my answers','These themes came up most often in my responses.');
  const values=Object.entries(d.axes?.combined||{}).filter(([k,v])=>v>0&&d.lenses?.[k]).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const max=values[0]?.[1]||1;
  for(const [key,value] of values){
   const line=make('div',undefined,'partner-theme-row');add(line,'strong',d.lenses[key].label);
   const track=make('div',undefined,'partner-theme-track'),fill=make('span',undefined,'partner-theme-bar');
   fill.style.width=Math.round(value/max*100)+'%';track.append(fill);line.append(track);
   add(line,'p',d.lenses[key].detail,'partner-pdf-muted');s.append(line);
  }
 }
 if(selected.has('ideas')){
  const s=section(root,'Other possibilities','These are reading suggestions inspired by the themes in my answers, not promises or conclusions about me.');
  const seen=new Set();
  const suggestions=(d.psychSuggestions||[]).concat((d.interests||[]).filter(x=>!x.directSelection&&!x.specificSelected));
  for(const item of suggestions){
   if(seen.size>=10)break;
   if(seen.has(item.name))continue;seen.add(item.name);
   const c=topic(s,item.name,'Just an idea',item.description);
   if(item.reasons?.length)add(c,'p','One connection: '+item.reasons[0].answer,'partner-pdf-muted');
  }
  if(!seen.size)add(s,'p','No extra reading ideas came up this time.');
 }
 if(selected.has('connections')){
  const s=section(root,'How the two quizzes connect');
  const a=d.axes?.direct||{},b=d.axes?.psych||{};
  const both=Object.keys(d.lenses||{}).filter(k=>a[k]>0&&b[k]>0).sort((x,y)=>(a[y]+b[y])-(a[x]+b[x])).slice(0,8);
  if(both.length){add(s,'p','Some themes showed up in both kinds of questions:');bullets(s,both.map(x=>d.lenses[x].label));}
  else add(s,'p','There are not enough overlapping answers yet for a helpful comparison.');
  add(s,'p','These are simply connections that might give us something interesting to talk about.','partner-pdf-muted');
 }
 if(selected.has('conversations')){
  const s=section(root,'Things we could chat about','There is nothing we have to decide after reading this.');
  // Avoid revealing named interests through conversation prompts when the interests section is excluded.
  const identifiedItems=selected.has('interests')?identified(d).slice(0,8):[];
  for(const x of identifiedItems){
   const c=topic(s,x.name,'A conversation starter');
   bullets(c,['What about this topic interests or puzzles us?', 'Would either of us prefer it to stay a fantasy or just an idea?']);
  }
  bullets(s,['What makes each of us feel comfortable and heard?','What topics would we rather skip?','How can we talk openly without pressure or assumptions?']);
 }
 if(selected.has('boundaries')){
  const s=section(root,'My boundaries','These are the boundaries and choices I decided to include.');
  const ids=new Set([19,20,28,56,61,68]);let count=0;
  for(const q of d.direct.questions||[]){
   if(!q.selected?.length)continue;
   const explicit=ids.has(q.coreId),intent=q.intentLabel&&q.intentLabel!=='Not specified';
   if(!explicit&&!intent)continue;
   const c=topic(s,'Q'+q.number+' · '+q.question,'My answer');
   bullets(c,[...(explicit?q.selected.map(x=>x.text):[]),...(intent?[q.intentLabel]:[])]);
   count++;
  }
  if(!count)add(s,'p','I have not written down any specific comfort-zone answers yet.');
 }
 if(selected.has('answers')){
  const s=section(root,'My selected quiz answers','Only the choices I selected are shown here; no private notes are included.');
  for(const [label,part] of [['Preferences',d.direct],['Psychology',d.psych]]){
   const answered=(part.questions||[]).filter(q=>q.selected?.length);
   if(!answered.length)continue;
   add(s,'h3',label,'partner-topic-group');
   for(const q of answered){
    const c=topic(s,'Q'+q.number+' · '+q.question,'My selected choices');
    bullets(c,q.selected.map(x=>x.text));
   }
  }
 }
 if(selected.has('notes')){
  const s=section(root,'My own words','I specifically chose to include my personal written notes in this report.');
  let count=0;
  for(const [label,part] of [['Preferences',d.direct],['Psychology',d.psych]]){
   for(const q of part.questions||[]){
    if(!q.note?.trim())continue;
    const c=topic(s,label+' Q'+q.number+' · '+q.question,'A private note I chose to share');
    add(c,'p',q.note.slice(0,600));count++;
   }
  }
  for(const item of d.direct.personalIdeas||[]){
   const c=topic(s,item.text,'Something I wrote myself');
   add(c,'p','How I described it: '+item.intentLabel);count++;
  }
  if(!count)add(s,'p','I have not written any notes yet.');
 }
 if(window.AfterDarkReportQR?.create)root.append(window.AfterDarkReportQR.create());
 return root;
}
function renderPreview(){
 if(!previewArea)return;
 previewArea.replaceChildren();
 try{previewArea.append(build());previewArea.hidden=false;}
 catch(err){add(previewArea,'p',err.message,'partner-pdf-muted');previewArea.hidden=false}
}
function print(){
 try{
  const report=build();
  let documentRoot=$('print-document');
  if(!documentRoot){documentRoot=make('div');documentRoot.id='print-document';document.body.append(documentRoot);}
  documentRoot.replaceChildren(report);
  document.body.classList.add('print-notebook','print-detailed-report','print-partner-report');
  requestAnimationFrame(()=>window.print());
 }catch(err){const status=$('partner-pdf-status');if(status)status.textContent=err.message}
}
function mount(parent){
 if(!parent||parent.querySelector('.partner-pdf-chooser'))return;
 panel=make('section',undefined,'partner-pdf-chooser');
 add(panel,'span','A COPY FOR YOUR PARTNER','eyebrow');
 add(panel,'h3','Choose what they get to see.');
 add(panel,'p','Choose the sections you want someone to read. Private answers and personal notes stay out unless you include them.');
 const disclosure=make('details',undefined,'partner-pdf-options');
 const summary=make('summary','Choose sections for my partner’s PDF');
 disclosure.append(summary);
 const options=make('div',undefined,'partner-pdf-option-list');
 for(const [id,title,description] of menu){
  const label=make('label',undefined,'partner-pdf-option');
  const input=make('input');input.type='checkbox';input.value=id;input.checked=selected.has(id);
  input.onchange=()=>{if(input.checked)selected.add(id);else selected.delete(id);counter.textContent=selected.size+' sections selected'};
  const text=make('span');add(text,'strong',title);add(text,'small',description);
  label.append(input,text);options.append(label);
 }
 disclosure.append(options);panel.append(disclosure);
 const counter=make('p',selected.size+' sections selected','partner-pdf-count');panel.append(counter);
 add(panel,'label','Add your own note (optional)','partner-pdf-note-label');
 noteBox=make('textarea');noteBox.rows=2;noteBox.maxLength=900;
 noteBox.placeholder='Anything you want to say in your own words…';
 noteBox.setAttribute('aria-label','Optional note at the beginning of your partner report');panel.append(noteBox);
 const actions=make('div',undefined,'partner-pdf-actions');
 const preview=make('button','👀 Preview their PDF','btn alt');preview.type='button';preview.onclick=renderPreview;
 const printButton=make('button','📄 Save partner PDF','btn');printButton.type='button';printButton.onclick=print;
 actions.append(preview,printButton);panel.append(actions);
 const status=make('p',undefined,'partner-pdf-status');status.id='partner-pdf-status';status.setAttribute('role','status');panel.append(status);
 previewArea=make('div',undefined,'partner-pdf-preview');previewArea.hidden=true;panel.append(previewArea);
 parent.append(panel);
}
window.addEventListener('afterprint',()=>document.body.classList.remove('print-partner-report'));
window.AfterDarkPartnerPDF=Object.freeze({mount,build,print,menu:menu.map(x=>x.slice(0,2))});
})();