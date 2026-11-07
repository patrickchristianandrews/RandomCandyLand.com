/* Spurious Correlation Studio.
 * Computations use ONLY World Bank time series downloaded at site build.
 * Never generate fake values, falsely assert causality, or invent an r-score.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const node=(tag,text,klass)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(klass)e.className=klass;return e};
const svg=(tag,attrs={},text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=String(text);return e};
let catalog=null,active=null,mode='lines',previous='',pending=false;
function series(country,id){
 const a=catalog?.series?.[country+'|'+id];
 return Array.isArray(a)?a.filter(x=>Number.isInteger(x.year)&&Number.isFinite(x.value)).sort((x,y)=>x.year-y.year):[];
}
function indicators(){return Array.isArray(catalog?.indicators)?catalog.indicators:[]}
function valid(country){return indicators().filter(x=>series(country,x.id).length>=8)}
function label(id){return indicators().find(x=>x.id===id)||{id,name:id,unit:''}}
function pearson(xs,ys){
 if(!Array.isArray(xs)||xs.length!==ys.length||xs.length<3)return null;
 const mx=xs.reduce((a,b)=>a+b,0)/xs.length,my=ys.reduce((a,b)=>a+b,0)/ys.length;
 let ab=0,aa=0,bb=0;
 for(let i=0;i<xs.length;i++){const x=xs[i]-mx,y=ys[i]-my;ab+=x*y;aa+=x*x;bb+=y*y}
 if(!(aa>0&&bb>0))return null;return Math.max(-1,Math.min(1,ab/Math.sqrt(aa*bb)));
}
function evaluate(country,a,b){
 if(!a||!b||a===b)return null;
 const second=new Map(series(country,b).map(x=>[x.year,x.value]));
 const pairs=series(country,a).filter(x=>second.has(x.year)).map(x=>({year:x.year,a:x.value,b:second.get(x.year)}));
 if(pairs.length<8)return null;
 const r=pearson(pairs.map(x=>x.a),pairs.map(x=>x.b));if(r===null)return null;
 const d=[];for(let i=1;i<pairs.length;i++)if(pairs[i].year===pairs[i-1].year+1)d.push({a:pairs[i].a-pairs[i-1].a,b:pairs[i].b-pairs[i-1].b});
 const diff=d.length>=7?pearson(d.map(x=>x.a),d.map(x=>x.b)):null;
 return {country,a,b,pairs,r,diff,changeYears:d.length};
}
function updateSelects(){
 const country=$('corr-country').value,items=valid(country);
 for(const [id,want] of [['corr-first','IT.NET.USER.ZS'],['corr-second','SP.POP.65UP.TO.ZS']]){
  const el=$(id),old=el.value;el.replaceChildren();
  for(const item of items){const option=node('option',item.name+' · '+item.group);option.value=item.id;el.append(option)}
  el.value=items.some(x=>x.id===old)?old:items.some(x=>x.id===want)?want:items[id==='corr-first'?0:1]?.id||'';
 }
 $('generate-corr').disabled=items.length<2;$('compare-corr').disabled=items.length<2;
 const from=catalog?.updatedAt,validDate=from&&!Number.isNaN(Date.parse(from));
 const stale=validDate&&Date.now()-Date.parse(from)>4*86400000;
 $('corr-data-status').textContent=items.length<2?
  'Official source data are not available in this build yet. The scheduled refresh will retry. No synthetic figures or fictional r-scores are shown.':
  items.length+' World Bank indicators · '+$('corr-country').selectedOptions[0].textContent+
  ' · '+(validDate?'retrieved '+new Date(from).toLocaleString():'loaded from source cache')+(stale?' · last refresh is delayed':'')+
  '. Each series is shown only for years reported by its source.';
}
function empty(){const root=$('corr-result');root.replaceChildren();const e=node('div',undefined,'corr-empty');e.append(node('span','↗ ↘ ↗'),node('h3','One chart is not a causal story.'),node('p','Select two indicators or ask the generator for a suspicious-looking real-data coincidence.'));root.append(e)}
function manually(){
 const a=$('corr-first').value,b=$('corr-second').value;
 if(a===b){$('corr-data-status').textContent='Choose two different indicators, then compare.';return}
 const value=evaluate($('corr-country').value,a,b);
 if(!value){$('corr-data-status').textContent='Those series do not have at least eight overlapping years with usable reported values. Choose another pair.';return}
 active=value;mode='lines';show();
}
function surprise(){
 if(pending)return;
 const country=$('corr-country').value,items=valid(country),candidates=[];
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  if(items[i].group===items[j].group)continue;
  const item=evaluate(country,items[i].id,items[j].id);
  if(item&&item.pairs.length>=10)candidates.push(item);
 }
 if(!candidates.length){$('corr-data-status').textContent='Too few distinct indicators have overlapping years here. Try a different country.';return}
 candidates.sort((x,y)=>Math.abs(y.r)-Math.abs(x.r));
 const veryHigh=candidates.filter(x=>Math.abs(x.r)>=.72&&Math.abs(x.r)<.9999);
 const top=(veryHigh.length?veryHigh:candidates).slice(0,36);
 const different=top.filter(x=>x.a+'|'+x.b!==previous),pool=different.length?different:top;
 active=pool[Math.floor(Math.random()*pool.length)];
 if(!active)return;
 previous=active.a+'|'+active.b;
 $('corr-first').value=active.a;$('corr-second').value=active.b;mode='lines';show();
}
function format(v){
 if(!Number.isFinite(v))return 'n/a';
 if(Math.abs(v)>=1e9)return (v/1e9).toFixed(2)+' billion';
 if(Math.abs(v)>=1e6)return (v/1e6).toFixed(2)+' million';
 return new Intl.NumberFormat(undefined,{maximumFractionDigits:3}).format(v);
}
function drawTable(target,c){
 const outer=node('div',undefined,'corr-table-scroll'),table=node('table'),header=node('thead'),head=node('tr');
 for(const text of ['Year',label(c.a).name+' ('+label(c.a).unit+')',label(c.b).name+' ('+label(c.b).unit+')'])head.append(node('th',text));
 header.append(head);table.append(header);
 const body=node('tbody');
 for(const row of c.pairs){const line=node('tr');line.append(node('td',row.year),node('td',format(row.a)),node('td',format(row.b)));body.append(line)}
 table.append(body);outer.append(table);target.append(outer);
}
function norm(xs){
 const lo=Math.min(...xs),hi=Math.max(...xs);return xs.map(x=>(x-lo)/(hi-lo||1));
}
function drawGraph(target,c){
 const W=880,H=340,L=54,R=27,T=38,B=46,iw=W-L-R,ih=H-T-B,svgEl=svg('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':mode==='lines'?'Normalized time series from World Bank':'Scatterplot with one dot for each available year'});
 svgEl.append(svg('rect',{width:W,height:H,fill:'#0b1d2d'}));
 for(let i=0;i<=4;i++){const y=T+i*ih/4;svgEl.append(svg('line',{x1:L,x2:W-R,y1:y,y2:y,class:'grid-line'}))}
 const p=c.pairs;
 if(mode==='lines'){
  const va=norm(p.map(x=>x.a)),vb=norm(p.map(x=>x.b));
  const points=v=>v.map((n,i)=>(L+(i/(p.length-1))*iw).toFixed(1)+','+(T+(1-n)*ih).toFixed(1)).join(' ');
  for(const [values,color] of [[va,'#8fffd1'],[vb,'#f2b49b']])svgEl.append(svg('polyline',{points:points(values),fill:'none',stroke:color,'stroke-width':3.5,'stroke-linejoin':'round','stroke-linecap':'round'}));
  for(let i=0;i<p.length;i++)if(i===0||i===p.length-1||i%Math.max(1,Math.round(p.length/7))===0)svgEl.append(svg('text',{x:L+i*iw/(p.length-1),y:H-14,'text-anchor':'middle'},p[i].year));
  svgEl.append(svg('text',{x:L,y:18},'Each series independently scaled from its own minimum to maximum.'));
 }else{
  const xs=norm(p.map(x=>x.a)),ys=norm(p.map(x=>x.b));
  for(let i=0;i<p.length;i++){
   const x=L+xs[i]*iw,y=T+(1-ys[i])*ih;
   svgEl.append(svg('circle',{cx:x,cy:y,r:5,fill:'#9bffce',stroke:'#18384a','stroke-width':1.5}));
   if(i===0||i===p.length-1)svgEl.append(svg('text',{x:x+6,y:y-9},p[i].year));
  }
  svgEl.append(svg('text',{x:L,y:18},'Each dot represents one year; axes are independently scaled.'));
 }
 svgEl.append(svg('text',{x:W/2,y:H-2,'text-anchor':'middle'},mode==='lines'?'Year':'Indicator 1 →'));
 target.append(svgEl);
}
function saveCSV(){
 if(!active)return;
 const esc=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const data=[['Year',label(active.a).name,label(active.b).name].map(esc).join(','),...active.pairs.map(r=>[r.year,r.a,r.b].map(esc).join(','))];
 data.push('# Source: World Bank World Development Indicators');
 data.push('# Last source refresh: '+(catalog?.updatedAt||'not reported'));
 const url=URL.createObjectURL(new Blob([data.join('\n')],{type:'text/csv'}));
 const link=node('a');link.href=url;link.download='wonder-index-'+active.country+'-correlation.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function show(){
 if(!active)return;
 const c=active,one=label(c.a),two=label(c.b),root=$('corr-result');root.replaceChildren();
 const top=node('div',undefined,'corr-headline'),heading=node('div'),score=node('div',undefined,'corr-rating');
 heading.append(node('span','WORLD BANK · '+(catalog.countries?.[c.country]||c.country),'eyebrow'),node('h3',one.name+' & '+two.name),node('p','An unexpected association in the overlapping reported years. This does not demonstrate causation.'));
 score.append(node('strong',(c.r>=0?'+':'')+c.r.toFixed(3)),node('span','PEARSON r · NOT CAUSATION'));top.append(heading,score);root.append(top);
 const metrics=node('div',undefined,'corr-metrics');
 for(const s of [c.pairs.length+' annual observations',c.pairs[0].year+'–'+c.pairs.at(-1).year,'r² = '+(c.r*c.r).toFixed(3),c.diff===null?'Adjacent-year change: unavailable':'Adjacent-year change r = '+c.diff.toFixed(3)])metrics.append(node('span',s));
 root.append(metrics);
 const switches=node('div',undefined,'corr-chart-controls');
 for(const [key,name] of [['lines','Compare trends'],['scatter','Scatterplot'],['table','Underlying data']]){
  const b=node('button',name);b.type='button';b.setAttribute('aria-pressed',String(mode===key));b.onclick=()=>{mode=key;show()};switches.append(b);
 }
 const download=node('button','↓ Download underlying CSV');download.type='button';download.onclick=saveCSV;switches.append(download);root.append(switches);
 const plot=node('div',undefined,'corr-chart');if(mode==='table')drawTable(plot,c);else drawGraph(plot,c);root.append(plot);
 const legend=node('div',undefined,'corr-legend');legend.append(node('span',one.name+' · '+one.unit),node('span',two.name+' · '+two.unit));root.append(legend);
 const interpretation=node('div',undefined,'corr-insight');
 let trend='There are too few consecutive yearly changes to draw a reliable trend comparison.';
 if(c.diff!==null)trend=Math.abs(c.diff)<Math.abs(c.r)-.25?'After comparing year-to-year changes instead of levels, the association becomes much weaker.':
 'A relationship remains between year-to-year changes, but that still does not prove that one series causes the other.';
 interpretation.append(node('strong','Before you claim a discovery…'),node('p','This generator tests many unrelated pairs, so some startling patterns can appear by chance or through shared time trends. '+trend+' Look for a mechanism, possible confounders, and independent evidence before treating the pattern as meaningful.'));
 root.append(interpretation);
 const links=node('div',undefined,'corr-links');
 for(const [name,code] of [[one.name,c.a],[two.name,c.b]]){
  const a=node('a','Official source: '+name+' ↗');a.href='https://data.worldbank.org/indicator/'+encodeURIComponent(code)+'?locations='+encodeURIComponent(c.country);a.rel='noopener noreferrer';a.target='_blank';links.append(a);
 }root.append(links);
}
function refresh(){
 catalog=window.WonderData||null;
 updateSelects();
 if(active&&!evaluate(active.country,active.a,active.b)){active=null;empty()}
}
function start(){
 $('corr-country').addEventListener('change',()=>{active=null;previous='';refresh();empty()});
 $('corr-first').addEventListener('change',()=>{active=null;empty()});
 $('corr-second').addEventListener('change',()=>{active=null;empty()});
 $('generate-corr').onclick=surprise;$('compare-corr').onclick=manually;
 window.addEventListener('wonder-data-ready',refresh);
 window.addEventListener('wonder-data-error',()=>{$('corr-data-status').textContent='Source refresh is temporarily unavailable. No invented figures will be displayed.';$('generate-corr').disabled=true;$('compare-corr').disabled=true});
 refresh();
}
window.SpuriousCorrelationStudio=Object.freeze({pearson,evaluate,seriesFor:series,available:valid,getResult:()=>active});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
