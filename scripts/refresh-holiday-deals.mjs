/**
 * Generate a source-attributed expanded deal index during scheduled site builds.
 * DealNews explicitly permits attributed public RSS displays with unchanged links.
 * Previous public snapshot preserves up to 365 days of our own observed prices.
 * This is NOT a verified market-wide price-history service.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const OUT = 'public/black-friday/live-feed.json';
const PREVIOUS = 'https://randomcandyland.com/black-friday/live-feed.json';
const FEEDS = [
  { url: 'https://www.dealnews.com/?rss=1&sort=time', source: 'DealNews' },
  { url: 'https://dealnews.a.ssl.fastly.net/dealnews/rss/todays-edition.xml', source: 'DealNews' },
  { url: 'https://www.dealnews.com/?rss=1&sort=hotness', source: 'DealNews popular' },
  { url: 'https://www.dealnews.com/rss/editors-choice/', source: 'DealNews editors' }
];
const now = new Date();
const decode = (s='') => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,c)=>{
  if(c[0]==='#'){const n=c[1]?.toLowerCase()==='x'?parseInt(c.slice(2),16):parseInt(c.slice(1),10);return Number.isFinite(n)&&n>0&&n<0x110000?String.fromCodePoint(n):'';}
  return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[c.toLowerCase()]||'';
}).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const tag = (xml,name) => {
  const match = xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'));
  return match ? decode(match[1]) : '';
};
function category(title){
  const s=title.toLowerCase();
  if(/laptop|chromebook|macbook|computer|monitor|ipad|tablet|ssd|graphic card|processor/.test(s))return 'Computers';
  if(/television|\btv\b|projector|streaming/.test(s))return 'TVs';
  if(/headphone|speaker|earbud|airpod|soundbar/.test(s))return 'Audio';
  if(/toy|lego|game|switch|playstation|xbox|puzzle/.test(s))return 'Toys & Games';
  if(/kitchen|coffee|air fryer|blender|cookware|espresso/.test(s))return 'Kitchen';
  if(/beauty|makeup|shampoo|skincare|fragrance/.test(s))return 'Beauty';
  if(/fashion|shirt|sweater|shoe|boot|jacket|dress|apparel/.test(s))return 'Fashion';
  if(/tool|drill|saw|garage|lawn|vacuum|furniture|home/.test(s))return 'Home';
  if(/phone|iphone|galaxy|pixel|smartwatch|watch/.test(s))return 'Phones';
  return 'More deals';
}
function priceFrom(title){
  // A currency figure may be the deal price only if it follows explicit "for" or "at".
  const match=title.match(/\b(?:for|at|now)\s+\$([\d,]+(?:\.\d{1,2})?)/i);
  return match?Number(match[1].replace(/,/g,'')):null;
}
async function request(url, timeout=12000){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
  try {const res=await fetch(url,{signal:ctrl.signal,headers:{'User-Agent':'RandomCandyLand-HolidayRadar/1.0 (+https://randomcandyland.com/)','Accept':'application/rss+xml,application/xml,text/xml,application/json;q=0.8'}});if(!res.ok)throw Error('HTTP '+res.status);return await res.text();}finally{clearTimeout(timer);}
}
let previous=[];
try { const response=JSON.parse(await request(PREVIOUS,8000));previous=Array.isArray(response.deals)?response.deals:[]; } catch(e) {console.log('Previous history unavailable:',e.message);}
const byId=new Map(previous.filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
const byLink=new Map();
let okFeeds=0;
for(const feed of FEEDS){
  try{
    const xml=await request(feed.url);
    const items=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(x=>x[1]);
    for(const item of items){
      const title=tag(item,'title'),link=tag(item,'link'),date=tag(item,'pubDate')||tag(item,'dc:date');
      if(!title || !/^https:\/\//i.test(link) || !/dealnews\.com/i.test(new URL(link).hostname))continue;
      const epoch=date?Date.parse(date):NaN;
      if(Number.isFinite(epoch)&&(now.getTime()-epoch)>21*86400000)continue;
      const id='rss-'+createHash('sha1').update(link.split('?')[0]).digest('hex').slice(0,13);
      const price=priceFrom(title);
      const old=byId.get(id);
      const history=Array.isArray(old?.history)?old.history.filter(h=>Number.isFinite(Date.parse(h.date))&&(now.getTime()-Date.parse(h.date))<365*86400000):[];
      const today=now.toISOString().slice(0,10);
      if(Number.isFinite(price) && price>0 && !history.some(h=>h.date===today))history.push({date:today,price});
      const entry={id,name:title,category:category(title),store:'See source',price,reference:null,spec:'',source:link,sourceType:feed.source,checked:Number.isFinite(epoch)?new Date(epoch).toISOString().slice(0,10):today,publishedAt:Number.isFinite(epoch)?new Date(epoch).toISOString():null,why:'',catch:'Check the linked deal report for retailer, exact model, delivery, exclusions and current availability.',featured:feed.source==='DealNews editors',history:history.slice(-365)};
      const existing=byLink.get(id);
      if(!existing || feed.source==='DealNews editors' || (entry.publishedAt||'')>(existing.publishedAt||''))byLink.set(id,entry);
    }
    okFeeds++;
    console.log(feed.source,'RSS entries',items.length);
  } catch(e){console.warn('RSS unavailable:',feed.source,e.message);}
}
let all=[...byLink.values()];
if(!okFeeds){
 all=previous.filter(x=>x&&x.id&&x.source&&x.name&&Number.isFinite(Date.parse(x.checked))&&(now.getTime()-Date.parse(x.checked))<7*86400000);
 console.warn('No source fetches succeeded: preserving recent entries with stale-data notice');
}
all.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
all=all.slice(0,360);
const result={generatedAt:now.toISOString(),sourcesSucceeded:okFeeds,sourceNotice:okFeeds?'Attributed deal reports. Prices, stock and sale timing are not independently verified.':'Feed retrieval failed; older reports may no longer be available.',deals:all};
await mkdir('public/black-friday',{recursive:true});
await writeFile(OUT,JSON.stringify(result));
console.log('Holiday Radar feed written:',all.length,'deals; feeds:',okFeeds);
