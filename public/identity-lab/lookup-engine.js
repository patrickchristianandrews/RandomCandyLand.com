/* Identity Lab 2: real public APIs, transparent per-source outcomes, no secret "people enrichment".
   A browser only contacts providers when the user explicitly starts a search.
   All external results are leads; there is no algorithmic identity verification.
*/
(()=>{'use strict';
const clean=(x,max=350)=>String(x??'').trim().slice(0,max);
const citeUrl=(value)=>{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:''}catch{return ''}};
const encoded=x=>encodeURIComponent(x);
const make=(source,kind,headline,detail,url,notes='')=>({source,kind,headline:clean(headline,180),detail:clean(detail,800),url:citeUrl(url),notes:clean(notes,400)});
const exactUsername=raw=>{
 const name=clean(raw,90).replace(/^@/,'');
 if(!/^[A-Za-z\d](?:[A-Za-z\d_.-]{0,37}[A-Za-z\d])?$/.test(name))throw Error('Enter a valid public account handle without spaces.');
 return name;
};
const exactDomain=raw=>{
 const candidate=clean(raw,300).includes('@')?clean(raw,300).split('@').pop():clean(raw,300);
 const url=new URL(/^https?:\/\//i.test(candidate)?candidate:'https://'+candidate);
 const hostname=url.hostname.toLowerCase().replace(/\.$/,'');
 if(!/^(?!-)[\da-z-]+(?:\.[\da-z-]+)+$/.test(hostname)||hostname.length>253)throw Error('Enter a public domain such as example.org.');
 return hostname;
};
const json=async(url,{timeout=8500}={})=>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(response.status===404)return null;
  if(!response.ok)throw Error('HTTP '+response.status+(response.status===403?' · rate limited or forbidden':''));
  return await response.json();
 }finally{clearTimeout(timer)}
};
const job=(field,source,sourceName,category,run,help)=>({key:field.id+'|'+source,fieldId:field.id,type:field.type,value:field.value,source,sourceName,category,run,help});
const GITHUB='https://api.github.com/users/',GITLAB='https://gitlab.com/api/v4/users?username=',
 CODEBERG='https://codeberg.org/api/v1/users/',WIKIDATA='https://www.wikidata.org/w/api.php',
 GLEIF='https://api.gleif.org/api/v1/lei-records';
