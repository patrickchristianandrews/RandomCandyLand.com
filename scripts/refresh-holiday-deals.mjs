/**
 * 2026 Holiday Deal Radar: hourly aggregation of public, attributed deal RSS
 * from multiple independent publishers, plus a checked ad-scan index.
 * These are reported leads, NOT independent verification of retailer prices,
 * live stock, expiry or an exhaustive listing of all online promotions.
 * RSS titles and original source links only; no copied publisher articles.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const OUT='public/black-friday/live-feed.json';
const ADS_OUT='public/black-friday/ad-scans.json';
const PREVIOUS='https://randomcandyland.com/black-friday/live-feed.json';
const PREVIOUS_ADS='https://randomcandyland.com/black-friday/ad-scans.json';
const now=new Date(),day=now.toISOString().slice(0,10);
const FEEDS=[
 {name:'DealNews · newest',group:'DealNews',url:'https://www.dealnews.com/?rss=1&sort=time',domains:['dealnews.com']},
 {name:'DealNews · today',group:'DealNews',url:'https://dealnews.a.ssl.fastly.net/dealnews/rss/todays-edition.xml',domains:['dealnews.com']},
 {name:'DealNews · popular',group:'DealNews',popular:true,url:'https://www.dealnews.com/?rss=1&sort=hotness',domains:['dealnews.com']},
 {name:'DealNews · editors',group:'DealNews',featured:true,url:'https://www.dealnews.com/rss/editors-choice/',domains:['dealnews.com']},
 {name:'Slickdeals · frontpage',group:'Slickdeals',popular:true,url:'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',domains:['slickdeals.net']},
 {name:'Slickdeals · popular',group:'Slickdeals',popular:true,url:'https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1',domains:['slickdeals.net']},
 {name:'Slickdeals · Hot Deals forum',group:'Slickdeals',url:'https://slickdeals.net/newsearch.php?searchin=first&forumchoice%5B%5D=9&rss=1',domains:['slickdeals.net']},
 {name:'TechBargains',group:'TechBargains',url:'https://www.techbargains.com/rss.xml',domains:['techbargains.com']},
 {name:"Ben's Bargains",group:"Ben's Bargains",url:'https://bensbargains.net/rss/',domains:['bensbargains.net','bensbargains.com']},
 {name:'9to5Toys',group:'9to5Toys',url:'https://9to5toys.com/feed/',domains:['9to5toys.com']},
 {name:'Hip2Save',group:'Hip2Save',url:'https://hip2save.com/feed/',domains:['hip2save.com']},
 {name:'All Things Target',group:'All Things Target',url:'https://allthingstarget.com/feed/',domains:['allthingstarget.com']},
 {name:'Southern Savers',group:'Southern Savers',url:'https://www.southernsavers.com/feed/',domains:['southernsavers.com']},
 {name:'RetailMeNot · blog',group:'RetailMeNot',url:'https://www.retailmenot.com/blog/feed/',domains:['retailmenot.com']},
 {name:'Money Saving Mom',group:'Money Saving Mom',url:'https://moneysavingmom.com/feed/',domains:['moneysavingmom.com']},
 {name:'Totally Target',group:'Totally Target',url:'https://www.totallytarget.com/feed/',domains:['totallytarget.com']},
 {name:'Common Sense With Money',group:'Common Sense With Money',url:'https://www.commonsensewithmoney.com/feed/',domains:['commonsensewithmoney.com']}
];
const decode=(s='')=>String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|ndash|mdash);/gi,(_,c)=>{
 if(c[0]==='#'){const n=c[1]?.toLowerCase()==='x'?parseInt(c.slice(2),16):parseInt(c.slice(1),10);return Number.isFinite(n)&&n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}
 return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—'}[c.toLowerCase()]||'';
}).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const tag=(xml,name)=>{
 const m=xml.match(new RegExp('<'+name.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')+'>','i'));
 return m?decode(m[1]):'';
};
const cleanUrl=(url)=>{
 try{const u=new URL(url);if(u.protocol!=='https:')return null;u.hash='';for(const k of [...u.searchParams.keys()])if(/^(utm_|fbclid|gclid|mc_|ref$)/i.test(k))u.searchParams.delete(k);return u.href;}catch{return null;}
};
function allowedLink(url,domains){
 try{const h=new URL(url).hostname.toLowerCase();return domains.some(d=>h===d||h.endsWith('.'+d));}catch{return false;}
}
function category(title){
 const s=title.toLowerCase();
 if(/laptop|chromebook|macbook|computer|monitor|ipad|tablet|ssd|graphic card|processor/.test(s))return 'Computers';
 if(/television|\btv\b|projector|streaming|roku/.test(s))return 'TVs';
 if(/headphone|speaker|earbud|airpod|soundbar|earphone/.test(s))return 'Audio';
 if(/toy|lego|game|switch|playstation|xbox|puzzle|nintendo/.test(s))return 'Toys & Games';
 if(/kitchen|coffee|air fryer|blender|cookware|espresso|baking/.test(s))return 'Kitchen';
 if(/beauty|makeup|shampoo|skincare|fragrance|lipstick/.test(s))return 'Beauty';
 if(/fashion|shirt|sweater|shoe|boot|jacket|dress|apparel|sneaker/.test(s))return 'Fashion';
 if(/tool|drill|saw|garage|lawn|vacuum|furniture|home|lighting/.test(s))return 'Home';
 if(/phone|iphone|galaxy|pixel|smartwatch|watch/.test(s))return 'Phones';
 if(/food|snack|grocery|detergent|soda|pasta/.test(s))return 'Groceries';
 return 'More deals';
}
function priceFrom(title){
 // Extract quoted checkout-like prices only; "$70 off", "reg $149",
 // "$1,000 value", "up to $50" etc. are NOT deal prices.
 const hits=[...title.matchAll(/\$([\d,]+(?:\.\d{1,2})?)/g)];
 for(const hit of hits){
  const before=title.slice(Math.max(0,hit.index-24),hit.index).toLowerCase();
  const after=title.slice(hit.index+hit[0].length,hit.index+hit[0].length+18).toLowerCase();
  if(/(?:up to|save|savings|discount|worth|reg\.?|regular|was|orig\.?|msrp|value|off|over|under)\s*$/.test(before))continue;
  if(/^\s*(?:off|discount|value|savings|credit|rebate)\b/.test(after))continue;
  if(/^\s*(?:%|\/|per)\b/.test(after))continue;
  const n=Number(hit[1].replace(/,/g,''));
  if(Number.isFinite(n)&&n>0&&n<=100000)return n;
 }
 return null;
}
function retailer(title){
 const stores=[
  ['Amazon',/\b(?:at|from|via|on)\s+(?:the\s+)?amazon(?:\.com)?\b/i],
  ['Walmart',/\b(?:at|from|via|on)\s+(?:the\s+)?walmart(?:\.com)?\b/i],
  ['Target',/\b(?:at|from|via|on)\s+(?:the\s+)?target(?:\.com)?\b/i],
  ['Best Buy',/\b(?:at|from|via|on)\s+(?:the\s+)?best\s*buy\b/i],
  ['Home Depot',/\b(?:at|from|via|on)\s+(?:the\s+)?home\s*depot\b/i],
  ['Costco',/\b(?:at|from|via|on)\s+(?:the\s+)?costco\b/i],
  ["Sam's Club",/\b(?:at|from|via|on)\s+(?:the\s+)?sam['’]s\s*club\b/i],
  ["Kohl's",/\b(?:at|from|via|on)\s+(?:the\s+)?kohl['’]s\b/i],
  ['eBay',/\b(?:at|from|via|on)\s+(?:the\s+)?ebay\b/i],
  ['Macy’s',/\b(?:at|from|via|on)\s+(?:the\s+)?macy['’]?s\b/i],
  ['Woot',/\b(?:at|from|via|on)\s+(?:the\s+)?woot\b/i]
 ];
 return stores.find(([,r])=>r.test(title))?.[0]||'See source';
}
function signature(title){
 const x=title.toLowerCase().replace(/\$[\d,.]+/g,' ').replace(/[^a-z0-9]+/g,' ').split(/\s+/)
 .filter(t=>t.length>1&&!/^(deal|deals|sale|save|off|now|free|shipping|shipped|with|from|only|at|on|for|and|the|just|plus|prime|reg|today|new|hot|early|black|friday|cyber|monday|in|of|to|you|this|best|low|lowest|ever|get|up|code|coupon|discount|dollar|price|amazon|walmart|target|bestbuy|ebay)$/.test(t));
 return [...new Set(x)].sort();
}
const overlap=(a,b)=>{
 const aa=new Set(a),bb=new Set(b),same=a.filter(t=>bb.has(t)).length;
 return {same,sim:same/(aa.size+bb.size-same||1)};
};
function sameDeal(a,b){
 if(a.price!==b.price || !Number.isFinite(a.price)||a.price<=0)return false;
 if(a.store!=='See source'&&b.store!=='See source'&&a.store!==b.store)return false;
 const ta=signature(a.name),tb=signature(b.name);
 // Product packs, dimensions, model codes, color etc. remain distinct unless
 // almost every characteristic matches. Conservative, not arbitrary fuzzy.
 const {same,sim}=overlap(ta,tb);
 return same>=3&&sim>=.87;
}
async function request(url,timeout=12000){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
 try{const res=await fetch(url,{signal:ctrl.signal,headers:{'User-Agent':'RandomCandyLand-HolidayRadar/2026 (+https://randomcandyland.com/)','Accept':'application/rss+xml,application/atom+xml,application/xml,text/xml,text/html;q=0.8,application/json;q=0.6'}});
 if(!res.ok)throw Error('HTTP '+res.status);
 return await res.text();
 }finally{clearTimeout(timer);}
}
const readJSON=async url=>{try{return JSON.parse(await request(url,8000));}catch{return null;}};
const previousFeed=await readJSON(PREVIOUS);
const previous=Array.isArray(previousFeed?.deals)?previousFeed.deals:[];
const oldByLink=new Map(previous.filter(x=>x&&typeof x.source==='string').map(x=>[cleanUrl(x.source),x]));
const byLink=new Map();
const sourceStatus=[];
for(const feed of FEEDS){
 const status={name:feed.name,group:feed.group,url:feed.url,checkedAt:now.toISOString(),ok:false,items:0,accepted:0};
 try{
  const xml=await request(feed.url);
  const items=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(x=>x[1]);
  if(!items.length)throw Error('No RSS items');
  status.items=items.length;
  for(const item of items){
   const title=tag(item,'title'),rawLink=tag(item,'link'),link=cleanUrl(rawLink);
   const published=tag(item,'pubDate')||tag(item,'dc:date')||tag(item,'published');
   if(!title||title.length<6||!link||!allowedLink(link,feed.domains))continue;
   const epoch=published?Date.parse(published):NaN;
   if(Number.isFinite(epoch) && (now.getTime()-epoch>14*86400000||epoch-now.getTime()>86400000))continue;
   // Skip obvious shopping advice and reviews that are not offer announcements.
   if(/^(how to|review:|best gifts to|gift guide|weekly recap|podcast|our favorite|buyer'?s guide|what to buy)/i.test(title))continue;
   const price=priceFrom(title);
   const words=/(?:deal|sale|discount|price|clearance|coupon|save|off|gift|shipped|black friday|cyber monday)/i.test(title);
   if(price===null&&!words)continue;
   const old=oldByLink.get(link),id='rss-'+createHash('sha1').update(link).digest('hex').slice(0,13);
   const hist=Array.isArray(old?.history)?old.history.filter(h=>h&&h.date&&Number.isFinite(Number(h.price))&&Date.parse(h.date)>now.getTime()-365*86400000):[];
   if(Number.isFinite(price)&&price>0&&!hist.some(h=>h.date===day))hist.push({date:day,price});
   const incoming={id,name:title,category:category(title),store:retailer(title),price,reference:null,spec:'',source:link,sourceType:feed.group,checked:Number.isFinite(epoch)?new Date(epoch).toISOString().slice(0,10):day,publishedAt:Number.isFinite(epoch)?new Date(epoch).toISOString():null,why:'',catch:'Deal reported by linked publisher. Check retailer, exact model, stock, final price, coupon terms and shipping at source.',popular:Boolean(feed.popular),featured:Boolean(feed.featured),reportedBy:[{publisher:feed.group,url:link}],history:hist.slice(-365)};
   const existing=byLink.get(link);
   if(existing){
    existing.popular ||= incoming.popular;existing.featured ||= incoming.featured;
    if(!Number.isFinite(existing.price)&&Number.isFinite(incoming.price))existing.price=incoming.price;
   }else byLink.set(link,incoming);
   status.accepted++;
  }
  status.ok=true;
  console.log(feed.name,'items',status.items,'accepted',status.accepted);
 }catch(e){status.error=String(e.message||e).slice(0,150);console.warn(feed.name,'unavailable:',status.error);}
 sourceStatus.push(status);
}
let candidates=[...byLink.values()];
let usedFallback=false;
if(!sourceStatus.some(x=>x.ok)){
 candidates=previous.filter(x=>x&&x.id&&x.source&&x.name&&Date.parse(x.checked)>now.getTime()-4*86400000);
 usedFallback=true;
}
candidates.sort((a,b)=>Number(Boolean(b.popular))-Number(Boolean(a.popular))||Number(Boolean(b.featured))-Number(Boolean(a.featured))||(b.publishedAt||'').localeCompare(a.publishedAt||''));
const deduped=[],bucket=new Map();
let mergedDuplicates=0;
for(const d of candidates){
 const key=Number.isFinite(d.price)?String(Math.round(d.price*100)):'?';
 const bucketList=bucket.get(key)||[];
 const matching=bucketList.find(ex=>ex.source===d.source||sameDeal(ex,d));
 if(matching){
  matching.popular ||= d.popular;matching.featured ||= d.featured;
  const links=[...(matching.reportedBy||[]),...(d.reportedBy||[])];
  matching.reportedBy=[...new Map(links.map(x=>[x.publisher+'|'+x.url,x])).values()].slice(0,12);
  if(!matching.publishedAt||(d.publishedAt||'')>matching.publishedAt)matching.publishedAt=d.publishedAt;
  mergedDuplicates++;continue;
 }
 deduped.push(d);bucketList.push(d);bucket.set(key,bucketList);
}
deduped.sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
const counts={};
for(const d of deduped)for(const r of d.reportedBy||[{publisher:d.sourceType}])counts[r.publisher]=(counts[r.publisher]||0)+1;
const result={generatedAt:now.toISOString(),sourcesSucceeded:sourceStatus.filter(x=>x.ok).length,sourcesConfigured:FEEDS.length,sourceStatus,feedItems:deduped.length,rawItems:candidates.length,mergedDuplicates,sourceCounts:counts,sourceNotice:usedFallback?'All source feeds failed; previous snapshot shown with stale-data warning.':'Attributed deal leads from multiple independent publishers. Prices, live stock, expiry and merchant listing are not independently verified.',deals:deduped};
await mkdir('public/black-friday',{recursive:true});
await writeFile(OUT,JSON.stringify(result));
console.log('Holiday Radar:',deduped.length,'unique offers,',mergedDuplicates,'duplicates merged;',result.sourcesSucceeded+'/'+FEEDS.length,'RSS feeds succeeded');

// Discover and refresh the publisher's 2026 ad-scan directory once per build.
// No pretending a retailer sale landing page is a complete photographed scan.
const adSource='https://blackfriday.ltd/ads/';
const priorAds=await readJSON(PREVIOUS_ADS);
let ads=Array.isArray(priorAds?.ads)?priorAds.ads:[],adsChecked=false,adsError=null;
try{
 const html=await request(adSource,14000);
 const links=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
 const found=new Map();
 for(const [,href,raw] of links){
  const title=decode(raw);
  let link;try{link=new URL(href,adSource).href;}catch{continue;}
  if(!/^https:\/\/blackfriday\.ltd\/ads\/[^/?#]+\/?/i.test(link)||link===adSource)continue;
  if(!/2026|black friday|holiday|weekly|preview|sale|savings/i.test(title+' '+link))continue;
  const key=new URL(link).pathname.toLowerCase().replace(/\/+$/,'');
  const name=title.length>=5&&title.length<=170?title:key.split('/').pop().replace(/-2026.*$/,'').replace(/-/g,' ');
  if(/2025|2024|2023/.test(name)||/2025|2024|2023/.test(link))continue;
  if(!found.has(key))found.set(key,{name,url:link,source:'BlackFriday.LTD ad directory',sourceType:/ad|circular|scan|pages|book/i.test(name)?'Ad scan / preview':'Sale preview',year:2026,discoveredAt:day});
 }
 if(!found.size)throw Error('No current 2026 ad scans found');
 ads=[...found.values()].sort((a,b)=>a.name.localeCompare(b.name));
 adsChecked=true;
}catch(e){adsError=String(e.message||e).slice(0,150);console.warn('Ad index unavailable:',adsError);}
const adResult={generatedAt:now.toISOString(),source:adSource,checked:adsChecked,warning:adsChecked?null:'Ad directory fetch failed; previously discovered scans remain as links, not newly verified.',error:adsError,count:ads.length,ads};
await writeFile(ADS_OUT,JSON.stringify(adResult));
console.log('Holiday ad index:',ads.length,adsChecked?'discovered':'previously indexed');
