/* Deterministic independent checks of both fictional 101-answer journeys.
 * Browser CI separately imports these states through the actual app bridges,
 * renders the combined report and creates downloadable PDF evidence.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const dir='public/after-dark/';
const files=['adult-quiz.js','adult-quiz-expanded.js','adult-quiz-social-media.js','adult-quiz-body-interests.js','psychology-quiz.js','fictional-respondents.js'];
const sandbox={window:{}};
for(const f of files)vm.runInNewContext(fs.readFileSync(dir+f,'utf8'),sandbox,{filename:f});
const w=sandbox.window,direct=w.AfterDarkAdultQuiz,psych=w.AfterDarkPsychologyQuiz,lib=w.UnwrappedFictionalRespondents;
assert.equal(direct.length,69);
assert.equal(psych.length,32);
assert.ok(lib?.profiles?.rowan&&lib?.profiles?.ellis);
const results={};
for(const key of ['rowan','ellis']){
 const fixture=lib.stateFor(key),a=fixture.direct.multiAnswers,b=fixture.psychology.answers;
 assert.equal(Object.keys(a).length,69,key+' did not answer all intimate questions');
 assert.equal(Object.keys(b).length,32,key+' did not answer every psychology question');
 assert.equal(fixture.direct.qIndex,69);
 assert.equal(fixture.psychology.position,32);
 assert.equal(fixture.direct.questionVersion,5,'Must use current, not an obsolete shorter quiz');
 for(let i=0;i<69;i++){
  assert.equal(a[i].length,1,'Every direct question has exactly one fictional response');
  assert.ok(a[i][0]>=0&&a[i][0]<direct[i].options.length,'Answer references a real direct choice');
  if(fixture.profile.noIds.includes(Number(direct[i].id))){
   assert.equal(direct[i].options[a[i][0]].role,'none','A fictional stated boundary must select the actual decline option');
   assert.equal(fixture.direct.questionIntents[i],undefined,'A firm No must not be labeled fantasy, exploration or undecided');
  }else{
   assert.ok(['fantasy','explore','unsure'].includes(fixture.direct.questionIntents[i]),'Every affirmative interest receives an explicit intention');
  }
 }
 for(let i=0;i<32;i++){
  assert.equal(b[i].length,1,'Every everyday question has exactly one response');
  assert.ok(b[i][0]>=0&&b[i][0]<psych[i].options.length,'Everyday response references real option');
 }
 assert.ok(Object.values(fixture.direct.questionIntents).filter(x=>x==='fantasy').length>=5,'Fictional profile must contain fantasy-only choices');
 assert.ok(fixture.profile.directNo.length>0,'Fictional profile must include explicit boundaries');
 results[key]={direct:a,psych:b,
  directThemes:direct.flatMap((q,i)=>direct[i].options[a[i][0]].axes.split(' ').filter(Boolean)),
  psychThemes:psych.flatMap((q,i)=>psych[i].options[b[i][0]].axes.split(' ').filter(Boolean))};
}
const differencesDirect=direct.filter((_,i)=>results.rowan.direct[i][0]!==results.ellis.direct[i][0]).length;
const differencesPsych=psych.filter((_,i)=>results.rowan.psych[i][0]!==results.ellis.psych[i][0]).length;
assert.ok(differencesDirect>=15,'Fictional people must show meaningfully different intimate responses');
assert.ok(differencesPsych>=8,'Fictional people must show meaningfully different everyday answers');
const total=(arr,t)=>arr.filter(x=>x===t).length;
assert.ok(total(results.rowan.directThemes,'affirmation')>total(results.ellis.directThemes,'affirmation'),'The person emphasizing appreciation should show that in direct responses');
assert.ok(total(results.ellis.directThemes,'novelty')>total(results.rowan.directThemes,'novelty'),'The person emphasizing novelty should show that in direct responses');
console.log('✓ Two complete, different fictional Unwrapped journeys: 69+32 real question-option selections each; '+differencesDirect+' direct and '+differencesPsych+' psychology responses differ.');
