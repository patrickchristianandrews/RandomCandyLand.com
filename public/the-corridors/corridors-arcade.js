/* The Corridors: walkable pixel city hall with real policy-engine decisions,
   timed consequences, preserved autosaves and an optional deep-dive mode. */
(()=>{'use strict';
const engine=window.CorridorsPolicyLab;
if(!window.PixelWorld||!engine?.currentCase||!engine.chooseAction)return;
let world=null,lastScenario=-1,advisers=new Set(),beforeMetrics=null,rank=0,insight=0;
const SAVE='corridors-arcade-cabinet-v6';
try{const x=JSON.parse(localStorage.getItem(SAVE)||'{}');if(x.scenario===engine.getProgress().scenario&&Array.isArray(x.advisers))advisers=new Set(x.advisers.filter(n=>n==='finance'||n==='community'));rank=Math.floor(Number(x.rank)||0);insight=Math.max(0,Math.floor(Number(x.insight)||0))}catch{}
const persist=()=>{try{localStorage.setItem(SAVE,JSON.stringify({scenario:progress().scenario,advisers:[...advisers],rank,insight}))}catch{}};
const coords=[[74,145],[289,145],[236,180]];
const prefix=(s,n)=>String(s||'').length>n?String(s).slice(0,n-1).trimEnd()+'…':String(s||'');
function progress(){return engine.getProgress()}
function scene(){return engine.currentCase()}
function options(){
 const sc=scene();
 const desks=sc.options.map((o,i)=>({
   id:i,x:coords[i][0],y:coords[i][1],label:o.name,
   short:['PLAN A','PLAN B','PLAN C'][i],type:['desk','ballot','folder'][i]
 }));
 desks.push({id:'finance',x:147,y:143,label:'Budget adviser',short:advisers.has('finance')?'✓ FINANCE':'FINANCE',type:'npc',done:advisers.has('finance')});
 desks.push({id:'community',x:345,y:183,label:'Community adviser',short:advisers.has('community')?'✓ PEOPLE':'PEOPLE',type:'npc',done:advisers.has('community')});
 return desks;
}
function rating(m){
 return Math.round(Math.max(0,Math.min(100,(m.trust*0.3)+(m.budget*0.2)+(m.stability*0.2)+(m.services*0.15)+((100-m.prices)*0.15))));
}
const deltaNames=[['trust','Trust'],['budget','Budget'],['prices','Prices'],['services','Services'],['stability','Households']];
function effects(before,after){
 if(!before||!after)return '';
 return deltaNames.map(([k,name])=>({name,diff:(Number(after[k])||0)-(Number(before[k])||0)}))
 .filter(x=>x.diff).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff)).slice(0,2)
 .map(x=>x.name+' '+(x.diff>0?'+':'')+x.diff).join(' · ');
}
function meter(){
 const p=progress();
 return 'CITY RATING '+rating(p.metrics)+'/100 · '+p.decisions+' FILES';
}
function advance(){
 const p=progress();
 if(p.choice===null){intro(true);return}
 beforeMetrics={...p.metrics};
 if(p.phase==='years'){
   engine.completeCase();advisers.clear();beforeMetrics=null;rank++;persist();
   intro(false);
   if(rank>0&&rank%5===0){
    const p2=progress(),score=rating(p2.metrics);
    world.tell('🏆 END OF TERM · CITY RATING '+score,
     'You completed five policy files. Your decisions left a mixed legacy. Keep exploring, or examine the detailed report.',[
      {label:'▶ Continue in office',action:()=>intro(true)},
      {label:'📊 Review your record',action:()=>world.showDetail()}
     ]);
   }
 }else{engine.advancePhase();outcome(true)}
}
function phaseLabel(s){return s==='today'?'TODAY':s==='months'?'SIX MONTHS LATER':s==='years'?'TWO YEARS LATER':'CITY HALL'}
function loadWorld(title,message,preserve){
 const p=progress(),sc=scene(),notChosen=p.choice===null;
 world.setWorld({
  title:'FILE '+(p.scenario+1)+' · '+prefix(sc.title,32),
  genre:'civic',mood:p.phase,
  environment:(p.scenario+(p.phase==='years'?2:p.phase==='months'?1:0))%5,
  score:meter(),preservePlayer:preserve,objects:notChosen?options():
    [{id:'next',x:296,y:148,label:p.phase==='years'?'Next policy':'Advance time',short:p.phase==='years'?'NEXT FILE':'TIME GATE',type:'screen'}],
  message
 });
 world.setPrompt(notChosen?'MEET 2 ADVISERS OR CHOOSE A POLICY':'TAP TIME GATE · SEE CONSEQUENCES');
 world.setStats([{label:'TRUST',value:p.metrics.trust,percent:p.metrics.trust},{label:'BUDGET',value:p.metrics.budget,percent:p.metrics.budget},{label:'PRICE PRESSURE',value:p.metrics.prices,percent:p.metrics.prices,warning:p.metrics.prices>60}]);
 window.dispatchEvent(new CustomEvent('corridors-arcade-update',{detail:{scenario:p.scenario,phase:p.phase,choice:p.choice}}));
}
function intro(preserve=false){
 const p=progress();
 if(p.choice!==null){outcome(preserve);return}
 const sc=scene();
 loadWorld(sc.title,prefix(sc.lead,185),preserve);
 world.tell('MAYOR · YOUR CALL',prefix(sc.lead,155)+' Meet your advisers if you want context, then choose a policy desk.');
}
function propose(index){
 const p=progress(),sc=scene();
 if(p.choice!==null){outcome(true);return}
 const opt=sc.options[index];if(!opt)return;
 window.CorridorsCouncil?.select?.(index);
 world.tell('CABINET PROPOSAL '+String.fromCharCode(65+index),
  prefix(opt.name+'. '+opt.label,175),[
  {label:'✓ Approve this policy',action:()=>{beforeMetrics={...progress().metrics};engine.chooseAction(index);if(advisers.size===2){insight+=10}persist();outcome(true)}},
  {label:'↩ Compare options / advisers',action:()=>intro(true)}
 ]);
}
function outcome(preserve=false){
 const p=progress(),sc=scene();
 if(p.choice===null){intro(preserve);return}
 const opt=sc.options[p.choice],info=opt[p.phase]||opt.now,phase=phaseLabel(p.phase);
 loadWorld(sc.title,prefix(info.text,200),preserve);
 const delta=effects(beforeMetrics,p.metrics);
 const line=prefix(info.text,145);
 const nextLabel=p.phase==='today'?'⏩ Advance 6 months':p.phase==='months'?'⏩ Advance 2 years':'▶ Record result & next policy';
 world.tell(phase+' · '+(delta||'EFFECTS PLAY OUT'),line,[
  {label:nextLabel,action:advance},
  {label:'📊 How did this happen?',action:()=>world.showDetail()}
 ]);
}
function consult(type){
 if(!['finance','community'].includes(type))return;
 const fresh=!advisers.has(type);advisers.add(type);persist();
 const p=progress();
 const line=type==='finance'?
  'Budget capacity '+p.metrics.budget+'/100. Fast relief can limit later choices. Review who pays and when.':
  'Public trust '+p.metrics.trust+'/100. People notice access, fairness and transparency—not just promises.';
 loadWorld(scene().title,'Cabinet briefing',true);
 world.tell(type==='finance'?'BUDGET DIRECTOR':'COMMUNITY ORGANIZER',line,[
  {label:'✓ Back to policy desks',action:()=>intro(true)}
 ]);
}
function selectObject(obj){
 if(typeof obj.id==='number')propose(obj.id);
 else if(obj.id==='next')advance();
 else if(obj.id==='finance'||obj.id==='community')consult(obj.id);
}
world=window.PixelWorld.create({
 id:'corridors',title:'THE CORRIDORS // PIXEL POLITICS',
 tagline:'WALK CITY HALL · CHOOSE YOUR POLICY · SEE THE CONSEQUENCES',
 onInteract:selectObject,onResume:()=>progress().choice===null?intro(true):outcome(true)
});
intro(false);
window.CorridorsArcade=Object.freeze({
 state:()=>({...progress(),title:scene().title,advisers:[...advisers],rank,insight,rating:rating(progress().metrics),screen:world.state()}),
 choose:index=>{beforeMetrics={...progress().metrics};engine.chooseAction(index);outcome(true)},
 consult,
 advance,play:()=>world.showGame(),showDetails:()=>world.showDetail(),
 walkTo:index=>world.clickObject(index)
});
})();