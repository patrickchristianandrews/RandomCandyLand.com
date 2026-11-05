/* TRACE Identity Lab — guided, consent-based public account/evidence review.
 * Every data field is optional. Explicitly initiated public-source queries use official APIs.
 * No private-subscriber reverse lookup, scraping, tracking or default persistence.
 * A score is a transparent reviewer-selected rubric,
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
const state={candidates:[],step:0,editing:null,researchResults:[],researchBusy:false};
const demo=[
 {label:'Gates Foundation: verified accounts',url:'https://www.gatesfoundation.org/about/verified-accounts',why:'A primary source explicitly lists the organization’s public accounts.'},
 {label:'Bill Gates — X public account',url:'https://x.com/BillGates',why:'Example only. Check the official account listing for current attribution.'},
 {label:'Gates Notes — public personal site',url:'https://www.gatesnotes.com/',why:'A public site that identifies its author; verify the page directly.'}
];
const fields=profileFields.map(([id,label,type,placeholder])=>'<label>'+safe(label)+' <small>optional</small><input id="profile-'+id+'" autocomplete="off" type="'+type+'" maxlength="'+(id==='website'?450:200)+'" placeholder="'+safe(placeholder)+'"></label>').join('');
root.innerHTML=
 '<header class="trace-profile-intro"><div><span class="eyebrow">PUBLIC-SOURCE RESEARCH · ALL DETAILS OPTIONAL</span><h2>Start with what you know</h2><p>Enter one clue to check available public sources. You can also add other details, compare evidence and build a report. Searches happen only when you press Search, and every result needs verification.</p></div><span class="trace-id-chip">SEARCH ONLY WHEN YOU CHOOSE</span></header>'+
 '<nav id="profileSteps" class="trace-profile-steps" aria-label="Build a profile in three simple stages"><button type="button" data-profile-step="0"><span>01</span><b>About</b><small>Known details</small></button><button type="button" data-profile-step="1"><span>02</span><b>Connections</b><small>Links & clues</small></button><button type="button" data-profile-step="2"><span>03</span><b>My report</b><small>Review & export</small></button></nav>'+
 '<section class="trace-profile-stage" data-profile-panel="0" aria-label="Known details"><div class="trace-profile-stage-header"><h3>Investigate one clue</h3><p>One detail is enough to begin. Nothing is sent anywhere until you choose to search. A result is a lead, not proof that two records belong to the same person.</p></div>'+ '<div class="trace-profile-quick"><label for="profile-quick-kind">Starting clue type<select id="profile-quick-kind"><option value="auto">Detect automatically</option><option value="phone">Phone number</option><option value="email">Email address</option><option value="username">Public username</option><option value="website">Website / domain</option><option value="name">Public name or organization</option></select></label><label for="profile-quick-input">What do you have?<input id="profile-quick-input" autocomplete="off" maxlength="220" placeholder="e.g. +1 202-555-0146 or @publichandle"></label><button type="button" class="cta" id="profile-research">⌕ Search public sources</button></div>'+ '<label class="trace-profile-research-permission"><input id="profile-research-consent" type="checkbox"><span>I am reviewing my own information, an organization, or information I am authorized to research. I understand my clue will be sent only to the public services named in the results.</span></label>'+ '<div id="profile-research-status" class="trace-profile-research-status" role="status" aria-live="polite">Ready to check available public data. No background search is running.</div><div id="profile-research-results" class="trace-profile-research-results" aria-live="polite"></div>'+ '<details class="trace-profile-optional"><summary>+ Add more known details (optional)</summary><div class="trace-profile-fields">'+fields+'</div></details><div class="trace-profile-tip"><strong>🔒 Privacy tip</strong><p>Only include contact details you are comfortable keeping in the report. A mailing or registered-agent address is not proof of where a person lives.</p></div></section>'+
 '<section class="trace-profile-stage" data-profile-panel="1" aria-label="Public account evidence" hidden><div class="trace-profile-stage-header"><h3>Add public links or evidence</h3><p>An account URL, platform name, supporting note, and all indicators are <strong>optional</strong>. Add what you have; leave blanks when unknown. A blank card isn’t added.</p></div>'+
 '<div class="trace-profile-add"><div class="trace-profile-add-title"><strong id="candidateFormTitle">One account or clue</strong><span>Everything below is optional</span></div><div class="trace-profile-candidate-fields"><label>Platform or record type <small>optional</small><input id="candidate-platform" maxlength="85" placeholder="e.g. Instagram, public directory, document"></label><label>Public URL <small>optional</small><input id="candidate-url" maxlength="550" type="url" placeholder="https://example.com/profile"></label><label>Source, date or explanation <small>optional</small><input id="candidate-source" maxlength="400" placeholder="How do you know about this link?"></label><label>Your notes <small>optional</small><textarea id="candidate-notes" rows="2" maxlength="1600" placeholder="Record what is confirmed, questioned or missing."></textarea></label></div>'+
 '<details class="trace-profile-evidence-selector"><summary>+ Add evidence indicators <small>optional; see why a connection might be supported or disputed</small></summary><fieldset class="trace-profile-signals"><legend>Tick only indicators supported by the material you have</legend>'+signals.map(s=>'<label><input type="checkbox" data-profile-indicator="'+s.id+'"><span><b>'+safe(s.label)+'</b><small>'+safe(s.why)+'</small></span></label>').join('')+'</fieldset></details>'+
 '<div class="trace-profile-add-actions"><button type="button" id="candidate-add" class="cta">+ Add this clue</button><button type="button" id="candidate-cancel" class="outline" hidden>Cancel editing</button><span id="candidate-status" role="status" aria-live="polite"></span></div></div>'+
 '<div class="trace-profile-source-heading"><div><h3>Evidence map <small id="profile-count">0 clues</small></h3><p>Your own entries and any public results you explicitly save appear here. Connections require independent corroboration.</p></div><button type="button" id="profile-import" class="outline">↑ Import my saved report</button><input type="file" id="profile-import-file" accept=".json,application/json" hidden></div><div id="profile-candidates" class="trace-profile-candidates"></div></section>'+
 '<section class="trace-profile-stage" data-profile-panel="2" aria-label="Review report" hidden><div class="trace-profile-stage-header"><h3>Your profile report</h3><p>Review the details and strengths of your evidence before sharing. You can export a partially completed or entirely blank template.</p></div>'+
 '<div id="profile-report" class="trace-profile-report" aria-live="polite"></div>'+
 '<section class="trace-profile-authorize"><fieldset class="trace-profile-ownership"><legend>Who is this review about?</legend><label><input type="radio" name="profile-owner" value="self" checked> My own profile</label><label><input type="radio" name="profile-owner" value="authorized"> Someone who explicitly authorized this review</label></fieldset><label class="trace-profile-consent"><input type="checkbox" id="profile-consent"><span id="profile-consent-text">I authorize the export or printing of the information I chose to include about myself.</span></label><p>The confirmation above is required to export or print, but every actual information field remains optional.</p></section>'+
 '<div class="trace-profile-actions"><button type="button" id="profile-export" class="cta">↓ Save my report (JSON)</button><button type="button" id="profile-print" class="outline">▤ Print / Save as PDF</button><button type="button" id="profile-clear" class="outline">↺ Start a new report</button></div><p class="trace-profile-footnote">This is an evidence organizer, not a background-check service or identity verification product. Indicator scores are an illustrative rubric, not a probability that someone controls an account. There are no private-subscriber lookups, hidden-account searches or live location tracking.</p></section>'+
 '<footer class="trace-profile-foot"><button type="button" id="profile-prev" class="outline">← Previous</button><span id="profile-stage-count" aria-live="polite">Step 1 of 3</span><button type="button" id="profile-next" class="cta">Continue →</button></footer>'+
 '<details class="trace-profile-demo"><summary>See how the evidence works: a real public-figure example</summary><div><strong>Example: Bill Gates</strong><p>This sample references only publicly identified accounts or websites, not guessed connections. Use these links to check how attribution should be documented.</p><div id="profile-demo-links"></div><p>Officially listed accounts provide much stronger evidence than matching avatars or handles. This demonstration does not identify undisclosed accounts or infer a person’s location.</p></div></details>'+
 '<p id="profile-status" class="trace-profile-live-status" role="status" aria-live="polite"></p>';
const demoBox=$('profile-demo-links');for(const d of demo){const wrap=document.createElement('div');const a=document.createElement('a');a.href=d.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=d.label+' ↗';const p=document.createElement('small');p.textContent=d.why;wrap.append(a,p);demoBox.append(wrap)}
function value(id){return String($(id)?.value||'').trim()}
const publicSources=Object.freeze({
 github:'GitHub public profile API',
 dns:'Google Public DNS',
 wikidata:'Wikidata public directory',
 wikidataSearch:'Wikidata public entity search'
});
function clueType(raw,declared){
 if(declared&&declared!=='auto')return declared;
 const v=String(raw||'').trim();
 if(/^https?:\/\//i.test(v)||/^www\./i.test(v))return 'website';
 if(/^@[^@\s]+$/.test(v))return 'username';
 if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return 'email';
 if(/^[+()\d\s.\-]{8,24}$/.test(v)&&v.replace(/\D/g,'').length>=8)return 'phone';
 if(/^[a-z\d-]+(?:\.[a-z\d-]+)+(?::\d+)?$/i.test(v))return 'website';
 return 'name';
}
function publicUrl(url){
 try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return''}
}
function phoneForms(raw){
 const digits=String(raw).replace(/\D/g,'');
 if(!/^\d{8,15}$/.test(digits))throw Error('Enter an international phone number with 8–15 digits.');
 const intl=digits.length===10?'1'+digits:digits;
 const formats=['+'+intl,raw.trim()];
 if(intl.length===11&&intl.startsWith('1')){
  const n=intl.slice(1);
  formats.push('+1 '+n.slice(0,3)+'-'+n.slice(3,6)+'-'+n.slice(6),'('+n.slice(0,3)+') '+n.slice(3,6)+'-'+n.slice(6),n.slice(0,3)+'-'+n.slice(3,6)+'-'+n.slice(6));
 }
 return [...new Set(formats.filter(s=>/^[+()\d\s.\-]{8,26}$/.test(s)))].slice(0,5);
}
function domainFrom(raw){
 const v=String(raw).trim();
 let url;try{url=new URL(/^https?:\/\//i.test(v)?v:'https://'+v)}catch{throw Error('Enter a website URL or valid domain.')}
 const domain=url.hostname.toLowerCase().replace(/\.$/,'');
 if(!/^[a-z\d-]+(?:\.[a-z\d-]+)+$/.test(domain)||domain.length>253)throw Error('Enter a valid public domain name.');
 return {domain,url};
}
async function publicJson(url){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
 try{
  const r=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/json'}});
  if(r.status===404)return null;
  if(!r.ok)throw Error('Source returned '+r.status);
  return await r.json();
 }finally{clearTimeout(timer)}
}
function resultFor(kind,headline,detail,url,source,notes){
 return {kind,headline:String(headline||'').slice(0,180),detail:String(detail||'').slice(0,500),url:publicUrl(url),source,notes:String(notes||'').slice(0,600)};
}
async function lookupClue(kind,raw){
 const results=[];
 if(kind==='username'){
  const username=raw.replace(/^@/,'').trim();
  if(!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username))throw Error('Enter a public username using letters, numbers and hyphens.');
  const user=await publicJson('https://api.github.com/users/'+encodeURIComponent(username));
  if(user&&user.type==='User'&&user.login){
   const displayed=user.name||user.login;
   const detail=['Exact public GitHub handle: @'+user.login,user.company?'Company claimed: '+user.company:'',user.bio?'Public bio: '+user.bio:'',user.blog?'Website supplied by account: '+user.blog:''].filter(Boolean).join(' · ');
   results.push(resultFor('Account listing',displayed,detail,user.html_url,publicSources.github,'A platform profile exists for this exact handle; this does not establish that the target person owns it.'));
  }
  if(user&&user.type==='Organization'&&user.login){
   results.push(resultFor('Organization listing',user.name||user.login,'GitHub organization account: '+user.login,user.html_url,publicSources.github,'Public organization account; ownership of any other account is not inferred.'));
  }
  if(!results.length)results.push(resultFor('No match','No exact GitHub handle found','Other services were not searched; this is not proof that an account is absent.','https://github.com/',publicSources.github,'No verified attribution.'));
 }
 if(kind==='email'||kind==='website'){
  const {domain,url}=kind==='email'?domainFrom(raw.split('@')[1]||''):domainFrom(raw);
  if(kind==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw))throw Error('Enter a valid email address.');
  const dns=await publicJson('https://dns.google/resolve?name='+encodeURIComponent(domain)+'&type='+(kind==='email'?'MX':'A'));
  const records=(dns?.Answer||[]).filter(x=>typeof x.data==='string').slice(0,4);
  results.push(resultFor('Domain infrastructure',domain,records.length?(kind==='email'?'Published mail-server DNS records: ':'Published DNS addresses: ')+records.map(x=>x.data).join(' · '):'No matching DNS records returned from this source. Domain existence or mailbox ownership is not established.','https://dns.google/resolve?name='+encodeURIComponent(domain)+'&type='+(kind==='email'?'MX':'A'),publicSources.dns,'DNS checks establish infrastructure only; they do not verify an email inbox, identify a person or prove a site is safe.'));
  if(kind==='website'&&url.hostname.toLowerCase()==='github.com'){
   const handle=url.pathname.split('/').filter(Boolean)[0];
   if(handle&&/^[a-z\d-]{1,39}$/i.test(handle))results.push(...await lookupClue('username',handle));
  }
 }
 if(kind==='phone'){
  const variants=phoneForms(raw);
  const quoted=variants.map(v=>'"'+v+'"').join(' ');
  const query='SELECT DISTINCT ?item ?itemLabel ?website WHERE { VALUES ?number { '+quoted+' } ?item wdt:P1329 ?number ; wdt:P31 ?kind . FILTER(?kind != wd:Q5) OPTIONAL { ?item wdt:P856 ?website } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } } LIMIT 8';
  const api='https://query.wikidata.org/sparql?query='+encodeURIComponent(query)+'&format=json';
  const data=await publicJson(api);
  for(const row of (data?.results?.bindings||[]).slice(0,8)){
   const name=row.itemLabel?.value||'Publicly listed entity';
   const item=row.item?.value||'';
   if(!/^https:\/\/www\.wikidata\.org\/entity\/Q\d+$/.test(item))continue;
   const linked=row.website?.value;
   results.push(resultFor('Public directory listing',name,linked?'Public website cited by the directory: '+linked:'Wikidata currently lists this phone string for an entity.',item,publicSources.wikidata,'Crowdsourced public entity entry, not proof of the current subscriber or an individual’s identity.'));
  }
  if(!results.length)results.push(resultFor('No public listing found','No matching public organization entry','The exact phone string was not found in the available public directory. Subscriber name, location, carrier, and current ownership remain unknown.','https://www.wikidata.org/wiki/Property:P1329',publicSources.wikidata,'A directory miss does not mean the number is unused, invalid or private.'));
 }
 if(kind==='name'){
  if(raw.trim().length<3)throw Error('Enter at least three characters of a public name or organization.');
  const api='https://www.wikidata.org/w/api.php?action=wbsearchentities&search='+encodeURIComponent(raw.trim().slice(0,100))+'&language=en&format=json&origin=*&limit=5';
  const data=await publicJson(api);
  for(const item of (data?.search||[]).slice(0,5)){
   if(!/^Q\d+$/.test(String(item.id)))continue;
   results.push(resultFor('Possible public entity',item.label||'Public entity',item.description||'No description supplied.','https://www.wikidata.org/wiki/'+item.id,publicSources.wikidataSearch,'Name similarity alone is not evidence this is the intended person or organization.'));
  }
  if(!results.length)results.push(resultFor('No match','No public entity matches found','This directory is incomplete and does not cover most people or organizations.','https://www.wikidata.org/',publicSources.wikidataSearch,'No verified attribution.'));
 }
 return results;
}
function displayResearch(){
 const area=$('profile-research-results');area.replaceChildren();
 for(const [i,r] of state.researchResults.entries()){
  const card=addText('article','trace-profile-found-card','');
  const top=addText('div','trace-profile-found-heading','');
  top.append(addText('small',null,r.kind+' · '+r.source),addText('strong',null,r.headline));card.append(top);
  card.append(addText('p',null,r.detail),addText('p','trace-profile-found-caution',r.notes));
  const actions=addText('div','trace-profile-found-actions','');
  if(r.url){const link=addText('a','outline','View source ↗');link.href=r.url;link.target='_blank';link.rel='noopener noreferrer';actions.append(link)}
  if(!['No match','No public listing found'].includes(r.kind)){
   const btn=addText('button','outline','+ Save as a lead');btn.type='button';btn.dataset.saveResult=String(i);actions.append(btn);
  }
  card.append(actions);area.append(card);
 }
}
function saveResearchResult(index){
 const r=state.researchResults[index];
 if(!r||['No match','No public listing found'].includes(r.kind))return;
 if(state.candidates.length>=50){setStatus('Your evidence map contains 50 clues already.','profile-research-status');return}
 if(state.candidates.some(c=>c.url&&c.url===r.url)){setStatus('This source is already in the evidence map.','profile-research-status');return}
 state.candidates.push({id:idFor(),platform:r.kind+': '+r.headline,url:r.url,source:r.source+' · retrieved '+new Date().toISOString().slice(0,10),notes:r.detail+' — '+r.notes,indicators:[]});
 renderCandidates();setStatus('Source added as an unverified lead. Check the original listing before drawing conclusions.','profile-research-status');
}
async function researchPublic(){
 if(state.researchBusy)return;
 if(!$('profile-research-consent').checked){setStatus('Confirm that you own or are authorized to research this information before searching.','profile-research-status');$('profile-research-consent').focus();return}
 const quick=value('profile-quick-input'),declared=value('profile-quick-kind');
 let clues=[];
 if(quick)clues=[[clueType(quick,declared),quick]];
 else for(const [field,kind] of [['phone','phone'],['email','email'],['username','username'],['website','website'],['name','name']]){
  const v=value('profile-'+field);if(v)clues.push([kind,v]);
 }
 if(!clues.length){setStatus('Enter any one clue, or expand the optional details and add what you know.','profile-research-status');return}
 clues=clues.slice(0,4);
 if(quick){const dest=clues[0][0];if(['phone','email','username','website','name'].includes(dest))$('profile-'+dest).value=quick}
 state.researchBusy=true;state.researchResults=[];
 const button=$('profile-research');button.disabled=true;button.textContent='Searching public sources…';
 $('profile-research-results').replaceChildren();
 setStatus('Checking '+clues.map(([type])=>type).join(', ')+' using public source APIs. No website account or private subscriber database is accessed.','profile-research-status');
 let failures=0;
 try{
  const settled=await Promise.allSettled(clues.map(([type,v])=>lookupClue(type,v)));
  for(const item of settled){
   if(item.status==='fulfilled')state.researchResults.push(...item.value);
   else{failures++;state.researchResults.push(resultFor('Source unavailable','Could not complete this source check',String(item.reason?.message||'Connection or request failed').slice(0,150),'','Public data service','No conclusion can be drawn from a source error.'))}
  }
  displayResearch();
  setStatus(state.researchResults.length+' public-source result'+(state.researchResults.length===1?'':'s')+' shown'+(failures?' · '+failures+' check'+(failures===1?'':'s')+' failed':'')+'. Open the original sources and save only relevant leads.','profile-research-status');
 }finally{state.researchBusy=false;button.disabled=false;button.textContent='⌕ Search public sources'}
}

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
function authorized(){if($('profile-consent').checked)return true;setStatus('Please confirm that you own this information or have permission before exporting or printing.');$('profile-consent').focus();return false}
function payload(){return {type:'trace-consent-based-profile-review',version:2,created:new Date().toISOString(),consentBasis:owner()==='self'?'self-asserted':'other-person-authorization-asserted',profile:collectProfile(),candidates:state.candidates.map(({id,platform,url,source,notes,indicators})=>({id,platform,url,source,notes,indicators,score:score({indicators}).value})),scoring:'Illustrative user-selected evidence-strength rubric. NOT a statistically calibrated probability or independently verified account connection.',limitations:'Public-source lookups are optional, user-triggered and performed in your browser. External public services receive the entered search clue when used. No private-subscriber lookup, hidden-account search, live location tracking, or profile-data upload to this website.'}}
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
  for(const [id] of profileFields){const old=id==='publicAddress'?'publicOrganizationAddress':id;const v=obj.profile[id]??obj.profile[old]??'';$('profile-'+id).value=String(v).slice(0,450)}
  state.candidates=obj.candidates.slice(0,50).filter(c=>c&&typeof c==='object').map(c=>({
   id:idFor(),platform:String(c.platform||'').slice(0,85),url:(()=>{try{const u=new URL(String(c.url||''));return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return''}})(),
   source:String(c.source||'').slice(0,400),notes:String(c.notes||'').slice(0,1600),
   indicators:(Array.isArray(c.indicators)?c.indicators:[]).filter(id=>signals.some(s=>s.id===id))
  }));
  clearCandidateFields();$('profile-consent').checked=false;renderCandidates();openStep(1);setStatus('Report imported on this device. Please review the information and confirm permission again before exporting.');
 }).catch(()=>setStatus('Could not import this file. Use a JSON review exported from TRACE.'));
}
$$('[data-profile-step]').forEach(btn=>btn.addEventListener('click',()=>openStep(Number(btn.dataset.profileStep))));
$('profile-next').addEventListener('click',()=>openStep(state.step+1));
$('profile-prev').addEventListener('click',()=>openStep(state.step-1));
$('candidate-add').addEventListener('click',addCandidate);
$('profile-research').addEventListener('click',researchPublic);
$('profile-quick-input').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();researchPublic()}});
$('profile-research-results').addEventListener('click',event=>{const button=event.target.closest('[data-save-result]');if(button)saveResearchResult(Number(button.dataset.saveResult))});
$('candidate-cancel').addEventListener('click',clearCandidateFields);
$('profile-candidates').addEventListener('click',event=>{
 const edit=event.target.closest('[data-edit-candidate]'),remove=event.target.closest('[data-remove-candidate]');
 if(edit)editCandidate(edit.dataset.editCandidate);
 if(remove){state.candidates=state.candidates.filter(c=>c.id!==remove.dataset.removeCandidate);if(state.editing===remove.dataset.removeCandidate)clearCandidateFields();renderCandidates()}
});
$('profile-import').addEventListener('click',()=>$('profile-import-file').click());
$('profile-import-file').addEventListener('change',e=>{importReview(e.target.files?.[0]);e.target.value=''});
root.querySelectorAll('[name=profile-owner]').forEach(r=>r.addEventListener('change',()=>{
 $('profile-consent').checked=false;$('profile-consent-text').textContent=owner()==='self'?'I authorize the export or printing of the information I chose to include about myself.':'I have explicit permission to review, export and print the supplied details about this person.';
}));
$('profile-export').addEventListener('click',exportReview);
$('profile-print').addEventListener('click',printReview);
$('profile-clear').addEventListener('click',()=>{
 if(!window.confirm('Start a new review and clear all details from this page?'))return;
 for(const [id] of profileFields)$('profile-'+id).value='';
 state.candidates=[];state.researchResults=[];$('profile-research-results').replaceChildren();$('profile-quick-input').value='';$('profile-quick-kind').value='auto';$('profile-research-consent').checked=false;clearCandidateFields();renderCandidates();$('profile-consent').checked=false;setStatus('New blank review ready.');openStep(0);
});
renderCandidates();openStep(0);
window.TraceProfileReview=Object.freeze({getCount:()=>state.candidates.length,getSummary:()=>({details:report().provided.length,connections:state.candidates.length}),step:openStep,exportData:()=>JSON.stringify(payload()),getCurrentStep:()=>state.step,getLiveResultCount:()=>state.researchResults.length});
})();