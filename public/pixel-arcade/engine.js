/* Random Candy Land Pixel Arcade: real walkable pixel scenes, keyboard/touch controls,
   interactive objects, dialogue and progression. No third-party engine or remote calls. */
(()=>{'use strict';
const W=384,H=216,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const $=(tag,className,content)=>{const el=document.createElement(tag);if(className)el.className=className;if(content!==undefined)el.textContent=content;return el};
const themes=[
 {sky:'#192747',wall:'#345477',floor:'#2b435b',top:'#7cc4d4',bright:'#f4d58a',accent:'#a3f5d5'},
 {sky:'#173f64',wall:'#3c6686',floor:'#31576d',top:'#9dd0ef',bright:'#f3d7a2',accent:'#8af4e0'},
 {sky:'#23234d',wall:'#52376b',floor:'#383653',top:'#ec9dc5',bright:'#ffd58b',accent:'#b6fff1'},
 {sky:'#4a3155',wall:'#735274',floor:'#483e57',top:'#e5a0a4',bright:'#ffdb93',accent:'#b9eae2'},
 {sky:'#182d46',wall:'#465376',floor:'#344860',top:'#c2bbf2',bright:'#ffdeaa',accent:'#a1e9e6'}
];
function create(config){
 const shell=$('section','pixel-arcade-screen');
 shell.id=config.id+'-arcade';shell.setAttribute('aria-label',config.title+' playable pixel game');
 const top=$('div','pixel-arcade-header');
 const name=$('div','pixel-arcade-brand');name.append($('strong','',config.title),$('small','',config.tagline||'PIXEL ADVENTURE'));
 const exit=$('a','pixel-arcade-exit','← Candy Land');exit.href='/';
 const detail=$('button','pixel-arcade-details','📖 More / Academy');detail.type='button';
 top.append(name,exit,detail);
 const panel=$('div','pixel-arcade-panel'),hud=$('div','pixel-arcade-hud');
 const level=$('strong','pixel-arcade-level','Starting world…'),score=$('span','pixel-arcade-score','0/5');
 hud.append(level,score);
 const stage=$('div','pixel-arcade-stage');
 const canvas=$('canvas','pixel-arcade-canvas');canvas.width=W;canvas.height=H;canvas.tabIndex=0;
 canvas.setAttribute('aria-label','Walkable pixel world. Use arrows, WASD, or tap an object to walk and interact.');
 const prompt=$('div','pixel-arcade-prompt','Move with arrows / WASD or tap an object');
 stage.append(canvas,prompt);
 const message=$('div','pixel-arcade-message');
 const speaker=$('strong','pixel-arcade-speaker','GUIDE');
 const speech=$('p','pixel-arcade-speech','Move toward glowing objects to investigate.');
 message.append(speaker,speech);
 const actions=$('div','pixel-arcade-actions');actions.setAttribute('role','group');actions.setAttribute('aria-label','Current decisions');
 const controls=$('div','pixel-arcade-controls');
 const pad=$('div','pixel-arcade-pad');
 for(const [dir,label] of [['up','▲'],['left','◀'],['down','▼'],['right','▶']]){
   const b=$('button','pixel-arcade-pad-'+dir,label);b.type='button';b.dataset.move=dir;b.setAttribute('aria-label','Move '+dir);
   pad.append(b);
 }
 const actButton=$('button','pixel-arcade-interact','✦ INTERACT');actButton.type='button';
 const help=$('span','pixel-arcade-help','Arrows / WASD · E to interact · tap objects');
 controls.append(pad,actButton,help);
 panel.append(hud,stage,message,actions,controls);
 const foot=$('div','pixel-arcade-foot');foot.textContent='FICTIONAL SIMULATION · progress stays in this browser';
 shell.append(top,panel,foot);
 const restore=$('button','pixel-arcade-restore','🎮 Return to pixel game');restore.type='button';
 document.body.append(shell,restore);
 let scene={title:'',objects:[],environment:0},avatar={x:185,y:172,face:0,step:0},destination=null;
 let last=0,active=true,dialogButtons=[],lastInteraction=0,frame=0,moving=new Set(),raf=0;
 const ctx=canvas.getContext('2d',{alpha:false});
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))};
 const text=(label,x,y,c='#fff',size=8,align='center')=>{
   ctx.font='bold '+size+'px monospace';ctx.textAlign=align;ctx.textBaseline='middle';
   ctx.fillStyle='#0b122a';ctx.fillText(label,x+1,y+1);
   ctx.fillStyle=c;ctx.fillText(label,x,y);
 };
 function person(x,y,coat='#6bdfbd',phase=0,hat=false){
   x=Math.round(x);y=Math.round(y);
   rect(x-6,y+2,13,3,'#101a35'); // shadow
   rect(x-3,y-2+(phase?1:0),3,6,'#14213a');rect(x+2,y-2+(phase?0:1),3,6,'#14213a');
   rect(x-7,y-16,14,14,coat);rect(x-9,y-14,3,8,'#f0bc91');rect(x+7,y-14,3,8,'#f0bc91');
   rect(x-5,y-25,10,10,'#e6bb93');rect(x-5,y-25,10,3,'#3b2944');
   rect(x-2,y-20,2,2,'#1a203e');rect(x+3,y-20,2,2,'#1a203e');
   if(hat){rect(x-8,y-29,16,4,'#1b273f');rect(x-5,y-34,10,7,'#2a4062');rect(x-4,y-30,8,2,'#e6cd7b')}
 }
 function building(x,y,w,h,col,p){
   rect(x,y,w,h,col);rect(x+3,y+3,w-6,3,p.top);
   for(let wy=y+10;wy<y+h-5;wy+=12)for(let wx=x+7;wx<x+w-7;wx+=12){
    rect(wx,wy,5,7,(wx+wy+frame%600)%3<1?'#335271':p.bright);
   }
 }
 function sceneArt(now){
   const p=themes[scene.environment%themes.length];
   rect(0,0,W,H,p.sky);
   const twinkle=Math.floor(now/750)%3;
   for(let i=0;i<16;i++){const x=(i*43+scene.environment*13)%W,y=(i*19+scene.environment*7)%62;if(i%3===twinkle)rect(x,y,2,2,'#cbf5f6')}
   rect(0,62,W,110,p.wall);rect(0,170,W,46,p.floor);
   for(let y=180;y<H;y+=16)for(let x=(y%32?0:8);x<W;x+=32){rect(x,y,30,1,'#53647b');rect(x,y,1,14,'#20364c')}
   // Buildings and landscape are composed entirely of deliberate low-res tiles.
   const theme=scene.environment%5;
   if(theme===0){building(10,38,86,93,'#263c5c',p);building(286,34,89,96,'#254465',p);
    rect(113,42,157,91,'#49667c');rect(125,54,132,12,p.top);rect(152,77,76,36,'#1c314f');text('METRO',189,60,'#163047',11)}
   else if(theme===1){rect(0,98,W,72,'#226181');for(let y=106;y<166;y+=11)for(let x=0;x<W;x+=25)rect((x+now/120|0)%W,y,13,2,'#419fba');
    rect(16,69,144,32,'#86694d');rect(18,70,140,4,'#d4ba82');building(267,46,107,65,'#30577a',p);
    rect(130,106,120,7,'#b28b5e');rect(179,95,9,65,'#7b624e')}
   else if(theme===2){building(14,40,99,95,'#482e62',p);building(271,40,99,95,'#4b326c',p);
    rect(137,49,110,94,'#302853');rect(149,66,85,43,'#8c408a');text('ARCADE',192,59,'#f5bdff',12);rect(159,79,65,27,'#152b4b');text('PLAY',193,90,'#96e2f4',12)}
   else if(theme===3){building(10,52,112,92,'#79566c',p);building(268,51,110,94,'#765b68',p);
    rect(126,63,138,61,'#9a7261');rect(133,66,125,10,'#e9bc96');rect(141,83,52,35,'#67485d');rect(203,83,47,35,'#67485d');text('MARKET',195,74,'#37314d',10)}
   else{building(5,48,106,102,'#35486e',p);building(278,45,102,100,'#36486e',p);
    rect(126,67,133,83,'#676281');rect(137,75,113,5,'#c3a6ba');rect(165,36,49,35,'#656182');
    rect(176,46,25,22,'#d0b9a4');rect(188,48,2,20,'#433c64');rect(188,56,9,2,'#433c64');text('CLOCK',191,86,'#f2e0c7',9)}
   // Walkable foreground trees, street lamps, and benches.
   for(let i=0;i<4;i++){const x=25+i*105;rect(x,151,4,30,'#3f4e57');rect(x-8,145,20,12,i%2?'#30918f':'#3d956f');rect(x-5,138,14,9,'#55b69c')}
   rect(164,153,56,5,'#a67e65');rect(170,158,3,10,'#785a53');rect(213,158,3,10,'#785a53');
   // City guide NPC.
   person(193,151,p.bright,0,true);
 }
 function itemArt(item,now){
   const color=scene.accent||themes[scene.environment%5].accent;
   let x=Math.round(item.x),y=Math.round(item.y);
   const r=7+Math.sin(now/330+(x%4))*1.5;
   rect(x-10,y-16,20,19,'#122241');rect(x-9,y-18,18,3,color);
   if(item.type==='folder'||item.type==='document'){rect(x-8,y-12,16,11,'#f9d38b');rect(x-5,y-15,9,4,'#e9b96c');rect(x-4,y-8,8,2,'#715b59')}
   else if(item.type==='screen'){rect(x-8,y-13,16,11,'#5fe0c3');rect(x-6,y-11,12,7,'#2b6b8b');rect(x-3,y-3,6,3,'#e4d8a9')}
   else if(item.type==='photo'){rect(x-8,y-12,16,12,'#f2dce4');rect(x-6,y-10,12,8,'#8cb5cb');rect(x-5,y-4,9,2,'#2e6e78')}
   else if(item.type==='desk'){rect(x-13,y-8,26,6,'#dbac74');rect(x-11,y-2,3,7,'#715146');rect(x+9,y-2,3,7,'#715146');rect(x-5,y-12,9,4,color)}
   else if(item.type==='ballot'){rect(x-9,y-13,18,13,'#aab5df');rect(x-5,y-16,10,6,'#f4db96');rect(x-5,y-6,11,3,'#506285')}
   else{rect(x-9,y-13,18,14,'#f1c985');rect(x-5,y-11,9,3,'#8dbdd3')}
   // Animated interaction sparkle and clue marker.
   rect(x-13,y-23,3,3,color);rect(x+10,y-21,2,2,color);
   if(Math.sin(now/240+x)>0){rect(x-1,y-30,3,5,'#ffefb0');rect(x-5,y-26,11,2,'#ffefb0')}
   text((item.short||item.label||'CLUE').slice(0,17).toUpperCase(),x,y+14,'#effcf5',7);
   if(item.done)text('✓',x+15,y-15,'#acffe0',12);
 }
 function paint(now){
   ctx.imageSmoothingEnabled=false;
   sceneArt(now);
   for(const item of scene.objects||[])itemArt(item,now);
   // Character animated walk cycle, actual game avatar.
   person(avatar.x,avatar.y,'#ef9ec6',Math.floor(avatar.step/7)%2===0?0:1,true);
   text('YOU',avatar.x,avatar.y-40,'#fff9ce',8);
   const nearest=nearObject();
   if(nearest&&distance(avatar,nearest)<31){
    rect(nearest.x-19,nearest.y-47,38,10,'#0f1f38');text('E  TALK',nearest.x,nearest.y-42,'#ffec9c',7);
   }
 }
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function nearObject(){let best=null,d=1e9;for(const o of scene.objects||[]){const nd=distance(avatar,o);if(nd<d){d=nd;best=o}}return best}
 function interactItem(o){if(!o||!active)return;destination=null;lastInteraction=performance.now();config.onInteract?.(o,api)}
 function approach(o){if(!o)return;destination={x:clamp(o.x-14,24,W-24),y:clamp(o.y+18,105,H-9),object:o};prompt.textContent='Walking to '+o.label+'…'}
 function step(now){
   const dt=clamp((now-(last||now))/1000,0,.05);last=now;frame++;
   if(active){
    let vx=0,vy=0;
    if(moving.has('left'))vx--;if(moving.has('right'))vx++;
    if(moving.has('up'))vy--;if(moving.has('down'))vy++;
    if(vx||vy)destination=null;
    else if(destination){const dx=destination.x-avatar.x,dy=destination.y-avatar.y,d=Math.hypot(dx,dy);
      if(d<4){avatar.x=destination.x;avatar.y=destination.y;const item=destination.object;destination=null;interactItem(item)}
      else{vx=dx/d;vy=dy/d}
    }
    if(vx||vy){const mag=Math.hypot(vx,vy);avatar.x=clamp(avatar.x+vx/mag*115*dt,18,W-18);avatar.y=clamp(avatar.y+vy/mag*115*dt,111,H-12);avatar.step++}
    paint(now);
   }
   raf=requestAnimationFrame(step);
 }
 function setWorld(obj){
   scene={title:obj.title||'',objects:obj.objects||[],environment:obj.environment||0,accent:obj.accent};
   level.textContent=obj.title||config.title;
   score.textContent=obj.score||'';
   avatar={x:188,y:190,face:0,step:0};destination=null;
   prompt.textContent='Tap a glowing object or move with the controls';
   if(obj.message)tell('GUIDE',obj.message);
   canvas.focus({preventScroll:true});
 }
 function tell(who,message,choices=[]){
   speaker.textContent=String(who||'GUIDE').toUpperCase();
   speech.textContent=String(message||'');
   actions.replaceChildren();dialogButtons=[];
   for(const choice of choices){
    const b=$('button','pixel-arcade-choice',choice.label);b.type='button';b.disabled=Boolean(choice.disabled);
    b.addEventListener('click',()=>choice.action?.());actions.append(b);dialogButtons.push(b);
   }
 }
 function nearestAction(){const o=nearObject();if(o){if(distance(avatar,o)<35)interactItem(o);else approach(o)}}
 actButton.addEventListener('click',nearestAction);
 const directions=['up','down','left','right'];
 for(const b of pad.querySelectorAll('button')){
   const d=b.dataset.move;
   const start=e=>{e.preventDefault();moving.add(d);canvas.focus({preventScroll:true})};
   const stop=e=>{e?.preventDefault();moving.delete(d)};
   b.addEventListener('pointerdown',start);b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);
   b.addEventListener('pointerleave',stop);
   b.addEventListener('click',e=>{if(e.detail===0){moving.add(d);setTimeout(()=>moving.delete(d),180)}});
 }
 window.addEventListener('keydown',e=>{
   if(!active||e.target.matches('input,textarea,select'))return;
   const mapping={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
   const dir=mapping[e.code];if(dir){moving.add(dir);e.preventDefault()}
   else if(e.code==='KeyE'||e.code==='Space'){nearestAction();e.preventDefault()}
 });
 window.addEventListener('keyup',e=>{const m={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};if(m[e.code])moving.delete(m[e.code])});
 window.addEventListener('blur',()=>moving.clear());
 canvas.addEventListener('pointerdown',e=>{
   if(!active)return;
   const bb=canvas.getBoundingClientRect(),x=(e.clientX-bb.left)/bb.width*W,y=(e.clientY-bb.top)/bb.height*H;
   let best=null,d=50;
   for(const item of scene.objects||[]){const di=Math.hypot(x-item.x,y-item.y);if(di<d){d=di;best=item}}
   if(best){if(distance(avatar,best)<30)interactItem(best);else approach(best)}
   else if(y>=105){destination={x:clamp(x,18,W-18),y:clamp(y,111,H-12)}}
 });
 function showDetail(){
   active=false;moving.clear();shell.hidden=true;restore.hidden=false;document.body.classList.remove('pixel-arcade-active');window.scrollTo(0,0);
 }
 function showGame(){
   active=true;shell.hidden=false;restore.hidden=true;document.body.classList.add('pixel-arcade-active');last=performance.now();config.onResume?.(api);
 }
 detail.addEventListener('click',showDetail);restore.addEventListener('click',showGame);
 restore.hidden=true;document.body.classList.add('pixel-arcade-active');
 const api=Object.freeze({setWorld,tell,showGame,showDetail,
  state:()=>({title:scene.title,environment:scene.environment,objects:scene.objects.map(x=>({...x})),player:{x:avatar.x,y:avatar.y},active}),
  clickObject:i=>approach(scene.objects[i]),interactIndex:i=>interactItem(scene.objects[i]),
  setScore:value=>score.textContent=value,
  setPrompt:value=>prompt.textContent=value,
  canvas});
 raf=requestAnimationFrame(step);
 return api;
}
window.PixelWorld=Object.freeze({create});
})();