/* GPL-3.0-only. Direct translation of the original Trumpagotchi v1.0.0 firmware pixel artwork and room.
 * Original authorship: adamcharleswilsonmusic-code/Trumpagotchi, firmware/src/app/pet_art.h
 * Original source: https://github.com/adamcharleswilsonmusic-code/Trumpagotchi/blob/v1.0.0/firmware/src/app/pet_art.h
 * This derivative source is GPL-3.0-only; retained complete for transparency.
 */
(() => {
"use strict";
let ctx;
const RGB=(r,g,b)=>"rgb("+r+","+g+","+b+")";
function cv_rect(x,y,w,h,color) {
  ctx.fillStyle=color;
  ctx.fillRect(Math.trunc(x),Math.trunc(y),Math.max(1,Math.trunc(w)),Math.max(1,Math.trunc(h)));
}
function cv_begin(width,height,color) {
  ctx.fillStyle=color;ctx.fillRect(0,0,width,height);
}
const FONT_XS=7, FONT_S=9;
function cv_text(x,y,font,str,color) {
  ctx.fillStyle=color;ctx.font='bold '+font+'px monospace';ctx.textBaseline='top';
  ctx.fillText(str,Math.trunc(x),Math.trunc(y));
}
const PET_HAPPY=0,PET_BORED=1,PET_HUNGRY=2,PET_TIRED=3,PET_SULKING=4;
const plat_ms=()=>performance.now();
let pet={};
function pet_is_night() { return pet.day_minute<360 || pet.day_minute>=1260; }
const PET_PAPER=RGB(246,235,209);
const PET_INK=RGB(32,43,61);
const PET_GOLD=RGB(234,187,62);
const PET_SKIN=RGB(233,151,90);
const PET_SHADE=RGB(198,113,72);
const PET_SUIT=RGB(42,63,94);
const PET_RED=RGB(190,59,49);
const PET_MINT=RGB(127,177,153);









let pet_dx,pet_bob,pet_crouch;
function pet_poo_x(slot) {return slot==0?53:slot==1?184:78;}
function pet_poo(x) {
    let edge=RGB(66,43,35),fill=RGB(126,79,46);
    cv_rect(x-7,145,15,6,edge);cv_rect(x-5,141,11,5,edge);cv_rect(x-2,138,5,4,edge);
    cv_rect(x-6,146,13,4,fill);cv_rect(x-4,142,9,4,fill);cv_rect(x-1,139,3,4,fill);
    cv_rect(x-4,145,2,2,PET_PAPER);cv_rect(x+2,145,2,2,PET_PAPER);
    cv_rect(x-1,148,3,1,edge);
}

function pet_rect(x,y,w,h,c) {
    let x0=120+(x-120)*5/6,y0=128+(y-128)*5/6;
    let x1=120+(x+w-120)*5/6,y1=128+(y+h-128)*5/6;
    y0+=(128-y0)*pet_crouch/100;y1+=(128-y1)*pet_crouch/100;
    cv_rect(x0+pet_dx,y0+pet_bob,x1>x0?x1-x0:1,y1>y0?y1-y0:1,c);
}
function pet_oval(x,y,w,h,c) {
    let yy,xx,rx=w/2,ry=h/2;
    for(yy=-ry;yy<ry;yy+=2){
        xx=rx;
        while(xx>0 && xx*xx*ry*ry+yy*yy*rx*rx>rx*rx*ry*ry)xx--;
        xx=(xx/2)*2;
        if(xx)pet_rect(x+rx-xx,y+ry+yy,xx*2,2,c);
    }
}

function pet_chair_back() {
    let x;
    for(x=0;x<50;x+=2){
        let y=90+x/12;
        cv_rect(101+x,y,2,36,RGB(105,70,58));
        cv_rect(103+x,y+3,2,29,RGB(105,70,58));
    }
    cv_rect(102,122,5,8,PET_INK);
    cv_rect(147,129,5,5,PET_INK);
    cv_rect(126,115,27,6,RGB(105,70,58));
    cv_rect(129,114,23,4,RGB(105,70,58));
}
function pet_room_oval(x,y,w,h,c) {
    let yy,xx,rx=w/2,ry=h/2;
    for(yy=-ry;yy<ry;yy+=2){
        xx=rx;
        while(xx>0 && xx*xx*ry*ry+yy*yy*rx*rx>rx*rx*ry*ry)xx--;
        if(xx)cv_rect(x+rx-xx,y+ry+yy,xx*2,2,c);
    }
}
function pet_room(asleep,minute,now) {
    let i,night=minute<360||minute>=1260,evening=minute>=1080&&minute<1260;
    let wall=night?RGB(94,108,135):evening?RGB(225,191,160):PET_PAPER;
    cv_begin(240,156,wall);
    cv_rect(0,102,240,3,RGB(164,142,118));
    cv_rect(0,105,240,51,night?RGB(71,75,94):RGB(202,175,139));
    for(i=0;i<8;i++)cv_rect(0,109+i*6,240,1,night?RGB(86,87,105):RGB(185,155,120));
    
    cv_rect(12,14,60,48,PET_INK);
    cv_rect(15,17,54,42,night?RGB(32,45,80):evening?RGB(214,129,113):RGB(153,201,217));
    if(night){
        cv_rect(55,23,9,10,PET_GOLD);cv_rect(52,21,8,8,RGB(32,45,80));
        cv_rect(21,22,2,2,PET_PAPER);cv_rect(39,30,2,2,PET_PAPER);cv_rect(24,43,2,2,PET_PAPER);
    }else{
        let t=minute-360,sx=18+t*39/900;
        let sy=evening?40+(minute-1080)*9/180:35-(t<360?t:720-t)*13/360;
        if(sy<20)sy=20;if(sy>49)sy=49;
        cv_rect(sx,sy,8,8,RGB(255,220,118));
        cv_rect(17,54,52,5,evening?RGB(138,121,118):RGB(121,164,146));
    }
    cv_rect(40,16,3,44,PET_INK);cv_rect(14,37,56,3,PET_INK);
    
    cv_rect(5,96,5,28,RGB(121,84,70));cv_rect(73,96,5,28,RGB(121,84,70));
    cv_rect(10,99,63,17,RGB(121,84,70));cv_rect(10,95,63,17,PET_INK);
    cv_rect(11,96,61,13,RGB(223,213,185));
    cv_rect(13,97,22,10,RGB(255,246,218));cv_rect(16,95,17,3,RGB(255,246,218));
    cv_rect(37,97,34,13,PET_MINT);cv_rect(39,97,3,13,RGB(182,207,177));
    cv_rect(10,113,63,4,RGB(158,111,80));
    
    cv_text(190,0,FONT_XS,"BFF",night?PET_GOLD:PET_INK);
    cv_rect(175,12,49,39,RGB(106,70,48));
    cv_rect(178,15,43,33,PET_GOLD);cv_rect(180,17,39,29,RGB(176,190,180));
    cv_rect(183,34,17,11,PET_SUIT);cv_rect(189,35,5,9,PET_PAPER);
    cv_rect(191,36,2,8,PET_RED);
    cv_rect(185,23,13,13,PET_SKIN);cv_rect(183,21,15,5,PET_GOLD);
    cv_rect(186,19,11,4,PET_GOLD);cv_rect(183,24,3,6,PET_GOLD);
    cv_rect(188,28,2,2,PET_INK);cv_rect(194,28,2,2,PET_INK);
    cv_rect(190,33,5,1,PET_SHADE);
    cv_rect(201,34,16,11,RGB(44,50,57));cv_rect(207,35,5,7,RGB(212,216,211));
    cv_rect(203,23,13,13,RGB(208,161,132));
    cv_rect(202,21,15,4,RGB(118,121,120));cv_rect(202,24,3,7,RGB(148,150,145));
    cv_rect(215,24,2,8,RGB(148,150,145));
    cv_rect(205,28,2,2,PET_INK);cv_rect(212,28,2,2,PET_INK);
    cv_rect(207,33,5,1,RGB(139,94,76));
    
    cv_rect(192,64,39,31,PET_INK);cv_rect(195,67,33,23,RGB(100,158,177));
    if(!asleep){
        cv_rect(204,71,10,8,PET_SKIN);cv_rect(201,79,16,7,PET_SUIT);
        cv_rect(196,86,31,3,PET_RED);
        for(i=0;i<4;i++)cv_rect(197+((i*8+(now/500)%8)%29),87,3,1,PET_PAPER);
        cv_rect(219,70,6,2,PET_PAPER);cv_rect(219,75,6,2,PET_PAPER);
    }else cv_rect(195,67,33,23,RGB(40,53,70));
    cv_rect(208,95,7,5,PET_INK);cv_rect(186,100,49,5,RGB(139,99,73));
    cv_rect(190,105,4,22,RGB(139,99,73));cv_rect(228,105,4,22,RGB(139,99,73));
    
    cv_rect(115,119,44,5,RGB(105,70,58));
    cv_rect(118,109,43,10,RGB(105,70,58));
    cv_rect(127,106,30,8,RGB(105,70,58));
    cv_rect(134,94,26,5,RGB(105,70,58));
    cv_rect(157,98,5,21,RGB(105,70,58));
    cv_rect(155,121,4,8,PET_INK);
    pet_chair_back();
    
    cv_rect(172,114,25,3,RGB(139,99,73));cv_rect(174,117,3,11,RGB(139,99,73));
    cv_rect(192,117,3,11,RGB(139,99,73));
    cv_rect(170,111,29,3,PET_INK);cv_rect(172,109,25,3,RGB(216,222,213));
    for(i=0;i<pet.snack_stock;i++){
        let y=102-i*7;
        cv_rect(178,y-3,12,2,PET_GOLD);cv_rect(176,y-1,16,3,RGB(236,170,75));
        cv_rect(175,y+2,18,1,PET_MINT);cv_rect(177,y+3,14,2,RGB(100,61,43));
        cv_rect(176,y+5,16,1,PET_GOLD);
    }
    for(i=0;i<pet.poo_count;i++)pet_poo(pet_poo_x(i));
    
    if(pet.cleanliness<80){
        cv_rect(210,123,14,6,RGB(250,239,204));cv_rect(207,125,20,2,RGB(250,239,204));
        cv_rect(213,124,7,2,PET_RED);cv_rect(215,127,7,2,RGB(179,156,120));
    }
    if(pet.cleanliness<=60){
        cv_rect(180,130,12,5,RGB(250,239,204));cv_rect(178,132,16,2,RGB(250,239,204));
        cv_rect(184,131,5,2,PET_RED);cv_rect(200,127,2,2,PET_GOLD);cv_rect(204,131,2,2,PET_GOLD);
    }
    if(pet.cleanliness<=30){
        cv_rect(38,127,14,5,RGB(250,239,204));cv_rect(35,129,19,2,RGB(250,239,204));
        cv_rect(42,128,6,2,PET_RED);cv_rect(60,131,2,2,PET_GOLD);
    }
}
function pet_drum(x,y,hit) {
    pet_rect(x,y+3,26,21,PET_INK);pet_rect(x+3,y+6,20,15,RGB(170,99,58));
    pet_rect(x+8,y+6,2,15,PET_GOLD);pet_rect(x+18,y+6,2,15,PET_GOLD);
    pet_rect(x-2,y,30,7,PET_INK);pet_rect(x,y+1,26,4,RGB(249,216,148));
     
}
function pet_star(x,y,size) {
    pet_rect(x-size,y,2*size+2,2,PET_GOLD);
    pet_rect(x,y-size,2,2*size+2,PET_GOLD);
}
function pet_burger(x,y,bites) {
    
    let w=bites==2?10:bites==1?18:25;
    pet_rect(x+3,y,w-3,3,PET_GOLD);pet_rect(x,y+3,w,4,RGB(236,170,75));
    pet_rect(x+2,y+3,2,1,PET_PAPER);if(!bites)pet_rect(x+14,y+3,2,1,PET_PAPER);
    pet_rect(x-1,y+7,w+2,2,PET_MINT);pet_rect(x,y+9,w,3,RGB(100,61,43));
    pet_rect(x,y+12,w,2,PET_GOLD);pet_rect(x,y+14,w,3,RGB(236,170,75));
}
function pet_sleep_pose(waking) {
    
    cv_rect(12,95,23,15,RGB(255,246,218));
    cv_rect(17,89,19,16,PET_INK);cv_rect(18,91,19,12,PET_SKIN);
    cv_rect(15,89,18,5,PET_GOLD);cv_rect(18,87,12,3,PET_GOLD);
    cv_rect(14,92,7,6,PET_GOLD);cv_rect(20,89,10,2,RGB(255,220,117));
    cv_rect(25,97,waking?3:7,waking?3:2,PET_INK);cv_rect(34,99,4,3,PET_SHADE);
    cv_rect(35,94,26,3,PET_MINT);cv_rect(33,97,36,13,PET_MINT);
    cv_rect(31,100,40,11,PET_MINT);cv_rect(35,96,4,15,RGB(182,207,177));
    cv_rect(42,104,24,2,RGB(94,143,130));
    {let z=(pet.day_minute<360||pet.day_minute>=1260)?PET_GOLD:PET_INK;
        let i;let now=plat_ms();
        for(i=0;i<3;i++){
            let phase=(now+i*800)%2400;
            if(!waking && phase<2100)cv_text(46+phase/200,86-phase/90,
                phase<800?FONT_XS:FONT_S,"Z",z);
        }
    }
}
let pet_seat_offset;
function pet_seat_rect(x,y,w,h,c) {cv_rect(x,y+pet_seat_offset,w,h,c);}
function pet_seat_oval(x,y,w,h,c) {pet_room_oval(x,y+pet_seat_offset,w,h,c);}
function pet_news_pose(eating,age,rise) {
    pet_seat_offset=rise;
    
    pet_seat_oval(117-pet.plumpness,83,42+pet.plumpness*2,32,PET_INK);
    pet_seat_oval(119-pet.plumpness,85,39+pet.plumpness*2,28,PET_SUIT);
    pet_seat_rect(142,94,15,15,PET_SUIT);
    pet_seat_rect(151,104,10,7,PET_SUIT);
    if(!eating){
        pet_seat_rect(158,103,7,5,PET_SKIN);
        pet_seat_rect(163,99,5,10,PET_INK);pet_seat_rect(164,101,2,2,PET_RED);
    }
    pet_seat_rect(127,83,17,9,PET_SKIN);
    pet_seat_oval(116,53,36,35,PET_INK);
    pet_seat_oval(117,54,34,33,PET_GOLD);
    pet_seat_oval(121,64,29,23,RGB(218,164,48));
    pet_seat_rect(115,57,30,9,PET_GOLD);pet_seat_rect(121,50,24,8,PET_GOLD);
    pet_seat_rect(121,52,23,3,RGB(255,220,117));
    pet_seat_rect(118,60,23,3,RGB(247,205,88));

    if(eating){
        let t=age<700?age:700;
        let hx=177-t*24/700,hy=103-t*24/700,i;
        if(age>=2000){hx=158;hy=103;}
        for(i=0;i<=8;i++)pet_seat_rect(148+(hx-148)*i/8,94+(hy-94)*i/8,5,5,PET_SUIT);
        pet_seat_rect(hx,hy,7,5,PET_SKIN);
        if(age<2000){
            let w=age>=1500?7:age>=1100?12:17;
            pet_seat_rect(hx-5,hy-5,w,3,PET_GOLD);pet_seat_rect(hx-6,hy-2,w+2,2,PET_MINT);
            pet_seat_rect(hx-5,hy,w,2,RGB(100,61,43));pet_seat_rect(hx-5,hy+2,w,2,PET_GOLD);
        }
    }
    pet_seat_rect(152,115,14,7,PET_INK);
    pet_chair_back();
}
function pet_character(state,asleep,blink,playing,hand,dx,walking,watching,action,age) {
    pet_crouch=0;
    let squatting=action==7 && age>=800 && age<2400;
    if(action==7){
        playing=watching=0;walking=!squatting;hand=(age/160)%2;
        if(squatting){
            let t=age-800;
            pet_crouch=t<300?t/10:t<1300?30:(1600-t)/10;
            blink=1;
        }
    }
    if(action==6){pet_news_pose(1,age,0);return;}
    if(action==5){
        playing=watching=0;
        if(age>=800 && age<3400){action=1;age-=800;}
        else{action=0;walking=1;hand=(age/160)%2;}
    }
    let floor_offset=14;
    if(action==9){
        if(age<1000){pet_sleep_pose(1);return;}
        floor_offset=6+(age-1000)*8/2000;
        asleep=watching=playing=0;walking=1;hand=(age/160)%2;
    }
    if(action==10){
        if(age<500){pet_news_pose(0,0,-age*8/500);return;}
        floor_offset=6+(age-500)*8/1000;
        asleep=watching=playing=0;walking=1;hand=(age/160)%2;
    }
    if(action==8){
        if(age>=1000){
            let t=(age-1000);if(t>500)t=500;
            pet_news_pose(0,0,-8+t*8/500);return;
        }
        floor_offset=14-age*8/1000;
        watching=playing=0;walking=1;hand=(age/160)%2;
    }
    let eyes=watching?3:0,chew=action==1&&age>=1750&&age<2350;
    let cheer=action==2,cheer_beat=(age/220)%2;
    if(action==4){
        if(age>=1800){pet_sleep_pose(0);return;}
        floor_offset=14-age*8/1800; 
        asleep=0;playing=watching=0;walking=1;hand=(age/160)%2;
        action=0;state=PET_TIRED;
    }
    if(asleep){pet_sleep_pose(0);return;}
    if(watching && !action && !playing){pet_news_pose(0,0,0);return;}
    
    pet_room_oval(91+dx-pet.plumpness*2,126+floor_offset,60+pet.plumpness*4,5,
        pet_is_night()?RGB(40,43,58):RGB(151,126,103));
    pet_dx=dx;pet_bob=floor_offset+(cheer?(cheer_beat?-3:0):walking?(hand?1:-1):playing&&hand?-1:0);
    
    pet_rect(94,110,16,15,PET_SUIT);pet_rect(130,110,16,15,PET_SUIT);
    pet_rect(88-(walking&&hand?3:0),123,24,5,PET_INK);
    pet_rect(130+(walking&&!hand?3:0),123,24,5,PET_INK);
    
    pet_oval(74-pet.plumpness*3,62,94+pet.plumpness*6,59+pet.plumpness,PET_INK);
    pet_oval(78-pet.plumpness*3,64,86+pet.plumpness*6,53+pet.plumpness,PET_SUIT);
    pet_rect(111,70,28,13,RGB(247,237,209));
    pet_rect(116,83,19,15,RGB(247,237,209));
    pet_rect(119,98,13,6,RGB(247,237,209));
    pet_rect(105,70,7,10,RGB(78,101,134));pet_rect(109,80,6,9,RGB(78,101,134));
    pet_rect(113,89,6,10,RGB(78,101,134));
    pet_rect(139,70,7,10,RGB(78,101,134));pet_rect(136,80,6,9,RGB(78,101,134));
    pet_rect(132,89,6,10,RGB(78,101,134));
    pet_rect(121,73,8,7,PET_RED);pet_rect(122,80,6,17,PET_RED);
    pet_rect(123,97,4,3,PET_RED);pet_rect(123,108,4,3,PET_GOLD);
    
    pet_oval(92,24,62,55,PET_INK);pet_oval(96,26,54,49,PET_SKIN);
    pet_oval(98,54,50,23,PET_SHADE);pet_oval(100,53,46,18,PET_SKIN);
    pet_oval(90,40,12,19,PET_SHADE);pet_oval(146,40,12,19,PET_SHADE);
    pet_oval(97,46,20,17,RGB(241,163,107));pet_oval(132,46,18,17,RGB(241,163,107));
    
    pet_rect(96,19,54,16,RGB(166,124,39));pet_rect(107,11,35,12,RGB(166,124,39));
    pet_rect(98,21,51,12,PET_GOLD);pet_rect(108,13,34,13,PET_GOLD);
    pet_rect(87,24,28,8,PET_GOLD);pet_rect(91,31,13,7,PET_GOLD);
    pet_rect(107,17,31,4,RGB(255,220,117));pet_rect(99,25,34,3,RGB(252,210,97));
    pet_rect(143,30,8,13,PET_GOLD);
    
    if(cheer){
        pet_rect(105,40,9,2,PET_INK);pet_rect(103,42,3,3,PET_INK);pet_rect(113,42,3,3,PET_INK);
        pet_rect(134,40,9,2,PET_INK);pet_rect(132,42,3,3,PET_INK);pet_rect(142,42,3,3,PET_INK);
    }else if(asleep||blink){pet_rect(104+eyes,44,10,2,PET_INK);pet_rect(134+eyes,44,10,2,PET_INK);}
    else if(state==PET_SULKING){
        pet_rect(104,39,7,3,PET_INK);pet_rect(111,42,5,3,PET_INK);
        pet_rect(132,42,5,3,PET_INK);pet_rect(137,39,7,3,PET_INK);
        pet_rect(110,47,3,3,PET_INK);pet_rect(135,47,3,3,PET_INK);
    }else if(state==PET_TIRED||state==PET_BORED){
        pet_rect(104+eyes,42,11,3,PET_INK);pet_rect(133+eyes,42,11,3,PET_INK);
        pet_rect(110+eyes,45,3,2,PET_INK);pet_rect(134+eyes,45,3,2,PET_INK);
    }else{
        pet_rect(103+eyes,38,10,2,PET_SHADE);pet_rect(134+eyes,37,10,2,PET_SHADE);
        pet_rect(109+eyes,43,3,4,PET_INK);pet_rect(134+eyes,43,3,4,PET_INK);
    }
    pet_oval(117+eyes,47,14,10,PET_SHADE);pet_rect(119+eyes,47,10,4,RGB(248,178,115));
    if(squatting){
        pet_oval(120,59,9,8,PET_INK);
    }else if(cheer){
        pet_oval(111,55,29,15,PET_INK);pet_rect(115,57,22,4,PET_PAPER);pet_rect(120,65,12,3,PET_RED);
    }else if(chew){
        let puff=(age/140)%2;
        pet_oval(97-puff*2,54,17+puff*2,12,PET_SKIN);pet_oval(137,54,17+puff*2,12,PET_SKIN);
        pet_rect(119,61,12,puff?3:2,PET_INK);
    }else if(action==1&&age>=700&&age<1750){pet_oval(115,57,20,13,PET_INK);}
    else if(action==1&&age>=2350){pet_rect(119,61,12,2,PET_INK);pet_rect(124,73,5,3,PET_SHADE);}
    else if(asleep||state==PET_HUNGRY){pet_oval(118,59,12,10,PET_INK);pet_rect(121,61,5,2,PET_RED);}
    else if(state==PET_HAPPY){
        pet_rect(113+eyes,60,22,3,PET_INK);pet_rect(116+eyes,63,17,3,PET_INK);
        pet_rect(115+eyes,60,17,2,RGB(255,247,221));
    }else if(state==PET_SULKING){pet_rect(116,61,17,3,PET_RED);pet_rect(113,64,5,2,PET_INK);pet_rect(132,64,5,2,PET_INK);}
    else{pet_rect(120+eyes,60,10,3,PET_RED);pet_rect(122+eyes,63,6,2,PET_SHADE);}
    pet_rect(112,70,22,2,PET_SHADE);
    if(action==1){
        let by=age<450?94:age<850?94-(age-450)*32/400:62;
        if(age<1750){
            let bite=age>=1400?2:age>=1050?1:0;
            pet_rect(86,84,13,14,PET_SUIT);pet_rect(97,by+7,17,8,PET_SUIT);
            pet_oval(105,by+8,15,12,PET_SKIN);pet_oval(135,by+8,15,12,PET_SKIN);
            pet_burger(112,by,bite);
            if(bite){pet_rect(136,by+16+(age/100)%6,2,2,PET_GOLD);}
        }else{
            pet_oval(83,94,15,12,PET_SKIN);pet_oval(138,100,16,11,PET_SKIN);
        }
    }else if(cheer){
        let lift=age<300?age*26/300:26+cheer_beat*4;
        
        pet_rect(80,74,14,19,PET_SUIT);pet_rect(151,74,14,19,PET_SUIT);
        pet_rect(78,79-lift,13,22+lift,PET_SUIT);
        pet_rect(155,79-lift,13,22+lift,PET_SUIT);
        pet_oval(75,68-lift,17,15,PET_SKIN);pet_oval(155,68-lift,17,15,PET_SKIN);
        pet_star(76,26+cheer_beat*7,cheer_beat?4:3);
        pet_star(173,36-cheer_beat*8,cheer_beat?3:5);
        if(age>500)pet_star(154,8+cheer_beat*5,3);
    }else if(squatting){
        pet_rect(80,82,12,25,PET_SUIT);pet_rect(150,82,12,25,PET_SUIT);
        pet_oval(83,102,17,11,PET_SKIN);pet_oval(144,102,17,11,PET_SKIN);
    }else if(playing){
        pet_drum(86,104,hand==1);pet_drum(127,105,hand==2);
        let ly=96-(hand==1?6:0),ry=97-(hand==2?6:0),i;
        for(i=0;i<=8;i++){
            pet_rect(84+i*12/8,81+i*(ly-81)/8,10,9,PET_SUIT);
            pet_rect(152-i*14/8,81+i*(ry-81)/8,10,9,PET_SUIT);
        }
        pet_oval(95,ly,15,10,PET_SKIN);pet_oval(136,ry,15,10,PET_SKIN);
        pet_rect(172,31,3,13,PET_INK);pet_rect(165,42,8,4,PET_INK);pet_rect(172,30,8,3,PET_INK);
    }else{
        pet_oval(74,91,14,12,PET_SKIN);pet_oval(156,91,14,12,PET_SKIN);
        if(state==PET_SULKING){pet_rect(88,95,69,7,PET_SUIT);pet_oval(116,93,18,10,PET_SKIN);}
        if(watching){pet_rect(154,93,9,15,PET_INK);pet_rect(157,97,3,3,PET_RED);}
    }
    if(asleep){cv_text(160+dx,41,FONT_S,"Z",PET_PAPER);cv_text(174+dx,29,FONT_XS,"z",PET_PAPER);}
}


window.drawOriginalTrumpagotchi=function(canvas,model) {
 if(!canvas||!canvas.getContext)return;
 ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 ctx.imageSmoothingEnabled=false;
 const now=performance.now();
 pet={day_minute:model.dayMinute,snack_stock:Math.max(0,Math.min(3,model.stock||0)),poo_count:Math.max(0,Math.min(3,model.poo||0)),cleanliness:model.clean||0,plumpness:Math.max(0,Math.min(3,model.plump||0))};
 const state=model.sleeping?PET_TIRED:model.food<=25?PET_HUNGRY:model.energy<=20||pet_is_night()?PET_TIRED:model.mood<=10?PET_SULKING:model.mood<=40||model.clean<=25?PET_BORED:PET_HAPPY;
 const age=now-(model.lastAnimAt||0),action=age<3100?(model.lastAnim||0):0,playing=now-(model.lastNoteAt||0)<800;
 const walking=!model.sleeping&&!model.paused&&!action&&((now/1000)%11<7);
 const dx=walking?Math.trunc(Math.sin(now/1200)*10):0,blink=now%4300<150,hand=Math.trunc(now/260)%2;
 pet_room(model.sleeping?1:0,model.dayMinute,now);
 pet_character(state,model.sleeping?1:0,blink?1:0,playing?1:0,hand,dx,walking?1:0,0,action,Math.max(0,age));
};
})();
