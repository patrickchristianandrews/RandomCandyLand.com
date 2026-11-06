/* Unwrapped: whole-person synthesis grounded in the answers a visitor actually selected.
 * This is an exploratory reflection and communication guide, not a diagnosis,
 * hidden-preference predictor, compatibility score, or consent inference.
 */
(()=>{
'use strict';
const META={
 trust:{
  focus:'Reliability, choice and a felt sense of safety',
  interpretation:'Trust may be less about one fixed behavior and more about knowing that expectations, permission and limits will be respected. The same person can enjoy surprise in one setting and still need predictable agreements in another.',
  daily:'Notice which everyday interactions make it easier to relax, speak plainly or ask for help. Reliability can mean following through, explaining changes or asking instead of assuming.',
  intimate:'A selected intimate answer involving trust can mean comfort with clear agreements, attention or being listened to. It does not by itself indicate any specific activity or willingness to try it.',
  friction:'A partner may believe spontaneity communicates affection while I experience unexplained change as uncertainty. Both readings can be true in different situations.',
  request:'Before we try something unfamiliar, could we talk about what each of us expects, what is optional, and how either of us can change our mind?',
  experiment:'Choose one small agreement this week, such as checking plans or asking before a change. Notice whether the conversation itself improves comfort.',
  question:'When do I feel able to say what I need without managing the other person’s reaction?'
 },
 attachment:{
  focus:'Closeness, connection and preferred distance',
  interpretation:'Connection can involve attention, belonging and room to be oneself. A wish for closeness in one moment does not mean constant closeness is needed—or that alone time signals rejection.',
  daily:'Compare moments when companionship feels replenishing with moments when independence supports connection. Different contexts can invite different distances.',
  intimate:'A direct answer about closeness belongs to that context; it is not a prescription for a partner to remain available or to read silence as approval.',
  friction:'One person may seek contact to resolve uncertainty while the other needs time before discussing it. A clear return time can protect both needs.',
  request:'When one of us needs space or reassurance, can we say what that means and agree on when to reconnect?',
  experiment:'Try a two-minute connection check-in followed by an explicit choice for shared time or quiet time; compare which felt more supportive.',
  question:'What helps me distinguish healthy independence from feeling disconnected?'
 },
 affirmation:{
  focus:'Recognition, appreciation and the meaning of attention',
  interpretation:'Specific appreciation may matter because it shows that someone noticed effort, character or care rather than merely giving approval. Broad praise and precise recognition can feel quite different.',
  daily:'Track which kinds of acknowledgment land well: noticing effort, naming a quality, expressing gratitude or simply listening without fixing.',
  intimate:'An answer about affirming words describes the language that appealed in that scenario; it should not be generalized into wanting any form of praise from anyone.',
  friction:'A partner might give frequent generic compliments while I want fewer, more specific observations; neither person is necessarily withholding care.',
  request:'Could we each share one concrete thing we appreciated about the other today, instead of guessing which compliments matter?',
  experiment:'Exchange two genuine, specific appreciations—one about something done and one about a quality—then ask which felt more meaningful.',
  question:'Do I want praise, to be understood, or reassurance? How can I tell the difference?'
 },
 anticipation:{
  focus:'Pacing, expectation and the pleasure of a gradual process',
  interpretation:'Anticipation can be about preparing, creating meaning or enjoying a gradual build. A preference for pacing may change with mood, trust, available time and context.',
  daily:'Notice when planning and small rituals make an event more enjoyable, and when waiting feels stressful instead.',
  intimate:'A direct choice favoring anticipation is a stated preference for that option, not consent to withholding, delays or control outside what was selected.',
  friction:'A person who prefers quick decisions may interpret gradual pacing as hesitation. Agreeing on how much notice or buildup to use can reduce friction.',
  request:'Would it help to plan a little in advance, or would you rather decide in the moment? I’m open to finding a pace that works for both of us.',
  experiment:'Plan a low-pressure shared activity in two steps: discuss the idea today and choose the details together later. Compare anticipation with stress.',
  question:'When does anticipation enrich an experience, and when do I want to act immediately?'
 },
 sensation:{
  focus:'Sensory comfort, intensity and bodily context',
  interpretation:'Sensory preferences are often highly contextual. Texture, sound, warmth, closeness and intensity may feel welcome in one combination and overwhelming in another; more stimulation is not always better.',
  daily:'Notice which environments make conversation easier: quiet or lively, warm or cool, soft or structured. Use these observations as practical information, not a fixed label.',
  intimate:'One selected sensation does not imply liking other sensations. Keep comfort limits, bodily autonomy and individual preferences separate.',
  friction:'A setting one person calls exciting might feel distracting to the other. Environmental adjustments often solve a problem before it becomes a relationship disagreement.',
  request:'What parts of this setting feel comfortable or distracting to you? We can change the environment without changing what we want from each other.',
  experiment:'Compare two ordinary settings—for example, a quiet conversation and a lively one—then describe what helped each of you focus and feel comfortable.',
  question:'Which sensations help me feel present, and which compete with connection?'
 },
 control:{
  focus:'Agency, choice and how responsibility is shared',
  interpretation:'Agency can mean deciding, taking turns, having a clear role or retaining the ability to decline. Enjoying another person’s initiative in one situation is compatible with wanting independence in another.',
  daily:'Notice when choosing together is energizing and when delegating decisions reduces effort. The meaning of leadership depends on whether it is welcome and reversible.',
  intimate:'A role or control-related selection is not global consent or a permanent relationship rule. Any role is bounded by the actual choice and the people involved.',
  friction:'Two people can each try to show care by taking charge—or both wait for the other to initiate. Discussing responsibility may be more useful than debating who is naturally a leader.',
  request:'Would you like to choose this time, have me take the lead, or decide together? Any of those is fine, and we can switch.',
  experiment:'For one small non-intimate plan, take turns choosing a component. Afterward ask whether shared, delegated or alternating decisions felt easiest.',
  question:'Where does leadership feel supportive, and where does it feel like pressure?'
 },
 novelty:{
  focus:'Exploration, variety and the conditions for curiosity',
  interpretation:'Curiosity is not the same as commitment. Novelty can mean a different perspective, story, atmosphere or conversation—not necessarily a new intimate activity.',
  daily:'Look at ordinary ways I enjoy change: new ideas, creative projects, routes, experiences or learning. Which kinds of novelty are energizing rather than draining?',
  intimate:'A fantasy or interesting idea should remain in the imagination unless someone separately expresses real-world interest and everyone involved agrees.',
  friction:'For one person, repetition signals reliability; for another, variation keeps attention engaged. A shared routine with optional variety can honor both.',
  request:'What is one small, comfortable way we could make an ordinary evening feel different? Let’s each name what should stay familiar.',
  experiment:'Try a harmless variation on a familiar shared activity, with an agreed fallback plan. Discuss whether the novelty itself mattered or the collaboration.',
  question:'Do I most enjoy discovery, surprise, personal expression or the feeling of choosing something new?'
 },
 narrative:{
  focus:'Imagination, symbolism and the stories that give experiences meaning',
  interpretation:'Stories and roles can let someone explore possibilities without endorsing or wanting to live them. Imagining something may be a form of creativity rather than a statement of identity or intention.',
  daily:'Notice how stories, humor, art, memory or role changes make ordinary situations vivid. Which narratives invite connection, and which are simply enjoyable to imagine?',
  intimate:'An imagined scene is not a request to act. Keep fictional interest, curiosity about discussing it, and consent to real activity in separate categories.',
  friction:'One person may use a hypothetical story to think aloud while another interprets it as a proposal. Say which one it is before discussing details.',
  request:'I have an idea I enjoy imagining. Can I tell you about it as a story, without it being a request for us to do anything?',
  experiment:'Write or describe two different endings to a harmless shared story. Compare what each version reveals about imagination, humor or comfort.',
  question:'Which parts of a story attract me—the setting, role, emotion, choice or ending?'
 },
 aesthetics:{
  focus:'Visual details, atmosphere and personal expression',
  interpretation:'Aesthetic attraction can be about the mood or meaning of an environment, not just appearance. Noticing an image, style or texture does not predict interest in every activity associated with it.',
  daily:'Consider the role of lighting, clothing, design, music and visual order in how I feel and communicate.',
  intimate:'An aesthetic preference can be enjoyed as design or fantasy. It does not create expectations about a body, partner or performance.',
  friction:'Partners may attach different meanings to the same visual cue. Asking what it represents prevents the style from carrying assumptions.',
  request:'I’m drawn to this atmosphere or style. What does it feel like to you, and is there a way we could enjoy it without pressure?',
  experiment:'Choose an ordinary space or playlist together and each explain one detail that contributes to comfort or enjoyment.',
  question:'Am I responding to beauty, familiarity, creativity, symbolism or a particular memory?'
 },
 ritual:{
  focus:'Meaningful routines, transitions and mutual predictability',
  interpretation:'A small repeated gesture can communicate attention and belonging, while strict routines can sometimes feel restrictive. The meaning of the ritual matters more than repetition itself.',
  daily:'Notice which routines feel caring and which feel automatic. A ritual is useful when both people can revise it.',
  intimate:'A selected ritual-like preference should be understood as contextual and optional, not a required script for every encounter.',
  friction:'One person may read a missed ritual as indifference while the other never knew its meaning. Naming it makes repair easier.',
  request:'Is there a small tradition that makes us feel connected? We can keep what works and change what doesn’t.',
  experiment:'Invent a brief greeting or end-of-day check-in for one week. Keep it only if it genuinely adds something for both people.',
  question:'What makes a routine feel meaningful rather than compulsory?'
 },
 taboo:{
  focus:'Private imagination, social expectations and boundaries',
  interpretation:'Some topics draw attention because they are unusual, emotional or culturally charged. The existence of curiosity alone does not establish endorsement, real-world interest or a safe action.',
  daily:'Consider whether privacy, curiosity or the freedom to think without judgment is the meaningful element—not necessarily the literal scenario.',
  intimate:'Any fantasy-only, declined or unsure choice keeps its stated boundary. A taboo label never authorizes a behavior.',
  friction:'A partner might react to the content of a thought before understanding whether it was just imagination. Explicitly separating thoughts from requests reduces confusion.',
  request:'Could we talk about an unusual idea as a thought experiment? I want to be clear that talking does not mean either of us wants to act on it.',
  experiment:'Practice naming the difference between “I can imagine it,” “I’m curious to learn,” and “I would actually want to discuss trying it,” without pressuring anyone to answer.',
  question:'What does this topic mean to me—curiosity, emotion, privacy, story or something else?'
 },
 associations:{
  focus:'Personal associations and context-dependent meanings',
  interpretation:'A detail can gain meaning from memory, familiarity, aesthetics or a particular context. The same detail may evoke different feelings at different times.',
  daily:'Identify when a color, sound, place or familiar gesture changes how an ordinary experience feels.',
  intimate:'A specific association does not establish a broad category of interests or imply a particular origin.',
  friction:'A partner may not recognize why a small detail matters. Describing the feeling is often more useful than demanding the exact cue.',
  request:'That detail has a particular meaning for me. Would you be open to hearing what I associate it with?',
  experiment:'Each share a positive, ordinary sensory memory and name what made it meaningful. Avoid assuming the other person experiences the same association.',
  question:'Is this connection stable over time or particular to one memory, person or setting?'
 }
};
const PAIR={
 'affirmation|trust':'Feeling noticed may strengthen trust when appreciation is specific and believable. If both matter, distinguish wanting recognition from wanting reassurance, then ask which action communicates each one.',
 'attachment|trust':'Closeness often feels more usable when agreements make it safe to express needs and boundaries. Notice whether asking for connection becomes easier when a return time or expectation is clear.',
 'anticipation|trust':'A gradual pace can feel exciting when the process is chosen and predictable. The same waiting can feel uncertain when its meaning is unclear, so discuss the difference.',
 'sensation|trust':'Comfort with an environment may support presence and closeness. Trust cannot replace a specific sensory preference or boundary; check both separately.',
 'control|trust':'Agency and trust need not be opposites. Leadership can be welcomed because the choice remains reversible, with clear opportunities to say no or change direction.',
 'control|novelty':'Variety may feel better when I can shape the change. Offer a menu of small options and agree that choosing the familiar one is equally valid.',
 'narrative|novelty':'Imagination can be a source of variety without becoming a real-world plan. Ask whether the fun lies in storytelling, discovery or actual change before proposing anything.',
 'aesthetics|narrative':'Atmosphere and story may work together by setting a mood. It may help to describe what an image or setting symbolizes rather than assuming a specific activity is desired.',
 'anticipation|narrative':'A story can build anticipation through imagination, even if nothing physical is planned. Distinguish enjoying the build-up from wanting an outcome.',
 'affirmation|attachment':'Feeling understood and feeling close may reinforce each other, but they are not identical. Ask whether acknowledgment, time together or practical care is the stronger need.',
 'ritual|trust':'A repeatable, freely chosen routine can make intentions clear. If it becomes obligatory, renegotiate rather than treating repetition as proof of care.',
 'novelty|trust':'Curiosity and safety can coexist. A familiar framework for discussing surprises may protect the relationship while leaving room for playful exploration.',
 'control|narrative':'Playing with roles or scenarios can coexist with firm personal agency. A role in a story should never be confused with a standing agreement about real-life decisions.',
 'aesthetics|sensation':'Atmosphere can shape sensory comfort, but visual appeal and bodily comfort are separate: ask both what looks enjoyable and what actually feels comfortable.'
};
const neg=/\b(?:none|neither|not interested|no interest|prefer not|rather skip|not for me|i don't|do not want|would not|exclusivity)\b/i;
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el};
const put=(parent,tag,cls,text)=>{const el=make(tag,cls,text);parent.append(el);return el};
const human=(d,k)=>d.lenses?.[k]?.label||k;
const unique=rows=>[...new Map(rows.map(x=>[x.number+'|'+x.answer,x])).values()];
function evidence(d,part){
 const skip=new Set((d.direct?.specificSelections||[]).filter(x=>x.context==='Adult media watched / imagined').map(x=>x.questionNumber));
 const rows=[];
 for(const q of d[part]?.questions||[]){
  if(part==='direct'&&skip.has(q.number))continue;
  for(const a of q.selected||[]){
   if(part==='direct'&&neg.test(a.text))continue;
   for(const tag of a.axes||[])if(d.lenses?.[tag])rows.push({tag,part,number:q.number,answer:a.text,
    intent:part==='direct'?q.intentLabel||'':''});
  }
 }
 return rows;
}
function rankThemes(d,dir,psych){
 return Object.keys(d.lenses||{}).map(k=>({
  k,d:unique(dir.filter(x=>x.tag===k)),p:unique(psych.filter(x=>x.tag===k))
 })).filter(x=>x.d.length||x.p.length).sort((a,b)=>
  Number(b.d.length>0&&b.p.length>0)-Number(a.d.length>0&&a.p.length>0)||
  (b.d.length+b.p.length)-(a.d.length+a.p.length));
}
function witnesses(parent,kind,items){
 const holder=put(parent,'div','report-person-witness');
 put(holder,'strong','',kind);
 if(!items.length){put(holder,'p','report-muted','No matching answer selected in this questionnaire.');return}
 const list=put(holder,'ul','');
 for(const row of items.slice(0,2))
  put(list,'li','','Q'+row.number+' · '+row.answer+(row.intent&&row.intent!=='Not specified'?' ('+row.intent+')':''));
}
function micro(parent,heading,text){
 const cell=put(parent,'div','report-person-angle');
 put(cell,'h5','',heading);put(cell,'p','',text);
}
const fmtQuote=x=>'“'+x+'”';
function addThemeSection(parent,d,theme,index){
 const card=put(parent,'article','report-person-thread');
 const m=META[theme.k]||null;
 put(card,'p','report-person-eyebrow','CONNECTION THREAD '+String(index+1).padStart(2,'0'));
 put(card,'h3','',human(d,theme.k)+(m?' · '+m.focus:''));
 put(card,'p','report-person-count',theme.d.length+' intimate answers · '+theme.p.length+' everyday answers sharing this coded theme');
 const lead=m?.interpretation||d.lenses[theme.k]?.detail||'A repeated theme can be useful for reflection without proving any particular psychological explanation.';
 put(card,'p','report-person-interpret','Possible interpretation: '+lead);
 const angles=put(card,'div','report-person-angles');
 micro(angles,'Everyday life',m?.daily||'When does this theme appear outside intimacy, and when does it not?');
 micro(angles,'Intimacy & personal preference',m?.intimate||'Which answers did I expressly choose? Do not infer anything beyond them.');
 micro(angles,'In relationships',m?.friction||'How might another person experience the same situation differently?');
 const proof=put(card,'div','report-person-evidence');
 witnesses(proof,'What I selected in the preference quiz',theme.d);
 witnesses(proof,'What I selected in the everyday quiz',theme.p);
 const real=put(card,'div','report-person-action');
 put(real,'strong','','A conversation worth having');
 put(real,'p','',fmtQuote(m?.request||'What does this theme mean to each of us, and when does it matter?'));
 put(real,'strong','','A low-pressure experiment');
 put(real,'p','',m?.experiment||'Describe a small non-intimate change, agree on boundaries, then reflect on what helped.');
 put(real,'em','',m?.question||'What did I learn from how I answered these questions?');
}
function combinations(themes){
 const map=new Map();
 for(const t of themes)map.set(t.k,t);
 const combos=[];
 for(let i=0;i<themes.length;i++)for(let j=i+1;j<themes.length;j++){
  const a=themes[i],b=themes[j],key=[a.k,b.k].sort().join('|');
  const shared=Number(a.d.length&&a.p.length&&b.d.length&&b.p.length);
  const sentence=PAIR[key];
  if(!sentence)continue;
  const weight=shared*100+Math.min(a.d.length+b.d.length,30)+Math.min(a.p.length+b.p.length,15);
  combos.push({a,b,key,sentence,weight});
 }
 return combos.sort((a,b)=>b.weight-a.weight).slice(0,6);
}
function pairedContexts(d){
 const out=[];
 const psych=new Map((d.psych?.questions||[]).map(q=>[q.coreId||q.number,q]));
 for(const q of d.direct?.questions||[]){
  if(q.coreId>32||q.coreId<1||!(q.selected||[]).length)continue;
  const other=psych.get(q.coreId);if(!other?.selected?.length)continue;
  const tags=new Set(q.selected.flatMap(a=>a.axes||[]));
  const shared=other.selected.flatMap(a=>a.axes||[]).some(t=>tags.has(t));
  if(shared)continue;
  const first=q.selected[0],second=other.selected[0];
  if(neg.test(first.text))continue;
  out.push({direct:q,psych:other,first,second});
 }
 return out.slice(0,3);
}
function steps(parent,d,theme){
 const m=META[theme.k];
 if(!m)return;
 const section=put(parent,'article','report-person-step');
 put(section,'h4','',human(d,theme.k)+' · '+m.focus);
 put(section,'p','report-person-step-why','Why this is here: '+theme.d.length+' directly coded and '+theme.p.length+' everyday answers brought up this theme. That is evidence of selected answer patterns, not a diagnosis.');
 put(section,'p','','Start with: '+m.experiment);
 put(section,'p','','Try saying: '+fmtQuote(m.request));
 put(section,'p','','Then ask myself: '+m.question);
}
function build(d){
 const root=make('section','report-section report-whole-person');
 root.dataset.wholePerson='answer-grounded';
 put(root,'p','report-kicker','THE WHOLE PERSON · MULTIPLE PERSPECTIVES');
 put(root,'h2','','How it all fits together');
 put(root,'p','report-person-lead','A fuller interpretation of the same answers: personal needs, everyday behavior, intimacy, relationships, differing contexts, boundaries and practical next steps. This is a set of questions and possible connections—not a test of anyone’s hidden motives or a diagnosis.');
 const dir=evidence(d,'direct'),psych=evidence(d,'psych'),themes=rankThemes(d,dir,psych);
 const joint=themes.filter(x=>x.d.length&&x.p.length);
 const confirmed=(d.interests||[]).filter(x=>x.directSelection>0||x.specificSelected);
 const fantasy=(d.direct?.questions||[]).filter(q=>/fantasy/i.test(q.intentLabel||'')&&(q.selected||[]).length);
 const explicitNo=(d.direct?.questions||[]).filter(q=>(q.selected||[]).some(a=>neg.test(a.text))).slice(0,5);
 const summary=put(root,'div','report-person-summary');
 put(summary,'h3','','The bigger picture, in my own words');
 if(joint.length){
  const main=joint.slice(0,3).map(x=>human(d,x.k).toLowerCase());
  put(summary,'p','','When I read my two questionnaires together, the strongest recurring connections are '+main.join(', ')+'. Those categories are represented in both my intimate responses and my everyday choices. Rather than treating them as isolated labels, I can look at the situations that give each one meaning and how the needs might support—or compete with—each other.');
  const a=joint[0],b=joint[1]||a;
  put(summary,'p','','For instance, in the preference quiz I selected '+fmtQuote(a.d[0].answer)+' (Q'+a.d[0].number+'). In the everyday quiz I selected '+fmtQuote(b.p[0].answer)+' (Q'+b.p[0].number+'). Both choices point toward different pieces of my experience. Their relationship is worth exploring, but one does not establish the cause of the other.');
  if(joint.length>=3)put(summary,'p','','A third lens—'+human(d,joint[2].k).toLowerCase()+'—may change how I interpret the first two. Looking through several lenses prevents a single strong answer from becoming an overgeneralized story about who I am.');
 }else put(summary,'p','','My two quizzes do not yet supply enough matching evidence for a full cross-context story. I can still use the specific answers below without filling gaps with guesses.');
 const directly=confirmed.slice(0,5).map(x=>x.name);
 put(summary,'p','','My own explicitly named or selected interests'+(directly.length?' include '+directly.join(', '):' have not yet been individually marked')+'. Those choices carry more meaning than a thematic suggestion. I can be curious about something without agreeing to experience it, and I can decline a suggestion regardless of other scores.');
 put(summary,'p','report-person-limit','The everyday questionnaire provides context, not an independent diagnostic confirmation. The same words can mean different things to different people, and an omitted or different answer matters too.');
 const h=put(root,'div','report-person-chapter');
 put(h,'h3','','1. Connections viewed through four lenses');
 put(h,'p','report-muted','Each thread separates an internal possibility from everyday life, intimate preferences, relationship dynamics and the actual answers behind it.');
 for(const [index,t] of (joint.length?joint:themes).slice(0,5).entries())addThemeSection(h,d,t,index);
 const weave=put(root,'div','report-person-chapter');
 put(weave,'h3','','2. How different needs might interact');
 put(weave,'p','report-muted','A person rarely has just one driving theme. These connections are conditional possibilities built from themes present in my chosen answers, not claims about where my preferences came from.');
 const pairs=combinations(themes);
 for(const pair of pairs){
  const block=put(weave,'article','report-person-weave');
  put(block,'h4','',human(d,pair.a.k)+' × '+human(d,pair.b.k));
  put(block,'p','',pair.sentence);
  const dproof=pair.a.d[0]||pair.b.d[0],pproof=pair.b.p[0]||pair.a.p[0];
  const proof=put(block,'p','report-person-proof','Question anchors: '+(dproof?'intimate Q'+dproof.number+' · '+dproof.answer:'no corresponding intimate selection')+'; '+(pproof?'everyday Q'+pproof.number+' · '+pproof.answer:'no corresponding everyday selection')+'.');
  proof.dataset.evidence='actual-answers';
  put(block,'p','report-person-prompt','Ask: When does '+human(d,pair.a.k).toLowerCase()+' help '+human(d,pair.b.k).toLowerCase()+'—and when might they pull in different directions?');
 }
 if(!pairs.length)put(weave,'p','','There are not enough joint patterns to draw an interaction map. Revisit this after answering more questions.');
 const nuance=put(root,'div','report-person-chapter');
 put(nuance,'h3','','3. Apparent contradictions may be context, not inconsistency');
 put(nuance,'p','','Different answers are worth examining rather than hiding. I may want predictability at work and spontaneity during leisure, or appreciate leading sometimes and following at others. Neither automatically cancels the other; the question is what changes between situations.');
 const contrasts=pairedContexts(d);
 for(const item of contrasts){
  const row=put(nuance,'article','report-person-contrast');
  put(row,'strong','','A question pair to revisit');
  put(row,'p','','In the intimate quiz, Q'+item.direct.number+': '+fmtQuote(item.first.text)+'.');
  put(row,'p','','In everyday psychology, Q'+item.psych.number+': '+fmtQuote(item.second.text)+'.');
  put(row,'p','report-person-prompt','What is different about these contexts—comfort, responsibility, relationship, mood, privacy or the meaning of the question? A coded difference is not proof of inner conflict.');
 }
 if(!contrasts.length)put(nuance,'p','report-muted','The answered corresponding pairs did not yield a useful non-overlapping example. Not everyone will show a contrasting pair.');
 const boundary=put(root,'div','report-person-chapter');
 put(boundary,'h3','','4. What I chose, what is only fantasy, and what stays off-limits');
 put(boundary,'p','','The distinction between “interested,” “curious,” “fantasy only,” “unsure” and “no” is central. It protects both self-understanding and real relationships. A partner can understand an idea without being asked to do it.');
 if(confirmed.length){
  const l=put(boundary,'ul','report-person-choice-list');
  for(const item of confirmed.slice(0,12)){
   const status=item.directSelection===2?'Interested':item.directSelection===1?'Curious':'Named in selected question';
   put(l,'li','',status+' · '+item.name);
  }
 }
 if(fantasy.length)put(boundary,'p','','My actual answers contain '+fantasy.length+' question'+(fantasy.length===1?'':'s')+' labeled fantasy-only. That means imagination, not agreement to act. Example: Q'+fantasy[0].number+' · '+fantasy[0].selected[0].text+'.');
 if(explicitNo.length)put(boundary,'p','','Examples of clear declines in my actual selections: '+explicitNo.slice(0,3).map(q=>'Q'+q.number+' · '+q.selected[0].text).join(' / ')+'. They are not overwritten by related psychological themes.');
 put(boundary,'p','report-person-limit','A “not for me” choice is never a challenge to overcome. Consent requires an independent, specific, voluntary agreement, and someone can change their mind.');
 const communication=put(root,'div','report-person-chapter report-person-communication');
 put(communication,'h3','','5. From insight to better communication');
 put(communication,'p','','A useful conversation can start with my answer, move to what I mean by it, ask what my partner experiences, and end with one mutually acceptable experiment. The goal is understanding—not persuading anyone to like what I like.');
 const sequence=put(communication,'ol','report-person-conversation-sequence');
 for(const item of [
  'Name an actual response: “I selected this answer because, to me, it means…”',
  'Separate meaning from action: “This is a preference / curiosity / fantasy only / boundary.”',
  'Ask for their perspective: “Does this mean something similar or different to you?”',
  'Make room for limits: “It is completely fine if you do not share this interest.”',
  'Agree only on a small, optional next step and check in afterward.'
 ])put(sequence,'li','',item);
 for(const theme of joint.slice(0,4))steps(communication,d,theme);
 const starter=put(communication,'div','report-person-conversation-starter');
 put(starter,'h4','','A gentle way to share my results');
 const labels=joint.slice(0,2).map(x=>human(d,x.k).toLowerCase()).join(' and ');
 put(starter,'p','',fmtQuote('One thing I noticed when I looked at my answers together was '+(labels||'how much context matters to me')+'. I am not asking you to agree or try anything. I would love to understand what helps you feel connected and what your boundaries are. Would you like to compare our perspectives?'));
 const plan=put(root,'div','report-person-chapter');
 put(plan,'h3','','6. A practical week of experiments—without pressure');
 const guide=[
  ['Day 1 · Notice','Write down two specific occasions when a top theme helped and one time it did not. Describe the situation, not a theory about its origin.'],
  ['Day 2 · Translate','Turn one quiz answer into an everyday-language sentence a partner could understand without knowing the quiz.'],
  ['Day 3 · Ask','Invite the other person to share their own meaning and boundary without interpreting or correcting it.'],
  ['Day 4 · Adjust','Try one agreed, non-intimate change to atmosphere, attention, planning or decision-making. Either person can opt out.'],
  ['Day 5 · Revisit','Compare how the same need appeared in work, friendship, private time or a close relationship.'],
  ['Day 6 · Repair','Practice: “I may have misunderstood what you meant. What would have helped you feel heard?”'],
  ['Day 7 · Keep what fits','Choose one helpful phrase, routine or shared understanding. Discard anything that felt forced, and leave unselected topics unclaimed.']
 ];
 for(const [title,text] of guide){
  const step=put(plan,'article','report-person-day');
  put(step,'strong','',title);put(step,'p','',text);
 }
 const further=put(root,'div','report-person-chapter report-person-mira');
 put(further,'h3','','7. Questions to bring to Mira—or a trusted conversation');
 for(const sentence of [
  'Where do my strongest everyday and intimate themes genuinely agree, and where might they only share the same vocabulary?',
  'How can I tell whether I am asking for reassurance, closeness, appreciation, autonomy or sensory comfort?',
  'Which of my fantasy-only answers are best left as imagination, and how could I explain that clearly?',
  'How do I talk about a difference without interpreting it as rejection or a compatibility score?',
  'Which experiments are meaningful for me without becoming demands on another person?'
 ])put(further,'p','report-person-mira-question',sentence);
 put(root,'p','report-person-limit','Method note: all question anchors and counts come from selected answers in these quizzes; the descriptions and conversation ideas are educational possibilities. A theme can be coded by multiple questions and counts are not probabilities. Some questions overlap by design. This program has not been clinically validated to determine origins, hidden preferences, diagnoses or relationship compatibility.');
 return root;
}
function enhancePersonal(report,d){
 if(!report||!d||report.querySelector('.report-whole-person'))return report;
 const section=build(d);
 const overview=[...report.children].find(el=>el.matches?.('section')&&el.querySelector('h2')?.textContent.startsWith('01'));
 if(overview?.nextSibling)report.insertBefore(section,overview.nextSibling);
 else report.append(section);
 return report;
}
window.UnwrappedWholePerson=Object.freeze({build,enhancePersonal});
})();