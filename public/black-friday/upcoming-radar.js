/* Keep upcoming offer data available to the catalog without the removed
 * Coming Soon preview panel or its internal scrolling lists. */
(()=>{
'use strict';
const isCatalog=!!document.getElementById('catalog');
const keyDay=date=>{
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=k=>parts.find(x=>x.type===k)?.value||'';
  return get('year')+'-'+get('month')+'-'+get('day');
};
const startOf=d=>{
  if(!d.startsAt)return null;
  const raw=String(d.startsAt),dayOnly=/^\d{4}-\d{2}-\d{2}$/.test(raw);
  const ms=Date.parse(dayOnly?raw+'T00:00:00-05:00':raw);
  return Number.isFinite(ms)?{when:new Date(ms),dayOnly}:null;
};
function nextStart(d){
  if(!/^\d{2}:\d{2}$/.test(d.dailyDropET||''))return startOf(d);
  const now=new Date();let date=keyDay(now),ms=Date.parse(date+'T'+d.dailyDropET+':00-05:00');
  if(ms<=now.getTime()){
    date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10);
    ms=Date.parse(date+'T'+d.dailyDropET+':00-05:00');
  }
  return date>String(d.endsAt||'').slice(0,10)?null:{when:new Date(ms),dayOnly:false};
}
window.__rclUpcomingNextStart=d=>{
  const start=nextStart(d);
  return start?{date:start.when,dayOnly:start.dayOnly}:null;
};
window.__rclUpcomingRender=()=>{};
async function refreshUpcomingData(){
  try{
    const response=await fetch('/black-friday/upcoming-deals.json?refresh='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('Upcoming index unavailable');
    const payload=await response.json();
    if(!Array.isArray(payload.deals))throw Error('Invalid upcoming data');
    const previews=payload.deals.filter(d=>d&&typeof d.id==='string'&&typeof d.name==='string'&&d.announced===true&&/^https:\/\//.test(d.source||''));
    window.__rclUpcomingDeals=previews;
    if(isCatalog){
      try{
        const ids=new Set(deals.map(d=>d.id));
        for(const d of previews){
          if(!ids.has(d.id)){deals.push(d);ids.add(d.id);}
        }
        rebuildOptions();render();
      }catch{}
    }
  }catch{
    // Preserve any previously loaded catalog offers if the update is unavailable.
  }
}
refreshUpcomingData();
setInterval(()=>{if(!document.hidden)refreshUpcomingData();},300000);
})();
