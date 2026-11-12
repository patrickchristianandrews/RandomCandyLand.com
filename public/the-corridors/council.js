/* THE CORRIDORS // THE COUNCIL: a compact strategy interface.
 * Uses genuine existing scenario deltas, never fabricates policy outcomes. */
(()=>{'use strict';
const API=()=>window.CorridorsArcade,ENGINE=()=>window.CorridorsPolicyLab;
if(!API()||!ENGINE())return;
const $=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e};
const mandateKey='corridors-council-mandate-v2';
const mandates=[{key:'stability',title:'Protect households',icon:'⌂',short:'Households'},
 {key:'budget',title:'Keep a balanced budget',icon:'♜',short:'Budget'},
 {key:'trust',title:'Restore public confidence',icon:'✦',short:'Trust'}];
let mandate='stability',selected=null,preview=false,lastScenario=-1;
try{const x=localStorage.getItem(mandateKey);if(mandates.some(y=>y.key===x))mandate=x}catch{}
const panel=document.querySelector('#corridors-arcade .pixel-arcade-panel');if(!panel)return;
const desk=$('aside','council-desk');desk.id='corridors-council';desk.setAttribute('aria-label','City council strategy panel');
const top=$('div','council-top');top.append($('span','council-overline','THE CITY COUNCIL // SESSION'),$('h2','','Your next move'));
const progress=$('div','council-session');
const mandateArea=$('div','council-mandates');
const mandateLabel=$('strong','council-section-title','YOUR CAMPAIGN PROMISE');
const mandateChoices=$('div','council-mandate-choices');
mandateArea.append(mandateLabel,mandateChoices);
const briefing=$('p','council-brief','Review the situation. Choose which outcome to prioritize.');
const actions=$('div','council-bills');
const advisers=$('div','council-advisers');
const forecast=$('div','council-forecast');
const terminal=$('div','council-footer');
const status=$('p','council-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
desk.append(top,progress,mandateArea,briefing,actions,advisers,forecast,status,terminal);
panel.append(desk);
const climate=()=>API().state();
const sc=()=>ENGINE().currentCase();
const cnum=n=>Math.round(Number(n)||0);
const phaseName={today:'RIGHT NOW',months:'SIX MONTHS',years:'TWO YEARS'};
const axisKeys=['stability','prices','services','budget','trust'];
const axisNames={stability:'Households',prices:'Price pressure',services:'Services',budget:'Budget',trust:'Trust'};
const impact=(opt,stages)=>{
 const raw=Array(5).fill(0);
 for(const stage of stages){const data=opt[stage]||opt[stage==='today'?'now':stage];if(!data?.change)continue;
  data.change.forEach((x,i)=>{raw[i]+=Number(x)||0});
 }
 return raw.map((v,i)=>({key:axisKeys[i],label:axisNames[axisKeys[i]],value:v,good:axisKeys[i]==='prices'?v<=0:v>=0}))
 .filter(v=>v.value).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
};
function score(p){
 const m=p.metrics,base=(m[mandate]||0);
 return Math.round(Math.max(0,Math.min(100,base)));
}
function pill(str,cls=''){return $('span','council-pill '+cls,str)}
function update(){
 const p=climate(),caseData=sc();
 if(!caseData||!p)return;
 if(lastScenario!==p.scenario){lastScenario=p.scenario;selected=null;preview=false;}
 const newPhase=p.choice!==null,done=p.phase==='years';
 top.querySelector('h2').textContent=newPhase?'The consequences':'Your next move';
 progress.replaceChildren();
 const turn=$('div','council-progress-main');
 turn.append(pill('FILE '+(p.scenario+1)),pill('CITY RATING '+p.rating+'/100','rating'));
 const track=$('div','council-seasons');
 for(const [index,label] of ['NOW','6 MONTHS','2 YEARS'].entries()){
  const dot=$('span','council-season'+(index<=(['today','months','years'].indexOf(p.phase))?' current':'') ,label);
  track.append(dot);
 }
 progress.append(turn,track);
 briefing.textContent=p.choice===null?
  (caseData.lead.length>155?caseData.lead.slice(0,152).trimEnd()+'…':caseData.lead):
  caseData.options[p.choice].name+' — '+phaseName[p.phase];
 mandateChoices.replaceChildren();
 mandates.forEach(m=>{
  const b=$('button','council-mandate'+(mandate===m.key?' active':''),m.icon+' '+m.short);
  b.type='button';b.disabled=p.choice!==null;b.setAttribute('aria-pressed',String(mandate===m.key));
  b.onclick=()=>{mandate=m.key;try{localStorage.setItem(mandateKey,mandate)}catch{}update()};
  mandateChoices.append(b);
 });
 actions.replaceChildren();advisers.replaceChildren();forecast.replaceChildren();terminal.replaceChildren();
 if(p.choice===null){
  actions.append($('strong','council-section-title','CHOOSE A BILL TO INTRODUCE'));
  caseData.options.forEach((opt,i)=>{
   const card=$('button','council-bill'+(i===selected?' selected':''));card.type='button';
   const label=$('small','council-bill-index','BILL 0'+(i+1)),name=$('strong','council-bill-name',opt.name);
   const impacts=impact(opt,['now']).slice(0,2);
   const impactsLine=$('div','council-bill-effects');
   impacts.forEach(item=>impactsLine.append(pill(item.label+' '+(item.value>0?'+':'')+item.value,item.good?'positive':'negative')));
   if(!impacts.length)impactsLine.append(pill('See the impact'));
   card.append(label,name,impactsLine);
   card.onclick=()=>{selected=i;preview=true;update();status.textContent='Bill '+(i+1)+' selected. Check the predicted trade-offs and bring it to a vote.'};
   actions.append(card);
  });
  if(preview&&selected!==null){
   const opt=caseData.options[selected];
   const chosen=$('div','council-selected');
   const title=$('strong','council-selected-title','COUNCIL BRIEF: '+opt.name);
   const content=$('p','',opt.label);
   chosen.append(title,content);
   const stages=p.advisers.length===2?['now','months','years']:['now'];
   const forecastTitle=$('small','','MODELED '+(stages.length>1?'FULL HORIZON':'IMMEDIATE')+' DELTAS');
   chosen.append(forecastTitle);
   const impacts=$('div','council-selected-effects');
   impact(opt,stages).slice(0,4).forEach(x=>impacts.append(pill(x.label+' '+(x.value>0?'+':'')+x.value,x.good?'positive':'negative')));
   chosen.append(impacts);
   const vote=$('button','council-vote','⚖ PASS THIS BILL');
   vote.type='button';vote.onclick=()=>{API().choose(selected);status.textContent='Bill passed. See how the city responds.';update()};
   chosen.append(vote);
   forecast.append(chosen);
  }
  const row=$('div','council-adviser-row');
  row.append($('strong','council-section-title','ASK YOUR ADVISERS'));
  for(const [key,name,icon] of [['finance','Finance director','♜'],['community','Community advocate','♧']]){
   const b=$('button','council-adviser'+(p.advisers.includes(key)?' consulted':''),icon+' '+name+(p.advisers.includes(key)?' ✓':''));
   b.type='button';b.onclick=()=>{API().consult(key);status.textContent=key==='finance'?
    'Finance: consider the fiscal cost and pressure on future services.':
    'Community: consider who receives benefits and whether the public trusts the process.';update()};
   row.append(b);
  }
  advisers.append(row);
  status.textContent=selected===null?'Tap a bill to inspect its trade-offs. Movement is optional.':'Your vote determines what happens in this simulated city.';
 }else{
  const opt=caseData.options[p.choice],stage=p.phase==='today'?'now':p.phase;
  const info=opt[stage]||opt.now,cond=$('div','council-result');
  const headline=$('strong','council-news-label','THE CITY BRIEF · '+phaseName[p.phase]);
  const excerpt=$('p','council-news-text',info.text.length>185?info.text.slice(0,181)+'…':info.text);
  cond.append(headline,excerpt);
  const diffs=$('div','council-impact-now');
  impact(opt,[stage]).slice(0,4).forEach(x=>diffs.append(pill(x.label+' '+(x.value>0?'+':'')+x.value,x.good?'positive':'negative')));
  cond.append(diffs);
  const next=$('button','council-next',p.phase==='today'?'⏩ SIX MONTHS LATER':p.phase==='months'?'⏩ TWO YEARS LATER':'▶ NEXT POLICY FILE');
  next.onclick=()=>{API().advance();selected=null;preview=false;update()};
  cond.append(next);actions.append(cond);
  status.textContent='Campaign promise: '+mandates.find(x=>x.key===mandate).title+' · current score '+score(p)+'/100';
 }
 const grade=$('div','council-grade');
 grade.append($('strong','','YOUR MANDATE'),$('span','',mandates.find(x=>x.key===mandate).short+' '+score(p)+'/100'));
 const bar=$('div','council-grade-track'),fill=$('i','');fill.style.width=score(p)+'%';bar.append(fill);grade.append(bar);
 terminal.append(grade);
 const role=$('p','council-rule','One fictional policy per file. Metrics are calculated by the existing policy simulation; forecasts are shown only for the simulated scenarios.');
 terminal.append(role);
}
window.addEventListener('corridors-arcade-update',update);
update();
window.CorridorsCouncil=Object.freeze({state:()=>({mandate,selected,preview}),select:i=>{selected=i;preview=true;update()},vote:()=>{if(selected!==null){API().choose(selected);update()}},update});
})();