import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const paths=[
 'public/after-dark/toy-library-expanded.js',
 'public/after-dark/toy-library-additions.js',
 'public/after-dark/toy-library.js',
 'public/after-dark/toy-idea-combiner.js',
 'public/after-dark/toy-discovery-quick.js',
 'public/after-dark/idea-lab-enhanced.js',
];
for(const path of paths)assert.doesNotThrow(()=>new vm.Script(read(path),{filename:path}),path+' must parse');
const panel=read('public/after-dark/index.html');
for(const path of paths)assert(panel.includes(path.split('/').pop()),'Page must load '+path);
assert(panel.includes('idea-lab-enhanced.css'),'Page must load responsive styles');
assert(panel.indexOf('toy-library-expanded.js')<panel.indexOf('toy-library-additions.js'),'Load expansion before additions');
assert(panel.indexOf('toy-library-additions.js')<panel.indexOf('toy-library.js'),'Load all toy types before library');
assert(panel.indexOf('toy-idea-combiner.js')<panel.indexOf('toy-discovery-quick.js'),'Load combiner before quick search');
assert(panel.indexOf('toy-discovery-quick.js')<panel.indexOf('idea-lab-enhanced.js'),'Enhanced picker overrides old button handler last');

class Node{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.value='';this.dataset={};this.attributes={};this.hidden=false;this.text='';this.listeners={};this.classList={add(){},remove(){}};}
 set id(s){this._id=s;registry.set(s,this)}
 get id(){return this._id}
 set textContent(s){this.text=String(s);this.children=[]}
 get textContent(){return this.text+this.children.map(x=>typeof x==='string'?x:x?.textContent||'').join(' ')}
 append(...xs){this.children.push(...xs)}
 replaceChildren(...xs){this.text='';this.children=[...xs]}
 setAttribute(k,v){this.attributes[k]=v}
 addEventListener(k,fn){this.listeners[k]=fn}
 closest(){return this}
 insertAdjacentElement(){return this}
 querySelector(){return null}
 querySelectorAll(){return []}
 scrollIntoView(){}
}
const registry=new Map();
function add(id){const n=new Node();n.id=id;return n}
const controls=add('controls');
const main=add('drawIdea');
main.onclick=()=>{};
add('mood').value='any';
add('ideaLevel').value='bold';
const root=add('ideaResult');
const ctx={
 window:{},
 document:{
  readyState:'complete',
  getElementById:id=>registry.get(id)||null,
  querySelector:q=>q==='#ideas .idea-lab-controls'?controls:null,
  createElement:tag=>new Node(tag),
 },
 Math,Map,Set,URLSearchParams,
};
vm.createContext(ctx);
for(const path of paths.slice(0,3))vm.runInContext(read(path),ctx,{filename:path});
const lib=ctx.window.UnwrappedToyLibrary;
assert.equal(lib.types.length,68,'Guide should include 68 searchable categories');
assert.equal(new Set(lib.types.map(t=>t.id)).size,68,'Ids must be unique');
assert.ok(lib.types.every(t=>lib.bodyUses(t.id)?.male&&lib.bodyUses(t.id)?.female&&lib.bodyUses(t.id)?.together),'All toys need three body/partner contexts');
assert.equal(lib.recommend({direct:{specificSelections:[]},interests:[]}).length,0,'Do not fabricate matches from missing answers');
vm.runInContext(read(paths[5]),ctx,{filename:paths[5]});
const picker=ctx.window.UnwrappedFreakPicker;
assert.ok(picker&&picker.ideas>=48,'At least 48 curated scenario foundations');
const slider=registry.get('freak-level');
assert.ok(slider,'Interactive intensity slider rendered');
for(const value of [1,5,8,10]){
 slider.value=String(value);
 main.onclick();
 assert.ok(root.textContent.includes('FREAK LEVEL '+value+'/10'),'Selected level must be visible at '+value);
 assert.ok(root.textContent.includes('What to talk about'),'Scenario requires detailed questions');
 assert.ok(root.textContent.includes('Boundaries and safer choices'),'Scenario requires safety notes');
}
picker.generate('toy');
assert.ok(root.textContent.includes('An optional device to pair with this idea'),'Single-toy scenario draws from actual catalog');
picker.generate('full');
assert.ok(root.textContent.includes('A second twist'),'Full scenario must combine separate ideas');
assert.ok(root.textContent.includes('Two optional device ideas'),'Full scenario must combine separate devices');
registry.get('freak-no-anal').checked=true;
registry.get('freak-no-penetration').checked=true;
registry.get('freak-no-power').checked=true;
registry.get('freak-fantasy-only').checked=true;
picker.generate('full');
assert.ok(root.textContent.includes('FANTASY ONLY'),'Fantasy-only must be explicitly shown');
assert.ok(!root.textContent.includes('Anal & pelvic'),'Excluded anal categories must not be suggested');
assert.ok(!root.textContent.includes('Nothing fits'),'Exclusions should leave an available alternative');
const wonderContext={window:{}};
vm.createContext(wonderContext);
vm.runInContext(read('public/curiosity/ideas-data.js'),wonderContext);
vm.runInContext(read('public/curiosity/ideas-extra.js'),wonderContext);
const wonderIdeas=wonderContext.window.WonderIndexIdeas;
assert.equal(wonderIdeas.length,116,'Wonder Index must have 116 original searchable entries');
assert.equal(new Set(wonderIdeas.map(x=>x[0])).size,116,'Wonder Index ideas must be unique');
for(const path of ['public/curiosity/index.html','public/curiosity/ideas/index.html']){
 const page=read(path);
 assert.ok(page.includes('ideas-extra.js'),'Wonder Index page must load the additional ideas: '+path);
 assert.ok(page.indexOf('ideas-data.js')<page.indexOf('ideas-extra.js'),'Wonder Index extension must load after base ideas: '+path);
}
console.log('✓ Wonder Index: 116 unique original ideas across the existing searchable topic pages.');
console.log('✓ Unwrapped: 68 catalog categories, 48 rich scenario templates, all four Freak Level bands, solo and combo pickers, exclusions, fantasy-only, and source parsing.');
