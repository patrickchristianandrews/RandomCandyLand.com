/* Ad validity is separate from a successful directory fetch. Dates use US Eastern days. */
(function(){
 const day=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now||new Date());
 function status(ad,now){
  const today=day(now),end=String(ad?.endsAt||'').slice(0,10),start=String(ad?.startsAt||'').slice(0,10);
  if(ad?.status==='expired'||(end&&end<today)||/\bended\b/i.test(ad?.name||''))return 'expired';
  if(start&&start>today)return 'upcoming';
  if(end&&end>=today)return 'current';
  return 'undated';
 }
 window.RCLAdStatus=Object.freeze({status,day});
})();
