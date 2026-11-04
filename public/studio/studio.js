/* Random AI — private local inference and optional hosted Instant AI.
   No hidden server keys, no pretend generated replies, no automatic uploads.
   Local WebGPU models are fetched from MLC's published model library.
*/
const $=(s)=>document.querySelector(s);
const $$=(s)=>[...document.querySelectorAll(s)];
const esc=(value)=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const storeKey='candy-studio-conversations-v1';
function readStore(){try{const data=JSON.parse(localStorage.getItem(storeKey)||'[]');return Array.isArray(data)?data.filter(x=>x&&Array.isArray(x.messages)).slice(0,35):[]}catch{return []}}
function writeStore(){try{localStorage.setItem(storeKey,JSON.stringify(conversations.slice(0,35)))}catch{notice('Storage is full. Export conversations before continuing.');}}
const uuid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
const date=()=>new Date().toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
let conversations=readStore(),currentId=null,engine=null,loadedModel='',isGenerating=false,activeStream=null,attached=null,external=null,seedCounter=1,recognition=null,photoSource=null,photoDimensions=null,photoOutputReady=false;
let noticeTimer=0,toolFilter='All';
// The Studio uses local WebGPU inference only. No remote chat endpoints or API keys.
let selectedMode='local';
// Instant AI is an optional hosted Worker with an owner-controlled public URL.
// Neither visitor API keys nor private account credentials are used in the browser.
const instantRaw=typeof window.CANDY_FREE_AI_ENDPOINT==='string'?window.CANDY_FREE_AI_ENDPOINT.trim():'';
let instantEndpoint='';
try{const u=new URL(instantRaw);if(u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash)instantEndpoint=u.href.replace(/\/$/,'');}catch{}
let instantReady=false,instantCheckPromise=null;
const chatModeKey='random-ai-transport-v1';
let chatMode='instant';
try{if(localStorage.getItem(chatModeKey)==='local')chatMode='local'}catch{}

