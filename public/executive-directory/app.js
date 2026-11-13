'use strict';
const get=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const people=encoded=>encoded.split(';').filter(Boolean).map(item=>item.split('|'));
const options=(el,values)=>[...new Set(values)].sort().forEach(value=>el.add(new Option(value,value)));
options(get('industry'),companies.map(company=>company[2]));
options(get('route'),companies.flatMap(company=>company[5].map(contact=>contact[0])));
function filtered(){
 const terms=get('query').value.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const industry=get('industry').value,route=get('route').value;
 return companies.filter(company=>(!industry||industry===company[2])&&(!route||company[5].some(c=>c[0]===route))&&company[5].length&&terms.every(term=>company.flat(2).join(' ').toLowerCase().includes(term)));
}
function contactRow([purpose,email,phone,url,contactName,pattern,profile]){
 return `<div class="contact"><strong>${esc(purpose)}</strong>${contactName?`<small>${esc(contactName)}</small>`: ''}${email&&purpose==='Inferred executive email'?`<span>${esc(email)}</span>`:email?`<a href="mailto:${esc(email)}">${esc(email)}</a>`:''}${phone?`<a href="tel:${phone.startsWith('+')?'+':'+1'}${phone.replace(/\D/g,'')}">${esc(phone.replace(/^(\d{3})(\d{3})(\d{4})$/,'$1-$2-$3'))}</a>`:''}<small><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${purpose==='Inferred executive email'?'Pattern evidence':url.includes('elliott.org')?'Elliott Report source':email||phone?'Company source':'Open official contact page'} ↗</a></small>${pattern?`<small>${esc(pattern)} <a href="${esc(profile)}" target="_blank" rel="noopener noreferrer">Executive profile ↗</a></small>`:''}</div>`;
}
let page=0;
const pageSize=24;
function render(){
 const list=filtered(),route=get('route').value;
 const pages=Math.max(1,Math.ceil(list.length/pageSize));
 page=Math.min(page,pages-1);
 get('count').textContent=list.length+' companies · '+list.reduce((sum,c)=>sum+c[5].filter(route=>route[0]==='Direct executive email').length,0)+' listed executive emails · '+list.reduce((sum,c)=>sum+c[5].filter(r=>r[0]==='Inferred executive email').length,0)+' inferred';
 get('pages').innerHTML=pages>1?`<button id="prev" ${page===0?'disabled':''}>Previous</button><span>Page ${page+1} of ${pages}</span><button id="next" ${page===pages-1?'disabled':''}>Next</button>`:'';
 for(const [id,delta] of [['prev',-1],['next',1]])get(id)?.addEventListener('click',()=>{page+=delta;render();get('directory').scrollIntoView();});
 get('retail').setAttribute('aria-pressed',get('industry').value==='Retail');
 get('export').disabled=!list.length;
 get('cards').innerHTML=list.slice(page*pageSize,(page+1)*pageSize).map(([name,ticker,sector,source,encoded,contacts])=>`<article class="card"><small>${ticker?esc(ticker)+' · ':''}${esc(sector)}</small><h2>${esc(name)}</h2>
 ${encoded?'<ul>':''}${people(encoded).map(([person,title])=>`<li><b>${esc(person)}</b><span>${esc(title)}</span></li>`).join('')}${encoded?'</ul>':''}
 <small><a href="${esc(source)}" target="_blank" rel="noopener noreferrer">${encoded?'Leadership source':source.includes('elliott.org')?'Company contact profile':'Official company site'} ↗</a></small>
 <p class="suggestion"><strong>Suggested first step</strong> ${contacts.some(c=>c[0]==='Executive customer service'||c[0]==='Customer escalation')?'Use the listed escalation team for an unresolved case.':contacts.some(c=>c[0]==='Customer service')?'Start with the published support route and ask for a case number.':'Call the switchboard and ask for customer relations.'}</p>
 <details open><summary>Customer contact routes</summary>${contacts.filter(c=>!route||route===c[0]).map(contactRow).join('')}</details></article>`).join('')||'<p>No matches. Try a company name, role, or ticker.</p>';
}
get('retail').addEventListener('click',()=>{get('industry').value=get('industry').value==='Retail'?'':'Retail';page=0;render();});
const reset=()=>{page=0;render();};
get('query').addEventListener('input',reset);
for(const id of ['industry','route'])get(id).addEventListener('change',reset);
get('export').addEventListener('click',()=>{
 const route=get('route').value;
 const lines=[['Company','Ticker','Contact route','Email','Phone','Contact name','Contact source','Leadership source','Pattern evidence','Executive profile']];
 for(const [name,ticker,,source,,contacts] of filtered()){
  for(const [purpose,email,phone,url,contactName,pattern,profile] of contacts)if(!route||route===purpose)lines.push([name,ticker,purpose,email,phone,contactName||'',url,source,pattern||'',profile||'']);
 }
 const csv=lines.map(line=>line.map(cell=>'"'+cell.replaceAll('"','""')+'"').join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='executive-business-contacts.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
render();
