/* TRACE: real top-down pixel investigation with a moving player and clickable evidence.
   Five fictional cases reuse the original verification lessons and save key. */
(()=>{'use strict';
const cases=window.TracePixelCaseData;
if(!window.PixelWorld||!cases?.length)return;
const SAVE='trace-pixel-sidecases-v1',CURRENT='trace-arcade-case-v1',SCORE='trace-arcade-xp-v6';
let solved=new Set(),level=0,found=new Set(),world=null,verified=false,wrong=0,xp=0;
try{xp=Math.max(0,Number(localStorage.getItem(SCORE))||0)}catch{}
try{const x=JSON.parse(localStorage.getItem(SAVE)||'[]');if(Array.isArray(x))solved=new Set(x.filter(n=>Number.isInteger(n)&&n>=0&&n<cases.length))}catch{}
try{const n=Number(localStorage.getItem(CURRENT));if(Number.isInteger(n)&&n>=0&&n<cases.length)level=n}catch{}
const shortOptions=[
 ['The screenshot proves it','Check the route and official timetable','The repost is confirmation'],
 ['Yesterday’s caption proves the photo is new','The image proves yesterday’s weather','The archival match challenges the date'],
 ['Same nickname means same person','The account connection is unverified','Different hobbies prove deception'],
 ['The colors prove the notice is real','Enter personal details immediately','Verify with the known official agency site'],
 ['The meeting is supported; attendance is not','Everyone in the photo was there','The undated photo proves everything']
];
const trusted=[1,1,2,2,0];
const hints=[
 'Screenshots without dates or routes are weak evidence. Look for an official schedule.',
 'A recent post does not prove a photo is recent. Compare an archived landmark.',
 'Matching display names cannot prove the same owner. Check the platform policy.',
 'Urgency and lookalike domains are red flags. Confirm through a known agency site.',
 'Separate verified event dates from unsupported claims about attendance.'
];
const sceneKind=['screen','folder','document'],place=[
 [89,139],[289,139],[249,184]
];
function positions(){
 const clues=cases[level].objects.map(([icon,label],i)=>({
  id:i,x:place[i][0],y:place[i][1],
  label,short:['SCREEN','RECORD','SOURCE'][i],
  type:[['screen','folder','document'],['photo','folder','screen'],['screen','photo','document'],['document','screen','folder'],['folder','screen','photo']][level][i],
  done:found.has(i)
 }));
 clues.push({id:'guide',x:191,y:142,label:'Ask '+cases[level].npc,short:'HELP',type:'npc',done:false});
 return clues;
}
function showScene(message,keep=false){
 const c=cases[level];
 world.setWorld({title:'CASE '+(level+1)+' / '+cases.length+' · '+c.title,
  environment:level,objects:positions(),
  preservePlayer:keep,score:solved.size+' / '+cases.length+' CASES · '+xp+' XP',
  message:message||c.brief});
 world.setPrompt(found.size===3?'ALL CLUES · CHECK THE SOURCE':'FIND '+(3-found.size)+' MORE CLUE'+(3-found.size===1?'':'S')+' · TAP OBJECTS');
 world.setStats([{label:'EVIDENCE',value:found.size+'/3',percent:Math.round(found.size/3*100)},{label:'MYSTERIES',value:solved.size+'/5',percent:Math.round(solved.size/5*100)},{label:'XP',value:xp,percent:Math.min(100,xp/8)}]);
}
function persist(){
 try{localStorage.setItem(SAVE,JSON.stringify([...solved]));localStorage.setItem(CURRENT,String(level));localStorage.setItem(SCORE,String(xp))}catch{}
}
function verifySource(index){
 if(index!==trusted[level]){
  wrong++;
  xp=Math.max(0,xp-5);persist();
  world.tell('SOURCE CHECK · NOT VERIFIED','That source alone cannot establish the claim. Check the original record.',[
   {label:'↻ Compare your evidence again',action:sourceChallenge},
   {label:'💡 Ask your guide for a hint',action:()=>world.tell(cases[level].npc,hints[level],[{label:'Back to evidence',action:sourceChallenge}])}
  ]);return;
 }
 verified=true;xp+=50;persist();
 world.tell('SOURCE VERIFIED · +50 XP','Good call. You found a stronger primary or dated source.',[
  {label:'🔎 Solve the mystery',action:solutions}
 ]);
}
function sourceChallenge(){
 const c=cases[level];
 world.tell('EVIDENCE BOARD','Which source should you rely on most?',c.objects.map((item,i)=>({
  label:String.fromCharCode(65+i)+' · '+item[1],
  action:()=>verifySource(i)
 })));
}
function solutions(){
 const c=cases[level],opts=shortOptions[level];
 world.tell('YOUR DEDUCTION','Which conclusion is supported by the evidence?',opts.map((label,i)=>({
  label:String.fromCharCode(65+i)+' · '+label,
  action:()=>answer(i)
 })));
}
function answer(index){
 const c=cases[level];
 if(index!==c.correct){
  world.tell('THE GUIDE','That leap goes beyond the evidence. Compare source reliability and dates.',[
   {label:'Try another conclusion',action:solutions}
  ]);
  return;
 }
 const firstClear=!solved.has(level);solved.add(level);
 if(firstClear)xp+=100;
 persist();
 world.setScore(solved.size+' / '+cases.length+' CASES · '+xp+' XP');
 world.setStats([{label:'EVIDENCE',value:found.size+'/3',percent:found.size/3*100},{label:'MYSTERIES',value:solved.size+'/5',percent:solved.size/5*100},{label:'XP',value:xp,percent:Math.min(100,xp/8)}]);
 world.setPrompt('CASE CLOSED · NEXT MYSTERY');
 world.tell('CASE SOLVED · +100 XP',c.why,[
  {label:level===cases.length-1?'🏆 Replay the mystery map':'▶ Next mystery',action:next}
 ]);
}
function next(){
 level=(level+1)%cases.length;found=new Set();verified=false;wrong=0;persist();
 showScene(cases[level].brief);
}
function inspect(obj){
 if(!obj)return;
 if(obj.id==='guide'){
  world.tell(cases[level].npc+' · FIELD PARTNER',hints[level],[
    {label:found.size===3?'📎 Open evidence board':'↩ Continue investigating',action:()=>found.size===3?sourceChallenge():world.tell('GUIDE','Explore the glowing objects in this district.')}
  ]);return;
 }
 if(typeof obj.id!=='number')return;
 const c=cases[level],i=obj.id;
 const fresh=!found.has(i);found.add(i);if(fresh)xp+=10;
 showScene(undefined,true);persist();
 const detail=c.objects[i][2];
 world.tell(c.objects[i][1]+' · CLUE '+found.size+'/3',detail,
  found.size>=3?[{label:'📎 Compare your sources',action:()=>verified?solutions():sourceChallenge()}]:[]);
 world.setScore(solved.size+' / '+cases.length+' CASES · '+xp+' XP');
 if(found.size===3)world.setPrompt('ALL CLUES FOUND · CHECK YOUR SOURCES');
}
world=window.PixelWorld.create({
 id:'trace',title:'TRACE // PIXEL DETECTIVE',tagline:'FIND THE CLUES · TEST THE CLAIM · SOLVE THE MYSTERY',
 onInteract:inspect,onResume:()=>showScene(undefined,true),
 onDetails:()=>window.TraceQuickPlay?.setMode('academy',false)
});
persist();showScene(cases[level].brief);
window.TraceArcade=Object.freeze({
 state:()=>({caseIndex:level,found:[...found],solved:[...solved],verified,xp,wrong,screen:world.state()}),
 inspect:index=>inspect({id:index}),verifySource,sourceChallenge,answer,
 next,play:()=>world.showGame(),showAcademy:()=>world.showDetail(),
 walkTo:index=>world.clickObject(index)
});
})();