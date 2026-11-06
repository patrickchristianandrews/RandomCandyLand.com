/* Fictional, deterministic QA respondents for the Unwrapped report release.
 * Never load this on the public quiz page or into a visitor's stored profile.
 * Called ONLY inside the temporary headless Chrome build environment.
 * Each profile answers all 69 + 32 ORIGINAL questions through importState.
 */
(()=>{
 'use strict';
 const profiles=Object.freeze({
  rowan:{
   label:'Rowan — trust, communication and sensory detail',
   description:'Fictional adult who values specific appreciation, negotiated boundaries, deliberate anticipation and gentle sensory experiences.',
   themes:['affirmation','trust','attachment','anticipation','sensation','ritual'],
   directYes:['Praise-focused dynamics','Massage focus','Slow build-up'],
   directMaybe:['Satin and silk','Switching','Secret letters'],
   directNo:['Consensual nonmonogamy curiosity','Consensual threesome curiosity'],
   fantasyIds:[9,12,21,36,57,58,59,60,61,63,64,66,67],
   noIds:[58,59,60,61,63,64,66],
   reflect:'I notice that sincere attention and checking in matter more to me than novelty for its own sake.'
  },
  ellis:{
   label:'Ellis — imagination, creative roles and autonomy',
   description:'Fictional adult drawn to imaginative storytelling, playful novelty, aesthetics, role flexibility and clear personal autonomy.',
   themes:['novelty','narrative','aesthetics','control','anticipation','trust'],
   directYes:['Costume roleplay','Written fantasy','Switching'],
   directMaybe:['Virtual-world roleplay','Satin and silk','Audio-story fantasy'],
   directNo:['Consensual humiliation fantasy','Pain fantasy'],
   fantasyIds:[8,9,11,12,14,21,22,36,48,49,57,58,59,60,61,63,64,66],
   noIds:[59,60,61,63,64,66],
   reflect:'I enjoy making up stories and experimenting with creative roles, while keeping a clear line between imagination and action.'
  }
 });
 const negative=/\b(?:none|neither|not interested|no interest|prefer not|rather skip|none of these|not for me|i don't|do not want|unsure what|not comfortable)\b/i;
 const dangerous=/\b(?:breath restriction|choking|strangling|needles|blood|unprotected)\b/i;
 const tokens=axis=>String(axis||'').split(/\s+/).filter(Boolean);
 function picked(q,profile,kind){
  const opts=q.options||[];
  if(!opts.length)throw Error('Missing options for '+kind+' question '+q.id);
  if(kind==='direct' && profile.noIds.includes(Number(q.id))){
   // A clear "no" always beats theme similarity, even when wording uses
   // "prefer exclusivity" or "would not involve others" instead of "not interested".
   const declined=opts.findIndex(o=>o.role==='none');
   if(declined>=0)return declined;
   throw Error('Fictional boundary question '+q.id+' has no explicit opt-out answer');
  }
  const ranked=opts.map((o,index)=>{
   const text=String(o.text||''),tags=tokens(o.axes);
   const match=tags.reduce((score,t)=>score+(profile.themes.includes(t)?(profile.themes.length-profile.themes.indexOf(t))*3:0),0);
   const guard=(negative.test(text)?-32:0)+(dangerous.test(text)?-45:0)+(o.mediaOnly? -8:0);
   const dialogue=/consent|agree|discuss|communicat|comfort|private|fiction|listen/i.test(text)?2:0;
   const tie=((Number(q.id)*7+index*3+(kind==='psych'?2:0))%7)/30;
   return{index,score:match+guard+dialogue+tie};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  return ranked[0].index;
 }
 function stateFor(key){
  const p=profiles[key],direct=window.AfterDarkAdultQuiz||[],psych=window.AfterDarkPsychologyQuiz||[];
  if(!p)throw Error('Unknown fictional respondent '+key);
  if(direct.length!==69||psych.length!==32)throw Error('Question banks changed: '+direct.length+' direct / '+psych.length+' psychology');
  const directAnswers={},psychAnswers={},intents={},notes={},psychNotes={};
  direct.forEach((q,i)=>{
   const option=picked(q,p,'direct');
   directAnswers[i]=[option];
   // No/declined is an explicit boundary; do not label it fantasy or undecided.
   if(!p.noIds.includes(Number(q.id)))intents[i]=p.fantasyIds.includes(Number(q.id))?'fantasy':'explore';
   if(i===0)notes[i]=p.reflect;
  });
  psych.forEach((q,i)=>{
   psychAnswers[i]=[picked(q,p,'psych')];
   if(i===0)psychNotes[i]=p.reflect;
  });
  return{
   profile:p,
   direct:{questionVersion:5,qIndex:direct.length,multiAnswers:directAnswers,freeResponses:notes,questionIntents:intents,customThings:'',customIntent:'unsure'},
   psychology:{position:psych.length,answers:psychAnswers,notes:psychNotes}
  };
 }
 function apply(key){
  const fixture=stateFor(key);
  const direct=window.AfterDarkDirectQuizBridge,psych=window.AfterDarkPsychQuizBridge;
  if(!direct?.importState||!psych?.importState)throw Error('Actual Unwrapped quiz bridges unavailable');
  if(!direct.importState(fixture.direct))throw Error('Fictional direct quiz rejected');
  if(!psych.importState(fixture.psychology))throw Error('Fictional psychology quiz rejected');
  const topics=window.AfterDarkNotebookBridge?.getTopics?.()||[];
  let selected=0;
  for(const [status,names] of [['yes',fixture.profile.directYes],['maybe',fixture.profile.directMaybe],['no',fixture.profile.directNo]]){
   for(const name of names){
    const topic=topics.find(x=>x.name===name);
    if(!topic)continue; // The question bank can evolve; report this via selected count.
    window.AfterDarkNotebookBridge.mark(topic.id,status);
    selected++;
   }
  }
  if(selected<3)throw Error('Too few named options in fictional respondent setup');
  const data=window.AfterDarkCanonicalReport?.buildData?.();
  if(!data)throw Error('Actual canonical builder unavailable');
  if(data.direct.answered!==69||data.psych.answered!==32||!data.direct.complete||!data.psych.complete||
      data.direct.questions.length!==69||data.psych.questions.length!==32)
   throw Error('A fictional respondent did not finish both tests');
  const combined=Object.keys(data.axes?.combined||{}).filter(k=>data.axes.combined[k]>0);
  const cross=combined.filter(k=>data.axes.direct[k]>0&&data.axes.psych[k]>0);
  const marked=data.interests.filter(x=>x.directSelection>0||x.specificSelected);
  if(cross.length<2||marked.length<2)throw Error('Actual result missing jointly supported psychology themes or marked interests');
  return{key,profile:fixture.profile,completed:{direct:data.direct.answered,psych:data.psych.answered},
    matchingThemes:cross.length,selectedInterests:marked.length,allTopics:data.interests.length,
    data};
 }
 window.UnwrappedFictionalRespondents=Object.freeze({profiles,stateFor,apply});
})();
