/* Regression guard: every Unwrapped report and example uses the central anatomical toy guide.
 * Run before publishing; no internet, accounts or saved quiz answers required. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const read=file=>fs.readFileSync('public/after-dark/'+file,'utf8');
const toy=read('toy-library.js');
const sample=read('report-samples/sample-pdf.js');
const samplePage=read('report-samples/index.html');
const personal=read('quiz-report.js');
const partner=read('partner-pdf.js');
const newPartner=read('new-partner-report.js');
const share=read('partner-results-share.js');
const compare=read('partner-compare.js');
const qr=read('report-qr.js');
const main=read('index.html');
const connections=read('report-connections.js');
const holistic=read('report-whole-person.js');
const demoFixtures=read('fictional-respondents.js');

for(const [path,source] of [
 ['toy-library.js',toy],['report-samples/sample-pdf.js',sample],['quiz-report.js',personal],
 ['partner-pdf.js',partner],['new-partner-report.js',newPartner],['partner-results-share.js',share],
 ['partner-compare.js',compare],['report-qr.js',qr]]){
 assert.doesNotThrow(()=>new vm.Script(source,{filename:path}),path+' must remain parseable');
}
const context={window:{},document:{getElementById:()=>null,addEventListener:()=>{}}};
vm.runInNewContext(toy,context,{filename:'toy-library.js'});
vm.runInNewContext(sample,context,{filename:'sample-pdf.js'});
const lib=context.window.UnwrappedToyLibrary;
const samplePDF=context.window.AfterDarkSamplePDF;
const answer=lib.answer('How do I use a wand with male and female anatomy?');
assert.match(answer,/Male anatomy:/);
assert.match(answer,/Female anatomy:/);
assert.match(answer,/Partner use:/);
assert.ok(!lib.answer('How can I get to know my partner?'),'Non-toy questions must be left for other educational content.');
assert.equal(lib.types.length,12);
assert.deepEqual(Array.from(samplePDF.keys).sort(),['new','personal','selected']);
for(const item of lib.types){
 const spec=lib.bodyUses(item.id);
 assert.ok(spec?.male?.note&&spec?.female?.note&&spec?.together,'Every category must compare male/female/shared uses: '+item.id);
}
const fullText=kind=>samplePDF.sampleSections(kind).map(([h,b])=>h+' '+b.join(' ')).join(' ');
const a=fullText('personal'),b=fullText('selected'),c=fullText('new');
for(const name of ['Male anatomy','Female anatomy','Shared / partner use','Safety and design']){
 assert.ok(a.includes(name),'Personal sample PDF must explain '+name);
 assert.ok(b.includes(name),'Opted-in selective partner sample PDF must explain '+name);
}
assert.match(a,/FANTASY ONLY/);
assert.match(b,/separate.*section|real partner PDF leaves this section OFF|real partner PDF/i);
assert.ok(!c.includes('Male anatomy ('),'Nonsexual new-partner sample must not disclose real toy suggestions');
assert.match(c,/NO sex toy suggestions/);
const pages=samplePage.indexOf('toy-library.js?v=');
const pdf=samplePage.indexOf('report-samples\/sample-pdf.js?v=');
assert.ok(pages>0&&pdf>pages,'Sample page must load central data before building downloadable PDFs');
for(const word of ['male','female','partner','toy']){
 assert.ok(samplePage.toLowerCase().includes(word),'Sample explanatory page is missing '+word);
}
assert.match(personal,/How it differs for male and female anatomy/);
assert.match(personal,/item\.bodyUses\.together/);
assert.match(partner,/selected\.has\('toys'\)/);
assert.match(partner,/Male anatomy:/);
assert.ok(!/const selected=new Set\([^)]*'toys'/.test(partner),'Partner PDF toy section must be OFF initially');
assert.match(newPartner,/showToys=false/);
assert.match(newPartner,/showSex\s*&&?showToys|if\(showToys\)/);
assert.match(newPartner,/id='new-partner-share-toys'/);
assert.match(share,/toys:new Set\(\)/);
assert.match(share,/opt\.toys\.has\(item\.id\)/);
assert.match(share,/pack\.toys/);
assert.match(share,/toys\.length>2/);
assert.match(compare,/toys:new Set\(\)/);
assert.match(compare,/selection\.toys\.has\(item\.id\)/);
assert.match(compare,/raw\.toys/);
assert.match(qr,/Sex Toy Guide/);
assert.match(main,/id="toy-body-focus"/);
assert.match(main,/UnwrappedToyLibrary\?\.answer/);
assert.match(main,/report-coverage-20261105-v5/);
assert.match(main,/report-connections\.js\?v=/);
assert.match(main,/report-whole-person\.js\?v=integrated-perspectives/);
assert.match(holistic,/How it all fits together/);
assert.match(holistic,/Apparent contradictions may be context/);
assert.match(holistic,/A practical week of experiments/);
assert.match(holistic,/What I chose, what is only fantasy/);
assert.match(holistic,/Intimacy & personal preference/);
assert.match(holistic,/Everyday life/);
assert.match(holistic,/Try saying:/);
assert.match(holistic,/Q'\+row\.number/);
assert.match(main,/Ask Mira/);
assert.match(connections,/report-cross-pair-table/);
assert.match(connections,/report-cross-topic/);
assert.match(connections,/specificSelections/);
assert.match(demoFixtures,/questionVersion:5/);
assert.match(demoFixtures,/AfterDarkDirectQuizBridge/);
assert.match(demoFixtures,/AfterDarkPsychQuizBridge/);
const transfer=read('continue-and-transfer.js');
assert.match(transfer,/function privateLibraryMarks/);
assert.match(transfer,/const library=kind==='psych'\?null:privateLibraryMarks\(\)/);
assert.match(transfer,/saved interest shelf is invalid/i);
assert.match(transfer,/shelf\.mark\(id,status\)/);
assert.match(samplePage,/complete-rowan-personal-report\.pdf/);
assert.match(samplePage,/complete-ellis-personal-report\.pdf/);
assert.ok(samplePage.includes('101 / 101 ANSWERED'),'Full simulated results must be described explicitly');
console.log('✓ Personal, partner, new-partner, selected links, comparison JSON, downloadable samples and QR all use opt-in toy/anatomy guidance.');
