/* Original RandomCandyLand Amazon Deal Hunter 2026.
   Builds transparent Amazon search URLs. No scraped prices, no fabricated discounts.
   The pct-off parameter is undocumented and Amazon can ignore it. */
(()=>{'use strict';
const REGIONS={
 US:{domain:'www.amazon.com',symbol:'$',label:'United States · USD'},
 CA:{domain:'www.amazon.ca',symbol:'CA$',label:'Canada · CAD'},
 UK:{domain:'www.amazon.co.uk',symbol:'£',label:'United Kingdom · GBP'},
 DE:{domain:'www.amazon.de',symbol:'€',label:'Germany · EUR'},
 FR:{domain:'www.amazon.fr',symbol:'€',label:'France · EUR'},
 IT:{domain:'www.amazon.it',symbol:'€',label:'Italy · EUR'},
 ES:{domain:'www.amazon.es',symbol:'€',label:'Spain · EUR'},
 JP:{domain:'www.amazon.co.jp',symbol:'¥',label:'Japan · JPY'},
 IN:{domain:'www.amazon.in',symbol:'₹',label:'India · INR'},
 AU:{domain:'www.amazon.com.au',symbol:'AU$',label:'Australia · AUD'},
 BR:{domain:'www.amazon.com.br',symbol:'R$',label:'Brazil · BRL'},
 MX:{domain:'www.amazon.com.mx',symbol:'MX$',label:'Mexico · MXN'}
};
const CATEGORY=[
 ['aps','All departments'],['electronics','Electronics & gadgets'],['computers','Computers & tablets'],
 ['fashion','Fashion & shoes'],['beauty','Beauty & personal care'],['home-garden','Home & household'],
 ['kitchen','Kitchen & cooking'],['toys-and-games','Toys & games'],['sporting','Sports & outdoors'],
 ['tools','Tools & DIY'],['pet-supplies','Pets'],['grocery','Groceries'],
 ['automotive','Automotive'],['office-products','Office supplies'],['video-games','Video games']
];
const SORT=[
 ['relevanceblender','Featured'],['price-asc-rank','Lowest price'],
 ['price-desc-rank','Highest price'],['review-rank','Customer reviews'],['date-desc-rank','Newest arrivals']
];
const $=(root,query)=>root.querySelector(query);
const options=(items,selected)=>items.map(([value,label])=>'<option value="'+value+'"'+(value===selected?' selected':'')+'>'+label+'</option>').join('');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function read(form){
 const get=name=>form.elements.namedItem(name);
 const v=name=>String(get(name)?.value||'').trim();
 return {term:v('term'),country:v('country'),category:v('category'),min:v('min'),max:v('max'),
  low:v('low'),high:v('high'),sort:v('sort'),prime:!!get('prime')?.checked};
}
function validate(d){
 if(!/^[A-Z]{2}$/.test(d.country)||!REGIONS[d.country])return 'Select a supported Amazon marketplace.';
 if(d.term.length>140)return 'Use fewer than 140 characters in your search.';
 if(d.term.length<2)return 'Enter a product, brand, or category to search Amazon.';
 if(!CATEGORY.some(([id])=>id===d.category))return 'Select a department.';
 if(!SORT.some(([id])=>id===d.sort))return 'Choose a sorting option.';
 const min=Number(d.min),max=Number(d.max);
 if(!Number.isInteger(min)||min<0||min>90||!Number.isInteger(max)||max<1||max>100||min>=max)return 'Choose a valid discount range, with the maximum above the minimum.';
 for(const k of ['low','high'])if(d[k]!==''&&(!/^\d+(?:\.\d{1,2})?$/.test(d[k])||+d[k]>1e7))return 'Use nonnegative prices with at most two decimal places.';
 if(d.low!==''&&d.high!==''&&Number(d.low)>Number(d.high))return 'Maximum price must be equal to or above minimum price.';
 return '';
}
function searchUrl(d){
 const base='https://'+REGIONS[d.country].domain+'/s';
 const url=new URL(base);
 url.searchParams.set('k',d.term);
 if(d.category!=='aps')url.searchParams.set('i',d.category);
 if(+d.min>0){url.searchParams.set('pct-off',String(Number(d.min))+'-'+(+d.max<100?String(Number(d.max)):''));
 }else if(+d.max<100)url.searchParams.set('pct-off','0-'+String(Number(d.max)));
 if(d.low!=='')url.searchParams.set('low-price',String(Number(d.low)));
 if(d.high!=='')url.searchParams.set('high-price',String(Number(d.high)));
 if(d.sort!=='relevanceblender')url.searchParams.set('s',d.sort);
 if(d.prime)url.searchParams.set('rh','p_85:2470955011');
 return url.href;
}
function regionOptions(){return options(Object.entries(REGIONS).map(([key,val])=>[key,val.label]),'US');}
function structure(full){
 return '<section class="af-panel '+(full?'af-expanded':'af-mini')+'" aria-label="Amazon discounted product search">'+
 '<div class="af-panel-top"><div><span class="af-eyebrow">2026 DEAL DISCOVERY · AMAZON</span><h2>🛒 Amazon Deal Hunter</h2>'+
 '<p>Search for markdowns on Amazon with custom filters. Open live Amazon results in one click.</p></div>'+
 (!full?'<a class="af-open-full" href="/black-friday/amazon-discount-finder/">Advanced search ↗</a>':'')+'</div>'+
 '<form class="af-form" novalidate>'+
 '<label class="af-term">Product or brand<input type="search" name="term" required minlength="2" maxlength="140" placeholder="e.g. Sony headphones, LEGO, Dyson" autocomplete="off"></label>'+
 '<label>Marketplace<select name="country">'+regionOptions()+'</select></label>'+
 '<label>Department<select name="category">'+options(CATEGORY,'aps')+'</select></label>'+
 '<label>Discount from<select name="min">'+options([[0,'Any'],[10,'10%'],[20,'20%'],[25,'25%'],[30,'30%'],[40,'40%'],[50,'50%'],[60,'60%'],[70,'70%'],[80,'80%'],[90,'90%']].map(([v,t])=>[String(v),t]),'50')+'</select></label>'+
 '<label>To<select name="max">'+options([[100,'100%+'],[25,'25%'],[40,'40%'],[50,'50%'],[60,'60%'],[70,'70%'],[75,'75%'],[80,'80%'],[90,'90%'],[95,'95%']].map(([v,t])=>[String(v),t]),'100')+'</select></label>'+
 '<details class="af-advanced" '+(full?'open':'')+'><summary>More filters · price, sort & Prime</summary><div class="af-advanced-grid">'+
 '<label>Minimum price <span data-af-currency>$</span><input type="number" name="low" min="0" step=".01" placeholder="No minimum"></label>'+
 '<label>Maximum price <span data-af-currency>$</span><input type="number" name="high" min="0" step=".01" placeholder="Any price"></label>'+
 '<label>Sort by<select name="sort">'+options(SORT,'relevanceblender')+'</select></label>'+
 '<label class="af-prime"><input type="checkbox" name="prime"> Prime-eligible items <small>(US filter may change)</small></label>'+
 '</div></details>'+
 '<div class="af-actions"><button type="submit" class="af-submit">Find discounts on Amazon ↗</button>'+
 '<a class="af-preview" data-af-preview href="https://www.amazon.com/" target="_blank" rel="noopener noreferrer">Open Amazon search ↗</a>'+
 '</div><p class="af-status" role="status" aria-live="polite" data-af-status>Enter a search term and set your desired discount.</p></form>'+
 '<div class="af-quick"><span>Try:</span>'+
 [['wireless headphones','Headphones'],['lego sets','LEGO'],['coffee maker','Coffee makers'],['robot vacuum','Robot vacuums'],['smart tv','TVs'],['running shoes','Shoes']].map(([q,label])=>'<button type="button" data-af-preset="'+esc(q)+'">'+esc(label)+'</button>').join('')+'</div>'+
 '<div class="af-shortcuts">'+
 '<a href="https://www.amazon.com/gp/goldbox" target="_blank" rel="noopener noreferrer">⚡ Today’s Deals</a>'+
 '<a href="https://www.amazon.com/coupons" target="_blank" rel="noopener noreferrer">✂ Coupons</a>'+
 '<a href="https://www.amazon.com/outlet" target="_blank" rel="noopener noreferrer">📦 Outlet</a>'+
 '<a href="https://www.amazon.com/amazon-resale" target="_blank" rel="noopener noreferrer">♻ Resale</a>'+
 '</div><p class="af-disclaimer">Amazon’s percent-off search is <strong>unofficial</strong> and can be ignored or changed. Percentages compare against Amazon’s displayed reference prices—not verified historical lows. Check model, coupons, shipping and final price at checkout. No purchase or price data is collected by this tool.</p>'+
 '</section>';
}
function install(node){
 const full=node.dataset.mode==='full';
 node.innerHTML=structure(full);
 const form=$(node,'.af-form');
 const result=$(node,'[data-af-status]');
 const preview=$(node,'[data-af-preview]');
 const update=()=>{
  const d=read(form);
  const region=REGIONS[d.country];
  node.querySelectorAll('[data-af-currency]').forEach(el=>el.textContent=region?.symbol||'$');
  const issue=validate(d);
  if(issue){result.textContent=issue;result.classList.add('af-warning');preview.href='https://'+(region?.domain||'www.amazon.com')+'/';preview.setAttribute('aria-disabled','true');return null;}
  const url=searchUrl(d);preview.href=url;preview.removeAttribute('aria-disabled');
  result.classList.remove('af-warning');
  result.textContent='Ready · '+d.min+'–'+(d.max==='100'?'100+':d.max)+'% requested · '+region.label+'. Amazon shows the actual matching results.';
  return url;
 };
 form.addEventListener('input',update);form.addEventListener('change',update);
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const url=update();if(!url){form.querySelector('[name=term]').focus();return;}
  // Synchronous navigation from a genuine click / Enter press.
  const anchor=document.createElement('a');anchor.href=url;anchor.target='_blank';anchor.rel='noopener noreferrer';
  anchor.click();
 });
 node.addEventListener('click',event=>{
  const btn=event.target.closest('[data-af-preset]');if(!btn)return;
  form.elements.namedItem('term').value=btn.dataset.afPreset;
  update();
  const go=$(node,'.af-submit');go.focus();
 });
 const current=new URLSearchParams(location.search);
 if(full&&current.has('q'))form.elements.namedItem('term').value=(current.get('q')||'').slice(0,140);
 update();
}
document.querySelectorAll('[data-amazon-finder]').forEach(install);
if(document.querySelector('#af-recent'))loadRecent();
async function loadRecent(){
 const root=document.querySelector('#af-recent');if(!root)return;
 const h=s=>esc(s);
 try{
  const response=await fetch('/black-friday/live-feed.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Feed unavailable');
  const body=await response.json();
  const list=(Array.isArray(body.deals)?body.deals:[]).filter(d=>d&&
   /amazon(?:\.com)?|woot/i.test([d.store,d.name].join(' '))&&/^https:\/\//.test(d.source||''));
  list.sort((a,b)=>String(b.publishedAt||b.checked||'').localeCompare(String(a.publishedAt||a.checked||'')));
  const selected=list.slice(0,8);
  root.innerHTML=selected.length?selected.map(d=>{
   const price=Number(d.price);
   const formatted=Number.isFinite(price)&&price>0?'$'+price.toFixed(2):'Price not confirmed';
   return '<article class="af-reported-card"><small>'+h(d.sourceType||'Deal report')+' · '+h(d.checked||'')+'</small><strong>'+h(d.name)+'</strong><div><b>'+h(formatted)+'</b><a href="'+h(d.source)+'" target="_blank" rel="noopener noreferrer">Read source ↗</a></div></article>';
  }).join(''):'<p>No Amazon-related leads are currently indexed. Use the search above to browse Amazon directly.</p>';
 }catch{root.innerHTML='<p>The deal-report feed is unavailable right now. The direct Amazon search above still works.</p>';}
}
})();
