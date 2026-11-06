/* Unwrapped connection web: links are theme tags in actual responses and opted-in topics. */
(()=>{'use strict';
const html=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=String(text);return e};
const append=(to,tag,cls,text)=>{const e=html(tag,cls,text);to.append(e);return e};
const svgNS='http://www.w3.org/2000/svg';
const shape=(tag,attrs={},text)=>{const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!=null)e.textContent=String(text);return e};
const norm=v=>String(v||'').trim().toLowerCase();
const plainTheme=s=>({
 'chosen vulnerability':'Feeling safe opening up',
 'exploration & reward':'Curiosity and enjoyment',
 'agency & choice':'Personal choice and control',
 'closeness & reassurance':'Closeness and reassurance',
 'feeling seen':'Feeling noticed and appreciated',
 'sensory salience':'Sensations and comfort',
 'expectation and pacing':'Anticipation and timing',
 'visual and cultural codes':'Appearance, style and meaning',
 'fantasy and identity':'Imagination and self-expression'
})[norm(s)]||String(s||'');

function create({center='MY ANSWERS',themes=[],topics=[],intro='',bothLabel='Theme in both quizzes',selectedLabel='Interest you selected'}={}){
 const root=html('figure','unwrapped-web');
 append(root,'figcaption','unwrapped-web-title','The connections between your answers');
 append(root,'p','unwrapped-web-intro',intro||'Follow the lines from questionnaire themes to selected topics. Outlined ideas are optional, not established preferences.');
 const mids=themes.slice(0,8).map((t,i,nodes)=>({...t,x:500+182*Math.cos(-Math.PI/2+2*Math.PI*i/nodes.length),y:345+160*Math.sin(-Math.PI/2+2*Math.PI*i/nodes.length)}));
 const outs=topics.slice(0,11).map((t,i,nodes)=>({...t,x:500+393*Math.cos(-Math.PI/2+.12+2*Math.PI*i/nodes.length),y:345+270*Math.sin(-Math.PI/2+.12+2*Math.PI*i/nodes.length)}));
 if(!mids.length){append(root,'p','', 'Answer the questionnaires to see your connections.');return root}
 const svg=shape('svg',{viewBox:'0 0 1000 700',role:'img','aria-label':'A web connecting '+mids.map(t=>t.label).join(', ')+' to '+outs.map(t=>t.label).join(', ')});
 svg.classList.add('unwrapped-web-svg');
 const drawLine=(a,b,type)=>svg.append(shape('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'web-line '+type}));
 for(const t of mids)drawLine({x:500,y:345},t,t.direct&&t.psych?'both':'single');
 for(const item of outs){
  for(const theme of mids){
   if((item.themeIds||[]).some(v=>norm(v)===norm(theme.id))||(item.themeLabels||[]).some(v=>norm(v)===norm(theme.label)))
    drawLine(theme,item,item.kind==='possible'?'possible':'selected');
  }
 }
 const centerCircle=shape('g',{class:'web-center'});
 centerCircle.append(shape('circle',{cx:500,cy:345,r:67}));
 centerCircle.append(shape('text',{x:500,y:340,'text-anchor':'middle'},center));
 centerCircle.append(shape('text',{x:500,y:365,'text-anchor':'middle',class:'web-subtitle'},'The quiz responses'));
 svg.append(centerCircle);
 const addNode=(n,type)=>{
  const w=type==='theme'?132:149,h=53,group=shape('g',{class:'web-node '+type});
  group.append(shape('rect',{x:n.x-w/2,y:n.y-h/2,width:w,height:h,rx:12}));
  const words=String(type==='theme'?plainTheme(n.label):n.label).split(/\s+/),lines=[''];for(const word of words){
   let last=lines.length-1;if(lines[last]&&lines[last].length+word.length+1>(type==='theme'?19:20))lines.push(word);
   else lines[last]+=(lines[last]?' ':'')+word;
  }
  const txt=shape('text',{x:n.x,y:n.y-((Math.min(lines.length,3)-1)*7),'text-anchor':'middle'});
  lines.slice(0,3).forEach((l,i)=>txt.append(shape('tspan',{x:n.x,dy:i?15:0},l.slice(0,25))));
  group.append(txt,shape('title',{},n.label+(type==='possible'?' — optional reading idea':'')));svg.append(group);
 };
 mids.forEach(t=>addNode(t,'theme'));
 outs.forEach(t=>addNode(t,t.kind==='possible'?'possible':'selected'));
 root.append(svg);
 const legend=append(root,'div','unwrapped-web-legend');
 for(const [cl,label] of [['both',bothLabel],['selected',selectedLabel],['possible','Unconfirmed reading idea']]){
  const item=append(legend,'span','unwrapped-legend-item');append(item,'i','unwrapped-legend-dot '+cl);append(item,'span','',label);
 }
 append(root,'p','unwrapped-web-note','Lines reflect coded overlaps in answers, not causes, hidden wishes, compatibility or consent. The original answer record remains in the appendix.');
 return root;
}
const chosen=i=>i.directSelection>0||i.specificSelected;
function personal(d){
 const direct=d.direct?.questions||[],psych=d.psych?.questions||[];
 const tags=q=>new Set(q.flatMap(x=>(x.selected||[]).flatMap(v=>v.axes||[])));
 const a=tags(direct),b=tags(psych);
 const keys=[...new Set([...a,...b])].filter(k=>d.lenses?.[k]).sort((x,y)=>
  Number(a.has(y)&&b.has(y))-Number(a.has(x)&&b.has(x))||(d.axes?.combined?.[y]||0)-(d.axes?.combined?.[x]||0)).slice(0,8);
 const interests=d.interests||[],confirmed=interests.filter(chosen).filter(i=>(i.themeTags||[]).some(k=>keys.includes(k))).slice(0,7);
 const exploratory=interests.filter(i=>!chosen(i)&&!i.warn).filter(i=>(i.themeTags||[]).some(k=>keys.includes(k))).slice(0,3);
 const topics=[...confirmed.map(i=>({label:i.name,kind:'selected',themeIds:i.themeTags||[]})),...exploratory.map(i=>({label:i.name,kind:'possible',themeIds:i.themeTags||[]}))];
 const wrap=html('section','report-section unwrapped-web-section');
 append(wrap,'h2','','My connections, visually explained');
 wrap.append(create({themes:keys.map(k=>({id:k,label:d.lenses[k].label||k,direct:a.has(k),psych:b.has(k)})),topics,intro:'The middle ring shows themes supported by your answers. The outer ring separates interests you named from unconfirmed topics to consider reading about.'}));
 const panel=append(wrap,'div','unwrapped-web-playbook');
 append(panel,'h3','','Putting these insights into everyday life');
 const steps=append(panel,'div','unwrapped-web-steps');
 const prompts={
 trust:['Notice which boundaries and privacy choices help you feel at ease.','Explain one boundary to someone you trust, and ask what helps them feel comfortable.'],
 affirmation:['Notice what makes appreciation feel specific and genuine.','Ask for one kind of encouragement that feels meaningful to you.'],
 attachment:['Notice when closeness or personal space feels restorative.','Talk about how you both prefer to reconnect after a difficult day.'],
 sensation:['Pay attention to the sounds, lighting and pace that help you relax.','Try a comfortable setting for a conversation, then adjust together.'],
 novelty:['Separate enjoying an idea from wanting to try it.','Choose one optional new everyday experience with an easy way to decline.'],
 control:['Notice when you like choosing independently or planning together.','Take turns planning a low-stakes activity with clear boundaries.'],
 anticipation:['Notice what you enjoy about planning and looking forward.','Plan a small, no-pressure activity to look forward to.'],
 narrative:['Explore which stories or imaginary roles feel meaningful.','Talk about a fictional idea without assuming it is a request to act.']
 };
 for(const key of keys.slice(0,4)){
  const [reflect,act]=prompts[key]||['Notice when this theme comes up in everyday situations.','Ask a trusted person what this theme means to them.'];
  const card=append(steps,'article','unwrapped-web-step');
  append(card,'h4','',plainTheme(d.lenses[key].label||key));
  append(card,'p','','Understand: '+reflect);
  append(card,'p','','Try: '+act);
  const evidence=[...direct.map(q=>({...q,quiz:'Preferences'})),...psych.map(q=>({...q,quiz:'Everyday'}))].find(q=>(q.selected||[]).some(v=>(v.axes||[]).includes(key)));
  if(evidence)append(card,'small','','Based on '+evidence.quiz+' Q'+evidence.number+': '+(evidence.selected||[]).find(v=>(v.axes||[]).includes(key)).text.slice(0,110));
 }
 const named=(d.interests||[]).filter(chosen).slice(0,5);
 if(named.length){
  append(panel,'h3','unwrapped-web-practical-title','Exploring the interests I actually named');
  const choices=append(panel,'div','unwrapped-web-interest-grid');
  for(const item of named){
   const card=append(choices,'article','unwrapped-web-interest');
   append(card,'h4','',item.name);
   const state=item.directSelection===2?'Marked Interested':item.directSelection===1?'Marked Curious':'Named in an answer';
   append(card,'small','',state+' · not an obligation to act');
   const tags=(item.themeTags||[]).map(k=>plainTheme(d.lenses?.[k]?.label)).filter(Boolean).slice(0,3);
   if(tags.length)append(card,'p','','Related themes in my answers: '+tags.join(', ')+'. These are possible connections, not known causes.');
   const activity=Array.isArray(item.activities)?item.activities.find(x=>typeof x==='string'&&x.length>15):null;
   if(item.warn)append(card,'p','','A next step: stay with education or fictional reflection, and get appropriate safety information. There is no need to try a higher-risk activity.');
   else append(card,'p','','A next step: '+(activity||'Learn more about what appeals to you, or explore the idea privately as a story or conversation.') );
   append(card,'p','','How to express it: “This interested me because … . For now, I see it as a curiosity, a fantasy, or something I might discuss. What are your thoughts and boundaries?”');
  }
 }
 const discover=append(panel,'div','unwrapped-web-discover');
 append(discover,'h4','','What else might be worth exploring?');
 append(discover,'p','','Your selected interests are the starting point. Related ideas that you did not select are just optional reading topics, never facts about you.');
 if(confirmed.length)append(discover,'p','','Selected: '+confirmed.map(i=>i.name).join(' · '));
 if(exploratory.length)append(discover,'p','','Optional reading: '+exploratory.map(i=>i.name).join(' · '));
 append(discover,'p','','Reflect → describe what feels meaningful → discuss boundaries → choose an optional, safe next step → check in afterward. You can stop at reflection; you do not have to act on any interest.');
 return wrap;
}
function enhancePersonal(root,d){
 if(!root||!d||root.querySelector('.unwrapped-web-section'))return root;
 const block=personal(d),anchor=root.querySelector('.report-deep-connections');
 if(anchor)anchor.before(block);else root.append(block);
 return root;
}
window.UnwrappedReportWeb=Object.freeze({create,enhancePersonal});
})();