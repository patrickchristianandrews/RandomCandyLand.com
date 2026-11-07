/* Unwrapped | combined report: evidence-led, nonjudgmental early conversations.
 * Reads ONLY the two explicitly shared comparison packs.
 * No hidden quiz answers, diagnostic labels, compatibility scores or network calls. */
(()=>{'use strict';
const clean=s=>String(s||'').toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
const short=(s,n=220)=>String(s||'').slice(0,n);
const name=(p,fallback)=>short(p?.from||fallback,55);
const itemTitle=x=>x?.title||x?.label||'';
const own=(a,b)=>new Map((a||[]).map(x=>[clean(itemTitle(x)),x]));
const topics=(a,b)=>[...(a||[])].filter(x=>own(b).has(clean(itemTitle(x))));
const hasDistinctAnswers=(a,b)=>{
 const first=new Set((a.selection||[]).map(clean)),second=new Set((b.selection||[]).map(clean));
 return first.size!==second.size||[...first].some(x=>!second.has(x));
};
const formatAnswer=x=>(x?.selection||[]).slice(0,7).join(' · ')||'Not specified in shared selection';
const rubrics=[
 {re:/disagre|conflict|argument|misunderstand|apolog|repair|critici|disput|upset/,title:'Handling disagreements and repairing misunderstandings',
  why:'Different answers here may signal different ways of dealing with tension, not a problem with the relationship.',
  ask:'When something feels difficult, would each of us prefer space, reassurance, questions, or a practical conversation?',
  step:'Agree on a gentle way to pause a disagreement and a specific way to return to it.'},
 {re:/communicat|listen|talk|conversation|express|word|message|share|tell|vocal/,title:'How you each prefer to communicate',
  why:'Two people can care equally while preferring different timing or styles of conversation.',
  ask:'How do you like someone to approach you with something important?',
  step:'Try a check-in: ask whether the other person wants listening, reassurance, or help solving the issue.'},
 {re:/space|closeness|attach|affection|independ|reassur|emotional|connected|intimac|attention/,title:'Balancing closeness, space and reassurance',
  why:'The amount and type of connection that feels supportive can vary from person to person.',
  ask:'What feels like meaningful connection to each of us, and when does time alone help?',
  step:'Each share one simple gesture that feels caring and one way to request space respectfully.'},
 {re:/routine|spontan|plan|surpris|novel|predict|schedule|change|pace|anticipat|variety/,title:'Planning, spontaneity and pace',
  why:'One person may enjoy structure while the other enjoys flexibility; neither approach is automatically better.',
  ask:'When is it helpful to plan ahead, and when would we prefer to keep choices open?',
  step:'Choose one plan with a predictable core and an optional flexible part.'},
 {re:/boundary|consent|privacy|comfortable|limit|safe|trust|pressure|choice|control/,title:'Comfort levels and personal boundaries',
  why:'Explicitly shared differences can help clarify how to respect one another’s choices.',
  ask:'What makes it easiest for each of us to say yes, no, not yet, or I need to think?',
  step:'Name boundaries you have actually stated; treat unanswered or unshared topics as unknown.'},
 {re:/sens|touch|noise|quiet|environment|physical|stimul|stress|intens/,title:'Sensory comfort and emotional pacing',
  why:'Sensory preferences and comfort can change how shared experiences feel, even when intentions are good.',
  ask:'What settings, sounds, kinds of touch or pacing help each of us feel comfortable?',
  step:'Pick a low-pressure shared setting with clear options to adjust or leave.'},
 {re:/fantasy|curios|sex|sexual|toy|anal|penetrat|roleplay|erotic|pleasure|porn|kink|fetish/,title:'Intimate curiosity and different comfort levels',
  why:'Different preferences can lead to useful conversations, but interest, fantasy and permission are separate things.',
  ask:'Is this something to imagine, learn about, discuss, or potentially explore together—and what is off limits?',
  step:'Discuss one selected topic without presuming shared interest or agreement to do anything.'}
];
const defaultRubric={
 title:'Different answers worth understanding',
 why:'You chose different answers to a question you both approved for sharing. That can be useful information without being a concern.',
 ask:'What did each of us mean by our answer, and what might be helpful for the other person to know?',
 step:'Each person describes one real-life example, then ask what support would feel useful.'};
function rubric(q){return rubrics.find(r=>r.re.test(clean(q)))||defaultRubric}
function analyze(a,b){
 if(!a||!b)return[];
 const A=name(a,'Partner A'),B=name(b,'Partner B'),results=[];
 const byQ=new Map((a.answers||[]).map(x=>[(x.quiz||'')+'|'+clean(x.question),x]));
 const seen=new Set();
 for(const y of b.answers||[]){
  const key=(y.quiz||'')+'|'+clean(y.question),x=byQ.get(key);
  if(!x||seen.has(key))continue;seen.add(key);
  const difference=hasDistinctAnswers(x,y);
  const hasStatedIntent=value=>Boolean(value)&&!/(^|\b)(?:not specified|unsure|not sure|unknown|not stated|undecided)(?:\b|$)/i.test(String(value));
  const differingIntent=x.quiz==='direct'&&hasStatedIntent(x.intentLabel)&&hasStatedIntent(y.intentLabel)&&clean(x.intentLabel)!==clean(y.intentLabel);
  if(!difference&&!differingIntent)continue;
  const r=rubric(x.question);
  const intentLine=differingIntent?' Stated intentions also differ; these are not consent.':'';
  results.push({
   id:'question-'+key,score:x.quiz==='psych'?90:80,
   tag:x.quiz==='psych'?'Everyday dynamics · shared question':'Intimacy & boundaries · shared question',
   title:differingIntent?'Different intentions: '+r.title:r.title,
   source:short(x.question,200),
   first:A+': '+short(formatAnswer(x)+(x.intentLabel?' (intent: '+x.intentLabel+')':'')),
   second:B+': '+short(formatAnswer(y)+(y.intentLabel?' (intent: '+y.intentLabel+')':'')),
   why:r.why+intentLine,ask:r.ask,step:r.step
  });
 }
 // Only discuss the meaning of matching topics when BOTH voluntarily shared them.
 const bInterests=own(b.interests||[]);
 for(const x of a.interests||[]){
  const y=bInterests.get(clean(x.title));if(!y)continue;
  if(clean(x.status)===clean(y.status))continue;
  results.push({
   id:'interest-'+clean(x.title),score:65,tag:'Shared intimate topic · different descriptions',
   title:'A shared topic may mean something different',
   source:short(x.title,180),
   first:A+' included: '+short(x.status,100),
   second:B+' included: '+short(y.status,100),
   why:'These exported reports describe the same topic differently. Neither description proves a wish to try anything.',
   ask:'Is the topic an established preference, curiosity, or simply something you wanted to learn about?',
   step:'Let each person describe what the subject means to them, without assumptions about participation.'
  });
 }
 const aThemes=own(a.themes||[]),bThemes=own(b.themes||[]);
 const onlyA=[...(a.themes||[])].filter(x=>!bThemes.has(clean(x.label)));
 const onlyB=[...(b.themes||[])].filter(x=>!aThemes.has(clean(x.label)));
 if((a.themes||[]).length&&(b.themes||[]).length&&(onlyA.length||onlyB.length)){
  results.push({
   id:'themes',score:35,tag:'Different themes included in selected reports',
   title:'The themes each of you chose to highlight',
   source:'Psychology themes included in your shared files',
   first:A+' shared: '+short(onlyA.slice(0,3).map(x=>x.label).join(' · ')||'No additional unmatched theme'),
   second:B+' shared: '+short(onlyB.slice(0,3).map(x=>x.label).join(' · ')||'No additional unmatched theme'),
   why:'One-sided themes may reflect export choices, not psychological differences. This is an invitation to clarify what matters.',
   ask:'Which of these themes feels most relevant in everyday life, and which may simply not have been shared?',
   step:'Choose a theme to discuss, without asking anyone to reveal information they kept private.'
  });
 }
 const onlyIntA=[...(a.interests||[])].filter(x=>!bInterests.has(clean(x.title)));
 const onlyIntB=[...(b.interests||[])].filter(x=>!own(a.interests||[]).has(clean(x.title)));
 if((a.interests||[]).length&&(b.interests||[]).length&&(onlyIntA.length||onlyIntB.length)){
  results.push({
   id:'interests',score:25,tag:'Topics shared by one person, not matched in the other file',
   title:'Make room for different curiosities',
   source:'Intimate topics each person elected to share',
   first:A+' shared: '+short(onlyIntA.slice(0,2).map(x=>x.title).join(' · ')||'No additional unmatched topic'),
   second:B+' shared: '+short(onlyIntB.slice(0,2).map(x=>x.title).join(' · ')||'No additional unmatched topic'),
   why:'An unmatched topic is not a rejection or conflict: the other person may not have chosen to share that information.',
   ask:'Are there topics worth discussing, learning about separately, or leaving private?',
   step:'Talk about one approved topic without treating curiosity as an obligation or a compatibility measure.'
  });
 }
 return results.sort((x,y)=>y.score-x.score).slice(0,5);
}
const E=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
function render(out,a,b){
 if(!out)return null;
 const section=E('section','uc-lookouts');
 section.id='uc-lookouts';
 section.setAttribute('aria-label','Things to talk through early based on mutually shared quiz results');
 section.append(E('h4','Things to look out for — and work on together'),
  E('p','These are useful heads-ups, not red flags, diagnoses, or a prediction of compatibility. Every observation below comes from information BOTH people deliberately included in their shared files. Unshared answers are unknown, not disagreements.','uc-lookouts-intro'));
 const findings=analyze(a,b);
 if(!findings.length){
  const note=E('div','uc-lookout-empty');
  note.append(E('strong','No specific differences could be established from the shared material.'),
   E('p','','You can still check in about communication, closeness, personal space and expectations. For more tailored comparisons, both people can separately choose to share answers to the same psychology questions. Never infer a hidden preference from missing information.'));
  section.append(note);
 }else{
  const grid=E('div','uc-lookout-grid');
  for(const f of findings){
   const card=E('article','uc-lookout-card');
   card.append(E('span','uc-lookout-tag',f.tag),E('h5','',f.title),E('p','uc-lookout-why',f.why));
   const evidence=E('div','uc-lookout-evidence');
   evidence.append(E('strong','','Why this came up: '+f.source),
    E('p','',f.first),E('p','',f.second));
   card.append(evidence);
   const ask=E('p','uc-lookout-action');ask.append(E('strong','','Talk about: '),document.createTextNode(f.ask));
   const step=E('p','uc-lookout-action');step.append(E('strong','','Try early: '),document.createTextNode(f.step));
   card.append(ask,step);grid.append(card);
  }
  section.append(grid);
 }
 const close=E('p','uc-lookout-footer','Start with one conversation, not a list of problems to fix. Ask what each answer means, agree on one small adjustment if useful, and revisit it later. Respect all privacy choices and boundaries.');
 section.append(close);out.append(section);
 return section;
}
window.UnwrappedCoupleCheckins=Object.freeze({analyze,render});
})();