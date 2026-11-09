/* TRACE Field Files — fictional, offline, evidence-first micro-investigations.
   No lookups, uploads, real identities or private details. */
(()=>{'use strict';
const CASES=[
 {id:'station',zone:'Neon Station',title:'The vanished midnight train',brief:'A viral post claims the train company secretly cancelled the 22:15 service. Find what the records actually support.',question:'What can you responsibly conclude?',facts:[
 ['📣','Viral post','Screenshot: “They erased the 22:15 train!”','A repost is a claim, not a primary record.'],
 ['🗓️','Public timetable','The official service calendar lists the 22:15 service for weekdays, but not Sundays.','A schedule can test whether a service was planned.'],
 ['⌚','Timestamp','The photographed platform display is dated Sunday, 18:02.','The claimed night and the photo time are different.']],
 options:['The company deleted proof of a train that was running.','The screenshot alone cannot prove a cover-up; the date and timetable offer a mundane explanation.','Every social media post about transit is false.'],correct:1,why:'The Sunday date and official schedule weaken the allegation. Check whether any separate Sunday service was announced before claiming more.',lesson:'Check original dates against primary timetables before alleging a cover-up.'},
 {id:'pier',zone:'Pixel Pier',title:'A storm photo out of time',brief:'An account claims a dramatic pier photo proves yesterday’s storm destroyed the boardwalk.',question:'Which finding is supported?',facts:[
 ['📷','Viral image','A cropped photo shows a wave breaking over the pier.','A photo may be real while its caption is wrong.'],
 ['🗞️','Photo archive','A public image archive published the full photograph four years ago.','Earlier publication disproves the claim that this is a new photo.'],
 ['🌤️','Weather bulletin','Yesterday’s official station summary reported clear skies and calm seas.','Independent records provide another way to check the date claim.']],
 options:['The image is genuine evidence of yesterday’s damage.','The old image has been reused with a misleading date; it does not establish yesterday’s damage.','The weather agency must have hidden the storm.'],correct:1,why:'The archive date is independent evidence against the new caption. The weather bulletin corroborates but does not alone rule out every local event.',lesson:'Reverse-search imagery and verify the original publication date.'},
 {id:'arcade',zone:'Circuit Arcade',title:'The counterfeit scoreboard',brief:'A leaderboard screenshot says a fictional esports team was banned. An official page and an imitation site disagree.',question:'Which source deserves priority?',facts:[
 ['🖥️','Unverified screenshot','A circulated leaderboard shows a “BANNED” stamp with no source URL.','Screenshots can be altered and lose provenance.'],
 ['🔗','Look-alike page','score-arcade.example imitates the championship layout.','A similar design or domain is not proof of authenticity.'],
 ['🏆','Official bulletin','The fictional championship organizer’s signed results bulletin lists the team as eligible.','The authorized organizer is a traceable primary source.']],
 options:['Trust the screenshot because it has more shares.','Prefer the verifiable organizer bulletin and document the contradiction without guessing who made the fake.','Use the look-alike site because its logo is bigger.'],correct:1,why:'Provenance, authorship and corroboration matter more than popularity or layout.',lesson:'Authenticate publishing sources; visual similarity is easy to fake.'},
 {id:'market',zone:'Mystery Market',title:'The price tag that traveled',brief:'A social post claims market prices doubled overnight. The shared chart omits its units and time frame.',question:'What would a careful report say?',facts:[
 ['📊','Shared chart','A bar chart jumps from 10 to 20 with no legend or units.','The numeric increase has no defined measurement.'],
 ['🧾','Original dataset','The published table identifies the values as a two-year total, not a daily price.','A source dataset can restore context lost in a chart.'],
 ['💬','Interview quote','A single shopper says items “feel expensive lately.”','An anecdote cannot establish the claimed daily change.']],
 options:['Prices doubled last night, as proven by the bars.','The chart is miscaptioned; the source does not substantiate overnight price doubling.','One shopper’s recollection establishes the market average.'],correct:1,why:'Look at the original units and time window. Even an accurate chart can be misused to tell the wrong story.',lesson:'Recover axis labels, units, and time windows before interpreting charts.'},
 {id:'tower',zone:'Clocktower Files',title:'The anonymous memo',brief:'A leaked-looking memo alleges wrongdoing by a fictional city office. Your mission is to distinguish evidence from speculation.',question:'What is the defensible final brief?',facts:[
 ['📜','Anonymous memo','A document lacks a signature, issue number and verified issuing office.','Unknown authorship limits confidence; a document’s appearance is insufficient.'],
 ['🏛️','Public register','The municipal register has no matching entry, but is not guaranteed complete.','Absence of an entry is an uncertainty, not proof that nothing happened.'],
 ['📰','Independent report','A local publication confirms a public meeting occurred, not the memo’s misconduct allegations.','Corroboration of one fact does not verify every allegation.']],
 options:['Publish a definite accusation against named staff.','State what is verified, flag the memo as unauthenticated, and specify evidence still needed.','Suppress all information because one source is uncertain.'],correct:1,why:'Separating documented events, unverified assertions, and missing records produces a reliable brief.',lesson:'Use calibrated confidence, evidence provenance and explicit limitations.'}
];
const KEY='trace-field-files-v1';
const $=id=>document.getElementById(id);
const make=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
let state={solved:[]},scene=0,collected=new Set(),submitted=false;
try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');if(Array.isArray(s.solved))state.solved=s.solved.filter(id=>CASES.some(c=>c.id===id))}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
function draw(){
 const root=$('trace-field-play');if(!root)return;
 const data=CASES[scene];
 root.replaceChildren();
 const head=make('div','ff-head');
 const info=make('div');info.append(make('span','ff-eyebrow','FIELD FILE '+String(scene+1).padStart(2,'0')+' / '+CASES.length),make('h3','',data.title),make('p','',data.brief));
 head.append(info,make('span','ff-case-stamp',state.solved.includes(data.id)?'✓ VERIFIED':'● ACTIVE'));root.append(head);
 const progress=make('div','ff-progress');progress.append(make('span','',state.solved.length+' / '+CASES.length+' field files verified'),make('span','',collected.size+' / 3 clues inspected'));root.append(progress);
 const sceneRoot=make('div','ff-scene');sceneRoot.setAttribute('aria-label','Interactive evidence scene');
 sceneRoot.append(make('div','ff-night', '✦   ·   ✧   ✦   ·   ✧'));
 const scenery=make('div','ff-scenery');
 for(let i=0;i<5;i++){const b=make('span','ff-building');b.style.height=(65+(i*17)%34)+'%';scenery.append(b)}
 sceneRoot.append(scenery);
 const clueLayer=make('div','ff-hotspots');
 data.facts.forEach((fact,i)=>{
  const button=make('button','ff-hotspot'+(collected.has(i)?' found':''),fact[0]);
  button.type='button';button.title='Examine '+fact[1];button.setAttribute('aria-label','Examine '+fact[1]);
  const caption=make('span','',collected.has(i)?'✓ '+fact[1]:fact[1]);button.append(caption);
  button.addEventListener('click',()=>{collected.add(i);draw();const e=$('ff-evidence-'+i);e?.focus();});
  clueLayer.append(button);
 });sceneRoot.append(clueLayer);root.append(sceneRoot);
 const evidence=make('div','ff-board');
 const evidenceHead=make('div','ff-board-head');evidenceHead.append(make('h4','','Evidence board'),make('span','',collected.size===3?'ALL CLUES FOUND':'SEARCH THE SCENE'));evidence.append(evidenceHead);
 const items=make('div','ff-evidence');
 data.facts.forEach((fact,i)=>{
  const card=make('article','ff-evidence-card'+(collected.has(i)?' inspected':''));
  card.id='ff-evidence-'+i;card.tabIndex=-1;
  card.append(make('strong','',fact[0]+' '+fact[1]));
  card.append(make('p','',collected.has(i)?fact[2]:'??? · Find this clue in the scene'));
  if(collected.has(i))card.append(make('small','', 'WHAT IT TELLS US · '+fact[3]));
  items.append(card);
 });evidence.append(items);root.append(evidence);
 const decision=make('section','ff-decision');decision.append(make('h4','',data.question));
 if(collected.size<3)decision.append(make('p','ff-lock','🔎 Inspect all three highlighted objects in the scene to unlock your conclusion.'));
 else{
  const opts=make('div','ff-options');
  data.options.forEach((option,i)=>{
   const b=make('button','ff-option'+(submitted&&i===data.correct?' correct':''),String.fromCharCode(65+i)+'. '+option);
   b.type='button';b.disabled=submitted;b.addEventListener('click',()=>{
    if(i===data.correct){submitted=true;if(!state.solved.includes(data.id)){state.solved.push(data.id);save()}draw()}
    else{const feedback=$('ff-feedback');feedback.textContent='Not yet. Compare the source and dates carefully; avoid claims beyond the evidence.';feedback.hidden=false;}
   });opts.append(b);
  });decision.append(opts);
 }
 const feedback=make('p','ff-feedback','');feedback.id='ff-feedback';feedback.hidden=true;
 if(submitted||state.solved.includes(data.id)){
  feedback.hidden=false;feedback.classList.add('success');
  feedback.textContent='✓ CASE VERIFIED · '+data.why+' Skill earned: '+data.lesson;
 }
 decision.append(feedback);root.append(decision);
 const actions=make('div','ff-actions');
 const prev=make('button','','← Previous scene');prev.type='button';prev.disabled=scene===0;prev.addEventListener('click',()=>choose(scene-1));
 const next=make('button','',scene===CASES.length-1?'Back to first scene':'Next scene →');next.type='button';next.addEventListener('click',()=>choose((scene+1)%CASES.length));
 const train=make('button','ff-primary','Continue 25-case Academy →');train.type='button';train.addEventListener('click',()=>{document.querySelector('#trace-campaign-continue')?.click();$('mission-stage')?.scrollIntoView({behavior:'smooth',block:'start'})});
 actions.append(prev,next,train);root.append(actions);
}
function choose(n){scene=Math.max(0,Math.min(CASES.length-1,n));collected=new Set();submitted=false;draw();$('trace-field-play')?.scrollIntoView({block:'nearest'})}
function init(){
 const mount=$('trace-field-play');if(!mount)return;
 const api=window.TraceAcademyFieldFiles=Object.freeze({cases:CASES.length,open:choose,progress:()=>({solved:state.solved.slice()}),reset:()=>{state.solved=[];save();choose(0)}});
 const launch=$('trace-field-launch');launch?.addEventListener('click',()=>{mount.hidden=false;choose(0);mount.scrollIntoView({behavior:'smooth',block:'start'})});
 const hub=$('trace-pixel-quest');
 const top=hub?.querySelector('.pq-head');
 if(top){
  const b=make('button','pq-big-button ff-launch','🔎 SEARCH A SCENE');b.type='button';
  b.addEventListener('click',()=>{mount.hidden=false;choose(0);mount.scrollIntoView({behavior:'smooth',block:'start'})});
  top.append(b);
 }
 draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
