/* AI Academy: self-paced, standalone learning module.
   No model, login or paid service is required for the lessons.
   Practice prompts may be explicitly sent to Random AI in the same-origin tab.
 */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='random-candy-ai-academy-v1',DRAFT='rcl-academy-draft-prompt';
const LESSONS=[
{id:'first-prompt',track:'01 · The Foundations',title:'Prompting from zero',min:7,
 lead:'The best results come from a clear task, helpful context and a defined result—not magic words.',
 idea:'Build every prompt around four questions: What should be done? What facts matter? What should the result look like? What must be avoided?',
 bad:'Make a website.',good:'Build a responsive one-page landing page for a neighborhood bakery. Include a hero, menu preview, opening hours and contact button. Use warm pastel colors, accessible text and semantic HTML. Return complete HTML and CSS with setup steps. Do not invent the business address.',
 tips:['Write the action as a clear verb: draft, compare, explain, create or debug.','Provide specific, true details instead of assuming the model knows your project.','Ask for a concrete output, such as a table, a checklist or working source code.'],
 question:'Which prompt is more likely to deliver a useful result?',choices:['Do something nice with my idea.','Draft three possible names for a local bakery, with a tagline and reason for each.','Give me a perfect answer without needing any information.'],answer:1,why:'Specific task, audience and deliverable make the request testable.',
 practice:'Write a concise one-page bakery website with clear sections, an inviting headline, mobile-first CSS and setup instructions.'},
{id:'context',track:'01 · The Foundations',title:'Supply the right context',min:8,
 lead:'Good context makes a model useful. Missing details make it guess.',
 idea:'Describe the audience, constraints, project background, what you have already tried and what success looks like. Never paste passwords or sensitive records.',
 bad:'Fix my app.',good:'I have an existing mobile-friendly web app deployed on a static site. The menu closes unexpectedly after clicking a sub-item. Preserve all existing routes, explain the likely cause, show only the necessary changes and include a test checklist.',
 tips:['Tell the model what is already working and must stay untouched.','Include one representative error message or small sanitized example.','Separate confirmed facts from guesses and unknowns.'],
 question:'What context is most useful when asking for a bug fix?',choices:['Existing behavior, error details and constraints.','Only the product name.','Your passwords and API keys.'],answer:0,why:'A concise, reproducible description and boundaries are much more helpful than secrets.',
 practice:'Diagnose a bug in an existing website. Preserve all other functionality and give a prioritized troubleshooting checklist.'},
{id:'formats',track:'01 · The Foundations',title:'Choose the output',min:7,
 lead:'Guide the shape of the answer so that you can actually use it.',
 idea:'Set the expected format, tone, level of detail and any word count or schema rules. Ask for a small example when accuracy matters.',
 bad:'Tell me about my results.',good:'Summarize these survey results in a five-row table: observation, evidence, implication, confidence and next action. Distinguish the original numbers from your interpretation.',
 tips:['Use numbered steps for procedures and tables for comparisons.','Ask for concise or detailed explanations based on the situation.','Specify the audience: expert, beginner, executive or general reader.'],
 question:'What instruction most clearly defines a usable deliverable?',choices:['Be creative.', 'Return a three-column table with source, finding and next action.', 'Make it cool.'],answer:1,why:'An explicit output structure reduces unnecessary reformatting.',
 practice:'Explain five options in a comparison table with strengths, weaknesses and who each suits.'},
{id:'examples',track:'02 · Prompt Craft',title:'Show examples',min:8,
 lead:'A small example can teach formatting and tone more effectively than a long description.',
 idea:'Provide one or two representative input-output pairs. Say what should stay consistent and what should vary. Avoid copyrighted or confidential samples unless you have rights to them.',
 bad:'Write like this!',good:'Use this tone pattern: “A small change. A big difference.” Write five original, upbeat headlines for a gardening workshop. Do not copy the exact sample.',
 tips:['Use examples to show structure rather than demand copying.','Mention what you dislike about failed attempts.','Include an example of an unacceptable result when helpful.'],
 question:'Why do examples help?',choices:['They guarantee every fact is correct.','They make the model independent from instructions.','They demonstrate the desired pattern and style.'],answer:2,why:'Examples are guidance, not evidence or a guarantee.',
 practice:'Write six original product headlines using a short energetic sentence style, without copying any example words.'},
{id:'iterate',track:'02 · Prompt Craft',title:'Improve in rounds',min:9,
 lead:'The second draft is often much better when feedback is specific.',
 idea:'Review the first result against your goals. Point out exactly what missed and request focused revisions, instead of starting over vaguely.',
 bad:'This is bad. Fix it.',good:'Keep the structure and all confirmed facts. Cut the introduction by 50%, replace vague claims with concrete examples and end with three actionable next steps. Explain what changed.',
 tips:['Request alternatives when you need to compare creative directions.','Keep successful parts and revise only what failed.','Ask the model to identify assumptions and missing evidence.'],
 question:'Which revision instruction is the most actionable?',choices:['Preserve the facts and shorten paragraphs to at most three sentences.','Make it much better.','Start over until I like it.'],answer:0,why:'Specific changes can be checked and applied consistently.',
 practice:'Revise the previous response: keep the accurate details, remove repetition and improve the practical next steps.'},
{id:'reasoning',track:'02 · Prompt Craft',title:'Reason through decisions',min:9,
 lead:'Use structured comparisons, checks and scenarios for complicated choices.',
 idea:'Describe the decision, criteria and trade-offs. Ask for a brief justification, alternative options and ways to verify uncertain information.',
 bad:'What is the best laptop?',good:'Compare these laptops for programming and travel. Use battery life, weight, screen, repairability and cost as criteria. Explain trade-offs, rank them and flag any specs that need current verification.',
 tips:['Define what “best” means instead of leaving it implicit.','Request a recommendation plus reasons and limitations.','Separate evidence from preferences and uncertain assumptions.'],
 question:'What improves a hard decision prompt most?',choices:['No criteria, no background.','Defined criteria, comparison, caveats and verification.','Requesting a confident answer regardless of evidence.'],answer:1,why:'Transparent criteria make complex recommendations more useful.',
 practice:'Compare three ways to host a web app by price, setup difficulty, reliability and maintenance. Note uncertainty.'},
{id:'research',track:'02 · Prompt Craft',title:'Verify information',min:8,
 lead:'Persuasive-sounding writing is not the same as verified evidence.',
 idea:'Ask for primary sources where available, dates, confidence, unknowns and independent checks. A model without browsing cannot verify current events.',
 bad:'Give me a source for every claim, even if you have to invent it.',good:'List which claims in this article require verification. For each, describe the original source I should seek, what to check and how recent it should be. Do not fabricate citations.',
 tips:['Provide source material or verify claims through trustworthy references.','Ask for dates on time-sensitive findings.','Use clearly labeled placeholders when evidence is unavailable.'],
 question:'Which research practice is reliable?',choices:['Trust confident text without checking.','Ask for a fabricated citation if none exists.','Check important claims against primary sources.'],answer:2,why:'Verification matters more than fluency.',
 practice:'Create a fact-check checklist for an article, including source quality, date, bias and unknowns.'},
{id:'images',track:'03 · Visual & Video',title:'Professional image prompts',min:12,
 lead:'Strong visual prompts specify composition, subject, lighting, style and constraints.',
 idea:'Describe what the viewer should see. Include camera angle, environment, materials, art direction, aspect ratio and any required text. Check that you are using an image-generation model, not only a vision model.',
 bad:'A beautiful picture.',good:'Photorealistic studio product photograph of a handmade ceramic coffee mug on a warm stone table, soft window light from the left, 50mm lens perspective, natural shadows, editorial commercial styling, no logos, landscape 16:9. Keep the entire mug in frame.',
 tips:['Describe a clear subject and one consistent aesthetic.','Specify aspect ratio and framing before requesting tiny details.','Use supported reference-image controls if consistency matters.'],
 question:'What should you check before generating an image?',choices:['That the model supports image output.','That the model only accepts text input.','That image dimensions never matter.'],answer:0,why:'Understanding an image is not the same as generating one.',
 practice:'Commercial product photo of a premium travel tumbler, clean background, soft cinematic lighting, true-to-life surface, readable silhouette and no extra logos. Aspect ratio 4:5.'},
{id:'video',track:'03 · Visual & Video',title:'Direct better video scenes',min:12,
 lead:'Think like a director: action, camera movement, timing and continuity.',
 idea:'Give each clip a subject, location, movement, shot type and duration. Use concise beats rather than asking for every action at once. Video providers often use asynchronous jobs and have length limits.',
 bad:'Make a cinematic video.',good:'Eight-second cinematic 16:9 clip: a tiny paper boat glides through a rain-lit city street at dusk. Low tracking shot follows from behind. Gentle ripples, reflections and believable water movement. No jump cuts, no titles or extra boats.',
 tips:['Specify a single clear action per short clip.','Choose camera motion and framing deliberately.','Check provider-supported duration and resolution before submission.'],
 question:'Why use a simple shot list?',choices:['It guarantees an unlimited-length film.','It improves clarity and consistency across scenes.','It removes the need for a compatible video model.'],answer:1,why:'Short, controlled shots are easier to generate and revise.',
 practice:'Eight-second 16:9 video: a hummingbird hovers near a flower at sunrise; slow camera push, lifelike wing motion, soft morning light, continuous shot.'},
{id:'coding',track:'04 · Coding & Automation',title:'Ask for working code',min:12,
 lead:'A useful coding prompt includes language, environment, acceptance criteria and tests.',
 idea:'Request complete files or a targeted diff, state constraints and describe how to run the result. Be explicit when existing files must remain untouched.',
 bad:'Build the best app ever.',good:'Build a responsive TypeScript habit tracker for mobile browsers. Include add/edit/complete, accessible keyboard controls and local storage. Provide a file tree, complete source files, install steps and five manual acceptance tests. Do not add paid services.',
 tips:['Share the platform, framework and versions you actually use.','Define expected inputs, outputs and edge cases.','Ask for error handling and regression tests.'],
 question:'What makes generated code easier to verify?',choices:['No filenames or tests.','Only a screenshot of how it might look.','File paths, execution steps and acceptance checks.'],answer:2,why:'Source code must be runnable and testable, not only impressive-looking.',
 practice:'Build a responsive to-do app in HTML, CSS and JavaScript with local storage. Include complete files and test steps.'},
{id:'debug',track:'04 · Coding & Automation',title:'Debug with evidence',min:11,
 lead:'A precise bug report beats a vague complaint.',
 idea:'Include how to reproduce the issue, expected and actual behavior, log output and safe excerpts of code. Ask for root-cause hypotheses in priority order.',
 bad:'This code is broken.',good:'In Chrome on Android, the second player cannot join my multiplayer room. The host sees “ICE checking” and the guest times out. Explain likely causes and suggest diagnostic tests before changing code. Preserve the existing game UI.',
 tips:['Remove tokens, emails and private data from logs.','Ask for the smallest safe change first.','Re-test affected flows after any fix.'],
 question:'What is a good debugging sequence?',choices:['Reproduce, isolate, fix and regression-test.','Rewrite the entire application immediately.','Ignore logs if the UI looks fine.'],answer:0,why:'Small, verified changes protect working features.',
 practice:'Diagnose a reproducible browser bug. Give likely causes, minimal tests, safest fix and a regression checklist.'},
{id:'automation',track:'04 · Coding & Automation',title:'Plan automations & agents',min:10,
 lead:'Make repetitive work reliable with clear triggers and guardrails.',
 idea:'Define a trigger, allowed inputs, actions, failure handling and when a human must review results. Avoid claiming a workflow is live until its integration is actually connected.',
 bad:'Automate my whole website.',good:'Design a daily build-monitoring workflow: check the latest CI run, notify only if build or publish fails, include the failing step and direct run link, and avoid sending duplicate alerts. Do not modify the repository.',
 tips:['Identify required permissions and credentials first.','Prefer idempotent steps that can be retried safely.','Include explicit approval before paid or destructive actions.'],
 question:'What is essential for a trustworthy automation?',choices:['Unlimited unattended permissions.','Clear triggers, retry logic and safe boundaries.','A promise that integrations always work.'],answer:1,why:'A safe agent is observable, constrained and recoverable.',
 practice:'Write an automation design with trigger, conditions, steps, errors, notifications and approval points.'},
{id:'privacy',track:'04 · Coding & Automation',title:'Privacy and responsible use',min:8,
 lead:'Make quality and privacy part of the instructions, not an afterthought.',
 idea:'Know when your prompt is sent to a remote provider, protect personal data, verify high-impact answers and review model-generated code before deploying it.',
 bad:'Here are my secret keys and private customer records. Put them into my public repository.',good:'Review these redacted configuration snippets for security mistakes. Do not output secrets. Explain how to use environment variables, least privilege and a private server-side relay.',
 tips:['Use local tools where appropriate and understand the difference between local and cloud inference.','Never place shared secrets in a public web frontend.','Validate provider charges and usage limits before running expensive media generation.'],
 question:'Where do paid API secrets belong in a public web app?',choices:['Hard-coded in browser JavaScript.','In a public HTML comment.','In a secure backend or a user-controlled session, never published as the site owner’s secret.'],answer:2,why:'Public source code is readable by visitors and cannot keep shared keys secret.',
 practice:'Create a security checklist for a browser app using optional user-provided model credentials.'}
];
let state=load(),active=LESSONS.find(l=>!state.done.includes(l.id))?.id||LESSONS[0].id;
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {done:Array.isArray(x.done)?x.done.filter(id=>typeof id==='string'):[],answers:x.answers&&typeof x.answers==='object'?x.answers:{},updated:x.updated||null}}catch{return {done:[],answers:{},updated:null}}}
function save(){state.updated=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state))}catch{announce('Progress cannot be saved in this browser. Export a copy.')}renderStats()}
function announce(text){const n=$('#announce');n.textContent=text;n.hidden=false;clearTimeout(announce.timer);announce.timer=setTimeout(()=>n.hidden=true,2800)}
function renderStats(){const n=state.done.length,p=Math.round(n/LESSONS.length*100);$('#doneCount').textContent=n;$('#masteryScore').textContent=p+'%';$('#quizScore').textContent=Object.values(state.answers).filter(x=>x===true).length;$('#courseProgressBar').style.width=p+'%';$('#courseProgressText').textContent=n+' of '+LESSONS.length+' lessons mastered';}
function navigation(){let track='',html='';for(let i=0;i<LESSONS.length;i++){const l=LESSONS[i];if(l.track!==track){if(track)html+='</div>';track=l.track;html+='<div class="course-group"><div class="course-group-label">'+E(track)+'</div>'}html+='<button type="button" data-lesson="'+E(l.id)+'" class="'+(active===l.id?'active ':'')+(state.done.includes(l.id)?'done':'')+'"><span class="number">'+(state.done.includes(l.id)?'✓':i+1)+'</span><span>'+E(l.title)+'<br><small style="opacity:.65">'+l.min+' min</small></span></button>';}$('#courseNav').innerHTML=html+'</div>';$('#continueCourse').textContent=state.done.length?'Continue learning →':'Start learning →'}
function showLesson(id){const l=LESSONS.find(x=>x.id===id);if(!l)return;active=id;const idx=LESSONS.indexOf(l),answer=state.answers[l.id];let options=l.choices.map((v,i)=>'<button type="button" data-answer="'+i+'" class="'+(answer!==undefined?(i===l.answer?'correct':i===answer?'incorrect':''):'')+'">'+E(v)+'</button>').join('');
$('#lessonZone').innerHTML='<div class="lesson-heading"><div><span class="eyebrow">'+E(l.track)+' · LESSON '+(idx+1)+' OF '+LESSONS.length+'</span><h2>'+E(l.title)+'</h2><small>⏱ '+l.min+' minutes · '+(state.done.includes(l.id)?'✓ Mastered':'Practice & quiz to complete')+'</small></div><span style="font-size:40px">'+(state.done.includes(l.id)?'🏆':'✨')+'</span></div>'+
'<p class="lesson-lead">'+E(l.lead)+'</p><h3>The key idea</h3><p>'+E(l.idea)+'</p>'+
'<div class="lesson-copy"><article><h3>✗ Vague prompt</h3><p>'+E(l.bad)+'</p></article><article class="after"><h3>✓ Effective prompt</h3><p>'+E(l.good)+'</p></article></div>'+
'<div class="lesson-tips"><b>💡 Remember</b><ul>'+l.tips.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul></div>'+
'<div class="quiz"><span class="eyebrow">ONE-MINUTE SKILL CHECK</span><h3>'+E(l.question)+'</h3><div class="quiz-options">'+options+'</div><div class="quiz-response" id="quizResponse" aria-live="polite">'+(answer!==undefined?(answer===l.answer?'✓ Correct! ':'Try another answer. ')+E(l.why):'Choose the strongest answer to finish this lesson.')+'</div></div>'+
'<div class="lesson-footer"><button type="button" class="outline" id="tryExample">✳ Try this example in Random AI</button><div class="actions"><button type="button" class="outline" data-prev '+(idx===0?'disabled':'')+'>← Previous</button><button type="button" class="primary" data-next '+(idx===LESSONS.length-1?'disabled':'')+'>Next lesson →</button></div></div>';
navigation();
$('#lessonZone').querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{const choice=Number(b.dataset.answer),correct=choice===l.answer;state.answers[l.id]=choice;if(correct&&!state.done.includes(l.id)){state.done.push(l.id);announce('🏆 Lesson mastered! '+state.done.length+'/'+LESSONS.length)}save();showLesson(id);if(!correct)announce('Try the alternative that is most specific and verifiable.');}));
$('#tryExample').addEventListener('click',()=>sendToStudio(l.practice));
const previous=$('[data-prev]'),next=$('[data-next]');previous.addEventListener('click',()=>{if(idx>0)showLesson(LESSONS[idx-1].id)});next.addEventListener('click',()=>{if(idx<LESSONS.length-1)showLesson(LESSONS[idx+1].id)});
}
function sendToStudio(prompt){try{localStorage.setItem(DRAFT,prompt);location.href='/studio/#chat'}catch{navigator.clipboard?.writeText(prompt).then(()=>announce('Prompt copied. Open Random AI and paste it.')).catch(()=>announce('Copy the prompt and open Random AI.'))}}
function prompt(){const task=$('#buildTask').value.trim(),context=$('#buildContext').value.trim(),format=$('#buildFormat').value,style=$('#buildStyle').value,guard=$('#buildGuard').value.trim();if(!task)return 'Add your goal to build a better prompt.';return 'TASK\n'+task+'\n\n'+(context?'CONTEXT\n'+context+'\n\n':'')+'OUTPUT FORMAT\n'+format+'\n\nTONE\n'+style+'\n\n'+(guard?'CONSTRAINTS\n'+guard+'\n\n':'')+'QUALITY CHECK\nUse only verified or provided facts. Note assumptions. Return a concrete, usable result.'}
function updatePrompt(){$('#builtPrompt').textContent=prompt()}
$('#courseNav').addEventListener('click',e=>{const b=e.target.closest('[data-lesson]');if(b){showLesson(b.dataset.lesson);$('#lessonZone').scrollIntoView({behavior:'smooth',block:'start'})}});
$('#continueCourse').addEventListener('click',()=>{showLesson(LESSONS.find(l=>!state.done.includes(l.id))?.id||LESSONS[0].id);$('#lessonZone').scrollIntoView({behavior:'smooth',block:'start'})});
for(const id of ['buildTask','buildContext','buildFormat','buildStyle','buildGuard'])$('#'+id).addEventListener('input',updatePrompt);
$('#copyBuild').addEventListener('click',async()=>{const p=prompt();if(!$('#buildTask').value.trim())return announce('Add a goal first.');try{await navigator.clipboard.writeText(p);announce('Prompt copied!')}catch{announce('Clipboard unavailable. Select the preview text.')}});
$('#tryBuild').addEventListener('click',()=>{if(!$('#buildTask').value.trim())return announce('Enter a task first.');sendToStudio(prompt())});
$('#exportCourse').addEventListener('click',()=>{const data={format:'AI-Academy-v1',exported:new Date().toISOString(),completed:state.done.map(id=>({id,title:LESSONS.find(l=>l.id===id)?.title||id})),answers:state.answers};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ai-academy-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('#resetCourse').addEventListener('click',()=>{if(!confirm('Reset all AI Academy lessons and quiz progress on this device?'))return;state={done:[],answers:{},updated:null};save();showLesson(LESSONS[0].id);announce('Progress reset')});
$('#buildTask').value='Create a clear, engaging explanation of how to learn prompting';updatePrompt();renderStats();showLesson(active);
})();