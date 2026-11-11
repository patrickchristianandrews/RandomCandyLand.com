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
   const civic=scene.genre==='civic',p=themes[scene.environment%themes.length];
   const theme=scene.environment%5,t=Math.floor(now/300),night=civic&&scene.mood==='years';
   const bl=(x,y,w,h,c)=>rect(x,y,w,h,c);
   // Fully hand-pixelled room scenes (no emoji backdrops, HTML cards or stock art).
   bl(0,0,W,H,civic?(night?'#141c38':'#272a51'):p.sky);
   const glow=(x,y,color)=>{bl(x-3,y-3,8,7,'#263251');bl(x-1,y-1,4,3,color);bl(x,y-6,2,3,color)};
   for(let i=0;i<34;i++){
     let x=(i*53+theme*47)%W,y=(i*31+theme*13)%86;
     bl(x,y,1+(i%5===0?1:0),1,i%4===t%4?'#ddf5ec':'#879eb0');
   }
   // Distant architecture and parallax atmosphere.
   for(let i=0;i<14;i++){
     const x=i*30-4,h=24+((i*17+theme*11)%40);
     bl(x,102-h,28,h+8,i%2?'#213352':'#293e5e');
     for(let j=0;j<3;j++)bl(x+4+j*8,110-h+8,4,7,(i+j)%3===0?'#e5c990':'#345476');
   }
   if(civic){
     // City Hall - navigable senate chamber, dias, three policy desks and advisors.
     bl(0,0,W,126,night?'#292b50':'#364570');
     for(let i=0;i<6;i++){
       const x=i*72-12;bl(x,0,30,125,'#283353');bl(x+6,8,18,99,'#687694');
       bl(x+10,13,9,83,'#7886a3');bl(x,106,32,13,'#293754');
     }
     bl(84,28,218,90,'#475d7b');bl(93,32,200,8,'#d9c38e');
     bl(118,45,148,55,'#29455e');bl(137,48,108,35,'#5d7a89');bl(145,51,92,4,'#a6c8c7');
     bl(166,40,52,9,'#d2bd8b');bl(185,28,12,11,'#d6b9a4');bl(187,16,8,13,'#ded8c9');
     for(let i=0;i<3;i++){const x=149+i*35;bl(x,63,23,19,'#21425b');bl(x+4,66,15,13,'#b7cec1')}
     // Presidential seal / civic crest
     bl(183,84,18,19,'#b5b0a2');bl(187,88,10,11,'#365578');bl(190,88,4,11,'#ead39b');
     bl(0,116,W,100,night?'#303652':'#42526c');
     for(let y=116;y<H;y+=16)for(let x=(y%32?8:0);x<W;x+=32){
       bl(x,y,30,14,((x+y)/16)%3===0?'#4d5f77':'#3e4f69');
       bl(x,y,30,1,'#5c6c85');bl(x, y,1,14,'#30415e');
     }
     // Central aisle and senate carpet.
     bl(169,117,47,99,'#6f425f');bl(175,117,35,99,'#8b5065');
     for(let y=120;y<H;y+=24){bl(175,y,35,2,'#b17c83')}
     bl(172,116,3,100,'#e5bc84');bl(210,116,3,100,'#e5bc84');
     // Policy signs at accessible locations
     for(const [x,name] of [[68,'A'],[267,'B'],[229,'C']]){
       bl(x-25,119,50,17,'#72535d');bl(x-26,136,52,4,'#e0a56e');
       bl(x-18,124,36,3,'#e2c78f');text(name,x,128,'#fff1ba',10);
     }
     person(191,118,'#8babc8',t%3===0?1:0,true);
     // softly animated dust through window beams
     for(let i=0;i<8;i++){let x=(i*69+t/2)%W,y=83+(i*31)%87;bl(x,y,2,2,'#adc0c2')}
   }else{
     // Distinct chapter locations: station, rainy pier, arcade, city market, and archive.
     if(theme===0){
       bl(0,77,W,48,'#315d7f');bl(17,47,350,57,'#3f7995');bl(25,50,330,6,'#b4c0a8');
       for(let x=45;x<=340;x+=72){bl(x,59,12,51,'#263e57');bl(x+2,61,8,42,'#91b9b8')}
       bl(130,62,125,26,'#203f57');text('NEON STATION',191,74,'#f7e4a8',12);
       bl(0,111,W,105,'#36455e');bl(0,111,W,5,'#cbb58c');bl(0,134,W,8,'#55647e');
       for(let x=0;x<W;x+=36){bl(x,125,26,4,'#d5b26a')}
       bl(5,106,374,4,'#d6e4e1');bl(6,101,371,3,'#234b66');
       // Departure display, ticket kiosk and public announcement board
       bl(42,80,64,25,'#142c49');text('9:00?',72,92,'#ffce8c',10);
       bl(275,82,63,24,'#142c49');text('11:00',306,92,'#c9ffdb',10);
     }else if(theme===1){
       bl(0,80,W,137,'#214660');
       for(let y=90;y<164;y+=12)for(let x=0;x<W;x+=28){
         bl((x+t%25)%W,y,14,2,(x+y)%3?'#337d9c':'#468ba8');
       }
       bl(0,120,W,10,'#866a59');
       for(let x=0;x<W;x+=28){bl(x,131,5,85,'#75575a');bl(x,151,27,5,'#8d6f62')}
       for(let x=0;x<W;x+=18)bl(x,170,10,3,'#b49e75');
       // Pier lighthouse, fishing kiosk, boathouse.
       bl(270,35,68,81,'#637b95');bl(276,42,56,66,'#a6a4a0');bl(284,46,39,14,'#3b728e');
       bl(54,69,60,47,'#564d65');bl(58,72,52,8,'#d5b7a0');bl(70,85,27,23,'#264b68');
       for(let i=0;i<26;i++){let x=(i*43+17+t*2)%W,y=(i*73)%140;bl(x,y,1,4,'#9abdd8')}
     }else if(theme===2){
       bl(0,85,W,40,'#50336a');for(let i=0;i<7;i++){const x=9+i*53;bl(x,44,38,65,'#34295b');bl(x+3,50,32,49,i%2?'#64457b':'#254d72');bl(x+9,67,20,21,'#12244a');text(i%2?'PLAY':'HI',x+20,78,i%2?'#ffcce9':'#8cffe3',9)}
       bl(0,113,W,103,'#332e5d');for(let x=0;x<W;x+=24)for(let y=120;y<H;y+=20){bl(x,y,22,18,(x+y)%3===0?'#453d71':'#383760');bl(x,y,22,2,'#63528a')}
       bl(143,31,100,37,'#593c75');bl(148,37,90,25,'#8e4e99');text('PIXEL',193,46,'#d8c7ff',12);
       for(let i=0;i<6;i++){const x=(i*73+t*2)%W;bl(x,91,2,10,'#d38abe')}
     }else if(theme===3){
       bl(0,80,W,53,'#69516d');for(let i=0;i<5;i++){const x=i*80;bl(x+5,49,65,70,i%2?'#8c686e':'#896476');bl(x+12,56,50,16,i%2?'#fad3a0':'#7fc5c1');bl(x+14,80,46,25,'#3b4968')}
       bl(0,116,W,100,'#58495d');for(let y=117;y<H;y+=16)for(let x=0;x<W;x+=24){bl(x,y,22,14,'#66536a');bl(x,y,22,1,'#8e7181')}
       for(let x=30;x<W;x+=100){bl(x,110,18,38,'#66465d');bl(x-3,109,24,6,'#ead0a2');bl(x+3,117,13,15,'#d5b47f')}
       text('MYSTERY MARKET',192,47,'#ffe0b9',12);
     }else{
       bl(0,75,W,66,'#3a516c');
       for(let x=14;x<W;x+=75){bl(x,42,52,85,'#475978');bl(x+4,48,45,74,'#7c7e93');bl(x+8,52,37,66,'#213653');for(let y=59;y<110;y+=15)bl(x+12,y,29,3,'#e2bb87')}
       bl(0,119,W,97,'#38445d');for(let y=121;y<H;y+=17)for(let x=0;x<W;x+=25){bl(x,y,23,15,'#43516d');bl(x,y,23,2,'#566785')}
       bl(150,18,83,54,'#5b667e');bl(176,28,31,34,'#eeddb8');bl(190,33,3,25,'#485777');bl(192,44,12,2,'#485777');
       text('THE ARCHIVE',192,15,'#f0e5c4',10);
     }
     // A clearly identifiable walkable lane across all chapters
     bl(0,152,W,2,p.top);
     for(let x=0;x<W;x+=32)bl(x,205,25,2,p.bright);
     person(190,142,p.bright,(t%4===0)?1:0,true);
     // NPC patrol silhouette makes the scene feel lived-in.
     const npcX=35+((Math.sin(now/1700)+1)*11);
     person(npcX,132,'#85a9d9',t%5===0?1:0,false);
   }
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
   scene={title:obj.title||'',objects:obj.objects||[],environment:obj.environment||0,accent:obj.accent,genre:obj.genre||config.genre||'trace',mood:obj.mood||'choose'};
   level.textContent=obj.title||config.title;
   score.textContent=obj.score||'';
   if(!obj.preservePlayer)avatar={x:188,y:190,face:0,step:0};destination=null;
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
   if(!active||(e.target instanceof Element&&e.target.matches('input,textarea,select')))return;
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
   active=false;moving.clear();shell.hidden=true;restore.hidden=false;document.body.classList.remove('pixel-arcade-active');config.onDetails?.(api);window.scrollTo(0,0);
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