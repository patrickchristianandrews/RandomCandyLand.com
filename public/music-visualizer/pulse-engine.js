/* Candy Pulse: hypnotic geometry renderer. Original local canvas effects; no uploads. */
(()=>{'use strict';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const band=(bins,a,b)=>{if(!bins?.length)return 0;let lo=Math.floor(a*bins.length),hi=Math.max(lo+1,Math.floor(b*bins.length)),sum=0;for(let i=lo;i<hi;i++)sum+=bins[i];return sum/(hi-lo)/255;};
const state={bass:0,mid:0,high:0,pulse:0,beatAt:0,baseline:.12,particles:[],frame:0,lastSize:'',lastMode:'',turn:0};
const polygon=(g,r,n,phase,color,opacity,width=1.4)=>{
 g.beginPath();for(let k=0;k<=n;k++){let a=TAU*k/n+phase;let x=Math.cos(a)*r,y=Math.sin(a)*r;if(k)g.lineTo(x,y);else g.moveTo(x,y);}
 g.closePath();g.globalAlpha=opacity;g.lineWidth=width;g.strokeStyle=color;g.stroke();
};
const petals=(g,r,n,rotation,energy,colors,density)=>{
 g.save();g.rotate(rotation);
 for(let layer=0;layer<Math.min(6,2+Math.round(density/2));layer++){
  const sides=n+layer*2,inner=r*(.20+layer*.145),length=r*(.22+layer*.1)*(1+energy*.55);
  g.beginPath();for(let i=0;i<sides;i++){
   const a=TAU*i/sides+(layer%2?Math.PI/sides:0),tip=a+Math.PI/sides,next=a+TAU/sides;
   g.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
   g.quadraticCurveTo(Math.cos(tip)*(inner+length),Math.sin(tip)*(inner+length),Math.cos(next)*inner,Math.sin(next)*inner);
  }
  g.strokeStyle=colors[(layer+Math.floor(state.frame/180))%colors.length];g.globalAlpha=.35+layer*.09;g.lineWidth=1.1+(layer===3?.6:0);g.stroke();
 }
 g.restore();
};

/* Retro presets: audio spectrum rendered directly, without video decoding or external libraries. */
function retro(g,o,st,twist,R,cols,n,D,energy){
 const TAU2=Math.PI*2, {w,h,mode,data,active=false,glow=12}=o;
 const cx=w/2,cy=h/2,bass=st.bass,mid=st.mid,high=st.high,beat=st.pulse;
 const sample=(u)=>{
   if(!data||!data.length)return .1+.07*Math.sin(u*42+twist*3);
   const at=Math.max(0,Math.min(data.length-1,Math.floor(Math.pow(u,1.6)*data.length*.85)));
   return active ? Math.min(1.5,(data[at]||0)/255*(+o.sensitivity||1.3)) : .09+.075*Math.sin(u*38+twist*2);
 };
 g.save();g.translate(cx,cy);g.lineJoin='round';g.lineCap='round';
 const blur=Math.min(16,glow*.72);
 if(mode==='spectrum'){
   const count=Math.min(128,Math.max(56,Math.floor(w/9))),start=R*.38+beat*R*.1;
   g.rotate(twist*.055);
   for(let ring=0;ring<2;ring++){
    g.beginPath();g.arc(0,0,start*(ring?1.3:1),0,TAU2);
    g.lineWidth=ring?1.2:2;g.strokeStyle=cols[ring%cols.length];g.globalAlpha=.28+.32*beat;g.stroke();
   }
   for(let i=0;i<count;i++){
     const u=i/count,angle=u*TAU2-Math.PI/2,amp=sample(u);
     const radius=start,span=R*(.08+amp*.77)*(1+beat*.28);
     const x=Math.cos(angle),y=Math.sin(angle);
     g.beginPath();g.moveTo(x*radius,y*radius);g.lineTo(x*(radius+span),y*(radius+span));
     g.strokeStyle=cols[Math.floor(u*cols.length*4)%cols.length];g.lineWidth=1.5+(i%4===0?1.3:0);
     g.globalAlpha=.66+.27*Math.min(1,amp);g.shadowBlur=(i%3===0?blur:0);g.shadowColor=g.strokeStyle;g.stroke();
   }
   g.shadowBlur=0;g.globalAlpha=.65;
   for(let j=0;j<3;j++){g.beginPath();g.arc(0,0,R*(.13+j*.065)+beat*5,0,TAU2);g.strokeStyle=cols[(j+1)%cols.length];g.lineWidth=1.3;g.stroke();}
 }else if(mode==='scope'){
   const waveform=o.wave||[],points=Math.min(512,Math.max(180,Math.floor(w/3)));
   g.rotate(Math.sin(twist*.12)*.08);
   for(let ribbon=0;ribbon<6;ribbon++){
    const offset=(ribbon-2.5)*R*.28;
    g.beginPath();
    for(let i=0;i<=points;i++){
      const u=i/points,x=(u-.5)*w*.9;
      const signal=waveform.length ? ((waveform[Math.min(waveform.length-1,Math.floor(u*waveform.length))]-128)/128) : Math.sin(u*TAU2*4+twist*5);
      const wobble=Math.sin(u*TAU2*(3+ribbon*.27)+twist*(2+ribbon*.11))*R*.075;
      const y=offset+signal*R*(.34+energy*.46)+wobble+Math.sin(twist*.58+ribbon)*R*.05;
      if(i)g.lineTo(x,y);else g.moveTo(x,y);
    }
    g.globalAlpha=.36+ribbon*.095;g.lineWidth=ribbon===2?2.7:1.3;
    g.strokeStyle=cols[ribbon%cols.length];g.shadowColor=g.strokeStyle;g.shadowBlur=ribbon===2?blur:4;g.stroke();
   }
 }else if(mode==='starfield'){
   const vanishing=R*(.1+beat*.2),travel=twist*.45;
   for(let row=0;row<26;row++){
     const depth=((row/26+travel)%1+1)%1;
     const perspective=depth*depth;
     const radius=vanishing+R*1.8*perspective;
     const spin=twist*.20+depth*.6;
     g.beginPath();
     const sides=n+((row%3)*2);
     for(let i=0;i<=sides;i++){
       const a=i*TAU2/sides+spin;
       const skew=1+.12*Math.sin(a*3+twist*.4);
       const x=Math.cos(a)*radius*skew,y=Math.sin(a)*radius*.84*skew;
       if(i)g.lineTo(x,y);else g.moveTo(x,y);
     }
     g.closePath();g.strokeStyle=cols[row%cols.length];
     g.globalAlpha=.1+.7*perspective;g.lineWidth=.7+2*perspective;g.shadowBlur=row%4===0?blur:0;g.shadowColor=g.strokeStyle;g.stroke();
   }
   g.shadowBlur=0;
   for(let i=0;i<Math.min(90,26+D*7);i++){
      const z=((i*.61803398875+travel)%1+1)%1;
      const ang=i*2.399963+twist*.12,rad=R*1.8*z*z,star=1+z*3+beat;
      g.beginPath();g.arc(Math.cos(ang)*rad,Math.sin(ang)*rad,star,0,TAU2);
      g.fillStyle=cols[i%cols.length];g.globalAlpha=.18+z*.7;g.fill();
   }
 }else if(mode==='plasma'){
   // Mirrored luminous ribbons and counter-rotating polygon rosettes.
   const spokes=n*2,loops=Math.min(13,5+D);
   for(let layer=0;layer<4;layer++){
     g.save();g.rotate(twist*(layer%2?.16:-.21)+layer*.45);
     for(let i=0;i<spokes;i++){
       const angle=i*TAU2/spokes,base=angle+Math.sin(twist*.27+layer)*.09;
       g.beginPath();
       for(let p=0;p<=loops*3;p++){
         const u=p/(loops*3),r=R*(.06+u*.98)*(1+beat*.13);
         const a=base+Math.sin(u*TAU2*(1.4+layer*.2)+twist*.68+layer)*(.12+.19*u)+u*u*.62;
         const x=Math.cos(a)*r,y=Math.sin(a)*r;
         if(p)g.lineTo(x,y);else g.moveTo(x,y);
       }
       g.strokeStyle=cols[(layer+i)%cols.length];g.globalAlpha=.18+.15*energy+layer*.045;g.lineWidth=.7+layer*.25;
       g.shadowColor=g.strokeStyle;g.shadowBlur=(i%3===0)?blur:0;g.stroke();
     }
     g.restore();
   }
   g.shadowBlur=0;
   for(let j=0;j<9;j++){
     const r=R*(.15+j*.094)*(1+beat*.15),sides=n+j%4*2;
     polygon(g,r,sides,twist*(j%2?.11:-.16)+j*.31,cols[j%cols.length],.15+j*.045,1.1);
   }
 }
 g.restore();g.globalAlpha=1;g.shadowBlur=0;g.globalCompositeOperation='source-over';
}

function render(g,o){
 const {w,h,time,data,wave,cols,active=false,sensitivity=1.3,glow=15,mode='hypno',symmetry=8,density=6,trails=.65,speed=1,reduced=false}=o;
 const st=state,metric=w+'x'+h;if(metric!==st.lastSize){st.lastSize=metric;g.fillStyle='#050515';g.fillRect(0,0,w,h);st.particles=[];}
 if(mode!==st.lastMode){st.lastMode=mode;st.particles=[];}
 st.frame++;
 const idle=active?1:.23,k=.15;
 st.bass+=(clamp(band(data,.001,.075)*sensitivity,0,1.5)*idle-st.bass)*k;
 st.mid+=(clamp(band(data,.075,.38)*sensitivity,0,1.5)*idle-st.mid)*k;
 st.high+=(clamp(band(data,.38,.85)*sensitivity,0,1.5)*idle-st.high)*k;
 const energy=st.bass*.5+st.mid*.33+st.high*.17;
 const rising=st.bass>st.baseline*1.27+.075&&st.bass>.17;
 if(rising&&time-st.beatAt>.22&&active){st.beatAt=time;st.pulse=1;}
 st.baseline=st.baseline*.97+st.bass*.03;
 st.pulse*=.93;
 const motion=(reduced?.15:1)*speed*1.3,twist=time*motion;
 const f=clamp(1-trails,0.08,.95);
 g.globalCompositeOperation='source-over';
 g.fillStyle='rgba(3,4,14,'+f.toFixed(3)+')';g.fillRect(0,0,w,h);
 const cx=w/2,cy=h/2,R=Math.min(w,h)*.38,core=R*(.55+.16*st.bass+.09*Math.sin(twist*.75));
 const background=g.createRadialGradient(cx,cy,5,cx,cy,Math.max(w,h)*.7);
 background.addColorStop(0,cols[0]+'14');background.addColorStop(.55,cols[2]+'08');background.addColorStop(1,'#05051508');
 g.fillStyle=background;g.fillRect(0,0,w,h);
 g.save();g.translate(cx,cy);g.lineJoin='round';g.lineCap='round';g.shadowBlur=clamp(glow*(w<520?.58:1),0,18);g.shadowColor=cols[0];
 const n=clamp(Math.round(symmetry),4,16),D=clamp(Math.round(density),2,10);
 const isClassic=['orbit','bars','wave','bloom'].includes(mode);
 if(['plasma','starfield','spectrum','scope'].includes(mode)){
  g.restore();retro(g,o,st,twist,R,cols,n,D,energy);
  return;
 }else if(mode==='bars'||mode==='wave'){
  g.restore();g.save();g.lineJoin='round';g.lineCap='round';g.shadowBlur=glow;
  if(mode==='bars'){
   const count=Math.round(clamp(w/6,36,160));const bw=(w-36)/count;
   for(let i=0;i<count;i++){
    const v=active?clamp((data[Math.floor((i/count)*data.length*.85)]||0)/255*sensitivity,0,1.25):(.10+.08*Math.sin(twist*2+i*.15));
    const height=Math.max(3,v*h*.72);
    g.shadowColor=cols[i%cols.length];g.fillStyle=cols[i%cols.length];
    g.globalAlpha=.78;g.fillRect(18+i*bw,h*.87-height,bw*.65,height);
    g.globalAlpha=.15;g.fillRect(18+i*bw,h*.88,bw*.65,Math.min(height*.3,h*.1));
   }
  }else{
   for(let layer=0;layer<5;layer++){
    g.beginPath();g.strokeStyle=cols[layer%cols.length];g.shadowColor=cols[layer%cols.length];g.globalAlpha=.58;g.lineWidth=layer===0?2.4:1.2;
    for(let i=0;i<=220;i++){const x=w*i/220;const v=Math.sin(i*.054+twist*(1.1+layer*.16))*h*(.045+.018*layer);const amp=(st.bass*.12+st.mid*.10+.035)*h;const y=h*.5+v+Math.sin(i*.17+layer*.8-twist)*amp*(1-layer*.13);if(i)g.lineTo(x,y);else g.moveTo(x,y);}
    g.stroke();
   }
  }
 }else{
  const shape=(rad,sides,phase,color,alpha,width)=>polygon(g,rad,sides,phase,color,alpha,width);
  if(['hypno','mandala','kaleido','bloom','orbit','auto'].includes(mode)){
   const layers=mode==='orbit'?5:mode==='bloom'?6:9;
   for(let j=layers;j>0;j--){
    const a=twist*(j%2?-.13:.16)+j*.31+Math.sin(twist*.22)*.27;
    shape(R*(.17+j*.093)+st.pulse*12*(j/layers),n+(j%4)*2,a,cols[j%cols.length],.15+j*.053,1+(j%3)*.25);
   }
   petals(g,core,n,twist*.26,energy,cols,D);
   g.save();g.rotate(-twist*.17);
   petals(g,core*.88,n,twist*.35,energy,cols,D);
   g.restore();
   // Kaleidoscope filaments create evolving mirrored, self-similar detail.
   const filaments=mode==='orbit'?n*2:n*D*2;
   for(let i=0;i<filaments;i++){
    const a=TAU*i/filaments+twist*.12,r0=R*.19,r1=R*(.55+.1*Math.sin(twist*.5+i*.21));
    const bend=.25*Math.sin(twist*.9+i*.71)+st.mid*.18;
    g.beginPath();g.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);
    g.quadraticCurveTo(Math.cos(a+bend)*r1,Math.sin(a+bend)*r1,Math.cos(a+Math.PI/n)*R*.96,Math.sin(a+Math.PI/n)*R*.96);
    g.strokeStyle=cols[i%cols.length];g.globalAlpha=.12+.20*st.high;g.lineWidth=.6;g.stroke();
   }
  }else if(mode==='tunnel'||mode==='vortex'){
   for(let j=26;j>=0;j--){
    let phase=((j/27+twist*.12)%1+1)%1;
    const z=(mode==='vortex'?Math.pow(phase,.75):phase),rad=R*(.08+1.65*z);
    shape(rad,n+(j%3)*2,twist*(mode==='vortex'?.36:-.12)+j*.065,cols[j%cols.length],.11+.55*(1-phase),.65+phase*1.7);
   }
   for(let i=0;i<n*3;i++){
    const a=i*TAU/(n*3)+Math.sin(twist*.23)*.25;
    g.beginPath();g.moveTo(Math.cos(a+twist*.24)*R*.1,Math.sin(a+twist*.24)*R*.1);
    g.lineTo(Math.cos(a+twist*.1)*R*1.65,Math.sin(a+twist*.1)*R*1.65);
    g.strokeStyle=cols[i%cols.length];g.globalAlpha=.12+.25*st.bass;g.lineWidth=.75;g.stroke();
   }
  }else if(mode==='lissajous'){
   for(let layer=0;layer<Math.min(8,D);layer++){
    const p=twist*(.13+layer*.04),a=2+(layer%4),b=3+((layer+2)%5);
    g.beginPath();
    for(let i=0;i<=500;i++){
     const q=TAU*i/500;
     const x=Math.sin(a*q+p+layer*.15)*R*(.94-layer*.055),y=Math.sin(b*q+p*.68)*R*(.94-layer*.04);
     if(i)g.lineTo(x,y);else g.moveTo(x,y);
    }
    g.strokeStyle=cols[layer%cols.length];g.globalAlpha=.25+layer*.07+st.mid*.12;g.lineWidth=1.3;g.stroke();
   }
  }
  // Pulse shockwaves, concentric highlights, and orbiting light nodes.
  for(let j=0;j<4;j++){
   const r=R*(.34+j*.19)+(st.pulse*40)*(1-j/5);
   g.beginPath();g.arc(0,0,r,0,TAU);g.strokeStyle=cols[(j+1)%cols.length];g.globalAlpha=.1+st.pulse*.23;g.lineWidth=1.2;g.stroke();
  }
  for(let i=0;i<n*2;i++){
   const a=TAU*i/(n*2)+twist*(i%2?.22:-.2),r=R*(.43+.35*Math.sin(twist*.21+i*.8)**2);
   g.beginPath();g.arc(Math.cos(a)*r,Math.sin(a)*r,1.2+st.high*3,0,TAU);
   g.fillStyle=cols[i%cols.length];g.globalAlpha=.3+.6*st.high;g.fill();
  }
  // Deterministic bounded particle field. Reduced density on small screens.
  const limit=Math.round(Math.min(210,Math.max(26,w*h/4500))*D/6);
  if(!reduced&&st.frame%2===0&&st.particles.length<limit){
   for(let j=0;j<(st.pulse>.5?4:1);j++){
    const angle=(st.frame*.618+j*2.399)*TAU,rad=R*(.2+.5*((st.frame*13+j*7)%97)/97);
    st.particles.push({a:angle,r:rad,life:1,v:1+(j%3)*.7,color:j%cols.length});
   }
  }
  for(let i=st.particles.length-1;i>=0;i--){
   const p=st.particles[i];p.r+=p.v*(.28+st.bass*.8);p.a+=.006*motion;p.life-=.006;
   if(p.life<=0||p.r>R*1.75){st.particles.splice(i,1);continue;}
   const px=Math.cos(p.a)*p.r,py=Math.sin(p.a)*p.r;
   g.beginPath();g.arc(px,py,Math.max(.55,p.life*(1+st.high*2)),0,TAU);
   g.fillStyle=cols[p.color];g.globalAlpha=p.life*.60;g.fill();
  }
 }
 g.restore();g.globalAlpha=1;g.shadowBlur=0;g.globalCompositeOperation='source-over';
 // Vignette visually anchors the center and increases perceived depth.
 const vignette=g.createRadialGradient(cx,cy,Math.min(w,h)*.1,cx,cy,Math.max(w,h)*.7);
 vignette.addColorStop(0,'#02020c00');vignette.addColorStop(1,'#02020caa');
 g.fillStyle=vignette;g.fillRect(0,0,w,h);
}
function reset(){
 state.bass=0;state.mid=0;state.high=0;state.pulse=0;
 state.beatAt=0;state.baseline=.12;state.particles.length=0;
 state.frame=0;state.lastSize='';state.lastMode='';state.turn=0;
}
window.CandyPulseGeometry=Object.freeze({render,reset});
})();