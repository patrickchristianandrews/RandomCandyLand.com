/* Selective, local-only After Dark partner-result sharing.
 * Never exports full quiz state or accesses private browser storage for readers.
 * The only shared material is the individually opted-in, visible preview.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const canonical=()=>window.AfterDarkCanonicalReport?.buildData?.();
const fmt='afterdark-partner-results-v1';
const opt={interests:new Map(),themes:new Set(),answers:new Set(),name:'',intro:''};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n};
const button=(text,handler,cls='btn alt')=>{const b=el('button',text,cls);b.type='button';b.onclick=handler;return b};
const check=(text,active,handler)=>{const label=el('label',undefined,'ps-check'),input=el('input');input.type='checkbox';input.checked=Boolean(active);input.onchange=()=>handler(input.checked);label.append(input,document.createTextNode(text));return label};
const status=text=>{const n=$('partner-share-status');if(n)n.textContent=text};
const pure=s=>String(s||'').trim();
const limit=(s,n)=>pure(s).slice(0,n);
const friendlySource=x=>x.directSelection===2?'You marked Interested':x.directSelection===1?'You marked Curious':'Suggested by quiz themes (not a declared preference)';
const questionTitle=(q,k)=> (k==='direct'?'Sexual preferences · ':'Psychology · ')+'Q'+q.number+': '+q.question;
const safeQuestion=q=>({question:limit(q.question,240),number:q.number,selection:q.selected.map(a=>limit(a.text,160)).slice(0,9)});
const validText=(s,n=600)=>typeof s==='string'&&s.length<=n;
const SHARE_MAX_BYTES=6800;
let lastPack=null;
function shareData(){
 const d=canonical();
 return d&&Array.isArray(d.interests)&&Array.isArray(d.direct?.questions)&&Array.isArray(d.psych?.questions)?d:null;
}
function notesFor(id){
 const n=window.InterestNotebook?.getPersonalNote?.(id);
 return n&&typeof n==='object'?n:{};
}
function interestEntry(x,settings){
 const result={title:limit(x.name,100),category:limit(x.category,80),status:limit(friendlySource(x),85),
  description:limit(x.description,210)};
 if(settings.score)result.score=Number(x.illustrativeFit);
 if(settings.psych){
  result.psychology=limit(x.psychology,400);
  result.themes=x.themeTags.slice(0,4).map(t=>({label:limit(shareData()?.lenses?.[t]?.label||t,90),meaning:limit(shareData()?.lenses?.[t]?.detail,230)}));
 }
 if(settings.suggestions)result.suggestions=x.activities.slice(0,3).map(v=>limit(v,180));
 if(settings.discuss)result.discussion='Ask which part sounds meaningful, whether it belongs in fantasy or real life, what is off-limits, and whether both people want to discuss it further.';
 const own=notesFor(x.id),mine={};
 for(const key of ['meaning','boundary','request'])if(settings[key]&&own[key])mine[key]=limit(own[key],450);
 if(Object.keys(mine).length)result.personalNotes=mine;
 return result;
}
function buildPack(){
 const d=shareData();if(!d)return{error:'Quiz results are unavailable. Complete or resume a quiz first.'};
 const interests=d.interests.filter(x=>opt.interests.has(x.id)).slice(0,6).map(x=>interestEntry(x,opt.interests.get(x.id)));
 const themes=Object.entries(d.axes.combined).filter(([tag,val])=>opt.themes.has(tag)&&val>0&&d.lenses[tag])
  .slice(0,6).map(([tag])=>({label:limit(d.lenses[tag].label,90),description:limit(d.lenses[tag].detail,250)}));
 const answers=[];
 for(const part of ['direct','psych'])for(const q of d[part].questions){
  if(!opt.answers.has(part+':'+q.number)||!q.selected.length)continue;
  answers.push({...safeQuestion(q),quiz:part==='direct'?'Sexual Preferences Quiz':'Psychology Quiz'});
 }
 if(interests.length>6||themes.length>6||answers.length>5)return{error:'Choose at most 6 interests, 6 themes and 5 answer excerpts.'};
 if(!interests.length&&!themes.length&&!answers.length)return{error:'Select at least one interest, psychology theme, or answer before sharing.'};
 const pack={format:fmt,version:1,from:limit(opt.name,55),intro:limit(opt.intro,350),interests,themes,answers};
 const bytes=new TextEncoder().encode(JSON.stringify(pack)).length;
 if(bytes>SHARE_MAX_BYTES)return{error:'This selection is too long for a reliable phone link. Remove some items or notes (currently '+bytes+' bytes).'};
 return{pack};
}
function encode(pack){
 const bytes=new TextEncoder().encode(JSON.stringify(pack));
 let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(raw){
 if(raw.length>10000||!/^[A-Za-z0-9_-]+$/.test(raw))return null;
 try{
  const binary=atob(raw.replace(/-/g,'+').replace(/_/g,'/'));
  if(binary.length>SHARE_MAX_BYTES)return null;
  const pack=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
  if(!pack||pack.format!==fmt||pack.version!==1||!validText(pack.from,55)||!validText(pack.intro,350)||
   !Array.isArray(pack.interests)||pack.interests.length>6||
   !Array.isArray(pack.themes)||pack.themes.length>6||
   !Array.isArray(pack.answers)||pack.answers.length>5)return null;
  const keys=['title','category','status','description','score','psychology','themes','suggestions','discussion','personalNotes'];
  if(!pack.interests.every(x=>x&&typeof x==='object'&&keys.every(k=>!Object.hasOwn(x,k)||['score','themes','suggestions','personalNotes'].includes(k)||validText(x[k],600))&&
    validText(x.title,100)&&validText(x.description,210)&&validText(x.category,80)&&validText(x.status,85)&&
    (!Object.hasOwn(x,'score')||(Number.isFinite(x.score)&&x.score>=0&&x.score<=100))&&
    (!x.themes||(Array.isArray(x.themes)&&x.themes.length<=4&&x.themes.every(t=>validText(t.label,90)&&validText(t.meaning,230))))&&
    (!x.suggestions||(Array.isArray(x.suggestions)&&x.suggestions.length<=3&&x.suggestions.every(t=>validText(t,180))))&&
    (!x.personalNotes||(typeof x.personalNotes==='object'&&['meaning','boundary','request'].every(k=>!Object.hasOwn(x.personalNotes,k)||validText(x.personalNotes[k],450))))))return null;
  if(!pack.themes.every(x=>validText(x.label,90)&&validText(x.description,250)))return null;
  if(!pack.answers.every(x=>validText(x.quiz,60)&&validText(x.question,240)&&Number.isInteger(x.number)&&x.number>=1&&x.number<=32&&
    Array.isArray(x.selection)&&x.selection.length<=9&&x.selection.every(t=>validText(t,160))))return null;
  return pack;
 }catch{return null}
}
function showReadable(pack,root){
 root.replaceChildren();
 const hero=el('div',undefined,'ps-reader-heading');
 hero.append(el('span','PRIVATE · SELECTED RESULTS ONLY','eyebrow'),el('h2',(pack.from||'Your partner')+' shared parts of their results'));
 hero.append(el('p',pack.intro||'These are the specific parts of the After Dark results they chose to share.'));
 hero.append(el('p','This is a conversation invitation, not consent or a request for participation. The quiz scores are illustrative, not scientific probabilities.','ps-muted'));
 root.append(hero);
 if(pack.interests.length){
  const section=el('section',undefined,'ps-reader-section');section.append(el('h3','Interests they chose to show you'));
  for(const x of pack.interests){
   const card=el('article',undefined,'ps-preview-card');
   card.append(el('h4',x.title),el('p',x.status+' · '+x.category,'ps-muted'),el('p',x.description));
   if(Number.isFinite(x.score))card.append(el('p',x.score+'% illustrative match score (not a probability).','ps-score'));
   if(x.psychology)card.append(el('h5','Their psychology connection'),el('p',x.psychology));
   if(x.themes?.length){
    const ul=el('ul');
    x.themes.forEach(t=>ul.append(el('li',t.label+': '+t.meaning)));
    card.append(ul);
   }
   if(x.suggestions?.length){
    card.append(el('h5','Things they might consider or like'));
    const ul=el('ul');x.suggestions.forEach(v=>ul.append(el('li',v)));card.append(ul);
   }
   if(x.discussion)card.append(el('h5','How to talk about it'),el('p',x.discussion));
   if(x.personalNotes){
    const labels={meaning:'What this means to them',boundary:'Their boundaries',request:'How they would like you to respond'};
    for(const [key,title] of Object.entries(labels))if(x.personalNotes[key])card.append(el('h5',title),el('p',x.personalNotes[key],'ps-personal'));
   }
   section.append(card);
  }
  root.append(section);
 }
 if(pack.themes.length){
  const section=el('section',undefined,'ps-reader-section');
  section.append(el('h3','Psychological themes they chose to share'));
  for(const x of pack.themes){const c=el('article',undefined,'ps-preview-card');c.append(el('h4',x.label),el('p',x.description));section.append(c)}
  root.append(section);
 }
 if(pack.answers.length){
  const section=el('section',undefined,'ps-reader-section');
  section.append(el('h3','Individual questions they permitted you to see'));
  for(const q of pack.answers){
   const c=el('article',undefined,'ps-preview-card');
   c.append(el('h4',q.quiz+' · Q'+q.number),el('p',q.question),el('p','Their selected answer'+(q.selection.length>1?'s':'')+': '+q.selection.join(' · '),'ps-personal'));
   section.append(c);
  }
  root.append(section);
 }
 root.append(el('p','Everything else—including unselected interests, answer choices, private notes, or other questionnaire sections—was left out of this invitation. You may listen, ask questions, or decline.','ps-muted'));
}
function renderViewer(pack,preview=false){
 const area=$('partner-invitation');if(!area)return;
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('visible',t.id==='partner-view'));
 document.querySelectorAll('[data-tab]').forEach(t=>t.classList.remove('selected'));
 if($('afterdark-current'))$('afterdark-current').textContent='Shared results';
 showReadable(pack,area);
 if(preview){
  area.prepend(button('← Edit what I share',open,'btn alt'));
  area.prepend(el('p','EXACT PREVIEW · This is what the recipient will see.','ps-preview-flag'));
 }
 window.scrollTo({top:0,behavior:'instant'});
}
function addInterests(root,d){
 root.append(el('p','Select individual interests to share. Nothing is selected automatically. Up to six fit in one phone-friendly link.','ps-muted'));
 if(!d.interests.length){root.append(el('p','Finish some quiz questions to discover named interests first.'));return}
 const container=el('div',undefined,'ps-options-grid');
 for(const x of d.interests){
  const item=el('article',undefined,'ps-select-card');
  const settings=opt.interests.get(x.id);
  const more=el('details',undefined,'ps-detail-settings');
  more.append(el('summary','Choose details for this interest'));
  const detail=el('div',undefined,'ps-detail-choice');
  for(const [key,title] of [['psych','Psychology explanation'],['suggestions','Suggestions and exploration ideas'],['discuss','How to discuss it'],['score','Illustrative match score']]){
   detail.append(check(title,Boolean(settings?.[key]),on=>{
    const copy=opt.interests.get(x.id);if(copy)copy[key]=on;
   }));
  }
  const notes=notesFor(x.id),noteLabels={meaning:'My personal meaning',boundary:'My boundaries',request:'How I want them to respond'};
  for(const [key,title] of Object.entries(noteLabels))if(notes[key]){
   detail.append(check(title+' (private note)',Boolean(settings?.[key]),on=>{
    const copy=opt.interests.get(x.id);if(copy)copy[key]=on;
   }));
  }
  more.append(detail);
  const picker=check(x.name+' · '+friendlySource(x),Boolean(settings),on=>{
   if(on&&opt.interests.size>=6){status('Maximum six interests per link. Deselect one first.');render();return}
   if(on)opt.interests.set(x.id,{psych:false,suggestions:false,discuss:false,score:false,meaning:false,boundary:false,request:false});
   else opt.interests.delete(x.id);
   more.hidden=!on;
   more.open=false;
   if(!on)for(const input of detail.querySelectorAll('input'))input.checked=false;
   status(on?'Selected '+x.name+'. Choose which details to include; none are added by default.':'Removed '+x.name+' from share selection.');
  });
  item.append(picker);
  item.append(el('p',x.description,'ps-interest-description'));
  more.hidden=!settings;
  item.append(more);container.append(item);
 }
 root.append(container);
}
function addThemes(root,d){
 const choices=Object.entries(d.axes.combined).filter(([tag,value])=>value>0&&d.lenses[tag])
  .sort((a,b)=>b[1]-a[1]).slice(0,10);
 if(!choices.length){root.append(el('p','No saved psychology themes yet.'));return}
 for(const [tag] of choices)root.append(check(d.lenses[tag].label, opt.themes.has(tag),on=>{
  if(on&&opt.themes.size>=6){status('Maximum six psychology themes per link.');render();return}
  on?opt.themes.add(tag):opt.themes.delete(tag);
 }));
}
function addAnswers(root,d){
 root.append(el('p','Optional: choose individual answered questions. Full quiz responses and private free-text notes are NEVER shared automatically. Up to five answer excerpts.','ps-muted'));
 for(const k of ['direct','psych']){
  const answered=d[k].questions.filter(q=>q.selected.length);
  if(!answered.length)continue;
  root.append(el('h4',k==='direct'?'Sexual Preferences Quiz':'Psychology Quiz'));
  for(const q of answered){
   const id=k+':'+q.number;
   root.append(check(questionTitle(q,k)+' — '+q.selected.map(x=>x.text).join(' / ').slice(0,160),
    opt.answers.has(id),on=>{
     if(on&&opt.answers.size>=5){status('Maximum five answer excerpts per link.');render();return}
     on?opt.answers.add(id):opt.answers.delete(id);
    }));
  }
 }
}
function render(){
 const d=shareData(),root=$('partner-share-editor');if(!root)return;
 root.replaceChildren();lastPack=null;
 if(!d){root.append(el('p','Start either quiz first to make selected results available.'));return}
 const header=el('header',undefined,'ps-head');
 header.append(el('span','PRIVATE · YOU DECIDE WHAT TO SHARE','eyebrow'),el('h2','Share exactly what you choose'),
  el('p','Make a custom view for a partner. Choose individual interests, psychological themes, and selected answers. Everything starts private.'));
 root.append(header);
 const ident=el('div',undefined,'ps-identity');
 for(const [key,label,placeholder,max] of [['name','Your name or nickname (optional)','Your nickname',55],
  ['intro','Message to your partner (optional)','I’d like to share a few things from my results and talk about them when we’re both comfortable.',350]]){
  const wrap=el('label',undefined,'ps-text-field');wrap.append(el('strong',label));
  const input=key==='intro'?el('textarea'):el('input');input.value=opt[key];input.maxLength=max;input.placeholder=placeholder;
  input.oninput=()=>{opt[key]=input.value};wrap.append(input);ident.append(wrap);
 }
 root.append(ident);
 const interests=el('details',undefined,'ps-section');interests.open=true;
 interests.append(el('summary','1 · Choose specific interests'));
 const interestBody=el('div',undefined,'ps-section-body');addInterests(interestBody,d);interests.append(interestBody);root.append(interests);
 const themes=el('details',undefined,'ps-section');
 themes.append(el('summary','2 · Optional psychology themes'));
 const themesBody=el('div',undefined,'ps-section-body');addThemes(themesBody,d);themes.append(themesBody);root.append(themes);
 const answers=el('details',undefined,'ps-section');
 answers.append(el('summary','3 · Optional individual quiz answers'));
 const answersBody=el('div',undefined,'ps-section-body');addAnswers(answersBody,d);answers.append(answersBody);root.append(answers);
 const actions=el('div',undefined,'ps-actions');
 actions.append(button('👁 Preview exactly what they will see',()=>{
  const built=buildPack();if(built.error){status(built.error);return}lastPack=built.pack;renderViewer(built.pack,true);
 },'btn'));
 actions.append(button('🔗 Create selected-results link',makeLink,'btn alt'));
 actions.append(button('📋 Copy just this shared text',copySelected,'btn alt'));
 actions.append(button('Clear all selections',()=>{
  opt.interests.clear();opt.themes.clear();opt.answers.clear();opt.intro='';opt.name='';render();status('Nothing selected for sharing.');
 },'btn alt'));
 root.append(actions);
 const output=el('div',undefined,'ps-link-output');output.id='partner-share-link';output.hidden=true;root.append(output);
 const note=el('p','Privacy: the link contains only the choices you include. It is not encrypted and anyone who gets or is forwarded the link can read it. Nothing is automatically sent to a partner or a server. Create a new selection for each recipient.','ps-private-note');
 root.append(note);
 const message=el('p','','ps-status');message.id='partner-share-status';message.setAttribute('role','status');root.append(message);
}
function open(){
 document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('visible',t.id==='share-results'));
 document.querySelectorAll('[data-tab]').forEach(t=>t.classList.remove('selected'));
 if($('afterdark-current'))$('afterdark-current').textContent='Choose what to share';
 history.replaceState(null,'','#share-results');
 render();
 window.scrollTo({top:0,behavior:'smooth'});
}
async function copyText(value){
 try{await navigator.clipboard.writeText(value);status('✓ Copied. Paste it into a private message when you choose.')}
 catch{const area=$('partner-share-link');area.hidden=false;area.replaceChildren(el('p','Select and copy this text:'));const i=el('textarea');i.readOnly=true;i.value=value;area.append(i);i.select();status('Your browser could not copy automatically. Select the text above.')}
}
function makeLink(){
 const {pack,error}=buildPack();if(error){status(error);return}
 lastPack=pack;
 const url=new URL('/after-dark/',location.origin);
 url.hash='partner-results?data='+encode(pack);
 const out=$('partner-share-link');out.hidden=false;out.replaceChildren(
  el('p','Your link includes ONLY the items in your current preview. It can be forwarded and is not encrypted.','ps-muted'));
 const input=el('input');input.readOnly=true;input.value=url.href;input.setAttribute('aria-label','Selected After Dark quiz results link');out.append(input);
 out.append(button('📋 Copy link',()=>copyText(url.href),'btn alt'));
 out.append(button('👁 Preview recipient view',()=>renderViewer(pack,true),'btn alt'));
 status('Link created. No full quiz data or unselected notes are included.');
}
function asPlainText(pack){
 const area=el('div');showReadable(pack,area);
 return area.innerText||area.textContent;
}
function copySelected(){
 const {pack,error}=buildPack();if(error){status(error);return}
 lastPack=pack;copyText(asPlainText(pack));
}
function mount(){
 const root=$('partner-share-editor');if(!root)return;
 const notebook=$('notebook-content');
 if(notebook){
  const introduction=el('div',undefined,'ps-notebook-intro');
  introduction.append(el('h3','👥 Share selected quiz results'),
   el('p','Choose exactly which quiz results, theme explanations and private notes a partner sees.'));
  introduction.append(button('Choose what my partner sees →',open,'btn'));
  notebook.parentNode?.insertBefore(introduction,notebook);
 }
 const shareFromResults=target=>{
  const card=$(target);if(!card||card.querySelector('[data-share-quiz-results]'))return;
  const nav=el('div',undefined,'ps-result-action');
  const buttonEl=button('👥 Share selected results with a partner',open,'btn alt');
  buttonEl.dataset.shareQuizResults='';
  nav.append(buttonEl);
  card.prepend(nav);
 };
 const observer=new MutationObserver(()=>{
  for(const target of ['quizCard','psychQuizCard']){
   const card=$(target);
   if(card&&card.querySelector('.interest-result')&&!card.querySelector('[data-share-quiz-results]')){
    observer.disconnect();shareFromResults(target);
    observer.observe($('quizCard'),{childList:true});
    observer.observe($('psychQuizCard'),{childList:true});
   }
  }
 });
 for(const target of ['quizCard','psychQuizCard']){const node=$(target);if(node)observer.observe(node,{childList:true});}
 for(const target of ['quizCard','psychQuizCard'])if($(target)?.querySelector('.interest-result'))shareFromResults(target);
 const match=location.hash.match(/^#partner-results\?data=([A-Za-z0-9_-]+)$/);
 if(match){const pack=decode(match[1]);if(pack)renderViewer(pack);else{
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('visible',t.id==='partner-view'));
  $('partner-invitation')?.replaceChildren(el('p','This shared-results link is invalid or could not be opened. Ask the sender for a new link.'));
 }}
 window.AfterDarkPartnerShare=Object.freeze({open,preview:()=>{
  const {pack,error}=buildPack();if(error){status(error);return false}
  renderViewer(pack,true);return true
 },buildPack:()=>buildPack(),decode,refresh:render});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
})();
