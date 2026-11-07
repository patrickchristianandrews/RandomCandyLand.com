/* Unwrapped · optional education/workflow around shared toy library.
 * Reading shelf requires deliberate actions and is saved only in this browser.
 * No requests, purchases, accounts, tracking, assumptions, or automatic sharing.
 */
(()=>{'use strict';
const host=document.getElementById('toy-library');if(!host)return;
const library=window.UnwrappedToyLibrary,extension=window.UnwrappedToyExpansion;
if(!library?.types?.length||!extension?.resource)return;
const $=id=>document.getElementById(id);
const make=(tag,text,klass)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(klass)n.className=klass;return n};
const KEY='unwrapped-private-toy-reading-shelf-v1';
const permitted=new Set(library.types.map(x=>x.id));
const modes=[['read','Learning only'],['fantasy','Fantasy only'],['discuss','Open to talking about it'],['no','Not for me']];
let stored={},compare=[],expanded=false,plan={};
try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [key,mode] of Object.entries(raw)){if(permitted.has(key)&&modes.some(x=>x[0]===mode))stored[key]=mode}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(stored))}catch{}}
function saved(){return library.types.filter(t=>Object.prototype.hasOwnProperty.call(stored,t.id)).map(x=>({...x,stance:stored[x.id]}))}
function status(message){const node=$('toy-explorer-status');if(node)node.textContent=message}
function copyText(t){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(t).then(()=>status('Discussion notes copied; choose whether and with whom to share them.')).catch(()=>status('Clipboard unavailable. Your notes remain visible here.'));
 const a=make('textarea');a.value=t;document.body.append(a);a.select();try{document.execCommand('copy');status('Discussion notes copied.')}catch{status('Copying is unavailable.')}a.remove();
}
function shelf(){
 const area=$('toy-reading-list');if(!area)return;area.replaceChildren();
 const all=saved(),heading=make('p',all.length?'Your privately saved reading topics ('+all.length+'). Saving does not mean you want to do them.':'Nothing saved yet. Open a guide and choose “Save to my reading shelf” if it interests you.','toy-shelf-desc');area.append(heading);
 for(const t of all){
  const article=make('article',undefined,'toy-shelf-card');
  const h=make('strong',t.name),p=make('p',t.summary),label=make('label','My interest in this topic: '),select=make('select');
  select.dataset.toyMode=t.id;select.setAttribute('aria-label','My stance toward '+t.name);
  for(const [key,caption] of modes){const opt=make('option',caption);opt.value=key;opt.selected=key===t.stance;select.append(opt)}
  label.append(select);
  const actions=make('div',undefined,'toy-shelf-actions');
  const compareBtn=make('button','Compare','btn alt');compareBtn.type='button';compareBtn.dataset.toyAddCompare=t.id;
  const removeBtn=make('button','Remove','btn alt');removeBtn.type='button';removeBtn.dataset.toyRemove=t.id;
  actions.append(compareBtn,removeBtn);article.append(h,p,label,actions);area.append(article);
 }
 const clear=$('toy-clear-shelf');if(clear)clear.hidden=!all.length;
}
function comparison(){
 const root=$('toy-comparison');if(!root)return;root.replaceChildren();
 const chosen=compare.map(id=>library.find(id)).filter(Boolean);
 const heading=make('div',undefined,'toy-compare-heading');
 heading.append(make('p',chosen.length?chosen.length+' of 3 topics selected. Compare suitability, care and communication—not a ranking of what someone should do.':'Choose up to three categories in their detail panels or saved reading shelf.','toy-shelf-desc'));
 const clear=make('button','Clear comparison','btn alt');clear.type='button';clear.dataset.toyClearCompare='true';clear.disabled=!chosen.length;heading.append(clear);root.append(heading);
 if(!chosen.length)return;
 const table=make('table',undefined,'toy-compare-table'),thead=make('thead'),tr=make('tr');tr.append(make('th','Consideration'));
 for(const t of chosen)tr.append(make('th',t.name));thead.append(tr);table.append(thead);
 const tbody=make('tbody');
 const topics=[
  ['Type',t=>t.group],
  ['What it does',t=>t.summary],
  ['Penis / prostate anatomy',t=>{const x=library.bodyUses(t.id).male;return (library.fitLabels[x.fit]||x.fit)+': '+x.note}],
  ['Vulva / vagina anatomy',t=>{const x=library.bodyUses(t.id).female;return (library.fitLabels[x.fit]||x.fit)+': '+x.note}],
  ['Shared use',t=>library.bodyUses(t.id).together],
  ['Safety',t=>t.safety],
  ['Cleaning',t=>t.care||'Follow the specific product and material care instructions.'],
  ['Conversation',t=>t.talk||'Would this only be reading material, or something to discuss without pressure?']
 ];
 for(const [label,read] of topics){const row=make('tr');row.append(make('th',label));chosen.forEach(t=>row.append(make('td',read(t))));tbody.append(row)}
 table.append(tbody);const scroll=make('div',undefined,'toy-compare-scroller');scroll.append(table);root.append(scroll);
}
function guides(){
 const root=$('toy-education-hub');if(!root)return;root.replaceChildren();
 const cards=make('div',undefined,'toy-education-grid');
 for(const entry of extension.resource.guides){
  const item=make('details',undefined,'toy-education-card');
  item.append(make('summary',entry.title),make('p',entry.body));cards.append(item);
 }root.append(cards);
 const references=make('div',undefined,'toy-education-sources');
 references.append(make('strong','Evidence and safety references'));
 for(const source of extension.resource.sources){const a=make('a',source.label+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.append();references.append(a)}
 root.append(references);
}
function checklist(){
 const root=$('toy-checklist');if(!root)return;root.replaceChildren();
 for(const [index,question] of extension.resource.checklist.entries()){
  const label=make('label',undefined,'toy-checkline'),box=make('input');box.type='checkbox';box.dataset.toyCheck=String(index);box.checked=Boolean(plan[index]);label.append(box,make('span',question));root.append(label);
 }
 updateChecklist();
}
function updateChecklist(){
 const count=Object.values(plan).filter(Boolean).length,all=extension.resource.checklist.length;
 const statusNode=$('toy-check-status');if(statusNode)statusNode.textContent=count+'/'+all+' points considered · this checklist is not a safety certification.';
}
function openIdea(){
 document.querySelector('[data-tab="ideas"]')?.click();
 const select=$('mood');if(select)select.value='toys';
 const out=$('ideaResult');
 if(out){out.scrollIntoView({block:'nearest',behavior:'smooth'});}
}
function makeDiscussionText(){
 const lines=['Toy Guide · private conversation notes','These are only topics I deliberately saved for reading. Nothing implies consent or an invitation.'];
 for(const t of saved()){
  lines.push('- '+t.name+' ('+(modes.find(x=>x[0]===t.stance)?.[1]||'Learning only')+')');
  if(t.talk)lines.push('  One question: '+t.talk);
 }
 lines.push('Ask whether a conversation is welcome. Respect fantasy-only, not-for-me and the choice to stop.');
 return lines.join('\n');
}
host.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 const quick=button.closest('[data-toy-quick-group]');
 if(quick){
  const group=quick.dataset.toyQuickGroup,filter=$('toy-filter');
  if(filter){filter.value=group;filter.dispatchEvent(new Event('change',{bubbles:true}));}
  $('.toy-goal-shortcuts button').forEach(b=>b.setAttribute('aria-pressed',String(b===quick)));
  $('toy-grid')?.scrollIntoView({behavior:'smooth',block:'start'});return;
 }
 const add=button.dataset.toySave;
 if(add&&permitted.has(add)){stored[add]=stored[add]||'read';save();shelf();status('Added to private reading shelf. No partner sharing is enabled.');return}
 const remove=button.dataset.toyRemove;
 if(remove&&permitted.has(remove)){delete stored[remove];save();shelf();status('Removed from your saved reading shelf.');return}
 const compareId=button.dataset.toyAddCompare;
 if(compareId&&permitted.has(compareId)){
  if(compare.includes(compareId)){status('This category is already in the comparison.');return}
  if(compare.length===3){status('Comparison is limited to three categories. Clear it to choose more.');return}
  compare.push(compareId);comparison();status('Added to the comparison: '+library.find(compareId).name+'.');return;
 }
 if(button.dataset.toyClearCompare){compare=[];comparison();status('Comparison cleared.');return}
 if(button.id==='toy-clear-shelf'){if(!window.confirm('Clear your privately saved toy reading topics?'))return;stored={};save();shelf();status('Your local reading shelf was cleared.');return}
 if(button.id==='toy-copy-questions'){void copyText(makeDiscussionText());return}
 if(button.id==='toy-go-ideas'){openIdea();return}
 if(button.id==='toy-reset-checklist'){plan={};checklist();return}
});
host.addEventListener('change',e=>{
 if(e.target.dataset.toyMode){const key=e.target.dataset.toyMode;if(permitted.has(key)&&stored[key]&&modes.some(x=>x[0]===e.target.value)){stored[key]=e.target.value;save();shelf();status('Reading stance updated privately. It does not change your original quiz answers.')}return}
 if(e.target.dataset.toyCheck!==undefined){plan[e.target.dataset.toyCheck]=e.target.checked;updateChecklist()}
});
window.UnwrappedToyExplorer=Object.freeze({saved,showAll:()=>expanded,toggleAll:()=>{expanded=!expanded;host.dispatchEvent(new Event('unwrapped-toy-list-changed'));return expanded},comparison:()=>compare.slice(),guideCount:extension.resource.guides.length});
shelf();comparison();guides();checklist();
})();
