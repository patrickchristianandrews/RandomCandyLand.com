/* Validate specialist prompt library before the website publishes.
 * Content-only checks: do not claim runtime model capabilities.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const filepath='public/studio/deep-workflows.js',content=fs.readFileSync(filepath,'utf8');
const context={window:{}};
new vm.Script(content,{filename:filepath}).runInNewContext(context);
const {categories,tools}=context.window.RandomAIDeepWorkflows;
assert.ok(categories.length>=20,'At least 20 distinct, useful subject categories');
assert.ok(tools.length>=95,'At least 95 distinct specialist workflows');
const categoryNames=new Set(categories.map(x=>x.name));
assert.equal(categoryNames.size,categories.length,'Category names must be unique');
const ids=new Set();
for(const cat of categories){assert.ok(cat.icon&&cat.summary&&cat.name,'Every subject must explain its remit')}
for(const workflow of tools){
 assert.ok(workflow.id&&!ids.has(workflow.id),'Duplicate workflow id: '+workflow.id);ids.add(workflow.id);
 assert.ok(categoryNames.has(workflow.group),'Unknown subject area: '+workflow.group);
 for(const key of ['name','description','inputs','outputs','method','limits','prompt']){
  assert.ok(String(workflow[key]||'').trim().length>=12,'Missing '+key+' in '+workflow.id);
 }
 assert.ok(workflow.prompt.includes('YOU PROVIDE:')&&workflow.prompt.includes('DELIVERABLES:')&&workflow.prompt.includes('RELIABILITY:'),'Workflow lacks a detailed request: '+workflow.id);
}
const studio=fs.readFileSync('public/studio/studio.js','utf8'),html=fs.readFileSync('public/studio/index.html','utf8');
new vm.Script(studio,{filename:'studio.js'});
for(const token of ['RandomAIDeepWorkflows','renderWorkflowCategories','selectWorkflowCategory','workflowDetails','toolVisibleLimit','libraryShowMore','updateComposerModelIdentity','setStudioMenu']){
 assert.ok(studio.includes(token),'Random AI workflow or navigation integration missing: '+token);
}
for(const token of ['deep-workflows.js?v=1','id="libraryCategoryGrid"','id="toolCategorySelect"','id="workflowPreview"','id="composerActiveModels"','id="sidebarClose"','id="sidebarScrim"']){
 assert.ok(html.includes(token),'Random AI control missing: '+token);
}
const idsInMarkup=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
const idsInSource=[...studio.matchAll(/\$\(['"]#([\w-]+)['"]\)/g)].map(x=>x[1]);
const dynamicIds=new Set(['guideLoad','retryModels']);
for(const id of idsInSource)assert.ok(idsInMarkup.has(id)||dynamicIds.has(id),'JS references non-existent UI element: '+id);
console.log('✓ Random AI has '+categories.length+' specialist categories, '+tools.length+' detailed new workflows, and wired navigation, library and prompt UI.');
