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
const phaseIndex={today:0,months:1,years:2};
const current=()=>scenarios[state.scenario];
function effectsFor(phase){
 const o=current().options[state.choice],base=o?.[phase]?.change;
 if(!base)return [];
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
function modeBar(){return '<nav class="cp-mode-nav" aria-label="The Corridors game mode"><button type="button" data-corridor-mode="policy" aria-current="page">🧭 Policy consequences <small>Make a decision and follow its effects</small></button><button type="button" data-corridor-mode="career">🏛️ Political career <small>Original story and saved choices</small></button></nav>'}
function scenarioCards(){
 return '<div class="cp-scenario-tabs" role="group" aria-label="Select a policy scenario">'+scenarios.map((s,i)=>'<button type="button" data-policy-case="'+i+'" '+(state.choice!==null?'disabled':'')+' aria-pressed="'+String(i===state.scenario)+'">'+s.icon+' <span>'+esc(s.title)+'</span></button>').join('')+'</div>';
}
function choiceCards(sc){
 return '<div class="cp-choices">'+sc.options.map((opt,i)=>'<button type="button" data-policy-choice="'+i+'" class="cp-choice"><span class="cp-choice-order">OPTION '+(i+1)+'</span><strong>'+esc(opt.name)+'</strong><p>'+esc(opt.label)+'</p><small>See the consequences →</small></button>').join('')+'</div>';
}
function consequence(sc){
 const o=sc.options[state.choice],stage=state.phase,step=phaseIndex[stage],delta=effectsFor(stage);
 return '<div class="cp-consequence"><div class="cp-outcome-journey">'+['today','months','years'].map((ph,i)=>'<div class="cp-milestone '+(i===step?'current':i<step?'complete':'waiting')+'"><span>'+(i<step?'✓':i+1)+'</span><b>'+esc(phaseLabels[ph])+'</b></div>').join('')+'</div>'+
 '<div class="cp-outcome-detail"><span class="cp-eyebrow">YOUR DECISION · '+esc(phaseLabels[stage])+'</span><h3>'+esc(o.name)+'</h3><p>'+esc(o[stage].text)+'</p><div class="cp-shifts">'+metricDefs.map((m,i)=>{const n=delta[i];const positive=m.positive?n>=0:n<=0;return '<span class="'+(positive?'up':'down')+'">'+m.icon+' '+esc(m.name)+' '+(n>=0?'+':'')+n+'</span>'}).join('')+'</div><div class="cp-ethics"><strong>⚖️ Ethics and legal reality</strong><p>'+esc(o.ethical)+'</p></div>'+
 (state.scenario===0?'<p class="cp-assumption">Supply assumption: '+(state.supply==='constrained'?'production and freight remain constrained':'supply recovers more quickly')+'. Different conditions can change the inflation channel.</p>':'')+
 '<button type="button" class="cp-primary" data-policy-advance='+ (step<2?'phase':'case') +'>'+(step===0?'Advance 6 months →':step===1?'Advance 2 years →':'Record decision & next case →')+'</button></div></div>';
}
function render(root=document.getElementById('app')){
 const sc=current(),done=state.history.length;
 root.innerHTML='<div class="cp-full">'+modeBar()+'<section class="cp-hero"><div><span class="cp-eyebrow">PLAY THE OUTCOME · FICTIONAL PUBLIC POLICY SIMULATOR</span><h2>Your choices ripple through government.</h2><p>Take action, watch the immediate gain, then advance the clock to discover delays, second-order effects, and ethical or legal costs. There is no universally perfect option.</p></div><div class="cp-replay-stat"><strong>'+done+'</strong><small>Decisions completed</small></div></section>'+
 '<section class="cp-dashboard"><div class="cp-dashboard-heading"><div><span class="cp-eyebrow">CONSEQUENCE DASHBOARD</span><h3>What your decisions are changing</h3><p>Illustrative game indicators, not actual economic statistics or probabilities.</p></div><button type="button" class="cp-reset" data-policy-reset>↺ Start policy lab over</button></div>'+metricRow()+'</section>'+
 scenarioCards()+
 '<section class="cp-case"><div class="cp-case-head"><div><span class="cp-eyebrow">POLICY FILE '+String(state.scenario+1).padStart(2,'0')+' / '+scenarios.length+' · '+esc(sc.domain)+'</span><h2>'+sc.icon+' '+esc(sc.title)+'</h2><p>'+esc(sc.lead)+'</p></div><span class="cp-duration">'+esc(sc.duration)+'</span></div>'+
 '<div class="cp-brief-strip"><div><b>🏛️ Who has authority?</b><p>'+esc(sc.authority)+'</p></div><div><b>⚠️ What could go wrong?</b><p>'+esc(sc.stakes)+'</p></div></div>'+
 (state.choice===null?
 (state.scenario===0?'<div class="cp-conditions"><strong>Economic conditions affect the outcome</strong><div role="group" aria-label="Choose fictional supply conditions"><button type="button" data-supply="constrained" aria-pressed="'+String(state.supply==='constrained')+'">🚚 Supply constrained</button><button type="button" data-supply="recovering" aria-pressed="'+String(state.supply==='recovering')+'">🏭 Supply recovering</button></div><p>These choices alter the simulated impact of additional spending on price pressure; they are not forecasts.</p></div>':'')+
 '<div class="cp-action-intro"><span class="cp-eyebrow">YOUR NEXT MOVE</span><h3>What will you do?</h3><p>Choose an action. You will see the result immediately, then advance through the longer-term outcomes.</p></div>'+choiceCards(sc)
 :consequence(sc))+sourceHtml(sc)+'</section>'+
 '<section class="cp-learning-footer"><strong>What this game teaches</strong><p>Policy effects depend on implementation, economic conditions, institutions, lawful authority and human responses. Legal/ethical risks can create both short-term advantages and longer-term consequences. Some outcomes remain uncertain even after years.</p><button type="button" data-corridor-mode="career">Play the original political career →</button></section></div>';
}
function report(){
 return ['THE CORRIDORS · POLICY CONSEQUENCES','Fictional training simulation. Game metrics are not real economic predictions.','Decisions: '+state.history.length,'',
 ...state.history.map((x,i)=>(i+1)+'. '+x.scenario+' · '+x.choice+'\nLong-term scenario: '+x.outcome+'\nIllustrative indicators: '+JSON.stringify(x.metrics)+'\n'),
 'Sources are accessible within the scenario and support mechanisms, not score values.'].join('\n');
}
document.getElementById('app').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled||!b.closest('.cp-full'))return;
 if(b.hasAttribute('data-policy-case')){const i=Number(b.dataset.policyCase);if(state.choice===null&&scenarios[i]){state.scenario=i;save();render()}}
 else if(b.hasAttribute('data-supply')){state.supply=b.dataset.supply==='recovering'?'recovering':'constrained';save();render()}
 else if(b.hasAttribute('data-policy-choice'))choose(Number(b.dataset.policyChoice));
 else if(b.dataset.policyAdvance==='phase')advance();
 else if(b.dataset.policyAdvance==='case')next();
 else if(b.hasAttribute('data-policy-reset')&&confirm('Restart Policy Consequences? This does not reset your original political career.')){state=defaultState();save();render()}
});
window.CorridorsPolicyLab=Object.freeze({render,report,modeBar,getProgress:()=>({scenario:state.scenario,phase:state.phase,decisions:state.history.length,supply:state.supply,metrics:{...state.metrics}}),scenarioCount:scenarios.length});
})();
