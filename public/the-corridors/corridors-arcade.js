/* The Corridors: walkable pixel city hall with real policy-engine decisions,
   timed consequences, preserved autosaves and an optional deep-dive mode. */
(()=>{'use strict';
const engine=window.CorridorsPolicyLab;
if(!window.PixelWorld||!engine?.currentCase||!engine.chooseAction)return;
let world=null,lastScenario=-1;
const coords=[[88,145],[288,145],[236,180]];
const prefix=(s,n)=>String(s||'').length>n?String(s).slice(0,n-1).trimEnd()+'…':String(s||'');
function progress(){return engine.getProgress()}
function scene(){return engine.currentCase()}
function options(){
 const sc=scene();
 return sc.options.map((o,i)=>({
   id:i,x:coords[i][0],y:coords[i][1],label:o.name,
   short:['POLICY A','POLICY B','POLICY C'][i],type:['desk','ballot','folder'][i]
 }));
}
function meter(){
 const p=progress();
 return 'TRUST '+p.metrics.trust+' · PRICES '+p.metrics.prices+' · '+p.decisions+' DECISIONS';
}
function advance(){
 const p=progress();
 if(p.choice===null){intro(true);return}
 if(p.phase==='years'){engine.completeCase();intro(false)}
 else{engine.advancePhase();outcome(true)}
}
function phaseLabel(s){return s==='today'?'TODAY':s==='months'?'SIX MONTHS LATER':s==='years'?'TWO YEARS LATER':'CITY HALL'}
function loadWorld(title,message,preserve){
 const p=progress(),sc=scene(),notChosen=p.choice===null;
 world.setWorld({
  title:'FILE '+(p.scenario+1)+' · '+prefix(sc.title,32),
  environment:(p.scenario+(p.phase==='years'?2:p.phase==='months'?1:0))%5,
  score:meter(),preservePlayer:preserve,objects:notChosen?options():
    [{id:'next',x:296,y:148,label:p.phase==='years'?'Next policy':'Advance time',short:p.phase==='years'?'NEXT FILE':'TIME GATE',type:'screen'}],
  message
 });
 world.setPrompt(notChosen?'WALK TO A GLOWING POLICY DESK · E / TAP':'TAP THE TIME GATE · E / TAP');
}
function intro(preserve=false){
 const p=progress();
 if(p.choice!==null){outcome(preserve);return}
 const sc=scene();
 loadWorld(sc.title,prefix(sc.lead,185),preserve);
 world.tell('MAYOR · YOUR CALL',prefix(sc.lead,185)+' Choose one of three desks, then approve your decision.');
}
function propose(index){
 const p=progress(),sc=scene();
 if(p.choice!==null){outcome(true);return}
 const opt=sc.options[index];if(!opt)return;
 world.tell('CABINET PROPOSAL '+String.fromCharCode(65+index),
  prefix(opt.name+'. '+opt.label,230),[
  {label:'✓ Approve this policy',action:()=>{engine.chooseAction(index);outcome(true)}},
  {label:'↩ Compare other options',action:()=>intro(true)}
 ]);
}
function outcome(preserve=false){
 const p=progress(),sc=scene();
 if(p.choice===null){intro(preserve);return}
 const opt=sc.options[p.choice],info=opt[p.phase]||opt.now,phase=phaseLabel(p.phase);
 loadWorld(sc.title,prefix(info.text,200),preserve);
 const line=prefix(info.text,240);
 const nextLabel=p.phase==='today'?'⏩ Advance 6 months':p.phase==='months'?'⏩ Advance 2 years':'▶ Record result & next policy';
 world.tell(phase+' · '+prefix(opt.name,38),line,[
  {label:nextLabel,action:advance},
  {label:'📊 Open detailed analysis',action:()=>world.showDetail()}
 ]);
}
function selectObject(obj){
 if(typeof obj.id==='number')propose(obj.id);
 else if(obj.id==='next')advance();
}
world=window.PixelWorld.create({
 id:'corridors',title:'THE CORRIDORS // PIXEL POLITICS',
 tagline:'WALK CITY HALL · CHOOSE YOUR POLICY · SEE THE CONSEQUENCES',
 onInteract:selectObject,onResume:()=>progress().choice===null?intro(true):outcome(true)
});
intro(false);
window.CorridorsArcade=Object.freeze({
 state:()=>({...progress(),title:scene().title,screen:world.state()}),
 choose:index=>{engine.chooseAction(index);outcome(true)},
 advance,play:()=>world.showGame(),showDetails:()=>world.showDetail(),
 walkTo:index=>world.clickObject(index)
});
})();