const sourceMeta={
 github:{name:'GitHub public profiles',meaning:'Exact public GitHub handle; account ownership is not established.'},
 gitlab:{name:'GitLab public profiles',meaning:'Exact public GitLab handle; account ownership is not established.'},
 codeberg:{name:'Codeberg public profiles',meaning:'Exact public Codeberg handle; account ownership is not established.'},
 wikidata:{name:'Wikidata entities',meaning:'Crowdsourced public entity label; same name is not proof of identity.'},
 gleif:{name:'GLEIF LEI register',meaning:'Official global legal entity record; coverage depends on LEI registration.'},
 dns:{name:'Google Public DNS',meaning:'Current public DNS records; not proof of domain/email ownership.'},
 wayback:{name:'Internet Archive',meaning:'An archived public website snapshot; incomplete history possible.'},
 census:{name:'US Census geocoder',meaning:'Approximate address-range match; not postal deliverability or proof of residence.'},
 ripe:{name:'RIPEstat',meaning:'Internet network routing data; an IP address does not identify a person.'}
};
function tasksFor(field){
 const jobs=[],v=clean(field.value,350);if(!v)return jobs;
 const add=(s,group,run,help)=>jobs.push(job(field,s,sourceMeta[s].name,group,run,help||sourceMeta[s].meaning));
 const type=field.type;
 if(type==='username'){
  add('github','account',async()=>{
   const handle=exactUsername(v),d=await json(GITHUB+encoded(handle));
   if(!d||String(d.login||'').toLowerCase()!==handle.toLowerCase())return [];
   return [make('GitHub','Public account',d.login,[
     d.name?'Display name: '+d.name:'',d.company?'Declared company: '+d.company:'',
     d.location?'Profile location: '+d.location:'',d.bio?'Bio: '+d.bio:'',typeof d.public_repos==='number'?'Public repositories: '+d.public_repos:''
    ].filter(Boolean).join(' · ')||'Public handle exists.',d.html_url||'https://github.com/'+handle,sourceMeta.github.meaning)]
  });
  add('gitlab','account',async()=>{
   const handle=exactUsername(v),d=await json(GITLAB+encoded(handle));const items=Array.isArray(d)?d:[];
   return items.filter(x=>String(x.username||'').toLowerCase()===handle.toLowerCase()).slice(0,2).map(x=>make('GitLab','Public account',x.username,'Public GitLab profile'+(x.name?' · '+x.name:''),x.web_url||'https://gitlab.com/'+handle,sourceMeta.gitlab.meaning))
  });
  add('codeberg','account',async()=>{
   const handle=exactUsername(v),d=await json(CODEBERG+encoded(handle));
   return d&&String(d.login||'').toLowerCase()===handle.toLowerCase()?[make('Codeberg','Public account',d.login,[d.full_name,d.description].filter(Boolean).join(' · ')||'Public Codeberg profile',d.html_url||'https://codeberg.org/'+handle,sourceMeta.codeberg.meaning)]:[]
  });
 }
 if(type==='name'||type==='organization'){
  add('wikidata','entity',async()=>{
   if(v.length<3)throw Error('Use at least three characters for entity search.');
   const url=WIKIDATA+'?action=wbsearchentities&search='+encoded(v.slice(0,110))+'&language=en&format=json&origin=*&limit=5';
   const d=await json(url);
   return (d?.search||[]).filter(x=>/^Q\d+$/.test(x.id)).slice(0,5).map(x=>make('Wikidata','Public entity candidate',x.label,x.description||'No description recorded','https://www.wikidata.org/wiki/'+x.id,sourceMeta.wikidata.meaning))
  });
 }
 if(type==='organization'||type==='registration'){
  add('gleif','entity',async()=>{
   if(type==='organization'&&v.length<3)throw Error('Enter at least three characters of a legal business name.');
   const url=type==='registration'&&/^[A-Z\d]{20}$/i.test(v)?
    GLEIF+'/'+encoded(v.toUpperCase()):
    GLEIF+'?filter[fulltext]='+encoded(v.slice(0,100))+'&page[size]=6';
   const response=await json(url);const records=Array.isArray(response?.data)?response.data:response?.data?[response.data]:[];
   return records.slice(0,6).map(row=>{
    const a=row.attributes||{},entity=a.entity||{},registration=a.registration||{},legal=entity.legalName?.name||a.entity?.legalName?.name||a.legalName?.name||'Legal entity';
    const address=entity.legalAddress||{},components=[address.city,address.region,address.country].filter(Boolean).join(', ');
    return make('GLEIF','Official legal entity',legal,[
     'LEI: '+(a.lei||row.id||'not supplied'),registration.status?'Registration: '+registration.status:'',
     components?'Registered location: '+components:'',entity.status?'Entity status: '+entity.status:''
    ].filter(Boolean).join(' · '),'https://search.gleif.org/#/record/'+encoded(a.lei||row.id||''),sourceMeta.gleif.meaning);
   });
  });
 }
 if(type==='website'||type==='email'){
  add('dns','domain',async()=>{
   const domain=exactDomain(v),kind=type==='email'?'MX':'A';
   const url='https://dns.google/resolve?name='+encoded(domain)+'&type='+kind;
   const d=await json(url);const answers=Array.isArray(d?.Answer)?d.Answer.filter(x=>typeof x.data==='string').slice(0,6):[];
   if(!answers.length)return [];
   return [make('Google Public DNS','Public DNS '+kind,domain,kind+' records: '+answers.map(x=>x.data).join(' · '),
    'https://dns.google/query?name='+encoded(domain)+'&type='+kind,sourceMeta.dns.meaning)];
  });
 }
 if(type==='website'){
  add('wayback','domain',async()=>{
   const domain=exactDomain(v),url='https://archive.org/wayback/available?url='+encoded('https://'+domain);
   const d=await json(url);const found=d?.archived_snapshots?.closest;
   if(!found?.available||!found.url)return [];
   const archive=found.url.replace(/^http:/,'https:');
   const stamp=clean(found.timestamp,20),when=/^\d{8}/.test(stamp)?stamp.slice(0,4)+'-'+stamp.slice(4,6)+'-'+stamp.slice(6,8):'date unknown';
   return [make('Internet Archive','Dated public web capture',domain+' · '+when,'A public archive snapshot was reported for this domain.',archive,sourceMeta.wayback.meaning)];
  });
 }
 if(type==='businessAddress'){
  add('census','address',async()=>{
   if(v.length<10)throw Error('Enter a full business mailing address including city and state.');
   const url='https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address='+encoded(v)+'&benchmark=Public_AR_Current&format=json';
   const d=await json(url);const matches=d?.result?.addressMatches||[];
   return matches.slice(0,3).filter(x=>typeof x.matchedAddress==='string').map(x=>make('US Census Bureau','Approximate address range',x.matchedAddress,
    [x.coordinates&&Number.isFinite(x.coordinates.x)?'Longitude: '+x.coordinates.x:'',x.coordinates&&Number.isFinite(x.coordinates.y)?'Latitude: '+x.coordinates.y:''].filter(Boolean).join(' · ')||'Census TIGER geocoding match.',url,sourceMeta.census.meaning));
  });
 }
 if(type==='ip'){
  add('ripe','network',async()=>{
   const raw=clean(v,60);
   if(!/^(?:AS\d{1,10}|[0-9a-f:.]{2,45})$/i.test(raw))throw Error('Enter an IP address or ASN (such as AS15169).');
   const url='https://stat.ripe.net/data/network-info/data.json?resource='+encoded(raw);
   const d=await json(url);const result=d?.data;if(!result)return [];
   return [make('RIPEstat','Network registration / routing','Network: '+(result.prefix||raw),
    'Announced ASN(s): '+(Array.isArray(result.asns)&&result.asns.length?result.asns.join(', '):'not available'),url,sourceMeta.ripe.meaning)];
  });
 }
 return jobs;
}
function plan(fields){return (fields||[]).flatMap(x=>tasksFor(x))}
async function runTask(task){
 const started=Date.now();
 try{
  const items=await task.run();
  const records=Array.isArray(items)?items.filter(x=>x&&x.headline&&citeUrl(x.url)):[],
  status=records.length?'found':'no_match';
  return {key:task.key,fieldId:task.fieldId,source:task.sourceName,sourceId:task.source,status,records,elapsedMs:Date.now()-started,
    message:records.length?records.length+' public record(s) found':'No matching public record returned; not proof of absence'};
 }catch(error){
  let reason=clean(error?.message||error,120);if(/abort/i.test(reason))reason='Timed out';
  else if(/failed to fetch|networkerror|load failed/i.test(reason))reason='Browser access blocked or network unavailable';
  return {key:task.key,fieldId:task.fieldId,source:task.sourceName,sourceId:task.source,status:'unavailable',
    records:[],elapsedMs:Date.now()-started,message:reason};
 }
}
const publicMethods=Object.freeze({plan,runTask,sourceMeta,
 normalize:record=>record&&typeof record==='object'?make(record.source||'Public source',record.kind||'Public record',record.headline||'Untitled',record.detail||'',record.url||'',record.notes||''):null});
window.IdentityLabLookup=publicMethods;
})();
