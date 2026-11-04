/* The Docket — fictional legal simulation with evidence, admissibility and appeals. */
(function(){
'use strict';
const W=window.WorldKit,app=document.getElementById('app'),KEY='docket-save-v1';
const cases=[
 {id:'HV-04',title:'The Harborview Tender',type:'Public procurement · Civil review',story:'Meridian’s shelter contract may have been changed after bidding closed. A whistleblower accuses the winning bidder of favoritism; public funds and livelihoods are at stake.',
  issue:'Was the contract award supported by a fair, properly documented process?',standard:'The fictional tribunal examines whether procurement safeguards were followed, not whether every suspicious fact proves corruption.',best:'remand',bestWhy:'The preserved timestamps merit independent verification before a final award. The anonymous tip alone cannot establish wrongdoing.',
  evidence:[
   ['Submission receipt','A signed receipt shows the winning bid was filed on time.','document',1,'Verified original receipt; supports timely filing.',true],
   ['Modified-price spreadsheet','Its price column changed after the official deadline.','digital',2,'The file has a changed timestamp, but the author and reason are unresolved.',false],
   ['Procurement officer memo','A memo says staff were told to ignore the late edit.','testimony',2,'Named author, but a second witness disputes the instruction.',true],
   ['Anonymous tip','A caller says a political donor arranged the award.','hearsay',1,'Source and firsthand knowledge are unknown. Use as a lead, not proof.',false],
   ['Security door record','An unrelated analyst entered the office during the edit window.','exculpatory',-2,'Could explain access; does not resolve who changed the file.',true]
  ]},
 {id:'PS-11',title:'Platform Six',type:'Theft accusation · Criminal',story:'A musician is accused of stealing a commuter’s instrument bag. Surveillance footage is blurry, and a witness is confident despite a crowded station.',
  issue:'Does admissible evidence establish guilt beyond reasonable doubt?',standard:'In this fictional criminal case, the presumption of innocence controls; suspicion and eyewitness confidence are not enough by themselves.',best:'notproven',bestWhy:'Ambiguous video, conflicting timelines and untested identification leave reasonable doubt.',
  evidence:[
   ['Eyewitness identification','One rider recognizes a distinctive jacket.','testimony',2,'Confidence alone does not prove identification accuracy.',true],
   ['Station camera frame','A figure carries a similar bag in low-resolution video.','digital',1,'Timestamp is sound, identity is uncertain.',true],
   ['Payment record','Accused purchased a train ticket elsewhere ten minutes later.','exculpatory',-2,'Independent record may conflict with the alleged route.',true],
   ['Recovered jacket','A jacket is found in a shared storage locker.','physical',1,'Multiple people had access; chain of custody is incomplete.',false],
   ['Street performer schedule','Another performer used an identical bag that day.','exculpatory',-2,'A plausible alternative explanation needing investigation.',true]
  ]},
 {id:'SH-19',title:'The Shelter Deadline',type:'Emergency housing · Administrative',story:'Residents were removed from an emergency shelter under a temporary rule. Officials cite safety, but several affected families never received notice or a hearing.',
  issue:'Was a protective emergency policy applied with adequate individualized process?',standard:'Meridian’s fictional administrative code calls for notice, reasons and a prompt opportunity to respond, even when temporary measures are urgent.',best:'remand',bestWhy:'The record supports real safety concerns but also gaps in notice and opportunities to respond.',
  evidence:[
   ['Fire marshal report','Inspection finds real blocked emergency exits.','document',2,'Authenticated report supports temporary safety steps.',true],
   ['Eviction notice log','Notice forms are absent for three families.','document',-2,'Official files fail to show the required notice.',true],
   ['Director interview','Officials say there was no time for individual review.','testimony',1,'An explanation is not the same as a valid legal exception.',true],
   ['Social media rumor','A viral post alleges officials targeted residents for political reasons.','hearsay',1,'No verified source or firsthand support.',false],
   ['Emergency transfer list','Nearby rooms were available but not offered.','exculpatory',-2,'Indicates a less disruptive option may have existed.',true]
  ]},
 {id:'RB-27',title:'Riverbend After Dark',type:'Housing deposit · Civil',story:'Tenants claim their landlord withheld security deposits after they reported dangerous mold. The landlord says the funds covered repairs.',
  issue:'Do the records support lawful deductions and required notice?',standard:'This simplified fictional civil claim asks whether the landlord can substantiate deductions and follow required procedures.',best:'liable',bestWhy:'Documented withholding, inconsistent invoices and missing notices support tenant recovery in this simulated record.',
  evidence:[
   ['Deposit ledger','The landlord confirms each deposit was retained.','document',2,'Authenticated bank and accounting entries.',true],
   ['Repair invoices','Invoices are undated and list work in a different building.','document',2,'Reliability is weak; may not justify deductions.',true],
   ['Move-out photographs','Photographs show ordinary use and pre-existing staining.','exculpatory',2,'Metadata and image history are verified.',true],
   ['Tenant messages','Tenants reported mold before they moved out.','digital',2,'Both sides acknowledge receipt of the messages.',true],
   ['Property owner statement','Owner says damage was caused by the tenants.','testimony',-1,'Personal knowledge is limited; disputed by photographs.',true]
  ]},
 {id:'NM-33',title:'The Night Market Recording',type:'Assault allegation · Criminal',story:'An argument at the market became a criminal charge. A phone recording seems incriminating, but begins halfway through the exchange and its origin is disputed.',
  issue:'What can the tribunal fairly conclude from incomplete, contested footage?',standard:'Authenticity, complete context, consent and collection methods can affect what evidence may be considered. Exact real-world rules vary.',best:'notproven',bestWhy:'Incomplete video and contradictory witness statements leave the required criminal burden unmet.',
  evidence:[
   ['Market phone video','Shows a shove, but omits what happened immediately before.','digital',2,'Original source and chain are disputed; context is incomplete.',false],
   ['Vendor testimony','A vendor says the other person raised a heavy object first.','exculpatory',-2,'Direct account; visibility of the entire encounter was limited.',true],
   ['Clinic record','Confirms a minor injury after the confrontation.','document',1,'Proves injury, not necessarily the cause or legal responsibility.',true],
   ['Edited viral clip','An account posts 12 seconds with added captions.','digital',2,'Edited derivative clip is unreliable without the original.',false],
   ['Second camera angle','Shows an earlier confrontation out of frame.','exculpatory',-2,'Timestamped footage supports an alternative context.',true]
  ]}
];
const roles=[
 ['investigator','🔎 Investigator','Find out what happened, including evidence that undermines your first theory.'],
 ['defense','🛡️ Defense','Test the allegation, challenge weak proof and protect a fair hearing.'],
 ['prosecutor','📑 Prosecutor','Disclose helpful and harmful evidence, and seek outcomes supported by proof.'],
 ['judge','⚖️ Judge','Manage procedure impartially and decide only on reliable evidence.']
];
const initial={index:0,role:null,phase:'intake',reviewed:[],openEvidence:-1,motion:null,decision:null,appeal:null,integrity:60,reasoning:55,reputation:53,history:[],journal:[],report:false,finished:false};
let state=W.load(KEY,initial);
if(!Array.isArray(state.history)||!Array.isArray(state.reviewed)||state.index>cases.length)state=W.copy(initial);
const num=n=>Math.round(n),c=()=>cases[state.index],role=()=>roles.find(r=>r[0]===state.role),done=()=>state.history.length;
const save=()=>{['integrity','reasoning','reputation'].forEach(k=>state[k]=W.clamp(state[k]));W.save(KEY,state)};
const log=t=>{state.journal.push({when:'CASE '+(state.index+1),text:t});state.journal=state.journal.slice(-90)};
const label=d=>d==='liable'?'Find responsibility established':d==='notproven'?'Find the allegation NOT proven':'Order further fact-finding / review';
function report(){return [
 'THE DOCKET / LEGAL REALITY REPORT','The Meridian Universe · Fictional cases and simplified legal concepts',
 'Cases completed: '+done()+' / '+cases.length,'Integrity: '+num(state.integrity)+' · Reasoning: '+num(state.reasoning)+' · Reputation: '+num(state.reputation),
 '','CASE RESULTS',...state.history.map(h=>h.id+' '+h.title+' · '+h.role+' · '+h.decision+' · '+h.comment+' · '+h.appeal),
 '','CURRENT CASE',state.finished?'All cases concluded':c().id+' '+c().title,
 state.finished?'':c().issue,
 '','DECISIONS AND OBSERVATIONS',...state.journal.map(x=>x.when+': '+x.text),
 '','Legal outcomes depend on jurisdiction, procedure, facts and precedent. This game is not legal advice.'
 ].join('\n')}
function review(i){
 if(state.phase!=='investigate')return;
 const ev=c().evidence[i];if(!ev)return;state.openEvidence=i;
 if(!state.reviewed.includes(i)){state.reviewed.push(i);state.reasoning+=2;log('Examined '+ev[0]+': '+ev[3])}
 save();render()
}
function selectRole(name){
 if(state.phase!=='intake'||!roles.some(x=>x[0]===name))return;
 state.role=name;state.phase='investigate';log('Selected role: '+role()[1]+'. '+role()[2]);save();render()
}
function toPretrial(){if(state.phase==='investigate'&&state.reviewed.length>=3){state.phase='pretrial';save();render()}}
const motions={
 challenge:{name:'Challenge unreliable material',why:'Ask the tribunal to exclude evidence with authentication or chain-of-custody defects. Unreliable records remain investigative leads but do not automatically become trial proof.',impact:'Questionable evidence receives formal scrutiny.'},
 disclose:{name:'Disclose adverse and helpful evidence',why:'Create a complete record, including evidence favorable to the opposing position. Procedural fairness improves even when your case becomes harder.',impact:'All sides can see evidence that contradicts their theories.'},
 stipulate:{name:'Agree only to independently verified facts',why:'Focus the hearing on contested issues without claiming that every record is established or every witness truthful.',impact:'The hearing becomes narrower but unresolved facts still require proof.'}
};
function moveMotion(k){
 if(state.phase!=='pretrial'||!motions[k])return;
 state.motion=k;state.phase='hearing';
 state.integrity+=k==='disclose'?12:k==='challenge'?9:5;
 state.reasoning+=k==='disclose'?8:k==='challenge'?9:6;
 log('Pretrial ruling sought: '+motions[k].name+'. '+motions[k].impact);save();render()
}
function evidenceBalance(){
 let proof=0,unsafe=0,contrary=0;
 state.reviewed.forEach(i=>{
   const e=c().evidence[i];
   if(!e[5])unsafe++;
   if(e[2]==='exculpatory')contrary++;
   if(!e[5]&&state.motion==='challenge')return;
   proof+=e[3];
 });
 return {proof,unsafe,contrary};
}
function decide(k){
 if(state.phase!=='hearing'||!['liable','notproven','remand'].includes(k))return;
 const relevant=c(),b=evidenceBalance();
 state.decision=k;state.phase='result';
 const good=k===relevant.best;const completeness=state.reviewed.length===relevant.evidence.length;
 const caution=state.motion==='challenge'&&b.unsafe>0;
 const fair=good&&completeness;
 state.reasoning+=good?17:-11;state.reputation+=good?12:-13;
 state.integrity+=fair?7:good?3:-7;
 let feedback=good?'Your determination fits the strongest supported interpretation of the simulated record.':'The reviewing panel would favor another outcome based on the available record.';
 if(!completeness)feedback+=' You left some material unexamined; missing evidence can change what is provable.';
 if(caution)feedback+=' Your procedural challenge prevented contested material from counting as established proof.';
 if(state.motion==='disclose')feedback+=' You ensured contrary evidence was disclosed rather than suppressed.';
 state.feedback=feedback;
 log('Hearing conclusion: '+label(k)+'. '+feedback);
 save();render()
}
function appeal(k){
 if(state.phase!=='result'||state.appeal)return;
 if(!['procedure','facts','none'].includes(k))return;
 const cse=c(),wrong=state.decision!==cse.best;
 state.appeal=k==='none'?'No appeal requested':k==='procedure'?(state.motion==='challenge'?'Procedure reviewed; exclusion ruling upheld.':'Procedure reviewed; the panel orders clearer findings and disclosure.'):wrong?'Facts reviewed; the outcome is returned for reconsideration.':'Facts reviewed; the original outcome is affirmed.';
 state.phase='closed';
 if(k==='procedure'){state.reasoning+=5;state.integrity+=3}
 if(k==='none')state.reasoning+=1;
 log('Appeal: '+state.appeal);save();render()
}
function nextCase(){
 if(state.phase!=='closed')return;
 const current=c();
 state.history.push({id:current.id,title:current.title,role:role()[1],decision:label(state.decision),comment:state.feedback,appeal:state.appeal});
 W.chronicle('The Docket',current.id+' · '+current.title+' concluded: '+label(state.decision)+'.');
 state.index++;state.role=null;state.phase='intake';state.reviewed=[];state.openEvidence=-1;state.motion=null;state.decision=null;state.appeal=null;state.feedback='';
 if(state.index>=cases.length)state.finished=true;
 save();render();window.scrollTo({top:0,behavior:'smooth'})
}
function roleHtml(){
 return '<section class="panel"><span class="overline">CASE INTAKE · '+W.escape(c().id)+'</span><h2>Choose your seat in the legal system</h2><p class="subline">Try each role across five linked fictional cases. Duties differ, but no role gets to invent or hide facts.</p><div class="case-grid">'+roles.map(r=>'<button class="casecard" data-role="'+r[0]+'"><strong>'+r[1]+'</strong><small>'+W.escape(r[2])+'</small></button>').join('')+'</div></section>';
}
function evidenceHtml(){
 const cs=c(),b=evidenceBalance();
 const cards=cs.evidence.map((e,i)=>{
  const seen=state.reviewed.includes(i),active=state.openEvidence===i;
  return '<button class="evidence '+(seen?'acquired':'')+'" data-evidence="'+i+'" aria-expanded="'+active+'"><strong>'+['📑','📼','🔎','🗂️','📎'][i]+' '+W.escape(e[0])+'</strong><span>'+W.escape(e[1])+'</span><span class="tag">'+(seen?'✓ Analyzed':'Tap to inspect')+' · '+W.escape(e[2])+'</span></button>';
 }).join('');
 const inspected=state.openEvidence>=0?cs.evidence[state.openEvidence]:null;
 return '<section class="panel"><span class="overline">INVESTIGATION · '+state.reviewed.length+' / '+cs.evidence.length+' SOURCES REVIEWED</span><h2>Case Intelligence Board</h2><p class="subline">Trace the source, reliability, context and custody of each item. Some material challenges the obvious theory.</p><div class="evidence-grid">'+cards+'</div>'+
 (inspected?'<div class="callout" style="margin-top:14px"><strong>🔎 Evidence examination: '+W.escape(inspected[0])+'</strong><p>'+W.escape(inspected[3])+'</p><p><b>Procedural status:</b> '+(inspected[5]?'Initially authenticated in the simulation.':'Contested: further verification or admissibility review needed.')+'</p></div>':'')+
 '<p class="note">Evidence score is not a real legal standard. Material can be relevant yet inadmissible, and an allegation can remain unproven.</p><div class="button-row"><button class="button" data-pretrial '+(state.reviewed.length<3?'disabled':'')+'>Proceed to pretrial review →</button><span class="pill">'+Math.max(0,3-state.reviewed.length)+' more items needed</span></div></section>';
}
function pretrialHtml(){
 return '<section class="panel"><span class="overline">PRETRIAL · PROCEDURE MATTERS</span><h2>Decide what can be heard</h2><p class="subline">Your '+W.escape(role()[1])+' path influences how you prepare. Some evidence is contested and may require a foundation or review.</p><div class="choices">'+Object.keys(motions).map(k=>'<button class="option" data-motion="'+k+'"><b>'+W.escape(motions[k].name)+'</b><small>'+W.escape(motions[k].why)+'</small></button>').join('')+'</div><div class="callout" style="margin-top:13px"><b>Case rule:</b> '+W.escape(c().standard)+'</div></section>';
}
function hearingHtml(){
 const b=evidenceBalance();
 return '<section class="panel"><span class="overline">HEARING · '+W.escape(role()[1])+'</span><h2>What does the record support?</h2><p class="subline">Reason from the strongest *admissible* evidence. Never confuse confidence, publicity or access with proof.</p><div class="callout"><b>Pretrial approach:</b> '+W.escape(motions[state.motion].name)+'<p>'+W.escape(motions[state.motion].why)+'</p></div><div class="statgrid" style="margin:14px 0">'+W.stat('Items reviewed',state.reviewed.length,'',5)+W.stat('Contested items',b.unsafe,'',5)+W.stat('Contrary sources',b.contrary,'',5)+'</div><div class="scene"><h3>Issue for decision</h3><p>'+W.escape(c().issue)+'</p><p>'+W.escape(c().standard)+'</p></div><div class="choices">'+[
 ['liable','Responsibility established','Select only when the evidence and procedural standard support it.'],
 ['notproven','Allegation not proven','A lack of sufficient proof is not the same as proof of an alternative story.'],
 ['remand','Further investigation / procedural review','Return the matter where notice, records, or critical facts need examination.']
 ].map(o=>'<button class="option" data-decide="'+o[0]+'"><b>'+W.escape(o[1])+'</b><small>'+W.escape(o[2])+'</small></button>').join('')+'</div></section>';
}
function resultHtml(){
 const cs=c();
 return '<section class="panel"><span class="overline">DECISION & CONSEQUENCES</span><h2>'+W.escape(label(state.decision))+'</h2><div class="result"><h3>Legal Reality Report</h3><p><b>Your ruling or recommendation:</b> '+W.escape(label(state.decision))+'</p><p><b>Reasoning review:</b> '+W.escape(state.feedback)+'</p><p><b>Most defensible outcome in this fictional record:</b> '+W.escape(label(cs.best))+'</p><p><b>Why:</b> '+W.escape(cs.bestWhy)+'</p><p><b>Legal principle:</b> '+W.escape(cs.standard)+'</p></div><h3 style="margin-top:17px">Is there an appeal?</h3><div class="choices">'+[
 ['procedure','Request procedural review','Challenge how the rules, exclusions or disclosures were handled.'],
 ['facts','Request evidence review','Ask a reviewing panel to consider sufficiency and fact-based reasoning.'],
 ['none','Accept outcome and close','Record the determination and continue to a different case.']
 ].map(o=>'<button class="option" data-appeal="'+o[0]+'"><b>'+W.escape(o[1])+'</b><small>'+W.escape(o[2])+'</small></button>').join('')+'</div></section>';
}
function closedHtml(){
 return '<section class="panel"><span class="overline">FILE CLOSED · '+W.escape(c().id)+'</span><h2>Case complete</h2><div class="result"><p><b>Decision:</b> '+W.escape(label(state.decision))+'</p><p><b>Appeal:</b> '+W.escape(state.appeal)+'</p><p><b>Truth and procedure:</b> '+W.escape(c().bestWhy)+'</p><p><b>Professional lesson:</b> Reliable evidence, adequate disclosure and procedural fairness matter more than winning at any cost.</p><button class="button" data-nextcase>Open '+(state.index===cases.length-1?'final career results':'next case')+' →</button></div></section>';
}
function finalHtml(){
 let title=state.integrity>=75&&state.reasoning>=70?'A Reputation for Fairness':state.reasoning>=60?'A Careful Advocate':'Learning the Weight of Proof';
 return '<section class="panel ending"><div class="big">⚖️</div><span class="overline">FIVE CASES · A COMPLETE LEGAL CAREER</span><h2>'+title+'</h2><p>You worked through investigation, the rules of evidence, contested facts, hearings, and appeals. Your legacy is your reasoning and respect for process.</p><div class="statgrid" style="margin:18px 0">'+W.stat('Integrity',num(state.integrity))+W.stat('Reasoning',num(state.reasoning))+W.stat('Reputation',num(state.reputation))+'</div><div class="button-row" style="justify-content:center"><button class="button" data-report>View career report</button><button class="button-quiet" data-download>Export report</button></div></section>';
}
function render(){
 const cs=c(),progress=Math.min(state.index+1,cases.length);
 let html='<div class="maincol"><section class="panel"><span class="overline">MERIDIAN COURTHOUSE · '+(state.finished?'COMPLETE':'FILE '+progress+' OF '+cases.length)+'</span><h2>'+(state.finished?'Career completed':W.escape(cs.title))+'</h2><p class="subline">'+(state.finished?'Your cases are preserved in your legal dossier.':W.escape(cs.story))+'</p><div class="timeline">'+['intake','investigate','pretrial','hearing','result','closed'].map(p=>'<span class="'+(state.phase===p&&!state.finished?'current':'')+'">'+p.toUpperCase()+'</span>').join('')+'</div></section>';
 if(state.finished)html+=finalHtml();
 else if(state.phase==='intake')html+=roleHtml();
 else if(state.phase==='investigate')html+=evidenceHtml();
 else if(state.phase==='pretrial')html+=pretrialHtml();
 else if(state.phase==='hearing')html+=hearingHtml();
 else if(state.phase==='result')html+=resultHtml();
 else if(state.phase==='closed')html+=closedHtml();
 html+='<section class="panel"><span class="overline">THE RULES BEHIND THE VERDICT</span><h2>Beyond guilty or not guilty</h2><p class="subline">A fictional legal world built around the reality that process shapes results. Different case types can use different burdens and remedies.</p><div class="compare"><div><strong>🔬 EVIDENCE</strong><p>Source, corroboration, alternatives, chain of custody, authentication.</p></div><div><strong>⚖️ PROCEDURE</strong><p>Notice, disclosure, hearings, motions, fairness, appeals.</p></div></div></section></div>';
 html+='<aside class="sidecol"><section class="panel"><h2>Your legal profile</h2><div class="statgrid">'+W.stat('Integrity',num(state.integrity))+W.stat('Reasoning',num(state.reasoning))+W.stat('Reputation',num(state.reputation))+'</div><p class="note">Different roles have different duties. Professional judgment is about truth, process and fairness—not a conviction or win rate.</p></section>';
 html+='<section class="panel"><h2>Case docket</h2><div class="case-grid">'+cases.map((x,i)=>'<div class="casecard '+(i===state.index&&!state.finished?'active':'')+'"><em>'+W.escape(x.id)+'</em><strong style="display:block;margin-top:4px">'+W.escape(x.title)+'</strong><small>'+(i<state.index?'✓ CLOSED':i===state.index&&!state.finished?'● ACTIVE':'○ LOCKED')+'</small></div>').join('')+'</div></section>';
 html+='<section class="panel"><h2>Legal dossier</h2><div class="button-row"><button class="button-quiet" data-report>📋 '+(state.report?'Hide':'Open')+' Legal Reality Report</button><button class="button-quiet" data-download>↓ Export report</button><button class="button-quiet" data-reset>↺ Reset career</button></div></section>';
 html+='<section class="panel"><h2>Your case record</h2>'+W.journal(state.journal)+'</section><section class="panel"><h2>Elsewhere in Meridian</h2>'+W.cross('The Docket')+'</section></aside>';
 if(state.report)html+='<section class="panel" style="grid-column:1/-1"><span class="overline">PERSONALIZED COURTROOM SUMMARY</span><h2>Legal Reality Report</h2><pre style="white-space:pre-wrap;font:12px/1.7 inherit;overflow-wrap:anywhere">'+W.escape(report())+'</pre></section>';
 app.innerHTML=html;
}
app.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.role)selectRole(b.dataset.role);
 else if(b.hasAttribute('data-evidence'))review(Number(b.dataset.evidence));
 else if(b.hasAttribute('data-pretrial'))toPretrial();
 else if(b.dataset.motion)moveMotion(b.dataset.motion);
 else if(b.dataset.decide)decide(b.dataset.decide);
 else if(b.dataset.appeal)appeal(b.dataset.appeal);
 else if(b.hasAttribute('data-nextcase'))nextCase();
 else if(b.hasAttribute('data-report')){state.report=!state.report;save();render()}
 else if(b.hasAttribute('data-download'))W.download('The-Docket-Legal-Reality-Report.txt',report());
 else if(b.hasAttribute('data-reset'))W.reset(KEY,'The Docket');
});
save();render();
})();