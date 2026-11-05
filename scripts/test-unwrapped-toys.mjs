import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('public/after-dark/toy-library.js','utf8');
const panel=fs.readFileSync('public/after-dark/index.html','utf8');
const personal=fs.readFileSync('public/after-dark/quiz-report.js','utf8');
const partner=fs.readFileSync('public/after-dark/partner-pdf.js','utf8');
const styles=fs.readFileSync('public/after-dark/toy-library.css','utf8');
const context={window:{},document:{getElementById:()=>null}};
vm.runInNewContext(source,context,{filename:'toy-library.js'});
const library=context.window.UnwrappedToyLibrary;
assert.ok(library,'Toy library must expose a readonly browser API');
assert.equal(library.types.length,12,'Every category is documented');
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
assert.ok(panel.includes('id="toys" class="tab"')&&panel.includes('id="toy-grid"')&&panel.includes('toy-library.js?v='),'The site offers the independent toy explorer');
assert.ok(panel.includes("toys:'Sex Toy Guide'")&&panel.includes(",'toys',"),'Toy section is navigable and deep-linkable');
assert.ok(panel.includes('id="toy-body-focus"')&&panel.includes('<option value="male">')&&panel.includes('<option value="female">')&&panel.includes('<option value="together">'),'Toy guide must offer anatomy-specific and shared-use filters');
assert.ok(personal.includes('Sex toy guide · Ideas that fit my selected interests')&&personal.includes('UnwrappedToyLibrary'),'Personal reports must use the same recommendation function');
assert.ok(personal.includes('How it differs for male and female anatomy')&&personal.includes('item.bodyUses.together'),'Personal reports must compare male/female/partner use without guessing identity');
assert.ok(partner.includes("['toys','Toy ideas I want to share'"),'Partner report has a separate opt-in');
assert.ok(partner.includes("selected.has('toys')"),'Partner export must not show toys unless explicitly chosen');
assert.ok(partner.includes('Male anatomy: ')&&partner.includes('Female anatomy: ')&&partner.includes('Shared use: '),'Optional partner reports explain differences for both anatomies');
assert.ok(!/const selected=new Set\([^)]*'toys'/.test(partner),'Toy section must be OFF by default in partner reports');
assert.ok(styles.includes('.toy-grid')&&styles.includes('.toy-report-rec')&&styles.includes('.toy-body-rows'),'Guide and print layout must have responsive side-by-side styles');
console.log('✓ Toy Library: 12 multi-use guides, male/female/shared comparisons, safety, direct-answer matches, exclusions, fantasy-only and optional partner sharing.');
