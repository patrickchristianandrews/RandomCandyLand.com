/* Identity Lab — free public-source investigation workbench (standalone).
 * All user data remains in memory until the user explicitly exports a JSON case.
 * A public search runs only after informed authorization and deliberate action.
 * It builds an evidence map, not a people-finder or identity proof engine.
 */
(()=>{'use strict';
const host=document.getElementById('identity-investigation-workbench');if(!host)return;
const $=q=>host.querySelector(q),$$=q=>[...host.querySelectorAll(q)];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const id=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'id-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const safeUrl=x=>{try{const u=new URL(String(x));return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}};
const date=()=>new Date().toISOString();
const TYPES=[
 ['name','Public name'],['organization','Organization'],['username','Username / handle'],
 ['website','Website / domain'],['email','Authorized email'],['phone','Public contact phone'],
 ['businessAddress','Business / mailing address'],['city','City / region'],['registration','Company registration / LEI'],
 ['ip','Public IP or ASN'],['keyword','Context / alternative spelling'],['source','Known public URL']
];
const labels=Object.fromEntries(TYPES);
const suggested=[
 {id:'github',name:'GitHub',category:'accounts',accuracy:'Primary public profile',mode:'Connected · public API',types:['username'],desc:'Public developer usernames and profiles. Handle matches alone do not confirm who operates an account.',href:v=>'https://github.com/'+encodeURIComponent(v.replace(/^@/,''))},
 {id:'gitlab',name:'GitLab',category:'accounts',accuracy:'Primary public profile',mode:'Connected · public API',types:['username'],desc:'Public GitLab users. Free API checks can be rate-limited or blocked by browser security.',href:v=>'https://gitlab.com/'+encodeURIComponent(v.replace(/^@/,''))},
 {id:'codeberg',name:'Codeberg',category:'accounts',accuracy:'Primary public profile',mode:'Connected · public API',types:['username'],desc:'Open-source Forgejo account directory for developer profiles.',href:v=>'https://codeberg.org/'+encodeURIComponent(v.replace(/^@/,''))},
 {id:'whatsmyname',name:'WhatsMyName',category:'accounts',accuracy:'Discovery only',mode:'Open on provider',types:['username'],desc:'Free community username checks across public sites; manually assess lookalikes and false matches.',href:()=> 'https://whatsmyname.app/'},
 {id:'wikidata',name:'Wikidata',category:'entities',accuracy:'Crowdsourced; verify against originals',mode:'Connected · public API',types:['name','organization','phone'],desc:'Open entity search and public organization contact listings. Entries can be incomplete.',href:v=>'https://www.wikidata.org/w/index.php?search='+encodeURIComponent(v)},
 {id:'gleif',name:'GLEIF LEI Registry',category:'business',accuracy:'Official global LEI registration',mode:'Free public lookup',types:['organization','registration'],desc:'Official legal-entity identifiers, reported names and relationships; not every business has an LEI.',href:v=>'https://search.gleif.org/#/search?query='+encodeURIComponent(v)},
 {id:'sec',name:'SEC EDGAR',category:'business',accuracy:'Official US company filings',mode:'Free public lookup',types:['organization','name','registration'],desc:'Company filings from the U.S. Securities and Exchange Commission; disclosures can be outdated.',href:v=>'https://www.sec.gov/edgar/search/#/q='+encodeURIComponent(v)},
 {id:'usaspending',name:'USAspending.gov',category:'business',accuracy:'Official federal award records',mode:'Free public lookup',types:['organization','registration'],desc:'Federal contract, grant and other spending records; not a comprehensive business registry.',href:()=> 'https://www.usaspending.gov/search'},
 {id:'scc',name:'Virginia SCC',category:'business',accuracy:'Official state entity registry',mode:'Free public lookup',types:['organization','registration'],desc:'Official Virginia business filings. Use the appropriate state registry for entities elsewhere.',href:()=> 'https://cis.scc.virginia.gov/'},
 {id:'opencorp',name:'OpenCorporates',category:'business',accuracy:'Aggregated registry data',mode:'Public web search; feature limits',types:['organization','registration'],desc:'Indexes official company registers; some advanced functions and API access are paid.',href:v=>'https://opencorporates.com/companies?q='+encodeURIComponent(v)},
 {id:'irs',name:'IRS Tax Exempt Organization Search',category:'business',accuracy:'Official US tax-exempt data',mode:'Free public lookup',types:['organization','registration'],desc:'IRS tax-exempt status and filings; applies only to covered nonprofit organizations.',href:()=> 'https://www.irs.gov/charities-non-profits/tax-exempt-organization-search'},
 {id:'icann',name:'ICANN Lookup (RDAP)',category:'domain',accuracy:'Authoritative registration protocol',mode:'Free public lookup',types:['website','email'],desc:'Public domain registration records. Privacy redactions mean owner identities often remain undisclosed.',href:()=> 'https://lookup.icann.org/en'},
 {id:'dns',name:'Google Public DNS',category:'domain',accuracy:'Current public DNS answers',mode:'Connected · public API',types:['website','email'],desc:'Checks domain infrastructure, including A/MX records; it cannot verify someone owns an email inbox.',href:v=>'https://dns.google/query?name='+encodeURIComponent(String(v).includes('@')?String(v).split('@').pop():String(v).replace(/^https?:\/\//,'').split('/')[0])},
 {id:'wayback',name:'Internet Archive Wayback',category:'domain',accuracy:'Dated archived copies',mode:'Connected · public API',types:['website'],desc:'Public website snapshots; an archive may be incomplete or missing.',href:v=>'https://web.archive.org/web/*/'+encodeURIComponent(v)},
 {id:'crt',name:'Certificate Transparency (crt.sh)',category:'domain',accuracy:'Certificate issuance records',mode:'Free public lookup',types:['website'],desc:'Public certificate logs help identify domain/subdomain claims; not proof of ownership.',href:v=>'https://crt.sh/?q='+encodeURIComponent(v.replace(/^https?:\/\//,'').split('/')[0])},
 {id:'arin',name:'ARIN RDAP',category:'technical',accuracy:'Authoritative network registration',mode:'Free public lookup',types:['ip'],desc:'Registered IP block and network organization details; it does not identify an end-user.',href:v=>'https://search.arin.net/rdap/?query='+encodeURIComponent(v)},
 {id:'ripe',name:'RIPEstat',category:'technical',accuracy:'Internet routing and registration data',mode:'Free public lookup',types:['ip'],desc:'Routing, ASN and network context. IP geolocation is approximate and does not identify a person.',href:v=>'https://stat.ripe.net/'+encodeURIComponent(v)},
 {id:'census',name:'US Census Geocoder',category:'address',accuracy:'Official approximate geographic match',mode:'Free public lookup',types:['businessAddress'],desc:'Geocodes a known U.S. address against Census TIGER address ranges; not USPS deliverability or proof of occupancy.',href:()=> 'https://geocoding.geo.census.gov/geocoder/locations/address'},
 {id:'usps',name:'USPS Address API',category:'address',accuracy:'Official mailing validation',mode:'Free only for authorized mailing uses',types:['businessAddress'],desc:'USPS address validation requires developer credentials and proper shipping/mailing use; not available as unrestricted people search.',href:()=> 'https://developers.usps.com/addressesv3'},
 {id:'fcc',name:'FCC National Broadband Map',category:'address',accuracy:'Official ISP-reported availability',mode:'Free public lookup',types:['businessAddress','city'],desc:'Broadband availability at locations; cannot establish who resides at an address.',href:()=> 'https://broadbandmap.fcc.gov/'},
 {id:'monitor',name:'Mozilla Monitor',category:'security',accuracy:'Verified-account breach check',mode:'Free self-service · verification',types:['email'],desc:'Scan an email you control for known breach appearances after provider verification. No automated third-party breach lookup.',href:()=> 'https://monitor.mozilla.org/'},
 {id:'fccnum',name:'NANPA numbering data',category:'technical',accuracy:'Official numbering plan data',mode:'Free public directory',types:['phone'],desc:'Area codes and numbering resources; never a reliable reverse lookup of a private phone subscriber.',href:()=> 'https://www.nanpa.com/'},
 {id:'archivegov',name:'USA.gov State Registries',category:'business',accuracy:'Government registry navigation',mode:'Free official directory',types:['organization','registration'],desc:'Find the relevant Secretary of State business register instead of relying on unofficial directories.',href:()=> 'https://www.usa.gov/state-governments'},
 {id:'search',name:'Google Search (manual)',category:'accounts',accuracy:'Discovery only',mode:'Open search on provider',types:['name','organization','username','website','keyword'],desc:'Discover public pages; search ranking is not verification. Results are not imported automatically.',href:v=>'https://www.google.com/search?q='+encodeURIComponent('"'+v+'"')}
];
const state={fields:[],leads:[],selected:'',status:'Ready. Add everything you know. No lookup starts until you choose Search.',busy:false,queryCount:0};
const validTypes=new Set(TYPES.map(x=>x[0]));
const makeField=(type='name',value='')=>({id:id(),type:validTypes.has(type)?type:'name',value:String(value).slice(0,350)});
const nodeTitle=r=>String(r.headline||r.value||r.kind||'Clue').slice(0,90);
const statusClasses=['unverified','confirmed','contradicted','excluded'];
const fillType=r=>r.status==='confirmed'?'#2c998a':r.status==='contradicted'?'#a95465':r.status==='excluded'?'#545b71':'#446681';
function notice(message){state.status=message;const el=$('#labWorkbenchStatus');if(el)el.textContent=message}
function view(){
 host.innerHTML='<div class="os-workbench-heading"><div><span class="eyebrow">IDENTITY LAB · FREE PUBLIC RESEARCH WORKBENCH</span><h2>Start with everything you already know.</h2><p>Combine independent facts from accounts, organizations, public domains, network records and verified sources. Every field is optional, add as many clues as you need, and review each match before connecting it.</p></div><div class="os-workbench-kpis"><span><strong id="osCountFields">0</strong> clues entered</span><span><strong id="osCountSources">0</strong> evidence records</span></div></div>'+
 '<div class="os-workbench-grid"><section class="os-workbench-intake" aria-label="Add known information">'+
 '<div class="os-heading"><h3>01 · Known details</h3><p>Enter names, alternative spellings, public handles, contact information you control, official organization details, websites or other leads. Repeat field types as often as needed.</p></div>'+
 '<div id="osKnownFields" class="os-known-fields"></div>'+
 '<div class="os-add-field"><select id="osAddType" aria-label="New detail type">'+TYPES.map(([type,label])=>'<option value="'+type+'">'+esc(label)+'</option>').join('')+'</select><button id="osAddKnown" type="button" class="outline">+ Add another detail</button></div>'+
 '<label class="os-research-consent"><input id="osResearchConsent" type="checkbox"><span>I am reviewing my own information, an organization, or a case I am authorized to research. I understand the clues I choose to search are submitted to the listed public services. No private lookup is attempted.</span></label>'+
 '<div class="os-intake-actions"><button id="osSearch" type="button" class="cta">⌕ Search free public sources</button><small>No account, no paid API keys. Network lookups only on your command; failed/CORS-limited sources show as unavailable.</small></div>'+
 '<p id="labWorkbenchStatus" class="os-workbench-status" role="status" aria-live="polite">'+esc(state.status)+'</p>'+
 '<div class="os-intake-feedback" id="osIntakeFeedback"></div></section>'+
 '<section class="os-workbench-investigation" aria-label="Evidence and connections">'+
 '<div class="os-heading"><h3>02 · Evidence connections</h3><p>Sources produce <em>leads</em>, not identity proof. Review each item, mark corroboration or contradictions, then export a source-linked report.</p></div>'+
 '<div id="osGraph" class="os-graph" aria-label="Graph of submitted clues and source-linked leads"></div>'+
 '<div class="os-graph-legend"><span>◌ Starting clue</span><span>● Unverified lead</span><span>● Reviewed official evidence</span><span>● Contradicted</span></div>'+
 '<div id="osEvidenceList" class="os-evidence-list" aria-live="polite"></div>'+
 '<div class="os-evidence-actions"><button type="button" class="outline" id="osExport">↓ Export case JSON</button><button type="button" class="outline" id="osPrint">▤ Print / Save PDF</button><button type="button" class="outline" id="osImport">↑ Import a case</button><input type="file" id="osFile" accept=".json,application/json" hidden><button type="button" class="outline" id="osReset">↺ New case</button></div>'+
 '</section></div>'+
 '<section class="os-source-hub" aria-label="Verified free sources to inspect"><div class="os-heading"><h3>03 · Free-source directory</h3><p>Choose a category and open trustworthy primary providers or discovery tools. <strong>Connected</strong> means this site tries the listed public API after your explicit search. <strong>Open on provider</strong> means you must perform the search there; Identity Lab never pretends to import their results.</p></div>'+
 '<div id="osSourceFilters" class="os-source-filters" role="group" aria-label="Filter source directory"><button data-source-group="all" aria-pressed="true">All</button>'+[['accounts','Accounts'],['entities','Public entities'],['business','Business'],['domain','Domains'],['address','Addresses'],['technical','Technical'],['security','Self-security']].map(x=>'<button data-source-group="'+x[0]+'" aria-pressed="false">'+x[1]+'</button>').join('')+'</div>'+
 '<div id="osSources" class="os-source-grid"></div><p class="os-source-caveat">No free tool offers the same guaranteed person, household, phone ownership, identity verification and address-append data as a commercial enrichment service. Public records are not guaranteed current. USPS APIs require registration and eligible mailing use; SEC EDGAR APIs cannot be called directly from a browser because of CORS. No private-residence or hidden-account mapping.</p></section>';
 redraw();
}
function fieldsPanel(){
 const el=$('#osKnownFields');el.replaceChildren();
 for(const item of state.fields){
  const row=document.createElement('div');row.className='os-field';row.dataset.fieldId=item.id;
  const label=document.createElement('label');label.textContent='Known detail';label.className='sr-only';
  const selector=document.createElement('select');selector.setAttribute('aria-label','Known detail type');selector.dataset.editType=item.id;
  for(const [type,text] of TYPES){const option=document.createElement('option');option.value=type;option.textContent=text;option.selected=item.type===type;selector.append(option)}
  const input=document.createElement('input');input.type='text';input.autocomplete='off';input.maxLength=350;input.value=item.value;input.dataset.editValue=item.id;input.setAttribute('aria-label',labels[item.type]+' value');input.placeholder='Enter known public or authorized information';
  const remove=document.createElement('button');remove.type='button';remove.className='outline';remove.dataset.removeField=item.id;remove.textContent='×';remove.setAttribute('aria-label','Remove '+labels[item.type]+' detail');
  row.append(selector,input,remove);el.append(row);
 }
 $('#osCountFields').textContent=String(state.fields.filter(f=>f.value.trim()).length);
}
function sourcePanel(){
 const panel=$('#osSources');panel.replaceChildren();
 const filter=$('#osSourceFilters button[aria-pressed="true"]')?.dataset.sourceGroup||'all';
 const entries=suggested.filter(s=>filter==='all'||s.category===filter);
 for(const tool of entries){
  const related=state.fields.find(f=>tool.types.includes(f.type)&&f.value.trim());
  const node=document.createElement('article');node.className='os-tool';
  const top=document.createElement('div');top.className='os-tool-top';
  const tag=document.createElement('small');tag.textContent=tool.mode;top.append(tag);
  const title=document.createElement('h4');title.textContent=tool.name;
  const p=document.createElement('p');p.textContent=tool.desc;
  const acc=document.createElement('small');acc.className='os-tool-reliability';acc.textContent=tool.accuracy;
  const a=document.createElement('a');a.className='outline';a.rel='noopener noreferrer';a.target='_blank';a.textContent='Open source ↗';a.href=tool.href(related?.value||'');a.setAttribute('aria-label','Open '+tool.name+' in a new tab');
  node.append(top,title,p,acc,a);panel.append(node);
 }
}
function graph(){
 const container=$('#osGraph');container.replaceChildren();
 const clues=state.fields.filter(f=>f.value.trim()).slice(0,20);
 const leads=state.leads.filter(x=>x.record.url).slice(0,26);
 const nodes=[...clues.map(f=>({id:f.id,title:labels[f.type]+': '+f.value,kind:'clue',status:'clue'})),
  ...leads.map(r=>({id:r.id,title:r.record.headline,kind:'lead',status:r.status}))];
 if(!nodes.length){container.innerHTML='<p class="os-graph-empty">Add a known detail to start an evidence map. Public-source results appear as separate leads, with their origin and review status preserved.</p>';return;}
 const width=860,rows=Math.ceil(nodes.length/4),height=Math.max(220,rows*112+35),svgNS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('role','img');svg.setAttribute('aria-label','Evidence graph: '+clues.length+' entered clues and '+leads.length+' public-source leads. No ownership is inferred.');
 const positions=new Map();
 nodes.forEach((item,i)=>{const row=Math.floor(i/4),col=i%4,count=Math.min(4,nodes.length-row*4);positions.set(item.id,{x:(col+.5)*width/count,y:64+row*112})});
 for(const lead of leads){
  const a=positions.get(lead.clueId),b=positions.get(lead.id);if(!a||!b)continue;
  const path=document.createElementNS(svgNS,'path');path.setAttribute('d','M '+a.x+' '+a.y+' L '+b.x+' '+b.y);path.setAttribute('stroke',lead.status==='confirmed'?'#65ddc3':lead.status==='contradicted'?'#f2a7b2':'#9db9c6');path.setAttribute('stroke-width',lead.status==='confirmed'?'2.5':'1.5');path.setAttribute('stroke-dasharray',lead.status==='confirmed'?'':'5 6');path.setAttribute('opacity','.64');svg.append(path);
 }
 nodes.forEach(item=>{const p=positions.get(item.id);const group=document.createElementNS(svgNS,'g');const rect=document.createElementNS(svgNS,'rect');rect.setAttribute('x',p.x-94);rect.setAttribute('y',p.y-30);rect.setAttribute('width','188');rect.setAttribute('height','62');rect.setAttribute('rx','12');rect.setAttribute('fill',item.kind==='clue'?'#225669':fillType(item));rect.setAttribute('stroke',item.kind==='clue'?'#a4f9e2':'#e4eff5');rect.setAttribute('stroke-width','1');
  const t=document.createElementNS(svgNS,'text');t.setAttribute('x',p.x);t.setAttribute('y',p.y-5);t.setAttribute('font-size','12');t.setAttribute('font-weight','750');t.setAttribute('fill','#fff');t.setAttribute('text-anchor','middle');t.textContent=item.kind==='clue'?'SUBMITTED CLUE':'PUBLIC LEAD';
  const desc=document.createElementNS(svgNS,'text');desc.setAttribute('x',p.x);desc.setAttribute('y',p.y+14);desc.setAttribute('font-size','10');desc.setAttribute('fill','#ddf8f1');desc.setAttribute('text-anchor','middle');desc.textContent=nodeTitle(item).slice(0,29)+(nodeTitle(item).length>29?'…':'');
  group.append(rect,t,desc);svg.append(group);
 });
 container.append(svg);
 if(nodes.length<state.fields.filter(f=>f.value.trim()).length+state.leads.filter(x=>x.record.url).length){const msg=document.createElement('small');msg.textContent='Graph shows the first 20 clues and 26 linked leads; the full case remains in the evidence list and export.';container.append(msg)}
}
function evidence(){
 const area=$('#osEvidenceList');area.replaceChildren();
 $('#osCountSources').textContent=String(state.leads.length);
 if(!state.leads.length){area.innerHTML='<p class="os-no-evidence">No sources collected yet. Enter any number of known details, confirm permission and run Search. You can also open free-provider tools in the source directory.</p>';return;}
 const summary=document.createElement('p');summary.className='os-evidence-summary';
 const reviewed=state.leads.filter(x=>x.status==='confirmed').length;
 summary.textContent=state.leads.length+' records · '+reviewed+' reviewed as supported · '+state.leads.filter(x=>x.status==='contradicted').length+' contradictions · '+state.leads.filter(x=>x.status==='unverified').length+' still unverified';
 area.append(summary);
 for(const lead of state.leads){
  const r=lead.record,card=document.createElement('article');card.className='os-evidence-item';card.dataset.evidenceId=lead.id;
  const title=document.createElement('strong');title.textContent=r.headline;
  const meta=document.createElement('small');meta.textContent=r.kind+' · '+r.source+' · checked '+new Date(lead.created).toLocaleDateString();
  const p=document.createElement('p');p.textContent=r.detail;
  const note=document.createElement('small');note.className='os-evidence-warning';note.textContent=r.notes||'Review the original source. A shared name/handle is not verified identity.';
  const bottom=document.createElement('div');bottom.className='os-evidence-controls';
  if(r.url){const link=document.createElement('a');link.href=r.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='View original source ↗';bottom.append(link)}
  const select=document.createElement('select');select.dataset.review=lead.id;select.setAttribute('aria-label','Review status for '+r.headline);
  for(const [value,label] of [['unverified','Unverified lead'],['confirmed','Corroborated on source'],['contradicted','Conflicting evidence'],['excluded','Exclude from findings']]){
   const opt=document.createElement('option');opt.value=value;opt.textContent=label;opt.selected=value===lead.status;select.append(opt);
  }
  const btn=document.createElement('button');btn.type='button';btn.className='outline';btn.textContent='Remove';btn.dataset.deleteLead=lead.id;
  bottom.append(select,btn);card.append(title,meta,p,note,bottom);area.append(card);
 }
}
function feedback(){
 const el=$('#osIntakeFeedback');el.replaceChildren();
 const fields=state.fields.filter(f=>f.value.trim());
 if(!fields.length){el.textContent='No clue is required to open the free-source directory. Add one or more details if you want an organized source-linked investigation.';return}
 const set=new Set(fields.map(f=>f.type));
 const hints=[];
 if(set.has('username'))hints.push('Public usernames can be checked against the three connected code-host APIs. Matching handles remain separate leads.');
 if(set.has('website')||set.has('email'))hints.push('Website and email-domain infrastructure can be checked through public DNS; domains do not validate inbox ownership.');
 if(set.has('organization')||set.has('registration'))hints.push('Use official entity registries and GLEIF/SEC records to corroborate organization details.');
 if(set.has('businessAddress'))hints.push('Use the Census Geocoder for a geographic range match and USPS only for permitted mailing validation; neither identifies residents.');
 if(set.has('phone'))hints.push('Publicly published organization phone strings may be checked in Wikidata. Private subscriber attribution is unavailable.');
 if(set.has('ip'))hints.push('Use ARIN and RIPEstat to check network registration and routing, not a person’s physical location.');
 if(set.has('name'))hints.push('Wikidata searches known public entities. Names alone are weak clues and will not identify most private individuals.');
 if(set.has('source'))hints.push('Known public URLs can be added to the evidence notebook after verifying source provenance.');
 el.textContent=fields.length+' known detail'+(fields.length===1?'':'s')+' entered. '+hints.join(' ');
}
function redraw(){fieldsPanel();sourcePanel();graph();evidence();feedback()}
function syncFields(){
 state.fields.forEach(f=>{
  const row=$('[data-field-id="'+f.id+'"]');if(!row)return;
  const type=row.querySelector('select[data-edit-type]')?.value;
  if(validTypes.has(type))f.type=type;
  f.value=String(row.querySelector('input[data-edit-value]')?.value||'').trim().slice(0,350);
 });
 $('#osCountFields').textContent=String(state.fields.filter(f=>f.value).length);
}
function addField(type='name',text=''){syncFields();if(state.fields.length>=60){notice('Maximum 60 details in one case. Export the current case before creating another.');return}state.fields.push(makeField(type,text));redraw();}
async function publicLookup(type,raw){
 if(type==='ip'){
  const value=raw.trim();
  if(!/^(?:[a-f\d:.]{2,45}|\d{1,3}(?:\.\d{1,3}){3}|AS\d{1,10})$/i.test(value))throw Error('Enter a public IP address or ASN.');
  return [];
 }
 if(type==='organization')type='name';
 if(type==='registration'||type==='businessAddress'||type==='city'||type==='keyword'||type==='source')return [];
 if(!['name','username','website','email','phone'].includes(type))return [];
 const api=window.TraceProfileReview?.lookupPublic;
 if(typeof api!=='function')throw Error('Free public API helpers are unavailable on this page.');
 return await api(type,raw);
}
async function search(){
 syncFields();
 if(state.busy)return;
 const fields=state.fields.filter(f=>f.value).slice(0,60);
 if(!fields.length){notice('Add one or more known details before starting a public-source check.');return}
 if(!$('#osResearchConsent').checked){notice('Please confirm that you own or are authorized to research the submitted information.');$('#osResearchConsent').focus();return}
 const searchable=fields.filter(f=>['name','organization','username','website','email','phone'].includes(f.type));
 if(!searchable.length){notice('These details are useful context, but none supports a live automatic public check. See the source directory below for relevant free lookup tools.');redraw();return}
 state.busy=true;$('#osSearch').disabled=true;$('#osSearch').textContent='Searching available public APIs…';
 notice('Running '+searchable.length+' explicit public-source check'+(searchable.length===1?'':'s')+'. Free APIs may rate-limit or deny browser access. No private-person database is queried.');
 const batches=[];for(let n=0;n<searchable.length;n+=4)batches.push(searchable.slice(n,n+4));
 let checks=0,newCount=0,failed=0;
 try{
  for(const batch of batches){
   const results=await Promise.allSettled(batch.map(f=>publicLookup(f.type,f.value)));
   results.forEach((result,index)=>{
    const field=batch[index];checks++;
    if(result.status!=='fulfilled'){
     failed++;
     state.leads.push({id:id(),clueId:field.id,status:'unverified',created:date(),record:{kind:'Source unavailable',headline:'Free source check unavailable',detail:String(result.reason?.message||'Network or browser error').slice(0,300),url:'',notes:'Do not interpret an unavailable provider as an absent profile.',source:labels[field.type]}});
     return;
    }
    for(const raw of result.value){
     const record=normalizeResult(raw);
     if(!record.headline)continue;
     if(state.leads.some(r=>r.clueId===field.id&&r.record.url&&r.record.url===record.url&&r.record.headline===record.headline))continue;
     state.leads.push({id:id(),clueId:field.id,status:'unverified',created:date(),record});
     newCount++;
    }
   });
   notice('Checked '+checks+'/'+searchable.length+' submitted clues. '+newCount+' source result(s) collected; '+failed+' unavailable request(s).');
   await new Promise(resolve=>setTimeout(resolve,80));
  }
  state.queryCount+=checks;
  notice('Complete: '+checks+' public-source checks, '+newCount+' new results, '+failed+' unavailable. Other entered information remains contextual unless manually verified. Inspect original records before marking any connection supported.');
  redraw();
 }finally{state.busy=false;$('#osSearch').disabled=false;$('#osSearch').textContent='⌕ Search free public sources'}
}
function caseData(){
 syncFields();
 return {type:'identity-lab-investigation-case',version:1,created:date(),notice:'Public leads are not proof of a shared owner or identity.',fields:state.fields.map(f=>({id:f.id,type:f.type,value:f.value})),leads:state.leads.map(x=>({id:x.id,clueId:x.clueId,created:x.created,status:x.status,record:x.record})),checks:state.queryCount};
}
function download(name,blob){
 const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function exportCase(){
 const blob=new Blob([JSON.stringify(caseData(),null,2)],{type:'application/json'});download('identity-lab-source-case-'+new Date().toISOString().slice(0,10)+'.json',blob);
 notice('Case exported. Your source-linked JSON can be imported later. It is not published or uploaded by Identity Lab.');
}
async function importCase(file){
 if(!file||file.size>950000){notice('Select a case file smaller than 950 KB.');return}
 try{
  const raw=JSON.parse(await file.text());
  if(raw?.type!=='identity-lab-investigation-case'||raw.version!==1||!Array.isArray(raw.fields)||!Array.isArray(raw.leads))throw Error('Wrong case file type.');
  const fields=raw.fields.slice(0,60).filter(x=>x&&validTypes.has(x.type)).map(x=>({...makeField(x.type,x.value),id:String(x.id||id()).slice(0,110)}));
  const validIds=new Set(fields.map(f=>f.id));
  const leads=raw.leads.slice(0,150).filter(x=>x&&validIds.has(x.clueId)&&x.record&&typeof x.record==='object').map(x=>({id:id(),clueId:x.clueId,created:/^\d{4}-/.test(String(x.created))?x.created:date(),status:statusClasses.includes(x.status)?x.status:'unverified',record:normalizeResult(x.record)}));
  state.fields=fields;state.leads=leads;state.queryCount=Math.max(0,Number(raw.checks)||0);
  $('#osResearchConsent').checked=false;notice('Case imported in this browser. Public searches still require a new authorization and button press.');redraw();
 }catch{notice('Import failed. Select a JSON case created by this Identity Lab workbench.')}
}
function printCase(){
 syncFields();
 const content=document.createElement('div');content.className='os-print-sheet';
 const header=document.createElement('h2');header.textContent='Identity Lab · evidence review';content.append(header);
 const note=document.createElement('p');note.textContent='Generated '+new Date().toLocaleString()+' · Entries are user provided or public source leads. A shared name, handle, email domain or similar record is not proof of identity.';content.append(note);
 for(const f of state.fields){if(!f.value)continue;const p=document.createElement('p');p.textContent='Known '+labels[f.type]+': '+f.value;content.append(p)}
 for(const lead of state.leads){const div=document.createElement('article');const h=document.createElement('h3');h.textContent=lead.record.headline+' · '+lead.status;const p=document.createElement('p');p.textContent=lead.record.kind+' / '+lead.record.source+' — '+lead.record.detail;div.append(h,p);if(lead.record.url){const a=document.createElement('a');a.href=lead.record.url;a.textContent=lead.record.url;div.append(a)}content.append(div)}
 $('#osPrintOutput')?.remove();content.id='osPrintOutput';document.body.append(content);window.print();
}
host.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='osAddKnown'){addField($('#osAddType').value,'');return}
 if(b.dataset.removeField){syncFields();state.fields=state.fields.filter(f=>f.id!==b.dataset.removeField);redraw();return}
 if(b.dataset.sourceGroup){
  $$('#osSourceFilters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  sourcePanel();return;
 }
 if(b.id==='osSearch'){void search();return}
 if(b.id==='osExport'){exportCase();return}
 if(b.id==='osPrint'){printCase();return}
 if(b.id==='osImport'){$('#osFile').click();return}
 if(b.id==='osReset'){
  if(!window.confirm('Clear all clues and evidence from this case? Export first if needed.'))return;
  state.fields=[makeField('name')];state.leads=[];state.queryCount=0;$('#osResearchConsent').checked=false;notice('New blank case ready.');redraw();return;
 }
 if(b.dataset.deleteLead){state.leads=state.leads.filter(x=>x.id!==b.dataset.deleteLead);redraw()}
});
host.addEventListener('input',e=>{if(e.target.matches('[data-edit-value]'))syncFields()});
host.addEventListener('change',e=>{
 if(e.target.matches('[data-edit-type]')){syncFields();feedback();sourcePanel()}
 if(e.target.matches('[data-review]')){const lead=state.leads.find(l=>l.id===e.target.dataset.review);if(lead&&statusClasses.includes(e.target.value)){lead.status=e.target.value;graph();evidence();notice('Review status updated. Only the analyst can corroborate claims against the original dated source.')}}
 if(e.target.id==='osFile'){void importCase(e.target.files?.[0]);e.target.value=''}
});
state.fields=[makeField('name')];
view();
window.IdentityLabWorkbench=Object.freeze({
 getSummary:()=>({details:state.fields.filter(f=>f.value).length,findings:state.leads.length,verified:state.leads.filter(l=>l.status==='confirmed').length,sources:suggested.length}),
 addKnown:(kind,value)=>{addField(kind,value);return state.fields.length},
 exportData:caseData,
 sourceDirectory:suggested.map(s=>({name:s.name,mode:s.mode,category:s.category,accuracy:s.accuracy}))
});
})();
