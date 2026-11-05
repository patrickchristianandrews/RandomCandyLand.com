/* Unwrapped: consent-based, on-device two-person report comparison.
   Individual selected-report files only. Never loads or overwrites full quiz state. */
(()=>{'use strict';
const FORMAT='unwrapped-shared-comparison-v1', $=id=>document.getElementById(id);
const E=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n};
const cap=(s,n=180)=>String(s||'').slice(0,n);
const cleanLabel=s=>cap(s,110).trim().toLocaleLowerCase();
const status=msg=>{const n=$('uc-status');if(n)n.textContent=msg};
const canBuild=()=>window.AfterDarkCanonicalReport?.buildData?.();
let selection={interest:new Set(),theme:new Set(),answers:new Set(),toys:new Set(),name:''};
const interesting=d=>d.interests||[];
function exportChoices(){
 const d=canBuild(),root=$('uc-select');if(!root)return;
 root.replaceChildren();
 if(!d){root.append(E('p','Take one or both quizzes to create a selected report.'));return}
 const intro=E('p','Choose a few sections or select all available. Only checked information goes into your downloaded file.','uc-note');root.append(intro);
 const name=E('input');name.placeholder='Your name or nickname (optional)';name.maxLength=55;name.value=selection.name;name.setAttribute('aria-label','Name for selected report');name.oninput=()=>selection.name=name.value;root.append(name);
 const all=E('label',undefined,'uc-check');const allBox=E('input');allBox.type='checkbox';
 all.append(allBox,document.createTextNode(' Include all available report highlights'));
 root.append(all); 
 const entries=[];
 function add(kind,key,text){
  const label=E('label',undefined,'uc-check'),box=E('input');box.type='checkbox';box.checked=selection[kind].has(key);
  box.onchange=()=>{box.checked?selection[kind].add(key):selection[kind].delete(key);allBox.checked=entries.every(e=>e.checked)};
  label.append(box,document.createTextNode(cap(text,180)));root.append(label);entries.push(box);
 }
 root.append(E('h4','Intimate interests and personal themes'));
 interesting(d).forEach(x=>add('interest',x.id,x.name+(x.directSelection?' · personally selected':' · suggested theme')));
 root.append(E('h4','Broader psychology'));
 Object.entries(d.axes?.combined||{}).filter(([k,v])=>v>0&&d.lenses?.[k]).sort((a,b)=>b[1]-a[1]).forEach(([key])=>add('theme',key,d.lenses[key].label));
 const answered=['direct','psych'].flatMap(kind=>(d[kind]?.questions||[]).filter(q=>q.selected?.length).map(q=>({kind,q})));
 if(answered.length){const more=E('details');more.append(E('summary','Optional: choose individual answers'));const body=E('div',undefined,'uc-answer-list');
  answered.forEach(({kind,q})=>{const key=kind+':'+q.number,label=E('label',undefined,'uc-check'),box=E('input');box.type='checkbox';box.checked=selection.answers.has(key);
   box.onchange=()=>{box.checked?selection.answers.add(key):selection.answers.delete(key);allBox.checked=entries.every(e=>e.checked)};
   label.append(box,document.createTextNode(cap((kind==='direct'?'Intimate':'Psychology')+' · '+q.question,170)));body.append(label);entries.push(box)});
  more.append(body);root.append(more)}
 const candidates=window.UnwrappedToyLibrary?.recommend?.(d)||[];
 const toySection=E('details');toySection.append(E('summary','Optional toy information · extra permission required'));
 const body=E('div',undefined,'uc-answer-list');
 body.append(E('p','OFF by default. These contain male, female and partner-use compatibility, safety and fantasy-only labels. Even Include all report highlights does not select them.','uc-note'));
 if(!candidates.length)body.append(E('p','No directly supported toy categories from your quiz choices.','uc-note'));
 for(const item of candidates){
  const label=E('label',undefined,'uc-check'),box=E('input');box.type='checkbox';box.checked=selection.toys.has(item.id);
  box.onchange=()=>{
   if(box.checked&&selection.toys.size>=2){box.checked=false;status('Choose up to two toy categories.');return}
   box.checked?selection.toys.add(item.id):selection.toys.delete(item.id);
  };
  label.append(box,document.createTextNode(item.name+' · '+item.mode));body.append(label);
 }
 toySection.append(body);root.append(toySection);
 allBox.onchange=()=>{for(const kind of ['interest','theme','answers'])selection[kind].clear();
  if(allBox.checked){interesting(d).forEach(x=>selection.interest.add(x.id));Object.entries(d.axes?.combined||{}).filter(([k,v])=>v>0&&d.lenses?.[k]).forEach(([k])=>selection.theme.add(k));answered.forEach(({kind,q})=>selection.answers.add(kind+':'+q.number))}
  entries.forEach(box=>box.checked=allBox.checked)};
 allBox.checked=entries.length>0&&entries.every(e=>e.checked);
}
function build(){
 const d=canBuild();if(!d)return null;
 const interests=interesting(d).filter(x=>selection.interest.has(x.id)).map(x=>({title:cap(x.name,110),category:cap(x.category,80),status:cap(x.confidenceType,105),description:cap(x.description,330),themes:(x.themeTags||[]).slice(0,8).map(k=>cap(d.lenses?.[k]?.label||k,100))}));
 const themes=Object.entries(d.axes?.combined||{}).filter(([k,v])=>v>0&&selection.theme.has(k)&&d.lenses?.[k]).map(([k])=>({label:cap(d.lenses[k].label,110),description:cap(d.lenses[k].detail,330)}));
 const answers=['direct','psych'].flatMap(kind=>(d[kind]?.questions||[]).filter(q=>selection.answers.has(kind+':'+q.number)&&q.selected?.length).map(q=>({quiz:kind,question:cap(q.question,230),selection:q.selected.map(x=>cap(x.text,160)).slice(0,60),intentLabel:kind==='direct'?cap(q.intentLabel,80):''})));
 const toys=(window.UnwrappedToyLibrary?.recommend?.(d)||[]).filter(x=>selection.toys.has(x.id)).slice(0,2)
  .map(x=>({title:cap(x.name,80),mode:cap(x.mode,60),
   male:cap(x.bodyUses?.male?.note,260),female:cap(x.bodyUses?.female?.note,260),
   shared:cap(x.bodyUses?.together,260),safety:cap(x.safety,300)}));
 if(!interests.length&&!themes.length&&!answers.length&&!toys.length)return null;
 const pack={format:FORMAT,version:1,from:cap(selection.name,55),interests,themes,answers,created:new Date().toISOString()};
 if(toys.length)pack.toys=toys;
 return pack;
}
function save(){
 const pack=build();if(!pack){status('Select at least one item first.');return}
 const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=E('a');
 a.href=url;a.download='unwrapped-shared-report-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status('Selected report downloaded. Share this file only with someone you trust.');
}
function validate(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.format!==FORMAT||raw.version!==1)throw Error('Choose a selected Unwrapped comparison report (.json), not a full quiz backup or PDF.');
 const arr=(x,n)=>Array.isArray(x)&&x.length<=n;
 const str=(s,n)=>typeof s==='string'&&s.length<=n;
 if(!str(raw.from,55)||!arr(raw.interests,30)||!arr(raw.themes,50)||!arr(raw.answers,110)||(raw.toys!==undefined&&!arr(raw.toys,2)))throw Error('Unsupported report structure or size.');
 if(!raw.interests.every(x=>x&&str(x.title,110)&&str(x.category,80)&&str(x.status,105)&&str(x.description,330)&&arr(x.themes,8)&&x.themes.every(v=>str(v,100))))throw Error('Invalid interest entries.');
 if(!raw.themes.every(x=>x&&str(x.label,110)&&str(x.description,330)))throw Error('Invalid psychology entries.');
 if(!raw.answers.every(x=>x&&['direct','psych'].includes(x.quiz)&&str(x.question,230)&&arr(x.selection,60)&&x.selection.every(v=>str(v,160))&&str(x.intentLabel||'',80)))throw Error('Invalid answer entries.');
 if(raw.toys&&!raw.toys.every(x=>x&&str(x.title,80)&&str(x.mode,60)&&str(x.male,260)&&str(x.female,260)&&str(x.shared,260)&&str(x.safety,300)))throw Error('Invalid shared toy entries.');
 if(!raw.interests.length&&!raw.themes.length&&!raw.answers.length&&!(raw.toys||[]).length)throw Error('This report contains no shared items.');
 return raw;
}
async function readFile(file){
 if(!file||file.size>200000)throw Error('Choose a selected JSON report under 200 KB.');
 return validate(JSON.parse(await file.text()));
}
const common=(a,b)=>{const map=new Map(a.map(x=>[cleanLabel(x.label||x.title),x]));return b.filter(x=>map.has(cleanLabel(x.label||x.title))).map(x=>({one:map.get(cleanLabel(x.label||x.title)),two:x}))};
const only=(a,b)=>{const keys=new Set(b.map(x=>cleanLabel(x.label||x.title)));return a.filter(x=>!keys.has(cleanLabel(x.label||x.title)))};
const addText=(root,title,body)=>{const c=E('article',undefined,'uc-result');c.append(E('h4',title),E('p',body));root.append(c)};
const questionMatches=(a,b)=>{
 const byQuestion=new Map(a.map(x=>[String(x.question).trim().toLocaleLowerCase(),x]));
 return b.flatMap(x=>{const first=byQuestion.get(String(x.question).trim().toLocaleLowerCase());return first?[{one:first,two:x}]:[]});
};
function topicPrompt(label){
 const t=String(label).toLocaleLowerCase();
 if(/trust|safe|boundar|privacy|consent/.test(t))return 'What helps each of us feel safe saying yes, no, or not yet—and what should stay private?';
 if(/communicat|listen|understand|express/.test(t))return 'When something matters, do you prefer to be heard first, asked questions, or offered solutions?';
 if(/novel|explor|curios|experiment|surpris/.test(t))return 'How can we make room for curiosity while respecting different comfort levels and the option not to act?';
 if(/attach|intimac|connect|closeness|affection/.test(t))return 'What small gestures help each of us feel close, and when do we need personal space?';
 if(/affirm|prais|validat|attention/.test(t))return 'Which words or gestures feel encouraging—and which might feel uncomfortable?';
 if(/control|autonom|lead|independ/.test(t))return 'Which choices do we each want to make independently, and which should we plan together?';
 if(/sens|texture|comfort|stress|arousal/.test(t))return 'What environments, sensations, or pacing help each of us feel comfortable?';
 if(/routine|ritual|anticipat|predict/.test(t))return 'How much advance planning versus flexibility feels supportive to each of us?';
 return 'What does this theme mean to each of us, and what is one respectful way we could support each other?';
}
function visualActionPaths(out,labels){
 if(!labels.length)return;
 const wrap=E('section',undefined,'uc-action-paths');
 wrap.append(E('h4','From shared themes to better conversations'),E('p','Choose a relevant question together; these are prompts for learning, not conclusions about either person.','uc-note'));
 for(const label of [...new Set(labels)].slice(0,4)){
  const row=E('div',undefined,'uc-action-path'),topic=E('span',label,'uc-action-topic');
  const arrow=E('span','→','uc-action-arrow'),prompt=E('span',topicPrompt(label),'uc-action-prompt');
  row.append(topic,arrow,prompt);wrap.append(row);
 }
 out.append(wrap);
}

