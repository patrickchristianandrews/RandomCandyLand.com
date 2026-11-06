// Browser-level regression checks for After Dark, requiring no npm test packages.
// Uses Chrome DevTools Protocol and the runner's installed Google Chrome.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const uri=decodeURIComponent((req.url||'/').split('?')[0]);
  const filename=path.resolve(root,'.'+uri,(uri.endsWith('/')||!path.extname(uri))?'index.html':'');
  if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(filename,(err,data)=>{if(err){res.writeHead(404).end('Not found '+uri);return;}
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const chrome=['google-chrome','chromium','chromium-browser'].find(c=>spawnSync('which',[c]).status===0);
if(!chrome)throw new Error('Browser smoke tests need Chrome or Chromium');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'rcd-chrome-'));
const chromeLogPath=path.join(profile,'chrome-startup.log');
const chromeLogFd=fs.openSync(chromeLogPath,'w');
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'--remote-allow-origins=*','about:blank'],{stdio:['ignore','ignore',chromeLogFd]});
fs.closeSync(chromeLogFd);
let chromeLaunchError='';
proc.on('error',error=>{chromeLaunchError=String(error)});
const testErrors=[];
let browserPort=0;
try{
  // Runners can take substantially longer than nine seconds to start headless Chrome.
  // Wait for the actual DevTools endpoint instead of treating a slow launch as a website failure.
  for(let i=0;i<300;i++){
    const f=path.join(profile,'DevToolsActivePort');
    if(fs.existsSync(f)){
      const candidate=Number(fs.readFileSync(f,'utf8').split('\n')[0]);
      if(Number.isInteger(candidate)&&candidate>0){browserPort=candidate;break;}
    }
    if(chromeLaunchError||proc.exitCode!==null)break;
    await delay(200);
  }
  if(!browserPort){
    const details=fs.existsSync(chromeLogPath)?fs.readFileSync(chromeLogPath,'utf8').slice(-3000):'';
    throw Error('Chrome did not open DevTools port. Binary: '+chrome+'; exit: '+proc.exitCode+'; spawn: '+chromeLaunchError+'; Chrome log: '+details);
  }
  let client;
  async function navigate(url){
    if(client)client.close();
    const target=await (await fetch(`http://127.0.0.1:${browserPort}/json/new?${encodeURIComponent(url)}`,{method:'PUT'})).json();
    client=new WebSocket(target.webSocketDebuggerUrl);
    await Promise.race([
      new Promise((resolve,reject)=>{client.addEventListener('open',resolve,{once:true});client.addEventListener('error',reject,{once:true});}),
      delay(20000).then(()=>{throw Error('Chrome WebSocket connection timed out: '+url);})
    ]);
    let next=0;
    const pending=new Map();
    client.addEventListener('message',event=>{
      const msg=JSON.parse(String(event.data));
      if(msg.method==='Runtime.exceptionThrown')testErrors.push(msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text || 'Runtime exception');
      if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error')testErrors.push(msg.params.entry.text);
      if(msg.id&&pending.has(msg.id)){const [resolve,reject]=pending.get(msg.id);pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}
    });
    // Never leave CI hanging forever if Chrome stops answering one command.
    // Keep genuine browser regressions fatal, but surface the operation and URL.
    const command=(method,params={})=>new Promise((resolve,reject)=>{
      const id=++next;
      const watchdog=setTimeout(()=>{
        pending.delete(id);
        reject(Error('Chrome DevTools timeout: '+method+' at '+url+' (20 seconds without a response)'));
      },method==='Page.printToPDF'?120000:20000);
      pending.set(id,[
        result=>{clearTimeout(watchdog);resolve(result);},
        error=>{clearTimeout(watchdog);reject(error);}
      ]);
      try{client.send(JSON.stringify({id,method,params}));}
      catch(error){clearTimeout(watchdog);pending.delete(id);reject(error);}
    });
    await command('Runtime.enable');
    await command('Page.enable');
    // Force navigation after Runtime.enable so initial script failures are visible.
    await command('Page.navigate',{url});
    // A newly created target may still be loading; polling guarantees init.
    const evaluate=async js=>{
      const r=await command('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw Error('Browser JavaScript error: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));
      return r.result?.value;
    };
    for(let i=0;i<90;i++){if(await evaluate('document.readyState==="complete"'))break;await delay(100);}
    await delay(200);
    return {evaluate,command};
  }

