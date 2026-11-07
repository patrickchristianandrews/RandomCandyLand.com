/* Quiz-only report regression test.
 * node scripts/test-unwrapped-quiz-only-reports.mjs
 * Verifies privacy defaults, no duplicate report writing, and quiz-only interests.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync('public/after-dark/'+p,'utf8');
const index=read('index.html'),newPartner=read('new-partner-report.js'),share=read('partner-results-share.js'),compare=read('partner-compare.js');
for(const [file,source] of [['new-partner-report.js',newPartner],['partner-results-share.js',share],['partner-compare.js',compare]])
 assert.doesNotThrow(()=>new vm.Script(source,{filename:file}));
assert.match(index,/function quizOnlySignals\(\)/);
assert.match(index,/function quizOnlyInterests\(\)/);
assert.match(index,/personalIdeas:\[\]/);
assert.match(index,/selections:\{\}/);
assert.match(index,/interests:quizOnlyInterests\(\)/);
assert.doesNotMatch(newPartner,/draftField|<textarea|createElement\('textarea'\)|localStorage|AfterDarkNotebookBridge/);
assert.doesNotMatch(share,/Your name or nickname \(optional\)|Message to your partner \(optional\)|opt\.name|opt\.intro/);
assert.doesNotMatch(compare,/Your name or nickname \(optional\)|selection\.name/);
assert.match(compare,/seenQuizDefaults/);
class Node {
 constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.style={};this.classList={add(){},remove(){}};this.hidden=false;this.checked=false;this.value='';this.textContent='';this.events={}}
 append(...children){this.children.push(...children)}
 replaceChildren(...children){this.children=children}
 addEventListener(type,fn){this.events[type]=fn}
 setAttribute(key,value){this[key]=value}
 scrollIntoView(){}
 querySelector(){return null}
 querySelectorAll(){return []}
}
const host=new Node('root');
const doc={readyState:'complete',getElementById:id=>id==='new-partner-report'?host:null,createElement:tag=>new Node(tag),addEventListener(){},querySelectorAll:()=>[]};
let example={
 psych:{questions:[
  {number:1,question:'When do you prefer to discuss something important?',selected:[{text:'After I have time to think',axes:['anticipation','trust']}]},
  {number:2,question:'How do you express appreciation?',selected:[{text:'Small personal gestures',axes:['affirmation']}]}
 ]},
 direct:{questions:[]},interests:[],lenses:{
  anticipation:{label:'Planning ahead'},trust:{label:'Trust'},affirmation:{label:'Appreciation'}
 }
};
const win={AfterDarkCanonicalReport:{buildData:()=>example},AfterDarkNotebookBridge:{getTopics:()=>[],getChoices:()=>({})}};
vm.runInNewContext(newPartner,{window:win,document:doc});
const report=win.AfterDarkNewPartnerReport.build();
const collect=n=>String(n.textContent||'')+(n.children||[]).map(collect).join(' ');
const text=collect(report);
assert.match(text,/After I have time to think/);
assert.match(text,/Small personal gestures/);
assert.doesNotMatch(text,/03 · Intimacy and what I choose to share/);
const fields=[];
function scan(n){if(n.tag==='input'||n.tag==='textarea')fields.push([n.tag,n.type||'']);(n.children||[]).forEach(scan)}
scan(host);
assert.ok(fields.length>0&&fields.every(([tag,type])=>tag==='input'&&type==='checkbox'),'Report editor contains privacy checkboxes but no writing fields');
example=null;
assert.throws(()=>win.AfterDarkNewPartnerReport.build(),/Complete a quiz and select at least one response/);
const isolateStart=index.indexOf('function quizOnlySignals()');
const isolateEnd=index.indexOf('window.AfterDarkCanonicalReport=Object.freeze',isolateStart);
assert.ok(isolateStart>=0&&isolateEnd>isolateStart);
const isolate=index.slice(isolateStart,isolateEnd);
const data={window:{
 AfterDarkPsychQuizBridge:{getProgress:()=>({answered:32,axes:{novelty:10},answers:{0:[0]}})},
 AfterDarkPsychologyQuiz:[{options:[{role:'positive',axes:'novelty'}]}]
},axes:{},answered:0,qdata:[],multiAnswers:{},topics:[
 {id:'safe',name:'Creative novelty',cat:'Mind',warning:false,tags:['novelty']},
 {id:'sensitive',name:'Unstated sensitive interest',cat:'Body Fluids & Bodily Sensations',warning:true,tags:['novelty']}
]};
vm.runInNewContext(isolate+'\nwindow.__quizOnlyResults=quizOnlyInterests();',data);
assert.ok(data.window.__quizOnlyResults.some(x=>x.x.id==='safe'),'Psych quiz can produce suggested themes');
assert.ok(!data.window.__quizOnlyResults.some(x=>x.x.id==='sensitive'),'Psych quiz alone must not infer a sensitive specific interest');
console.log('✓ Quiz-derived reports: no duplicate writing; psychology-only introductions; missing-data guard; intimate disclosures off by default; manual cabinets excluded.');
