/* The Corridors · Policy Consequences
 * Independent, fictional civic decision simulation. All scores are illustrative game values,
 * not predictive estimates. Sources support qualitative mechanisms, not numerical game changes.
 */
(()=>{'use strict';
const W=window.WorldKit,KEY='corridors-policy-consequences-v1';
const metricDefs=[
 {id:'stability',name:'Household stability',icon:'🏠',help:'Higher supports more stable household conditions',positive:true},
 {id:'prices',name:'Price pressure',icon:'🛒',help:'Higher indicates stronger inflation and cost pressure',positive:false},
 {id:'services',name:'Service delivery',icon:'🧰',help:'Higher means public services reach people more reliably',positive:true},
 {id:'budget',name:'Fiscal flexibility',icon:'💰',help:'Higher means more room for future spending choices',positive:true},
 {id:'trust',name:'Public trust',icon:'🤝',help:'Higher means institutions are seen as more credible',positive:true}
];
const sources={
 fed2025:{title:'Federal Reserve Board · Inflation since the Pandemic (2025)',url:'https://www.federalreserve.gov/econres/feds/files/2025070pap.pdf',why:'Demand and supply factors both contributed to pandemic-era inflation. Researchers disagree about their relative contributions.'},
 nyfed:{title:'New York Fed · Fiscal stimulus and supply constraints (2023)',url:'https://www.newyorkfed.org/research/staff_reports/sr1050',why:'Model-based research finds fiscal demand interacted with supply limits; magnitude depends on assumptions.'},
 sf:{title:'San Francisco Fed · Fiscal support and inflation (2022)',url:'https://www.frbsf.org/research-and-insights/publications/economic-letter/2022/03/why-is-us-inflation-higher-than-in-other-countries/',why:'Estimates suggest fiscal support contributed to 2021 inflation, with substantial uncertainty and other global drivers.'},
 gao:{title:'GAO · Managing fraud risks in federal/state programs (2026)',url:'https://www.gao.gov/products/gao-26-109100',why:'Federal funds often rely on state/local administration; weak oversight and fragmented delivery create risks.'},
 gaoControls:{title:'GAO · Emergency assistance and improper payments (2023)',url:'https://www.gao.gov/products/gao-23-105876',why:'Risk screening and internal controls are needed even when benefits must be delivered urgently.'},
 federal:{title:'CRS · Federal grant administration primer (2026)',url:'https://www.everycrsreport.com/reports/R42769.html',why:'Federal program authorization and administration differ substantially across grants and jurisdictions.'},
 housing:{title:'GAO · Federal/state program administration (2026)',url:'https://www.gao.gov/products/gao-26-109100',why:'Complex eligibility, funding and implementation chains create bottlenecks and oversight trade-offs.'}
};
const scenarios=[
 {icon:'💸',title:'Emergency stimulus checks',domain:'FEDERAL × STATE × LOCAL',duration:'Economy under stress',lead:'A sudden recession raises unemployment. Congress considers sending money to households. Distribution is fast; production and logistics cannot always expand as quickly.',
 authority:'Congress authorizes and funds federal payments. Federal agencies distribute them; state and local systems shape access to related support. The Federal Reserve separately manages monetary policy.',
 stakes:'Relief can prevent hardship. The size, targeting, timing and supply conditions may also shape later price pressure.',
 refs:['fed2025','nyfed','sf'],
 options:[
  {name:'Send broad, large payments immediately',label:'Fastest relief, strongest demand impulse',ethical:'Lawful policy with distribution and inflation trade-offs.',
   now:{text:'Millions receive quick cash relief in the fictional scenario. Household spending and security rise; the fiscal cushion shrinks.',change:[20,4,4,-15,7]},
   months:{text:'Spending recovers. Where factories and freight remain constrained, added demand competes for goods and prices face greater upward pressure.',change:[4,13,1,-6,-1]},
   years:{text:'Some families avoided hardship, but higher prices can erode purchasing power. A later adjustment and tighter policy can slow growth. The outcome depends on supply recovery and monetary response.',change:[-5,8,-4,-4,-3]}},
  {name:'Target relief to the hardest-hit households',label:'More screening, smaller overall demand shock',ethical:'Generally lawful; eligibility design needs equitable access and oversight.',
   now:{text:'Hard-hit households receive larger proportional help, though screening creates delays and missed-eligibility risk.',change:[13,2,0,-9,5]},
   months:{text:'Basic needs spending holds up while aggregate demand rises less than with universal large checks. Some people still fall through gaps.',change:[5,5,3,-3,3]},
   years:{text:'The fictional budget retains more flexibility. Relief may be more efficient, but inaccurate eligibility rules can persist unless corrected.',change:[3,3,2,-1,2]}},
  {name:'Avoid cash checks; fund supply recovery and job support',label:'Slower help, more attention to production',ethical:'Lawful if enacted and fairly administered; hardship risks rise if relief arrives too late.',
   now:{text:'Capital is redirected to logistics, jobs and business recovery. Some households facing urgent bills get less immediate relief.',change:[-9,0,-3,-7,-4]},
   months:{text:'Repairs and hiring help restore production, but bureaucracy slows the benefit for the most vulnerable families.',change:[8,-5,7,-4,2]},
   years:{text:'Better capacity can relieve later bottlenecks if projects succeed. Delayed household protection may leave lasting setbacks.',change:[6,-6,7,-2,3]}}
 ]},
 {icon:'🏗️',title:'Build homes or fast-track favors?',domain:'STATE POLICY × CITY PERMITS',duration:'Housing supply',lead:'Rents are rising. A state housing grant could add homes, but the city controls approvals. A politically connected developer offers a shortcut.',
 authority:'The state may provide funding and policy requirements. Local governments usually administer permits and zoning under state law. Federal funds, if used, add their own restrictions.',
 stakes:'Housing benefits may arrive years after today’s political announcement. Undisclosed special treatment can threaten public trust and procurement fairness.',
 refs:['federal','housing'],
 options:[
  {name:'Coordinate zoning, infrastructure and open bids',label:'Slower launch, stronger checks',ethical:'Lawful transparent reform with unavoidable schedule trade-offs.',
   now:{text:'State and city teams publish zoning changes, infrastructure needs and fair selection criteria.',change:[1,0,-1,-6,9]},
   months:{text:'Residents and builders face a predictable process; some proposals still need revision or hearings.',change:[3,0,4,-3,4]},
   years:{text:'If construction completes, added supply can moderate rent pressure. Transparent approvals reduce dispute risk.',change:[10,-5,9,-2,6]}},
  {name:'Quietly favor a connected developer',label:'Promising headline; conflict risk',ethical:'Undisclosed favoritism could violate procurement, ethics or conflict rules, depending on the actual jurisdiction.',
   now:{text:'One preferred project receives unusually fast attention. Officials celebrate a rapid announcement.',change:[5,0,7,-3,-8]},
   months:{text:'Excluded bidders challenge the process. Records reviews delay other projects, while allegations undermine confidence.',change:[-3,2,-8,-9,-11]},
   years:{text:'If review finds impropriety, contracts may be contested and public trust may take longer to rebuild than homes took to announce.',change:[-4,4,-9,-11,-9]}},
  {name:'Freeze new approvals until every objection is resolved',label:'Few immediate disputes, prolonged scarcity',ethical:'Public participation is valuable; indefinite delays impose costs too.',
   now:{text:'Opposition groups feel heard, but no new units move through the process.',change:[-3,2,-5,1,3]},
   months:{text:'Builders defer investment and prospective residents face persistent shortages.',change:[-5,5,-7,1,-2]},
   years:{text:'Without viable new construction, rents may remain elevated despite procedural caution.',change:[-7,7,-6,1,-4]}}
 ]},
 {icon:'🚨',title:'Emergency relief across three governments',domain:'FEDERAL GRANT × STATE RESPONSE × CITY DELIVERY',duration:'Disaster recovery',lead:'A devastating storm leaves thousands without essential services. Federal help is offered, a state agency coordinates funds, and municipalities deliver assistance.',
 authority:'Federal statutes and grant terms define eligible spending. State agencies manage awards and oversight. Cities and contractors deliver field services, with emergency exceptions where applicable.',
 stakes:'Every hour matters, but undocumented payouts and rushed vendor selection can expose the program to fraud, waste and later disallowances.',
 refs:['gao','gaoControls','federal'],
 options:[
  {name:'Rapid aid plus simple eligibility safeguards',label:'Relief now, auditable payments',ethical:'Emergency delivery with minimum practical safeguards and documented exceptions.',
   now:{text:'Emergency shelters open and basic risk checks are introduced without halting urgent assistance.',change:[11,1,15,-11,8]},
   months:{text:'State teams reconcile spending and pursue suspicious duplicates; a few legitimate claims need manual review.',change:[7,1,6,-5,5]},
   years:{text:'Auditable grants protect future eligibility and support better preparedness, though administrative costs continue.',change:[5,0,5,-2,6]}},
  {name:'Release all funds immediately without controls',label:'Very quick initial reach, high integrity exposure',ethical:'Skipping required safeguards may breach grant conditions even if the motive is urgent relief.',
   now:{text:'Payments and contracts move quickly. Services reach people, but records are incomplete.',change:[16,0,21,-18,2]},
   months:{text:'Duplicate claims, disputed eligibility and vendor concerns emerge in this fictional scenario.',change:[-3,1,-11,-13,-14]},
   years:{text:'Recoveries and audits consume funds and staff time. Future programs can face tighter controls that slow the next disaster response.',change:[-7,0,-12,-13,-11]}},
  {name:'Wait for exhaustive approval before distribution',label:'Fewer initial errors, substantial delay',ethical:'Overcaution can itself create preventable harm when immediate needs are acute.',
   now:{text:'Every claim goes through full review. Shelter and supplies are delayed despite pressing needs.',change:[-17,0,-19,0,-8]},
   months:{text:'Error rates are lower on paper, but displaced residents struggle and service backlogs grow.',change:[-8,1,-11,-3,-6]},
   years:{text:'The government retains some funds but has to repair damaged community stability and credibility.',change:[-4,0,1,2,-5]}}
 ]},
 {icon:'🏛️',title:'School funding with political strings',domain:'STATE BUDGET × LOCAL SCHOOL SYSTEM',duration:'Public finance',lead:'Schools need urgent mental-health support. A swing legislator will support the funding only if a separate tax break is included. A lobbyist then offers a private benefit.',
 authority:'Legislatures authorize appropriations and tax policy; local districts implement services. Procurement, open meetings and ethics rules constrain side arrangements.',
 stakes:'An openly disclosed compromise may be lawful. A private personal reward for an official act crosses into corruption risk.',
 refs:['federal','gao'],
 options:[
  {name:'Negotiate the package publicly with cost estimates',label:'Service gains with an explicit fiscal trade-off',ethical:'A public legislative compromise is not automatically improper, but must follow applicable law.',
   now:{text:'The package passes. Schools can recruit services, while fiscal analysts publish the cost of the tax break.',change:[5,0,9,-12,3]},
   months:{text:'More students access support, but the tax incentive reduces revenue available for other priorities.',change:[4,0,6,-4,1]},
   years:{text:'The program may improve access if sustained. The state must address ongoing costs and evaluate whether the tax break met its stated purpose.',change:[3,1,3,-5,1]}},
  {name:'Offer a hidden personal favor to secure the vote',label:'Fast vote, escalating corruption exposure',ethical:'Personal benefits exchanged for official action can violate bribery and public-integrity laws.',
   now:{text:'The bill gains a surprise vote. The official and allies claim an immediate victory.',change:[4,0,12,-10,-13]},
   months:{text:'Investigators and reporters scrutinize the unexplained favor; legal and political attention distracts from program delivery.',change:[-2,0,-12,-7,-16]},
   years:{text:'If an improper arrangement is substantiated, prosecution, resignation or canceled commitments may disrupt service and trust.',change:[-6,0,-13,-8,-15]}},
  {name:'Separate the votes and pursue a smaller clean program',label:'More limited delivery, lower integrity risk',ethical:'Transparent process protects decision quality but may not satisfy urgent need.',
   now:{text:'A smaller program survives without the tax break. Many schools remain on a waiting list.',change:[2,0,3,-4,8]},
   months:{text:'Selected districts begin serving students; lawmakers revisit the funding gap.',change:[2,0,4,-2,3]},
   years:{text:'Stable budgeting preserves some flexibility but leaves unmet needs unless broader funding is negotiated.',change:[1,0,3,1,2]}}
 ]},
 {icon:'🔍',title:'Faster contracts or fair competition?',domain:'FEDERAL CONDITIONS × STATE RULES × CITY CONTRACT',duration:'Contract oversight',lead:'A regional infrastructure grant depends on federal conditions, state approvals and city procurement. A favored supplier promises completion sooner if competing bids are ignored.',
 authority:'A project may need federal grant compliance, state procurement rules, local decisions and audit trails. Actual emergency exceptions are limited and fact-specific.',
 stakes:'Shortcuts can improve short-term progress but threaten enforceability, competition and future funding.',
 refs:['gao','gaoControls','federal'],
 options:[
  {name:'Run a clear, accelerated but competitive process',label:'Balanced speed and accountability',ethical:'Use legally available competitive methods, publish criteria and preserve decisions.',
   now:{text:'The city writes a compressed but documented bid schedule. Initial mobilization is slower.',change:[1,0,0,-3,7]},
   months:{text:'The selected bidder begins work with clear milestones and public documentation.',change:[5,0,9,-5,5]},
   years:{text:'Delivery and oversight can both improve, though some costs and change orders still need management.',change:[5,0,6,-3,4]}},
  {name:'Directly award the deal to a friendly supplier without disclosure',label:'Immediate speed, higher challenge risk',ethical:'Secret favoritism can violate procurement requirements and undermine integrity.',
   now:{text:'Machinery arrives quickly and leadership celebrates the ribbon-cutting.',change:[4,0,16,-4,-11]},
   months:{text:'Competing vendors allege unfair treatment. Required documentation cannot fully support the award.',change:[-2,0,-10,-9,-15]},
   years:{text:'In this fictional outcome, investigations and contract disputes slow completion and erode access to future grants.',change:[-6,0,-15,-12,-12]}},
  {name:'Stop all procurement pending a full policy redesign',label:'Fewer immediate contracting risks, service delay',ethical:'Legal caution helps only if the review is proportionate and timely.',
   now:{text:'Officials announce a review. Work and staffing remain paused.',change:[-4,0,-13,1,1]},
   months:{text:'Construction costs and service backlogs rise while the rules are rewritten.',change:[-4,2,-8,-7,-3]},
   years:{text:'The better-designed process could help later projects, but this project has lost precious time.',change:[-4,1,3,-4,2]}}
 ]}
];
const baseMetrics=()=>({stability:46,prices:32,services:47,budget:59,trust:54});
const defaultState=()=>({scenario:0,choice:null,phase:'choose',supply:'constrained',metrics:baseMetrics(),history:[]});
let state=defaultState();
try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object'&&Array.isArray(raw.history)&&raw.metrics&&Number.isInteger(raw.scenario)){state={...defaultState(),...raw,metrics:{...baseMetrics(),...raw.metrics}}}}catch{}
if(!scenarios[state.scenario])state.scenario=0;
if(!['choose','today','months','years'].includes(state.phase))state.phase='choose';
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}};
const esc=x=>W.escape(String(x??''));
const clamp=v=>Math.max(0,Math.min(100,Math.round(v)));
const phaseLabels={today:'Immediate effects',months:'About 6 months later',years:'About 2 years later'};
// The UI calls the immediate stage 'today'; scenario records correctly name its data 'now'.
// Read through one mapping so decisions, saved progress and replay agree.
const phaseData=(option,stage)=>option?.[stage==='today'?'now':stage];
const phaseIndex={today:0,months:1,years:2};
const current=()=>scenarios[state.scenario];
function effectsFor(phase){
 const o=current().options[state.choice],base=phaseData(o,phase)?.change;
 if(!Array.isArray(base)||base.length!==metricDefs.length)return metricDefs.map(()=>0);
 const copy=base.slice();
 if(state.scenario===0){
  // Example conditional mechanism: when supply catches up, simulated pressure is smaller.
  if(state.supply==='recovering'&&phase==='months')copy[1]=Math.round(copy[1]*.45);
  if(state.supply==='recovering'&&phase==='years')copy[1]=Math.round(copy[1]*.5);
 }
 return copy;
}
function apply(phase){
 const v=effectsFor(phase);
 metricDefs.forEach((m,i)=>{state.metrics[m.id]=clamp((Number(state.metrics[m.id])||0)+v[i])});
}
// Older broken builds could save null indicators after trying to apply the
// 'today' phase. Preserve completed history and repair only the active stage.
function restorePlayableState(){
 let repaired=false;
 const stages=['today','months','years'];
 if(!Array.isArray(state.history)){state.history=[];repaired=true}
 if(!scenarios[state.scenario]){state.scenario=0;repaired=true}
 const choiceValid=state.choice===null||(Number.isInteger(state.choice)&&state.choice>=0&&state.choice<current().options.length);
 if(!choiceValid||(state.choice!==null&&state.phase==='choose')){
  state.choice=null;state.phase='choose';repaired=true;
 }
 if(state.choice===null&&state.phase!=='choose'){state.phase='choose';repaired=true}
 const metricsValid=values=>values&&metricDefs.every(m=>Number.isFinite(values[m.id])&&values[m.id]>=0&&values[m.id]<=100);
 if(!metricsValid(state.metrics)){
  const historyRecord=[...state.history].reverse().find(h=>metricsValid(h?.metrics));
  state.metrics={...baseMetrics(),...(historyRecord?.metrics||{})};
  if(state.choice!==null){
   for(const phase of stages){
    apply(phase);
    if(phase===state.phase)break;
   }
  }
  repaired=true;
 }
 if(repaired){
  try{const original=localStorage.getItem(KEY);if(original&&!localStorage.getItem(KEY+'-recovery'))localStorage.setItem(KEY+'-recovery',original)}catch{}
  save();
 }
}
restorePlayableState();
function choose(index){
 if(state.choice!==null||!current().options[index])return;
 state.choice=index;state.phase='today';apply('today');save();render();
}
function advance(){
 if(state.choice===null)return;
 if(state.phase==='today'){state.phase='months';apply('months')}
 else if(state.phase==='months'){state.phase='years';apply('years')}
 else return;
 save();render();
}
function next(){
 selectedBill=null;
 if(state.choice===null||state.phase!=='years')return;
 const s=current(),o=s.options[state.choice];
 state.history.push({scenario:s.title,choice:o.name,outcome:o.years.text,context:state.supply,metrics:{...state.metrics}});
 state.scenario=(state.scenario+1)%scenarios.length;state.choice=null;state.phase='choose';save();render();
}
function metricRow(){
 return '<div class="cp-metrics">'+metricDefs.map(m=>{
  const v=clamp(Number(state.metrics[m.id])||0);
  return '<div class="cp-metric"><div class="cp-metric-top"><span>'+m.icon+' '+esc(m.name)+'</span><b>'+v+'<small>/100</small></b></div><div class="cp-meter '+(!m.positive?'cp-meter-warning':'')+'"><span style="width:'+v+'%"></span></div></div>';
 }).join('')+'</div>';
}
function sourceHtml(s){
 return '<details class="cp-sources"><summary>Official research & policy references · '+s.refs.length+' sources</summary><p>References explain mechanisms and implementation risks; the scores and events in this game are fictional, not findings or forecasts from the sources.</p>'+s.refs.map(id=>{const ref=sources[id];return '<div class="cp-source"><a href="'+esc(ref.url)+'" target="_blank" rel="noopener noreferrer">'+esc(ref.title)+' ↗</a><span>'+esc(ref.why)+'</span></div>'}).join('')+'</details>';
}
function modeBar(active='policy'){return '<nav class="cp-mode-nav" aria-label="The Corridors game mode"><button type="button" data-corridor-mode="policy" '+(active==='policy'?'aria-current="page"':'')+'>🧭 Policy consequences <small>Make a decision and follow its effects</small></button><button type="button" data-corridor-mode="career" '+(active==='career'?'aria-current="page"':'')+'>🏛️ Political career <small>Original story and saved choices</small></button></nav>'}
function scenarioCards(){
 return '<div class="cp-scenario-tabs" role="group" aria-label="Select a policy scenario">'+scenarios.map((s,i)=>'<button type="button" data-policy-case="'+i+'" '+(state.choice!==null?'disabled':'')+' aria-pressed="'+String(i===state.scenario)+'">'+s.icon+' <span>'+esc(s.title)+'</span></button>').join('')+'</div>';
}

