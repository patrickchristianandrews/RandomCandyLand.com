/* Original correlation archive, calculated only from verified World Bank series.
 * Pairs are never copied or invented. Source years and Pearson r come from the existing studio engine. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const cache=new Map();let sort='absurd',needle='',page=0;const PAGE=24;let lastWild='';
const escape=s=>String(s||'').toLocaleLowerCase();
// Rank topical mismatch; strength is a real calculated statistic, not part of the joke.
const unusualGroups=new Set(['Tourism','Transport','Energy','Technology','Environment','Education','Health','People']);
function absurdScore(x){
 const g=[x.a.group,x.b.group],unusual=g.filter(v=>unusualGroups.has(v)).length;
 const veryDifferent=/Tourism|Transport/.test(g.join('|'))&&/People|Health|Environment|Technology|Education/.test(g.join('|'));
 const mix=/Energy|Technology/.test(g.join('|'))&&/Health|People|Education/.test(g.join('|'));
 return x.score*50+unusual*8+(veryDifferent?32:0)+(mix?22:0)+Math.min(x.c.pairs.length,22)/10;
}
const jokeTitles=[
 (a,b)=>'BREAKING: '+a+' and '+b+' have apparently joined the same secret club',
 (a,b)=>'The charts demand answers: why are '+a+' and '+b+' acting suspiciously alike?',
 (a,b)=>'Coincidence of the day: '+a+' meets '+b+' in a statistical plot twist',
 (a,b)=>'An extremely serious investigation into '+a+' versus '+b,
 (a,b)=>'Two charts walked into a bar: '+a+' and '+b
];
function joke(x){const h=Math.abs((x.a.id+'|'+x.b.id).split('').reduce((a,c)=>(a*31+c.charCodeAt(0))|0,0));return jokeTitles[h%jokeTitles.length](x.a.name.toLowerCase(),x.b.name.toLowerCase())}
function openPair(x){
 $('corr-first').value=x.a.id;$('corr-second').value=x.b.id;$('compare-corr').click();
 $('corr-result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}

function data(){
 const country=$('corr-country')?.value,api=window.SpuriousCorrelationStudio,cat=window.WonderData;
 if(!country||!api||!cat?.series)return [];
 const key=country+'|'+Object.keys(cat.series).length;
 if(cache.has(key))return cache.get(key);
 const indicators=api.available(country),out=[];
 for(let i=0;i<indicators.length;i++)for(let j=i+1;j<indicators.length;j++){
  const a=indicators[i],b=indicators[j];if(a.group===b.group)continue;
  const c=api.evaluate(country,a.id,b.id);
  if(c&&c.pairs.length>=10&&Math.abs(c.r)>=.42&&Math.abs(c.r)<.99999)
   out.push({a,b,c,score:Math.abs(c.r),recent:c.pairs[c.pairs.length-1].year});
 }
 out.forEach(x=>x.absurd=absurdScore(x));out.sort((a,b)=>b.score-a.score);
 cache.set(key,out);return out;
}
function render(){
 const root=$('corr-archive-grid'),count=$('corr-archive-count');if(!root||!count)return;
 const list=data().filter(x=>!needle||escape(x.a.name+' '+x.b.name+' '+x.a.group+' '+x.b.group).includes(needle));
 const sorted=sort==='absurd'?list.sort((a,b)=>b.absurd-a.absurd):sort==='negative'?list.filter(x=>x.c.r<0).sort((a,b)=>a.c.r-b.c.r):sort==='positive'?list.filter(x=>x.c.r>0).sort((a,b)=>b.c.r-a.c.r):sort==='recent'?list.sort((a,b)=>b.recent-a.recent||b.score-a.score):list;
 const pages=Math.max(1,Math.ceil(sorted.length/PAGE));page=Math.min(page,pages-1);
 root.replaceChildren();count.textContent=sorted.length.toLocaleString()+' independently computed coincidences · '+(page+1)+' of '+pages+' pages';
 if(!sorted.length){const p=document.createElement('p');p.textContent='No qualifying combinations are loaded yet. Try another country or search term; data may still be refreshing.';root.append(p)}
 for(const x of sorted.slice(page*PAGE,(page+1)*PAGE)){
  const b=document.createElement('button');b.type='button';b.className='corr-archive-item';
  const n=document.createElement('span');n.className='corr-archive-title';n.textContent=sort==='absurd'?joke(x):x.a.name+' × '+x.b.name;
  const meta=document.createElement('span');meta.className='corr-archive-meta';meta.textContent=x.a.name+' × '+x.b.name+' · '+x.c.pairs.length+' real years';
  const rating=document.createElement('strong');rating.textContent='r '+(x.c.r>=0?'+':'')+x.c.r.toFixed(3);
  b.append(n,meta,rating);b.addEventListener('click',()=>openPair(x));root.append(b);
 }
 $('corr-archive-prev').disabled=page<=0;$('corr-archive-next').disabled=page>=pages-1;
}
function init(){
 if(!$('corr-archive-grid'))return;
 $('corr-country').addEventListener('change',()=>{page=0;render()});
 $('corr-archive-search').addEventListener('input',e=>{needle=escape(e.target.value.trim());page=0;render()});
 $('corr-archive-sort').addEventListener('change',e=>{sort=e.target.value;page=0;render()});
 $('corr-archive-wild').addEventListener('click',()=>{
  const wild=data().slice().sort((a,b)=>b.absurd-a.absurd).slice(0,Math.min(80,data().length)).filter(x=>x.a.id+'|'+x.b.id!==lastWild);
  if(!wild.length){$('corr-archive-count').textContent='Source data not loaded; no fictional statistics will be generated.';return}
  const x=wild[Math.floor(Math.random()*wild.length)];lastWild=x.a.id+'|'+x.b.id;
  openPair(x);
 });
 $('corr-archive-prev').addEventListener('click',()=>{page=Math.max(0,page-1);render()});
 $('corr-archive-next').addEventListener('click',()=>{page++;render()});
 window.addEventListener('wonder-data-ready',()=>{cache.clear();render()});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();