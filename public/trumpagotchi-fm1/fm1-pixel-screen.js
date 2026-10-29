/* SPDX-License-Identifier: GPL-3.0-only
 * Trumpagotchi v1.0.0 FM-1 visual adaptation.
 * Pixel-space room, character, poses and 240x240 LCD composition are ported
 * from adamcharleswilsonmusic-code/Trumpagotchi firmware/src/app/pet_art.h
 * and firmware/src/app/ui.c, licensed GPL-3.0-only.
 * This is browser graphics, not the original FM-1 firmware or synthesizer.
 */
(() => {
  'use strict';
  const canvas = document.getElementById('fm1-pixel-screen');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const C = {
    paper:'#f6ebd1', ink:'#202b3d', gold:'#eabb3e', skin:'#e9975a',
    shade:'#c67148', suit:'#2a3f5e', red:'#be3b31', mint:'#7fb199',
    shirt:'#f7edd1', floor:'#caae8b', wood:'#69463a'
  };
  const cap = n => Math.max(0,Math.min(100,Number(n)||0));
  let latest = null, action = '', actionStart = 0, frameCounter = 0;
  function rect(x,y,w,h,c) {
    ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
  }
  function oval(x,y,w,h,c) {
    const rx=w/2,ry=h/2;
    for(let yy=-ry;yy<ry;yy+=2) {
      let xx=rx;
      while(xx>0 && xx*xx*ry*ry+yy*yy*rx*rx>rx*rx*ry*ry) xx--;
      xx=Math.floor(xx/2)*2;
      if(xx)rect(x+rx-xx,y+ry+yy,xx*2,2,c);
    }
  }
  function label(s,x,y,size=9,c=C.ink,center=false) {
    ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.textBaseline='top';
    ctx.textAlign=center?'center':'left';ctx.fillText(s,x,y);ctx.textAlign='left';
  }
  function portrait() {
    label('BFF',190,0,8,C.ink);
    rect(175,12,49,39,'#6a4630');rect(178,15,43,33,C.gold);
    rect(180,17,39,29,'#b0beb4');
    rect(183,34,17,11,C.suit);rect(189,35,5,9,C.paper);rect(191,36,2,8,C.red);
    rect(185,23,13,13,C.skin);rect(183,21,15,5,C.gold);
    rect(186,19,11,4,C.gold);rect(183,24,3,6,C.gold);
    rect(188,28,2,2,C.ink);rect(194,28,2,2,C.ink);rect(190,33,5,1,C.shade);
    rect(201,34,16,11,'#2c3239');rect(207,35,5,7,'#d4d8d3');
    rect(203,23,13,13,'#d0a184');rect(202,21,15,4,'#767978');
    rect(202,24,3,7,'#949691');rect(215,24,2,8,'#949691');
    rect(205,28,2,2,C.ink);rect(212,28,2,2,C.ink);rect(207,33,5,1,'#8b5e4c');
  }
  function poo(x) {
    rect(x-7,145,15,6,'#422b23');rect(x-5,141,11,5,'#422b23');rect(x-2,138,5,4,'#422b23');
    rect(x-6,146,13,4,'#7e4f2e');rect(x-4,142,9,4,'#7e4f2e');rect(x-1,139,3,4,'#7e4f2e');
    rect(x-4,145,2,2,C.paper);rect(x+2,145,2,2,C.paper);
  }
  function room(s,t) {
    const minute=s.dayMinute,night=isNight(s),evening=minute>=1080 && minute<1260;
    rect(0,0,240,156,night?'#5e6c87':evening?'#e1bfa0':C.paper);
    rect(0,102,240,3,'#a48e76');rect(0,105,240,51,night?'#474b5e':C.floor);
    for(let i=0;i<8;i++) rect(0,109+i*6,240,1,night?'#565769':'#b99b78');
    rect(12,14,60,48,C.ink);rect(15,17,54,42,night?'#202d50':evening?'#d68171':'#99c9d9');
    if(night) {
      rect(55,23,9,10,C.gold);rect(52,21,8,8,'#202d50');
      rect(21,22,2,2,C.paper);rect(39,30,2,2,C.paper);rect(24,43,2,2,C.paper);
    } else {
      const minuteFromDawn=minute-360,sx=18+minuteFromDawn*39/900;
      const sy=Math.max(20,Math.min(49,evening?40+(minute-1080)*9/180:35-(minuteFromDawn<360?minuteFromDawn:720-minuteFromDawn)*13/360));
      rect(sx,sy,8,8,'#ffdc76');
      rect(17,54,52,5,evening?'#8a7976':'#79a492');
    }
    rect(40,16,3,44,C.ink);rect(14,37,56,3,C.ink);
    rect(5,96,5,28,'#795446');rect(73,96,5,28,'#795446');
    rect(10,99,63,17,'#795446');rect(10,95,63,17,C.ink);rect(11,96,61,13,'#dfd5b9');
    rect(13,97,22,10,'#fff6da');rect(16,95,17,3,'#fff6da');
    rect(37,97,34,13,C.mint);rect(39,97,3,13,'#b6cfb1');rect(10,113,63,4,'#9e6f50');
    portrait();
    rect(192,64,39,31,C.ink);rect(195,67,33,23,s.sleeping?'#283546':'#649eb1');
    const watching=action==='news' && t>=actionStart+1050 && t<actionStart+8500;
    if(watching){
      // Animated ticker and changing broadcast while the pet sits facing the TV.
      rect(196,68,31,20,'#415e83');
      rect(196,83,31,6,C.red);
      label('NEWS',200,83,5,C.paper);
      const blink=Math.floor(t/600)%3;
      rect(201+blink*5,70,9,10,C.skin);
      rect(202+blink*5,68,10,3,C.gold);
      rect(204+blink*5,73,2,2,C.ink);
      rect(196,88,31,2,C.paper);
    } else if(!s.sleeping) {
      rect(204,71,10,8,C.skin);rect(201,79,16,7,C.suit);rect(196,86,31,3,C.red);
      for(let i=0;i<4;i++)rect(197+((i*8+Math.floor(t/500)%8)%29),87,3,1,C.paper);
      rect(219,70,6,2,C.paper);rect(219,75,6,2,C.paper);
    }
    rect(208,95,7,5,C.ink);rect(186,100,49,5,'#8b6349');
    rect(190,105,4,22,'#8b6349');rect(228,105,4,22,'#8b6349');
    rect(115,119,44,5,'#69463a');rect(118,109,43,10,'#69463a');
    rect(127,106,30,8,'#69463a');rect(134,94,26,5,'#69463a');
    rect(157,98,5,21,'#69463a');rect(155,121,4,8,C.ink);
    for(let x=0;x<50;x+=2){const y=90+x/12;rect(101+x,y,2,36,'#69463a');rect(103+x,y+3,2,29,'#69463a');}
    rect(102,122,5,8,C.ink);rect(147,129,5,5,C.ink);rect(126,115,27,6,'#69463a');
    rect(172,114,25,3,'#8b6349');rect(174,117,3,11,'#8b6349');rect(192,117,3,11,'#8b6349');
    rect(170,111,29,3,C.ink);rect(172,109,25,3,'#d8ded5');
    for(let i=0;i<s.snackStock;i++) {
      const y=102-i*7;rect(178,y-3,12,2,C.gold);rect(176,y-1,16,3,'#ecaa4b');
      rect(175,y+2,18,1,C.mint);rect(177,y+3,14,2,'#643d2b');
      rect(176,y+5,16,1,C.gold);
    }
    [53,184,78].slice(0,s.pooCount).forEach(poo);
    if(s.cleanliness<80){rect(210,123,14,6,'#faefcc');rect(207,125,20,2,'#faefcc');rect(213,124,7,2,C.red);}
    if(s.cleanliness<=60){rect(180,130,12,5,'#faefcc');rect(178,132,16,2,'#faefcc');rect(184,131,5,2,C.red);}
    if(s.cleanliness<=30){rect(38,127,14,5,'#faefcc');rect(35,129,19,2,'#faefcc');rect(42,128,6,2,C.red);}
  }
  function isNight(s){return s.dayMinute>=1260||s.dayMinute<360;}
  function petState(s){
    if(s.food<=25)return 'HUNGRY';
    if(s.sleeping||s.energy<=20||isNight(s))return 'TIRED';
    if(s.neglect>=12||s.mood<=10)return 'SULKING';
    if(s.mood<=40||s.cleanliness<=25)return 'BORED';
    return 'HAPPY';
  }
  function sleepPose(s,t) {
    rect(12,95,23,15,'#fff6da');rect(17,89,19,16,C.ink);
    rect(18,91,19,12,C.skin);rect(15,89,18,5,C.gold);
    rect(18,87,12,3,C.gold);rect(14,92,7,6,C.gold);
    rect(20,89,10,2,'#ffdc75');rect(25,97,7,2,C.ink);
    rect(34,99,4,3,C.shade);rect(35,94,26,3,C.mint);
    rect(33,97,36,13,C.mint);rect(31,100,40,11,C.mint);
    rect(35,96,4,15,'#b6cfb1');rect(42,104,24,2,'#5e8f82');
    for(let i=0;i<3;i++){
      const p=(t+i*800)%2400;
      if(p<2100)label('Z',46+p/200,86-p/90,p<800?8:12,isNight(s)?C.gold:C.ink);
    }
  }
  let DX=0,BOB=0;
  function pr(x,y,w,h,c){
    const x0=120+(x-120)*5/6,y0=128+(y-128)*5/6;
    const x1=120+(x+w-120)*5/6,y1=128+(y+h-128)*5/6;
    rect(x0+DX,y0+BOB,Math.max(1,x1-x0),Math.max(1,y1-y0),c);
  }
  function po(x,y,w,h,c){
    const rx=w/2,ry=h/2;
    for(let yy=-ry;yy<ry;yy+=2){
      let xx=rx;
      while(xx>0 && xx*xx*ry*ry+yy*yy*rx*rx>rx*rx*ry*ry)xx--;
      xx=Math.floor(xx/2)*2;
      if(xx)pr(x+rx-xx,y+ry+yy,xx*2,2,c);
    }
  }
  function burger(x,y,bites=0){
    const w=bites===2?10:bites===1?18:25;
    pr(x+3,y,w-3,3,C.gold);pr(x,y+3,w,4,'#ecaa4b');
    pr(x+2,y+3,2,1,C.paper);pr(x-1,y+7,w+2,2,C.mint);
    pr(x,y+9,w,3,'#643d2b');pr(x,y+12,w,2,C.gold);pr(x,y+14,w,3,'#ecaa4b');
  }
  function star(x,y,n){pr(x-n,y,2*n+2,2,C.gold);pr(x,y-n,2,2*n+2,C.gold);}
  function drum(x,y){
    pr(x,y+3,26,21,C.ink);pr(x+3,y+6,20,15,'#aa633a');
    pr(x+8,y+6,2,15,C.gold);pr(x+18,y+6,2,15,C.gold);
    pr(x-2,y,30,7,C.ink);pr(x,y+1,26,4,'#f9d894');
  }
  function seatedPose(s,t) {
    // Face the television from the armchair, with small head / hand movement.
    const headNod=Math.floor(t/580)%2;
    const chairX=0;
    oval(117-s.plumpness,83,42+s.plumpness*2,32,C.ink);
    oval(119-s.plumpness,85,39+s.plumpness*2,28,C.suit);
    rect(142,94,15,15,C.suit);rect(151,104,10,7,C.suit);
    rect(158,103,7,5,C.skin);rect(163,99,5,10,C.ink);rect(164,101,2,2,C.red);
    rect(127,83,17,9,C.skin);oval(116,53,36,35,C.ink);
    oval(117,54,34,33,C.gold);oval(121,64,29,23,'#daa430');
    rect(115,57,30,9,C.gold);rect(121,50,24,8,C.gold);
    rect(121,52,23,3,'#ffdc75');rect(118,60,23,3,'#f7cd58');
    rect(152,115,14,7,C.ink);
    rect(142,71+headNod,3,2,C.ink);
    if(Math.floor(t/1300)%2===0){
      rect(152,94,10,8,C.suit);
      rect(160,87,5,12,C.skin);
    }
  }
  function pet(s,t) {
    if(s.sleeping){sleepPose(s,t);return;}
    const mode=petState(s);
    const age=Math.max(0,t-actionStart);
    const doing=action && age < (action==='news'?8500:2400);
    const act=doing?action:'';
    const walking=!act && (t%10000<5300);
    const hand=Math.floor(t/235)%2;
    const goingToTV=act==='news' && age<1050;
    const dx=goingToTV?Math.round(25*age/1050):walking?Math.round(Math.sin(t/1500)*22):0;
    const bongo=act==='bongo' || (act==='cheer' && age>1200);
    const cheer=act==='cheer'||act==='praise';
    if(act==='news' && !goingToTV){seatedPose(s,t);return;}
    DX=dx;BOB=14+(cheer?(hand?-3:0):walking||goingToTV?(hand?1:-1):bongo&&hand?-1:0);
    oval(91+dx-s.plumpness*2,140,60+s.plumpness*4,5,'#977e67');
    pr(94,110,16,15,C.suit);pr(130,110,16,15,C.suit);
    pr(88-(walking&&hand?3:0),123,24,5,C.ink);pr(130+(walking&&!hand?3:0),123,24,5,C.ink);
    po(74-s.plumpness*3,62,94+s.plumpness*6,59+s.plumpness,C.ink);
    po(78-s.plumpness*3,64,86+s.plumpness*6,53+s.plumpness,C.suit);
    pr(111,70,28,13,C.shirt);pr(116,83,19,15,C.shirt);pr(119,98,13,6,C.shirt);
    pr(105,70,7,10,'#4e6586');pr(109,80,6,9,'#4e6586');pr(113,89,6,10,'#4e6586');
    pr(139,70,7,10,'#4e6586');pr(136,80,6,9,'#4e6586');pr(132,89,6,10,'#4e6586');
    pr(121,73,8,7,C.red);pr(122,80,6,17,C.red);pr(123,97,4,3,C.red);pr(123,108,4,3,C.gold);
    po(92,24,62,55,C.ink);po(96,26,54,49,C.skin);
    po(98,54,50,23,C.shade);po(100,53,46,18,C.skin);
    po(90,40,12,19,C.shade);po(146,40,12,19,C.shade);
    po(97,46,20,17,'#f1a36b');po(132,46,18,17,'#f1a36b');
    pr(96,19,54,16,'#a67c27');pr(107,11,35,12,'#a67c27');
    pr(98,21,51,12,C.gold);pr(108,13,34,13,C.gold);
    pr(87,24,28,8,C.gold);pr(91,31,13,7,C.gold);
    pr(107,17,31,4,'#ffdc75');pr(99,25,34,3,'#fcd261');pr(143,30,8,13,C.gold);
    const blink=(t%4300)<160;
    if(cheer){
      pr(105,40,9,2,C.ink);pr(134,40,9,2,C.ink);
      pr(103,42,3,3,C.ink);pr(142,42,3,3,C.ink);
    }else if(blink){
      pr(104,44,10,2,C.ink);pr(134,44,10,2,C.ink);
    }else if(mode==='SULKING'){
      pr(104,39,7,3,C.ink);pr(111,42,5,3,C.ink);
      pr(132,42,5,3,C.ink);pr(137,39,7,3,C.ink);
      pr(110,47,3,3,C.ink);pr(135,47,3,3,C.ink);
    }else if(mode==='TIRED'||mode==='BORED'){
      pr(104,42,11,3,C.ink);pr(133,42,11,3,C.ink);
      pr(110,45,3,2,C.ink);pr(134,45,3,2,C.ink);
    }else{
      pr(103,38,10,2,C.shade);pr(134,37,10,2,C.shade);
      pr(109,43,3,4,C.ink);pr(134,43,3,4,C.ink);
    }
    po(117,47,14,10,C.shade);pr(119,47,10,4,'#f8b273');
    if(cheer){po(111,55,29,15,C.ink);pr(115,57,22,4,C.paper);pr(120,65,12,3,C.red);}
    else if(act==='feed'){po(115,57,20,13,C.ink);}
    else if(mode==='HUNGRY'||mode==='TIRED'){po(118,59,12,10,C.ink);pr(121,61,5,2,C.red);}
    else if(mode==='HAPPY'){pr(113,60,22,3,C.ink);pr(116,63,17,3,C.ink);pr(115,60,17,2,'#fff7dd');}
    else if(mode==='SULKING'){pr(116,61,17,3,C.red);pr(113,64,5,2,C.ink);pr(132,64,5,2,C.ink);}
    else{pr(120,60,10,3,C.red);pr(122,63,6,2,C.shade);}
    pr(112,70,22,2,C.shade);
    if(act==='feed'){
      const by=age<450?94:age<850?94-(age-450)*32/400:62;
      if(age<1750){
        const bites=age>=1400?2:age>=1050?1:0;
        pr(86,84,13,14,C.suit);pr(97,by+7,17,8,C.suit);
        po(105,by+8,15,12,C.skin);po(135,by+8,15,12,C.skin);
        burger(112,by,bites);
      }
    }else if(cheer){
      const lift=age<300?age*26/300:26+(hand?4:0);
      pr(80,74,14,19,C.suit);pr(151,74,14,19,C.suit);
      pr(78,79-lift,13,22+lift,C.suit);pr(155,79-lift,13,22+lift,C.suit);
      po(75,68-lift,17,15,C.skin);po(155,68-lift,17,15,C.skin);
      star(76,26+(hand?7:0),4);star(173,36-(hand?8:0),4);
    }else if(bongo){
      drum(86,104);drum(127,105);
      pr(84,81,11,16,C.suit);pr(144,81,11,16,C.suit);
      po(95,hand?90:96,15,10,C.skin);po(136,hand?97:91,15,10,C.skin);
      pr(172,31,3,13,C.ink);pr(165,42,8,4,C.ink);
    }else{
      po(74,91,14,12,C.skin);po(156,91,14,12,C.skin);
      if(mode==='SULKING'){pr(88,95,69,7,C.suit);po(116,93,18,10,C.skin);}
    }
  }
  function caption(s,t) {
    if(s.paused){label('PAUSED',120,211,13,C.ink,true);label('PLAY: CONTINUE',120,226,8,C.ink,true);return;}
    if(s.gameOver){label('PRESS START OVER TO RESTART',120,216,9,C.ink,true);return;}
    const timed=s.messageUntil>s.activeMs;
    const state=petState(s);
    const msg=timed?s.message:s.sleeping?(isNight(s)?'SLEEPING UNTIL SUNRISE':'EXECUTIVE NAP'):
      state==='HUNGRY'?'I WANT FOOD':state==='TIRED'?'I WANT SLEEP':
      s.cleanliness<=25?'THIS PLACE NEEDS A CLEAN':state==='SULKING'?'I EXPECT BETTER SERVICE':
      state==='BORED'?'A LITTLE ATTENTION?':'A TREMENDOUS DAY';
    label(String(msg).slice(0,39),120,211,msg.length>26?7:9,C.ink,true);
    const names=['FEED','PRAISE','CLEAN','REST'];
    names.forEach((n,i)=>label(n,30+i*60,226,8,C.ink,true));
  }
  function render(s) {
    if(!s || document.hidden)return;
    latest=s;const t=s.activeMs;
    rect(0,0,240,240,C.paper);
    rect(0,0,240,24,C.ink);
    label('TRUMPAGOTCHI',8,6,12,C.gold);
    label(s.gameOver?'GAME OVER':s.sleeping?'SLEEP':petState(s),203,8,8,C.paper,true);
    const values=[cap(s.food),cap(s.mood),cap(s.energy)];
    ['FOOD','MOOD','ENERGY'].forEach((name,i)=>{
      const x=8+i*78;
      label(name,x,26,9,C.ink);
      rect(x,40,68,5,'#d3c5aa');rect(x,40,values[i]*68/100,5,values[i]<30?C.red:C.mint);
    });
    ctx.save();ctx.beginPath();ctx.rect(0,50,240,156);ctx.clip();ctx.translate(0,50);
    if(s.gameOver) {
      rect(0,0,240,156,C.paper);
      label('GAME OVER',120,49,20,C.ink,true);
      label("LET'S TRY THAT AGAIN",120,91,9,C.ink,true);
    } else {
      room(s,t);pet(s,t);
    }
    ctx.restore();
    rect(0,206,240,34,C.paper);
    caption(s,t);frameCounter++;
  }
  window.FM1PixelScreen={
    render,
    animate(kind){action=kind;actionStart=latest?.activeMs||0;if(latest)render(latest);}
  };
  document.body.classList.add('fm1-pixel-ready');
})();
