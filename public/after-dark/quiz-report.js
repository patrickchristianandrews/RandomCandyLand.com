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
 add(article,'h4','4. Ways to understand and explore this interest');
 list(article,[...item.activities,
  'Privately decide whether the appeal is the real activity, the emotional theme, the imagery, or simply learning more.']);
 const guide=discussion(item,data);
 add(article,'h4','5. A respectful conversation with a partner');
 add(article,'p',guide.opener,'report-script');
 list(article,guide.prompts);
 add(article,'p',guide.limit,'report-boundaries');
 add(article,'p','Partner responses are independent. A conversation, an expression of curiosity, or a “maybe” never constitutes permission for an activity.','report-muted');
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
 doc.append(cover);
 const overview=section(doc,'01 · Your results at a glance');
 const enough=data.direct.answered>0&&data.psych.answered>0;
 add(overview,'p','Sexual-preferences questions answered: '+data.direct.answered+'/32'+(data.direct.complete?' (quiz finished)':' (still in progress)')+'.');
 add(overview,'p','Non-explicit psychology questions answered: '+data.psych.answered+'/32'+(data.psych.complete?' (quiz finished)':' (still in progress)')+'.');
 add(overview,'p',enough?
  'Both sets of responses contribute to ONE shared interest ranking. Similar themes across the two quizzes strengthen a descriptive connection; any difference is a conversation or reflection question—not a contradictory diagnosis.':
  'This report contains only the quiz responses completed so far. Finish or import the other quiz to add its evidence. A psychology-only response cannot establish a specific sexual preference.','report-emphasis');
 add(overview,'p','How to read the percentages: figures are illustrative scores based on this website’s theme mapping, not probabilities of attraction, measures of sexual desire, diagnostic scores, or a validated psychological assessment.');
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