function compare(a,b){
 const out=$('uc-results');out.replaceChildren();
 $('uc-print').hidden=false;
 out.append(E('h3','Your shared dynamics: '+(a.from||'Partner A')+' + '+(b.from||'Partner B')));
 out.append(E('p','A reflection guide based only on items both people chose to share. Different or missing selections are not evidence of incompatibility. Scores and descriptions cannot predict relationship outcomes.','uc-note'));
 const both=common(a.themes,b.themes),aOnly=only(a.themes,b.themes),bOnly=only(b.themes,a.themes);
 const together=common(a.interests,b.interests),ia=only(a.interests,b.interests),ib=only(b.interests,a.interests);
 const commonToys=common(a.toys||[],b.toys||[]),aToys=only(a.toys||[],b.toys||[]),bToys=only(b.toys||[],a.toys||[]);
 const dashboard=E('section',undefined,'uc-dashboard');dashboard.setAttribute('aria-label','Visual comparison of shared report selections');
 const tiles=E('div',undefined,'uc-metric-grid');
 for(const [value,label,context] of [[both.length,'Shared psychology themes','Reported by both'],[together.length,'Shared intimate topics','Selected by both'],[aOnly.length+bOnly.length,'Individual psychology themes','Not matched in shared selections'],[ia.length+ib.length,'Individual intimate topics','Not matched in shared selections']]){
  const tile=E('div',undefined,'uc-metric');tile.append(E('strong',value),E('span',label),E('small',context));tiles.append(tile);
 }
 dashboard.append(E('h4','Your shared landscape'),E('p','Counts represent selected report topics only—not percentages of relationship compatibility.','uc-note'),tiles);
 const labels=[['Psychology themes',both.length,aOnly.length,bOnly.length],['Intimate topics',together.length,ia.length,ib.length]];
 const chart=E('div',undefined,'uc-chart');
 for(const [label,shared,first,second] of labels){
  const total=Math.max(1,shared+first+second),line=E('div',undefined,'uc-chart-line');
  line.append(E('strong',label));
  const segments=E('div',undefined,'uc-chart-track');segments.setAttribute('role','img');segments.setAttribute('aria-label',label+': '+shared+' common, '+first+' A only, '+second+' B only');
  for(const [amount,cls] of [[shared,'common'],[first,'a'],[second,'b']])if(amount){const seg=E('span',undefined,'uc-segment '+cls);seg.style.width=(amount/total*100)+'%';segments.append(seg)}
  line.append(segments,E('small',shared+' shared · '+first+' A only · '+second+' B only'));chart.append(line);
 }
 dashboard.append(chart);
 const sharedConnections=[...both.map(x=>({label:x.one.label,kind:'Psychology'})),...together.map(x=>({label:x.one.title,kind:'Intimate'}))].slice(0,8);
 if(sharedConnections.length){
  const map=E('div',undefined,'uc-connection-map');
  map.append(E('h4','Where your two reports connect'));
  for(const item of sharedConnections){
   const line=E('div',undefined,'uc-connection-row');
   line.append(E('span',a.from||'Partner A','uc-connection-person'));
   const link=E('div',undefined,'uc-connection-link');
   link.append(E('i',undefined,'uc-connection-rule'),E('strong',item.label),E('small',item.kind+' · selected by both'));
   line.append(link,E('span',b.from||'Partner B','uc-connection-person'));map.append(line);
  }
  map.append(E('p','These connections show matching topics voluntarily included by each person. They do not show agreement about meaning, boundaries or real-life participation.','uc-note'));
  dashboard.append(map);
 }
 out.append(dashboard);
 addText(out,'How to read the visual overview','Matching labels are conversation starting points; individual selections can reflect different interests, different experiences, or simply what each person chose to disclose. The number of labels is not a scientific measure of how well you fit together.');
 if(both.length)addText(out,'Shared psychology themes',both.map(x=>x.one.label).join(' · ')+'. Ask when these patterns show up in daily life and what support feels helpful to each person.');
 if(together.length)addText(out,'Shared intimate interests',together.map(x=>x.one.title).join(' · ')+'. Compare what each interest means personally, including fantasy versus real-life intentions and boundaries.');
 if(aOnly.length||bOnly.length)addText(out,'Different psychology themes',(a.from||'Partner A')+': '+(aOnly.map(x=>x.label).join(', ')||'none separately selected')+'. '+(b.from||'Partner B')+': '+(bOnly.map(x=>x.label).join(', ')||'none separately selected')+'. Ask each other how to offer support rather than assuming these represent opposite personalities.');
 if(ia.length||ib.length)addText(out,'Individual interests',(a.from||'Partner A')+': '+(ia.map(x=>x.title).join(', ')||'none separately selected')+'. '+(b.from||'Partner B')+': '+(ib.map(x=>x.title).join(', ')||'none separately selected')+'. Each person can share curiosity without pressure to participate, agree, or explain private material.');
 if(commonToys.length||aToys.length||bToys.length){
  const toySection=E('section',undefined,'uc-answer-comparison');
  toySection.append(E('h4','Toy-guide topics separately approved for comparison'),
   E('p','Only categories individually included in each exported report appear here. A matching category is not agreement to use it; fantasy-only remains reading-only.','uc-note'));
  if(commonToys.length)addText(toySection,'Topics both chose to disclose',commonToys.map(x=>x.one.title).join(' · ')+'. Compare each person’s comfort, anatomy and whether either simply wanted information.');
  for(const [group,label] of [[a.toys||[],a.from||'Partner A'],[b.toys||[],b.from||'Partner B']]){
   if(!group.length)continue;
   const card=E('div',undefined,'uc-result');
   card.append(E('h4',label+' · explicitly shared toy notes'));
   for(const toy of group){
    const entry=E('article',undefined,'uc-answer-pair');
    entry.append(E('strong',toy.title+' · '+toy.mode),
     E('p','Male anatomy: '+toy.male),E('p','Female anatomy: '+toy.female),
     E('p','With a partner: '+toy.shared),E('p','Safety: '+toy.safety,'uc-note'));
    card.append(entry);
   }
   toySection.append(card);
  }
  out.append(toySection);
 }
 const matchedAnswers=questionMatches(a.answers,b.answers);
 if(matchedAnswers.length){
  const box=E('section',undefined,'uc-answer-comparison');
  box.append(E('h4','Questions you both chose to share'),E('p','Read the answers side by side. A shared question does not mean equal enthusiasm, intent, or permission to act.','uc-note'));
  for(const x of matchedAnswers.slice(0,10)){
   const card=E('article',undefined,'uc-answer-pair');
   card.append(E('strong',x.one.question));
   const pair=E('div',undefined,'uc-answer-columns');
   for(const [answer,name] of [[x.one,a.from||'Partner A'],[x.two,b.from||'Partner B']]){
    const side=E('div',undefined,'uc-answer-side');
    side.append(E('b',name),E('p',(answer.selection||[]).join(' · ')));
    if(answer.intentLabel)side.append(E('small','Stated intention: '+answer.intentLabel));
    pair.append(side);
   }
   card.append(pair);box.append(card);
  }
  box.append(E('p','Try asking: “What did you mean by this answer, and does it refer to everyday life, imagination, or something you would actually want to discuss?”','uc-note'));
  out.append(box);
 }
 visualActionPaths(out,[...both.map(x=>x.one.label),...aOnly.map(x=>x.label),...bOnly.map(x=>x.label)]);
 if(!both.length&&!together.length)addText(out,'Start with curiosity','Your selected sections have no exact shared labels. That may simply reflect different sharing choices. Ask what you value, what you need, and where you already work well together.');
 addText(out,'Communication: three useful prompts','1. “When do you feel most understood by me?”  2. “When we differ, do you prefer time, reassurance, questions, or practical problem-solving?”  3. “What is one small change we can each try this week?”');
 addText(out,'Growth plan','Choose one similarity to build on and one difference to discuss without blame. Take turns summarizing what you heard, ask whether you understood correctly, agree on one manageable action, then check in again. Respect a no, an unsure, or a preference to keep something private.');
 addText(out,'Limits and consent','This is not a psychological assessment or compatibility score. Sharing an intimate interest never implies consent. Neither partner needs to disclose everything, and any activity requires specific, ongoing agreement.');
}
function mount(){
 const host=$('uc-comparison');if(!host)return;
 host.innerHTML='<h2>Compare two selected partner reports</h2><p>Explore intimacy, everyday psychology, or both. Each person chooses what to share; compare only the two selected files, right here in your browser.</p><details id="uc-export"><summary>Step 1 · Create my selected report</summary><div id="uc-select"></div><button class="btn" type="button" id="uc-save">Download selected report</button></details><div class="uc-upload"><label>Step 2 · Partner A report <input id="uc-a" type="file" accept=".json,application/json"></label><label>Step 3 · Partner B report <input id="uc-b" type="file" accept=".json,application/json"></label></div><button class="btn" type="button" id="uc-compare">Compare our chosen sections</button><button class="btn alt" type="button" id="uc-print" hidden>Save visual comparison as PDF</button><p id="uc-status" role="status"></p><div id="uc-results" aria-live="polite"></div><p class="uc-note">Reports stay on this device while you compare; nothing is uploaded. Use selected-report JSON exports, not full private quiz backups. Never share a report without its owner’s permission.</p>';
 $('uc-export').addEventListener('toggle',()=>{if($('uc-export').open)exportChoices()});
 $('uc-save').onclick=save;
 $('uc-print').onclick=()=>{if(!$('uc-results').children.length)return;document.body.classList.add('print-unwrapped-comparison');window.print()};
 window.addEventListener('afterprint',()=>document.body.classList.remove('print-unwrapped-comparison'));
 $('uc-compare').onclick=async()=>{
  try{if(!$('uc-a').files[0]||!$('uc-b').files[0])throw Error('Choose both partners’ selected reports first.');
   const [a,b]=await Promise.all([readFile($('uc-a').files[0]),readFile($('uc-b').files[0])]);
   if(JSON.stringify(a)===JSON.stringify(b))throw Error('These are identical reports. Choose one selected report from each person.');
   compare(a,b);status('Comparison ready · only shared selections were considered.');
  }catch(e){$('uc-results').replaceChildren();$('uc-print').hidden=true;status('Could not compare: '+(e.message||'Invalid file.'))}
 };
 const button=E('button','Compare partner reports','btn alt');button.type='button';button.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('visible',t.id==='notebook'));document.querySelectorAll('[data-tab]').forEach(t=>t.classList.toggle('selected',t.dataset.tab==='notebook'));host.scrollIntoView({behavior:'smooth',block:'start'})};
 const card=document.querySelector('#home .od-compact-tools-grid .od-compact-tool:nth-child(2) .od-compact-actions');if(card)card.append(button);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();