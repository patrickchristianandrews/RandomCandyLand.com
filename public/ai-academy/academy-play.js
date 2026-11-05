/* AI Academy interactive labs — entirely local, illustrative, no model required.
 * All controls used by #prompt-showdown and #prompt-coach have working handlers.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id), S='random-candy-ai-academy-play-v2',DRAFT='rcl-academy-draft-prompt';
const missions={
 website:{title:'Build a useful bakery website',goal:'Explain and design a small bakery website',prompts:[
  'Make me a website.',
  'Create a website for a local bakery with a menu, hours, and contact details.',
  'Create a mobile-first, accessible one-page bakery website in HTML/CSS. Include a friendly hero, sample menu, hours and contact section. Use warm colors, semantic markup, responsive navigation, and simple setup steps. Do not invent an address or opening hours; use clearly marked placeholders.'
 ],examples:[
  'The request leaves out audience, sections, format, and what information is actually known. A model may fill gaps with guesses.',
  'The main sections are specified, but the implementation format, accessibility, and unknown business details are not.',
  'Clear audience, deliverable, technical boundaries, and a quality check make the output easier to evaluate and revise.'
 ]},
 image:{title:'Create a product photograph',goal:'Describe an original product image',prompts:[
  'Make a cool product picture.',
  'Show a handmade ceramic mug on a table with warm lighting.',
  'Create a photorealistic editorial product photo of one handmade ceramic mug on a matte stone table. Soft window light from the left, subtle natural shadow, eye-level three-quarter view, clean background, entire mug visible, 4:5 portrait framing. No text or logos. Use an image-generation model.'
 ],examples:[
  'Subject, framing, style, and technical needs remain ambiguous.',
  'Subject and light are clearer, but crop, perspective, and constraints are missing.',
  'Specific visual subject, composition, lighting, and framing give a compatible image model useful guidance. Generation still depends on the chosen model.'
 ]},
 research:{title:'Evaluate a public claim',goal:'Check the evidence for a changing public claim',prompts:[
  'Tell me if this story is true.',
  'Summarize the claim and provide references.',
  'Separate this claim into checkable statements. For each, identify the primary record or official source to verify, its date, any conflicting evidence, and remaining unknowns. Do not fabricate citations or claim you browsed unless you actually did. Return a claim/evidence/assessment table.'
 ],examples:[
  'There is no specific claim, source, date, or verification standard.',
  'References are requested but not anchored to primary materials or freshness.',
  'A source-audit workflow distinguishes evidence from interpretation and avoids invented certainty.'
 ]},
 code:{title:'Debug a web application',goal:'Request a reproducible software fix',prompts:[
  'Fix my code.',
  'Find why the website button does not work and suggest a fix.',
  'Investigate why the Save button does nothing in a JavaScript web app on Android Chrome. Expected: a JSON file downloads; actual: no response. Identify likely causes, request the minimum needed code/logs, make a targeted fix, preserve all other routes, and provide manual regression tests. Do not claim a test ran unless executed.'
 ],examples:[
  'Without files, symptoms, or environment, the model can only speculate.',
  'The broken element is clearer but no reproduction, constraint, or test is provided.',
  'Expected/actual behavior, platform, preservation constraints, and acceptance criteria support a focused debugging plan. The model still needs the actual code to verify a fix.'
 ]},
 writing:{title:'Write a helpful professional message',goal:'Draft a concise customer service reply',prompts:[
  'Write a good email.',
  'Write a polite email responding to a delayed order.',
  'Write a courteous, concise reply to a customer whose order is delayed. Acknowledge the inconvenience, do not invent a delivery date, offer a concrete next step to confirm status, and end with an invitation to reply. Format as a send-ready email with subject and body; use placeholders for missing facts.'
 ],examples:[
  'Purpose, audience, tone, and required facts are unknown.',
  'The audience and situation are clear, but important promises could be invented.',
  'Audience, format, tone, and honesty constraints improve usability without overpromising.'
 ]}
};
const keys=Object.keys(missions);
let progress={mastered:[]},topic='website',tier=0,inspected=new Set();
try{const raw=JSON.parse(localStorage.getItem(S)||'{}');if(Array.isArray(raw?.mastered))progress.mastered=raw.mastered.filter(x=>keys.includes(x));}catch{}
const safeStore=()=>{try{localStorage.setItem(S,JSON.stringify(progress))}catch{}};
const get=(id)=>$(id);
function render(){
 const m=missions[topic];if(!m)return;
 get('showdownTopic').value=topic;
 get('missionGoal').textContent=m.title;
 get('missionNumber').textContent='MISSION '+String(keys.indexOf(topic)+1).padStart(2,'0')+' / '+String(keys.length).padStart(2,'0');
 get('showdownPrompt').textContent=m.prompts[tier];
 get('showdownResult').textContent=m.examples[tier];
 get('showdownWhy').textContent=['What is missing?','What improved?','Why this is stronger'][tier]+': '+m.examples[tier];
 for(const btn of document.querySelectorAll('[data-tier]')){const n=Number(btn.dataset.tier);btn.classList.toggle('selected',n===tier);btn.setAttribute('aria-pressed',String(n===tier));btn.classList.toggle('explored',inspected.has(n));}
 const done=progress.mastered.includes(topic),all=inspected.size===3;
 get('masterMission').disabled=!all||done;
 get('masterMission').textContent=done?'✓ Mission mastered':'🏅 Finish mission';
 get('showdownHint').textContent=done?'Mission mastered. Choose another topic to keep practicing.':all?'You viewed all three examples. Finish the mission to save your progress.':'View all three prompt levels: '+inspected.size+' / 3 explored.';
 get('missionProgress').textContent=progress.mastered.length+' / '+keys.length+' missions mastered';
 get('labScore').textContent=String(progress.mastered.length);
}
function selectTopic(id){if(!missions[id])return;topic=id;tier=0;inspected=new Set([0]);render()}
function showTier(n){if(![0,1,2].includes(n))return;tier=n;inspected.add(n);render()}
for(const btn of document.querySelectorAll('[data-tier]'))btn.addEventListener('click',()=>showTier(Number(btn.dataset.tier)));
get('showdownTopic').addEventListener('change',e=>selectTopic(e.target.value));
get('randomMission').addEventListener('click',()=>{const i=keys.indexOf(topic);selectTopic(keys[(i+1+Math.floor(Math.random()*(keys.length-1)))%keys.length]);});
get('masterMission').addEventListener('click',()=>{if(inspected.size!==3||progress.mastered.includes(topic))return;progress.mastered.push(topic);safeStore();render();});
get('useShowdownPrompt').addEventListener('click',()=>{get('coachPrompt').value=missions[topic].prompts[tier];get('coachPrompt').dispatchEvent(new Event('input',{bubbles:true}));get('prompt-coach').scrollIntoView({behavior:'smooth',block:'start'});get('coachPrompt').focus({preventScroll:true});});
const checks=[
 {label:'Specific action',test:v=>/\b(create|draft|write|build|compare|summarize|explain|analyze|evaluate|debug|diagnose|design|generate|fix|review|plan|research|check|make)\b/i.test(v),hint:'Start with a verb describing what you want done.'},
 {label:'Useful context',test:v=>/\b(for|about|audience|context|background|existing|customer|users|using|website|business|project|photo|app|age|purpose)\b/i.test(v)&&v.length>=65,hint:'Include the audience, situation, or project details.'},
 {label:'Defined output',test:v=>/\b(format|table|list|sections|steps|markdown|json|html|css|source|code|image|report|email|paragraph|bullet|draft|file|deliverable|aspect ratio)\b/i.test(v),hint:'State the intended format: e.g. table, email, code, or steps.'},
 {label:'Clear boundaries',test:v=>/\b(do not|don't|avoid|preserve|must|only|without|limit|under|minimum|no more than|constraints|requirements|privacy)\b/i.test(v),hint:'Mention a limit, requirement, or something to avoid.'},
 {label:'Quality check',test:v=>/\b(test|verify|check|source|citations|correct|evidence|accurate|validate|quality|acceptance|working|assumption|review)\b/i.test(v),hint:'Request a check for accuracy, completeness, or working behavior.'}
];
function coach(){
 const v=get('coachPrompt').value.trim(),result=checks.map(c=>({c,ok:c.test(v)})),score=result.filter(x=>x.ok).length;
 get('coachScore').textContent=score+' / 5';
 get('coachMeter').style.width=score/5*100+'%';
 get('coachChecks').replaceChildren();
 for(const x of result){const row=document.createElement('div');row.className='coach-check'+(x.ok?' good':'');row.setAttribute('role','listitem');const symbol=document.createElement('span');symbol.textContent=x.ok?'✓':'○';const label=document.createElement('span');label.textContent=x.c.label;row.append(symbol,label);get('coachChecks').append(row);}
 get('coachAdvice').textContent=!v?'Enter a prompt to see five practical quality checks.':score===5?'All five structure checks found. Review the content for truth and relevance; this is a writing heuristic, not an AI accuracy score.':result.find(x=>!x.ok).c.hint;
 return score;
}
get('coachPrompt').addEventListener('input',coach);
get('coachHint').addEventListener('click',()=>{coach();const missing=checks.find(x=>!x.test(get('coachPrompt').value.trim()));get('coachAdvice').textContent=missing?'Try this: '+missing.hint:'Try adding precise factual details and a testable success criterion.';get('coachPrompt').focus();});
get('coachImprove').addEventListener('click',()=>{
 const el=get('coachPrompt'),base=el.value.trim();if(!base){el.value='TASK\nDraft a clear explanation for a beginner.\n\nCONTEXT\nAudience: someone new to the topic.\n\nOUTPUT\nFive numbered steps.\n\nCONSTRAINTS\nDo not invent facts.\n\nQUALITY CHECK\nFlag unknowns and verify important claims.';}
 else if(!/\bquality check\b/i.test(base))el.value=base+'\n\nCONTEXT\nAudience and background: [add details]\n\nOUTPUT\nFormat and length: [specify]\n\nCONSTRAINTS\nPreserve known facts; avoid unsupported assumptions.\n\nQUALITY CHECK\nVerify key details and list anything uncertain.';
 else get('coachAdvice').textContent='Your prompt already includes a quality check. Review the remaining checklist to make it more specific.';
 el.dispatchEvent(new Event('input',{bubbles:true}));el.focus();
});
get('coachTry').addEventListener('click',()=>{
 const prompt=get('coachPrompt').value.trim();
 if(!prompt){get('coachAdvice').textContent='Write a prompt first or choose an example in Prompt Showdown.';get('coachPrompt').focus();return}
 try{localStorage.setItem(DRAFT,prompt);window.location.assign('/studio/#chat');}
 catch{get('coachAdvice').textContent='Unable to open Random AI automatically. Copy your text and open the Random AI link at the top.'}
});
selectTopic('website');coach();
window.AIAcademyPlay=Object.freeze({topics:keys.length,qualityChecks:checks.length,getProgress:()=>({mastered:progress.mastered.slice(),topic,tier,inspected:inspected.size})});
})();