const CATEGORIES=['All','Writing','Work & Career','Marketing','Learning','Creative'];
const TOOLS=[
 {id:'professional-email',name:'Professional Email',icon:'✉',group:'Writing',description:'Clear, thoughtful emails that sound like you.',prompt:'Draft a polished professional email with a clear subject line, a warm opening, a concise request, and an appropriate closing. Ask for missing essentials only if they truly matter. Situation:'},
 {id:'rewrite',name:'Rewrite & Refine',icon:'✎',group:'Writing',description:'Improve clarity and flow without losing your voice.',prompt:'Rewrite the following text so it is clearer, more polished and easier to read. Preserve its original meaning and any facts. Text:'},
 {id:'summarize',name:'Smart Summary',icon:'▤',group:'Writing',description:'Get the key points and takeaways quickly.',prompt:'Summarize the following text faithfully. Include the main takeaway, key supporting points, and any important caveats. Do not make up details. Text:'},
 {id:'story',name:'Story Writer',icon:'☽',group:'Creative',description:'Characters, plot twists and original storytelling.',prompt:'Write an engaging original short story based on this idea. Use vivid imagery, a coherent character arc and a satisfying ending. Idea:'},
 {id:'translate',name:'Translator',icon:'◎',group:'Writing',description:'Translate clearly while preserving tone.',prompt:'Translate the following into the target language. Preserve meaning, tone, formatting and idioms naturally. Tell me the target language and provide the text:'},
 {id:'blog-outline',name:'Article Outline',icon:'☷',group:'Writing',description:'Organize a clear, interesting long-form article.',prompt:'Create a structured article outline with a compelling angle, an introduction, organized headings, examples and a strong conclusion. Topic and audience:'},
 {id:'resume',name:'Resume Bullet Builder',icon:'▣',group:'Work & Career',description:'Turn responsibilities into quantified achievements.',prompt:'Turn my real work experience into honest, achievement-driven resume bullet points. Do not invent responsibilities, metrics or credentials; offer placeholders for missing numbers. Experience:'},
 {id:'cover-letter',name:'Cover Letter',icon:'♧',group:'Work & Career',description:'Create a persuasive, tailored job introduction.',prompt:'Write a specific, professional cover letter based only on the information I provide. Match transferable skills to the target job and avoid made-up claims. My background and the role:'},
 {id:'interview',name:'Interview Coach',icon:'◈',group:'Work & Career',description:'Practice useful questions and STAR-format answers.',prompt:'Help me prepare for an interview for the following role. Give realistic questions, what makes a strong response, and sample STAR answer structures without inventing my background. Role:'},
 {id:'meeting',name:'Meeting Notes',icon:'▤',group:'Work & Career',description:'Find decisions, action items and unresolved issues.',prompt:'Organize the following meeting notes into a concise recap, decisions, action items with owners when known, and open questions. Do not invent names or deadlines. Notes:'},
 {id:'business-name',name:'Business Name Ideas',icon:'✺',group:'Marketing',description:'Brainstorm brand names and positioning.',prompt:'Suggest 15 distinctive business names for this idea. For each include a short tagline and one reason it fits. Do not claim domain or trademark availability. Business concept:'},
 {id:'product-description',name:'Product Description',icon:'▦',group:'Marketing',description:'Write clear, benefit-focused descriptions.',prompt:'Write an honest, persuasive product description with an appealing headline, benefits, key features, and a concise call to action. Do not invent specifications, reviews, or results. Product details:'},
 {id:'social-captions',name:'Social Captions',icon:'✳',group:'Marketing',description:'Creative posts for your chosen platform.',prompt:'Write five varied, platform-appropriate social-media captions with natural hooks and optional hashtags. Maintain the specified voice. Product, platform, audience and context:'},
 {id:'video-script',name:'Video Script',icon:'▶',group:'Marketing',description:'Short-form video and storytelling scripts.',prompt:'Create a clear, engaging short video script, including opening hook, visuals, spoken lines, and a memorable ending. Provide a suggested duration. Topic:'},
 {id:'seo',name:'SEO Headlines',icon:'⌕',group:'Marketing',description:'Headlines, descriptions and search snippets.',prompt:'Create ten useful SEO-friendly article titles and three engaging meta descriptions. Prioritize honesty and relevance over clickbait. Keyword, topic, and search intent:'},
 {id:'ad-copy',name:'Ad Copy Lab',icon:'✦',group:'Marketing',description:'Explore several advertising angles.',prompt:'Draft three ethical ad-copy directions: benefit-led, curiosity-led, and straightforward. Include a headline, body, and call to action. Avoid unsupported claims. Offer:'},
 {id:'study-notes',name:'Study Notes',icon:'◉',group:'Learning',description:'Turn difficult material into clear notes.',prompt:'Turn the following study material into organized notes with simple explanations, definitions, examples, and review questions. Identify anything uncertain. Material:'},
 {id:'flashcards',name:'Flashcard Maker',icon:'▧',group:'Learning',description:'Make review cards with answers and examples.',prompt:'Generate 12 useful study flashcards in Question | Answer format from the following material, covering definitions and applications. Avoid making up source facts. Material:'},
 {id:'lesson-plan',name:'Lesson Planner',icon:'❖',group:'Learning',description:'Build an engaging session with activities.',prompt:'Design a practical lesson plan with objectives, time allocation, exercises, quick checks, and adaptations. Specify learner level and subject. Details:'},
 {id:'explain',name:'Explain Simply',icon:'✳',group:'Learning',description:'Understand something complex in plain English.',prompt:'Explain the following concept clearly to a beginner, using an analogy, an example, common misconceptions, and a short recap. Concept:'},
 {id:'brainstorm',name:'Idea Generator',icon:'☼',group:'Creative',description:'Fresh angles for almost any project.',prompt:'Brainstorm 20 diverse, feasible and original ideas. Group into easy wins, unusual experiments and ambitious concepts. Include a practical first step. Goal:'},
 {id:'tagline',name:'Tagline Workshop',icon:'✴',group:'Creative',description:'Memorable phrases with personality.',prompt:'Write 20 different short taglines for this brand or project, from playful to elegant. Explain the strongest three choices. Context:'},
 {id:'goal',name:'Goal & Habit Planner',icon:'◇',group:'Work & Career',description:'Turn intentions into achievable actions.',prompt:'Convert my goal into a realistic step-by-step plan with milestones, habits, risks and ways to measure progress. Keep it flexible, not judgmental. Goal and constraints:'},
 {id:'creative-brief',name:'Creative Brief',icon:'▰',group:'Creative',description:'A useful plan for designers and creators.',prompt:'Draft a professional creative brief including audience, objective, mood, tone, deliverables, constraints and success criteria. Clearly label assumptions. Project:'}
];
const SYSTEM='You are the Random AI creative assistant. Be accurate, practical, welcoming and clear. State uncertainties. Never claim to have looked up live information, run a tool, read an attachment, or generated an image unless the user has actually supplied it or the application really did so. Keep outputs useful and responsive to instructions.';
const names={home:'Discover',chat:'Random AI Chat',tools:'Tool library',academy:'AI Academy',code:'Code Lab',visual:'Visual lab',photos:'Photo workshop',voice:'Voice studio',history:'Saved work',settings:'Model & privacy'};
function notice(message){clearTimeout(noticeTimer);const el=$('#toast');el.textContent=message;el.classList.add('show');noticeTimer=setTimeout(()=>el.classList.remove('show'),3200);}
function setStatus(text,connected=false){$('#statusPill').textContent=(connected?'● ':'◌ ')+text;$('#statusPill').style.color=connected?'#90e7cc':'#c9bafa';}
function navigate(view){if(!names[view])view='home';$$('.view').forEach(n=>n.classList.toggle('active',n.id==='view-'+view));$$('.nav-btn').forEach(n=>{const active=n.dataset.view===view;n.classList.toggle('active',active);if(active)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current')});$('#pageTitle').textContent=names[view];$('#sidebar').classList.remove('is-open');$('#menuBtn').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'auto'});if(view==='history')renderHistory();if(view==='chat')renderChat();try{history.replaceState({},'',view==='home'?'/studio/':'/studio/#'+view)}catch{}}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
document.addEventListener('click',event=>{const button=event.target.closest('[data-go]');if(button)navigate(button.dataset.go);const suggest=event.target.closest('[data-suggest]');if(suggest){navigate('chat');$('#chatInput').value=suggest.dataset.suggest;$('#chatInput').focus();}});
$('#menuBtn').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('is-open');$('#menuBtn').setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#sidebar').classList.remove('is-open')});
$('#topNew').addEventListener('click',()=>newChat(true));
$('#chatReset').addEventListener('click',()=>newChat(true));
function renderTools(){
 const grid=$('#toolsGrid'),q=$('#toolSearch').value.trim().toLowerCase();
 const found=TOOLS.filter(t=>(toolFilter==='All'||t.group===toolFilter)&&[t.name,t.description,t.group].join(' ').toLowerCase().includes(q));
 grid.innerHTML=found.map(t=>'<button class="tool-card" data-tool="'+esc(t.id)+'"><span class="tool-emoji">'+t.icon+'</span><strong>'+esc(t.name)+'</strong><p>'+esc(t.description)+'</p><small>'+esc(t.group.toUpperCase())+' · START WITH A PROMPT →</small></button>').join('');
 $('#toolsEmpty').hidden=found.length!==0;
 $('#libraryTotal').textContent=TOOLS.length+' guided tools';
 $('#toolsCount').textContent=String(TOOLS.length);
}
$('#toolCategories').innerHTML=CATEGORIES.map(c=>'<button data-category="'+esc(c)+'" class="'+(c==='All'?'active':'')+'">'+esc(c)+'</button>').join('');
$('#toolCategories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;toolFilter=b.dataset.category;$$('[data-category]').forEach(el=>el.classList.toggle('active',el===b));renderTools()});
$('#toolSearch').addEventListener('input',renderTools);
$('#toolsGrid').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)activateTool(b.dataset.tool)});
function activateTool(id){const tool=TOOLS.find(t=>t.id===id);if(!tool)return;navigate('chat');$('#chatInput').value=tool.prompt+'\n\n';$('#chatInput').focus();notice(tool.name+' is ready. Add your details and send.');}
$('#homePopular').innerHTML=['professional-email','business-name','resume','study-notes','social-captions','story','product-description','brainstorm'].map(id=>{const t=TOOLS.find(x=>x.id===id);return '<button class="mini-card" data-tool="'+t.id+'"><span class="tool-emoji">'+t.icon+'</span><b>'+esc(t.name)+'</b><small>'+esc(t.group)+'</small></button>'}).join('');
$('#homePopular').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)activateTool(b.dataset.tool)});
$('#chatShortcuts').innerHTML=['rewrite','blog-outline','cover-letter','flashcards','tagline'].map(id=>{const t=TOOLS.find(x=>x.id===id);return '<button class="shortcut" data-tool="'+t.id+'"><span>'+t.icon+'</span>'+esc(t.name)+' →</button>'}).join('');
$('#chatShortcuts').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)activateTool(b.dataset.tool)});
renderTools();
function currentConversation(){return conversations.find(x=>x.id===currentId)}
function newChat(shouldNavigate=false){currentId=uuid();conversations.unshift({id:currentId,title:'New conversation',created:Date.now(),messages:[]});conversations=conversations.slice(0,35);attached=null;$('#attachmentBanner').hidden=true;$('#chatInput').value='';writeStore();renderChat();if(shouldNavigate)navigate('chat');}
if(conversations.length)currentId=conversations[0].id;else newChat(false);
function renderChat(){
 const data=currentConversation();const area=$('#chatMessages');
 if(!data||!data.messages.length){area.innerHTML='<div class="welcome-chat"><div class="welcome-symbol">✳</div><h2>What can we make together?</h2><p>Ask a question, draft a message, plan a project, rewrite text or build something new.</p><div class="chat-suggestions"><button data-suggest="Help me plan a creative weekend project">Plan a project</button><button data-suggest="Give me ten original business name ideas for a small creative brand">Name a business</button><button data-suggest="Rewrite this message so it is friendly and professional: ">Rewrite a message</button></div></div>';return;}
 area.innerHTML=data.messages.map((m,i)=>bubbleHTML(m,i)).join('');area.scrollTop=area.scrollHeight;
}
function bubbleHTML(m,i){return '<article class="bubble '+(m.role==='user'?'user':'assistant')+'" data-message="'+i+'"><div class="bubble-name">'+(m.role==='user'?'You':'Random AI')+'</div><div class="bubble-body">'+esc(m.content)+'</div><div class="bubble-actions"><button data-copy-message="'+i+'" aria-label="Copy message '+(i+1)+'">Copy</button></div></article>'}
$('#chatMessages').addEventListener('click',e=>{const b=e.target.closest('[data-copy-message]');if(!b)return;const m=currentConversation()?.messages[Number(b.dataset.copyMessage)];if(m)copy(m.content)});
function copy(text){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>notice('Copied to clipboard')).catch(()=>fallbackCopy(text));else fallbackCopy(text)}
function fallbackCopy(text){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();try{document.execCommand('copy');notice('Copied to clipboard')}catch{notice('Select and copy the text manually')}t.remove();}
function download(name,text,type='text/plain'){const blob=new Blob([text],{type:type+';charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function exportChat(){const c=currentConversation();if(!c||!c.messages.length)return notice('No conversation to export yet.');download('candy-studio-chat-'+date().replace(/\s+/g,'-')+'.md','# '+c.title+'\n\n'+c.messages.map(m=>'## '+(m.role==='user'?'You':'Candy Studio')+'\n\n'+m.content).join('\n\n'));}
$('#chatExport').addEventListener('click',exportChat);
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();sendMessage()}});
$('#chatSend').addEventListener('click',sendMessage);
$('#chatStop').addEventListener('click',()=>{if(engine?.interruptGenerate)engine.interruptGenerate();activeStream?.abort();});
$('#chatFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>750_000){notice('Keep text attachments below 750 KB.');e.target.value='';return;}try{attached={name:file.name,text:(await file.text()).slice(0,22000)};$('#attachmentBanner').textContent='✓ Attached '+file.name+' (text only)';$('#attachmentBanner').hidden=false;notice('Text attached. Add your question and send.')}catch{notice('This text file could not be read.')}});
async function sendMessage(){
 if(isGenerating)return;
 const raw=$('#chatInput').value.trim();if(!raw&&!attached)return;
 if(chatMode==='instant'&&!instantReady){navigate('settings');notice('Instant AI is not connected yet. Your prompt is still in Chat. Set up the Cloudflare Worker or choose Local AI.');return;}
 if(chatMode==='local'&&!engine){navigate('settings');notice('Download and load a local model first. Your prompt is still in Chat.');return;}
 const c=currentConversation();if(!c)return;
 const full=raw+(attached?'\n\n[Attached text: '+attached.name+']\n'+attached.text:'');
 c.messages.push({role:'user',content:full});if(c.messages.length===1)c.title=raw.slice(0,64)||attached.name;
 c.messages.push({role:'assistant',content:''});writeStore();renderChat();attached=null;$('#attachmentBanner').hidden=true;$('#chatFile').value='';$('#chatInput').value='';
 isGenerating=true;$('#chatSend').disabled=true;$('#chatStop').hidden=false;const controller=new AbortController();activeStream=controller;
 const messages=[{role:'system',content:SYSTEM},...c.messages.slice(0,-1).slice(-15).map(m=>({role:m.role,content:m.content.slice(0,10000)}))];
 const target=c.messages[c.messages.length-1];
 try{
  if(chatMode==='instant'){
   const preset=window.RandomAIStacks?.current?.()||null;
   const prompt=(preset?'TASK STACK: '+preset.name+'\n'+preset.instructions+'\n\n':'')+full;
   const prior=messages.slice(1,-1).filter(m=>m.role==='user'||m.role==='assistant').slice(-7)
     .map(m=>({role:m.role,content:String(m.content).slice(0,2100)}));
   const out=[...prior,{role:'user',content:prompt.slice(0,2400)}];
   while(out.length>1&&out.reduce((sum,m)=>sum+m.content.length,0)>8200)out.shift();
   const response=await fetch(instantEndpoint+'/chat',{method:'POST',mode:'cors',headers:{'Content-Type':'application/json'},
     signal:controller.signal,body:JSON.stringify({model:$('#instantModel').value,messages:out})});
   const data=await response.json().catch(()=>({error:'Hosted AI returned an unreadable response.'}));
   if(!response.ok)throw Error(String(data.error||'Hosted AI returned HTTP '+response.status));
   const answer=String(data?.choices?.[0]?.message?.content||'');
   if(!answer.trim())throw Error('The service returned no answer.');
   target.content=answer;updateLastMessage(answer);writeStore();
  }else{
  const active=window.RandomAIStacks?.current?.() || null;
  const system=SYSTEM+(active?'\n\nACTIVE TASK STACK: '+active.name+'\n'+active.instructions:'');
  const localMessages=[{role:'system',content:system},...messages.slice(1)];
  const first=await engine.chat.completions.create({messages:localMessages,temperature:active?.temperature??.65,max_tokens:active?.firstTokens??800,stream:true});
  for await(const chunk of first){if(controller.signal.aborted)break;const delta=chunk.choices?.[0]?.delta?.content||'';if(delta){target.content+=delta;updateLastMessage(target.content)}}
  if(!target.content)target.content='No text was produced. Try a shorter request.';
  const draft=target.content;
  if(active?.refined&&!controller.signal.aborted&&draft&&!draft.startsWith('No text was produced')){
    target.content='✦ First pass complete. Reviewing and improving locally…\n\n'+draft;
    updateLastMessage(target.content);
    const reviewText='ORIGINAL TASK:\n'+full.slice(0,4000)+'\n\nFIRST PASS:\n'+draft.slice(0,6800)+
      '\n\nSECOND PASS: Critically check this draft and produce a BETTER final response. '+active.review+
      ' Return only your polished final result, not a description of the revision process.';
    let revised='';
    try{
      const second=await engine.chat.completions.create({messages:[{role:'system',content:system},{role:'user',content:reviewText}],temperature:Math.min(.65,active.temperature??.55),max_tokens:active?.secondTokens??950,stream:true});
      for await(const chunk of second){if(controller.signal.aborted)break;const delta=chunk.choices?.[0]?.delta?.content||'';if(delta){revised+=delta;target.content=revised;updateLastMessage(target.content)}}
      if(!revised.trim())target.content=draft;
      if(controller.signal.aborted&&!revised.trim())target.content=draft;
    }catch(error){target.content=draft+'\n\n[Refinement could not finish; the first-pass result is preserved.]';}
  }
  writeStore();
  }
 }catch(error){target.content=controller.signal.aborted?'Generation stopped.':'Could not generate a response: '+(error?.message||'Unknown error')+'\n\nCheck the selected AI mode under Models & setup.';updateLastMessage(target.content);writeStore();}
 finally{isGenerating=false;activeStream=null;$('#chatSend').disabled=false;$('#chatStop').hidden=true;renderChat();}
}
function updateLastMessage(text){const last=$('#chatMessages .bubble.assistant:last-child .bubble-body');if(last)last.textContent=text;$('#chatMessages').scrollTop=$('#chatMessages').scrollHeight;}
function renderHistory(){
 const root=$('#historyList');if(!conversations.length){root.innerHTML='<p>No saved conversations yet.</p>';return;}
 root.innerHTML=conversations.map(c=>'<article class="history-card"><strong>'+esc(c.title)+'</strong><p>'+esc(c.messages.filter(m=>m.role==='user').slice(-1)[0]?.content?.slice(0,110)||'A fresh start')+'</p><small>'+new Date(c.created).toLocaleDateString()+' · '+c.messages.length+' messages</small><div><button data-open-chat="'+esc(c.id)+'">Open →</button><button data-delete-chat="'+esc(c.id)+'">Delete</button></div></article>').join('');
}
$('#historyList').addEventListener('click',e=>{const a=e.target.closest('[data-open-chat]');if(a){currentId=a.dataset.openChat;navigate('chat');return;}const b=e.target.closest('[data-delete-chat]');if(b&&confirm('Delete this local conversation?')){conversations=conversations.filter(c=>c.id!==b.dataset.deleteChat);if(currentId===b.dataset.deleteChat){currentId=conversations[0]?.id||null;if(!currentId)newChat(false)}writeStore();renderHistory();notice('Conversation deleted.')}});
function exportAll(){download('candy-studio-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({format:'CandyStudio-v1',created:new Date().toISOString(),conversations},null,2),'application/json');notice('Local backup downloaded.')}
$('#exportHistory').addEventListener('click',exportAll);
$('#settingsExport').addEventListener('click',exportAll);
$('#clearConversations').addEventListener('click',()=>{if(!confirm('Delete all local Studio conversations? Export a backup first if you want to keep them.'))return;conversations=[];newChat(false);writeStore();notice('Local conversation history cleared.')});
function setDownloadProgress(value,label,state='loading'){
 const parent=$('#modelProgress'),bar=$('#modelProgressBar');
 if(!parent)return;
 parent.hidden=false;parent.dataset.state=state;
 const pct=clamp(Number(value)||0,0,100);
 $('#modelProgressFill').style.width=pct+'%';
 $('#modelProgressPercent').textContent=Math.round(pct)+'%';
 bar?.setAttribute('aria-valuenow',String(Math.round(pct)));
 $('#modelProgressTitle').textContent=state==='error'?'Could not load model':state==='ready'?'✓ Local model ready':state==='loading'?'Downloading local model…':'Preparing local model…';
 $('#modelProgressText').textContent=String(label||'Preparing local model…').slice(0,350);
 $('#modelProgressTip').textContent=state==='error'?'Try a smaller model, or use Instant AI when the hosted service is available.':state==='ready'?'You can now start chatting on this device.':'First downloads can take several minutes and several gigabytes. Keep this tab open.';
 $('#modelProgressClose').hidden=state==='loading';
}
$('#modelProgressClose').addEventListener('click',()=>{$('#modelProgress').hidden=true;});
const instantStatus=(message,ready)=>{
 for(const id of ['instantStatus','instantSetupStatus']){
  const node=$('#'+id);
  if(node){node.textContent=message;node.dataset.ready=String(Boolean(ready));}
 }
};
function updateChatMode(){
 $('#chatTransport').value=chatMode;
 $('#hostedChoice').hidden=chatMode!=='instant';
 if(chatMode==='instant'){
  $('#chatModelName').textContent=instantReady?'⚡ Instant AI':'⚡ Instant AI · not connected';
  $('#chatModelHint').textContent=instantReady?'Hosted chat · no model download · prompts leave this device':'Hosted service is not connected. Use Private Local AI or follow the setup guide.';
  setStatus(instantReady?'Instant AI online':'Instant AI not connected',instantReady);
 }else{
  $('#chatModelName').textContent=engine?(window.RandomAILocal?.getName?.(loadedModel)||loadedModel):'Local model not loaded';
  $('#chatModelHint').textContent=engine?'Runs on your device · no API key':'Download a compatible local model to run on this device.';
  setStatus(engine?'Local model ready':'Model not loaded',!!engine);
 }
}
async function checkInstant(){
 if(!instantEndpoint){
  instantReady=false;
  instantStatus('Not connected: the site owner needs to deploy studio-free-ai/ and set its HTTPS Worker URL in public/studio/free-config.js. Visitors can use Private Local AI meanwhile.',false);
  updateChatMode();return false;
 }
 if(instantCheckPromise)return instantCheckPromise;
 instantStatus('Checking the hosted AI service…',false);
 instantCheckPromise=(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch(instantEndpoint+'/health',{cache:'no-store',signal:controller.signal,mode:'cors'});
   if(!response.ok)throw Error('Health check returned HTTP '+response.status);
   const body=await response.json();
   if(body?.available!==true)throw Error('Worker is online, but its AI binding is not available.');
   instantReady=true;
   instantStatus('✓ Instant AI connected. Visitors can chat without downloading a model. Hosted requests are subject to free-service quotas.',true);
  }catch(error){
   instantReady=false;
   instantStatus('Instant AI is unavailable: '+String(error?.message||'connection failed').slice(0,145)+'. Local models can still be used.',false);
  }finally{clearTimeout(timer);instantCheckPromise=null;updateChatMode()}
  return instantReady;
 })();
 return instantCheckPromise;
}
$('#chatTransport').addEventListener('change',e=>{
 chatMode=e.target.value==='local'?'local':'instant';
 try{localStorage.setItem(chatModeKey,chatMode)}catch{}
 updateChatMode();
});
$('#instantStart').addEventListener('click',()=>{chatMode='instant';try{localStorage.setItem(chatModeKey,chatMode)}catch{}updateChatMode();navigate('chat');if(!instantReady)notice('Instant AI needs the site owner’s hosted service. See Models & setup.');});
$('#instantCheck').addEventListener('click',checkInstant);
$('#instantSetupCheck').addEventListener('click',checkInstant);
void checkInstant();
function updateModelLabel(){
 if(chatMode==='local')updateChatMode();
 const loaded=!!engine;
 if($('#topModelDownload'))$('#topModelDownload').textContent=loaded&&$('#topModelSelect')?.value===loadedModel?'✓ Loaded':'↓ Load';
}
updateModelLabel();
const gpu=navigator.gpu;
$('#gpuCheck').textContent=gpu?'WebGPU detected. Choose a small model to begin. The exact GPU adapter is checked when you press Load.':'This browser does not offer WebGPU. Local loading is unavailable; hosted Instant AI does not need WebGPU.';
if(!gpu)$('#loadModel').disabled=true;
let loadingModel=false;
$('#loadModel').addEventListener('click',async()=>{
 if(loadingModel)return;
 if(!gpu){setDownloadProgress(0,'WebGPU is unavailable. Use current desktop Chrome/Edge, or Instant AI after setup.','error');return;}
 if(isGenerating){setDownloadProgress(0,'Stop the current chat generation before switching models.','error');return;}
 const id=$('#modelSelect').value;
 if(!id){setDownloadProgress(0,'Choose a supported local model from the full catalog. If the list is empty, retry the model catalog.','error');return;}
 const btn=$('#loadModel');
 loadingModel=true;btn.disabled=true;$('#topModelDownload').disabled=true;
 btn.textContent='Loading model…';$('#topModelDownload').textContent='⏳ Loading…';
 setDownloadProgress(1,'Checking WebGPU compatibility and loading the model engine…');
 // When invoked from the topbar, the global bar is visible in any view.
 $('#modelProgress').scrollIntoView({block:'nearest',behavior:'auto'});
 try{
  const adapter=await gpu.requestAdapter();
  if(!adapter)throw Error('No compatible GPU adapter was found. Enable hardware acceleration or try a smaller model on Chrome/Edge.');
  setDownloadProgress(2,'Loading the WebLLM JavaScript runtime…');
  const lib=await import('https://esm.run/@mlc-ai/web-llm@0.2.87');
  if(!lib?.CreateMLCEngine||!Array.isArray(lib?.prebuiltAppConfig?.model_list))throw Error('The model library did not load correctly. Check connectivity and try again.');
  if(!lib.prebuiltAppConfig.model_list.some(m=>m.model_id===id))throw Error('That model ID is no longer offered by this version of WebLLM. Refresh the model list.');
  if(engine&&loadedModel===id){setDownloadProgress(100,'Already loaded — start chatting!','ready');chatMode='local';updateModelLabel();navigate('chat');return;}
  if(engine){try{await engine.unload()}catch{}engine=null;loadedModel='';}
  engine=await lib.CreateMLCEngine(id,{initProgressCallback:report=>{
    const value=typeof report.progress==='number'?Math.round(report.progress*100):2;
    setDownloadProgress(value,report.text||'Downloading model files and initializing GPU…');
  }});
  loadedModel=id;selectedMode='local';chatMode='local';
  try{localStorage.setItem(chatModeKey,chatMode)}catch{}
  const top=$('#topModelSelect');if([...top.options].some(o=>o.value===id))top.value=id;
  setDownloadProgress(100,'✓ Download complete. The model is ready for private local chat.','ready');
  updateModelLabel();notice('Local AI is ready. Start chatting.');navigate('chat');
 }catch(error){
  engine=null;loadedModel='';updateModelLabel();
  const message=String(error?.message||'Unknown model error');
  setDownloadProgress(0,message,'error');
  notice('Model failed to load. The reason is shown in the progress panel.');
 }finally{
  loadingModel=false;btn.disabled=!gpu||!$('#modelSelect').value;
  btn.textContent='↓ Download & load model';
  $('#topModelDownload').disabled=false; // If no GPU/catalog is available, clicking Load shows an explanation.
  updateModelLabel();
 }
});
// Quick header picker uses the same local loader, so model downloads follow one verified path.
$('#topModelDownload').addEventListener('click',()=>{
 const id=$('#topModelSelect').value;
 if(!id){setDownloadProgress(0,'Choose a local model first. Open All models to retry the catalog if the list is empty.','error');return;}
 $('#modelSelect').value=id;$('#modelSelect').dispatchEvent(new Event('change'));$('#loadModel').click();
});
$('#topModelSelect').addEventListener('change',()=>{
 const id=$('#topModelSelect').value;
 if(id&&$('#modelSelect').querySelector('option[value="'+CSS.escape(id)+'"]')){$('#modelSelect').value=id;$('#modelSelect').dispatchEvent(new Event('change'));}
 updateModelLabel();
});
const PALETTES={candy:['#180c3f','#6941ac','#e390d5','#ffca91','#e5c6ff'],ocean:['#070d25','#133b68','#187b9b','#7cd9cf','#c7dffa'],sunset:['#27113c','#8b3266','#ef725d','#ffc67b','#fff0b7'],forest:['#0a1b27','#1d5151','#39837a','#8bc58f','#eadf95'],mono:['#171133','#44346f','#8067af','#b4a4dd','#f1dbfb']};
const artCanvas=$('#artCanvas'),artCtx=artCanvas.getContext('2d');
function artRand(seed){let n=seed>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}}
function artSeed(text){let x=2166136261;for(let i=0;i<text.length;i++){x^=text.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
function drawArt(){
 const prompt=$('#artPrompt').value||'dream',style=$('#artStyle').value,palette=PALETTES[$('#artPalette').value],size=$('#artSize').value;let w=1024,h=1024;if(size==='landscape'){w=1280;h=720}else if(size==='portrait'){w=720;h=1280}artCanvas.width=w;artCanvas.height=h;
 const ctx=artCtx,rand=artRand(artSeed(prompt+'|'+style+'|'+palette[0]+'|'+seedCounter++));
 const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,palette[0]);grad.addColorStop(.4,palette[1]);grad.addColorStop(1,palette[0]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 ctx.globalCompositeOperation='screen';
 for(let i=0;i<38;i++){const x=rand()*w,y=rand()*h,r=(.08+rand()*.29)*Math.min(w,h),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,palette[1+Math.floor(rand()*4)]+'aa');g.addColorStop(.5,palette[1+Math.floor(rand()*4)]+'33');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 ctx.globalCompositeOperation='source-over';
 for(let i=0;i<22;i++){const c=palette[1+(i%4)],a=.08+rand()*.36;ctx.strokeStyle=c;ctx.globalAlpha=a;ctx.lineWidth=(1+rand()*14)*(w/1000);ctx.beginPath();
 if(style==='flow'||style==='waves'){const y=rand()*h,amplitude=(.07+rand()*.2)*h,frequency=2+rand()*5;for(let x=-20;x<=w+30;x+=13){const v=y+Math.sin(x/w*frequency*Math.PI*2+i*.8)*amplitude*(style==='flow'?.6:1);if(x===-20)ctx.moveTo(x,v);else ctx.lineTo(x,v)}}
 else if(style==='orbit'){const r=(.08+rand()*.48)*Math.min(w,h);ctx.ellipse(w/2+(rand()-.5)*w*.18,h/2+(rand()-.5)*h*.18,r,r*(.28+rand()*.8),rand()*Math.PI,0,Math.PI*2);}
 else if(style==='bloom'){const x=w*(.2+rand()*.6),y=h*(.2+rand()*.6),r=rand()*w*.4;for(let k=0;k<9;k++){const an=k*Math.PI*2/9;const px=x+r*Math.cos(an),py=y+r*Math.sin(an);if(k===0)ctx.moveTo(px,py);else ctx.quadraticCurveTo(x+rand()*r,y+rand()*r,px,py)}ctx.closePath();}
 else{const x=rand()*w,y=rand()*h,r=10+rand()*100;ctx.rect(x-r/2,y-r/2,r,r);}
 ctx.stroke();}
 ctx.globalAlpha=1;
 for(let i=0;i<Math.round(w*h/1500);i++){const x=rand()*w,y=rand()*h,r=(.5+rand()*2.7)*(w/1000);ctx.fillStyle=palette[2+Math.floor(rand()*3)];ctx.globalAlpha=.07+rand()*.62;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;
 const glow=ctx.createRadialGradient(w*.5,h*.55,Math.min(w,h)*.01,w*.5,h*.55,Math.min(w,h)*.46);glow.addColorStop(0,'#ffffff2e');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);$('#artDownload').disabled=false;
}
$('#artGenerate').addEventListener('click',()=>{drawArt();notice('New abstract artwork created.')});
$('#artDownload').addEventListener('click',()=>saveCanvas(artCanvas,'candy-studio-art.png'));
function saveCanvas(canvas,name){canvas.toBlob(blob=>{if(!blob)return notice('Could not export image.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)},'image/png')}
drawArt();
const pc=$('#photoCanvas'),px=pc.getContext('2d',{willReadFrequently:true});
$('#photoFile').addEventListener('change',event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>12_000_000)return notice('Choose an image below 12 MB.');
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{photoSource=img;photoDimensions=[img.naturalWidth,img.naturalHeight];const [w,h]=photoDimensions;const scale=Math.min(1,1400/Math.max(w,h));pc.width=Math.round(w*scale);pc.height=Math.round(h*scale);px.drawImage(img,0,0,pc.width,pc.height);$('#photoWidth').value=String(Math.min(w,4096));$('#photoHeight').value=String(Math.min(h,4096));$('#photoEmpty').hidden=true;$('#photoMeta').textContent=w+' × '+h+' · '+file.name;photoOutputReady=true;URL.revokeObjectURL(url);notice('Photo loaded. Choose an edit and apply.');};
 img.onerror=()=>{URL.revokeObjectURL(url);notice('Could not read this image.')};img.src=url;
});
$('#photoMode').addEventListener('change',()=>{$('#colorControls').hidden=$('#photoMode').value!=='remove';$('#resizeControls').hidden=$('#photoMode').value!=='resize'});
$('#photoTolerance').addEventListener('input',e=>$('#toleranceLabel').textContent=e.target.value);
$('#photoFeather').addEventListener('input',e=>$('#featherLabel').textContent=e.target.value);
$('#photoWidth').addEventListener('input',e=>{if($('#photoRatio').checked&&photoDimensions){$('#photoHeight').value=String(clamp(Math.round(Number(e.target.value)*photoDimensions[1]/photoDimensions[0]),16,4096))}});
$('#photoHeight').addEventListener('input',e=>{if($('#photoRatio').checked&&photoDimensions){$('#photoWidth').value=String(clamp(Math.round(Number(e.target.value)*photoDimensions[0]/photoDimensions[1]),16,4096))}});
pc.addEventListener('click',event=>{if(!photoSource||$('#photoMode').value!=='remove')return;const r=pc.getBoundingClientRect();const x=clamp(Math.floor((event.clientX-r.left)/r.width*pc.width),0,pc.width-1),y=clamp(Math.floor((event.clientY-r.top)/r.height*pc.height),0,pc.height-1);const d=px.getImageData(x,y,1,1).data;$('#photoColor').value='#'+[d[0],d[1],d[2]].map(x=>x.toString(16).padStart(2,'0')).join('');notice('Sampled color. Press Apply edit.')});
$('#photoApply').addEventListener('click',()=>{
 if(!photoSource)return notice('Choose a photo first.');
 const [w,h]=photoDimensions,mode=$('#photoMode').value;
 if(mode==='resize'){const a=clamp(Number($('#photoWidth').value)||w,16,4096),b=clamp(Number($('#photoHeight').value)||h,16,4096);pc.width=a;pc.height=b;px.imageSmoothingEnabled=true;px.imageSmoothingQuality='high';px.drawImage(photoSource,0,0,a,b);$('#photoMeta').textContent=a+' × '+b+' · resized image';}
 else{const scale=Math.min(1,1600/Math.max(w,h));pc.width=Math.max(1,Math.round(w*scale));pc.height=Math.max(1,Math.round(h*scale));px.drawImage(photoSource,0,0,pc.width,pc.height);const im=px.getImageData(0,0,pc.width,pc.height),v=parseInt($('#photoColor').value.slice(1),16),r=(v>>16)&255,g=(v>>8)&255,b=v&255,t=Number($('#photoTolerance').value),f=Number($('#photoFeather').value);
 for(let i=0;i<im.data.length;i+=4){const rr=im.data[i]-r,gg=im.data[i+1]-g,bb=im.data[i+2]-b,dist=Math.sqrt(rr*rr+gg*gg+bb*bb);const keep=f?clamp((dist-t)/Math.max(1,f),0,1):(dist>t?1:0);im.data[i+3]=Math.round(im.data[i+3]*keep)}
 px.putImageData(im,0,0);$('#photoMeta').textContent=pc.width+' × '+pc.height+' · transparent PNG preview';}
 photoOutputReady=true;notice('Edit applied. Download a PNG.');
});
$('#photoSave').addEventListener('click',()=>photoOutputReady?saveCanvas(pc,'candy-studio-photo.png'):notice('Choose a photo first.'));
function refreshVoices(){const s=$('#voiceSelect');const voices=speechSynthesis.getVoices();s.innerHTML='<option value="">Browser default</option>'+voices.map((v,i)=>'<option value="'+i+'">'+esc(v.name+' · '+v.lang)+'</option>').join('');}
if('speechSynthesis'in window){refreshVoices();speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);}
$('#voiceRate').addEventListener('input',e=>$('#voiceRateLabel').textContent=Number(e.target.value).toFixed(1)+'×');
$('#speakBtn').addEventListener('click',()=>{if(!('speechSynthesis'in window))return notice('Speech synthesis is unavailable in this browser.');const text=$('#speechText').value.trim();if(!text)return notice('Enter text to read.');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.slice(0,15000));const voices=speechSynthesis.getVoices();if($('#voiceSelect').value!=='')u.voice=voices[Number($('#voiceSelect').value)]||null;u.rate=Number($('#voiceRate').value);u.onerror=()=>notice('Voice playback could not start.');speechSynthesis.speak(u);notice('Reading aloud…');});
$('#stopSpeakBtn').addEventListener('click',()=>{window.speechSynthesis?.cancel();notice('Playback stopped.')});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;$('#dictationStatus').textContent=SR?'Voice recognition is available. Some browsers send speech to their provider.':'Voice dictation is not supported in this browser. Try desktop Chrome or a supported mobile browser.';
$('#listenBtn').disabled=!SR;
$('#listenBtn').addEventListener('click',()=>{if(!SR)return;recognition=new SR();recognition.lang=document.documentElement.lang||'en-US';recognition.continuous=true;recognition.interimResults=true;const start=$('#dictationText').value;recognition.onresult=e=>{let final=start,partial='';for(let i=0;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)final+=' '+t;else partial+=t}$('#dictationText').value=(final+' '+partial).trim()};recognition.onerror=e=>$('#dictationStatus').textContent='Recognition error: '+e.error;recognition.onend=()=>{$('#dictationStatus').textContent='Dictation stopped.'};try{recognition.start();$('#dictationStatus').textContent='● Listening…'}catch{notice('Could not start dictation.')}});
$('#stopListenBtn').addEventListener('click',()=>{recognition?.stop();});
$('#copyTranscript').addEventListener('click',()=>copy($('#dictationText').value));
const initial=(location.hash||'').slice(1);if(initial&&names[initial])navigate(initial);
window.addEventListener('hashchange',()=>{const view=(location.hash||'').slice(1);if(view&&names[view]&&!$('#view-'+view).classList.contains('active'))navigate(view)});
