/* Editorial layout pass for the existing locally generated report.
 * Uses the existing canonical data. Scores, selections and exports are unchanged.
 * No new data leaves the browser. */
(() => {
 'use strict';
 const original=window.AfterDarkDetailedReport;
 if(!original || typeof original.build!=='function')return;
 const make=(tag,cls,text)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined)el.textContent=String(text);
  return el;
 };
 const buckets=[
  {id:'connection',icon:'✦',title:'Connection, trust & care',tags:['attachment','affirmation','trust']},
  {id:'roles',icon:'◇',title:'Roles, agency & rituals',tags:['control','ritual']},
  {id:'sensory',icon:'◉',title:'Sensation & aesthetics',tags:['sensation','aesthetics','associations']},
  {id:'imagination',icon:'✧',title:'Imagination, novelty & anticipation',tags:['novelty','narrative','anticipation','taboo']}
 ];
 function bucketFor(item){
  const tags=item.themeTags||item.themes||[];
  const category=String(item.category||'').toLowerCase();
  const scores=buckets.map((group,i)=>({
   i,score:group.tags.reduce((n,t)=>n+(tags.includes(t)?1:0),0)
  }));
  if(/sensory|sound|body|aesthetic|fashion|clothing|accessor/.test(category))scores[2].score+=1.4;
  if(/power|bdsm|authority/.test(category))scores[1].score+=1.4;
  if(/romance|relationship|watching|group/.test(category))scores[0].score+=1.1;
  if(/fantasy|story|playful|novelty/.test(category))scores[3].score+=1.1;
  scores.sort((a,b)=>b.score-a.score||a.i-b.i);
  return scores[0].i;
 }
 function appendKicker(parent,text){
  parent.append(make('p','report-mini-kicker',text));
 }
 function chart(parent,data){
  const entries=Object.entries(data.axes?.combined||{}).filter(([key,value])=>value>0&&data.lenses?.[key])
   .sort((a,b)=>b[1]-a[1]).slice(0,6);
  const panel=make('div','report-quick-map');
  const header=make('div','report-map-heading');
  header.append(make('span','report-map-symbol','✳'));
  const titles=make('div');
  titles.append(make('h3','', 'Your themes at a glance'));
  titles.append(make('p','report-muted','Relative emphasis in your selected answers — not a prediction or diagnostic score.'));
  header.append(titles);panel.append(header);
  if(!entries.length){panel.append(make('p','report-muted','Answer more questions to populate this overview.'));parent.append(panel);return;}
  const max=Math.max(1,...entries.map(([key,value])=>value));
  const chart=make('div','report-theme-chart');
  entries.forEach(([key,value],i)=>{
   const row=make('div','report-chart-row');
   const label=make('span','',data.lenses[key].label);
   const track=make('div','report-chart-track');
   track.setAttribute('role','img');
   track.setAttribute('aria-label',data.lenses[key].label+': '+Math.round(100*value/max)+' percent relative to the top theme');
   const bar=make('span','report-chart-fill');
   bar.style.width=Math.round(100*value/max)+'%';
   track.append(bar);row.append(label,track);chart.append(row);
  });
  panel.append(chart);
  parent.append(panel);
 }
 function glance(doc,data){
  const overview=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('01'));
  if(!overview)return;
  const wrap=make('div','report-glance');
  appendKicker(wrap,'YOUR PERSONAL SNAPSHOT');
  wrap.append(make('h3','report-glance-heading','The big picture'));
  const chips=make('div','report-glance-cards');
  const confirmed=(data.interests||[]).filter(x=>x.directSelection||x.specificSelected);
  const suggested=(data.interests||[]).filter(x=>!x.directSelection&&!x.specificSelected);
  for(const [icon,value,label] of [
   ['✦',confirmed.length,'Directly named / selected'],
   ['✧',suggested.length,'Unconfirmed suggestions'],
   ['◉',Object.values(data.axes?.combined||{}).filter(v=>v>0).length,'Themes in answers']
  ]){
   const box=make('div','report-glance-card');
   box.append(make('span','report-glance-icon',icon),make('strong','',value),make('span','',label));
   chips.append(box);
  }
  wrap.append(chips);
  const top=(data.interests||[]).slice(0,5);
  if(top.length){
   const spotlight=make('div','report-spotlight');
   appendKicker(spotlight,'FIVE TOPICS TO READ FIRST');
   const group=make('div','report-spotlight-grid');
   top.forEach((item,i)=>{
    const tile=make('div','report-spotlight-item');
    tile.append(make('span','report-spotlight-index',String(i+1).padStart(2,'0')));
    const content=make('div');
    content.append(make('strong','',item.name));
    content.append(make('small','',item.directSelection?'You marked this topic':item.specificSelected?'Appears in your direct answers':'Suggested from shared themes'));
    tile.append(content);group.append(tile);
   });
   spotlight.append(group);wrap.append(spotlight);
  }
  chart(wrap,data);
  overview.insertBefore(wrap,overview.children[2]||null);
 }
 function insightAndAgreement(doc,data){
  const overview=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('01'));
  const top=Object.entries(data.axes?.combined||{}).filter(([k,v])=>v>0&&data.lenses?.[k])
   .sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(overview){
   const intro=make('div','report-insight');
   appendKicker(intro,'YOUR PERSONAL INTERPRETATION');
   intro.append(make('h3','',top.length?'What stands out from your answers':'A first look at your answers'));
   if(top.length){
    const labels=top.map(([k])=>data.lenses[k].label.toLowerCase());
    intro.append(make('p','', 'Your answers repeatedly touch on '+labels.join(', ')+'. These are themes in what you selected, not claims about what caused any interest.'));
   }
   const direct=(data.interests||[]).filter(x=>x.directSelection||x.specificSelected).slice(0,3);
   if(direct.length)intro.append(make('p','', 'You have directly named or marked '+direct.map(x=>x.name.toLowerCase()).join(', ')+'. Your own stated intentions carry more weight than any theme-only match.'));
   else intro.append(make('p','', 'No particular interest has yet been directly named or marked. Any interests further in this report are topics to read about, not preferences inferred about you.'));
   if(data.direct.answered>0&&data.psych.answered>0){
    intro.append(make('p','', 'The second questionnaire adds everyday context. When it overlaps with a chosen interest, it helps you ask a better question about meaning—without turning that overlap into a diagnosis.'));
   }else intro.append(make('p','', 'This is a partial interpretation. You can still finish either quiz and generate an updated report.'));
   overview.insertBefore(intro,overview.querySelector('.report-glance')||overview.children[2]||null);
  }
  const map=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('03'));
  if(!map)return;
  const comparison=make('div','report-comparison');
  appendKicker(comparison,'SIDE BY SIDE · YOUR ACTUAL ANSWERS');
  comparison.append(make('h3','','What each quiz contributed'));
  const pairs=[];
  for(let i=0;i<data.psych.questions.length;i++){
   const psych=data.psych.questions[i],direct=data.direct.questions.find(q=>q.coreId===i+1);
   if(!psych?.selected?.length||!direct?.selected?.length)continue;
   const shared=[...new Set(direct.selected.flatMap(a=>a.axes||[]))]
    .filter(tag=>psych.selected.some(b=>(b.axes||[]).includes(tag)));
   pairs.push({direct,psych,shared});
  }
  const both=pairs.filter(x=>x.shared.length);
  const different=pairs.filter(x=>!x.shared.length);
  comparison.append(make('p','',pairs.length?
   both.length+' of '+pairs.length+' corresponding answered pairs share at least one coded theme. This counts overlap in the site’s categories; it is not a validity score or a probability of desire.':
   'Not enough matching answers have been provided to compare the quizzes yet.'));
  const sub=make('div','report-comparison-columns');
  const directTile=make('div','report-comparison-tile');
  directTile.append(make('strong','','Sexual Preferences Quiz'),make('p','','Captures named interests, specific activities, self-reported intention, fantasy-only choices and personal boundaries.'));
  const psychTile=make('div','report-comparison-tile');
  psychTile.append(make('strong','','Everyday Psychology Quiz'),make('p','','Adds nonsexual answers about trust, attention, anticipation, sensation, roles and context. It does not create a new sexual preference.'));
  sub.append(directTile,psychTile);comparison.append(sub);
  const chosen=[...both.slice(0,3),...different.slice(0,1)];
  for(const p of chosen){
   const row=make('article','report-comparison-pair');
   const source=make('div');
   source.append(make('strong','','Direct: Q'+p.direct.number),make('p','',(p.direct.selected||[]).map(x=>x.text).join(' / ').slice(0,230)));
   const reflected=make('div');
   reflected.append(make('strong','','Psychology: Q'+p.psych.number),make('p','',(p.psych.selected||[]).map(x=>x.text).join(' / ').slice(0,230)));
   row.append(source,reflected);
   row.append(make('small','',p.shared.length?'Shared coded themes: '+p.shared.map(t=>data.lenses?.[t]?.label||t).join(', '):'Different emphasis: no shared coded theme in this pair. That is not a contradiction.'));
   comparison.append(row);
  }
  const boundary=(data.direct.specificSelections||[]).filter(x=>x.intent==='fantasy').slice(0,4);
  if(boundary.length){
   const b=make('div','report-intentions');
   b.append(make('strong','','Fantasy-only selections remain fantasy-only'));
   b.append(make('p','',boundary.map(x=>x.text).join(' · ').slice(0,320)));
   comparison.append(b);
  }
  comparison.append(make('p','report-muted','Directly selected interests and explicit Not for me choices always override broader thematic associations. A mismatch is a question to consider, not an error to conceal.'));
  map.append(comparison);
 }
 function pruneRepeated(article,item,data){
  article.classList.add('report-interest-compact');
  // Keep short, specific supporting explanations beside each selected theme.
  // Those explanations are the value of a combined psychology report.
  // Keep up to three examples per quiz: the authoring layer already caps the
  // evidence lists. Do not erase the specific answers behind a report claim.
  // The contributor's own themes and reflection prompts remain visible.
  // Do not silently truncate supporting evidence to improve page count.
  // A single shared guidance section explains general limits and safeguards.
  // Keep distinctive, topic-specific caution where applicable.
  for(const heading of [...article.querySelectorAll(':scope > h4')]){
   const label=heading.textContent||'';
   if(/^6\.|^7\./.test(label)){
    const isSafety=/^7\./.test(label);
    let node=heading.nextSibling;
    while(node&&!(node.nodeType===1&&node.tagName==='H4')){
     const next=node.nextSibling;
     if(!(isSafety&&item.warn&&node.nodeType===1&&node.classList.contains('report-boundaries')))node.remove();
     node=next;
    }
    heading.remove();
   }else if(/^3\./.test(label))heading.textContent='Evidence from your answers';
   else if(/^4\./.test(label))heading.textContent='Ideas to reflect on';
   else if(/^5\./.test(label))heading.textContent='Conversation starter';
   else if(/^2\./.test(label))heading.textContent='Related psychological themes';
   else if(/^1\./.test(label))heading.textContent='Why this topic appears';
  }
  // Avoid restating disclaimers and cross-links in every profile.
  const lead=[...article.querySelectorAll(':scope > p.report-muted')];
  for(const p of lead){
   if(p.textContent.startsWith('These are optional, named possibilities')||
      p.textContent.startsWith('Partner responses are independent.'))p.remove();
  }
  const related=article.querySelector(':scope > .report-related');
  if(related){const heading=related.previousElementSibling;related.remove();if(heading?.tagName==='H3')heading.remove();}
  // Offer a friendly invitation, without turning theme overlap into a prediction.
  for(const p of article.querySelectorAll(':scope > p')){
   if(p.textContent.startsWith('This interest was suggested from the same psychological themes behind your answers.'))
    p.textContent='Another connection to consider: '+item.name+'. Some of your reflections touch on themes connected to this topic. It might be interesting to read about, and only you get to decide whether it fits.';
  }
  // Distinguish selected, specifically named, fantasy-only and unconfirmed topics.
  const classification=item.directSelection===2?'interested':item.directSelection===1?'curious':item.specificSelected?'named':'suggested';
  article.dataset.evidence=classification==='suggested'?'suggested':'selected';
  article.dataset.selectionType=classification;
  const status=article.querySelector('.report-status');
  if(status){
   status.textContent=classification==='interested'?'You marked this topic: Interested':
    classification==='curious'?'You marked this topic: Curious':
    classification==='named'?'You specifically selected this topic':'Theme-based suggestion only';
   const match=(data.direct?.specificSelections||[])
    .filter(p=>p.context!=='Adult media watched / imagined'&&(p.interests||[]).includes(item.name))
    .map(p=>p.intentLabel).filter(x=>x&&x!=='Not specified');
   const distinct=[...new Set(match)];
   if(distinct.length){
    const intent=make('span','report-intent-label',distinct.join(' · '));
    status.after(intent);
   }
   const score=make('small','report-scoring-caption',`Illustrative theme fit: ${item.illustrativeFit}/100; not a probability or an assessment.`);
   status.after(score);
  }
 }
 function groupProfiles(doc,data){
  const section=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('04'));
  if(!section)return;
  const articles=[...section.querySelectorAll(':scope > .report-interest')];
  if(!articles.length)return;
  const items=data.interests||[];
  const groups=buckets.map(()=>[]);
  for(let i=0;i<articles.length;i++){
   const item=items[i];if(!item)continue;
   pruneRepeated(articles[i],item,data);
   if(!item.directSelection&&!item.specificSelected){
    const suggested=make('div','report-unconfirmed');
    // Attach to Section 05, separate from declared or directly named interests.
    const other=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('05'));
    if(other){
     let list=other.querySelector(':scope > .report-unconfirmed-collection');
     if(!list){
      list=make('div','report-unconfirmed-collection');
      list.append(make('h3','','Possible connections — not declared interests'));
      list.append(make('p','report-muted','The following names arise from overlapping themes. You did not directly confirm these topics as something you want.'));
      other.insertBefore(list,other.children[2]||null);
     }
     list.append(articles[i]);
    }
    continue;
   }
   groups[bucketFor(item)].push({article:articles[i],item,order:i});
  }
  for(const group of groups)group.sort((a,b)=>
   a.item.category.localeCompare(b.item.category)||a.order-b.order);
  const heading=section.querySelector(':scope > h2');
  if(heading)heading.textContent='04 · Interests you named or selected';
  const subtitle=heading?.nextElementSibling;
  if(subtitle?.tagName==='P')subtitle.textContent='Only directly named interests and your own Curious / Interested selections are presented here. Each profile shows direct answers alongside related nonsexual psychology answers. Unconfirmed ideas appear separately in Section 05.';
  for(const g of buckets){
   const entries=groups[buckets.indexOf(g)];
   if(!entries.length)continue;
   const cluster=make('div','report-cluster');
   cluster.dataset.cluster=g.id;
   const header=make('header','report-cluster-header');
   header.append(make('span','report-cluster-icon',g.icon));
   const titles=make('div');
   titles.append(make('h3','',g.title));
   titles.append(make('p','',entries.length+' related '+(entries.length===1?'topic':'topics')));
   header.append(titles);cluster.append(header);
   let previous='';
   for(const {article,item} of entries){
    if(item.category!==previous){
     cluster.append(make('h4','report-category-label',item.category));
     previous=item.category;
    }
    cluster.append(article);
   }
   section.append(cluster);
  }
 }
 function abbreviateSuggestions(doc){
  const section=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('05'));
  if(!section)return;
  const heading=section.querySelector(':scope > h2');
  if(heading)heading.textContent='05 · Unconfirmed ideas for further reading';
  for(const article of section.querySelectorAll(':scope > .report-extra')){
   const ul=article.querySelector('ul');
   // Retain the originally selected explanations, up to the original three examples.
  }
 }
 function polish(doc){
  const data=window.AfterDarkCanonicalReport?.buildData?.();
  if(!data)return doc;
  doc.dataset.reportVersion='3';
  doc.classList.add('report-editorial');
  const cover=doc.querySelector('.report-cover');
  if(cover){
   const art=make('div','report-cover-art');
   art.setAttribute('aria-hidden','true');
   art.append(make('span','report-art-orb'),make('span','report-art-orb report-art-orb-two'),make('span','report-art-line'));
   cover.insertBefore(art,cover.firstChild);
  }
  glance(doc,data);
  insightAndAgreement(doc,data);
  groupProfiles(doc,data);
  abbreviateSuggestions(doc);
  if(window.AfterDarkReportQR?.create)doc.append(window.AfterDarkReportQR.create());
  const guidance=[...doc.children].find(x=>x.matches?.('section')&&x.querySelector('h2')?.textContent.startsWith('07'));
  if(guidance){
   const title=guidance.querySelector('h2');
   if(title)title.textContent='07 · What to keep in mind';
  }
  return doc;
 }
 window.AfterDarkDetailedReport=Object.freeze({
  ...original,
  build(){
   const doc=original.build();
   try{return polish(doc)}
   catch(error){console.warn('Report formatting fallback:',error);return doc}
  }
 });
})();
