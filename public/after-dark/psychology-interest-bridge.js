/* Specific adult-interest reading suggestions for the optional, non-explicit quiz.
   Each option in the companion quiz maps to a real topic in the adult Atlas.
   This is editorial thematic matching, NOT scientifically validated prediction. */
(()=>{
  'use strict';
  const names=[["Slow build-up","Mood-switching games","Planned surprise","Trust exercises"],["Trust exercises","Leadership exchange","Switching"],["Praise-focused dynamics","Ownership language fantasy","Being adored","Reassurance focus"],["Special-occasion scenes","Leadership exchange","Power-sharing","Written fantasy"],["Playful competition","Slow build-up","Countdown fantasy","Reassurance focus"],["Protocol and etiquette","Planned surprise","Affection check-ins"],["Praise-focused dynamics","Leadership exchange","Secret admirer narratives","Written fantasy"],["Praise-focused dynamics","Ownership language fantasy","Role reversals","Caregiving between adults"],["Consensual private exhibition","Reassurance focus","Mood-switching games"],["Mood-switching games","Character voice and accents","Hands and touch focus","Caregiving between adults"],["Brat and playful challenge","Permission rituals","Role reversals","Trust exercises"],["Consensual private exhibition","Consensual partner observation","Slow build-up","Reassurance focus"],["Cosplay props","Hands and touch focus","Warmth and temperature contrast","ASMR and soft sound","Caregiving between adults"],["Private fantasy journals","Jewelry symbolism","Trust exercises"],["Affection check-ins","Fantasy character roleplay","Praise-focused dynamics","Private fantasy journals"],["Submission","Leadership exchange","Switching","Power-sharing"],["Being adored","Consensual humiliation fantasy","Mood-switching games","Reassurance focus"],["Distance and longing","Countdown fantasy","Compliment spotlight","Protocol and etiquette","Affection check-ins"],["Protocol and etiquette","Trust exercises","Written fantasy"],["Caregiving between adults","Distance and longing","Praise-focused dynamics","Mood-switching games"],["Leadership exchange","Fantasy character roleplay","Edginess and suspense","Private fantasy journals"],["Submission","Leadership exchange","Protocol and etiquette","Trust exercises"],["Compliment spotlight","Ownership language fantasy","Exclusivity rituals","Reassurance focus"],["Hands and touch focus","Slow build-up","Character voice and accents","Praise-focused dynamics"],["Affection check-ins","Massage focus","Distance and longing"],["Cosplay props","Fantasy character roleplay","Fantasy travel","Voice-message intimacy"],["Secret letters","Affection check-ins","Trust exercises"],["Permission rituals","Affection check-ins","Private fantasy journals"],["Reassurance focus","Edginess and suspense","Written fantasy"],["Partner quizzes","Voice-message intimacy","Permission rituals","Affection check-ins"],["Warmth and temperature contrast","Slow build-up","Praise-focused dynamics","Brat and playful challenge"],["Playful teasing","Promise and reward themes","Written fantasy","Caregiving between adults"]];
  function recommend(progress,topics){
    if(!progress||!progress.answered)return [];
    const byName=new Map(topics.map(t=>[t.name,t]));
    const found=new Map();
    const questions=window.AfterDarkPsychologyQuiz||[];
    for(let i=0;i<questions.length;i++){
      const q=questions[i],chosen=Array.isArray(progress.answers?.[i])?progress.answers[i]:[];
      for(const optionIndex of chosen){
        const name=names[i]?.[optionIndex],topic=byName.get(name);
        if(!topic||topic.warning)continue;
        const entry=found.get(topic.id)||{x:topic,links:0,reasons:[]};
        entry.links++;
        const answer=q.options[optionIndex]?.text;
        if(answer&&entry.reasons.length<3)entry.reasons.push({question:q.q,answer});
        found.set(topic.id,entry);
      }
    }
    return [...found.values()].sort((a,b)=>b.links-a.links||a.x.name.localeCompare(b.x.name));
  }
  window.AfterDarkPsychBridge=Object.freeze({recommend,names});
})();
