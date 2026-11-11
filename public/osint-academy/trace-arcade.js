/* TRACE: real top-down pixel investigation with a moving player and clickable evidence.
   Five fictional cases reuse the original verification lessons and save key. */
(()=>{'use strict';
const cases=window.TracePixelCaseData;
if(!window.PixelWorld||!cases?.length)return;
const SAVE='trace-pixel-sidecases-v1',CURRENT='trace-arcade-case-v1';
let solved=new Set(),level=0,found=new Set(),world=null;
try{const x=JSON.parse(localStorage.getItem(SAVE)||'[]');if(Array.isArray(x))solved=new Set(x.filter(n=>Number.isInteger(n)&&n>=0&&n<cases.length))}catch{}
try{const n=Number(localStorage.getItem(CURRENT));if(Number.isInteger(n)&&n>=0&&n<cases.length)level=n}catch{}
const shortOptions=[
 ['The screenshot proves it','Check the route and official timetable','The repost is confirmation'],
 ['Yesterday’s caption proves the photo is new','The image proves yesterday’s weather','The archival match challenges the date'],
 ['Same nickname means same person','The account connection is unverified','Different hobbies prove deception'],
 ['The colors prove the notice is real','Enter personal details immediately','Verify with the known official agency site'],
 ['The meeting is supported; attendance is not','Everyone in the photo was there','The undated photo proves everything']
];
const sceneKind=['screen','folder','document'],place=[
 [89,139],[289,139],[249,184]
];
function positions(){
 return cases[level].objects.map(([icon,label],i)=>({
  id:i,x:place[i][0],y:place[i][1],
  label,short:['SCREEN','RECORD','SOURCE'][i],
  type:[['screen','folder','document'],['photo','folder','screen'],['screen','photo','document'],['document','screen','folder'],['folder','screen','photo']][level][i],
  done:found.has(i)
 }));
}
function showScene(message,keep=false){
 const c=cases[level];
 world.setWorld({title:'CASE '+(level+1)+' / '+cases.length+' · '+c.title,
  environment:level,objects:positions(),
  preservePlayer:keep,score:solved.size+' / '+cases.length+' CASES',
  message:message||c.brief});
 world.setPrompt(found.size===3?'ALL CLUES · SOLVE THE CASE':'TAP '+(3-found.size)+' GLOWING CLUE'+(3-found.size===1?'':'S')+' · WALK / E');
}
function persist(){
 try{localStorage.setItem(SAVE,JSON.stringify([...solved]));localStorage.setItem(CURRENT,String(level))}catch{}
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
 solved.add(level);persist();
 world.setScore(solved.size+' / '+cases.length+' CASES');
 world.setPrompt('CASE CLOSED · NEXT MYSTERY');
 world.tell('CASE SOLVED · +100 XP',c.why,[
  {label:level===cases.length-1?'🏆 Replay the mystery map':'▶ Next mystery',action:next}
 ]);
}
function next(){
 level=(level+1)%cases.length;found=new Set();persist();
 showScene(cases[level].brief);
}
function inspect(obj){
 if(!obj||typeof obj.id!=='number')return;
 const c=cases[level],i=obj.id;
 found.add(i);
 showScene(undefined,true);
 const detail=c.objects[i][2];
 world.tell(c.objects[i][1]+' · CLUE '+found.size+'/3',detail,
  found.size>=3?[{label:'🔎 Make your deduction',action:solutions}]:[]);
 if(found.size===3)world.setPrompt('ALL CLUES FOUND · MAKE THE DEDUCTION');
}
world=window.PixelWorld.create({
 id:'trace',title:'TRACE // PIXEL DETECTIVE',tagline:'FIND THE CLUES · TEST THE CLAIM · SOLVE THE MYSTERY',
 onInteract:inspect,onResume:()=>showScene(undefined,true),
 onDetails:()=>window.TraceQuickPlay?.setMode('academy',false)
});
persist();showScene(cases[level].brief);
window.TraceArcade=Object.freeze({
 state:()=>({caseIndex:level,found:[...found],solved:[...solved],screen:world.state()}),
 inspect:index=>inspect({id:index}),answer,
 next,play:()=>world.showGame(),showAcademy:()=>world.showDetail(),
 walkTo:index=>world.clickObject(index)
});
})();