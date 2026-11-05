/* Moodropolis — a reactive, local-save fictional city simulation. */
(function(){
'use strict';
const W=window.WorldKit,app=document.getElementById('app'),KEY='moodropolis-save-v1';
const names=[
 ['Lantern Square','🎠','gathering place','Maya','👩🏽‍🎨','curious and social'],
 ['Rosebay','🌸','quiet homes and gardens','Eli','👨🏻‍🍳','sensitive to noise'],
 ['Foundry Row','🏭','industry and labor','Tessa','👩🏿‍🏭','pragmatic and proud'],
 ['Cloud Gardens','🌲','green paths and play','Noor','🧑🏾‍🌾','community-minded'],
 ['Harbor Ward','⚓','waterside trade','Jules','👨🏼‍🚒','protective of neighbors'],
 ['Neon Mile','🎶','nightlife and arts','River','🧑🏼‍🎤','creative and adventurous'],
 ['School Hill','📚','families and learning','Ari','👩🏻‍🏫','careful and analytical'],
 ['Moon Market','🌜','independent shops','Sol','👨🏽‍🎨','inventive, worried about rent'],
 ['Riverbend','🏡','mixed-income housing','Pax','🧑🏿‍💻','introverted and steady']
];
const start={day:1,treasury:180,trust:57,environment:59,prosperity:51,actions:3,selected:0,heat:'mood',journal:[],event:null,report:false,residentDay:0,residentResult:null,medals:[],
districts:names.map((n,i)=>({mood:[69,65,42,73,49,76,67,54,58][i],stress:[28,39,70,25,57,36,42,61,58][i],trust:[70,64,37,69,46,59,65,52,51][i]}))};
let game=W.load(KEY,start);
if(!Array.isArray(game.districts)||game.districts.length!==9)game=W.copy(start);
const actions=[
 {id:'festival',icon:'🎉',name:'Host a block festival',cost:24,d:{mood:13,stress:-4,trust:5,prosperity:3,environment:-1},why:'Build belonging, but late events may annoy noise-sensitive neighbors.'},
 {id:'listen',icon:'🫶',name:'Open a listening circle',cost:10,d:{mood:5,stress:-9,trust:13},why:'Residents feel heard. Slow work without immediate revenue.'},
 {id:'housing',icon:'🏘️',name:'Repair and stabilize housing',cost:38,d:{mood:11,stress:-12,trust:7,prosperity:3},why:'Reduced insecurity costs real public funds.'},
 {id:'trees',icon:'🌱',name:'Plant shade and calm spaces',cost:29,d:{mood:7,stress:-7,trust:4,environment:12},why:'Safer, quieter spaces help residents recover.'},
 {id:'business',icon:'🛍️',name:'Back neighborhood shops',cost:21,d:{mood:6,stress:2,trust:3,prosperity:11},why:'Opportunity grows, with crowding and added activity.'},
 {id:'factory',icon:'⚙️',name:'Fast-track an industrial deal',cost:-32,d:{mood:-8,stress:11,trust:-11,prosperity:17,environment:-14},why:'Gain revenue, but damage ecology and trust.'}
];

// Every day a citizen brings a personal dilemma. A response is separate from the city budget actions.
const requests=[
 {question:'A little park was overtaken by an overnight music festival. A neighbor with sensory sensitivities asks for quiet.',options:[
  {name:'Create a quiet zone and offer an alternate stage',mood:5,stress:-10,trust:9,cost:7,why:'People with different needs both get space to belong.'},
  {name:'Keep the stage exactly as it is',mood:5,stress:9,trust:-6,cost:0,why:'Some residents celebrate while others lose a calming space.'}
 ]},
 {question:'A block is competing for a tiny public improvement grant. Residents disagree about shade trees and free Wi-Fi.',options:[
  {name:'Ask residents to design a shared plan',mood:5,stress:-4,trust:11,cost:8,why:'Community design slows delivery but strengthens trust.'},
  {name:'Select the quickest visible project',mood:8,stress:1,trust:-4,cost:4,why:'A ribbon-cutting helps morale, but not everyone feels heard.'}
 ]},
 {question:'The baker wants to hire teens for a summer apprentice program. Neighboring shops worry about losing workers.',options:[
  {name:'Fund a shared neighborhood apprenticeship',mood:9,stress:-2,trust:8,cost:10,why:'An equitable program spreads opportunity among shops.'},
  {name:'Support only the largest employer',mood:4,stress:5,trust:-6,cost:2,why:'Jobs arrive quickly, but smaller businesses feel sidelined.'}
 ]},
 {question:'After a hard week, a community organizer asks for a mural celebrating neighborhood stories.',options:[
  {name:'Invite local artists to paint the mural together',mood:10,stress:-6,trust:6,cost:12,why:'Public art becomes a lasting symbol of belonging.'},
  {name:'Buy a ready-made advertisement instead',mood:3,stress:2,trust:-3,cost:4,why:'A cheaper decoration is less personal.'}
 ]},
 {question:'The bus stop is crowded and exhausting during rush hour. Riders propose shade and a quieter waiting area.',options:[
  {name:'Build shade and a rest bench',mood:8,stress:-8,trust:7,cost:11,why:'Small accessibility changes improve many daily experiences.'},
  {name:'Add a colorful billboard to the stop',mood:2,stress:5,trust:-4,cost:6,why:'It brightens the view but does not address the stress.'}
 ]},
 {question:'A storm leaves an elderly resident isolated. Volunteers ask the city to coordinate doorstep check-ins.',options:[
  {name:'Match volunteers with people who opt in',mood:8,stress:-10,trust:10,cost:6,why:'Care and privacy are balanced with an opt-in approach.'},
  {name:'Post a public list of all older residents',mood:0,stress:10,trust:-13,cost:1,why:'Sharing personal details without consent damages safety and trust.'}
 ]}
];
const medalDefs=[
 {icon:'🏙️',name:'First Steps',ok:()=>game.day>=2},
 {icon:'💜',name:'City of Smiles',ok:()=>avg('mood')>=75},
 {icon:'🤝',name:'Trust Builder',ok:()=>game.trust>=75},
 {icon:'🌳',name:'Green Dream',ok:()=>game.environment>=80},
 {icon:'📬',name:'People Person',ok:()=>game.residentDay>0},
 {icon:'🗓️',name:'Long Haul',ok:()=>game.day>=15}
];
const currentRequest=()=>requests[(game.day+game.selected)%requests.length];
function citizenReply(i){
 if(game.event||game.residentDay===game.day)return;
 const m=currentRequest(),o=m.options[i];if(!o)return;
 if(game.treasury<o.cost){W.toast('The city needs '+o.cost+' credits to respond.');return}
 game.treasury-=o.cost;const d=game.districts[game.selected];d.mood+=o.mood;d.stress+=o.stress;d.trust+=o.trust;
 game.trust+=o.trust*.35;
 game.residentDay=game.day;game.residentResult=o.why;
 log('Resident letter from '+names[game.selected][0]+': '+o.name+'. '+o.why);
 window.WorldFX?.celebrate('💌');save();render()
}
function badges(){
 return '<div class="wfx-achievements" aria-label="City achievements">'+medalDefs.map(m=>'<span class="wfx-medal '+(game.medals.includes(m.name)?'':'is-locked')+'" title="'+W.escape(m.name)+'">'+m.icon+' '+W.escape(m.name)+'</span>').join('')+'</div>';
}
function residentChallenge(){
 const m=currentRequest(),done=game.residentDay===game.day;
 return '<div class="wfx-quest"><span class="overline">💌 THE CITIZEN POSTBOX · DAILY INTERACTIVE STORY</span><h3>'+names[game.selected][4]+' A note from '+W.escape(names[game.selected][3])+'</h3><p>'+W.escape(m.question)+'</p>'+
 (game.event?'<p class="note">Resolve the citywide emergency before answering a letter.</p>':done?'<div class="wfx-link-result">✓ You responded today. '+W.escape(game.residentResult||'Citizens noticed your choice.')+'<br>Come back on the next day for another request.</div>':
 '<div class="wfx-quest-choice">'+m.options.map((o,i)=>'<button data-resident="'+i+'" '+(game.treasury<o.cost?'disabled':'')+'><strong>'+W.escape(o.name)+'</strong><small style="display:block;margin-top:5px">'+o.cost+' credits · See the effects on your city</small></button>').join('')+'</div>')+'</div>';
}

const events=[
 {title:'A hot week arrives',desc:'Apartments near the factories are overheating. Relief is urgently needed.',opts:[
  {name:'Open public cooling centers · -28',money:-28,trust:7,mood:8,stress:-10,why:'Protect residents immediately and build trust.'},
  {name:'Offer voluntary heat guidance · -4',money:-4,trust:-3,mood:-3,stress:4,why:'Cheap advice reaches fewer people without safe places to go.'}
 ]},
 {title:'The neighborhood arts weekend',desc:'Performers want to fill the streets. Others worry about noise and rest.',opts:[
  {name:'Accessible stages and quiet hours · -20',money:-20,trust:6,mood:8,stress:-2,why:'Respect many sensory needs while preserving culture.'},
  {name:'Unrestricted all-night events · +14',money:14,trust:-6,mood:5,stress:10,why:'Collect fees, but residents needing rest feel ignored.'}
 ]},
 {title:'A housing cooperative proposes a deal',desc:'A local group wants to restore vacant homes and preserve affordable rents.',opts:[
  {name:'Match the cooperative grant · -34',money:-34,trust:10,mood:9,stress:-8,why:'Invest in stability and belonging.'},
  {name:'Auction land to a high bidder · +27',money:27,trust:-10,mood:-7,stress:8,why:'Fast revenue, with growing fears of displacement.'}
 ]},
 {title:'A transit rumor goes viral',desc:'A false story claims a closure is designed to remove residents.',opts:[
  {name:'Publish evidence and hold a meeting · -9',money:-9,trust:12,mood:4,stress:-5,why:'Transparency offers the public something verifiable.'},
  {name:'Ignore the claims · 0',money:0,trust:-10,mood:-5,stress:8,why:'Silence lets uncertainty spread.'}
 ]}
];
const num=v=>Math.round(v),avg=k=>num(game.districts.reduce((s,d)=>s+d[k],0)/9);
const tidy=()=>{game.treasury=num(game.treasury);['trust','environment','prosperity'].forEach(k=>game[k]=W.clamp(game[k]));game.districts.forEach(d=>['mood','stress','trust'].forEach(k=>d[k]=W.clamp(d[k])))};
const save=()=>{tidy();if(!Array.isArray(game.medals))game.medals=[];medalDefs.forEach(m=>{if(m.ok()&&!game.medals.includes(m.name))game.medals.push(m.name)});W.save(KEY,game)};
const rank=()=>{const v=avg('mood')*.45+game.trust*.25+game.environment*.2+game.prosperity*.1;return v>=78?'City of Care':v>=61?'Rising Together':v>=46?'Finding Its Way':'Under Pressure'};
function story(i){
 const n=names[i],d=game.districts[i];
 if(d.stress>70)return n[3]+' feels overwhelmed by uncertainty and overdue repairs.';
 if(d.mood>78&&d.trust>65)return n[3]+' organized a neighborhood surprise. More people are helping each other.';
 if(d.trust<40)return n[3]+' says no one is listening at city hall.';
 if(d.mood<45)return n[3]+' has withdrawn from local events to conserve energy.';
 return n[3]+' sees small changes but wants to know if they will last.';
}
function change(delta,d,mult){
 Object.keys(delta).forEach(k=>{if(['mood','stress','trust'].includes(k))d[k]+=delta[k]*mult;else if(k==='prosperity'||k==='environment')game[k]+=delta[k]*mult});
}
function log(t){game.journal.push({when:'DAY '+game.day,text:t});game.journal=game.journal.slice(-80)}
function report(){return [
 'MOODROPOLIS / CITY INTELLIGENCE REPORT','Fictional city of Moodropolis · Day '+game.day,
 'Condition: '+rank(),'Average mood: '+avg('mood')+'/100; stress: '+avg('stress')+'/100',
 'Trust: '+num(game.trust)+'/100; Environment: '+num(game.environment)+'/100',
 'Treasury: '+num(game.treasury)+' credits; Prosperity: '+num(game.prosperity)+'/100','',
 'DISTRICT SNAPSHOT',
 ...names.map((n,i)=>n[0]+': mood '+num(game.districts[i].mood)+', stress '+num(game.districts[i].stress)+', trust '+num(game.districts[i].trust)),
 '','IMPLICATIONS','Decisions influence the happiness, stress, and trust of residents differently. Better average outcomes may conceal unequal local experiences.',
 'This is a fictional model, not a measurement of real people or communities.',
 '','ACHIEVEMENTS',...(game.medals||[]),'','YOUR DECISIONS',...game.journal.map(j=>j.when+': '+j.text)
 ].join('\n')}
function act(id){
 const a=actions.find(x=>x.id===id);if(!a||game.event||game.actions<=0)return;
 if(a.cost>game.treasury){W.toast('Insufficient funds: try a cheaper policy or advance the day.');return}
 game.treasury-=a.cost;change(a.d,game.districts[game.selected],1);game.trust+=(a.d.trust||0)*.4;
 for(let i=0;i<9;i++)if(i!==game.selected&&Math.abs(Math.floor(i/3)-Math.floor(game.selected/3))+Math.abs(i%3-game.selected%3)===1)change(a.d,game.districts[i],.15);
 game.actions--;log(a.name+' in '+names[game.selected][0]+'. '+a.why);window.WorldFX?.burst(window.innerWidth*.5,window.innerHeight*.5,'🌟');
 if(game.actions===0)W.toast('Daily actions used. Advance to a new day.');save();render()
}
function newDay(){
 if(game.event)return;
 game.day++;game.actions=3;
 const revenue=12+num(game.prosperity/8);game.treasury+=revenue-10;
 game.districts.forEach((d,i)=>{d.mood+=(game.environment-50)*.012-(d.stress-40)*.015;d.stress+=1.7+(game.prosperity<35?1.2:0);d.trust+=(game.trust-d.trust)*.015;if(game.day%4===0&&i===Math.floor(game.day/4)%9)d.mood-=4});
 if(game.day%3===0){game.event=events[(game.day/3-1)%events.length].title;log('Citywide event: '+game.event)}
 else log('Daily revenue: '+revenue+' credits. Maintenance: 10. Conditions continue to evolve.');
 if(game.day%5===0)W.chronicle('Moodropolis','On day '+game.day+', the city is '+rank().toLowerCase()+' with a mood score of '+avg('mood')+'.');
 save();render()
}
function eventChoice(i){
 const ev=events[(game.day/3-1)%events.length],c=ev&&ev.opts[i];if(!c||!game.event)return;
 if(c.money<0&&game.treasury<-c.money){W.toast('Not enough treasury for this response.');return}
 game.treasury+=c.money;game.trust+=c.trust;game.districts.forEach(d=>{d.mood+=c.mood;d.stress+=c.stress;d.trust+=c.trust*.5});game.event=null;
 log(c.name+'. '+c.why);save();render()
}
function tile(n,i){
 const d=game.districts[i],metric=game.heat==='mood'?d.mood:game.heat==='stress'?100-d.stress:d.trust;
 return '<button class="district '+(metric>=68?'high':metric>=44?'mid':'low')+(game.selected===i?' selected':'')+'" data-district="'+i+'" aria-pressed="'+(game.selected===i)+'" aria-label="'+W.escape(n[0])+': '+num(metric)+'"><span class="bubble">'+num(game.heat==='stress'?d.stress:metric)+'</span><span class="emoji">'+(d.mood<35?'🏚️':d.mood>82?'🌈':n[1])+'</span><span><strong>'+W.escape(n[0])+'</strong><small>'+W.escape(n[2])+'</small></span></button>';
}
function render(){
 const d=game.districts[game.selected],n=names[game.selected],ev=game.event&&events[(game.day/3-1)%events.length];
 const map=window.WorldFX.sceneCity(game.day,n[3],num(d.mood),n[0])+'<div class="heat-tabs" aria-label="Map metric">'+[['mood','😊 Happiness'],['stress','🌧️ Stress'],['trust','🤝 Trust']].map(t=>'<button data-heat="'+t[0]+'" class="'+(game.heat===t[0]?'active':'')+'">'+t[1]+'</button>').join('')+'</div><div class="district-grid">'+names.map(tile).join('')+'</div><p class="note">Green = healthier conditions · Pink = mixed · Peach = needs attention. Lower stress is better.</p>';
 const choices=ev?'<div class="scene"><span class="overline">CITYWIDE EVENT · DECISION REQUIRED</span><h3>'+W.escape(ev.title)+'</h3><p>'+W.escape(ev.desc)+'</p><div class="choices">'+ev.opts.map((c,i)=>'<button class="option" data-event="'+i+'" '+(c.money<0&&game.treasury<-c.money?'disabled':'')+'><b>'+W.escape(c.name)+'</b><small>'+W.escape(c.why)+'</small></button>').join('')+'</div></div>':'<div class="action-grid">'+actions.map(a=>'<button class="choice" data-act="'+a.id+'" '+(game.actions<1||a.cost>game.treasury?'disabled':'')+'><span><b>'+a.icon+' '+W.escape(a.name)+'</b><small>'+(a.cost>=0?'Spend '+a.cost:'Gain '+-a.cost)+' credits · '+W.escape(a.why)+'</small></span></button>').join('')+'</div>';
 let html='<div class="maincol">';
 html+='<section class="panel"><span class="overline">CITY PULSE · DAY '+game.day+'</span><h2>'+rank()+'</h2><p class="subline">Nine connected neighborhoods. Choose one on the map and decide how to help. Policies spill into adjoining blocks.</p><div class="statgrid">'+W.stat('Average mood',avg('mood'))+W.stat('City stress',avg('stress'))+W.stat('Public trust',num(game.trust))+'</div></section>';
 html+='<section class="panel"><span class="overline">INTERACTIVE DISTRICT MAP</span><h2>Your city, alive</h2><p class="subline">Tap a district. Watch its expression change as the city grows.</p>'+map+'</section>';
 html+='<section class="panel"><span class="overline">NEIGHBORHOOD STORIES</span><h2>'+W.escape(n[0])+'</h2><p class="subline">'+W.escape(n[2])+' · Every citizen has different priorities.</p><div class="callout"><strong>'+n[4]+' '+W.escape(n[3])+'</strong> · '+W.escape(n[5])+'<p>'+W.escape(story(game.selected))+'</p></div><div class="statgrid" style="margin-top:13px">'+W.stat('Mood',num(d.mood))+W.stat('Stress',num(d.stress))+W.stat('Local trust',num(d.trust))+'</div></section>';
 html+='<section class="panel"><span class="overline">CITY HALL · '+game.actions+' ACTIONS LEFT</span><h2>Help '+W.escape(n[0])+'</h2><p class="subline">Balance care, money, opportunity, environment and trust.</p>'+choices+'<div class="button-row" style="margin-top:14px"><button class="button" data-next '+(ev?'disabled':'')+'>☀️ Start day '+(game.day+1)+' →</button><span class="pill">💰 '+num(game.treasury)+' city credits</span></div></section>';
 html+='<section class="panel"><h2>The citizens have a voice</h2>'+residentChallenge()+'</section>';
 html+='<section class="panel"><h2>Citizen voices</h2><p class="subline">Happy averages never tell the whole story.</p><div class="citizens">'+names.slice(0,6).map((person,i)=>'<div class="citizen"><span class="avatar">'+person[4]+'</span><div><strong>'+W.escape(person[3])+' · '+W.escape(person[0])+'</strong><p>'+W.escape(story(i))+'</p></div></div>').join('')+'</div></section></div>';
 html+='<aside class="sidecol"><section class="panel"><h2>City achievements</h2><p class="note">Earn milestones by caring for people and keeping the city healthy.</p>'+badges()+'</section><section class="panel"><h2>City resources</h2><div class="statgrid">'+W.stat('Prosperity',num(game.prosperity))+W.stat('Ecology',num(game.environment))+W.stat('Treasury',num(game.treasury),'',250)+'</div><p class="note">Daily taxes arrive, maintenance costs 10 credits and stress builds without intervention.</p></section>';
 html+='<section class="panel"><h2>City planner</h2><p class="note">Build a happy, fair city without abandoning its smallest neighborhoods. Your city saves automatically on this device.</p><div class="button-row"><button class="button-quiet" data-report>📋 '+(game.report?'Hide':'Open')+' city report</button><button class="button-quiet" data-download>↓ Export report</button><button class="button-quiet" data-reset>↺ Start over</button></div></section>';
 html+='<section class="panel"><h2>Decision journal</h2>'+W.journal(game.journal)+'</section></aside>';
 if(game.report)html+='<section class="panel" style="grid-column:1/-1"><span class="overline">CITY INTELLIGENCE</span><h2>Your city report</h2><pre style="white-space:pre-wrap;font:12px/1.7 inherit;overflow-wrap:anywhere">'+W.escape(report())+'</pre></section>';
 app.innerHTML=html;
}
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-district')){game.selected=Number(b.dataset.district);save();render()}
 else if(b.hasAttribute('data-heat')){game.heat=b.dataset.heat;save();render()}
 else if(b.dataset.act)act(b.dataset.act);
 else if(b.hasAttribute('data-next'))newDay();
 else if(b.hasAttribute('data-event'))eventChoice(Number(b.dataset.event));
 else if(b.hasAttribute('data-resident'))citizenReply(Number(b.dataset.resident));
 else if(b.hasAttribute('data-report')){game.report=!game.report;save();render()}
 else if(b.hasAttribute('data-download'))W.download('Moodropolis-city-report.txt',report());
 else if(b.hasAttribute('data-reset'))W.reset(KEY,'Moodropolis');
});
save();render();
})();