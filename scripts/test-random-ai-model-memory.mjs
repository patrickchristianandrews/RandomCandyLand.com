/* Regression test for model persistence without downloading multi-GB weights.
 * Simulates WebLLM's default cache inspection, a new visit, and eviction.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('public/studio/model-memory.js','utf8');
const data=new Map(),files=new Set(['old-model']),deleted=[];
const storage={
 getItem:k=>data.get(k)??null,
 setItem:(k,v)=>data.set(k,String(v)),
 removeItem:k=>data.delete(k)
};
const library={
 prebuiltAppConfig:{model_list:[{model_id:'old-model'},{model_id:'new-model'}]},
 async hasModelInCache(id){return files.has(id)},
 async deleteModelAllInfoInCache(id){deleted.push(id);files.delete(id)}
};
const models=[{id:'old-model'},{id:'new-model'}];
const tick=()=>new Promise(resolve=>setTimeout(resolve,1));
function freshPage(){
 const listeners={};
 const document={
  querySelector:()=>null,
  addEventListener:(type,handler)=>listeners[type]=handler
 };
 const window={
  dispatchEvent:()=>{},
  alert:message=>{throw Error('Unexpected alert: '+message)},
  confirm:()=>true,
  RandomAILocal:{getName:id=>id}
 };
 const context={window,document,localStorage:storage,navigator:{storage:{persist:async()=>true}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},console};
 vm.runInNewContext(source,context,{filename:'model-memory.js'});
 return {api:window.RandomAIModelMemory,click:dataset=>{
  listeners.click?.({target:{closest:selector=>selector==='[data-remove-model]'?{dataset:{removeModel:dataset}}:null}});
 }};
}
async function settle(api){for(let i=0;i<400;i++){if(!api.getChecking())return;await tick()}throw Error('Cache scan did not finish')}
const page1=freshPage();
page1.api.register(library,models);
await settle(page1.api);
assert.deepEqual([...page1.api.savedIds()],['old-model'],'Previously cached model discovered without localStorage history');
assert.equal(page1.api.isSaved('new-model'),false);
files.add('new-model');page1.api.markLoaded('new-model');
assert.equal(page1.api.preferred(),'new-model','Last successful load remembered');
assert.equal(page1.api.savedIds().length,2);
const page2=freshPage();
assert.equal(page2.api.preferred(),'new-model','Last choice restores on a new visit');
page2.api.register(library,models);await settle(page2.api);
assert.equal(page2.api.isSaved('new-model'),true,'Downloaded model is verified after reopening');
assert.equal(page2.api.isSaved('old-model'),true);
files.delete('new-model');await page2.api.scan();
assert.equal(page2.api.isSaved('new-model'),false,'Evicted weights are not shown as downloaded');
assert.equal(page2.api.preferred(),'new-model','Remembered choice does not silently disappear after eviction');
page2.click('old-model');await tick();await tick();
assert.ok(deleted.includes('old-model'),'Explicit removal deletes browser model files');
assert.equal(page2.api.isSaved('old-model'),false);
assert.equal(page2.api.savedIds().length,0);
console.log('✓ Random AI re-discovers old downloads, restores choices, detects missing cache files and respects explicit removal.');