function fictionalProfile(key){
 const p=window.UnwrappedFictionalRespondents.apply(key);
 window.__UnwrappedDemo=p;
 return{key:p.key,label:p.profile.label,description:p.profile.description,direct:p.completed.direct,psych:p.completed.psych,
  sharedThemes:p.matchingThemes,chosenInterests:p.selectedInterests,totalTopics:p.allTopics,
  topLenses:Object.entries(p.data.axes.combined||{}).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([tag])=>p.data.lenses[tag]?.label||tag)};
}
function preparePrintableReport(){
 const p=window.__UnwrappedDemo;
 const report=window.AfterDarkDetailedReport.build();
 if(!report?.querySelector('.report-visual-dashboard')||!report?.querySelector('.report-deep-connections'))
  throw Error('Real report lacks visual dashboard or comprehensive connections');
 const holistic=report.querySelector('.report-whole-person');
 if(!holistic||holistic.querySelectorAll('.report-person-thread').length<3||
    holistic.querySelectorAll('.report-person-weave').length<2||
    holistic.querySelectorAll('.report-person-day').length!==7||
    !/A gentle way to share my results/.test(holistic.textContent))
  throw Error('Full report omitted the integrated psychological story, source-linked perspectives, conversation script or reflection plan');
 const connectionRows=report.querySelectorAll('.report-cross-matrix tbody tr').length;
 const subConnections=report.querySelectorAll('.report-cross-pair-table tbody tr').length;
 const topics=report.querySelectorAll('.report-cross-topic').length;
 if(connectionRows<5||subConnections<5||topics<2)throw Error('Incomplete theme connections and evidence');
 const cover=report.querySelector('.report-cover')||report;
 const caption=document.createElement('div');caption.className='report-demo-caption';
 const bold=document.createElement('strong');bold.textContent='FICTIONAL DEMONSTRATION · NOT A REAL PERSON';
 const summary=document.createElement('p');summary.textContent=p.profile.label+' · 69 preference answers + 32 everyday psychology answers. '+p.profile.description;
 caption.append(bold,summary);cover.insertBefore(caption,cover.firstChild);
 // CDP Page.printToPDF fires afterprint as part of headless rendering. The normal
 // visitor cleanup removes #print-document, so suppress cleanup only for this
 // isolated fictional PDF capture. Live visitors retain normal afterprint behavior.
 window.addEventListener('afterprint',event=>event.stopImmediatePropagation(),{capture:true});
 // The public example uses the same readable default as the visitor download.
 window.UnwrappedReportConnections?.compactReport?.(report);
 const main=document.createElement('main');main.id='print-document';main.append(report);
 const style=document.createElement('style');
 style.textContent=`@page{size:A4;margin:13mm 12mm}html,body{background:#fff!important;color:#382643!important}body.print-notebook.print-detailed-report #print-document{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;display:block!important}#print-document .report-demo-caption{padding:13px 16px;margin:0 0 19px;border:2px solid #b384ae;border-radius:10px;color:#553361;background:#f8eff8}#print-document .report-demo-caption strong{font:850 13px system-ui,sans-serif}#print-document .report-demo-caption p{font:600 11px/1.5 system-ui,sans-serif;margin:7px 0 0}#print-document details{display:block!important}#print-document .report-section{break-inside:auto!important}#print-document .report-cross-topic-lens{break-inside:avoid!important}#print-document table{break-inside:auto!important}#print-document tr{break-inside:avoid!important}`;
 document.head.append(style);
 document.body.className='print-notebook print-detailed-report ad-entered';document.body.replaceChildren(main);
 // In the readable edition, do not expand every duplicate evidence list for printing.
 window.scrollTo(0,0);
 return{themes:connectionRows,subConnections,topics,
  synthesisThreads:holistic.querySelectorAll('.report-person-thread').length,
  multiThemePatterns:holistic.querySelectorAll('.report-person-weave').length,
  communicationSteps:holistic.querySelectorAll('.report-person-step').length,
  htmlLength:report.outerHTML.length,complete:/69\s*\/\s*69/.test(report.textContent)};
}


/* These tests deliberately use the real browser's download Blob, upload File inputs,
 * on-device quiz import, selective export and combined report PDF controls.
 * Never substitute canned JSON for a completed visitor's browser export. */