let selectedBill=null, selectedMetric='trust';
function cityMap(){
 const m=state.metrics,sky=state.phase==='years'?'#152c49':'#234f63',lights=m.services>=50?'#bce6c3':'#809a97';
 const district=(x,y,w,h,d,col,roof)=>'<g><path d="M'+x+' '+y+'l'+w+' -'+(w*.24)+' '+d+' '+(d*.42)+' -'+w+' '+(w*.24)+'z" fill="'+roof+'"/><path d="M'+x+' '+y+'l'+w+' -'+(w*.24)+'v'+h+'l-'+w+' '+(w*.24)+'z" fill="'+col+'"/><path d="M'+(x+w)+' '+(y-w*.24)+'l'+d+' '+(d*.42)+'v'+h+'l-'+d+' -'+(d*.42)+'z" fill="#19333c"/>'+Array.from({length:Math.max(1,Math.floor(h/17))},(_,j)=>Array.from({length:Math.max(1,Math.floor(w/23))},(_,k)=>'<path d="M'+(x+9+k*21)+' '+(y+10+j*16-(9+k*21)*.24)+'l9 -2v7l-9 2z" fill="'+lights+'" opacity=".8"/>').join('')).join('')+'</g>';
 const buildings=[[125,129,57,63,24,'#597f86','#8eaeac'],[203,109,67,91,32,'#3c7182','#75a1aa'],[277,101,43,58,22,'#527c83','#8ca9a9'],[378,94,70,75,35,'#617c79','#b2ba9b'],[470,106,60,66,34,'#4c7483','#93b0af'],[555,137,74,52,28,'#5d877f','#b0c3a8'],[166,189,48,36,22,'#807f69','#c7b48b'],[273,174,80,55,25,'#6b8985','#c0cbb2'],[397,173,76,42,30,'#557d7d','#9bb8ad'],[520,195,55,36,24,'#687f73','#aebfa1']];
 const city='<svg viewBox="0 0 760 275" role="img" aria-label="Isometric illustration of your fictional city"><defs><linearGradient id="citysky" x2="0" y2="1"><stop stop-color="'+sky+'"/><stop offset="1" stop-color="#081b29"/></linearGradient></defs><rect width="760" height="275" fill="url(#citysky)"/><circle cx="630" cy="51" r="30" fill="#ffe5ab" opacity=".75"/><path d="M36 185L392 38 726 171 372 264Z" fill="#446668" stroke="#7ca6a0"/><path d="M36 185L372 264 726 171V181L372 275 36 196Z" fill="#21383e"/><path d="M85 187L392 67 682 176 372 245Z" fill="#234852"/><path d="M124 205L437 84 M226 228L553 124 M180 126L498 230 M300 86L620 194" stroke="#77908c" stroke-width="12" opacity=".7"/><path d="M124 205L437 84 M226 228L553 124 M180 126L498 230 M300 86L620 194" stroke="#c2d1bb" stroke-width="1.3" stroke-dasharray="7 7"/>'+buildings.map(a=>district(...a)).join('')+'<g fill="#d6e5d5"><path d="M343 125l56-22 43 16-55 22z"/><path d="M343 125v28l44 18v-30z" fill="#9b9f89"/><path d="M387 141l55-22v29l-55 23z" fill="#bcc2a7"/><path d="M356 120l33-24 35 20-37 15z" fill="#f0d6a2"/><path d="M388 94v-17" stroke="#f0d6a2" stroke-width="2"/><path d="M389 77l18 5-18 4z" fill="#72c5aa"/></g><g fill="#9ac6a6">'+[[101,179],[136,198],[240,215],[460,220],[650,164],[610,185],[336,231]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="10" ry="5" fill="#1f3b32"/><path d="M'+(x-3)+' '+y+'v-11h6v11z" fill="#674a37"/><circle cx="'+x+'" cy="'+(y-13)+'" r="9"/>').join('')+'</g></svg>';
 const mm=metricDefs.find(x=>x.id===selectedMetric)||metricDefs[0];
 return '<div class="city-command"><div class="city-map-caption"><span>CITY OVERVIEW · '+(state.choice===null?'IN SESSION':phaseLabels[state.phase])+'</span><span>'+state.history.length+' policies completed</span></div>'+'<div class="city-map-hit-area">'+city+[['stability','Homes',26,69],['budget','Finance',31,39],['trust','City hall',51,45],['services','Services',65,67],['prices','Markets',78,50]].map(([key,label,x,y])=>'<button type="button" class="city-hotspot" data-city-metric="'+key+'" style="left:'+x+'%;top:'+y+'%" aria-label="Inspect '+label+'" aria-pressed="'+(selectedMetric===key)+'">'+label+'</button>').join('')+'</div><div class="city-metrics">'+metricDefs.map(x=>'<button type="button" class="city-metric" data-city-metric="'+x.id+'" aria-pressed="'+(x.id===selectedMetric)+'"><small>'+esc(x.name)+'</small><b>'+Math.round(m[x.id])+'</b><i style="width:'+clamp(m[x.id])+'%"></i></button>').join('')+'</div><div class="city-adviser" role="status"><b>'+esc(mm.name)+':</b> '+esc(mm.help)+'. These are fictional indicators. Tap another indicator to inspect it.</div></div>';
}
function billReview(sc){
 if(selectedBill===null||!sc.options[selectedBill])return '<p class="city-adviser">Select a proposal to examine its trade-offs before voting.</p>';
 const o=sc.options[selectedBill];
 return '<section class="city-vote"><span class="cp-eyebrow">CABINET BRIEF · PROPOSAL '+(selectedBill+1)+'</span><h3>'+esc(o.name)+'</h3><p>'+esc(o.label)+'</p><p><b>Ethics and authority:</b> '+esc(o.ethical)+'</p><div class="city-forecast">'+o.now.change.map((v,i)=>'<span>'+esc(metricDefs[i].name)+' '+(v>=0?'+':'')+v+'</span>').join('')+'</div><p class="cp-assumption">Illustrative immediate effects. Longer-term outcomes are revealed after the vote.</p><button type="button" class="cp-primary" data-city-vote="'+selectedBill+'">Confirm decision →</button></section>';
}
function rootFocus(selector){const el=document.getElementById('app').querySelector(selector);el?.focus({preventScroll:true});if(el&&(selector==='[data-city-vote]'||selector==='[data-policy-advance]'||selector==='[data-city-preview]'))el.scrollIntoView?.({block:'nearest',behavior:'auto'});}

function choiceCards(sc){
 return '<div class="cp-choices">'+sc.options.map((opt,i)=>'<button type="button" data-city-preview="'+i+'" aria-pressed="'+(selectedBill===i)+'" class="cp-choice"><span class="cp-choice-order">OPTION '+(i+1)+'</span><strong>'+esc(opt.name)+'</strong><p>'+esc(opt.label)+'</p><small>Inspect proposal →</small></button>').join('')+'</div>';
}
function consequence(sc){
 const o=sc.options[state.choice],stage=state.phase,step=phaseIndex[stage],delta=effectsFor(stage);
 return '<div class="cp-consequence"><div class="cp-outcome-journey">'+['today','months','years'].map((ph,i)=>'<div class="cp-milestone '+(i===step?'current':i<step?'complete':'waiting')+'"><span>'+(i<step?'✓':i+1)+'</span><b>'+esc(phaseLabels[ph])+'</b></div>').join('')+'</div>'+
 '<div class="cp-outcome-detail"><span class="cp-eyebrow">YOUR DECISION · '+esc(phaseLabels[stage])+'</span><h3>'+esc(o.name)+'</h3><p>'+esc(phaseData(o,stage).text)+'</p><div class="cp-shifts">'+metricDefs.map((m,i)=>{const n=delta[i];const positive=m.positive?n>=0:n<=0;return '<span class="'+(positive?'up':'down')+'">'+m.icon+' '+esc(m.name)+' '+(n>=0?'+':'')+n+'</span>'}).join('')+'</div><div class="cp-ethics"><strong>⚖️ Ethics and legal reality</strong><p>'+esc(o.ethical)+'</p></div>'+
 (state.scenario===0?'<p class="cp-assumption">Supply assumption: '+(state.supply==='constrained'?'production and freight remain constrained':'supply recovers more quickly')+'. Different conditions can change the inflation channel.</p>':'')+
 '<button type="button" class="cp-primary" data-policy-advance='+ (step<2?'phase':'case') +'>'+(step===0?'Advance 6 months →':step===1?'Advance 2 years →':'Record decision & next case →')+'</button></div></div>';
}
// Pixel-art city hall is drawn locally so the game is genuinely visual and offline-capable.
function drawCityHall(canvas,phase,chapter){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const W=192,H=62;canvas.width=W;canvas.height=H;
 const block=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
 const night=phase==='years',tone=chapter%3;
 block(0,0,W,H,night?'#242b55':tone===1?'#3c477b':'#304d82');
 // Clouds, moon, buildings, road and civic hall in deliberate coarse pixels.
 block(24,7,16,4,night?'#8b8bb8':'#a9dcf6');block(31,4,9,4,night?'#aaa9cf':'#d5f4f3');
 block(146,10,13,13,night?'#f6db9a':'#f3d58b');
 const bgs=['#182d55','#263b5c','#324363'];
 for(let n=0;n<16;n++){const x=n*13,y=24+(n*7%14);block(x,y,13,H-y,bgs[n%3]);for(let k=0;k<4;k++)block(x+3+(k%2)*5,y+4+Math.floor(k/2)*8,2,3,night?'#f1d67b':'#c5dcee')}
 // Distinct city hall with a dome, columns and steps.
 block(69,21,56,29,'#d5b899');block(73,18,48,5,'#e9d2b1');
 block(85,11,24,6,'#ead4af');block(89,7,16,4,'#fae2b6');
 for(let x=76;x<120;x+=10){block(x,26,5,23,'#f6e7c9');block(x,25,5,2,'#b38773')}
 block(66,49,63,3,'#a28b86');block(62,52,70,3,'#7d7c83');
 block(0,55,W,7,'#202945');for(let x=0;x<W;x+=24)block(x+7,59,13,1,'#c0b5a4');
 // Two small actual pixel people, not emoji placeholders.
 for(const [x,coat] of [[38,'#83dfbb'],[147,'#f8a77a']]){
  block(x,38,8,3,'#1a223c');block(x+2,35,5,4,'#d5deed');
  block(x+1,41,6,6,'#e8be9c');block(x,47,8,8,coat);
  block(x+1,55,2,4,'#151e36');block(x+6,55,2,4,'#151e36');
 }
}
function render(root=document.getElementById('app')){
 const sc=current(),done=state.history.length;
 const expanded=[...root.querySelectorAll('details')].filter(x=>x.open).map(x=>x.className);
 root.innerHTML='<div class="cp-full">'+modeBar()+'<section class="cp-hero"><div><span class="cp-eyebrow">PLAY THE OUTCOME · FICTIONAL PUBLIC POLICY SIMULATOR</span><h2>Your choices ripple through government.</h2><p>Take action, watch the immediate gain, then advance the clock to discover delays, second-order effects, and ethical or legal costs. There is no universally perfect option.</p></div><div class="cp-replay-stat"><strong>'+done+'</strong><small>Decisions completed</small></div></section>'+
 '<details class="cp-dashboard"><summary>📊 City status and previous effects</summary><div class="cp-dashboard-heading"><div><span class="cp-eyebrow">CONSEQUENCE DASHBOARD</span><h3>What your decisions are changing</h3><p>Illustrative game indicators, not actual economic statistics or probabilities.</p></div><button type="button" class="cp-reset" data-policy-reset>↺ Start policy lab over</button></div>'+metricRow()+'</details>'+
 '<details class="cp-scenario-picker"><summary>🗺️ Pick another policy file</summary>'+scenarioCards()+'</details>'+
 '<section class="cp-case"><div class="city-scene-wrap"><div class="corr-pixel-city" role="img" aria-label="Pixel-style city hall scene"><span class="corr-pixel-moon" aria-hidden="true">✦</span><span class="corr-pixel-buildings" aria-hidden="true">▥ ▣ ▥ ▤ ▣</span><span class="corr-pixel-official" aria-hidden="true">🧑‍💼</span><span class="corr-pixel-aide" aria-hidden="true">🏛️</span><div class="corr-pixel-dialog">'+esc(state.choice===null?'Mayor: We need a decision. What is your move?':state.phase==='today'?'Aide: The first results are in.':state.phase==='months'?'Aide: Six months have passed.':'Aide: The long-term effects are here.')+'</div></div></div><div class="city-workspace"><div class="cp-case-head"><div><span class="cp-eyebrow">POLICY FILE '+String(state.scenario+1).padStart(2,'0')+' / '+scenarios.length+' · CITY COMMAND · '+esc(sc.domain)+'</span><h2>'+sc.icon+' '+esc(sc.title)+'</h2><p>'+esc(sc.lead)+'</p></div><span class="cp-duration">'+esc(sc.duration)+'</span></div>'+
 '<details class="cp-optional-details"><summary>💡 More context (optional)</summary><div class="cp-brief-strip"><div><b>🏛️ Who has authority?</b><p>'+esc(sc.authority)+'</p></div><div><b>⚠️ What could go wrong?</b><p>'+esc(sc.stakes)+'</p></div></div></details>'+
 (state.choice===null?
 (state.scenario===0?'<div class="cp-conditions"><strong>Economic conditions affect the outcome</strong><div role="group" aria-label="Choose fictional supply conditions"><button type="button" data-supply="constrained" aria-pressed="'+String(state.supply==='constrained')+'">🚚 Supply constrained</button><button type="button" data-supply="recovering" aria-pressed="'+String(state.supply==='recovering')+'">🏭 Supply recovering</button></div><p>These choices alter the simulated impact of additional spending on price pressure; they are not forecasts.</p></div>':'')+
 '<div class="cp-action-intro"><h3>Choose your policy</h3><p>Choose an action. You will see the result immediately, then advance through the longer-term outcomes.</p></div>'+choiceCards(sc)+billReview(sc)
 :consequence(sc))+sourceHtml(sc)+'</div></section>'+
 '<details class="cp-learning-footer"><summary>📖 What this game teaches (optional)</summary><strong>Learning notes</strong><p>Policy effects depend on implementation, economic conditions, institutions, lawful authority and human responses. Legal/ethical risks can create both short-term advantages and longer-term consequences. Some outcomes remain uncertain even after years.</p><button type="button" data-corridor-mode="career">Play the original political career →</button></details></div>';
 const scene=root.querySelector('.corr-pixel-city');
 if(scene){scene.outerHTML=cityMap()}
 root.querySelectorAll('details').forEach(x=>{if(expanded.includes(x.className))x.open=true});
}
function report(){
 return ['THE CORRIDORS · POLICY CONSEQUENCES','Fictional training simulation. Game metrics are not real economic predictions.','Decisions: '+state.history.length,'',
 ...state.history.map((x,i)=>(i+1)+'. '+x.scenario+' · '+x.choice+'\nLong-term scenario: '+x.outcome+'\nIllustrative indicators: '+JSON.stringify(x.metrics)+'\n'),
 'Sources are accessible within the scenario and support mechanisms, not score values.'].join('\n');
}
document.getElementById('app').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled||!b.closest('.cp-full'))return;
 if(b.hasAttribute('data-city-metric')){selectedMetric=b.dataset.cityMetric;render();rootFocus('.city-metric[data-city-metric="'+selectedMetric+'"]')}
 else if(b.hasAttribute('data-city-preview')){selectedBill=Number(b.dataset.cityPreview);render();rootFocus('[data-city-vote]')}
 else if(b.hasAttribute('data-city-vote')){const i=Number(b.dataset.cityVote);if(i===selectedBill){selectedBill=null;choose(i);rootFocus('[data-policy-advance]')}}
 else if(b.hasAttribute('data-policy-case')){selectedBill=null;const i=Number(b.dataset.policyCase);if(state.choice===null&&scenarios[i]){state.scenario=i;save();render()}}
 else if(b.hasAttribute('data-supply')){state.supply=b.dataset.supply==='recovering'?'recovering':'constrained';save();render()}
 else if(b.hasAttribute('data-policy-choice'))choose(Number(b.dataset.policyChoice));
 else if(b.dataset.policyAdvance==='phase'){advance();rootFocus('[data-policy-advance]')}
 else if(b.dataset.policyAdvance==='case'){next();rootFocus('[data-city-preview]')}
 else if(b.hasAttribute('data-policy-reset')&&confirm('Restart Policy Consequences? This does not reset your original political career.')){state=defaultState();save();render()}
});
window.CorridorsPolicyLab=Object.freeze({render,report,modeBar,chooseAction:choose,advancePhase:advance,completeCase:next,currentCase:()=>current(),rivalryDeck:()=>scenarios.map((sc,i)=>({id:i,title:sc.title,lead:sc.lead,stakes:sc.stakes,icon:sc.icon,domain:sc.domain,options:sc.options.map((o,j)=>({id:j,name:o.name,label:o.label,ethical:o.ethical,now:o.now.text,months:o.months.text,years:o.years.text,changes:[o.now.change,o.months.change,o.years.change]}))})),getProgress:()=>({scenario:state.scenario,choice:state.choice,phase:state.phase,decisions:state.history.length,supply:state.supply,metrics:{...state.metrics}}),scenarioCount:scenarios.length});
})();
