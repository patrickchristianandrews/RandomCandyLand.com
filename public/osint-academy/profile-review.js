/* TRACE Identity Lab — guided, consent-based public account/evidence review.
 * Every data field is optional. No reverse lookup, scraping, hidden-account search, tracking,
 * server submission or default persistence. A score is a transparent reviewer-selected rubric,
 * NEVER a calibrated identity probability.
 */
(()=>{'use strict';
const root=document.getElementById('trace-profile-review');if(!root)return;
const $=id=>root.querySelector('#'+id),$$=selector=>[...root.querySelectorAll(selector)];
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signals=[
 {id:'confirmed',label:'Owner directly confirmed this account',weight:35,why:'The account owner confirms this particular public account; document how the confirmation was obtained.'},
 {id:'crosslink',label:'Two official pages cross-link each other',weight:30,why:'Reciprocal links from authentic public pages offer stronger attribution than matching usernames.'},
 {id:'official',label:'Official organization page links to account',weight:24,why:'Supports official affiliation or representation; it does not automatically identify a private individual.'},
 {id:'declared',label:'Another confirmed profile links here',weight:17,why:'A documented, account-owned connection supports attribution. Check source and dates.'},
 {id:'handle',label:'Username or display name matches',weight:5,why:'Common or imitated names and handles are only a weak clue.'},
 {id:'context',label:'Public content and dates align',weight:9,why:'Consistent context adds limited support; similarity is not proof of common ownership.'},
 {id:'conflict',label:'Evidence contradicts the attribution',weight:-35,why:'Strong contradictory evidence should lower confidence and stay visible.'}
];
const profileFields=[
 ['name','Name or organization','text','Name or company, if known'],
 ['username','Username / public handle','text','e.g. @example'],
 ['email','Email address','email','Only if shared for this review'],
 ['phone','Phone number','tel','Only if shared for this review'],
 ['publicAddress','Public business address','text','Optional business/office location only'],
 ['website','Public website','url','https://example.com'],
 ['purpose','Review purpose or context','text','What are you hoping to clarify?']
];
const state={candidates:[],step:0,editing:null};
const demo=[
 {label:'Gates Foundation: verified accounts',url:'https://www.gatesfoundation.org/about/verified-accounts',why:'A primary source explicitly lists the organization’s public accounts.'},
 {label:'Bill Gates — X public account',url:'https://x.com/BillGates',why:'Example only. Check the official account listing for current attribution.'},
 {label:'Gates Notes — public personal site',url:'https://www.gatesnotes.com/',why:'A public site that identifies its author; verify the page directly.'}
];
const fields=profileFields.map(([id,label,type,placeholder])=>'<label>'+safe(label)+' <small>optional</small><input id="profile-'+id+'" autocomplete="off" type="'+type+'" maxlength="'+(id==='website'?450:200)+'" placeholder="'+safe(placeholder)+'"></label>').join('');
root.innerHTML=
 '<header class="trace-profile-intro"><div><span class="eyebrow">PERSONAL PROFILE STUDIO · ALL DETAILS OPTIONAL</span><h2>Build an evidence-linked profile</h2><p>Start with a name, an email, a phone, a username, a public link—or nothing yet. Add only information you own or are authorized to review. You can skip any step.</p></div><span class="trace-id-chip">NOT SENT TO A SERVER</span></header>'+
 '<nav id="profileSteps" class="trace-profile-steps" aria-label="Build a profile in three simple stages"><button type="button" data-profile-step="0"><span>01</span><b>About</b><small>Known details</small></button><button type="button" data-profile-step="1"><span>02</span><b>Connections</b><small>Links & clues</small></button><button type="button" data-profile-step="2"><span>03</span><b>My report</b><small>Review & export</small></button></nav>'+
 '<section class="trace-profile-stage" data-profile-panel="0" aria-label="Known details"><div class="trace-profile-stage-header"><h3>What do you know?</h3><p>Everything is optional. Add one detail, several, or leave this blank and move on. No searches occur when you type.</p></div><div class="trace-profile-fields">'+fields+'</div><div class="trace-profile-tip"><strong>🔒 Privacy tip</strong><p>Only include contact details you are comfortable keeping in the report. A mailing or registered-agent address is not proof of where a person lives.</p></div></section>'+
 '<section class="trace-profile-stage" data-profile-panel="1" aria-label="Public account evidence" hidden><div class="trace-profile-stage-header"><h3>Add public links or evidence</h3><p>An account URL, platform name, supporting note, and all indicators are <strong>optional</strong>. Add what you have; leave blanks when unknown. A blank card isn’t added.</p></div>'+
 '<div class="trace-profile-add"><div class="trace-profile-add-title"><strong id="candidateFormTitle">One account or clue</strong><span>Everything below is optional</span></div><div class="trace-profile-candidate-fields"><label>Platform or record type <small>optional</small><input id="candidate-platform" maxlength="85" placeholder="e.g. Instagram, public directory, document"></label><label>Public URL <small>optional</small><input id="candidate-url" maxlength="550" type="url" placeholder="https://example.com/profile"></label><label>Source, date or explanation <small>optional</small><input id="candidate-source" maxlength="400" placeholder="How do you know about this link?"></label><label>Your notes <small>optional</small><textarea id="candidate-notes" rows="2" maxlength="1600" placeholder="Record what is confirmed, questioned or missing."></textarea></label></div>'+
 '<details class="trace-profile-evidence-selector"><summary>+ Add evidence indicators <small>optional; see why a connection might be supported or disputed</small></summary><fieldset class="trace-profile-signals"><legend>Tick only indicators supported by the material you have</legend>'+signals.map(s=>'<label><input type="checkbox" data-profile-indicator="'+s.id+'"><span><b>'+safe(s.label)+'</b><small>'+safe(s.why)+'</small></span></label>').join('')+'</fieldset></details>'+
 '<div class="trace-profile-add-actions"><button type="button" id="candidate-add" class="cta">+ Add this clue</button><button type="button" id="candidate-cancel" class="outline" hidden>Cancel editing</button><span id="candidate-status" role="status" aria-live="polite"></span></div></div>'+
 '<div class="trace-profile-source-heading"><div><h3>Evidence map <small id="profile-count">0 clues</small></h3><p>Only what you enter is shown. Connections are provisional until independently supported.</p></div><button type="button" id="profile-import" class="outline">↑ Import my saved report</button><input type="file" id="profile-import-file" accept=".json,application/json" hidden></div><div id="profile-candidates" class="trace-profile-candidates"></div></section>'+
 '<section class="trace-profile-stage" data-profile-panel="2" aria-label="Review report" hidden><div class="trace-profile-stage-header"><h3>Your profile report</h3><p>Review the details and strengths of your evidence before sharing. You can export a partially completed or entirely blank template.</p></div>'+
 '<div id="profile-report" class="trace-profile-report" aria-live="polite"></div>'+
 '<section class="trace-profile-authorize"><fieldset class="trace-profile-ownership"><legend>Who is this review about?</legend><label><input type="radio" name="profile-owner" value="self" checked> My own profile</label><label><input type="radio" name="profile-owner" value="authorized"> Someone who explicitly authorized this review</label></fieldset><label class="trace-profile-consent"><input type="checkbox" id="profile-consent"><span id="profile-consent-text">I authorize the export or printing of the information I chose to include about myself.</span></label><p>The confirmation above is required to export or print, but every actual information field remains optional.</p></section>'+
 '<div class="trace-profile-actions"><button type="button" id="profile-export" class="cta">↓ Save my report (JSON)</button><button type="button" id="profile-print" class="outline">▤ Print / Save as PDF</button><button type="button" id="profile-clear" class="outline">↺ Start a new report</button></div><p class="trace-profile-footnote">This is an evidence organizer, not a background-check service or identity verification product. Indicator scores are an illustrative rubric, not a probability that someone controls an account. There are no hidden-account searches or live location lookups.</p></section>'+
 '<footer class="trace-profile-foot"><button type="button" id="profile-prev" class="outline">← Previous</button><span id="profile-stage-count" aria-live="polite">Step 1 of 3</span><button type="button" id="profile-next" class="cta">Continue →</button></footer>'+
 '<details class="trace-profile-demo"><summary>See how the evidence works: a real public-figure example</summary><div><strong>Example: Bill Gates</strong><p>This sample references only publicly identified accounts or websites, not guessed connections. Use these links to check how attribution should be documented.</p><div id="profile-demo-links"></div><p>Officially listed accounts provide much stronger evidence than matching avatars or handles. This demonstration does not identify undisclosed accounts or infer a person’s location.</p></div></details>'+
 '<p id="profile-status" class="trace-profile-live-status" role="status" aria-live="polite"></p>';
const demoBox=$('profile-demo-links');for(const d of demo){const wrap=document.createElement('div');const a=document.createElement('a');a.href=d.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=d.label+' ↗';const p=document.createElement('small');p.textContent=d.why;wrap.append(a,p);demoBox.append(wrap)}
function value(id){return String($(id)?.value||'').trim()}
function collectProfile(){const p={};for(const [id] of profileFields)p[id]=value('profile-'+id);return p}
function idFor(){return 'e'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function collectCandidate(){
 const c={id:state.editing||idFor(),platform:value('candidate-platform'),url:value('candidate-url'),source:value('candidate-source'),notes:value('candidate-notes'),indicators:$$('[data-profile-indicator]:checked').map(x=>x.dataset.profileIndicator)};
 if(c.url){let u;try{u=new URL(c.url);if(!/^https?:$/.test(u.protocol)||u.username||u.password)throw Error('Invalid URL');c.url=u.href}catch{throw Error('If you include a URL, please use a valid public http:// or https:// address. Otherwise leave it blank.')}}
 if(!c.platform&&!c.url&&!c.source&&!c.notes&&!c.indicators.length)return null;
 return c;
}
function score(c){
 const active=signals.filter(s=>c.indicators.includes(s.id));
 const value=Math.min(100,Math.max(0,active.reduce((sum,s)=>sum+s.weight,0)));
 return {value,active,category:!active.length?'Not assessed':value>=65?'Several supporting indicators':value>=30?'Some support':value>0?'Weak indicators only':'Contradictory or insufficient'};
}
function clearCandidateFields(){
 for(const id of ['candidate-platform','candidate-url','candidate-source','candidate-notes'])$(id).value='';
 $$('[data-profile-indicator]').forEach(x=>x.checked=false);
 state.editing=null;$('candidateFormTitle').textContent='One account or clue';$('candidate-add').textContent='+ Add this clue';$('candidate-cancel').hidden=true;
}
function setStatus(message,where='profile-status'){const el=$(where);if(el)el.textContent=message}
function addCandidate(){
 let c;try{c=collectCandidate()}catch(e){setStatus(String(e.message),'candidate-status');return}
 if(!c){setStatus('Enter any detail or check an indicator to add a clue. You can also skip this step.','candidate-status');return}
 if(!state.editing&&state.candidates.length>=50){setStatus('Maximum of 50 clues per report. Remove one or export the current report first.','candidate-status');return}
 const idx=state.candidates.findIndex(x=>x.id===c.id);
 if(idx>=0)state.candidates[idx]=c;else state.candidates.push(c);
 clearCandidateFields();setStatus(idx>=0?'Clue updated.':'Clue added. No external lookup was performed.','candidate-status');
 renderCandidates();
}
function addText(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;e.textContent=text;return e}
function renderCandidates(){
 const area=$('profile-candidates');area.replaceChildren();const count=state.candidates.length;$('profile-count').textContent=count+' '+(count===1?'clue':'clues');
 if(!count){area.append(addText('p','trace-profile-empty','No clues yet. This is okay—proceed with only the information you know.'));return}
 for(const c of state.candidates){
  const meter=score(c),card=addText('article','trace-profile-evidence-card','');
  const head=addText('div','trace-profile-evidence-head','');
  const title=addText('strong',null,c.platform||(c.url?new URL(c.url).hostname:'Evidence note'));
  const status=addText('span',null,meter.category);head.append(title,status);card.append(head);
  if(c.url){const link=document.createElement('a');link.href=c.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open supplied public link ↗';card.append(link)}
  if(c.source)card.append(addText('p','trace-profile-cited','Source or context: '+c.source));
  if(c.notes)card.append(addText('p','trace-profile-note',c.notes));
  const strength=addText('div','trace-profile-meter','');strength.setAttribute('role','img');strength.setAttribute('aria-label','Reviewer-selected evidence strength: '+meter.value+' out of 100. Not an identity probability.');const fill=addText('span',null,'');fill.style.width=meter.value+'%';strength.append(fill);card.append(strength);
  const details=addText('details','trace-profile-card-details','');
  const summary=addText('summary',null,'Why this rating? · '+meter.value+' / 100 (illustrative evidence rubric)');details.append(summary);
  if(!meter.active.length)details.append(addText('p',null,'No indicators selected. Attribution has not been assessed; a similar name alone is not proof.'));
  for(const x of meter.active)details.append(addText('p',null,(x.weight>0?'+':'')+x.weight+' · '+x.label+' — '+x.why));
  card.append(details);
  const actions=addText('div','trace-profile-evidence-actions','');
  const edit=addText('button','outline','Edit');edit.type='button';edit.dataset.editCandidate=c.id;
  const remove=addText('button','outline','Remove');remove.type='button';remove.dataset.removeCandidate=c.id;
  actions.append(edit,remove);card.append(actions);area.append(card);
 }
}
function editCandidate(id){
 const c=state.candidates.find(x=>x.id===id);if(!c)return;
 state.editing=id;
 for(const field of ['platform','url','source','notes'])$('candidate-'+field).value=c[field]||'';
 $$('[data-profile-indicator]').forEach(x=>x.checked=c.indicators.includes(x.dataset.profileIndicator));
 $('candidateFormTitle').textContent='Edit this clue';$('candidate-add').textContent='✓ Save changes';$('candidate-cancel').hidden=false;
 $('candidate-platform').focus();
}
function report(){
 const p=collectProfile(),provided=Object.entries(p).filter(([k,v])=>v);
 const all=state.candidates.length;
 const assessed=state.candidates.filter(c=>c.indicators?.length);
 const scores=assessed.map(c=>score(c).value);
 const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
 return {p,provided,all,assessed:assessed.length,avg};
}
function renderReport(){
 const {provided,all,assessed,avg}=report(),host=$('profile-report');host.replaceChildren();
 const stats=addText('div','trace-profile-report-stats','');
 for(const [label,num,sub] of [['Known details',provided.length,'of '+profileFields.length+' optional'],['Public clues',all,'entered by you'],['Evidence assessed',assessed,'using indicators']]){
  const card=addText('div','trace-profile-report-stat','');card.append(addText('strong',null,String(num)),addText('span',null,label),addText('small',null,sub));stats.append(card);
 }
 host.append(stats);
 const info=addText('section','trace-profile-report-panel','');info.append(addText('h4',null,'What you included'));
 if(!provided.length)info.append(addText('p',null,'No identifying information entered. Your report can be saved as a blank template.'));
 else for(const [id,v] of provided){const field=profileFields.find(x=>x[0]===id);info.append(addText('p',null,field[1]+': '+v))}
 host.append(info);
 const analysis=addText('section','trace-profile-report-panel','');analysis.append(addText('h4',null,'Connection map'));
 if(!all)analysis.append(addText('p',null,'No connections supplied. You can still export this profile and add more information later.'));
 for(const c of state.candidates){
  const x=score(c),row=addText('div','trace-profile-connection-row','');
  row.append(addText('strong',null,c.platform||(c.url?'Public link':'Evidence note')));
  row.append(addText('span',null,x.category+(c.indicators.length?' · '+x.value+'/100':' · not assessed')));
  if(c.source)row.append(addText('small',null,c.source));
  analysis.append(row);
 }
 host.append(analysis);
 host.append(addText('p','trace-profile-report-warning',avg===null?'No statistical identity conclusion can be drawn. No evidence has been scored.':'Scores are reviewer-selected evidence-strength indicators, NOT probabilities of account ownership or identity. No information was independently verified.'));
}
function openStep(index){
 if(!Number.isInteger(index)||index<0||index>2)return;
 state.step=index;
 $$('[data-profile-panel]').forEach(el=>el.hidden=Number(el.dataset.profilePanel)!==index);
 $$('[data-profile-step]').forEach(btn=>{const active=Number(btn.dataset.profileStep)===index;btn.setAttribute('aria-current',active?'step':'false');btn.classList.toggle('active',active)});
 $('profile-prev').disabled=index===0;$('profile-next').hidden=index===2;$('profile-next').textContent=index===1?'Review my report →':'Continue →';
 $('profile-stage-count').textContent='Step '+(index+1)+' of 3';
 if(index===2)renderReport();
}
function owner(){return root.querySelector('input[name="profile-owner"]:checked')?.value==='authorized'?'authorized':'self'}
function authorized(){if($('#profile-consent').checked)return true;setStatus('Please confirm that you own this information or have permission before exporting or printing.');$('#profile-consent').focus();return false}
function payload(){return {type:'trace-consent-based-profile-review',version:2,created:new Date().toISOString(),consentBasis:owner()==='self'?'self-asserted':'other-person-authorization-asserted',profile:collectProfile(),candidates:state.candidates.map(({id,platform,url,source,notes,indicators})=>({id,platform,url,source,notes,indicators,score:score({indicators}).value})),scoring:'Illustrative user-selected evidence-strength rubric. NOT a statistically calibrated probability or independently verified account connection.',limitations:'No reverse lookup, identity discovery, hidden-account search, live location tracing, tracking or server transmission.'}}
function exportReview(){
 if(!authorized())return;
 try{
  const documentText=JSON.stringify(payload(),null,2);
  if(typeof documentText!=='string'||!documentText.length)throw Error('The report could not be assembled.');
  const blob=new Blob([documentText],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='trace-my-identity-review.json';document.body.append(a);
  try{a.click()}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
  setStatus('Review file prepared for download. Keep it private and review before sharing.');
 }catch(error){
  const message=String(error?.message||'Unknown download error').slice(0,180);
  setStatus('Export could not start: '+message);
  console.error('TRACE identity report export failed:',error);
 }
}
function printReview(){if(!authorized())return;renderReport();window.print();setStatus('Print view opened. Choose Save as PDF to keep a copy.')}
function importReview(file){
 if(!file||file.size>500_000){setStatus('Choose a report file smaller than 500 KB.');return}
 file.text().then(data=>{
  const obj=JSON.parse(data);
  if(obj?.type!=='trace-consent-based-profile-review'||![1,2].includes(obj.version)||!obj.profile||typeof obj.profile!=='object'||!Array.isArray(obj.candidates))throw Error('Unrecognized report format.');
  for(const [id] of profileFields){const old=id==='publicAddress'?'publicOrganizationAddress':id;const v=obj.profile[id]??obj.profile[old]??'';$('#profile-'+id).value=String(v).slice(0,450)}
  state.candidates=obj.candidates.slice(0,50).filter(c=>c&&typeof c==='object').map(c=>({
   id:idFor(),platform:String(c.platform||'').slice(0,85),url:(()=>{try{const u=new URL(String(c.url||''));return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return''}})(),
   source:String(c.source||'').slice(0,400),notes:String(c.notes||'').slice(0,1600),
   indicators:(Array.isArray(c.indicators)?c.indicators:[]).filter(id=>signals.some(s=>s.id===id))
  }));
  clearCandidateFields();$('#profile-consent').checked=false;renderCandidates();openStep(1);setStatus('Report imported on this device. Please review the information and confirm permission again before exporting.');
 }).catch(()=>setStatus('Could not import this file. Use a JSON review exported from TRACE.'));
}
$$('[data-profile-step]').forEach(btn=>btn.addEventListener('click',()=>openStep(Number(btn.dataset.profileStep))));
$('profile-next').addEventListener('click',()=>openStep(state.step+1));
$('profile-prev').addEventListener('click',()=>openStep(state.step-1));
$('candidate-add').addEventListener('click',addCandidate);
$('candidate-cancel').addEventListener('click',clearCandidateFields);
$('profile-candidates').addEventListener('click',event=>{
 const edit=event.target.closest('[data-edit-candidate]'),remove=event.target.closest('[data-remove-candidate]');
 if(edit)editCandidate(edit.dataset.editCandidate);
 if(remove){state.candidates=state.candidates.filter(c=>c.id!==remove.dataset.removeCandidate);if(state.editing===remove.dataset.removeCandidate)clearCandidateFields();renderCandidates()}
});
$('profile-import').addEventListener('click',()=>$('#profile-import-file').click());
$('profile-import-file').addEventListener('change',e=>{importReview(e.target.files?.[0]);e.target.value=''});
root.querySelectorAll('[name=profile-owner]').forEach(r=>r.addEventListener('change',()=>{
 $('#profile-consent').checked=false;$('#profile-consent-text').textContent=owner()==='self'?'I authorize the export or printing of the information I chose to include about myself.':'I have explicit permission to review, export and print the supplied details about this person.';
}));
$('profile-export').addEventListener('click',exportReview);
$('profile-print').addEventListener('click',printReview);
$('profile-clear').addEventListener('click',()=>{
 if(!window.confirm('Start a new review and clear all details from this page?'))return;
 for(const [id] of profileFields)$('#profile-'+id).value='';
 state.candidates=[];clearCandidateFields();renderCandidates();$('#profile-consent').checked=false;setStatus('New blank review ready.');openStep(0);
});
renderCandidates();openStep(0);
window.TraceProfileReview=Object.freeze({getCount:()=>state.candidates.length,getSummary:()=>({details:report().provided.length,connections:state.candidates.length}),step:openStep,exportData:()=>JSON.stringify(payload()),getCurrentStep:()=>state.step});
})();