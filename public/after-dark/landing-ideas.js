/* Landing shortcut for the public, standalone Unwrapped random generator.
 * No profile, quiz, stored answers, or uploads are accessed. */
(()=>{
 'use strict';
 const ready=()=>{
  const source=document.getElementById('uw-home-freak');
  const output=document.getElementById('uw-home-freak-label');
  if(!source||!output)return;
  const update=()=>{output.value=String(source.value)+' / 10';output.textContent=output.value};
  source.addEventListener('input',update);
  update();
  document.querySelectorAll('[data-idea-launch]').forEach(button=>{
   button.addEventListener('click',()=>{
    if(button.dataset.ideaLaunch!=='full')return;
    // Use the existing application's real section navigation.
    const toIdeas=document.querySelector('#od-ribbon-nav [data-tab="ideas"]')
      ||document.querySelector('#home [data-tab="ideas"]');
    if(toIdeas)toIdeas.click();
    else document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('visible',tab.id==='ideas'));
    const level=document.getElementById('freak-level');
    if(level){level.value=source.value;level.dispatchEvent(new Event('input',{bubbles:true}))}
    const mood=document.getElementById('mood');
    if(mood)mood.value='any';
    // A single action always creates one full random combination without quiz inputs.
    if(typeof window.UnwrappedFreakPicker?.generate==='function')window.UnwrappedFreakPicker.generate();
    else document.getElementById('drawIdea')?.click();
    requestAnimationFrame(()=>document.getElementById('ideaResult')?.scrollIntoView({block:'start',behavior:'smooth'}));
   });
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
