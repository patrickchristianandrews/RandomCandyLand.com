/* Four clear Unwrapped report paths. No personal data transmission or new text entry. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const onReady=()=>{
  const host=$('uw-report-paths'),status=$('uw-report-path-status');
  if(!host||!status)return;
  function tab(id){
   const visible=document.querySelector('.tab.visible');
   if(visible?.id===id)return;
   const button=document.querySelector('#od-ribbon-nav [data-tab="'+id+'"]')||
     document.querySelector('#home [data-tab="'+id+'"]');
   if(button)button.click();
   else {
    document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('visible',x.id===id));
    if(location.hash.slice(1)!==id)history.replaceState(null,'','#'+id);
   }
  }
  function goTo(id){
   const el=$(id);
   if(el)requestAnimationFrame(()=>requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'smooth'})));
  }
  const progress=()=>window.AfterDarkProgressTransfer?.progress?.()||null;
  const hasAnswers=()=>{
   const p=progress();
   if(p)return Number(p.direct?.answered||0)+Number(p.psych?.answered||0)>0;
   const data=window.AfterDarkCanonicalReport?.buildData?.();
   return Number(data?.psych?.answered||0)+Number(data?.direct?.answered||0)>0;
  };
  const hasPsych=()=>{
   const p=progress();
   if(p)return Number(p.psych?.answered||0)>0;
   return Number(window.AfterDarkCanonicalReport?.buildData?.()?.psych?.answered||0)>0;
  };
  function message(text){status.textContent=text;}
  function open(type){
   tab('notebook');
   if(type==='personal'){
    message(hasAnswers()?'Your personal report is generated from the quizzes. Select View my personal report below to see it or save it as PDF.':'Start either quiz first, or import your previously saved quiz answers below. Your report is written automatically.');
    goTo('uw-personal-workflow');return;
   }
   if(type==='partner'){
    if(!hasAnswers()){message('Answer at least one quiz question to create a report for your current partner. There is no additional biography to write.');goTo('uw-report-paths');return;}
    const direct=$('uw-existing-partner-report');
    if(direct&&window.AfterDarkPartnerPDF?.mount){
     window.AfterDarkPartnerPDF.mount(direct);
     message('Your partner report is built from your quiz results. Select only the sections you want your partner to read, then preview and save as PDF.');
     goTo('uw-existing-partner-report');
    }else{message('The partner report is not available on this version of the page. Use your quiz results to access it.');goTo('uw-report-paths')}
    return;
   }
   if(type==='prospective'){
    if(!hasPsych()){
     message('To introduce your everyday personality and communication style, take the Psychology Quiz first. No writing or profile forms are required. The Sexual Preferences Quiz is optional for intimate details.');
     goTo('uw-report-paths');return;
    }
    window.AfterDarkNewPartnerReport?.mount?.();
    // The report's own generator refreshes current choices when the report tab opens.
    if(window.AfterDarkNewPartnerReport?.preview){
     window.AfterDarkNewPartnerReport.preview();
     message('Generated from your Psychology Quiz answers. Review your introduction below; intimate details and toy topics stay OFF until you deliberately include them.');
     goTo('new-partner-report');
    }else{
     message('This version could not load the automatic prospective-partner report. Please do not enter an extra biography.');
     goTo('uw-report-paths');
    }
    return;
   }
   if(type==='combined'){
    const exportDetails=$('uc-export');
    message('For a two-person report, each person first exports a consent-selected report file from their quiz results. Import both selected files below to compare your shared answers and communication needs.');
    if(exportDetails&&hasAnswers())exportDetails.open=true;
    goTo('uc-comparison');
   }
  }
  document.addEventListener('click',event=>{
   const control=event.target.closest('[data-report-path]');
   if(!control)return;
   const type=control.dataset.reportPath;
   if(!['personal','partner','prospective','combined'].includes(type))return;
   open(type);
  });
  window.UnwrappedReportPaths=Object.freeze({open});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',onReady,{once:true});else onReady();
})();