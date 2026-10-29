/* After Dark's Candy Land liquid icing: same continuous curved silhouette as
   the Random Candy Land home page, with rounded drops and reflective glaze.
   Decorative only; never intercepts quiz, forms, links or scrolling. */
(()=>{
'use strict';
const SVG_NS='http://www.w3.org/2000/svg';
const SHAPE="M 0,0 H 1200 V 28 C 1184,31 1175,41 1158,35 C 1134,26 1122,33 1110,38 C 1091,49 1106,74 1102,87 C 1099,113 1075,121 1060,107 C 1046,94 1060,57 1047,43 C 1038,32 1018,34 1004,40 C 976,51 953,31 935,34 C 916,37 918,57 920,75 C 925,107 921,143 901,150 C 879,159 868,145 870,121 C 873,98 884,53 866,41 C 850,30 840,42 822,43 C 805,42 783,32 763,39 C 744,46 748,65 745,83 C 741,109 734,117 721,115 C 703,112 705,94 710,73 C 714,54 704,38 683,39 C 663,40 648,33 628,38 C 609,44 612,55 614,71 L 618,139 C 620,163 609,176 591,175 C 569,175 561,161 567,140 C 574,115 574,80 561,56 C 550,36 533,38 516,42 C 497,46 481,31 463,36 C 446,40 443,54 448,76 C 453,103 447,119 430,120 C 413,121 409,106 414,87 C 420,63 416,48 398,42 C 373,34 358,47 341,39 C 323,31 307,37 300,50 C 289,68 303,101 302,134 C 302,156 289,168 270,163 C 252,159 251,140 256,119 C 260,94 267,64 248,44 C 234,30 214,44 197,43 C 176,42 164,30 144,37 C 131,42 130,56 134,74 C 140,101 128,117 112,115 C 93,113 97,95 102,72 C 105,51 92,36 76,38 C 58,40 49,32 37,37 C 19,44 23,57 20,75 C 16,92 7,94 0,85 Z";
const COLORS={
 bubblegum:['#ffcaed','#ff68c5','#b91d99'],
 peach:['#fff0ac','#ff9991','#df42a1'],
 blueberry:['#b2faff','#53c6f6','#6853dc'],
 grape:['#e4aaff','#ae62ef','#7727b7'],
 lemon:['#fffbbd','#ffdf6b','#ff7eb3']
};
let serial=0;
const svgNode=(tag,attrs={})=>{
 const node=document.createElementNS(SVG_NS,tag);
 Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
 return node;
};
function liquidGoo(palette,kind){
 const [light,base,shade]=COLORS[palette]||COLORS.bubblegum;
 const id='ad-liquid-'+(++serial),fillId=id+'-fill',shineId=id+'-shine';
 const svg=svgNode('svg',{
  class:'ad-liquid-goo ad-liquid-'+kind,
  viewBox:'0 0 1200 182',
  preserveAspectRatio:'none',
  'aria-hidden':'true',
  focusable:'false',
  'data-candy-goo':palette
 });
 const defs=svgNode('defs');
 const gradient=svgNode('linearGradient',{id:fillId,x1:'0',y1:'0',x2:'.18',y2:'1'});
 [[light,'0'],[base,'.32'],[base,'.7'],[shade,'1']].forEach(([color,offset])=>{
  gradient.appendChild(svgNode('stop',{'stop-color':color,offset}));
 });
 const shine=svgNode('linearGradient',{id:shineId,x1:'0',y1:'0',x2:'0',y2:'1'});
 shine.append(
  svgNode('stop',{'stop-color':'#ffffff','stop-opacity':'.89',offset:'0'}),
  svgNode('stop',{'stop-color':'#ffffff','stop-opacity':'.04',offset:'1'})
 );
 defs.append(gradient,shine);
 svg.append(defs,svgNode('path',{d:SHAPE,fill:'url(#'+fillId+')','data-goo-outline':'true'}));
 svg.append(svgNode('path',{
  d:'M 16 16 C 98 12 117 23 196 17 S 309 18 371 17 S 485 14 550 17 S 673 16 742 18 S 861 14 939 17 S 1091 21 1185 17',
  stroke:'url(#'+shineId+')','stroke-width':'10','stroke-linecap':'round',fill:'none',opacity:'.85'
 }));
 [
  {d:'M 892 78 Q 888 99 891 115',width:'7',opacity:'.54'},
  {d:'M 591 90 Q 585 112 591 136',width:'9',opacity:'.56'},
  {d:'M 279 91 Q 273 113 277 129',width:'6',opacity:'.51'}
 ].forEach(s=>svg.append(svgNode('path',{d:s.d,fill:'none',stroke:light,
  'stroke-width':s.width,'stroke-linecap':'round',opacity:s.opacity})));
 svg.append(
  svgNode('ellipse',{cx:722,cy:88,rx:5,ry:11,fill:'#ffffff',opacity:'.47',transform:'rotate(18 722 88)'}),
  svgNode('ellipse',{cx:1090,cy:85,rx:4,ry:9,fill:'#ffffff',opacity:'.42',transform:'rotate(20 1090 85)'})
 );
 return svg;
}
function coat(selector,kind,palettes){
 const colors=Array.isArray(palettes)?palettes:[palettes];
 document.querySelectorAll(selector).forEach((node,i)=>{
  if(node.classList.contains('ad-goo-coated'))return;
  node.classList.add('ad-goo-coated','ad-goo-'+kind);
  node.appendChild(liquidGoo(colors[i%colors.length],kind));
 });
}
function decorate(){
 coat('.top','header','bubblegum');
 coat('.gate > .card','gate','grape');
 coat('.afterdark-home-hero','hero','bubblegum');
 coat('.ad-practical-guides-teaser','teaser','peach');
 coat('.afterdark-feature-card','tile',['bubblegum','grape']);
 coat('.afterdark-fast-card','tile',['blueberry','peach','grape']);
 coat('.afterdark-section-card','tile',['bubblegum','grape','blueberry','peach']);
 coat('.ad-section-art-banner','banner',['bubblegum','grape','blueberry','bubblegum','peach']);
 coat('.howto-highlight','highlight',['bubblegum','peach','grape','blueberry']);
 coat('.howto-guide-card','guidecard',['bubblegum','grape','blueberry','peach']);
 coat('.footer','footer','lemon');
}
decorate();
const grid=document.getElementById('howto-guide-grid');
if(grid){
 const observer=new MutationObserver(()=>coat('.howto-guide-card','guidecard',['bubblegum','grape','blueberry','peach']));
 observer.observe(grid,{childList:true});
}
window.AfterDarkCandyGoo={version:1,count:()=>document.querySelectorAll('.ad-liquid-goo').length};
})();
