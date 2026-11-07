/* Unwrapped Explore: one always-visible way to find a tool or subject.
   Client-side only. No private quiz answers or search terms are sent or stored. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const categories=[
 {tab:'quiz',title:'Sexual Preferences Quiz',group:'Quizzes',description:'Take or resume the 69-question interest quiz.',terms:'quiz explicit preferences fantasy interests anal pegging strap-on giving receiving sex activities'},
 {tab:'psych-quiz',title:'Psychology Quiz',group:'Quizzes',description:'Explore everyday patterns and combine your results.',terms:'psychology questionnaire personality relationships emotional 32 questions nonsexual'},
 {tab:'notebook',title:'My Reports & Uploads',group:'Reports',description:'Create, save, import or compare reports and restore your answers.',terms:'export pdf report download upload import json backup recover restore partner combined compare share results'},
 {tab:'samples',title:'Sample Reports',group:'Reports',description:'See fictional example reports before taking the quizzes.',terms:'preview examples samples pdf fictional reports'},
 {tab:'atlas',title:'Browse Interests & Curiosities',group:'Explore',description:'Look up topics, mark curiosity and see related ideas.',terms:'explore categories shelf library interest kink fetish curiosity body sensation taboo anal pegging'},
 {tab:'ideas',title:'Idea Lab',group:'Explore',description:'Draw ideas, set Freak Level and combine toys and themes.',terms:'idea generator random suggestions freak level sex ideas couples toys combine together him her scenario fantasy'},
 {tab:'toys',title:'Sex Toy Guide',group:'Explore',description:'Search toy types, strap-ons, anal-safe designs, fit and care.',terms:'sex toys sex toy dildo strap-on strap on pegging harness anal prostate vibrators accessories toy guide'},
 {tab:'chat',title:'Ask Mira',group:'Explore',description:'Ask a question about results, preferences or communication.',terms:'ask chat assistant mira explain report question why'},
 {tab:'howto',title:'Intimacy & Anatomy Guides',group:'Learn',description:'Find anatomical and sexual wellness explanations.',terms:'guides learning how to pleasure orgasm clitoral anal vaginal nipple prostate anatomy'},
 {tab:'psych',title:'Psychology & Feelings',group:'Learn',description:'Read about trust, motivation, relationships and curiosity.',terms:'psychology emotions feelings motives why interests connections origins'},
 {tab:'guide',title:'Resources & FAQs',group:'Learn',description:'Find help, safety information and frequently asked questions.',terms:'faq resources help privacy safety consent questions support'}
];
const more=[{tab:'ideas',text:'Idea Lab'},{tab:'howto',text:'Intimacy Guides'}];
function goto(tab,opts={}){
 const original=document.querySelector('.od-ribbon-nav [data-tab="'+tab+'"],#home [data-tab="'+tab+'"]');
 if(original)original.click();
 else {
   const target=$(tab);
   if(!target)return;
   document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('visible',x===target));
   history.replaceState(null,'','#'+tab);
 }
 const field=opts.search&&$(opts.search);
 if(field&&opts.value){field.value=opts.value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))}
 if(opts.toyId){
   const open=()=>{$('toy-grid')?.querySelector('[data-toy-open="'+opts.toyId+'"]')?.click()};
   open();
   requestAnimationFrame(open);
 }else if(field&&opts.search){
   requestAnimationFrame(()=>field.scrollIntoView({behavior:'auto',block:'center'}));
 }
}
function normalized(t){return String(t||'').toLocaleLowerCase().replace(/\bstrapon\b/g,'strap on').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[-_/]+/g,' ').replace(/\s+/g,' ').trim()}
function index(){
 const all=categories.map(x=>({...x,kind:'section',key:x.tab,hay:normalized([x.title,x.description,x.terms,x.group].join(' '))}));
 const toys=window.UnwrappedToyLibrary?.types||[];
 for(const toy of toys)all.push({kind:'toy',key:'toy-'+toy.id,tab:'toys',title:toy.name,group:'Toy library',description:toy.summary||'See features, anatomy fit and safety.',id:toy.id,
   hay:normalized([toy.name,toy.summary,toy.group,...(toy.tags||[])].join(' '))});
 try{
   const topics=window.AfterDarkNotebookBridge?.getTopics?.()||[];
   for(const topic of topics){
     if(!topic?.name)continue;
     all.push({kind:'topic',key:'topic-'+topic.id,tab:'atlas',title:topic.name,group:'Interest library',
      description:topic.description||topic.cat||'Read and explore this topic.',hay:normalized([topic.name,topic.description,topic.cat,topic.info].join(' '))});
   }
 }catch(_){}
 return all;
}
function rank(item,q){
 if(!q)return item.kind==='section'?1:0;
 const filler=new Set(['what','where','how','do','i','find','the','a','an','to','about','under','with','for','me','and','is','can','want','know','more','on','my','of','in','all','please','help','show','play','are','there','some']);
 const toks=q.split(/\s+/).filter(x=>x&&!filler.has(x));
 if(!toks.length)return 0;
 if(!toks.every(tok=>item.hay.includes(tok)))return 0;
 const title=normalized(item.title);
 let n=5;
 if(title===q)n+=90;
 else if(title.startsWith(q))n+=35;
 else if(title.includes(q))n+=20;
 if(item.kind==='section')n+=5;
 return n;
}
function select(item){
 if(item.kind==='toy')goto('toys',{search:'toy-search',value:item.title,toyId:item.id});
 else if(item.kind==='topic')goto('atlas',{search:'search',value:item.title});
 else goto(item.tab);
}
function addSearch(){
 const header=document.querySelector('header.top.od-simple-site-header');
 if(!header||$('uw-explore'))return;
 const dock=el('section','uw-explore');dock.id='uw-explore';dock.setAttribute('aria-label','Find and open anything in Unwrapped');
 const head=el('div','uw-explore-head');
 const title=el('strong','uw-explore-title','Explore Unwrapped');
 const here=el('span','uw-explore-here','');
 head.append(title,here);
 const label=el('label','uw-explore-search-label');label.htmlFor='uw-find';
 const input=el('input','uw-explore-input');input.type='search';input.id='uw-find';input.autocomplete='off';
 input.placeholder='Search: strap-on, anal, reports, fantasies, toys…';input.setAttribute('aria-label','Search Unwrapped sections, interests and sex toy types');
 label.append(input);
 const quick=el('div','uw-explore-shortcuts');
 const links=[['quiz','Quizzes'],['notebook','My reports'],['atlas','Interests'],['ideas','Idea Lab'],['toys','Sex toys']];
 for(const [tab,name] of links){
   const b=el('button','uw-quick-link',name);b.type='button';b.dataset.destination=tab;
   b.addEventListener('click',()=>{input.value='';render();goto(tab)});
   quick.append(b);
 }
 const directoryButton=el('button','uw-directory-toggle','All sections ⌄');directoryButton.type='button';directoryButton.id='uw-directory-toggle';directoryButton.setAttribute('aria-expanded','false');
 quick.append(directoryButton);
 const directory=el('div','uw-directory');directory.id='uw-directory';directory.hidden=true;
 for(const group of ['Quizzes','Reports','Explore','Learn']){
   const section=el('div','uw-directory-group');
   section.append(el('h3','',group));
   const grid=el('div','uw-directory-links');
   categories.filter(x=>x.group===group).forEach(item=>{
     const b=el('button','uw-directory-item');
     b.type='button';b.append(el('strong','',item.title),el('small','',item.description));
     b.addEventListener('click',()=>{directory.hidden=true;directoryButton.setAttribute('aria-expanded','false');goto(item.tab)});
     grid.append(b);
   });
   section.append(grid);directory.append(section);
 }
 directoryButton.addEventListener('click',()=>{
   const open=directory.hidden;directory.hidden=!open;directoryButton.setAttribute('aria-expanded',String(open));
   directoryButton.textContent=open?'Close sections ↑':'All sections ⌄';
   if(open){input.value='';render()}
 });
 const results=el('div','uw-explore-results');results.id='uw-find-results';results.hidden=true;results.setAttribute('role','region');results.setAttribute('aria-label','Search results');
 const count=el('p','uw-explore-count');
 const found=el('div','uw-explore-found');
 const showAll=el('button','uw-explore-more','Show more matches');showAll.type='button';showAll.hidden=true;
 results.append(count,found,showAll);
 let expanded=false;
 function render(){
   const q=normalized(input.value);
   results.hidden=!q;
   if(!q){found.replaceChildren();showAll.hidden=true;return}
   const matches=index().map(item=>({item,score:rank(item,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title));
   const visible=expanded?matches.slice(0,60):matches.slice(0,8);
   count.textContent=matches.length?matches.length+' matches · Select to open the relevant section or item':'No exact matches. Try a simpler word or browse all sections.';
   found.replaceChildren();
   for(const {item} of visible){
     const b=el('button','uw-index-result');b.type='button';
     const main=el('span','uw-index-main');main.append(el('strong','',item.title),el('small','',item.description));
     b.append(main,el('span','uw-index-category',item.group));
     b.addEventListener('click',()=>{input.value='';render();select(item)});
     found.append(b);
   }
   showAll.hidden=expanded||matches.length<=8;
   showAll.textContent='Show all '+matches.length+' matches';
 }
 input.addEventListener('input',()=>{expanded=false;directory.hidden=true;directoryButton.setAttribute('aria-expanded','false');directoryButton.textContent='All sections ⌄';render()});
 input.addEventListener('keydown',event=>{
   if(event.key==='Escape'){input.value='';render();input.blur()}
   if(event.key==='Enter'){event.preventDefault();found.querySelector('button')?.click()}
 });
 showAll.addEventListener('click',()=>{expanded=true;render()});
 dock.append(head,label,quick,directory,results);
 header.insertAdjacentElement('afterend',dock);
 const sync=()=>{const current=document.querySelector('.tab.visible')?.id||'home';
  here.textContent=(categories.find(x=>x.tab===current)?.title)||'Home';
  quick.querySelectorAll('[data-destination]').forEach(b=>{b.classList.toggle('is-active',b.dataset.destination===current)});
 };
 document.querySelectorAll('.tab').forEach(tab=>new MutationObserver(sync).observe(tab,{attributes:true,attributeFilter:['class']}));
 sync();
}
function unbury(){
 const nav=$('od-ribbon-nav'),submenu=nav?.querySelector('.od-ribbon-menu-more .od-ribbon-submenu'),moreMenu=nav?.querySelector('.od-ribbon-menu-more');
 if(!nav||!submenu||!moreMenu)return;
 for(const entry of more){
  const node=submenu.querySelector('[data-tab="'+entry.tab+'"]');if(!node)continue;
  node.className='od-ribbon-link';node.textContent=entry.text;
  nav.insertBefore(node,moreMenu);
 }
}
function homeExtras(){
 const home=$('home'),foot=home?.querySelector('.od-compact-footnote');
 if(!home||!foot||$('uw-home-more'))return;
 const block=el('section','uw-home-more');block.id='uw-home-more';
 block.append(el('h3','','More ways to explore'));
 const links=el('div','uw-home-links');
 for(const [id,name] of [['atlas','Browse interests'],['ideas','Find an idea'],['howto','Intimacy guides'],['psych','Psychology'],['samples','Sample reports'],['guide','FAQs']]){
   const b=el('button','',name);b.type='button';b.addEventListener('click',()=>goto(id));links.append(b);
 }
 block.append(links);foot.replaceWith(block);
}
function sectionShortcuts(){
 const section=$('ideas'),target=$('toy-idea-studio'),output=$('ideaResult');
 // The generated result belongs next to the generator, not below the long toy workbench.
 if(section&&target&&output&&output.parentElement===target.parentElement)target.before(output);
 if(section&&target&&!$('uw-idea-shortcuts')){
   const nav=el('nav','uw-section-shortcuts');nav.id='uw-idea-shortcuts';nav.setAttribute('aria-label','Idea Lab jump links');
   for(const [label,id] of [['Generate an idea','freak-level'],['Mix ideas and toys','toy-idea-studio'],['See generated idea','ideaResult']]){
    const b=el('button','',label);b.type='button';
    b.addEventListener('click',()=>$(id)?.scrollIntoView({block:'start',behavior:'smooth'}));nav.append(b);
   }
   section.querySelector('.idea-lab-controls')?.before(nav);
 }
}
function init(){unbury();addSearch();homeExtras();sectionShortcuts()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();