/* The Wonder Index home.
 * One rotating original article at a time; current public metadata and real WDI statistics.
 * All visible numbers come from the refreshed World Bank dataset, never invented values.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id),a=(window.WonderIndexIdeas||[]).map(x=>({id:x[0],category:x[1],title:x[2],hook:x[3],try:x[6]}));
const create=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(cls)el.className=cls;return el};
const num=(x,d=2)=>Number(x).toLocaleString(undefined,{maximumFractionDigits:d});
let current=0,paused=false,changedAt=0,refreshedAt=0,currentData=null;
const day=()=>{const x=new Date();return Math.floor(new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime()/86400000)};
function showStory(){
 if(!a.length)return;
 const x=a[current];
 $('home-feature-category').textContent=x.category.toUpperCase()+' · SHORT READ';
 $('home-feature-heading').textContent=x.title;
 $('home-feature-summary').textContent=x.hook+' '+x.try;
 $('home-feature-link').href='/curiosity/ideas/?story='+encodeURIComponent(x.id);
 $('home-feature-count').textContent=(current+1)+' of '+a.length+' stories';
 changedAt=Date.now();
}
function choose(direction){current=(current+direction+a.length)%a.length;showStory()}
function formattedDate(raw){
 if(!raw||Number.isNaN(Date.parse(raw)))return null;
 return new Date(raw).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
}
function renderResearch(data){
 const target=$('home-research-feed');target.replaceChildren();
 const records=Array.isArray(data?.research)?data.research.filter(x=>x&&x.title&&/^https:\/\/doi\.org\//i.test(x.url)).slice(0,2):[];
 if(!records.length){
  target.append(create('p','The public research feed has no verified source records available right now. Browse the original index directly.'));
  const link=create('a','Open public OpenAlex research ↗');link.href='https://openalex.org/works';link.target='_blank';link.rel='noopener noreferrer';target.append(link);return;
 }
 for(const r of records){
  const item=create('div',undefined,'wonder-research-item'),anchor=create('a',String(r.title).slice(0,200));
  anchor.href=r.url;anchor.target='_blank';anchor.rel='noopener noreferrer';
  const label=create('span',(r.published||'Date unavailable')+' · '+(r.source||'Scholarly publication'),'wonder-research-meta');
  item.append(anchor,label);target.append(item);
 }
}
function pearson(a,b){
 if(a.length<3||a.length!==b.length)return null;
 const n=a.length,mean=x=>x.reduce((p,v)=>p+v,0)/n,ax=mean(a),bx=mean(b);
 let sum=0,aa=0,bb=0;
 for(let i=0;i<n;i++){const x=a[i]-ax,y=b[i]-bx;sum+=x*y;aa+=x*x;bb+=y*y}
 return aa>0&&bb>0?Math.max(-1,Math.min(1,sum/Math.sqrt(aa*bb))):null;
}
function findPair(data){
 const country='USA',available=(data?.indicators||[]).filter(x=>(data.series?.[country+'|'+x.id]||[]).length>=10);
 const candidates=[];
 for(let i=0;i<available.length;i++)for(let j=i+1;j<available.length;j++){
  const a=available[i],b=available[j];if(a.group===b.group)continue;
  const left=data.series[country+'|'+a.id],right=new Map(data.series[country+'|'+b.id].map(row=>[row.year,row.value]));
  const rows=left.filter(row=>Number.isFinite(row.value)&&right.has(row.year)&&Number.isFinite(right.get(row.year)))
    .map(row=>({year:row.year,a:row.value,b:right.get(row.year)})).sort((x,y)=>x.year-y.year);
  if(rows.length<10)continue;
  const r=pearson(rows.map(row=>row.a),rows.map(row=>row.b));
  if(r!==null&&Math.abs(r)>=.65&&Math.abs(r)<.99999)candidates.push({a,b,r,rows});
 }
 if(!candidates.length)return null;
 candidates.sort((x,y)=>Math.abs(y.r)-Math.abs(x.r));
 const pool=candidates.slice(0,Math.min(candidates.length,18));
 return pool[(day()+Math.floor(Date.now()/21600000))%pool.length];
}
function miniature(target,match){
 const values=x=>match.rows.map(row=>row[x]),series=[values('a'),values('b')],w=480,h=126,margin=9;
 const documentNS='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(documentNS,'svg');svg.setAttribute('viewBox','0 0 '+w+' '+h);
 svg.setAttribute('role','img');svg.setAttribute('aria-label','Two independently scaled World Bank time series for '+match.a.name+' and '+match.b.name+'.');
 for(let t=0;t<series.length;t++){
  const ar=series[t],lo=Math.min(...ar),hi=Math.max(...ar),range=hi-lo||1;
  const points=ar.map((v,i)=>((margin+i*(w-2*margin)/(ar.length-1)).toFixed(1)+','+
    (margin+(1-(v-lo)/range)*(h-2*margin)).toFixed(1))).join(' ');
  const line=document.createElementNS(documentNS,'polyline');
  line.setAttribute('points',points);line.setAttribute('fill','none');
  line.setAttribute('stroke',t?'#f5bca7':'#8fffd0');
  line.setAttribute('stroke-width','3.6');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');svg.append(line);
 }
 target.append(svg);
}
function renderCorrelation(data){
 const target=$('home-correlation-feed');target.replaceChildren();
 const pair=findPair(data);
 if(!pair){
  target.append(create('p','No official indicator series are available yet for a dependable chart. The next scheduled source check will retry; no numbers are fabricated.'));return;
 }
 const title=create('h4',pair.a.name+' × '+pair.b.name),stats=create('p','r = '+(pair.r>=0?'+':'')+pair.r.toFixed(3)+
  ' · '+pair.rows.length+' shared years ('+pair.rows[0].year+'–'+pair.rows.at(-1).year+')','wonder-corr-stats');
 const chart=create('div',undefined,'wonder-mini-chart');
 miniature(chart,pair);
 const label=create('p','Original World Bank indicators · both lines independently scaled · no causal claim','wonder-mini-caveat');
 target.append(title,stats,chart,label);
}
async function refresh(){
 refreshedAt=Date.now();
 try{
  const resp=await fetch('/curiosity/live-data.json?tick='+Math.floor(Date.now()/1800000),{cache:'no-store'});
  if(!resp.ok)throw Error('HTTP '+resp.status);
  const doc=await resp.json();
  if(doc.version!==1||!doc.series||typeof doc.series!=='object')throw Error('Source data schema unavailable');
  currentData=doc;renderResearch(doc);renderCorrelation(doc);
  const research=formattedDate(doc.researchUpdatedAt),stats=formattedDate(doc.updatedAt);
  $('home-source-status').textContent='Research checked: '+(research||'not available')+' · World Bank checked: '+(stats||'not available');
 }catch{
  renderResearch(null);renderCorrelation(null);
  $('home-source-status').textContent='Source refresh unavailable · original stories remain readable';
 }
}
function start(){
 if(a.length){current=day()%a.length;showStory()}
 $('home-feature-prev').onclick=()=>choose(-1);
 $('home-feature-next').onclick=()=>choose(1);
 const btn=$('home-feature-pause'),motion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 paused=Boolean(motion);btn.setAttribute('aria-pressed',String(paused));btn.textContent=paused?'Play':'Pause';
 btn.onclick=()=>{paused=!paused;btn.setAttribute('aria-pressed',String(paused));btn.textContent=paused?'Play':'Pause'};
 // Only rotate one visible feature at a time. Never animate a hidden page or ignore reduced-motion preference.
 setInterval(()=>{if(!paused&&!document.hidden&&Date.now()-changedAt>=16000)choose(1)},3000);
 void refresh();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-refreshedAt>=30*60000)void refresh()});
 setInterval(()=>{if(!document.hidden&&Date.now()-refreshedAt>=30*60000)void refresh()},30*60000);
}
window.WonderIndexLanding=Object.freeze({getStory:()=>a[current],refresh,pearson,findPair});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
