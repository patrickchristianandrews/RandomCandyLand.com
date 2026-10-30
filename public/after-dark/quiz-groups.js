/* One Sexual Preferences Quiz, organized into focused thematic groups.
 * Each of the 62 individual question IDs remains separately answerable,
 * exportable and reportable. Group navigation is only presentation.
 */
(()=>{
'use strict';
const groupPlan=[["Connection & initiation",[1,2,4,6]],["Sounds & voices",[3,7,43,44]],["Fantasy & communication",[15,17,50,27,47]],["Orgasm & anticipation",[5,38,18,25,37]],["Sensations & intensity",[10,35,51]],["Body areas & touch",[31,33,34]],["Giving, receiving & activities",[13,41,42,16,40]],["Toys, aesthetics & adult media",[26,39,45,62]],["Power exchange & BDSM",[8,48,49,11,14,22]],["Watching & group experiences",[9,12,36,52,57,21,53,54,58,59,60]],["Relationship arrangements",[23,55]],["Atmosphere & shared attention",[24,46]],["Boundaries & safety",[19,20,28,56,61,29]],["Your interests & next steps",[30,32]]];
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined&&text!==null)node.textContent=String(text);if(cls)node.className=cls;return node;};
const button=(text,cls,fn)=>{const node=el('button',text,cls);node.type='button';node.onclick=fn;return node;};
const skipOption=o=>o.mediaGroup==='Preferences & boundaries'||/\b(none|neither|nothing|don't want|not interested|no preferred|no waiting|not sure|prefer not to)\b/i.test(o.text);
function prepare(questions){
 const byId=new Map(questions.map((q,index)=>[q.id,index]));
 const seen=new Set();
 const groups=groupPlan.map(([title,ids],order)=>({
  title,order,
  indexes:ids.map(id=>byId.get(id)).filter(index=>index!==undefined)
 }));
 for(const g of groups)for(const index of g.indexes){
  if(seen.has(index))throw Error('Duplicate grouped question '+index);
  seen.add(index);
 }
 if(seen.size!==questions.length)throw Error('Some Sexual Preferences questions are missing from thematic groups');
 return groups;
}
function render(ctx){
 const {box,questions,multiAnswers,freeResponses,questionIntents,intentLabels,persist,rebuild,onPosition,preview}=ctx;
 const groups=prepare(questions);
 const current=Math.max(0,questions.findIndex((_,i)=>i===ctx.position));
 let groupIndex=groups.findIndex(g=>g.indexes.includes(current));
 if(groupIndex<0)groupIndex=0;
 const group=groups[groupIndex];
 box.replaceChildren();
 const answeredQ=index=>Boolean(multiAnswers[index]?.length||(freeResponses[index]||'').trim());
 const groupDone=()=>group.indexes.filter(answeredQ).length;
 const heading=el('header',undefined,'quiz-group-heading');
 heading.append(el('span','SECTION '+(groupIndex+1)+' OF '+groups.length+' · '+ctx.answered+' OF '+questions.length+' ANSWERED','eyebrow'));
 heading.append(el('h2',group.title),el('p','Each question keeps its own answers and fantasy/exploration choice. Expand only the ones you want to answer. Your progress saves automatically.'));
 const jumpRow=el('div',undefined,'quiz-group-jump-row');
 jumpRow.append(el('label','Jump to a topic','quiz-group-jump-label'));
 const jump=el('select',undefined,'quiz-group-jump');
 jump.setAttribute('aria-label','Jump directly to a themed quiz section');
 for(const item of groups){const option=el('option',(item.order+1)+'. '+item.title);option.value=String(item.order);jump.append(option);}
 jump.value=String(groupIndex);
 jump.onchange=()=>onPosition(groups[Number(jump.value)].indexes[0]);
 jumpRow.append(jump);heading.append(jumpRow);
 const meter=el('div',undefined,'quiz-group-meter');
 meter.setAttribute('role','progressbar');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax',String(questions.length));
 meter.setAttribute('aria-valuenow',String(ctx.answered));meter.setAttribute('aria-label','Questions answered');
 const fill=el('div',undefined,'quiz-group-meter-fill');fill.style.width=(100*ctx.answered/questions.length)+'%';meter.append(fill);
 heading.append(meter);box.append(heading);
 const deck=el('div',undefined,'quiz-group-questions');
 const summaries=[];
 function refresh(){
  for(const {index,status,details} of summaries){
   const selections=multiAnswers[index]?.length||0;
   const intent=intentLabels[questionIntents[index]];
   status.textContent=selections?(selections+' selected'+(intent?' · '+intent:'')):(freeResponses[index]?.trim()?'Note saved':'Not answered');
   details.dataset.answered=answeredQ(index)?'true':'false';
  }
  const summary=box.querySelector('[data-group-summary]');
  if(summary)summary.textContent=groupDone()+' of '+group.indexes.length+' questions answered in this section';
  const progress=box.querySelector('.quiz-group-heading .eyebrow');
  if(progress){
   const answered=questions.reduce((n,_,i)=>n+(answeredQ(i)?1:0),0);
   progress.textContent='SECTION '+(groupIndex+1)+' OF '+groups.length+' · '+answered+' OF '+questions.length+' ANSWERED';
   fill.style.width=(100*answered/questions.length)+'%';meter.setAttribute('aria-valuenow',String(answered));
  }
  window.AfterDarkProgressTransfer?.refresh?.();
 }
 group.indexes.forEach((index,ordinal)=>{
  const q=questions[index],selected=new Set(multiAnswers[index]||[]);
  const card=el('details',undefined,'quiz-group-question');
  card.dataset.questionIndex=String(index);
  card.dataset.questionId=String(q.id);
  // Open the first unanswered item only; the rest stay quiet, but accessible.
  const firstPending=group.indexes.find(i=>!answeredQ(i));
  card.open=index===current;
  card.addEventListener('toggle',()=>{
   if(card.open)for(const other of deck.querySelectorAll('.quiz-group-question'))if(other!==card)other.open=false;
  });
  card.addEventListener('click',event=>{
   if(event.target.closest('summary')===card.querySelector(':scope > summary'))ctx.onActiveQuestion?.(index);
  });
  const head=el('summary',undefined,'quiz-group-summary');
  const number=el('span','Q'+(index+1),'quiz-group-question-number');
  const title=el('span',q.q,'quiz-group-question-title');
  const status=el('span','','quiz-group-question-status');
  head.append(number,title,status);card.append(head);
  const inside=el('div',undefined,'quiz-group-question-body');
  inside.append(el('p','Select all that fit. Skip anything you prefer not to answer.','quiz-group-help'));
  let mediaSummary;
  const options=el('div',undefined,'quizOpts quiz-multi');
  const makeOption=(option,i)=>{
   const label=el('label',undefined,'quiz-multi-option'+(selected.has(i)?' selected':''));
   label.dataset.choiceIndex=String(i);
   const input=el('input');input.type='checkbox';input.checked=selected.has(i);input.setAttribute('aria-label',option.text);
   input.onchange=()=>{
    if(input.checked){
     if(skipOption(option))selected.clear();
     else for(const old of [...selected])if(skipOption(q.options[old]))selected.delete(old);
     selected.add(i);
    }else selected.delete(i);
    multiAnswers[index]=[...selected];ctx.onActiveQuestion?.(index);rebuild();persist();
    options.querySelectorAll('.quiz-multi-option').forEach(row=>{
     const checked=selected.has(Number(row.dataset.choiceIndex));
     row.classList.toggle('selected',checked);
     row.querySelector('input').checked=checked;
    });
    if(mediaSummary)mediaSummary.textContent=selected.size?selected.size+' categories selected · Edit':'Choose multiple categories';
    refresh();
   };
   label.append(input,document.createTextNode(option.text));return label;
  };
  if(q.dropdown){
   const dropdown=el('details',undefined,'quiz-media-dropdown');
   mediaSummary=el('summary',selected.size?selected.size+' categories selected · Edit':'Choose multiple categories');
   dropdown.append(mediaSummary);
   const mediaContent=el('div',undefined,'quiz-media-content');
   mediaContent.append(el('p','Adult-only viewing interests are not evidence of wanting to participate in real life.','quiz-group-help'));
   const search=el('input');search.type='search';search.className='quiz-media-search';search.placeholder='Search ASMR, watching, group, toys…';
   search.setAttribute('aria-label','Search adult media interests');
   mediaContent.append(search);
   const byGroup=new Map();
   q.options.forEach((option,i)=>{
    const category=option.mediaGroup||'Other';
    if(!byGroup.has(category)){
     const section=el('fieldset',undefined,'quiz-media-group');section.append(el('legend',category));byGroup.set(category,section);
    }
    byGroup.get(category).append(makeOption(option,i));
   });
   for(const section of byGroup.values())options.append(section);
   search.oninput=()=>{
    const term=search.value.toLowerCase().trim();
    for(const section of byGroup.values()){
     let visible=0;
     section.querySelectorAll('.quiz-multi-option').forEach(row=>{
      row.hidden=!row.textContent.toLowerCase().includes(term);if(!row.hidden)visible++;
     });
     section.hidden=!visible;
    }
   };
   mediaContent.append(options);dropdown.append(mediaContent);inside.append(dropdown);
  }else{
   let latestHeading='';
   q.options.forEach((option,i)=>{
    const heading=option.subheading||'';
    if(heading&&heading!==latestHeading)options.append(el('h4',heading,'quiz-group-option-subheading'));
    latestHeading=heading;
    options.append(makeOption(option,i));
   });
   inside.append(options);
  }
  const intent=el('fieldset',undefined,'quiz-question-intent');
  intent.append(el('legend','For this question, which best describes your interest? (optional)'));
  const intentChoices=el('div',undefined,'quiz-question-intent-choices');
  for(const [value,labelText] of Object.entries(intentLabels)){
   const label=el('label');const input=el('input');input.type='radio';input.name='quiz-intent-'+q.id;
   input.value=value;input.checked=questionIntents[index]===value;
   input.onchange=()=>{if(input.checked){questionIntents[index]=value;ctx.onActiveQuestion?.(index);persist();refresh();}};
   label.append(input,document.createTextNode(labelText));intentChoices.append(label);
  }
  intent.append(intentChoices);inside.append(intent);
  if(q.freeText){
   const note=el('textarea');note.rows=2;note.maxLength=600;note.value=freeResponses[index]||'';
   note.placeholder='Optional private note or boundary';note.setAttribute('aria-label','Private note for question '+(index+1));
   note.oninput=()=>{freeResponses[index]=note.value;ctx.onActiveQuestion?.(index);rebuild();persist();refresh();};
   inside.append(note);
  }
  const single=el('div',undefined,'quiz-group-question-bottom');
  single.append(button('Clear this answer','quiz-group-clear',()=>{
   selected.clear();multiAnswers[index]=[];delete freeResponses[index];delete questionIntents[index];
   rebuild();persist();render({...ctx,answered:questions.reduce((n,_,i)=>n+(answeredQ(i)?1:0),0)});
  }));
  if(ordinal<group.indexes.length-1)single.append(button('Next question ↓','quiz-group-next-question',()=>{
   card.open=false;
   const next=deck.querySelector('[data-question-index="'+group.indexes[ordinal+1]+'"]');
   if(next){next.open=true;ctx.onActiveQuestion?.(group.indexes[ordinal+1]);next.scrollIntoView({behavior:'smooth',block:'nearest'});}
  }));
  inside.append(single);card.append(inside);deck.append(card);
  summaries.push({index,status,details:card});status.textContent=selected.size?selected.size+' selected':'Not answered';
 });
 box.append(deck);
 const bottom=el('footer',undefined,'quiz-group-footer');
 bottom.append(el('p',groupDone()+' of '+group.indexes.length+' questions answered in this section','quiz-group-completion'));
 bottom.lastChild.dataset.groupSummary='';
 const actions=el('div',undefined,'quiz-nav-actions');
 const back=button('← Previous section','btn alt',()=>onPosition(groups[groupIndex-1].indexes[0]));
 back.disabled=groupIndex===0;
 actions.append(back);
 actions.append(button('Skip section for now','btn alt',()=>onPosition(groupIndex===groups.length-1?questions.length:groups[groupIndex+1].indexes[0])));
 actions.append(button(groupIndex===groups.length-1?'View my results →':'Save & next section →','btn',()=>{
  onPosition(groupIndex===groups.length-1?questions.length:groups[groupIndex+1].indexes[0]);
 }));
 bottom.append(actions);
 const detail=el('details',undefined,'quiz-question-more');
 detail.append(el('summary','Preview my report so far'));
 detail.append(button('View preview','quiz-secondary-link',preview));
 bottom.append(detail);
 box.append(bottom);
 refresh();
}
window.AfterDarkGroupedQuizUI=Object.freeze({render,prepare});
})();
