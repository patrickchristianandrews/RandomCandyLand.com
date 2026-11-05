/* TRACE Consent-Based Profile Review: user-supplied, on-device research notes only.
 * No scraping, hidden-account detection, reverse identity lookups or background transmission.
 */
(()=>{'use strict';
const host=document.getElementById('trace-profile-review');if(!host)return;
const $=id=>host.querySelector('#'+id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
const signals=[
 {id:'personConfirmed',label:'Account owner explicitly confirmed this profile',points:45,why:'A directly confirmed account connection is strong evidence, provided consent and attribution can be documented.'},
 {id:'reciprocal',label:'Two official pages explicitly cross-link one another',points:35,why:'Reciprocal links provide stronger context than a shared label; still inspect the source and date.'},
 {id:'official',label:'An organization’s official public page links to the account',points:25,why:'An official site can support organizational affiliation but does not necessarily establish personal identity.'},
 {id:'declared',label:'Account links to another supplied public profile',points:18,why:'A profile-owned link is a useful lead; an account can be altered or impersonated.'},
 {id:'handle',label:'The username or display name matches',points:6,why:'Shared handles and names are weak evidence because names can be duplicated, changed, or imitated.'},
 {id:'context',label:'Public content and timeline are consistent',points:10,why:'Independent contextual agreement is useful, but similarity alone cannot establish identity.'},
 {id:'conflict',label:'Material contradictory evidence exists',points:-35,why:'A conflicting official statement, date, or claim should be documented and investigated.'}
];
let candidates=[],editIndex=-1;
function render(){
 host.innerHTML='<div class="trace-profile-heading"><div><span class="eyebrow">CONSENT-BASED · ON-DEVICE ONLY</span><h2>Profile & connection review</h2><p>Create a report about yourself or someone who has explicitly authorized this review. Enter known identifiers and public account links, then assess the strength of the <em>supplied</em> evidence. The app does not search for undisclosed accounts, identify private users, or expose residences.</p></div><span class="trace-id-chip">PRIVATE WORKSPACE</span></div>'+
 '<label class="trace-profile-consent"><input type="checkbox" id="profile-consent"> I confirm that this profile is mine or that its subject has authorized this specific review and export.</label>'+
 '<div class="trace-profile-fields"><label>Display name / business name<input id="profile-name" autocomplete="off" placeholder="Name shared with permission" maxlength="110"></label><label>Public username<input id="profile-username" autocomplete="off" placeholder="Public handle, optional" maxlength="90"></label><label>Contact email (optional)<input id="profile-email" type="email" autocomplete="off" placeholder="Authorized contact only" maxlength="160"></label><label>Contact phone (optional)<input id="profile-phone" type="tel" autocomplete="off" placeholder="Authorized contact only" maxlength="55"></label><label>Public organization address (optional)<input id="profile-address" autocomplete="off" placeholder="Business or public office address, not a residence" maxlength="190"></label><label>Review purpose<input id="profile-purpose" autocomplete="off" placeholder="Why and for whom is this review authorized?" maxlength="220"></label></div>'+
 '<div class="trace-profile-add"><h3>Add a supplied public account or business listing</h3><p>Include only a public account the subject has agreed to review. Enter the evidence you already possess. Names, usernames, emails and phone numbers alone never prove the account belongs to someone.</p>'+
 '<label>Platform / service<input id="candidate-platform" maxlength="75" placeholder="e.g. Professional directory"></label><label>Public profile URL<input id="candidate-url" type="url" maxlength="450" placeholder="https://example.org/public-profile"></label>'+
 '<label>Evidence source and date<input id="candidate-source" maxlength="240" placeholder="What source supports this link? When was it published?"></label>'+
 '<fieldset class="trace-profile-signals"><legend>Indicators present in your supplied evidence</legend>'+signals.map(s=>'<label><input type="checkbox" data-profile-indicator="'+s.id+'"><span><b>'+esc(s.label)+'</b><small>'+esc(s.why)+'</small></span></label>').join('')+'</fieldset>'+
 '<button type="button" id="candidate-add" class="cta">＋ Add account for review</button><span id="profile-status" role="status" aria-live="polite"></span></div>'+
 '<div class="trace-profile-results"><div class="trace-profile-results-title"><h3>Evidence-linked connections</h3><p>The percentage below is an illustrative <strong>evidence-strength rubric</strong>, not a statistical probability of shared identity. All indicators are entered by the reviewer, not independently checked by TRACE.</p></div><div id="profile-candidates"></div></div>'+
 '<div class="trace-profile-actions"><button type="button" id="profile-export" class="outline">↓ Export my review as JSON</button><button type="button" id="profile-clear" class="outline">Clear this review</button></div><p class="trace-profile-footnote">No background lookup, browser history tracking, or server submission. Nothing is saved by default; closing or reloading discards your entries. Verify sources yourself, redact unnecessary personal data, and never treat a score as proof of identity or wrongdoing.</p>';
 $('candidate-add').addEventListener('click',add);
 $('profile-export').addEventListener('click',exportReview);
 $('profile-clear').addEventListener('click',()=>{if(confirm('Clear the current profile and all candidate accounts?')){candidates=[];editIndex=-1;render()}});
 showCandidates();
}
const val=id=>$(id).value.trim();
function score(ids){let raw=0;for(const item of signals)if(ids.includes(item.id))raw+=item.points;
 return Math.min(100,Math.max(0,raw));
}
function add(){
 const status=$('profile-status');if(!$('#profile-consent').checked){status.textContent='Confirm the subject’s authorization first.';return}
 const platform=val('candidate-platform'),url=val('candidate-url'),source=val('candidate-source');
 if(!platform||!url||!source){status.textContent='Provide a platform, an official public profile URL and a dated evidence note.';return}
 let parsed;try{parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Unsupported link')}catch{status.textContent='Enter a valid public http(s) profile URL.';return}
 if(candidates.length>=25){status.textContent='The local review supports up to 25 candidate accounts.';return}
 const ids=[...host.querySelectorAll('[data-profile-indicator]:checked')].map(n=>n.dataset.profileIndicator);
 const notes=ids.map(id=>signals.find(x=>x.id===id)).filter(Boolean);
 candidates.push({platform,url:parsed.href,source,indicators:ids,score:score(ids),explanation:notes.map(x=>x.why)});
 $('candidate-platform').value='';$('candidate-url').value='';$('candidate-source').value='';
 host.querySelectorAll('[data-profile-indicator]').forEach(x=>x.checked=false);
 status.textContent='Added for your review. No live search was performed.';showCandidates();
}
function showCandidates(){
 const list=$('profile-candidates');list.replaceChildren();
 if(!candidates.length){const p=document.createElement('p');p.className='trace-profile-empty';p.textContent='No candidate accounts supplied yet. Add a public account above to see an explainable connection report.';list.append(p);return}
 candidates.forEach((c,i)=>{
 const wrap=document.createElement('article');wrap.className='trace-profile-candidate';
 const heading=document.createElement('div');heading.className='trace-profile-candidate-head';
 const left=document.createElement('div'),title=document.createElement('strong'),link=document.createElement('a');
 title.textContent=c.platform;link.href=c.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='View supplied public source ↗';left.append(title,link);
 const metric=document.createElement('div');metric.className='trace-profile-score';metric.textContent=c.score+' / 100 · evidence rubric';
 heading.append(left,metric);
 const bar=document.createElement('div');bar.className='trace-profile-meter';bar.setAttribute('role','img');bar.setAttribute('aria-label','Evidence-strength rubric: '+c.score+' out of 100');const fill=document.createElement('span');fill.style.width=c.score+'%';bar.append(fill);
 const src=document.createElement('p');src.textContent='Evidence cited by reviewer: '+c.source;
 const indicators=document.createElement('div');indicators.className='trace-profile-indicators';
 for(const id of c.indicators){const item=signals.find(s=>s.id===id);if(!item)continue;const label=document.createElement('p');label.textContent=(item.points>0?'+':'')+item.points+' · '+item.label+' — '+item.why;indicators.append(label)}
 if(!c.indicators.length){const p=document.createElement('p');p.textContent='No supporting indicators marked. A matching name, URL or contact detail alone does not establish ownership.';indicators.append(p)}
 const remove=document.createElement('button');remove.className='outline';remove.type='button';remove.textContent='Remove this candidate';remove.addEventListener('click',()=>{candidates.splice(i,1);showCandidates()});
 wrap.append(heading,bar,src,indicators,remove);list.append(wrap);
 });
}
function exportReview(){
 const status=$('profile-status');if(!$('#profile-consent').checked){status.textContent='Confirm authorization before exporting.';return}
 const profile={name:val('profile-name'),username:val('profile-username'),email:val('profile-email'),phone:val('profile-phone'),publicOrganizationAddress:val('profile-address'),purpose:val('profile-purpose')};
 const payload={type:'trace-consent-based-profile-review',version:1,created:new Date().toISOString(),profile,candidates,scoring:'Reviewer-selected evidence strength rubric, NOT probability; candidates are NOT independently verified.',limitations:'Only voluntarily supplied links and contact information. No search for undisclosed accounts; no live identity or location lookup.'};
 if(!profile.name&&!candidates.length){status.textContent='Enter a name or at least one public candidate first.';return}
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),href=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=href;link.download='trace-authorized-profile-review.json';document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(href),1500);status.textContent='Export prepared. Review the file before sharing it with anyone.';
}
render();window.TraceProfileReview=Object.freeze({getCount:()=>candidates.length,getSummary:()=>candidates.map(c=>({platform:c.platform,score:c.score}))});
})();