async function captureRealExports(name){
 const blobs=[];
 const orig=URL.createObjectURL;
 URL.createObjectURL=function(blob){blobs.push(blob);return orig.call(URL,blob)};
 try{
  window.AfterDarkProgressTransfer.exportQuiz('both');
  const backup=blobs.pop();
  if(!backup)throw Error('Actual quiz download did not create a file');
  const privateJSON=await backup.text();
  const saved=JSON.parse(privateJSON);
  if(saved.direct?.qIndex!==69||saved.psych?.position!==32||
     Object.keys(saved.direct?.multiAnswers||{}).length!==69||
     Object.keys(saved.psych?.answers||{}).length!==32)
   throw Error('Downloaded full quiz JSON dropped answers');
  if(Object.keys(saved.library||{}).length<3)
   throw Error('Private quiz backup omitted explicitly marked interests');
  window.AfterDarkProgressTransfer.exportQuiz('psych');
  const psychOnly=blobs.pop();
  if(!psychOnly||Object.hasOwn(JSON.parse(await psychOnly.text()),'library'))
   throw Error('Psychology-only export unexpectedly included separately marked intimate preferences');
  const panel=document.querySelector('#uc-export');
  if(!panel)throw Error('Selectively shared report maker missing');
  panel.open=true;panel.dispatchEvent(new Event('toggle'));
  const input=document.querySelector('#uc-select input[aria-label="Name for selected report"]');
  if(!input)throw Error('Name field is missing from selective report');
  input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));
  const choices=[...document.querySelectorAll('#uc-select label.uc-check>input')];
  if(choices.length<3)throw Error('No interest/psychology choices in selected report export');
  choices[1].click();
  choices[2].click();
  document.querySelector('#uc-save').click();
  const sharedBlob=blobs.pop();
  if(!sharedBlob)throw Error('Actual selective partner download did not create a file');
  const shareJSON=await sharedBlob.text();
  const share=JSON.parse(shareJSON);
  if(share.format!=='unwrapped-shared-comparison-v1'||share.from!==name||
     !share.interests?.length||share.toys?.length||share.answers?.length||
     shareJSON.includes('freeResponses')||shareJSON.includes('multiAnswers'))
   throw Error('Partner export is missing consent controls or wrongly includes private quiz data');
  return{privateJSON,shareJSON,sharedInterests:share.interests.length};
 }finally{URL.createObjectURL=orig}
}
async function verifyRealImport(json){
 const before=window.AfterDarkCanonicalReport.buildData();
 if(before.direct.answered||before.psych.answered)throw Error('Import test must start with a clean user');
 await window.AfterDarkProgressTransfer.importQuiz(new File([json],'full-private-backup.json',{type:'application/json'}));
 const data=window.AfterDarkCanonicalReport.buildData();
 if(data.direct.answered!==69||data.psych.answered!==32||
   !data.direct.complete||!data.psych.complete)throw Error('Clean-browser backup import did not restore both full quizzes');
 const savedMarks=JSON.parse(json).library||{};
 const restoredMarks=window.AfterDarkNotebookBridge?.getChoices?.()||{};
 for(const [id,value] of Object.entries(savedMarks))
  if(restoredMarks[id]!==value)throw Error('Marked Curiosity Library interest was not preserved on import: '+id);
 const initial=JSON.stringify(window.AfterDarkDirectQuizBridge.exportState());
 const corrupted=JSON.parse(json);corrupted.direct.multiAnswers[0]=[99999];
 window.confirm=()=>true;
 await window.AfterDarkProgressTransfer.importQuiz(new File([JSON.stringify(corrupted)],'invalid-backup.json',{type:'application/json'}));
 const after=JSON.stringify(window.AfterDarkDirectQuizBridge.exportState());
 if(after!==initial)throw Error('Invalid backup altered saved answers');
 const feedback=document.querySelector('#afterdark-save-status')?.textContent||'';
 if(!feedback.includes('⚠')&&!feedback.toLowerCase().includes('invalid'))
   throw Error('No visible rejection message for an invalid backup');
 const partner=window.AfterDarkPartnerPDF?.build?.();
 // New-partner introductions correctly refuse to export a blank, unapproved
 // disclosure. Exercise the real opt-in UI rather than bypassing privacy controls.
 window.AfterDarkNewPartnerReport?.mount?.();
 const panel=document.querySelector('#new-partner-report');
 const refresh=[...panel.querySelectorAll('button')].find(b=>b.textContent.includes('Refresh quiz choices'));
 if(!refresh)throw Error('New-partner privacy choices could not be refreshed after import');
 refresh.click();
 const psychOption=panel.querySelector('details.new-partner-options');
 const optIn=psychOption?.querySelector('.new-partner-toggle input');
 const firstAnswer=psychOption?.querySelector('.new-partner-choice input');
 if(!optIn||!firstAnswer)throw Error('No imported nonsexual answers offered for selective new-partner sharing');
 optIn.click();firstAnswer.click();
 const intro=window.AfterDarkNewPartnerReport?.build?.();
 if(!partner?.querySelector('.partner-report-section')||!intro?.querySelector('.partner-report-section')||
   !intro.textContent.includes('Some everyday answers I chose to show you'))
   throw Error('Personal or consent-selected new-partner report builder failed on imported answers');
 if(/Toy ideas I want to share|My personal notes/.test(partner.textContent)||
   /Specific toy topics I elected to share/.test(intro.textContent))
   throw Error('A default partner PDF included unapproved confidential details');
 return{restoredDirect:data.direct.answered,restoredPsych:data.psych.answered,
  libraryMarksRestored:Object.keys(savedMarks).length,invalidImportRejected:true,partnerPDFSafe:true,newPartnerPDFSafe:true};
}
async function uploadAndCompare(aText,bText){
 const aInput=document.querySelector('#uc-a'),bInput=document.querySelector('#uc-b');
 if(!aInput||!bInput)throw Error('Upload controls missing');
 for(const [input,txt,name] of [[aInput,aText,'rowan.json'],[bInput,bText,'ellis.json']]){
  const transfer=new DataTransfer();
  transfer.items.add(new File([txt],name,{type:'application/json'}));
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
 }
 document.querySelector('#uc-compare').click();
 const start=Date.now();
 return await new Promise((resolve,reject)=>{
  const poll=()=>{
   const status=document.querySelector('#uc-status')?.textContent||'';
   const result=document.querySelector('#uc-results');
   if(status.includes('Comparison ready')){
    const text=result?.textContent||'';
    if(!text.includes('Rowan')||!text.includes('Ellis')||
       !text.includes('Growth plan')||!text.includes('Communication: three useful prompts')||
       !result.querySelector('.uc-dashboard')||document.querySelector('#uc-print').hidden)
      return reject(Error('The real combined report is incomplete'));
    if(text.includes('freeResponses')||text.includes('multiAnswers')||text.includes('Private note:'))
      return reject(Error('Combined report leaked full private saved answers'));
    document.querySelector('#uc-comparison')?.scrollIntoView({block:'start'});
    return resolve({combined:true,outputCharacters:text.length,comparedSections:result.querySelectorAll('.uc-result').length,
      privacyReviewed:true});
   }
   if(status.startsWith('Could not compare:'))return reject(Error(status));
   if(Date.now()-start>10000)return reject(Error('Comparison did not finish: '+status));
   setTimeout(poll,70);
  };poll();
 });
}

  const site='http://127.0.0.1:'+port;
  // Print from a clean same-origin page, not the live quiz page: that page has
  // print-cleanup handlers and asynchronous UI controllers that can clear the
  // output while headless Chrome is making the PDF.
  async function openIsolatedPrint(source,selector,bodyClass){
    const snapshot=await source.evaluate("(()=>{const root=document.querySelector("+JSON.stringify(selector)+");return{html:root?.outerHTML||'',assets:[...document.head.querySelectorAll('link[rel=stylesheet],style')].map(x=>x.tagName==='LINK'?{type:'link',href:x.href}:{type:'style',css:x.textContent})}})()");
    if(snapshot.html.length<(selector==='#uc-results'?1200:5000))throw Error('Cannot isolate a completed printable report: '+selector+' / '+snapshot.html.length);
    const printer=await navigate(site+'/after-dark/report-samples/');
    const result=await printer.evaluate("(async()=>{const snapshot="+JSON.stringify(snapshot)+";document.head.querySelectorAll('style,link[rel=stylesheet]').forEach(x=>x.remove());const links=[];for(const asset of snapshot.assets){if(asset.type==='style'){const s=document.createElement('style');s.textContent=asset.css;document.head.append(s)}else{const link=document.createElement('link');link.rel='stylesheet';link.href=asset.href;links.push(new Promise(resolve=>{link.onload=resolve;link.onerror=resolve}));document.head.append(link)}}document.body.className="+JSON.stringify(bodyClass)+";document.body.innerHTML=snapshot.html;if(document.body.classList.contains('print-unwrapped-comparison')){const results=document.getElementById('uc-results');const wrapper=document.createElement('div');wrapper.className='wrap';const notebook=document.createElement('section');notebook.id='notebook';const comparison=document.createElement('div');comparison.id='uc-comparison';comparison.append(results);notebook.append(comparison);wrapper.append(notebook);document.body.replaceChildren(wrapper)}await Promise.all(links);await document.fonts.ready;if(document.body.classList.contains('print-unwrapped-comparison')){for(const [selector,display] of [['#notebook','block'],['#uc-comparison','block'],['#uc-results','grid']]){const target=document.querySelector(selector);if(target){target.hidden=false;target.style.setProperty('display',display,'important');target.style.setProperty('visibility','visible','important')}}}window.scrollTo(0,0);const root=document.querySelector("+JSON.stringify(selector)+");return{length:root?.textContent?.length||0,height:root?.getBoundingClientRect()?.height||0,display:root?getComputedStyle(root).display:null}})()");
    // The combined notebook tab is intentionally hidden on screen. Its print-only
    // stylesheet displays #notebook and #uc-results when Page.printToPDF switches
    // to print media. Only personal reports must be screen-visible here.
    if(result.length<(bodyClass.includes('print-unwrapped-comparison')?1200:5000)||(!bodyClass.includes('print-unwrapped-comparison')&&(result.display==='none'||result.height<100)))
      throw Error('Isolated printable report is not visible: '+JSON.stringify(result));
    console.log('✓ Isolated printable report is visible: '+JSON.stringify(result));
    return printer;
  }
  const outputDir=path.join(root,'after-dark','report-samples');
  fs.mkdirSync(outputDir,{recursive:true});
  const audit=[];
  const selectedFiles=[];
  for(const key of ['rowan','ellis']){
    const demo=await navigate(site+'/after-dark/');
    const ready=await demo.evaluate("Boolean(window.AfterDarkAdultQuiz?.length===69&&window.AfterDarkPsychologyQuiz?.length===32&&window.AfterDarkDirectQuizBridge?.importState&&window.AfterDarkPsychQuizBridge?.importState&&window.AfterDarkDetailedReport?.build&&window.UnwrappedReportConnections?.build)");
    if(!ready)throw Error('Cannot generate '+key+' PDF: real quizzes or report renderer did not load');
    await demo.evaluate("document.querySelector('#enter')?.click()");
    await demo.evaluate("new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/after-dark/fictional-respondents.js';s.onload=()=>resolve(true);s.onerror=()=>reject(Error('Fictional test responders failed to load'));document.head.append(s)})");
    const result=await demo.evaluate('('+fictionalProfile.toString()+')('+JSON.stringify(key)+')');
    if(result.direct!==69||result.psych!==32||result.sharedThemes<2||result.chosenInterests<2)
      throw Error('Actual combined quiz engine returned incomplete result '+key+': '+JSON.stringify(result));
    // Capture genuine download outputs before replacing the page with printable DOM.
    const exports=await demo.evaluate('('+captureRealExports.toString()+')('+JSON.stringify(key==='rowan'?'Rowan':'Ellis')+')');
    const shared=JSON.parse(exports.shareJSON);
    selectedFiles.push(exports.shareJSON);
    if(!shared.interests?.length)throw Error('No deliberately shared topics were exported');
    const prepared=await demo.evaluate('('+preparePrintableReport.toString()+')()');
    if(!prepared.complete)throw Error('Export omits full-quiz completion evidence: '+key);
    const printer=await openIsolatedPrint(demo,'#print-document','print-notebook print-detailed-report ad-entered');
    const printed=await printer.command('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,landscape:false,transferMode:'ReturnAsBase64'});
    const bytes=Buffer.from(printed.data||'','base64');
    if(bytes.length<10000||bytes.subarray(0,5).toString()!=='%PDF-'){
      const layout=await printer.evaluate("(()=>{const d=document.querySelector('#print-document');return{bodyHeight:document.body.scrollHeight,documentHeight:document.documentElement.scrollHeight,printElementPresent:!!d,printElementLength:d?.textContent?.length,printElementHeight:d?.getBoundingClientRect()?.height,printElementDisplay:d?getComputedStyle(d).display:null,bodyDisplay:getComputedStyle(document.body).display}})()");
      console.error('PDF diagnostics for '+key+': '+JSON.stringify({layout,prepared,printedKeys:Object.keys(printed||{}),encodedCharacters:printed.data?.length||0,pdfBytes:bytes.length,pdfPrefix:bytes.subarray(0,25).toString('latin1')}));
      if(bytes.length>0)fs.writeFileSync(path.join(outputDir,'failed-'+key+'-diagnostic.pdf'),bytes);
      throw Error('PDF blank or invalid for '+key);
    }
    const file='complete-'+key+'-personal-report.pdf';
    fs.writeFileSync(path.join(outputDir,file),bytes);
    const coverImage=await printer.command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    const png=Buffer.from(coverImage.data||'','base64');
    if(png.length<3500)throw Error('Complete PDF screenshot could not be captured');
    fs.writeFileSync(path.join(outputDir,'complete-'+key+'-report-preview.png'),png);

    // A new browser tab and cleared storage must successfully read the exported backup.
    await printer.evaluate("localStorage.clear();sessionStorage.clear();true");
    const fresh=await navigate(site+'/after-dark/');
    await fresh.evaluate("document.querySelector('#enter')?.click();true");
    const imported=await fresh.evaluate('('+verifyRealImport.toString()+')('+JSON.stringify(exports.privateJSON)+')');
    if(imported.restoredDirect!==69||imported.restoredPsych!==32)throw Error('Full private import verification failed');
    audit.push({...result,...prepared,file,pdfBytes:bytes.length,privateQuizImport:imported,
      selectivePartnerExport:{approvedInterests:exports.sharedInterests,privateAnswersIncluded:false,toysIncluded:false}});
    console.log('✓ Generated full fictional '+key+' report: '+result.direct+'+'+result.psych+' answers, '+prepared.themes+' themes, '+prepared.subConnections+' sub-connections, '+bytes.length+' bytes');
    await fresh.evaluate("localStorage.clear();sessionStorage.clear();true");
  }
  if(selectedFiles.length!==2)throw Error('A selective partner JSON file was not exported for each fictional user');
  const comparing=await navigate(site+'/after-dark/');
  await comparing.evaluate("document.querySelector('#enter')?.click();true");
  const merged=await comparing.evaluate('('+uploadAndCompare.toString()+')('+JSON.stringify(selectedFiles[0])+','+JSON.stringify(selectedFiles[1])+')');
  const compareImage=await comparing.command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(outputDir,'rowan-ellis-comparison-preview.png'),Buffer.from(compareImage.data,'base64'));
  const comparisonPrinter=await openIsolatedPrint(comparing,'#uc-results','print-unwrapped-comparison ad-entered');
  const mergedPDF=await comparisonPrinter.command('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,
    displayHeaderFooter:false,landscape:false,transferMode:'ReturnAsBase64'});
  const mergedBytes=Buffer.from(mergedPDF.data||'','base64');
  if(mergedBytes.length<6000||mergedBytes.subarray(0,5).toString()!=='%PDF-')
    throw Error('The real merged report did not produce a valid downloadable PDF');
  fs.writeFileSync(path.join(outputDir,'complete-rowan-ellis-comparison.pdf'),mergedBytes);
  if(testErrors.length)throw Error('Headless browser exceptions: '+testErrors.slice(-8).join(' | '));
  fs.writeFileSync(path.join(outputDir,'fictional-browser-journey-evidence.json'),JSON.stringify({
    generated:new Date().toISOString(),case:'Two actual 69+32 fictional quiz completions, exports/imports, selective partner upload, and combined report PDF',
    journeys:audit.map(x=>({name:x.key,complete:[x.direct,x.psych],import:x.privateQuizImport,
      safeSelectiveShare:x.selectivePartnerExport,pdfBytes:x.pdfBytes,reportThemes:x.themes,reportSubConnections:x.subConnections})),
    comparison:{...merged,pdfBytes:mergedBytes.length},
    evidenceFiles:['complete-rowan-personal-report.pdf','complete-ellis-personal-report.pdf',
      'complete-rowan-ellis-comparison.pdf','complete-rowan-report-preview.png',
      'complete-ellis-report-preview.png','rowan-ellis-comparison-preview.png']
  },null,2));
  console.log('✓ Two full 101-question journeys, actual JSON exports/imports, private partner exports, two-file upload and combined PDF passed.');
  fs.writeFileSync(path.join(outputDir,'fictional-full-quiz-audit.json'),JSON.stringify({description:'Entirely fictional people. Results calculated by the actual 101-question Unwrapped state bridges and report renderer.',reports:audit},null,2));
  if(audit.length!==2||audit.some(x=>x.direct!==69||x.psych!==32))throw Error('Full fictional journey tests failed');
} finally {
  proc.kill('SIGTERM');
  server.close();
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:150})}
  catch(error){console.warn('Chrome profile cleanup skipped:',error.message)}
}
