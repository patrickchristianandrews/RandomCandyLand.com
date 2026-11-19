/**
 * Preserve previously indexed holiday offers when an RSS publisher rotates its feed.
 * A missing RSS headline is NOT evidence that an offer ended.
 * Retained offers are marked "not recently reported" until reported again; neither
 * a publisher mention nor a working URL verifies retailer stock or checkout price.
 */
export function hasConfirmedEnded(deal, now=Date.now()) {
  if (!deal || typeof deal !== 'object') return true;
  if (/^(ended|expired|inactive|removed|withdrawn|sold.out|out.of.stock)$/i.test(String(deal.status||''))) return true;
  const end=deal.endsAt ?? deal.expiresAt ?? deal.expirationDate;
  if (!end) return false;
  const text=String(end).trim();
  const when=Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(text)?text+'T23:59:59-05:00':text);
  return Number.isFinite(when) && now>when;
}
export function retainDeals(current, previous, checkedAt, normaliseURL=(url)=>url) {
  const now=Date.parse(checkedAt);
  const priorByUrl=new Map();
  for (const d of previous||[]) {
    const key=normaliseURL(d?.source);
    if (key && d?.name && d?.id && !hasConfirmedEnded(d,now)) priorByUrl.set(key,d);
  }
  const output=[];
  const seen=new Set();
  for (const d of current||[]) {
    const key=normaliseURL(d?.source);
    if (!key || !d?.name || !d?.id || hasConfirmedEnded(d,now)) continue;
    const old=priorByUrl.get(key);
    seen.add(key);
    output.push({
      ...d,
      firstSeenAt:old?.firstSeenAt||old?.publishedAt||old?.checked||checkedAt,
      lastSeenAt:checkedAt,
      feedStatus:'recently_reported'
    });
  }
  let retainedCount=0;
  for (const [key,old] of priorByUrl) {
    if (seen.has(key)) continue;
    output.push({
      ...old,
      firstSeenAt:old.firstSeenAt||old.publishedAt||old.checked||checkedAt,
      lastSeenAt:old.lastSeenAt||old.publishedAt||old.checked||checkedAt,
      feedStatus:'not_recently_reported'
    });
    retainedCount++;
  }
  return { deals:output, retainedCount, refreshedCount:output.length-retainedCount };
}
