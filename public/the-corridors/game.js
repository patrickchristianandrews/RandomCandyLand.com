/* The Corridors — branching fictional political-career simulation. */
(function(){
'use strict';
const W=window.WorldKit,app=document.getElementById('app'),KEY='corridors-save-v1';
const start={chapter:0,influence:36,knowledge:32,relationships:53,reputation:55,ethics:70,trust:54,actors:[51,55,45,52,48,50],role:'Policy aide',journal:[],pending:null,report:false,finished:false,consulted:[],briefing:null,medals:[]};
let state=W.load(KEY,start);
if(!Array.isArray(state.actors)||state.actors.length!==6)state=W.copy(start);
const factions=[
 ['Residents','🏘️','Daily life and services'],['Business council','🏦','Investment and contracts'],['Labor coalition','🛠️','Workers and protections'],['Press','📰','Information and accountability'],['Civic watchdog','🔎','Oversight and integrity'],['City leadership','🏛️','Coalitions and political power']
];
const scenes=[
 {tag:'CHAPTER 01 · PUBLIC PROMISES',title:'The Blue Line Promise',
  story:'A transit corridor to low-income neighborhoods was promised during a campaign. Funds are now short, and a wealthy developer offers an easier route serving its offices.',
  legal:'A campaign promise is politically meaningful but normally not an enforceable contract. Transportation approvals and funding still require the fictional city’s formal process.',
  visible:'The mayor claims a practical route change will deliver reliable transport faster.',private:'The developer sees a windfall; transit riders fear another broken promise.',who:'Residents, developer, finance committee.',
  choices:[
   {name:'Publish the shortfall and negotiate a phased route',pitch:'Build a transparent coalition before a public vote.',effect:[-2,9,5,9,11,10],actors:[12,-3,8,6,10,-3],legality:'Formal public review and disclosed trade-offs improve accountability.',impact:'Some residents wait longer, but the plan preserves their seats at the table.',flags:'Disclosed planning compromise'},
   {name:'Quietly move the route toward private offices',pitch:'Rapid political and donor support, but riders feel betrayed.',effect:[14,-3,8,-17,-18,-19],actors:[-22,20,-7,-16,-18,15],legality:'Fictional ethics rules require disclosure of material conflicts. Concealment invites an oversight inquiry.',impact:'The new corridor is funded, but trust and original access suffer.',flags:'Undisclosed developer benefit'},
   {name:'Reject the developer and demand the complete original route',pitch:'Defend the promise but accept a costly delay.',effect:[-10,4,-7,7,8,7],actors:[14,-13,6,3,6,-13],legality:'A good-faith position still needs appropriations, procurement and legal approval.',impact:'Transit riders appreciate the fight; the budget committee resists.',flags:'Full-route commitment'}
  ]},
 {tag:'CHAPTER 02 · MONEY & ACCESS',title:'The Donor Dinner',
  story:'A contractor bidding for The city's new shelters offers to host an expensive private fundraiser. The official in charge of awarding the contract has been invited.',
  legal:'Gift, campaign-finance and procurement rules differ in real jurisdictions. The fictional jurisdiction requires disclosure, recusal when a conflict exists and fair procurement.',
  visible:'Leadership calls the event a routine way to raise campaign money.',private:'A bidder wants access before competing proposals are scored.',who:'Campaign donors, contract bidders, procurement staff.',
  choices:[
   {name:'Decline; document and report the invitation',pitch:'Protect procurement integrity even if campaign funding dries up.',effect:[-5,10,-3,12,15,10],actors:[9,-13,4,7,16,-5],legality:'Declining and documenting a potential conflict supports independent review.',impact:'The bidder loses privileged access; staff can evaluate proposals fairly.',flags:'Procurement conflict escalated'},
   {name:'Attend privately but promise no favors',pitch:'Gain access and money while relying on informal assurances.',effect:[12,-4,11,-10,-15,-10],actors:[-12,17,-2,-13,-17,12],legality:'A promise of neutrality does not itself remove a conflict or disclosure duty.',impact:'Favors may never be spoken aloud, but competing bidders question the process.',flags:'Private donor access'},
   {name:'Meet in a logged public procurement briefing',pitch:'Keep dialogue open with equal access for all eligible bidders.',effect:[3,13,6,8,11,9],actors:[8,6,3,9,11,1],legality:'An equal-opportunity, documented process is a better defense against favoritism.',impact:'All bidders can ask questions; no one receives a special advantage.',flags:'Open bidder briefing'}
  ]},
 {tag:'CHAPTER 03 · CRISIS POWERS',title:'A Citywide Emergency',
  story:'A major storm blocks access to shelters. The executive office considers an emergency order bypassing ordinary bidding and limiting public assembly around relief sites.',
  legal:'Emergency authority is often bounded by law, necessity, duration, and judicial or legislative oversight. This fictional city requires written reasons and timely review.',
  visible:'Officials promise decisive action to protect life and public safety.',private:'Shortcuts can get aid moving but also concentrate power without safeguards.',who:'Emergency response, civil liberties groups, relief contractors.',
  choices:[
   {name:'Issue a narrow, time-limited emergency order',pitch:'Document necessity and schedule review while opening shelters.',effect:[7,10,6,10,13,12],actors:[12,2,10,5,13,7],legality:'A limited order with notice, an expiration date and oversight respects safeguards.',impact:'Aid is faster, while restrictions and contracting remain reviewable.',flags:'Scoped emergency authority'},
   {name:'Grant indefinite authority and restrict criticism',pitch:'Centralize control to avoid dissent and delays.',effect:[19,-8,-1,-23,-26,-23],actors:[-26,10,-13,-23,-25,17],legality:'An indefinite restriction of criticism raises severe civil-liberties concerns and is challengeable.',impact:'Action is fast; public scrutiny and rights are weakened.',flags:'Overbroad emergency power'},
   {name:'Refuse every emergency measure until full hearings',pitch:'Prioritize ordinary process despite worsening urgency.',effect:[-11,6,-10,-5,6,-12],actors:[-12,-2,-9,3,7,-16],legality:'Oversight matters, but failure to meet urgent public needs has consequences.',impact:'Rights are protected formally, yet delayed shelters leave people exposed.',flags:'Emergency relief delayed'}
  ]},
 {tag:'CHAPTER 04 · INSTITUTIONS',title:'The School Budget Bargain',
  story:'A majority coalition will support your school mental-health funding only if you also back an unrelated waterfront tax break. Teachers are publicly divided.',
  legal:'Policy bargaining can be lawful, but hidden commitments, improper personal benefits or exclusion of mandatory public procedures can trigger ethics problems.',
  visible:'Council members advertise the package as a bipartisan breakthrough.',private:'A tax break has powerful backers while school programs compete for limited funds.',who:'Parents, teachers, developers, budget analysts.',
  choices:[
   {name:'Separate the votes and publish cost estimates',pitch:'Risk losing the coalition in order to make trade-offs visible.',effect:[-4,12,-5,13,14,11],actors:[12,-9,10,12,15,-10],legality:'Separate transparent votes allow scrutiny of each proposal.',impact:'Voters can hold members accountable; the school program could fail.',flags:'Transparent school votes'},
   {name:'Accept the package and disclose its financing',pitch:'Secure funding now with a controversial public trade-off.',effect:[12,7,9,-2,2,2],actors:[4,13,10,1,3,14],legality:'A disclosed political bargain is not automatically illegal; fair process is still essential.',impact:'Students gain support, while the tax break shifts future public revenue.',flags:'Disclosed legislative bargain'},
   {name:'Arrange an undisclosed side benefit for a swing vote',pitch:'Lock down support without telling the public.',effect:[18,-6,15,-22,-29,-22],actors:[-20,16,-13,-15,-27,13],legality:'Personal benefits exchanged for official action can implicate serious corruption rules.',impact:'A quick vote creates a dangerous private obligation.',flags:'Suspected improper quid pro quo'}
  ]},
 {tag:'CHAPTER 05 · CONTRACTS & EVIDENCE',title:'The Harborview Tender',
  story:'An anonymous tip alleges that a shelter contract bid was altered after the deadline. One supplier is close to a powerful official. The bidding files may become evidence in court.',
  legal:'The fictional procurement code requires accurate records, fair evaluation and preservation of potential evidence. Suspicion is not proof of wrongdoing.',
  visible:'The city says the award was based on the lowest compliant price.',private:'Staff fear retaliation, and a rushed accusation could damage innocent people.',who:'Procurement officials, bidders, whistleblower, city attorney.',
  choices:[
   {name:'Preserve records, protect the source, seek independent review',pitch:'Investigate discreetly without prejudging guilt.',effect:[3,16,-1,14,20,15],actors:[10,-5,9,12,19,-6],legality:'Preserving the original records and following due process supports a reliable investigation.',impact:'The city may face delay, but evidence remains testable.',flags:'Harborview records preserved'},
   {name:'Delete the tip and approve the award immediately',pitch:'Keep a friendly contractor and avoid scrutiny.',effect:[15,-13,6,-22,-30,-23],actors:[-21,15,-12,-17,-30,14],legality:'Destroying potential records may be unlawful. This is a cautionary fictional scenario.',impact:'An investigator could later uncover missing records and lost trust.',flags:'Harborview records threatened'},
   {name:'Accuse the contractor publicly before verification',pitch:'Project toughness while bypassing basic fact-finding.',effect:[6,-8,-9,-11,-8,-12],actors:[-10,-16,3,8,-9,-8],legality:'Unverified public accusations risk unfairness and undermine trustworthy evidence.',impact:'An innocent supplier may be harmed before any hearing.',flags:'Unverified Harborview accusation'}
  ]},
 {tag:'CHAPTER 06 · INFORMATION & PRESSURE',title:'The Blackout Records',
  story:'City employees discover that communications about a power outage contradict the official timeline. A journalist requests records while the mayor’s team pressures staff to keep silent.',
  legal:'Public-records access, privileged information, privacy and whistleblower protections involve different rules. The fictional jurisdiction requires preservation, lawful review and timely responses.',
  visible:'The administration describes the outage response as coordinated and effective.',private:'Embarrassing documents reveal confusion but also contain residents’ private contact details.',who:'Reporter, utility staff, privacy officer, mayor.',
  choices:[
   {name:'Preserve files, redact private data and follow the records process',pitch:'Make the public story accurate without exposing private people.',effect:[1,16,4,14,16,14],actors:[13,-1,7,17,18,-7],legality:'Lawful access with privacy safeguards balances transparency and confidentiality.',impact:'The administration absorbs criticism while residents keep their privacy.',flags:'Lawful outage disclosure'},
   {name:'Leak unredacted records from a private account',pitch:'Get the truth out fast, without checking protected information.',effect:[5,-5,-2,-10,-12,-9],actors:[-1,-7,0,10,-11,-17],legality:'Uncontrolled disclosure of protected data can cause new harms and legal exposure.',impact:'A truthful story may still harm residents whose details were exposed.',flags:'Privacy-endangering leak'},
   {name:'Alter the timeline and deny the records exist',pitch:'Protect leadership from embarrassment for now.',effect:[14,-14,7,-25,-28,-27],actors:[-23,7,-12,-21,-27,16],legality:'Falsifying records and obstructing lawful disclosure threaten rule-of-law safeguards.',impact:'A cover-up can grow beyond the original outage failures.',flags:'Outage timeline concealed'}
  ]},
 {tag:'CHAPTER 07 · THE FINAL VOTE',title:'Who Actually Governs?',
  story:'Your final deal is on the council floor: affordable housing, a transit extension, and a public oversight office. You cannot fund every promise. The deciding vote is yours to negotiate.',
  legal:'Budgets, public notice, procurement controls, oversight and legislative votes constrain what any official can promise. Power operates through institutions, not just individuals.',
  visible:'Each faction calls its version of the plan the city’s best future.',private:'Alliances demand concessions. Your previous record determines how believable your final promise sounds.',who:'Voters, investors, press, labor, city attorney.',
  choices:[
   {name:'Fund oversight and housing; phase transit transparently',pitch:'Put credibility and long-term trust above a dramatic launch.',effect:[2,13,6,16,17,15],actors:[15,-5,13,13,19,-2],legality:'Publicly funded oversight and a transparent phasing plan make choices reviewable.',impact:'Most residents gain stability; some wait for the transit line.',flags:'Institutional reform legacy'},
   {name:'Split funding evenly after a public negotiation',pitch:'Trade speed for a working coalition.',effect:[10,10,13,5,7,7],actors:[8,8,8,7,5,11],legality:'Compromise within lawful budget limits is an ordinary part of governance.',impact:'No faction gets everything, but the city can proceed.',flags:'Coalition compromise legacy'},
   {name:'Promise everything and secretly divert oversight funds',pitch:'Win applause today while leaving the numbers unworkable.',effect:[18,-14,8,-25,-32,-24],actors:[-20,15,-9,-20,-28,19],legality:'Misstating appropriations and diverting restricted funds could lead to serious oversight or legal action.',impact:'The city gets a grand announcement and fragile institutions.',flags:'Unfunded promises legacy'}
  ]}
];

const briefingLines=[
 'Residents need improvements, not slogans. They are watching which neighborhoods lose out.',
 'Investors favor speed, but private special treatment could poison later contracts.',
 'Frontline workers know the risks and costs that official plans leave out.',
 'Reporters compare official claims with budgets, meeting minutes and primary records.',
 'Independent oversight asks: who has authority, who benefits, and which records exist?',
 'Leadership wants votes now. Political alliances often attach strings to a promise.'
];
const medalDefs=[
 {icon:'🚪',name:'First Door',ok:()=>state.chapter>=1},
 {icon:'🗣️',name:'The Listener',ok:()=>state.journal.some(x=>x.text.startsWith('Stakeholder briefing:'))},
 {icon:'🤝',name:'Public Trust',ok:()=>state.trust>=75},
 {icon:'🧭',name:'Steady Compass',ok:()=>state.ethics>=90},
 {icon:'🏛️',name:'Government Insider',ok:()=>state.chapter>=4},
 {icon:'🏅',name:'The Legacy',ok:()=>state.finished}
];
function consult(i){
 if(state.finished||state.pending!==null||i<0||i>=factions.length||state.consulted.includes(i)||state.consulted.length>=2)return;
 state.consulted.push(i);state.briefing={actor:factions[i][0],text:briefingLines[i]};
 state.knowledge+=5;state.relationships+=2;state.influence-=1;state.actors[i]+=6;
 if(i===0||i===4)state.trust+=2;
 state.journal.push({when:'CHAPTER '+(state.chapter+1),text:'Stakeholder briefing: '+factions[i][0]+'. '+briefingLines[i]});
 window.WorldFX?.celebrate('🗣️');save();render()
}
function stakeholderDesk(){
 const used=state.consulted.length;
 return '<div class="wfx-quest"><span class="overline">WHISPER NETWORK · '+used+'/2 CONSULTATIONS</span><h3>Who will you meet behind the scenes?</h3>'+
 (state.briefing?'<div class="wfx-briefing"><strong>🎙️ '+W.escape(state.briefing.actor)+'</strong><p>'+W.escape(state.briefing.text)+'</p></div>':'<p>Listen to two stakeholder perspectives before committing to a political decision.</p>')+
 '<div class="wfx-intel-grid">'+factions.map((a,i)=>'<button data-consult="'+i+'" '+(state.consulted.includes(i)||used>=2?'disabled':'')+'><span class="emoji">'+a[1]+'</span><b>'+W.escape(a[0])+'</b><small>'+(state.consulted.includes(i)?'✓ Interviewed':'+5 knowledge · +6 support')+'</small></button>').join('')+'</div></div>';
}
function powerWeb(){
 const pts=[[160,31],[267,89],[251,219],[160,258],[65,219],[51,89]];
 return '<svg class="wfx-faction-svg" viewBox="0 0 320 290" role="img" aria-label="Animated relationship network with all six power factions">'+
 '<circle cx="160" cy="145" r="49" fill="#263d60" stroke="#e2c489" stroke-width="3"/><text x="160" y="145" text-anchor="middle" font-size="28">🏛️</text><text x="160" y="174" text-anchor="middle" font-size="11" fill="#f3d7a4" font-weight="900">YOU</text>'+
 pts.map((p,i)=>'<line x1="160" y1="145" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#dfba7d" stroke-width="'+Math.max(2,num(state.actors[i])/15)+'" opacity="'+(.25+state.actors[i]/150)+'"/>').join('')+
 pts.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="29" fill="'+(state.actors[i]>65?'#327a74':state.actors[i]<35?'#82515d':'#456085')+'" stroke="#f3d7a4" stroke-width="2"/><text x="'+p[0]+'" y="'+(p[1]-1)+'" text-anchor="middle" font-size="23">'+factions[i][1]+'</text><text x="'+p[0]+'" y="'+(p[1]+18)+'" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">'+num(state.actors[i])+'</text>').join('')+'</svg>';
}
const badgeRow=()=>'<div class="wfx-achievements">'+medalDefs.map(m=>'<span class="wfx-medal '+(state.medals.includes(m.name)?'':'is-locked')+'">'+m.icon+' '+W.escape(m.name)+'</span>').join('')+'</div>';

const keys=['influence','knowledge','relationships','reputation','ethics','trust'];
const num=v=>Math.round(v);
const save=()=>{keys.forEach(k=>state[k]=W.clamp(state[k]));state.actors=state.actors.map(v=>W.clamp(v));if(!Array.isArray(state.medals))state.medals=[];medalDefs.forEach(m=>{if(m.ok()&&!state.medals.includes(m.name))state.medals.push(m.name)});W.save(KEY,state)};
const currentRole=()=>{if(state.chapter>=6)return 'Executive decision-maker';if(state.chapter>=4)return 'Chief policy negotiator';if(state.chapter>=2)return 'Committee strategist';return 'Policy aide'};
const ending=()=>{
 if(state.ethics<32)return 'Power Without Legitimacy';
 if(state.trust>=73&&state.ethics>=75&&state.reputation>=67)return 'Trusted Public Steward';
 if(state.influence>=75&&state.reputation>=48)return 'The Coalition Architect';
 if(state.knowledge>=75&&state.ethics>=65)return 'Guardian of the Process';
 return 'The Working Negotiator';
};
function makeReport(){return ['THE CORRIDORS / INSIDE THE DECISION','A fictional political-career simulation','Role: '+currentRole(),'Chapters completed: '+Math.min(state.chapter,scenes.length)+' / '+scenes.length,
'Public trust: '+num(state.trust)+'; Influence: '+num(state.influence)+'; Knowledge: '+num(state.knowledge),
'Reputation: '+num(state.reputation)+'; Relationships: '+num(state.relationships)+'; Ethics: '+num(state.ethics),'',
state.finished?'CAREER OUTCOME: '+ending():'CAREER IN PROGRESS','',
'RELATIONSHIP WEB',...factions.map((f,i)=>f[0]+': '+num(state.actors[i])+'/100'),'',
'CAREER ACHIEVEMENTS',...(state.medals||[]),'','DECISION RECORD',...state.journal.map(j=>j.when+': '+j.text),
'','This simulation uses imagined Meridian rules and simplified legal concepts. It is educational entertainment, not legal advice.'].join('\n')}
function choose(i){
 if(state.finished||state.pending!==null)return;
 const scene=scenes[state.chapter],opt=scene&&scene.choices[i];if(!opt)return;
 keys.forEach((k,n)=>state[k]+=opt.effect[n]);state.actors=state.actors.map((v,n)=>v+opt.actors[n]);
 state.role=currentRole();state.pending=i;window.WorldFX?.celebrate('🚪');
 state.journal.push({when:'CHAPTER '+(state.chapter+1),text:opt.name+'. '+opt.impact+' Rule: '+opt.legality});
 W.chronicle('The Corridors',opt.flags+'; policy consequence: '+opt.impact);
 save();render()
}
function next(){
 if(state.pending===null||state.finished)return;
 state.chapter++;state.pending=null;state.consulted=[];state.briefing=null;window.WorldFX?.celebrate('🏛️');
 if(state.chapter>=scenes.length)state.finished=true;
 state.role=currentRole();save();render();window.scrollTo({top:0,behavior:'smooth'})
}
function sceneHtml(){
 if(state.finished)return '<section class="panel ending"><div class="big">🏛️</div><span class="overline">CAREER COMPLETE · CITYWIDE LEGACY</span><h2>'+W.escape(ending())+'</h2><p>Every political choice changed the people and institutions around you. Your public story and your private trail are not the same.</p><div class="statgrid" style="margin:20px 0">'+W.stat('Integrity',num(state.ethics))+W.stat('Public trust',num(state.trust))+W.stat('Influence',num(state.influence))+'</div><div class="button-row" style="justify-content:center"><button class="button" data-report>Read your legacy report</button><button class="button-quiet" data-download>Export career dossier</button></div></section>';
 const sc=scenes[state.chapter],opt=state.pending!==null?sc.choices[state.pending]:null;
 let h='<section class="panel"><span class="overline">'+W.escape(sc.tag)+'</span><h2>'+W.escape(sc.title)+'</h2><p class="subline">Fictional city hall · You hold one vote, but many people can influence it.</p><div class="scene"><h3>Behind the chamber doors</h3><p>'+W.escape(sc.story)+'</p><div class="compare"><div><strong>📣 PUBLIC MESSAGE</strong><p>'+W.escape(sc.visible)+'</p></div><div><strong>🤫 PRIVATE PRESSURE</strong><p>'+W.escape(state.consulted.length>0||state.pending!==null?sc.private:'Classified until you talk to a stakeholder below.')+'</p></div></div><p class="note"><strong>Who matters:</strong> '+W.escape(sc.who)+'</p></div>';
 if(!opt){h+='<h3 style="margin:18px 0 10px">Choose your next door</h3>'+window.WorldFX.sceneHall(state.chapter,sc.choices,false)+stakeholderDesk()+'<p class="note">Speak to two factions for private intelligence, then open one of the three glowing doors above.</p>'}
 else{h+=window.WorldFX.sceneHall(state.chapter,sc.choices,true)+'<div class="result" style="margin-top:15px"><span class="overline">INSIDE THE DECISION · WHAT REALLY HAPPENED</span><h3>'+W.escape(opt.name)+'</h3><p><b>What the public sees:</b> '+W.escape(sc.visible)+'</p><p><b>Who gains or loses:</b> '+W.escape(opt.impact)+'</p><p><b>Legal and ethical reality:</b> '+W.escape(opt.legality)+'</p><p><b>Power lesson:</b> '+W.escape(sc.legal)+'</p><p><b>Who is involved:</b> '+W.escape(sc.who)+'</p><button class="button" data-next>'+(state.chapter===scenes.length-1?'Reveal your career outcome':'Open the next door →')+'</button></div>'}
 return h+'</section>';
}
function render(){
 const progress=state.finished?scenes.length:state.chapter+1;
 let html='<div class="maincol"><section class="panel"><span class="overline">CAREER PATH · '+(state.finished?'COMPLETE':'CHAPTER '+progress+' OF '+scenes.length)+'</span><h2>'+W.escape(currentRole())+'</h2><p class="subline">Build your career in the fictional local government. Power without process can produce a very different legacy.</p><div class="statgrid">'+W.stat('Influence',num(state.influence))+W.stat('Knowledge',num(state.knowledge))+W.stat('Public trust',num(state.trust))+'</div><div class="timeline" style="margin-top:15px">'+scenes.map((s,i)=>'<span class="'+(i<state.chapter?'done':i===state.chapter&&!state.finished?'current':'')+'">'+(i+1)+'</span>').join('')+'</div></section>';
 html+=sceneHtml();
 html+='<section class="panel"><span class="overline">REALITY CHECK</span><h2>Rules, gray areas and oversight</h2><p class="subline">Actions may be lawful, questionable or prohibited depending on context. The city’s fictional charter is your training ground, not a statement of real law.</p><div class="callout"><strong>Ask four questions:</strong><p>Who has legal authority? What was promised publicly? Who benefits privately? Which records, conflicts and approvals will withstand independent review?</p></div></section></div>';
 html+='<aside class="sidecol"><section class="panel"><h2>Career achievements</h2>'+badgeRow()+'</section><section class="panel"><h2>Your live power web</h2><p class="note">The six alliance scores change when you negotiate.</p>'+powerWeb()+'</section><section class="panel"><h2>Power profile</h2><div class="statgrid">'+W.stat('Reputation',num(state.reputation))+W.stat('Relationships',num(state.relationships))+W.stat('Ethics',num(state.ethics))+'</div><p class="note">These indicators can diverge. Popular moves can be ethically dubious, and responsible choices can cost influence.</p></section>';
 html+='<section class="panel"><h2>Relationship web</h2><p class="note">Every decision strengthens and weakens alliances.</p><div class="actors">'+factions.map((f,i)=>'<div class="actor"><strong>'+f[1]+' '+W.escape(f[0])+'</strong><span>'+W.escape(f[2])+'</span><div class="meter"><i style="width:'+num(state.actors[i])+'%"></i></div></div>').join('')+'</div></section>';
 html+='<section class="panel"><h2>Your career dossier</h2><div class="button-row"><button class="button-quiet" data-report>📋 '+(state.report?'Hide':'Open')+' decision report</button><button class="button-quiet" data-download>↓ Export dossier</button><button class="button-quiet" data-reset>↺ New career</button></div></section>';
 html+='<section class="panel"><h2>Private record</h2>'+W.journal(state.journal)+'</section></aside>';
 if(state.report)html+='<section class="panel" style="grid-column:1/-1"><h2>Inside the Decision · career report</h2><pre style="white-space:pre-wrap;font:12px/1.7 inherit;overflow-wrap:anywhere">'+W.escape(makeReport())+'</pre></section>';
 app.innerHTML=html;
}
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.hasAttribute('data-pick'))choose(Number(b.dataset.pick));
 else if(b.hasAttribute('data-consult'))consult(Number(b.dataset.consult));
 else if(b.hasAttribute('data-next'))next();
 else if(b.hasAttribute('data-report')){state.report=!state.report;save();render()}
 else if(b.hasAttribute('data-download'))W.download('The-Corridors-career-dossier.txt',makeReport());
 else if(b.hasAttribute('data-reset'))W.reset(KEY,'The Corridors');
});
save();render();
})();