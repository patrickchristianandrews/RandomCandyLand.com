'use strict';
const pages={sources:['⌖','Public Sources'],cameras:['◉','Live Cameras'],guide:['≡','Field Guide'],query:['⌕','Query Builder'],lookup:['⌖','Lookup Lab'],catalog:['▦','Tool Directory'],cases:['▤','Case Notebook']};
const recipes={
  'Public documents':{intent:'Find public budget reports on a government site',topic:'budget report',site:'gov',file:'pdf'},
  'News coverage':{intent:'Find news coverage about a city council vote',topic:'city council vote',title:'vote'},
  'Published datasets':{intent:'Find published transit datasets',topic:'transit',file:'csv',path:'data'},
  'Source code':{intent:'Find public source code about map rendering',topic:'map rendering',site:'github.com'},
  'Fact checking':{intent:'Find fact checks about a published claim',topic:'fact check',title:'fact check'}
};
const tools=[
 ['OpenOSINT','Discovery','CLI','OpenOSINT/OpenOSINT','Public-source research toolkit with a command-line interface.'],
 ['Seekr','Discovery','Self-hosted','seekr-osint/seekr','Multi-purpose OSINT toolkit with a web interface.'],
 ['OSINT Framework','Discovery','Web','lockfale/OSINT-Framework','Browse tools by research category.'],
 ['OSINT tools catalog','Discovery','Directory','HowToFind-bot/osint-tools','Open-source tools grouped by research task.'],
 ['Sherlock','Accounts','CLI','sherlock-project/sherlock','Check whether a public username appears on supported platforms.'],
 ['Maigret','Accounts','CLI','soxoj/maigret','Find potential public username matches for manual verification.'],
 ['Namechecker list','Accounts','Directory','soxoj/osint-namecheckers-list','Compare username lookup tools and services.'],
 ['xurlfind3r','Domains','CLI','hueristiq/xurlfind3r','Discover indexed URLs for a domain using passive sources.'],
 ['Amass','Domains','CLI','owasp-amass/amass','Map an organization’s internet-facing assets.'],
 ['Wayback Machine','Archives','Web','https://web.archive.org/','Look for earlier captures of a public page.'],
 ['ExifTool','Files','CLI','exiftool/exiftool','Inspect metadata in files you can access.'],
 ['OpenStreetMap','Maps','Web','https://www.openstreetmap.org/','Explore locations and public geographic features.'],
 ['Overpass Turbo','Maps','Web','https://overpass-turbo.eu/','Query OpenStreetMap features from a browser.'],
 ['Gitleaks','Files','CLI','gitleaks/gitleaks','Audit your own repositories for accidentally committed secrets.']
];
const modes={
 domain:{label:'Domain / URL',hint:'example.org or https://example.org/about'},
 image:{label:'Image URL',hint:'https://example.org/image.jpg'},
 map:{label:'Coordinates',hint:'37.5407, -77.4360'},
 file:{label:'File hash',hint:'Choose a file to calculate its SHA-256 locally'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr=esc;
const load=()=>{try{return JSON.parse(localStorage.getItem('trace-workbench-v1'))||{};}catch{return {};}};
const initial=load();
const state={cases:Array.isArray(initial.cases)?initial.cases:[],active:initial.active??'',draft:{intent:'',topic:'',site:'',file:'',title:'',path:'',exclude:'',after:'',before:''},queries:[],lookup:'domain',input:'',results:[],catalog:[],filter:'All',search:'',notice:'',lookupBusy:false};
let sourceCategory='All',sourceSearch='',cameraSearch='',cameraPage=0;
const main=document.querySelector('#main');
const uid=()=>crypto.randomUUID();
const current=()=>state.cases.find(c=>c.id===state.active);
const persist=()=>{try{localStorage.setItem('trace-workbench-v1',JSON.stringify({cases:state.cases,active:state.active}));}catch{state.notice='Browser storage is unavailable. Export the case to keep it.';}};
const getPage=()=>Object.hasOwn(pages,location.hash.slice(1))?location.hash.slice(1):'sources';
const heading=(h,p)=>`<div class="heading"><h1>${h}</h1><p>${p}</p></div>`;
const button=(label,url)=>`<a class="button" href="${attr(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
const google=q=>'https://www.google.com/search?q='+encodeURIComponent(q);
const field=(name,label,placeholder,type='text')=>`<label>${label}<input name="${name}" type="${type}" value="${attr(state.draft[name])}" placeholder="${placeholder}"></label>`;
const status=message=>{state.notice=message;const node=document.querySelector('#status');if(node)node.textContent=message;};
const statusHTML=()=>`<div class="status" id="status" role="status">${esc(state.notice)}</div>`;
const webURL=value=>{try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u:null;}catch{return null;}};
function sourceCard([category,name,where,coverage,check,start]){
 const url=webURL(where);
 return `<article class="card source-card"><span class="tag">${esc(category)}</span><h3>${esc(name)}</h3>
 <p><b>What you’ll find</b> ${esc(coverage)}</p><details><summary>How to search and verify</summary><p><b>Start here</b> ${esc(start)}</p><p><b>What to double-check</b> ${esc(check)}</p></details>
 <div class="row">${url?button('Open source',url.href):`<small>${esc(where)}</small>`}</div></article>`;
}
function sourcesPage(){
 const categories=['All',...new Set(SOURCES.map(x=>x[0]))];
 return `<section class="hero"><span class="eyebrow">PUBLIC RECORDS & OPEN-SOURCE RESEARCH</span><h1>Trace <em>Public Sources.</em></h1><p>Search by what you want to learn. Open any card for a short walkthrough and tips on interpreting the result.</p></section>
 <section class="card source-head"><form id="source-search"><label>Search ${SOURCES.length} source types<input name="search" value="${attr(sourceSearch)}" placeholder="e.g. professional license, court filing, archived page"></label><button class="primary">Find sources</button> <button type="button" data-source-category="Overlooked records">Browse overlooked records</button></form>
 <div class="chips">${categories.map(c=>`<button class="chip" data-source-category="${attr(c)}" aria-pressed="${sourceCategory===c}">${esc(c)}</button>`).join('')}</div></section>
 <p id="source-count" class="section" role="status"></p><div class="tiles section" id="source-results"></div>`;
}
function renderSources(){
 const out=document.querySelector('#source-results');if(!out)return;
 const terms=sourceSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const rows=SOURCES.filter(row=>(sourceCategory==='All'||row[0]===sourceCategory)&&terms.every(term=>row.join(' ').toLowerCase().includes(term)));
 const count=document.querySelector('#source-count');if(count)count.textContent=rows.length+' matching sources';
 out.innerHTML=rows.map(sourceCard).join('')||'<p>No matching sources. Try a record type or a broader term.</p>';
}
function guidePage(){
 const entries=[
 ['Plan the research','Write one question, identify the jurisdiction and dates, and list plausible alternatives before searching.'],
 ['Find the source of record','Start with the office that creates or maintains the record. Search aggregators for leads, then open the originating document.'],
 ['Resolve same-name matches','Compare at least two independent details such as a public role, dated affiliation, jurisdiction, case number, or credential ID.'],
 ['Record provenance','Capture publisher, document title, URL, filing or publication date, access time, and a page or section citation. Save a permitted copy or hash when useful.'],
 ['Separate lead, claim, and finding','Record what the source directly says. Treat a filing as a filing, and verify the result or disposition independently.'],
 ['Check coverage and gaps','Note the date range, search terms, missing pages, redactions, and changes in spelling. An empty result may reflect incomplete coverage.'],
 ['Preserve disagreements','Record conflicting sources and dates. Explain what evidence would resolve the conflict and what remains uncertain.'],
 ['Report the minimum needed','Share the public evidence relevant to your question. Leave out unrelated addresses, contact details, and other personal information.'],
 ['Glossary','A docket indexes case activity. A disposition records an outcome. A filing is a submitted document. Provenance is its origin and history. A hash fingerprints file bytes.']
 ];
 return heading('Field Guide','A repeatable workflow for tracing public claims and documenting evidence.')+`<section class="card"><dl class="glossary">${entries.map(([name,detail])=>`<dt>${name}</dt><dd>${detail}</dd>`).join('')}</dl></section>`;
}
function camerasPage(){
 const terms=cameraSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const items=CAMERAS.filter(c=>terms.every(t=>c.join(' ').toLowerCase().includes(t)));
 const pages=Math.max(1,Math.ceil(items.length/24));
 cameraPage=Math.min(cameraPage,pages-1);
 return heading('Live Cameras','Find operator-published traffic, park, weather, and nature cameras.')+`
 <section class="card"><h2>Camera index</h2><p>${CAMERAS.length.toLocaleString()} indexed camera locations · Caltrans feed fetched ${esc(CAMERA_DATE)}. Open the operator for current imagery.</p>
 <form id="camera-search"><label>Search by road, place, or camera name<input name="search" value="${attr(cameraSearch)}" placeholder="e.g. Los Angeles, I-5, Santa Monica"></label><button class="primary">Search cameras</button></form></section>
 <section class="section"><div class="row spread"><h2>${items.length.toLocaleString()} matching cameras</h2><div class="row"><button data-camera-page="-1" ${cameraPage===0?'disabled':''}>Previous</button><small>Page ${cameraPage+1} of ${pages}</small><button data-camera-page="1" ${cameraPage+1>=pages?'disabled':''}>Next</button></div></div>
 <div class="tiles section">${items.slice(cameraPage*24,cameraPage*24+24).map(([name,county,route,lat,lon,url])=>`<article class="card source-card"><span class="tag">Caltrans · Traffic</span><h3>${esc(name)}</h3><p>${esc(county)} · ${esc(route)}</p><div class="row">${button(url?'Open camera':'Open operator map',url||'https://quickmap.dot.ca.gov/')}${button('Location',`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`)}</div></article>`).join('')||'<p>No cameras match your search.</p>'}</div></section>
 <section class="section"><h2>More camera networks</h2><div class="tiles section">${SOURCES.filter(row=>row[0]==='Live cameras').map(sourceCard).join('')}</div></section>`;
}
function queryPage(){
 return `<section class="hero"><span class="eyebrow">PUBLIC-SOURCE RESEARCH</span><h1>Build a <em>better search.</em></h1><p>Describe what you’re looking for. Turn it into advanced search queries you can edit, run, and save to a case.</p></section>
 <div class="grid"><section class="card"><h2>Query builder</h2><div class="chips">${Object.keys(recipes).map(name=>`<button class="chip" data-recipe="${attr(name)}">${name}</button>`).join('')}</div>
 <form id="query-form"><label>What are you looking for?<textarea name="intent" placeholder="Find public transit budget PDFs on city.gov after 2024">${esc(state.draft.intent)}</textarea></label>
 <details><summary>Set search operators</summary><div class="fields">${field('topic','Exact phrase','Transit budget')}${field('site','Website or domain','city.gov')}${field('file','File type','pdf')}${field('title','Words in title','budget')}${field('path','Words in URL','reports')}${field('exclude','Exclude phrase','draft')}${field('after','Published after','','date')}${field('before','Published before','','date')}</div></details>
 <button class="primary">Build queries →</button></form>${statusHTML()}</section>
 <section class="card"><h2>Search variants</h2>${state.queries.length?state.queries.map((q,i)=>`<article class="result"><label>${esc(q.label)}<input data-query-edit="${i}" value="${attr(q.text)}"></label><div class="row"><button data-run="${i}">Google ↗</button><button data-copy="${i}">Copy</button><button data-save-query="${i}">Save to case</button></div></article>`).join(''):'<p>Build a query to get focused and broader search options.</p>'}</section></div>`;
}
function lookupPage(){
 const mode=modes[state.lookup];
 return heading('Lookup Lab','Inspect domain records, open archived pages, map coordinates, and fingerprint files.')+`<div class="grid"><section class="card"><h2>Choose a lookup</h2><div class="chips">${Object.entries(modes).map(([key,m])=>`<button class="chip" data-mode="${key}" aria-pressed="${key===state.lookup}">${m.label}</button>`).join('')}</div>
 <form id="lookup-form"><label>${mode.label}${state.lookup==='file'?'<input type="file" name="file" required>':`<input name="input" required value="${attr(state.input)}" placeholder="${attr(mode.hint)}">`}</label><button class="primary">${state.lookup==='file'?'Calculate SHA-256':state.lookup==='domain'?'Look up domain':'Prepare lookup'} →</button></form>${statusHTML()}</section>
 <section class="card"><h2>Lookup results</h2>${state.results.length?state.results.map((r,i)=>`<article class="result"><h3>${esc(r.title)}</h3>${r.value?`<pre>${esc(r.value)}</pre>`:''}<div class="row">${r.url?button('Open source',r.url):''}<button data-save-result="${i}">Save to case</button></div></article>`).join(''):'<p>Results and source links appear here.</p>'}</section></div>`;
}
function catalogPage(){
 const categories=['All',...new Set(tools.map(t=>t[1]))];
 const items=[...tools,...state.catalog].filter(t=>(state.filter==='All'||t[1]===state.filter)&&t.join(' ').toLowerCase().includes(state.search.toLowerCase()));
 return heading('Tool Directory','Find browser tools and open-source projects by category. CLI and self-hosted tools run separately.')+
 `<section class="card"><div class="row spread"><h2>Browse tools</h2>${button('GitHub OSINT topic','https://github.com/topics/osint-tools')}</div><form id="tool-search"><label>Search directory<input name="search" value="${attr(state.search)}" placeholder="e.g. archives, domains, or Sherlock"></label><button>Filter directory</button> <button type="button" data-refresh>Fetch GitHub topic projects</button></form><div class="chips">${categories.map(c=>`<button class="chip" data-category="${c}" aria-pressed="${state.filter===c}">${c}</button>`).join('')}</div>${statusHTML()}</section>
 <div class="tiles section">${items.map(([name,category,type,url,description])=>`<article class="card"><span class="tag">${esc(category)} · ${esc(type)}</span><h3>${esc(name)}</h3><p>${esc(description)}</p><div class="row section">${button('Open project',url.startsWith('https://')?url:'https://github.com/'+url)}</div></article>`).join('')||'<p>No matching tools.</p>'}</div>`;
}
function casesPage(){
 const c=current();
 return heading('Case Notebook','Keep a dated record of sources, searches, and what each item supports.')+
 `<div class="grid"><section class="card"><h2>Cases</h2><form id="new-case"><label>Case name<input name="name" required maxlength="100" placeholder="Public transit budget"></label><button class="primary">Create case</button></form><label>Restore a case from JSON<input id="case-import" type="file" accept=".json,application/json"></label><div class="list">${state.cases.map(item=>`<button data-case="${attr(item.id)}" aria-pressed="${item===c}">${esc(item.title)} · ${item.items.length}</button>`).join('')}</div>${statusHTML()}</section>
 <section class="card"><div class="row spread"><h2>${esc(c?.title||'Select a case')}</h2>${c?'<div class="row"><button data-export="md">Export report</button><button data-export="json">Export JSON</button></div>':''}</div>
 ${c?`<form id="evidence-form"><label>Finding or source title<input name="title" required maxlength="200"></label><label>Source URL (optional)<input name="url" type="url" placeholder="https://"></label><label>Evidence status<select name="quality"><option>Lead</option><option>Verified</option><option>Contradicted</option></select></label><label>What does it show?<textarea name="notes"></textarea></label><button class="primary">Add evidence</button></form>
 <div class="section">${c.items.map(item=>`<article class="entry"><span class="tag">${esc(item.quality)} · ${esc(new Date(item.date).toLocaleString())}</span><h3>${esc(item.title)}</h3>${item.url?`<a href="${attr(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.url)} ↗</a>`:''}<p class="notes">${esc(item.notes)}</p></article>`).join('')||'<p>No evidence saved yet.</p>'}</div>`:'<p>Create a case to start collecting sources.</p>'}</section></div>`;
}
function render(){
 const page=getPage();
 document.querySelector('#nav').innerHTML=Object.entries(pages).map(([key,[icon,name]])=>`<button data-go="${key}" ${key===page?'aria-current="page"':''}><span aria-hidden="true">${icon}</span>${name}</button>`).join('');
 document.querySelector('#crumb').textContent=pages[page][1];
 document.querySelector('#case-name').textContent=current()?.title||'Case notebook';
 main.innerHTML={sources:sourcesPage,cameras:camerasPage,guide:guidePage,query:queryPage,lookup:lookupPage,catalog:catalogPage,cases:casesPage}[page]();
 renderSources();
}
function buildQueries(){
 const d=state.draft, input=d.intent.trim();
 const quoted=input.match(/["“]([^"”]+)["”]/)?.[1];
 const site=d.site.trim().replace(/^https?:\/\//i,'').split('/')[0]||input.match(/\b(?:[a-z0-9-]+\.)+(?:gov|org|com|edu|net|io|uk)\b/i)?.[0]||(/\bgovernment\b/i.test(input)?'gov':'');
 const file=(d.file.trim()||input.match(/\b(pdf|csv|docx|xlsx|pptx)s?\b/i)?.[1]||'').replace(/^\./,'');
 const topic=(d.topic.trim()||quoted||input.replace(/^(?:please\s+)?(?:find|search for|look for|show me|locate)\s+/i,'').replace(/\s+(?:on|from|after|before|in)\s+(?:(?:[\w-]+\.)+[a-z]{2,}|\d{4}(?:-\d\d-\d\d)?).*$/i,'').replace(/\b(?:pdf|csv|docx|xlsx|pptx)s?\b/gi,'').replace(/\s+/g,' ').trim()).replace(/["“”]/g,'');
 const date=(mode)=>{const match=input.match(new RegExp('\\b'+mode+'\\s+(\\d{4}(?:-\\d{2}-\\d{2})?)','i'))?.[1];return d[mode]||(match?.length===4?match+'-01-01':match);};
 const op=(key,value)=>value?key+':'+value:'';
 const wrap=value=>value.trim()?'"'+value.trim().replaceAll('"','')+'"':'';
 const domain=/^[a-z\d.-]+$/i.test(site)?site:'';
 const suffix=/^[a-z\d]+$/i.test(file)?file.toLowerCase():'';
 const shared=[op('site',domain),op('filetype',suffix),op('after',date('after')),op('before',date('before')),d.exclude.trim()?'-'+wrap(d.exclude):''];
 const combine=(...bits)=>bits.flat().filter(Boolean).join(' ');
 const variants=[
  ['Focused',combine(wrap(topic),shared,op('intitle',wrap(d.title)),op('inurl',wrap(d.path)))],
  ['Broader',combine(topic,shared)],
  ['Title match',combine(op('intitle',wrap(d.title||topic)),shared)]
 ];
 state.queries=[...new Map(variants.filter(([,q])=>q).map(([label,q])=>[q,{label,text:q}])).values()];
}
function saveItem(item){
 let c=current();
 if(!c){c={id:uid(),title:'Quick captures',items:[]};state.cases.unshift(c);state.active=c.id;}
 c.items.unshift({quality:'Lead',date:new Date().toISOString(),...item});
 persist();document.querySelector('#case-name').textContent=c.title;status('Saved to '+c.title+'.');
}
async function lookup(data){
 const value=String(data.get('input')||'').trim();
 state.input=value;state.results=[];
 if(state.lookup==='file'){
  const file=data.get('file');
  if(!file?.name)throw Error('Choose a file first.');
  if(file.size>50*1024*1024)throw Error('Choose a file under 50 MB for browser hashing.');
  const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
  state.results=[{title:file.name,value:Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')}];
 }else if(state.lookup==='map'){
  const parts=value.split(',').map(s=>s.trim());
  const [lat,lon]=parts.map(Number);
  if(parts.length!==2||parts.some(x=>!x)||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Enter valid latitude and longitude separated by a comma.');
  state.results=[{title:'OpenStreetMap',value:lat+', '+lon,url:`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}];
 }else if(state.lookup==='image'){
  const url=webURL(value);
  if(!url)throw Error('Enter a public HTTP or HTTPS image URL.');
  state.results=[{title:'Google Lens reverse image search',value:url.href,url:'https://lens.google.com/uploadbyurl?url='+encodeURIComponent(url.href)}];
 }else{
  const url=webURL(/^https?:\/\//i.test(value)?value:'https://'+value);
  if(!url||!url.hostname.includes('.')||!/^[-a-z0-9.]+$/i.test(url.hostname))throw Error('Enter a public domain or URL.');
  state.results=[
   {title:'Archived snapshots',url:'https://web.archive.org/web/*/'+url.href},
   {title:'Registration lookup',url:'https://lookup.icann.org/en/lookup'},
   {title:'Indexed pages',url:google('site:'+url.hostname)}
  ];
  const results=await Promise.allSettled(['A','AAAA','MX','NS','TXT'].map(async type=>{
   const source='https://dns.google/resolve?name='+encodeURIComponent(url.hostname)+'&type='+type;
   const response=await fetch(source,{signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('DNS unavailable');
   const json=await response.json();
   return {title:type+' records',value:json.Status?'DNS response code '+json.Status:json.Answer?.map(a=>a.data).join('\n')||'No records returned',url:source};
  }));
  state.results.unshift(...results.filter(r=>r.status==='fulfilled').map(r=>r.value));
  if(results.some(r=>r.status==='rejected'))status('Some DNS queries were unavailable. Source links are still ready.');
 }
}
async function refreshCatalog(){
 status('Loading public GitHub projects…');
 try{
  const response=await fetch('https://api.github.com/search/repositories?q=topic%3Aosint-tools&sort=stars&per_page=60',{signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('GitHub returned HTTP '+response.status+'.');
  const data=await response.json();
  const known=new Set(tools.map(t=>t[3].toLowerCase()));
  state.catalog=(data.items||[]).filter(i=>/^[\w.-]+\/[\w.-]+$/.test(i.full_name)&&!known.has(i.full_name.toLowerCase())).map(i=>[i.full_name,'Discovery','GitHub',i.full_name,i.description||'Open-source OSINT project.']);
  status('Loaded '+state.catalog.length+' additional projects.');render();
 }catch(error){status((error.message||'GitHub is unavailable.')+' The curated directory is available.');}
}
function exportCase(format){
 const c=current();if(!c)return;
 const markdown=['# '+c.title,...c.items.map(item=>['## '+item.title,item.quality+' · '+item.date,item.url,item.notes].filter(Boolean).join('\n\n'))].join('\n\n');
 const blob=new Blob([format==='json'?JSON.stringify(c,null,2):markdown],{type:format==='json'?'application/json':'text/markdown'});
 const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(c.title.replace(/[^a-z0-9]+/gi,'-').slice(0,60)||'trace-case')+'.'+format;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);
}
document.addEventListener('click',async event=>{
 const b=event.target.closest('button');if(!b)return;
 const d=b.dataset;
 if(d.go){state.notice='';location.hash=d.go;return;}
 if(d.sourceCategory){sourceCategory=d.sourceCategory;render();return;}
 if(d.cameraPage){cameraPage+=Number(d.cameraPage);render();document.querySelector('.heading').scrollIntoView();return;}
 if(d.recipe){state.draft=Object.fromEntries(Object.keys(state.draft).map(key=>[key,recipes[d.recipe][key]||'']));buildQueries();render();return;}
 if(d.mode){if(state.lookupBusy)return;state.lookup=d.mode;state.input='';state.results=[];state.notice='';render();return;}
 if(d.category){state.filter=d.category;render();return;}
 if(d.refresh!==undefined){b.disabled=true;await refreshCatalog();b.disabled=false;return;}
 if(d.case){state.active=d.case;persist();render();return;}
 if(d.export){exportCase(d.export);return;}
 if(d.run!==undefined){const q=state.queries[d.run].text.trim();if(q)window.open(google(q),'_blank','noopener,noreferrer');return;}
 if(d.copy!==undefined){try{await navigator.clipboard.writeText(state.queries[d.copy].text);status('Query copied.');}catch{status('Select the query text and copy it manually.');}return;}
 if(d.saveQuery!==undefined){const q=state.queries[d.saveQuery].text.trim();if(q)saveItem({title:'Search query',notes:q,url:google(q)});return;}
 if(d.saveResult!==undefined){const r=state.results[d.saveResult];saveItem({title:r.title,notes:r.value||'',url:r.url});}
});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.form?.id==='query-form')state.draft[el.name]=el.value;
 if(el.dataset.queryEdit!==undefined)state.queries[el.dataset.queryEdit].text=el.value;
});
document.addEventListener('submit',async event=>{
 event.preventDefault();
 const form=event.target,data=new FormData(form);
 if(form.id==='source-search'){sourceSearch=data.get('search');renderSources();}
 if(form.id==='camera-search'){cameraSearch=data.get('search');cameraPage=0;render();}
 if(form.id==='query-form'){buildQueries();status(state.queries.length?'':'Describe your search or add a search operator.');render();}
 if(form.id==='tool-search'){state.search=data.get('search');render();}
 if(form.id==='new-case'){
  const title=data.get('name').trim();if(!title)return;
  const item={id:uid(),title,items:[]};state.cases.unshift(item);state.active=item.id;persist();render();
 }
 if(form.id==='evidence-form'){
  const title=data.get('title').trim(),raw=data.get('url').trim(),url=raw&&webURL(raw);
  if(!title||raw&&!url){status('Use a title and, if supplied, a valid HTTP or HTTPS source URL.');return;}
  saveItem({title,notes:data.get('notes').trim(),quality:data.get('quality'),url:url?.href||''});render();
 }
 if(form.id==='lookup-form'){
  if(state.lookupBusy)return;
  const submit=form.querySelector('button');submit.disabled=true;state.lookupBusy=true;status('Working…');
  try{await lookup(data);if(state.notice==='Working…')status('Lookup complete.');}
  catch(error){status(error.message);}
  state.lookupBusy=false;
  if(getPage()==='lookup')render();
 }
});
document.addEventListener('change',async event=>{
 if(event.target.id!=='case-import')return;
 const file=event.target.files[0];
 if(!file)return;
 try{
  if(file.size>2*1024*1024)throw Error('Choose a case JSON under 2 MB.');
  const data=JSON.parse(await file.text());
  if(typeof data?.title!=='string'||!data.title.trim()||!Array.isArray(data.items))throw Error('Choose a JSON case exported from Trace Workbench.');
  const items=data.items.map(item=>{
   if(typeof item?.title!=='string'||typeof item.notes!=='string'||!Number.isFinite(Date.parse(item.date)))throw Error('The file contains an invalid evidence record.');
   return {title:item.title,notes:item.notes,date:item.date,quality:['Lead','Verified','Contradicted'].includes(item.quality)?item.quality:'Lead',url:webURL(item.url)?.href||''};
  });
  const c={id:uid(),title:data.title.slice(0,100),items};
  state.cases.unshift(c);state.active=c.id;status('Case restored.');persist();render();
 }catch(error){status(error instanceof SyntaxError?'The file is not valid JSON.':error.message);event.target.value='';}
});
window.addEventListener('hashchange',()=>{state.notice='';render();window.scrollTo(0,0);});
render();
