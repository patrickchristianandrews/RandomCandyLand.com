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
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'--remote-allow-origins=*','about:blank'],{stdio:'ignore'});
const testErrors=[];
let browserPort=0;
try{
  for(let i=0;i<60;i++){
    const f=path.join(profile,'DevToolsActivePort');
    if(fs.existsSync(f)){browserPort=+fs.readFileSync(f,'utf8').split('\n')[0];break;}
    await delay(150);
  }
  if(!browserPort)throw Error('Chrome did not open DevTools port');
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
 const connectionRows=report.querySelectorAll('.report-cross-matrix tbody tr').length;
 const subConnections=report.querySelectorAll('.report-cross-pair-table tbody tr').length;
 const topics=report.querySelectorAll('.report-cross-topic').length;
 if(connectionRows<5||subConnections<5||topics<2)throw Error('Incomplete theme connections and evidence');
 const cover=report.querySelector('.report-cover')||report;
 const caption=document.createElement('div');caption.className='report-demo-caption';
 const bold=document.createElement('strong');bold.textContent='FICTIONAL DEMONSTRATION · NOT A REAL PERSON';
 const summary=document.createElement('p');summary.textContent=p.profile.label+' · 69 preference answers + 32 everyday psychology answers. '+p.profile.description;
 caption.append(bold,summary);cover.insertBefore(caption,cover.firstChild);
 const main=document.createElement('main');main.id='print-document';main.append(report);
 const style=document.createElement('style');
 style.textContent=`@page{size:A4;margin:13mm 12mm}html,body{background:#fff!important;color:#382643!important}body.print-notebook.print-detailed-report #print-document{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;display:block!important}#print-document .report-demo-caption{padding:13px 16px;margin:0 0 19px;border:2px solid #b384ae;border-radius:10px;color:#553361;background:#f8eff8}#print-document .report-demo-caption strong{font:850 13px system-ui,sans-serif}#print-document .report-demo-caption p{font:600 11px/1.5 system-ui,sans-serif;margin:7px 0 0}#print-document details{display:block!important}#print-document .report-section{break-inside:auto!important}#print-document .report-cross-topic-lens{break-inside:avoid!important}#print-document table{break-inside:auto!important}#print-document tr{break-inside:avoid!important}`;
 document.head.append(style);
 document.body.className='print-notebook print-detailed-report ad-entered';document.body.replaceChildren(main);
 for(const detail of main.querySelectorAll('.report-deep-connections details'))detail.open=true;
 window.scrollTo(0,0);
 return{themes:connectionRows,subConnections,topics,htmlLength:report.outerHTML.length,complete:/69\s*\/\s*69/.test(report.textContent)};
}

  const site='http://127.0.0.1:'+port;
  const outputDir=path.join(root,'after-dark','report-samples');
  fs.mkdirSync(outputDir,{recursive:true});
  const audit=[];
  for(const key of ['rowan','ellis']){
    const demo=await navigate(site+'/after-dark/');
    const ready=await demo.evaluate("Boolean(window.AfterDarkAdultQuiz?.length===69&&window.AfterDarkPsychologyQuiz?.length===32&&window.AfterDarkDirectQuizBridge?.importState&&window.AfterDarkPsychQuizBridge?.importState&&window.AfterDarkDetailedReport?.build&&window.UnwrappedReportConnections?.build)");
    if(!ready)throw Error('Cannot generate '+key+' PDF: real quizzes or report renderer did not load');
    await demo.evaluate("document.querySelector('#enter')?.click()");
    await demo.evaluate("new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/after-dark/fictional-respondents.js';s.onload=()=>resolve(true);s.onerror=()=>reject(Error('Fictional test responders failed to load'));document.head.append(s)})");
    const result=await demo.evaluate('('+fictionalProfile.toString()+')('+JSON.stringify(key)+')');
    if(result.direct!==69||result.psych!==32||result.sharedThemes<2||result.chosenInterests<2)
      throw Error('Actual combined quiz engine returned incomplete result '+key+': '+JSON.stringify(result));
    const prepared=await demo.evaluate('('+preparePrintableReport.toString()+')()');
    if(!prepared.complete)throw Error('Export omits full-quiz completion evidence: '+key);
    await delay(300);
    const printed=await demo.command('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,landscape:false,transferMode:'ReturnAsBase64'});
    const bytes=Buffer.from(printed.data||'','base64');
    if(bytes.length<10000||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('PDF blank or invalid for '+key);
    const file='complete-'+key+'-personal-report.pdf';
    fs.writeFileSync(path.join(outputDir,file),bytes);
    audit.push({...result,...prepared,file,pdfBytes:bytes.length});
    console.log('✓ Generated full fictional '+key+' report: '+result.direct+'+'+result.psych+' answers, '+prepared.themes+' themes, '+prepared.subConnections+' sub-connections, '+bytes.length+' bytes');
    await demo.evaluate("localStorage.clear();sessionStorage.clear();true");
  }
  fs.writeFileSync(path.join(outputDir,'fictional-full-quiz-audit.json'),JSON.stringify({description:'Entirely fictional people. Results calculated by the actual 101-question Unwrapped state bridges and report renderer.',reports:audit},null,2));
  if(audit.length!==2||audit.some(x=>x.direct!==69||x.psych!==32))throw Error('Full fictional journey tests failed');
} finally {
  proc.kill('SIGTERM');
  server.close();
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:12,retryDelay:150})}
  catch(error){console.warn('Chrome profile cleanup skipped:',error.message)}
}
