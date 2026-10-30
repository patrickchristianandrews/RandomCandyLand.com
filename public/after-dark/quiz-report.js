/* Combined After Dark quiz report. Local DOM -> browser Save as PDF.
 * No requests, accounts, generated diagnoses, or independent/conflicting scores.
 * Builds one report from the same canonical data used by both quiz result pages.
 */
(()=>{
'use strict';
const lensQuestions={
 trust:'What would help you feel safe saying yes, maybe, or no without pressure?',
 control:'Are you interested in making decisions, handing off a choice, or agreeing on clear roles? What stays outside those roles?',
 attachment:'Does this idea represent feeling close, noticed, secure, or reassured? What kind of attention matters most?',
 affirmation:'Which words or gestures make you feel genuinely valued, and which would feel uncomfortable?',
 sensation:'What specific sensations, textures, sounds, or levels of intensity are appealing or unpleasant?',
 aesthetics:'Is this mainly about how something looks or feels, rather than a desire to act on it?',
 ritual:'Does repetition, a shared tradition, or a clear beginning and ending contribute to the appeal?',
 novelty:'Is the interesting part surprise, experimentation, imagination, or simply understanding something new?',
 anticipation:'Is looking forward to an experience more appealing than the experience itself?',
 narrative:'Would a story or fictional role be enough, or do you want something you could discuss in real life?',
 associations:'Is there a personal memory, context, or meaning you want to explore without assuming it caused your interest?',
 taboo:'Does the fantasy appeal because it is fictional or unconventional? What real-world boundaries must remain firm?'
};
const el=(tag,text,cls)=>{
 const node=document.createElement(tag);
 if(text!==undefined)node.textContent=String(text);
 if(cls)node.className=cls;
 return node;
};
const add=(parent,tag,text,cls)=>{const child=el(tag,text,cls);parent.append(child);return child};
const section=(root,title,subtitle='',cls='')=>{
 const block=el('section',undefined,cls||'report-section');
 add(block,'h2',title);
 if(subtitle)add(block,'p',subtitle,'report-muted');
 root.append(block);return block;
};
const subsection=(root,title)=>add(root,'h3',title);
const list=(root,items)=>{
 const ul=el('ul');
 items.filter(Boolean).forEach(v=>add(ul,'li',v));
 root.append(ul);return ul;
};
const pretty=(num)=>Number.isFinite(num)?num.toFixed(1):'0.0';
const evidenceFor=(questions,tags,limit=4)=>{
 const matches=[];
 (questions||[]).forEach(q=>{
  if(!q.selected?.length)return;
  const relevant=q.selected.filter(o=>o.axes.some(tag=>tags.includes(tag)));
  if(!relevant.length)return;
  matches.push({
   question:q.question,number:q.number,
   answers:relevant.map(o=>o.text),
   note:q.note||'',
   axes:[...new Set(relevant.flatMap(o=>o.axes.filter(tag=>tags.includes(tag))))]});
 });
 return matches.slice(0,limit);
};
function evidenceList(root,items,label){
 subsection(root,label);
 if(!items.length){
  add(root,'p','No selected answer directly matches these particular themes. This interest should be treated as tentative unless you identify it yourself.','report-muted');
  return;
 }
 const ol=el('ol','', 'report-evidence');
 for(const e of items){
  const li=el('li');
  add(li,'strong','Q'+e.number+': '+e.question);
  add(li,'p','Your selection: '+e.answers.join(' / '));
  if(e.note)add(li,'p','Your private reflection: '+e.note,'report-note');
  ol.append(li);
 }
 root.append(ol);
}
function interestReason(item,data,fromPsych){
 if(item.directSelection===2)
  return 'You explicitly marked this interest as Interested. That self-report outweighs any inferred themes. Psychology answers can help you reflect on its meaning; they do not prove why it appeals to you.';
 if(item.directSelection===1)
  return 'You explicitly marked this interest as Curious, which could mean wanting to learn rather than wanting to experience it. Related answers below may suggest questions to explore, but curiosity is not consent or commitment.';
 if(item.specificSelected)
  return 'This interest was specifically named in an answer you selected in the Sexual Preferences Quiz. That is stronger evidence of curiosity about the particular topic than broad psychological matching, but the choice still does not tell us whether you want to act on it.';
 if(fromPsych)
  return 'This interest was suggested from the same psychological themes behind your answers. It was not directly chosen as a desired sexual experience. The non-explicit quiz cannot establish that you want this interest.';
 return 'This interest appears through the shared theme-matching system, not an explicit statement that you want it. Treat it as an idea to evaluate, not an inferred personal fact.';
}
function connectionParagraph(item,data,hasDirect,hasPsych){
 const active=item.themeTags.filter(tag=>(data.axes.combined[tag]||0)>0);
 const both=active.filter(tag=>(data.axes.direct[tag]||0)>0&&(data.axes.psych[tag]||0)>0);
 const directOnly=active.filter(tag=>(data.axes.direct[tag]||0)>0&&!(data.axes.psych[tag]>0));
 const psychOnly=active.filter(tag=>(data.axes.psych[tag]||0)>0&&!(data.axes.direct[tag]>0));
 const names=tags=>tags.map(tag=>data.lenses[tag]?.label||tag).join(', ');
 if(!active.length)return 'No specific overlap with the answer themes was detected. This is primarily a saved, marked, or exploratory Atlas interest.';
 return (both.length?'Both quizzes show overlap with '+names(both)+'. ':'')+
   (directOnly.length?'Direct-quiz answers also relate to '+names(directOnly)+'. ':'')+
   (psychOnly.length?'Everyday-psychology answers also relate to '+names(psychOnly)+'. ':'')+
   (!hasDirect?'No direct-quiz evidence is available yet. ':'')+
   (!hasPsych?'No psychology-quiz evidence is available yet. ':'')+
   'These are descriptive overlaps in selected themes, not causes or predictions.';
}
const specificReportIdeas={"Leadership exchange":["Compare how leading a fictional scene differs from planning an ordinary date","Discuss which choices remain equally yours regardless of roles"],"Submission":["Write down decisions you might enjoy delegating and those you would never delegate","Explore whether trust or relief from planning is the main attraction"],"Switching":["Write two short character scenes with the agreed roles reversed","Try alternating who chooses the plan for a low-stakes evening"],"Praise-focused dynamics":["Collect examples of praise that feels meaningful rather than performative","Explore a private exchange of welcome compliments"],"Consensual humiliation fantasy":["Separate fictional teasing you might enjoy from words that would actually hurt","Explore symbolic embarrassment in a fictional story instead of real humiliation"],"Foot interest":["Compare whether visual style, pampering, sensation or affectionate attention is central","Make a fashion board or discuss a consensual foot-care activity"],"Footwear interest":["Collect footwear images by shape, texture, style or symbolic meaning","Design an outfit around an appealing shoe style"],"Satin and silk":["Compare fabric swatches for texture and visual appeal","Design a clothing or home-style mood board using satin or silk"],"Leather aesthetics":["Build a leather-fashion inspiration board","Discuss whether the appeal is texture, appearance or cultural associations"],"Latex aesthetics":["Explore glossy costume photography or fashion illustration","Research comfort and practical clothing care before considering a costume"],"ASMR and soft sound":["Make a playlist of pleasing spoken-word or ambient sounds","Compare whether quiet voices or delicate textures create the interest"],"Massage focus":["Compare preferences for light hand or shoulder massage","Design a relaxing environment using lighting and sound"],"Costume roleplay":["Create a fictional persona and a short scene","Explore theatrical styling and which character traits you find compelling"],"Gender expression exploration":["Experiment privately with colors and clothing in a style board","Consider what forms of self-expression feel comfortable without assigning labels"],"Consensual private exhibition":["Discuss private admiration versus involving an unsuspecting audience","Consider an agreed private outfit reveal or artistic self-portrait"],"Mirror aesthetics":["Explore portrait photography or styling ideas","Describe what kind of visual perspective feels meaningful"],"Private performance":["Choose a dance, dramatic monologue or outfit reveal for a willing audience","Discuss whether the appeal is being admired or the performance itself"],"Planned surprise":["Make separate lists of welcome and unwanted surprises","Plan a small reveal involving music, notes or a themed date"],"Slow build-up":["Design an anticipation-focused date with no expectation of anything afterward","Write a series of playful notes or countdown messages"],"Secret letters":["Exchange fictional letters or private notes with clear privacy expectations","Explore how anticipation changes what the words mean"],"Flirtation games":["Try a lighthearted question game with easy skips","Compare kinds of compliments or teasing each person enjoys"],"Dare cards":["Create cards containing only creative or conversational activities","Agree every card may be passed without penalty"],"Partner quizzes":["Compare interpretations of the same questions without assuming identical answers","Choose one shared theme to talk through together"],"Consensual nonmonogamy curiosity":["Distinguish a fantasy from any real proposal to change relationship agreements","Discuss boundaries and feelings without involving anyone else"],"Compersion":["Recall situations where you enjoyed someone else's independent happiness","Discuss how generosity and personal boundaries coexist"],"Jealousy fantasy":["Explore the idea as fiction rather than engineering jealousy","Describe what parts feel intriguing and which would undermine trust"],"Caregiving between adults":["Discuss what reassurance feels most welcome","Design a small, optional nurturing gesture without assigned roles"],"Bondage fantasy":["Explore fictional imagery or character symbolism rather than actual restraint","Discuss whether ritual, control or trust is the appealing theme"],"Restraint symbolism":["Consider decorative ribbons or symbolic art, not immobilization","Explore whether visual style or chosen vulnerability is the appeal"],"Impact-play curiosity":["Keep the exploration educational and focus on boundaries","Separate imagined intensity from the risks of physical activities"],"Pain fantasy":["Write a fictional story to investigate the emotional meaning","Don't assume an idea needs to be acted on; discuss comfort boundaries"],"Breath-control fantasy":["Use a dramatic fictional scene or non-physical symbolism instead of restricting breath","Avoid breath restriction and neck pressure due to serious injury risk"],"Needle-play curiosity":["Study relevant risks rather than attempting a technique","Use symbolic art or fiction to explore the imagery"],"Financial domination fantasy":["Explore the power dynamic in fiction without money transfers","Keep budgets and personal financial independence protected"],"Fragrance and perfume":["Compare ordinary scents and how they connect to memory","Explore whether the interest is aesthetic or comforting"],"Silk ribbons":["Compare ribbons as decorative costume accessories","Explore the symbolic meaning without using them for physical restraint"],"Audio-story fantasy":["Write or record a consensual fictional scene","Consider whether the voice or the narrative is most engaging"],"Written fantasy":["Write a short scene with a clear fantasy-versus-reality boundary","Notice repeated emotional motifs without treating them as causes"],"Virtual-world roleplay":["Design two characters and a shared fictional world","Try collaborative storytelling with a clear stop option"],"Private fantasy journals":["Keep separate pages for fantasy-only thoughts, questions and boundaries","Review how context changes what resonates"]};
const categoryReportIdeas={"Power & Trust":"Explore a reversible, low-stakes choice-sharing activity and discuss what autonomy means to you.","Sensory & Physical":"Compare appealing textures, colors and sounds without assuming any real-world activity follows.","Story & Identity":"Create a character and a short fictional scenario, keeping reality separate from imagination.","Being Seen & Witnessed":"Explore an agreed private creative performance or personal portrait without involving others.","Anticipation & Ritual":"Plan a simple optional tradition, surprise, countdown or affectionate note.","Novelty & Play":"Try a low-pressure question-card or improvisation game with the option to skip.","Relationship Dynamics":"Discuss how the emotional theme fits existing agreements and independent boundaries.","Restraint & Intensity (education)":"Prefer education, symbolic art or fiction instead of dangerous experimentation.","Symbols & Objects":"Make a collection or mood board of meaningful accessories and symbols.","Digital & Imaginative":"Develop a private digital scene, audio story or character sketch."};
function interestIdeas(item){
 const fallback=categoryReportIdeas[item.category];
 const input=[...(specificReportIdeas[item.name]||[]),...item.activities,fallback].filter(x=>typeof x==='string'&&x.length>12);
 return [...new Set(input)].slice(0,item.warn?4:5);
}
function neighboringInterests(item,data){
 return data.interests.filter(other=>other.id!==item.id&&!other.warn&&
  other.themeTags.some(t=>item.themeTags.includes(t)))
  .map(other=>({...other,shared:other.themeTags.filter(t=>item.themeTags.includes(t))}))
  .sort((a,b)=>b.shared.length-a.shared.length||b.directSelection-a.directSelection||b.illustrativeFit-a.illustrativeFit)
  .slice(0,3);
}
function discussion(item,data){
 const tags=item.themeTags;
 const qs=tags.filter(x=>lensQuestions[x]).slice(0,3).map(x=>lensQuestions[x]);
 const special=item.warn?
  'For this higher-risk topic, keep the discussion educational or fictional. Do not experiment with harmful techniques; obtain qualified safety information where relevant.':
  'If both people want to explore anything in real life, agree on a low-pressure option, what is off-limits, how to pause or stop, and how to check in afterward.';
 return{
  opener:'“I learned about '+item.name.toLowerCase()+' and I’m reflecting on what it could mean for me. I don’t expect you to agree or participate. Would you be comfortable talking about it?”',
  prompts:[
   'What part of '+item.name.toLowerCase()+' feels meaningful or interesting to me—and what part does not?',
   ...qs,
   'Would this be enjoyable only as imagination or discussion, or is there a specific consensual aspect you want to consider?',
   'What is an unambiguous no, what is a maybe for discussion only, and what information would we need before deciding anything?'
  ].slice(0,6),limit:special
 };
}
function renderInterest(parent,item,index,data){
 const article=el('article',undefined,'report-interest');
 article.dataset.reportInterest=item.id;
 add(article,'p','INTEREST PROFILE '+(index+1)+' · '+item.category,'report-kicker');
 add(article,'h3',item.name);
 const status=add(article,'p',item.confidenceType+' · '+item.illustrativeFit+'% illustrative exploration fit','report-status');
 if(item.directSelection===0)status.append(document.createTextNode(' · Not a declared preference'));
 add(article,'p',item.description,'report-lead');
 add(article,'h4','1. What the results actually indicate');
 add(article,'p',interestReason(item,data,Boolean(data.psychSuggestions.find(q=>q.id===item.id))));
 add(article,'p','Why it appears in this report: '+item.source+'. '+connectionParagraph(item,data,data.direct.answered>0,data.psych.answered>0));
 add(article,'h4','2. The psychology tied to this specific interest');
 if(item.psych)add(article,'p',item.psych);
 const related=item.themeTags.filter(tag=>data.lenses[tag]).sort((a,b)=>(data.axes.combined[b]||0)-(data.axes.combined[a]||0)).slice(0,4);
 const explanations=el('ul','', 'report-lenses');
 for(const t of related){
  const lens=data.lenses[t];const li=el('li');
  add(li,'strong',lens.label+': ');
  li.append(document.createTextNode(lens.detail||'A lens for reflection; not a diagnosis.'));
  const v1=(data.axes.direct[t]||0)>0,v2=(data.axes.psych[t]||0)>0;
  add(li,'small',' Evidence: '+(v1&&v2?'both quizzes':v1?'sexual-preferences responses':v2?'psychology responses':'the broader interest description'),'report-evidence-note');
  explanations.append(li);
 }
 article.append(explanations);
 add(article,'h4','3. The actual selections supporting this connection');
 evidenceList(article,evidenceFor(data.direct.questions,item.themeTags,3),'Sexual-preferences quiz');
 evidenceList(article,evidenceFor(data.psych.questions,item.themeTags,3),'Non-explicit psychology quiz');
 const rec=data.psychSuggestions.find(x=>x.id===item.id);
 if(rec?.reasons?.length){
  subsection(article,'Additional specific psychology-to-interest suggestions');
  list(article,rec.reasons.slice(0,3).map(r=>
   'Everyday reflection: '+r.question+' — '+r.answer));
 }
 add(article,'h4','4. Things you might consider or like');
 add(article,'p','These are optional, named possibilities inspired by the interest and its theme overlap—not proof of attraction, instructions or something anyone must do.','report-muted');
 const possible=el('ul',undefined,'report-idea-list');
 interestIdeas(item).forEach(v=>add(possible,'li',v));
 article.append(possible);
 const neighbors=neighboringInterests(item,data);
 if(neighbors.length){
  subsection(article,'Related interests to explore, not assumptions');
  const ul=el('ul',undefined,'report-related');
  neighbors.forEach(other=>add(ul,'li',other.name+' — shares '+
   other.shared.slice(0,2).map(t=>data.lenses[t]?.label||t).join(' and ')+
   (other.directSelection?' (you marked it '+(other.directSelection===2?'Interested':'Curious')+')':' (unconfirmed suggestion)')));
  article.append(ul);
 }
 const guide=discussion(item,data);
 add(article,'h4','5. Discussing this specific interest with a partner');
 add(article,'p',guide.opener,'report-script');
 list(article,guide.prompts);
 add(article,'p',guide.limit,'report-boundaries');
 add(article,'p','Partner responses are independent. A conversation, an expression of curiosity, or a “maybe” never constitutes permission for an activity.','report-muted');
 add(article,'h4','6. What may influence this interest, and what a quiz cannot know');
 add(article,'p','Some possibilities include sensation, attention, trust, novelty, identity, learned associations, imagination or personal meaning. Your selected answers help identify themes to reflect on. There is no reliable way for this quiz to identify a single root cause, childhood event, trauma history or diagnosis.');
 add(article,'h4','7. Healthy exploration and signs to reconsider');
 add(article,'p','An interest can be part of healthy adult sexuality when people freely consent, boundaries are respected, safety is considered and it does not cause significant distress or interfere with life. Choosing fantasy only is equally valid.');
 add(article,'p',item.warn?
  'This interest may carry additional physical or emotional risk. Do not assume consent or improvise potentially dangerous techniques; seek appropriate qualified safety information before even considering a real-world activity.':
  'Reconsider or seek professional support if it involves pressure, non-consent, physical harm, escalating unwanted risk, or persistent distress or impairment. Having an unusual consensual interest by itself is not a disorder.','report-boundaries');
 parent.append(article);
}
function appendix(root,title,part){
 const area=section(root,title,'This is a record of your actual saved selections and optional private notes—not interpretations. Skipped questions have no selected answer.','report-appendix');
 const answered=part.questions.filter(q=>q.selected.length||q.note.trim());
 if(!answered.length){add(area,'p','No answers saved in this quiz.');return}
 for(const q of answered){
  const block=el('div',undefined,'report-answer');
  add(block,'strong',q.number+'. '+q.question);
  if(q.selected.length)add(block,'p',q.selected.map(o=>o.text).join(' · '));
  if(q.note)add(block,'p','Private note: '+q.note,'report-note');
  area.append(block);
 }
}
function build(){
 const data=window.AfterDarkCanonicalReport?.buildData?.();
 if(!data)throw Error('Canonical quiz report is not available');
 const doc=el('div',undefined,'afterdark-detailed-report');
 doc.setAttribute('data-report-version','2');
 const cover=el('header',undefined,'report-cover');
 add(cover,'p','AFTER DARK · PERSONAL DISCOVERY','report-kicker');
 add(cover,'h1','My Interests & Psychology Report');
 add(cover,'p','A specific, joined interpretation of your Sexual Preferences Quiz and Non-explicit Psychology Quiz — with the named interests, actual selected responses, psychological connections, and respectful discussion ideas.','report-lead');
 add(cover,'p','Prepared '+new Date(data.created).toLocaleDateString()+' · Private / for personal reflection','report-muted');
 const coverStats=el('div',undefined,'report-cover-stats');
 for(const [value,label] of [[data.direct.answered+'/32','Direct answers'],[data.psych.answered+'/32','Psychology answers'],[data.interests.length,'Named interest profiles']]){
  const box=el('div',undefined,'report-cover-stat');
  add(box,'strong',value);
  add(box,'span',label);
  coverStats.append(box);
 }
 cover.append(coverStats);
 const roadmap=el('div',undefined,'report-roadmap');
 add(roadmap,'strong','INSIDE YOUR REPORT');
 add(roadmap,'p','Your answers at a glance · Psychological themes · How both quizzes connect · Interest-by-interest profiles · Things you might consider or like · Conversation guides · Original selections');
 cover.append(roadmap);
 doc.append(cover);
 const overview=section(doc,'01 · Your results at a glance');
 const enough=data.direct.answered>0&&data.psych.answered>0;
 add(overview,'p','Sexual-preferences questions answered: '+data.direct.answered+'/32'+(data.direct.complete?' (quiz finished)':' (still in progress)')+'.');
 add(overview,'p','Non-explicit psychology questions answered: '+data.psych.answered+'/32'+(data.psych.complete?' (quiz finished)':' (still in progress)')+'.');
 add(overview,'p',enough?
  'Both sets of responses contribute to ONE shared interest ranking. Similar themes across the two quizzes strengthen a descriptive connection; any difference is a conversation or reflection question—not a contradictory diagnosis.':
  'This report contains only the quiz responses completed so far. Finish or import the other quiz to add its evidence. A psychology-only response cannot establish a specific sexual preference.','report-emphasis');
 add(overview,'p','How to read the percentages: figures are illustrative scores based on this website’s theme mapping, not probabilities of attraction, measures of sexual desire, diagnostic scores, or a validated psychological assessment.');
 if(data.direct.personalIdeas?.length){
  const own=section(doc,'Your own ideas · Things you want to try or discuss',
   'These items are your words, not inferred desires. They have not been scored, diagnosed, or matched to psychological causes.');
  for(const entry of data.direct.personalIdeas){
   const block=el('article',undefined,'report-personal-idea');
   add(block,'h3',entry.text);
   add(block,'p','Your stated intention: '+entry.intentLabel,'report-muted');
   add(block,'p','Reflect: Is the appeal a sensation, a feeling, a role, an image, or something you are simply curious to understand? Would you prefer to give, receive, watch, discuss, or leave it as fantasy?');
   add(block,'p','Conversation starter: “This is an idea I wrote in my own words. Could we talk about what interests me about it and hear your thoughts, without assuming either of us wants to act on it?”','report-script');
   own.append(block);
  }
  add(own,'p','Some interests have physical or emotional risks. Discuss informed consent, personal comfort, sexual health and any relevant safety concerns independently; this quiz does not provide personalized medical or psychological advice.','report-boundaries');
 }
 const themes=section(doc,'02 · Your psychological themes and how they connect','The strongest theme signals reflect your selections. They describe possible emotional qualities, not hidden causes.');
 const sorted=Object.entries(data.axes.combined).filter(([key,value])=>value>0&&data.lenses[key]).sort((a,b)=>b[1]-a[1]).slice(0,8);
 if(!sorted.length)add(themes,'p','More responses are needed before meaningful themes can be summarized.');
 else sorted.forEach(([key,score])=>{
  const d=data.lenses[key],block=el('article',undefined,'report-theme');
  add(block,'h3',d.label);
  add(block,'p',d.detail);
  const direct=data.axes.direct[key]||0,psych=data.axes.psych[key]||0;
  add(block,'p',(direct&&psych?'Both quizzes contain related selections.':direct?'Related selections currently come from the sexual-preferences quiz.':'Related selections currently come from the psychology quiz.')+
    ' This is about what was selected, not why it developed.','report-muted');
  const examples=[...evidenceFor(data.direct.questions,[key],1).map(x=>'Direct quiz: '+x.answers.join(' / ')),
    ...evidenceFor(data.psych.questions,[key],1).map(x=>'Psychology quiz: '+x.answers.join(' / '))];
  if(examples.length)list(block,examples);
  themes.append(block);
 });
 const map=section(doc,'03 · How the two quizzes fit together');
 add(map,'p','For every topic, the direct and psychology questionnaires use matching underlying theme categories. Your explicit Interested / Curious / Not for me selections are respected. The non-explicit quiz suggests emotional or sensory connections but never overwrites what you say you do or do not want.');
 let comparable=0,overlap=0;
 data.direct.questions.forEach((a,i)=>{
  const b=data.psych.questions[i];
  if(!a.selected.length||!b?.selected.length)return;
  comparable++;
  if(a.selected.some(x=>b.selected.some(y=>x.axes.some(tag=>y.axes.includes(tag)))))overlap++;
 });
 add(map,'p',comparable?
  overlap+' of '+comparable+' corresponding answered question pairs share at least one psychological theme. This is overlap in the quizzes’ theme coding, NOT a measure of psychological consistency or sexual compatibility.':
  'There are not yet corresponding answer pairs to compare. You can still read the available topic evidence below.');
 const selected=data.direct.specificSelections||[];
 if(selected.length){
  const relationships=section(doc,'Your selected activities and how they intersect with everyday psychology',
    'These are the actual options you selected, rather than interests inferred from broad themes. Matching an emotional theme does not prove the cause of a desire.');
  const supporting=selected.filter(x=>x.axes.some(tag=>(data.axes.psych[tag]||0)>0));
  add(relationships,'p',supporting.length+' of '+selected.length+' selected activities share at least one coded theme with the Psychology Quiz'+
   (data.psych.answered?' (the other selections have no matching theme yet).':' (finish the second quiz to make this comparison).'),'report-emphasis');
  const limited=selected.slice(0,20);
  for(const a of limited){
   const common=a.axes.filter(tag=>(data.axes.psych[tag]||0)>0&&data.lenses[tag]);
   const box=el('article',undefined,'report-answer');
   add(box,'strong','Q'+a.questionNumber+' · '+a.text);
   add(box,'p','Themes: '+a.axes.map(tag=>data.lenses[tag]?.label||tag).join(', ')+'. '+(
      common.length?'Both quizzes show '+common.map(tag=>data.lenses[tag]?.label||tag).join(', ')+'.':
      'This selection currently stands on its own; a related everyday-psychology theme has not been confirmed.'
   ));
   if(a.role!=='unspecified')add(box,'p','Perspective: '+a.role,'report-muted');
   relationships.append(box);
  }
  if(selected.length>limited.length)add(relationships,'p','The remaining '+(selected.length-limited.length)+' selections are preserved in Appendix A.','report-muted');
 }
 const named=data.interests;
 const interests=section(doc,'04 · Specific interests with the psychology behind each','Each profile below ties an identified interest to the actual quiz selections that match its themes, explains competing interpretations, and offers specific communication prompts. These are possibilities, not diagnoses.');
 if(!named.length)add(interests,'p','At least eight answered questions or direct Atlas selections are needed for named suggestions. You can save this partial report now and update it later.');
 else named.forEach((item,i)=>renderInterest(interests,item,i,data));
 const suggestions=section(doc,'05 · Additional psychology-to-interest suggestions','These suggestions reflect the non-explicit quiz’s thematic connections. They are not proof of any sexual interest and do not override any “Not for me” selections.');
 const seen=new Set(named.map(x=>x.id));
 const extras=data.psychSuggestions.filter(x=>!seen.has(x.id)).slice(0,16);
 if(!extras.length)add(suggestions,'p','No additional distinct psychology-only interests were suggested beyond the interest profiles already explained above.');
 extras.forEach((x,i)=>{
  const article=el('article',undefined,'report-extra');
  add(article,'h3',x.name+' · '+x.category);
  add(article,'p',x.description);
  add(article,'p','Possible psychology connection: '+x.themes.map(t=>data.lenses[t]?.label||t).join(' · '));
  list(article,x.reasons.map(r=>'Your reflection on “'+r.question+'”: '+r.answer).slice(0,3));
  add(article,'p','Before assuming this fits, ask yourself whether the specific interest resonates or only the broader emotional theme.','report-muted');
  suggestions.append(article);
 });
 const communicate=section(doc,'06 · Making sense of this with a partner','A practical sequence for a low-pressure discussion. It applies to every interest in this report.');
 const steps=[
  ['Choose one interest, not a list of demands','Pick a specific name from the profiles above. Identify what you like about the idea, what you are unsure about, and whether it is fantasy-only.'],
  ['Ask for a conversation, not immediate participation','Try: “I’ve learned something about my interests. Would you be open to hearing what it means to me? You can say no, and I’m not asking for a commitment.”'],
  ['Explain the personal meaning, without diagnosing yourself','Use the report’s answer evidence as reflection prompts: “I selected these themes because...” Do not say the quiz proved why you are drawn to anything.'],
  ['Invite an independent response','Ask: “What does that idea bring up for you? Is anything appealing, uncomfortable, or unclear?” Listen without arguing about their limits.'],
  ['Separate fantasy, discussion, and real-life possibilities','An idea can remain fictional, private, or purely educational. If any action is considered, make a separate, informed, reversible agreement. A maybe is not a yes.'],
  ['Clarify boundaries and check in later','Name excluded activities, privacy expectations, comfort limits, and how either person can pause or change their mind. Return to the conversation only if both wish to.']
 ];
 steps.forEach(([a,b],i)=>{const part=el('article',undefined,'report-step');add(part,'h3',(i+1)+'. '+a);add(part,'p',b);communicate.append(part)});
 const limits=section(doc,'07 · What this report can and cannot tell you');
 list(limits,[
 'Can: summarize self-selected answers, group them into the site’s thematic categories, name related interests, and suggest ways to reflect or communicate.',
 'Cannot: reveal hidden desires, determine a person’s sexual orientation, identify the cause of a preference, measure likelihood of enjoyment, or replace a clinician or interpersonal consent.',
 'Directly marked interests are statements of your own curiosity. Psychology-only interests are hypotheses that you may reject.',
 'A fantasy, a suggested interest, a high illustrative score, or another person’s interest is not an instruction to act on it.',
 'Only adults who freely agree can decide whether to discuss or explore an activity. No interest requires participation.'
 ]);
 appendix(doc,'Appendix A · Sexual-preferences answer record',data.direct);
 appendix(doc,'Appendix B · Non-explicit psychology answer record',data.psych);
 add(doc,'footer','Private document generated locally in your browser. No answers were sent to a server to create this report. Keep saved copies confidential.','report-footer');
 return doc;
}
window.AfterDarkDetailedReport=Object.freeze({build});
})();