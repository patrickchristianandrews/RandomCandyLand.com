/* Single-stage, phone-first AI Academy router. Preserves course state, challenges and prompt builder. */
(()=>{'use strict';
 const body=document.body,course=window.AIAcademyCourse;
 const sections={lesson:document.getElementById('lessonZone'),showdown:document.getElementById('prompt-showdown'),coach:document.getElementById('prompt-coach'),builder:document.getElementById('prompt-builder'),progress:document.getElementById('academyProgressPanel')};
 const views=Object.keys(sections),labels={
  lesson:['Learn one useful skill','A short explanation, one example and a single skill-check question.'],
  showdown:['Compare prompts','Spot the differences between vague and specific instructions.'],
  coach:['Practice with feedback','Write a prompt and get an immediate five-point checklist.'],
  builder:['Build a reusable prompt','Answer a few short questions and take the result to Random AI.'],
  progress:['Your learning progress','Review your progress, export a copy or reset the journey.']
 };
 const nav=document.getElementById('academyFlow'),picker=document.getElementById('academyLessonPicker');
 const pickerBody=document.getElementById('academyLessonPickerBody'),courseNav=document.getElementById('courseNav');
 if(!nav||!courseNav||!course||views.some(v=>!sections[v]))return;
 pickerBody.append(courseNav);const smallTrack=document.createElement('div');smallTrack.className='academy-course-progress';
 smallTrack.append(document.getElementById('courseProgressBar').parentElement,document.getElementById('courseProgressText'));pickerBody.prepend(smallTrack);
 let selected='lesson';try{const saved=sessionStorage.getItem('rcl-academy-view');if(views.includes(saved))selected=saved}catch{}
 function scrollToPanel(){nav.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}
 function select(view,scroll=false){
  if(!views.includes(view))return;
  selected=view;
  for(const [key,node] of Object.entries(sections)){node.hidden=key!==view;node.classList.toggle('academy-active-section',key===view)}
  document.querySelectorAll('[data-academy-view]').forEach(b=>{const on=b.dataset.academyView===view;b.classList.toggle('selected',on);if(on)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  document.getElementById('academyFlowSummary').textContent=labels[view][1];
  nav.querySelector('h2').textContent=labels[view][0];
  const idx=views.indexOf(view),back=document.getElementById('academyFlowBack'),next=document.getElementById('academyFlowNext');
  back.disabled=idx===0;next.disabled=idx===views.length-1;
  next.textContent=idx===views.length-2?'See my progress →':'Continue →';
  picker.hidden=view!=='lesson';
  if(view!=='lesson')picker.open=false;
  try{sessionStorage.setItem('rcl-academy-view',view)}catch{}
  if(scroll)scrollToPanel();
 }
 document.querySelectorAll('[data-academy-view]').forEach(btn=>btn.addEventListener('click',()=>select(btn.dataset.academyView,true)));
 document.getElementById('academyFlowBack').addEventListener('click',()=>select(views[Math.max(0,views.indexOf(selected)-1)],true));
 document.getElementById('academyFlowNext').addEventListener('click',()=>select(views[Math.min(views.length-1,views.indexOf(selected)+1)],true));
 picker.addEventListener('click',e=>{if(e.target.closest('[data-lesson]')){picker.open=false;select('lesson',true)}});
 document.addEventListener('academy:lesson',update);
 function update(){
  const stat=course.stats();
  document.getElementById('academyFlowCount').textContent=stat.completed+' / '+stat.total;
  const bar=document.getElementById('courseProgressBar');if(bar)bar.style.width=Math.round(stat.completed/stat.total*100)+'%';
 }
 body.classList.add('academy-flow-live');
 // The start button uses the existing course logic; the lesson picker handles jumping.
 document.getElementById('continueCourse')?.addEventListener('click',()=>select('lesson',true));
 const hash=location.hash.slice(1);if(hash==='prompt-showdown')selected='showdown';else if(hash==='prompt-coach')selected='coach';else if(hash==='prompt-builder')selected='builder';
 select(selected);update();
 // Direct navigation to a practice panel is supported from the old links.
 window.AIAcademyFlow=Object.freeze({select,views:views.slice(),current:()=>selected});
})();