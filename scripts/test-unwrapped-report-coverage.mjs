/* Regression guard: every Unwrapped report and example uses the central anatomical toy guide.
 * Run before publishing; no internet, accounts or saved quiz answers required. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const read=file=>fs.readFileSync('public/after-dark/'+file,'utf8');
const toy=read('toy-library.js');
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
 ['toy-library.js',toy],['quiz-report.js',personal],
 ['partner-pdf.js',partner],['new-partner-report.js',newPartner],['partner-results-share.js',share],
 ['partner-compare.js',compare],['report-qr.js',qr]]){
 assert.doesNotThrow(()=>new vm.Script(source,{filename:path}),path+' must remain parseable');
}
const context={window:{},document:{getElementById:()=>null,addEventListener:()=>{}}};
vm.runInNewContext(toy,context,{filename:'toy-library.js'});
const lib=context.window.UnwrappedToyLibrary;
const answer=lib.answer('How do I use a wand with male and female anatomy?');
assert.match(answer,/Male anatomy:/);
assert.match(answer,/Female anatomy:/);
assert.match(answer,/Partner use:/);
assert.ok(!lib.answer('How can I get to know my partner?'),'Non-toy questions must be left for other educational content.');
assert.equal(lib.types.length,12);
for(const item of lib.types){
 const spec=lib.bodyUses(item.id);
 assert.ok(spec?.male?.note&&spec?.female?.note&&spec?.together,'Every category must compare male/female/shared uses: '+item.id);
}
// A report guide must not advertise sample files that were never published.
assert.match(samplePage,/Create or upload a report/);
assert.match(samplePage,/Private backup/);
assert.match(samplePage,/Selected report/);
assert.match(samplePage,/combined report/i);
assert.match(samplePage,/complete-rowan-current-partner-report\.pdf/);
assert.match(samplePage,/complete-rowan-prospective-partner-report\.pdf/);
assert.match(samplePage,/complete-rowan-ellis-comparison\.pdf/);
assert.doesNotMatch(samplePage,/data-sample-download|sample-pdf\.js/i);

assert.match(personal,/How it differs for male and female anatomy/);
assert.match(personal,/item\.bodyUses\.together/);
assert.match(partner,/selected\.has\('toys'\)/);
assert.match(partner,/selected\.has\('synthesis'\)/);
assert.match(partner,/window\.UnwrappedWholePerson\?\.build/);
assert.ok(!/const selected=new Set\([^)]*'synthesis'/.test(partner),'Whole-person report with intimate evidence must be OFF in partner exports by default');
assert.match(partner,/Male anatomy:/);
assert.ok(!/const selected=new Set\([^)]*'toys'/.test(partner),'Partner PDF toy section must be OFF initially');
assert.match(newPartner,/showToys=false/);
assert.match(newPartner,/const permitted=selectedQuestions\(data\)\.filter\(x=>selectedPsych\.has\(x\.id\)\)/);
assert.match(newPartner,/const tags=\[\.\.\.new Set\(permitted\.flatMap/);
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
assert.match(main,/id="uw-personal-workflow"/);
assert.match(main,/id="uw-import-private"/);
assert.match(main,/id="uw-save-private"/);
// The menu was intentionally renamed and grouped: people see report paths by purpose.
assert.match(main,/Your reports/);
assert.match(main,/My Personal Report/);
assert.match(main,/Current Partner Report/);
assert.match(main,/Prospective Partner Report/);
assert.match(main,/Our Combined Report/);
assert.match(main,/id="uw-home-random-heading"/);
assert.match(main,/data-idea-launch="full"/);
assert.equal((main.match(/data-idea-launch=/g)||[]).length,1,'Landing must show exactly one random combination option');
assert.match(main,/mira-conversation\.js\?v=/);
assert.match(main,/\/after-dark\/landing-ideas\.js\?v=/);
assert.match(main,/\/after-dark\/menu-guide\.css\?v=/);
assert.match(compare,/function renderPartner\(pack\)/);
assert.match(compare,/Create partner report from 1 file/);
assert.match(compare,/Create combined report from 2 files/);
assert.match(compare,/Choose a selected Unwrapped comparison report/);
assert.match(compare,/if\(JSON\.stringify\(a\)===JSON\.stringify\(b\)\)/);
assert.match(transfer,/return true;/);
// The report center now intentionally makes genuine sample reports discoverable.
assert.match(main,/View Sample Reports/);
assert.match(main,/id="uw-report-paths"/);
assert.match(main,/id="uw-existing-partner-report"/);
assert.match(main,/\/after-dark\/report-paths\.js\?v=/);
assert.match(main,/\/after-dark\/couple-checkins\.js\?v=/);
console.log('✓ Personal PDF, private backup, selected JSON import, one-file partner and two-file combined report workflow retain opt-in privacy controls.');

