/* The Other Drawer: private, persistent page/quiz bookmarks.
 * Never uploads reading positions or quiz answers; stores on this device only.
 */
(()=>{'use strict';
const KEY='otherdrawer_saved_places_v1';
const LEGACY='afterdark_reading_places_v1';
const TABS=['home','atlas','quiz','psych-quiz','psych','ideas','chat','howto','guide','notebook'];
const LABELS={home:'Home',atlas:'Curiosity Cabinet',quiz:'Sexual Preferences Quiz','psych-quiz':'Psychology Quiz',psych:'Psychology & Feelings',ideas:'Idea Lab',chat:'Ask Anything',howto:'Practical Guides',guide:'Resources',notebook:'My Notebook'};
const $=id=>document.getElementById(id);
const text=(tag,value,cls)=>{const x=document.createElement(tag);if(value!==undefined)x.textContent=value;if(cls)x.className=cls;return x};
const button=(title,click,cls)=>{const b=text('button',title,cls);b.type='button';b.addEventListener('click',click);return b};
const parse=v=>{try{return JSON.parse(v)}catch{return null}};
const read=()=>{try{return localStorage.getItem(KEY)}catch{return null}};
const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}};
const current=()=>document.querySelector('.tab.visible')?.id||'home';
const bridge=tab=>tab==='quiz'?window.AfterDarkDirectQuizBridge:tab==='psych-quiz'?window.AfterDarkPsychQuizBridge:null;
const question=tab=>{const p=bridge(tab)?.getProgress?.();return p&&Number.isInteger(p.position)?p.position:null};
const round=n=>Math.round(Math.max(0,Math.min(250000,Number(n)||0)));
function clean(raw){
 const b=Array.isArray(raw?.items)?raw.items:[];
 const items=b.filter(p=>p&&TABS.includes(p.tab)&&typeof p.id==='string')
   .slice(0,150).map(p=>({
    id:p.id.slice(0,80),tab:p.tab,label:String(p.label||LABELS[p.tab]).slice(0,90),
    y:round(p.y),ratio:Math.max(0,Math.min(1,Number(p.ratio)||0)),
    anchor:String(p.anchor||'').slice(0,90),path:String(p.path||'').slice(0,420),
    delta:Math.max(-10000,Math.min(10000,Number(p.delta)||0)),
    quiz:Number.isInteger(p.quiz)?p.quiz:null,guide:String(p.guide||'').slice(0,60),
    time:Number(p.time)||0
   }));
 const auto={};
 for(const [tab,p] of Object.entries(raw?.auto||{})){
  if(!TABS.includes(tab)||!p||typeof p!=='object')continue;
  auto[tab]={tab,y:round(p.y),ratio:Math.max(0,Math.min(1,Number(p.ratio)||0)),
   anchor:String(p.anchor||'').slice(0,90),path:String(p.path||'').slice(0,420),
   delta:Math.max(-10000,Math.min(10000,Number(p.delta)||0)),
   quiz:Number.isInteger(p.quiz)?p.quiz:null,guide:String(p.guide||'').slice(0,60),
   time:Number(p.time)||0};
 }
 return{items,auto,last:TABS.includes(raw?.last)?raw.last:null};
}
let state=clean(parse(read()));
function migrate(){
 if(read()!==null)return;
 const old=parse((()=>{try{return localStorage.getItem(LEGACY)}catch{return null}})());
 if(!old?.sections)return;
 for(const [tab,p] of Object.entries(old.sections)){
  if(!TABS.includes(tab)||!p)continue;
  state.auto[tab]={tab,y:round(p.offset),ratio:0,anchor:'',path:'',delta:0,quiz:null,guide:String(p.guide||''),time:Number(p.time)||Date.now()};
 }
 if(TABS.includes(old.last))state.last=old.last;
 write();
}
migrate();
let isRestoring=false,saveTimer=0,ui=null,notice=null;
function status(message){if(notice)notice.textContent=message}
function pathFor(node,tab){
 const root=$(tab);if(!root?.contains(node)||root===node)return'';
 const steps=[];let currentNode=node;
 while(currentNode&&currentNode!==root&&steps.length<12){
  const parent=currentNode.parentElement;
  if(!parent)return'';
  steps.unshift(':scope > '+currentNode.tagName.toLowerCase()+':nth-child('+([...parent.children].indexOf(currentNode)+1)+')');
  currentNode=parent;
 }
 return steps.join(' ').replace(/:scope > /g,'> ').replace(/^> /,'');
}
function anchorAt(tab){
 const root=$(tab);if(!root)return{anchor:'',path:'',delta:0};
 const targetY=Math.max(140,Math.min(innerHeight-90,innerHeight*.36));
 const nodes=[...root.querySelectorAll('h2,h3,h4,article,details,section,[id]')]
  .filter(node=>node!==root&&node.getBoundingClientRect().height>0&&node.getBoundingClientRect().height<10000);
 const candidates=nodes.map(node=>({node,rect:node.getBoundingClientRect()}))
   .filter(o=>o.rect.top<=targetY+35&&o.rect.bottom>=targetY-30);
 const chosen=candidates.sort((a,b)=>a.rect.height-b.rect.height)[0]||
   nodes.map(node=>({node,rect:node.getBoundingClientRect()}))
    .filter(o=>o.rect.top<=targetY).sort((a,b)=>b.rect.top-a.rect.top)[0];
 if(!chosen)return{anchor:'',path:'',delta:0};
 return{anchor:chosen.node.id||'',path:pathFor(chosen.node,tab),
  delta:Math.round(chosen.rect.top-targetY)};
}
function activeGuide(){
 const detail=$('howto-guide-detail');
 if(!detail||detail.hidden)return'';
 const title=detail.querySelector('h2')?.textContent||'';
 return window.AfterDarkIntimacyGuides?.guides?.find(g=>title.includes(g.title))?.id||'';
}
function capture(){
 const tab=current();
 if(!TABS.includes(tab))return null;
 const y=round(scrollY),limit=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 const anchor=tab==='quiz'||tab==='psych-quiz'?{anchor:'',path:'',delta:0}:anchorAt(tab);
 return{tab,y,ratio:Math.min(1,y/limit),...anchor,quiz:question(tab),
  guide:tab==='howto'?activeGuide():'',time:Date.now()};
}
function updateAuto(){
 if(isRestoring)return;
 const p=capture();if(!p)return;
 state.auto[p.tab]=p;if(p.tab!=='home'||!state.last)state.last=p.tab;write();refresh();
}
function labelFor(p){
 if(p.tab==='quiz'||p.tab==='psych-quiz'){
  const max=p.tab==='quiz'?69:32;
  return LABELS[p.tab]+(p.quiz!==null&&p.quiz>=0&&p.quiz<max?' · Question '+(p.quiz+1):'');
 }
 const anchor=p.anchor?$(p.anchor):null;
 const heading=anchor?.matches('h2,h3,h4')?anchor:anchor?.querySelector?.('h2,h3,h4');
 return LABELS[p.tab]+(heading?' · '+heading.textContent.trim().slice(0,40):'');
}
function bookmark(){
 const p=capture();if(!p){status('Open a section to bookmark it.');return}
 const custom=$('od-bookmark-name')?.value.trim();
 p.id='saved-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
 p.label=(custom||labelFor(p)).slice(0,90);
 state.items.unshift(p);state.items=state.items.slice(0,150);
 state.auto[p.tab]=p;state.last=p.tab;
 const ok=write();
 if(ok){const name=$('od-bookmark-name');if(name)name.value='';status('Saved: '+p.label);refresh();}
 else status('Storage is unavailable. Your place was not saved.');
}
function navigate(tab){
 if(tab==='quiz'||tab==='psych-quiz'){bridge(tab)?.resume?.();return;}
 const trigger=document.querySelector('[data-tab="'+tab+'"]')||document.querySelector('[data-goto="'+tab+'"]');
 if(trigger)trigger.click();
 else{const section=$(tab);if(section){document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('visible',el===section));}}
}
function scrollBack(p){
 if(p.tab==='quiz'||p.tab==='psych-quiz'){
  $(p.tab==='quiz'?'quizCard':'psychQuizCard')?.scrollIntoView({block:'start',behavior:'instant'});
  return;
 }
 const root=$(p.tab);
 const byId=p.anchor?$(p.anchor):null;
 const el=(byId&&root?.contains(byId)?byId:null)||(p.path?(()=>{try{return root?.querySelector(p.path)}catch{return null}})():null);
 const limit=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const absolute=el?scrollY+el.getBoundingClientRect().top-
   (Math.max(140,Math.min(innerHeight-90,innerHeight*.36))+p.delta):p.y;
 const y=Math.max(0,Math.min(limit,Number.isFinite(absolute)?absolute:p.ratio*limit));
 scrollTo({top:y,behavior:'instant'});
}
function restore(p){
 if(!p||!TABS.includes(p.tab))return;
 isRestoring=true;
 navigate(p.tab);
 if(p.tab==='howto'&&p.guide)window.AfterDarkIntimacyGuides?.open?.(p.guide);
 if((p.tab==='quiz'||p.tab==='psych-quiz')&&Number.isInteger(p.quiz)&&p.quiz>=0){
  bridge(p.tab)?.goToQuestion?.(p.quiz);
 }
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  scrollBack(p);isRestoring=false;status('Back at '+(p.label||LABELS[p.tab]||'your saved spot')+'.');
  refresh();
 }));
}
function resume(){
 const last=state.last;
 let p=(last&&state.auto[last])||state.items[0];
 if(!p){
  const direct=bridge('quiz')?.getProgress?.(),psych=bridge('psych-quiz')?.getProgress?.();
  if(direct&&direct.position>=0&&!direct.complete)p={tab:'quiz',quiz:direct.position,y:0,ratio:0};
  else if(psych&&psych.position>=0&&!psych.complete)p={tab:'psych-quiz',quiz:psych.position,y:0,ratio:0};
 }
 if(p)restore(p);else status('No saved place yet. Explore a section or start a quiz.');
}
function erase(id){state.items=state.items.filter(x=>x.id!==id);write();refresh();status('Bookmark removed.')}
function rename(p){
 const name=prompt('Rename this bookmark:',p.label);
 if(name===null)return;
 if(name.trim()){p.label=name.trim().slice(0,90);write();refresh();}
}
function backup(){
 const blob=new Blob([JSON.stringify({format:'otherdrawer-bookmarks',version:1,bookmarks:state},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const link=document.createElement('a');
 link.href=url;link.download='other-drawer-bookmarks-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 status('Bookmarks downloaded. Quiz answers are saved separately.');
}
async function importBookmarks(file){
 if(!file)return;
 if(file.size>300000){status('This bookmark file is too large.');return}
 const data=parse(await file.text());
 if(data?.format!=='otherdrawer-bookmarks'||data.version!==1){status('This is not a bookmark backup.');return}
 const incoming=clean(data.bookmarks).items;
 const known=new Set(state.items.map(p=>p.id));
 for(const p of incoming){if(!known.has(p.id)){state.items.push(p);known.add(p.id)}}
 state.items.sort((a,b)=>b.time-a.time);state.items=state.items.slice(0,150);
 write();refresh();status('Imported '+incoming.length+' bookmarks. Existing bookmarks were kept.');
}
function refresh(){
 if(!ui)return;
 const count=$('od-bookmark-count');if(count)count.textContent=String(state.items.length);
 const list=$('od-bookmark-list');if(!list)return;
 list.replaceChildren();
 if(!state.items.length)list.append(text('p','Saved spots appear here. Bookmark any section or question.','od-empty'));
 for(const p of state.items.slice(0,150)){
  const line=text('div',undefined,'od-saved-item');
  const main=button(p.label,()=>{restore(p);const d=$('od-bookmark-menu');if(d)d.open=false},'od-saved-open');
  main.title='Return to this saved place';
  const meta=text('span',(LABELS[p.tab]||p.tab)+' · '+new Date(p.time||Date.now()).toLocaleDateString(),'od-saved-meta');
  const copy=text('div',undefined,'od-saved-copy');copy.append(main,meta);
  const actions=text('div',undefined,'od-saved-actions');
  actions.append(button('Rename',()=>rename(p),'od-saved-mini'),button('Remove',()=>erase(p.id),'od-saved-mini'));
  line.append(copy,actions);list.append(line);
 }
 const resumeButton=$('od-continue');if(resumeButton){
  const last=state.last;const direct=bridge('quiz')?.getProgress?.(),psych=bridge('psych-quiz')?.getProgress?.();
  resumeButton.disabled=!Boolean(state.auto[last]||state.items.length||(direct?.position>=0)||(psych?.position>=0));
 }
}
function build(){
 if($('od-bookmark-bar'))return;
 const top=document.querySelector('.top');if(!top)return;
 const wrap=text('div',undefined,'od-bookmark-bar');wrap.id='od-bookmark-bar';
 wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Save your place toolbar');
 wrap.append(text('span','YOUR PLACE','od-bookmark-heading'));
 const save=button('☆ Bookmark this spot',bookmark,'od-bookmark-button od-bookmark-save');
 const cont=button('↪ Continue',resume,'od-bookmark-button od-bookmark-continue');cont.id='od-continue';
 wrap.append(save,cont);
 const menu=text('details',undefined,'od-bookmark-menu');menu.id='od-bookmark-menu';
 const summary=text('summary',undefined,'od-bookmark-button od-bookmark-summary');summary.append(document.createTextNode('Saved spots · '));
 const count=text('b','0');count.id='od-bookmark-count';summary.append(count);menu.append(summary);
 const panel=text('div',undefined,'od-bookmark-panel');
 panel.append(text('h2','Your saved spots'),text('p','Return to a page, an exact reading spot, or a quiz question. Everything stays on this device.','od-bookmark-help'));
 const field=text('input',undefined,'od-bookmark-name');field.id='od-bookmark-name';
 field.type='text';field.maxLength=90;field.placeholder='Name your next bookmark (optional)';
 field.setAttribute('aria-label','Bookmark name');panel.append(field);
 panel.append(button('Save the current spot',bookmark,'od-bookmark-button od-full'));
 const list=text('div',undefined,'od-bookmark-list');list.id='od-bookmark-list';panel.append(list);
 const tools=text('div',undefined,'od-bookmark-tools');
 tools.append(button('Download bookmarks',backup,'od-saved-mini'));
 const upload=text('label','Import bookmarks','od-saved-mini od-upload');
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
 input.setAttribute('aria-label','Choose bookmark backup file');
 input.addEventListener('change',async()=>{try{await importBookmarks(input.files?.[0])}catch{status('Could not read the bookmark file.')}input.value=''});
 upload.append(input);tools.append(upload);
 tools.append(button('Back up both quizzes',()=>window.AfterDarkProgressTransfer?.exportQuiz?.('both'),'od-saved-mini'));
 panel.append(tools);
 panel.append(text('p','Quiz answers also save automatically. Bookmark backups contain page positions only; export quizzes separately when changing devices.','od-bookmark-help'));
 menu.append(panel);wrap.append(menu);
 const message=text('span','Saved privately on this device','od-bookmark-notice');message.id='od-bookmark-notice';
 message.setAttribute('role','status');wrap.append(message);
 top.after(wrap);ui=wrap;notice=message;
 $('afterdark-resume-strip')?.setAttribute('hidden','');
 refresh();
}
function subscribe(){
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-tab],[data-goto]')&&!isRestoring){
   updateAuto();setTimeout(()=>{if(!isRestoring)updateAuto()},130);
  }
 },true);
 addEventListener('scroll',()=>{
  if(isRestoring)return;clearTimeout(saveTimer);saveTimer=setTimeout(updateAuto,650);
 },{passive:true});
 addEventListener('pagehide',updateAuto);
 document.addEventListener('change',event=>{
  if(event.target.closest('#quizCard,#psychQuizCard'))setTimeout(updateAuto,90);
 });
 document.addEventListener('click',event=>{
  if(event.target.closest('#quizCard,#psychQuizCard'))setTimeout(updateAuto,180);
 });
}
function init(){build();subscribe();refresh()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.OtherDrawerBookmarks=Object.freeze({save:bookmark,resume,list:()=>state.items.map(p=>({label:p.label,tab:p.tab,quiz:p.quiz})),restore});
})();