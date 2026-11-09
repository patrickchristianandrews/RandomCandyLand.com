/* Original correlation archive, calculated only from verified World Bank series.
 * Pairs are never copied or invented. Source years and Pearson r come from the existing studio engine. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const cache=new Map();let sort='strong',needle='',page=0;const PAGE=24;
const escape=s=>String(s||'').toLocaleLowerCase();
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
 out.sort((a,b)=>b.score-a.score);
 cache.set(key,out);return out;
}
function render(){
 const root=$('corr-archive-grid'),count=$('corr-archive-count');if(!root||!count)return;
 const list=data().filter(x=>!needle||escape(x.a.name+' '+x.b.name+' '+x.a.group+' '+x.b.group).includes(needle));
 const sorted=sort==='negative'?list.filter(x=>x.c.r<0).sort((a,b)=>a.c.r-b.c.r):sort==='positive'?list.filter(x=>x.c.r>0).sort((a,b)=>b.c.r-a.c.r):sort==='recent'?list.sort((a,b)=>b.recent-a.recent||b.score-a.score):list;
 const pages=Math.max(1,Math.ceil(sorted.length/PAGE));page=Math.min(page,pages-1);
 root.replaceChildren();count.textContent=sorted.length.toLocaleString()+' independently computed coincidences · '+(page+1)+' of '+pages+' pages';
 if(!sorted.length){const p=document.createElement('p');p.textContent='No qualifying combinations are loaded yet. Try another country or search term; data may still be refreshing.';root.append(p)}
 for(const x of sorted.slice(page*PAGE,(page+1)*PAGE)){
  const b=document.createElement('button');b.type='button';b.className='corr-archive-item';
  const n=document.createElement('span');n.className='corr-archive-title';n.textContent=x.a.name+' × '+x.b.name;
  const meta=document.createElement('span');meta.className='corr-archive-meta';meta.textContent=x.a.group+' / '+x.b.group+' · '+x.c.pairs.length+' years';
  const rating=document.createElement('strong');rating.textContent='r '+(x.c.r>=0?'+':'')+x.c.r.toFixed(3);
  b.append(n,meta,rating);b.addEventListener('click',()=>{
    $('corr-first').value=x.a.id;$('corr-second').value=x.b.id;$('compare-corr').click();
    $('corr-result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });root.append(b);
 }
 $('corr-archive-prev').disabled=page<=0;$('corr-archive-next').disabled=page>=pages-1;
}
function init(){
 if(!$('corr-archive-grid'))return;
 $('corr-country').addEventListener('change',()=>{page=0;render()});
 $('corr-archive-search').addEventListener('input',e=>{needle=escape(e.target.value.trim());page=0;render()});
 $('corr-archive-sort').addEventListener('change',e=>{sort=e.target.value;page=0;render()});
 $('corr-archive-prev').addEventListener('click',()=>{page=Math.max(0,page-1);render()});
 $('corr-archive-next').addEventListener('click',()=>{page++;render()});
 window.addEventListener('wonder-data-ready',()=>{cache.clear();render()});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();