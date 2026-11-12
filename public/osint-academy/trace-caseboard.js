/* TRACE Detective Board 2.0: evidence connections, source provenance,
 * readable microcopy and an optional narrative-first board. No network access. */
(()=>{'use strict';
const A=()=>window.TraceArcade; if(!A())return;
const connections=[[0,1],[0,1],[0,2],[1,2],[0,1]];
const captions=[
 'Compare the viral crop with the current train schedule',
 'Match the social image against the dated archive',
 'Compare the account name with the platform naming rules',
 'Check the suspicious address against the agency’s official portal',
 'Cross-check the official calendar with the broadcast'
];
const icons=['◉','⌕','✦'];
let level=-1,chosen=[],linked=false,wrong=0;
const make=(tag,cl,text)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(text!==undefined)x.textContent=text;return x};
const dlg=make('section','trace-board-modal');
dlg.id='trace-evidence-board';
dlg.hidden=true;dlg.tabIndex=-1;dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','TRACE detective evidence board');
const screen=make('div','trace-board-screen');
const top=make('header','trace-board-top');
const heading=make('div','trace-board-heading');
heading.append(make('small','', 'DETECTIVE TOOLKIT / EVIDENCE WALL'),make('h2','', 'Connect the dots'));
const close=make('button','trace-board-close','✕ Return to scene');close.type='button';close.addEventListener('click',hide);
top.append(heading,close);
const hint=make('p','trace-board-hint','Find two clues that can test the central claim.');
const board=make('div','trace-board-grid');
const status=make('div','trace-board-status','Choose two pieces of evidence to connect.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const footer=make('div','trace-board-footer');
const guide=make('button','trace-board-guide','💡 Investigator hint');
const verify=make('button','trace-board-verify','📋 Verify the best source');verify.disabled=true;
const badge=make('span','trace-board-badge','0 / 2 connected');
footer.append(guide,verify,badge);
const citation=make('p','trace-board-note','Fictional exercise: compare source provenance, not people’s private information.');
screen.append(top,hint,board,status,footer,citation);dlg.append(screen);
document.body.append(dlg);
function refresh(){
 const a=A();if(!a)return;
 const state=a.state(),cases=a.cases(),c=cases[state.caseIndex];
 if(level!==state.caseIndex){level=state.caseIndex;chosen=[];linked=false;wrong=0;}
 hint.textContent=linked?'Connection established. Check which source can support the claim.':'CASE '+(level+1)+' · '+c.brief;
 badge.textContent=linked?'✓ CONNECTION MADE':chosen.length+' / 2 selected';
 board.replaceChildren();
 c.objects.forEach((obj,i)=>{
  const key=make('button','trace-evidence-node'+(chosen.includes(i)?' selected':'')+(linked&&connections[level].includes(i)?' linked':''));
  key.type='button';key.dataset.evidence=String(i);key.setAttribute('aria-pressed',String(chosen.includes(i)));
  const pin=make('span','trace-evidence-pin',icons[i]||'✦');
  const image=make('span','trace-evidence-visual',obj[0]);
  const label=make('strong','',obj[1]);
  const brief=make('small','',obj[2].length>115?obj[2].slice(0,112)+'…':obj[2]);
  key.append(pin,image,label,brief);
  key.addEventListener('click',()=>select(i));
  board.append(key);
 });
 verify.disabled=!linked;
 if(linked){status.textContent='✓ Nice work. '+captions[level]+'.'}
 else if(chosen.length===1)status.textContent='One clue pinned. Select another to test a connection.';
 else status.textContent='Pin two related records. There is no timer.';
}
function select(i){
 if(linked)return;
 if(chosen.includes(i)){chosen=chosen.filter(x=>x!==i);refresh();return}
 chosen.push(i);
 if(chosen.length<2){refresh();return}
 const wanted=connections[level],right=wanted.every(x=>chosen.includes(x));
 if(right){
   linked=true;
   refresh();
   status.textContent='🔎 SOLVED: '+captions[level]+'. Great detective work.';
 }else{
   wrong++;
   chosen=[];
   refresh();
   status.textContent='Not quite. Those records do not directly test the key claim. Compare dates, identities, or the original source.';
 }
}
function hide(){dlg.hidden=true;document.body.classList.remove('trace-board-open');document.querySelector('#trace-arcade canvas')?.focus({preventScroll:true})}
function open(){
 const a=A();if(!a||a.state().found.length<3)return false;
 refresh();dlg.hidden=false;document.body.classList.add('trace-board-open');dlg.focus({preventScroll:true});return true;
}
function reset(){level=-1;chosen=[];linked=false;wrong=0;hide()}
guide.addEventListener('click',()=>{
 const snippets=[
  'A cropped screenshot is missing context. Can you find the current source?',
  'An image’s upload date and original capture date can differ.',
  'Matching handles alone cannot establish ownership.',
  'A lookalike address should be checked against a known official portal.',
  'A dated meeting record does not prove every claimed attendee.'
 ];
 status.textContent='💡 '+snippets[level>=0?level:0];
});
verify.addEventListener('click',()=>{if(!linked)return;hide();A()?.sourceChallenge?.()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dlg.hidden)hide()});
window.TraceCaseBoard=Object.freeze({open,close:hide,reset,state:()=>({level,chosen:[...chosen],linked,wrong,visible:!dlg.hidden})});
})();