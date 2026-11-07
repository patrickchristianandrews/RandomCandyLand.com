import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const expansion=fs.readFileSync('public/after-dark/toy-library-expanded.js','utf8');
const source=fs.readFileSync('public/after-dark/toy-library.js','utf8');
const explorer=fs.readFileSync('public/after-dark/toy-explorer-tools.js','utf8');
const combiner=fs.readFileSync('public/after-dark/toy-idea-combiner.js','utf8');
const panel=fs.readFileSync('public/after-dark/index.html','utf8');
const personal=fs.readFileSync('public/after-dark/quiz-report.js','utf8');
const partner=fs.readFileSync('public/after-dark/partner-pdf.js','utf8');
const styles=fs.readFileSync('public/after-dark/toy-library.css','utf8');
const context={window:{},document:{getElementById:()=>null}};
vm.runInNewContext(expansion,context,{filename:'toy-library-expanded.js'});
vm.runInNewContext(source,context,{filename:'toy-library.js'});
const library=context.window.UnwrappedToyLibrary;
assert.ok(library,'Toy library must expose a readonly browser API');
assert.ok(library.types.length>=56,'Expanded guide must contain 56 distinct categories; found '+library.types.length);
assert.equal(new Set(library.types.map(x=>x.id)).size,library.types.length,'Every toy id must be unique');
assert.ok(context.window.UnwrappedToyExpansion.resource.guides.length>=6,'Expanded safer-use handbook is part of guide');
assert.ok(explorer.includes('unwrapped-private-toy-reading-shelf-v1')&&explorer.includes('toy-comparison'),'Private shelf and comparison are present');
for(const item of library.types){
 assert.ok(item.uses.length>=4,'Each toy type includes multiple distinct uses: '+item.id);
 assert.ok(item.safety.length>55,'Every toy needs meaningful safety guidance: '+item.id);
 assert.ok(item.name&&item.group&&item.summary,'Every toy has searchable information');
 const uses=library.bodyUses(item.id);
 assert.ok(uses&&uses.male&&uses.female&&uses.together,'Every toy must explain male, female and partner use: '+item.id);
 for(const anatomy of ['male','female']){
  assert.ok(['direct','conditional','partner','not-targeted'].includes(uses[anatomy].fit),'Anatomical suitability must be explicit for '+item.id);
  assert.ok(uses[anatomy].note.length>60,'Body-specific explanation must be substantial: '+item.id+' '+anatomy);
 }
 assert.ok(uses.together.length>60,'Shared-use guidance must be clear: '+item.id);
}
for(const id of ['harness','strap-starter','oring-harness','strapless','hollow-strap','thigh-harness','underwear-harness','strap-attachment','strap-vibe','suction-dildo','dual-density','grinding-pad','scrotal-vibe']){
 assert.ok(library.find(id),'Missing visibly named toy type: '+id);
}
assert.ok(library.find('harness').name.toLowerCase().includes('strap-on'),'Strap-ons must be named plainly on default cards');
assert.ok(library.types.filter(t=>t.group==='Strap-ons & harnesses').length>=8,'Strap-ons should have a discoverable dedicated category');
assert.ok(library.types.some(t=>t.name.includes('Hollow strap-on'))&&library.types.some(t=>t.name.includes('Strap-on starter kit')),'Users should not have to infer strap-on products from generic labels');
assert.ok(combiner.includes('UnwrappedToyIdeas')&&combiner.includes("generate('together')")&&combiner.includes('appropriate'),'Him/Her/Together generator must use the real safe catalog');
assert.ok(panel.includes('data-toy-quick-group="Strap-ons &amp; harnesses"'),'One-click strap-on category must be visible');
for(const token of ['id="toy-idea-studio"','id="toy-idea-him"','id="toy-idea-her"','data-toy-idea-mode="him"','data-toy-idea-mode="her"','data-toy-idea-mode="together"']){
 assert.ok(panel.includes(token),'Idea Lab missing '+token);
}
assert.equal(library.bodyUses('prostate').female.fit,'not-targeted','Do not claim prostate-specific devices directly target anatomy without a prostate');
assert.equal(library.bodyUses('air-pulse').male.fit,'not-targeted','Do not describe clitoral air-pulse device as universally penile-compatible');
assert.equal(library.bodyUses('sleeve').female.fit,'partner','Penis sleeves are not directly fitted to the vulva');
assert.equal(library.bodyUses('ring').female.fit,'partner','Penis rings are not made to be worn on the vulva');
assert.equal(library.bodyUses('anal-plug').male.fit,'direct','Anal-rated toys can fit male anatomy');
assert.equal(library.bodyUses('anal-plug').female.fit,'direct','Anal-rated toys can fit female anatomy');
const data=(choices=[],interests=[],psych={})=>({
 direct:{specificSelections:choices.map((x,i)=>({questionNumber:i+1,intent:'explore',...x}))},
 interests,psych,axes:{psych:{sensation:100,novelty:100}},
});
assert.equal(library.recommend(data()).length,0,'Do not infer toys from an empty quiz');
assert.equal(library.recommend(data([],[{name:'Nipple interest',directSelection:0,specificSelected:false}])).length,0,'No psychology-only match');
const nipple=library.recommend(data([{text:'I am interested in nipple sensation'}]));
assert.ok(nipple.some(x=>x.id==='nipple-massager'),'Named nipple interests suggest the relevant category');
const fantasy=library.recommend(data([{text:'Strap-on play interests me',intent:'fantasy',intentLabel:'Fantasy only'}],[{name:'Strap-on play',directSelection:0,specificSelected:true}]));
assert.ok(fantasy.some(x=>x.id==='harness'),'Named toy should appear for optional reading');
assert.ok(fantasy.every(x=>x.mode.includes('Fantasy-only')),'Fantasy-only must not be presented as a try-it suggestion');
assert.ok(!library.recommend(data([{text:'I am interested in anal play'},{text:'Anal play is not for me'}])).some(x=>x.id==='anal-plug'),'Negative response must block a positive suggestion');
const generic=library.recommend(data([{text:'Maybe I am curious about sex toys',intent:'fantasy'}]));
assert.ok(generic.every(x=>['wand','bullet'].includes(x.id)),'Broad toy curiosity must not infer genital anatomy or anal activities');
const specificallyNamed=library.recommend(data([{text:'I want to read about nipple clamps',intent:'fantasy'}]));
assert.equal(specificallyNamed[0]?.id,'nipple-clip','Directly named speciality must outrank broad nipple interest');
assert.ok(specificallyNamed.every(x=>x.mode.includes('Fantasy-only')),'New options must preserve fantasy-only intent');
assert.ok(library.answer('What is a penis pump?').includes('Penile vacuum device'),'Mira must recognize expanded specialty terms');
assert.ok(library.types.some(x=>x.id==='toy-barriers')&&library.types.some(x=>x.id==='position-wedge')&&library.types.some(x=>x.id==='pelvic-trainer'),'Coverage includes safer sharing, accessibility and pelvic comfort');
assert.ok(panel.includes('id="toys" class="tab"')&&panel.includes('id="toy-grid"')&&panel.includes('toy-library.js?v=')&&panel.includes('toy-library-expanded.js?v=')&&panel.includes('toy-explorer-tools.js?v='),'The site offers the independent expanded toy explorer');
for(const tag of ['id="toy-show-all"','id="toy-comparison"','id="toy-education-hub"','id="toy-reading-list"','id="toy-checklist"'])assert.ok(panel.includes(tag),'Expanded guide is missing '+tag);
assert.ok(panel.includes("toys:'Sex Toy Guide'")&&panel.includes(",'toys',"),'Toy section is navigable and deep-linkable');
assert.ok(panel.includes('id="toy-body-focus"')&&panel.includes('<option value="male">')&&panel.includes('<option value="female">')&&panel.includes('<option value="together">'),'Toy guide must offer anatomy-specific and shared-use filters');
assert.ok(personal.includes('Sex toy guide · Ideas that fit my selected interests')&&personal.includes('UnwrappedToyLibrary')&&personal.includes('Topics I separately saved for reading'),'Personal reports must use the same source library and opt-in reading shelf');
assert.ok(personal.includes('How it differs for male and female anatomy')&&personal.includes('item.bodyUses.together'),'Personal reports must compare male/female/partner use without guessing identity');
assert.ok(partner.includes("['toys','Toy ideas I want to share'"),'Partner report has a separate opt-in');
assert.ok(partner.includes("selected.has('toys')"),'Partner export must not show toys unless explicitly chosen');
assert.ok(partner.includes('Male anatomy: ')&&partner.includes('Female anatomy: ')&&partner.includes('Shared use: '),'Optional partner reports explain differences for both anatomies');
assert.ok(!/const selected=new Set\([^)]*'toys'/.test(partner),'Toy section must be OFF by default in partner reports');
assert.ok(styles.includes('.toy-grid')&&styles.includes('.toy-report-rec')&&styles.includes('.toy-body-rows'),'Guide and print layout must have responsive side-by-side styles');
console.log('✓ Toy Library: '+library.types.length+' detailed types including accessible strap-ons, compatible harness options, 3-way idea comparison, anatomy checks and opt-in sharing.');
