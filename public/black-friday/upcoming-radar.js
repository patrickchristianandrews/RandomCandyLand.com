/* Holiday Deal Radar. Official-announcement previews; no guessed prices or stock. */
(()=>{
'use strict';
const catalog=document.getElementById('catalog'),isCatalog=!!catalog;
const anchor=catalog||document.querySelector('.hot-section');
if(!anchor||document.getElementById('coming-soon'))return;
const style=document.createElement('style');style.textContent="\n#coming-soon{margin:13px 0;padding:11px;background:#21172e;border:1px solid #6c507b;border-radius:13px;color:#fff2fa}\n#coming-soon *{box-sizing:border-box}#coming-soon h2{font-size:1.15rem;margin:0 0 3px}#coming-soon p{margin:0;font-size:.74rem;color:#dfc9e5}\n#coming-soon .radar-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:7px}\n#coming-soon .radar-total,#coming-soon .radar-count{color:#e2c8ed;font-weight:700;font-size:.7rem}\n#coming-soon .radar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:9px 0}\n#coming-soon .radar-group{background:#2d203c;border:1px solid #5d456b;border-radius:10px;padding:9px;min-width:0}\n#coming-soon .radar-group h3{font-size:.9rem;margin:0 0 2px}\n#coming-soon .radar-group .hint{font-size:.69rem;line-height:1.35;color:#d8c1dc;margin:0 0 7px}\n#coming-soon .radar-list{display:grid;gap:5px;max-height:480px;overflow:auto;overscroll-behavior:contain}\n#coming-soon .radar-deal{background:#392a47;border:1px solid #5d496d;border-radius:7px;padding:7px}\n#coming-soon .radar-deal a{font-weight:750;font-size:.79rem;line-height:1.3;color:#fff4fc;display:block;text-decoration:none}\n#coming-soon .radar-deal a:hover{text-decoration:underline}\n#coming-soon .radar-info{display:flex;flex-wrap:wrap;gap:2px 7px;font-size:.67rem;color:#d4c0da;margin-top:4px}\n#coming-soon .radar-info strong{color:#b6ffd7}\n#coming-soon .radar-disclaimer{font-size:.67rem;color:#d2bbdb}\n#coming-soon .radar-more{display:inline-block;margin-top:6px;font-size:.72rem}\n#coming-soon .radar-blank{padding:8px;background:#33243e;border-radius:7px}\n@media(max-width:830px){#coming-soon .radar-grid{grid-template-columns:1fr}#coming-soon .radar-list{max-height:280px}#coming-soon{padding:9px}}\nhtml[data-deals-embed=\"true\"] #coming-soon,html[data-deals-hot=\"true\"] #coming-soon{display:none}\n";document.head.appendChild(style);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n):'Price TBA';
const group=(id,title,hint)=>'<section class="radar-group"><h3>'+title+' <span class="radar-count" id="'+id+'-count"></span></h3><p class="hint">'+hint+'</p><div class="radar-list" id="'+id+'"><p class="radar-blank">Loading confirmed previews…</p></div></section>';
const sec=document.createElement('section');sec.id='coming-soon';sec.setAttribute('aria-labelledby','coming-soon-title');
sec.innerHTML='<div class="radar-head"><div><h2 id="coming-soon-title">◷ Coming Soon: Black Friday &amp; Cyber Monday Deals</h2><p>Announced products, scheduled drops and retailer sale previews; published prices shown where available.</p></div><span id="radar-total" class="radar-total" role="status">Checking announcements…</span></div><div class="radar-grid">'+
group('radar-next','⏱ Next 24 hours','Known times; dates without published hours are labeled time TBA.')+
group('radar-black','🛍 Black Friday · Nov 27','Announced launches and offers scheduled for this day.')+
group('radar-cyber','💻 Cyber Monday · Nov 30','Announced online drops and continuing promotions.')+
'</div><p class="radar-disclaimer">Each item links to its source. Time TBA does not confirm a specific launch hour. Preview prices do not guarantee checkout price or stock. New announcements are added when published.</p>'+
(isCatalog?'':'<a class="radar-more" href="/black-friday/all/?view=upcoming#coming-soon">See all upcoming deals ↗</a>');
anchor.parentNode.insertBefore(sec,anchor);
if(isCatalog)window.dispatchEvent(new Event('rcl-upcoming-ready'));
let previews=[],readTime=0;
const keyDay=date=>{const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const g=k=>p.find(x=>x.type===k)?.value||'';return g('year')+'-'+g('month')+'-'+g('day');};
const startOf=d=>{if(!d.startsAt)return null;const raw=String(d.startsAt),dayOnly=/^\d{4}-\d{2}-\d{2}$/.test(raw),ms=Date.parse(dayOnly?raw+'T00:00:00-05:00':raw);return Number.isFinite(ms)?{when:new Date(ms),dayOnly}:null;};
function nextStart(d){
if(!/^\d{2}:\d{2}$/.test(d.dailyDropET||''))return startOf(d);
const now=new Date();let date=keyDay(now),ms=Date.parse(date+'T'+d.dailyDropET+':00-05:00');
if(ms<=now.getTime()){date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10);ms=Date.parse(date+'T'+d.dailyDropET+':00-05:00');}
return date>String(d.endsAt||'').slice(0,10)?null:{when:new Date(ms),dayOnly:false};
}
window.__rclUpcomingNextStart=d=>{const t=nextStart(d);return t?{date:t.when,dayOnly:t.dayOnly}:null;};
function onDay(d,day){
if(Array.isArray(d.saleDays)&&d.saleDays.includes(day==='2026-11-27'?'black':'cyber'))return true;
const from=String(d.startsAt||'').slice(0,10),to=String(d.endsAt||d.startsAt||'').slice(0,10);
return !!from&&from<=day&&day<=to;
}
function label(d,day){
if(day&&String(d.startsAt||'').slice(0,10)<day)return 'Sale window includes '+(day.endsWith('27')?'Nov 27':'Nov 30');
const t=day?startOf(d):nextStart(d);if(!t)return 'Time TBA';
return t.when.toLocaleDateString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric'})+
(t.dayOnly?' · time TBA':' · '+t.when.toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET');
}
function row(d,day){return '<article class="radar-deal"><a href="'+esc(d.source)+'" target="_blank" rel="noopener noreferrer">'+esc(d.name)+' ↗</a><div class="radar-info"><span>'+esc(d.store||'Retailer')+' · '+esc(d.category||'Offers')+'</span><strong>'+fmt(d.price)+(Number.isFinite(d.price)?' · announced':'')+'</strong><span>'+esc(label(d,day))+'</span></div></article>';}
function drawList(id,data,day){
document.getElementById(id+'-count').textContent='('+data.length+')';
document.getElementById(id).innerHTML=data.length?data.map(d=>row(d,day)).join(''):'<p class="radar-blank">No other confirmed releases in this window yet.</p>';
}
function draw(){
let all=[...previews];
if(isCatalog){try{if(typeof deals!=='undefined')all=all.concat(deals.filter(d=>d.announced===true&&d.startsAt));}catch{}}
const unique=[...new Map(all.filter(d=>d&&d.announced===true&&d.startsAt&&/^https:\/\//.test(d.source||'')).map(d=>[d.id,d])).values()];
const now=new Date(),next=new Date(now.getTime()+86400000);
const soon=unique.filter(d=>{const t=nextStart(d);return t&&t.when>now&&t.when<=next;});
const black=unique.filter(d=>onDay(d,'2026-11-27')),cyber=unique.filter(d=>onDay(d,'2026-11-30'));
const sort=(a,b)=>String(a.startsAt).localeCompare(String(b.startsAt))||a.name.localeCompare(b.name);
drawList('radar-next',soon.sort(sort));
drawList('radar-black',black.sort(sort),'2026-11-27');
drawList('radar-cyber',cyber.sort(sort),'2026-11-30');
document.getElementById('radar-total').textContent=unique.length+' sourced previews';
}
async function load(){
try{
const res=await fetch('/black-friday/upcoming-deals.json?refresh='+Date.now(),{cache:'no-store'});
if(!res.ok)throw Error('Unavailable');
const payload=await res.json();if(!Array.isArray(payload.deals))throw Error('Invalid');
previews=payload.deals.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&d.announced===true&&/^https:\/\//.test(d.source||''));
window.__rclUpcomingDeals=previews;
if(isCatalog){try{const ids=new Set(deals.map(d=>d.id));for(const d of previews){if(!ids.has(d.id)){deals.push(d);ids.add(d.id);}}rebuildOptions();render();}catch{}}
readTime=Date.now();
}catch{document.getElementById('radar-total').textContent=previews.length?previews.length+' previews · update temporarily unavailable':'Preview index temporarily unavailable';}
draw();
}
window.__rclUpcomingRender=draw;draw();load();
setInterval(()=>{if(!document.hidden){draw();if(Date.now()-readTime>300000)load();}},60000);
})();
