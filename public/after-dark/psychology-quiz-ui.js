/* Companion self-reflection quiz for After Dark.
   The 32 non-explicit questions share option-by-option themes with the companion
   32-question sexual-preferences quiz. Answers stay on this device.
   Both result pages call ONE shared ranking function; no contradictory reports. */
(() => {
 'use strict';
 const questions=window.AfterDarkPsychologyQuiz||[],key='afterdark_psychology_quiz_v1';
 const $=id=>document.getElementById(id);
 let position=-1,answers={},notes={};
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function load(){
  try{
   const v=JSON.parse(localStorage.getItem(key)||'null');
   if(v&&typeof v==='object'){
    answers=v.answers&&typeof v.answers==='object'?v.answers:{};
    notes=v.notes&&typeof v.notes==='object'?v.notes:{};
    if(Number.isInteger(v.position)&&v.position>=0&&v.position<=32)position=v.position;
   }
  }catch{}
 }
 function save(){try{localStorage.setItem(key,JSON.stringify({answers,notes,position}));}catch{}}
 function state(){
  const axes={};let answered=0;
  for(let i=0;i<questions.length;i++){
   const choices=Array.isArray(answers[i])?[...new Set(answers[i].filter(n=>Number.isInteger(n)&&n>=0&&n<questions[i].options.length))]:[];
   if(choices.length||(notes[i]||'').trim())answered++;
   for(const n of choices){
    for(const tag of questions[i].options[n].axes.split(' '))
     axes[tag]=(axes[tag]||0)+1/Math.sqrt(choices.length);
   }
  }
  return {answered,complete:position>=questions.length,axes,answers,notes,
   questions:questions.length,selectedOptions:Object.values(answers).reduce((sum,arr)=>sum+(Array.isArray(arr)?arr.length:0),0)};
 }
 function render(){
  const box=$('psychQuizCard');if(!box)return;
  box.replaceChildren();
  if(questions.length!==32){box.append(el('p','The reflective questions could not load. Refresh this page.'));return;}
  if(position===32){
   if(window.AfterDarkSharedQuizResults)window.AfterDarkSharedQuizResults('psychQuizCard');
   return;
  }
  if(position<0){
   box.append(el('span','NON-EXPLICIT · 32 QUESTIONS','eyebrow'),
    el('h3','Discover the themes behind your preferences'),
    el('p','This companion asks about everyday choices, attention, imagination, anticipation and trust. It does not ask about sexual acts, and cannot predict them. Your answers combine with the Sexual Preferences Quiz in one ranked interest shelf.'));
   const start=el('button','Start the psychology quiz →','btn');
   start.onclick=()=>{position=0;save();render()};box.append(start);return;
  }
  const q=questions[position],selected=new Set(Array.isArray(answers[position])?answers[position]:[]);
  box.append(el('span','REFLECTIVE QUESTION '+(position+1)+' OF 32 · '+state().answered+' ANSWERED','eyebrow'));
  const bar=el('div',undefined,'bar'),fill=el('div',undefined,'quiz-progress-fill');fill.style.width=(position/32*100)+'%';bar.append(fill);
  box.append(bar,el('h3',q.q),el('p','Select all that apply. You can revise any answer and your progress saves privately.','quiz-help'));
  const options=el('div',undefined,'quizOpts quiz-multi');
  q.options.forEach((choice,i)=>{
   const label=el('label',undefined,'quiz-multi-option'+(selected.has(i)?' selected':'')),input=el('input');
   input.type='checkbox';input.checked=selected.has(i);input.setAttribute('aria-label',choice.text);
   input.onchange=()=>{
    const exclusive=t=>/\b(neither|none|nothing|don't|no preferred|not interested|rather skip)\b/i.test(t);
    if(input.checked){
     if(exclusive(choice.text))selected.clear();
     else for(const n of [...selected])if(exclusive(q.options[n].text))selected.delete(n);
     selected.add(i);
    }else selected.delete(i);
    answers[position]=[...selected];save();render();
   };
   label.append(input,document.createTextNode(choice.text));options.append(label);
  });
  box.append(options);
  if(q.freeText){
   const area=el('textarea');area.rows=3;area.maxLength=600;
   area.setAttribute('aria-label','Optional private reflection note');
   area.placeholder='Optional: What does this reveal about your preferences or boundaries?';
   area.value=notes[position]||'';
   area.oninput=()=>{notes[position]=area.value;save()};
   box.append(area);
  }
  const nav=el('div',undefined,'quiz-nav-actions');
  const back=el('button','← Back','btn alt');back.disabled=position===0;
  back.onclick=()=>{position--;save();render()};
  const skip=el('button','Skip','btn alt');skip.onclick=()=>{answers[position]=[];delete notes[position];position++;save();render()};
  const next=el('button',position===31?'View shared interest shelf →':'Save & next →','btn');
  next.onclick=()=>{position++;save();render()};
  nav.append(back,skip,next);box.append(nav);
  const early=el('button','View shared results with my answers so far','quiz-secondary-link');
  early.onclick=()=>{position=32;save();render()};
  box.append(early);
 }
 function open(){document.querySelector('[data-tab="psych-quiz"]')?.click();render()}
 function restart(){position=0;answers={};notes={};save();render()}
 function revise(){position=0;save();render()}
 load();
 window.AfterDarkPsychQuizBridge=Object.freeze({getProgress:state,render,open,revise,restart});
 document.querySelectorAll('[data-tab="psych-quiz"],[data-goto="psych-quiz"]').forEach(b=>b.addEventListener('click',render));
 if(location.hash==='#psych-quiz')render();
})();