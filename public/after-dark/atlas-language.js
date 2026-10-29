/* Ask Atlas: forgiving, on-device topic lookup with typo and synonym handling.
   A relevance ranking is not a scientific probability or a generated AI answer. */
(()=>{
'use strict';
const norm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
 .replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const aliases={
 'strap on':'pegging','strapon':'pegging','strapon play':'pegging','strap on play':'pegging',
 'strap ons':'pegging','strap ons play':'pegging','strapper':'pegging','peggin':'pegging',
 'bottoming':'anal','butt':'anal','ass':'anal','rear':'anal','backdoor':'anal','back door':'anal',
 'anal play':'anal','booty':'anal','prostrate':'prostate','prostste':'prostate',
 'good girl':'praise','good boy':'praise','being good':'praise','compliments':'praise','compliment':'praise',
 'praising':'praise','adored':'praise','worshipped':'praise',
 'being told what to do':'dominance','bossy':'dominance','dom':'dominance','sub':'submission',
 'submissve':'submission','domme':'dominance','d s':'dominance','power play':'dominance',
 'control kink':'dominance','role reversal':'switching','switching roles':'switching',
 'cuffed':'restraint','cuffs':'restraint','tied up':'restraint','tied':'restraint','bondge':'bondage','bondage':'restraint',
 'breath play':'breath control','choking':'breath control','choked':'breath control',
 'edgin':'edging','orgasm denial':'edging','climax control':'edging','orgasm control':'edging',
 'roughness':'intensity','spanking':'impact','paddles':'impact',
 'feet':'foot','toes':'foot','toe':'foot','footjob':'foot','heels':'footwear','stockings':'hosiery','pantyhose':'hosiery',
 'lace':'textured fabrics','silk':'textured fabrics','latex':'latex','leather':'leather',
 'face sitting':'oral','facesitting':'oral','going down':'oral','eating out':'oral','head':'oral',
 'eaten out':'oral','eat out':'oral','cunnilingus':'oral','fellatio':'oral',
 'gender swap':'role reversal','crossdressing':'gender expression','cross dressing':'gender expression',
 'watching':'watched','voyeur':'watched','exhibitionism':'watched','being seen':'watched',
 'sexting':'digital intimacy','nudes':'digital intimacy','intimate pics':'digital intimacy',
 'after care':'aftercare','sub drop':'subdrop','dom drop':'domdrop','after effects':'aftercare',
 'safe word':'safeword','safe words':'safeword','stop word':'safeword',
 'threesomes':'nonmonogamy','threesome':'nonmonogamy','open relationship':'nonmonogamy',
 'sharing my partner':'nonmonogamy','compersion':'compersion','cuckolding':'jealousy',
 'petplay':'pet play','puppy play':'pet play','collars':'collar','leashes':'collar',
 'dirty talking':'dirty talk','filthy talk':'dirty talk','talk dirty':'dirty talk',
 'humilated':'humiliation','humilitation':'humiliation','degrade':'degradation',
 'orgasms':'orgasm','grinding':'sensation','touches':'touch','massage':'massage',
 'why am i into':'why like','why do i like':'why like',
 'what turns me on':'why like','why is it hot':'why like',
 'atlee':'atlas','ask atlee':'ask atlas'
};
const replacements=Object.entries(aliases).sort((a,b)=>b[0].length-a[0].length);
const stop=new Set('i me my myself am is are was were be being been we our us you your he she him her they them it its a an the do does did what why who how where when which can could should would might will for from this that those these like liking loved love enjoy enjoyed interest interested into in on to of with and or but so because about at as by someone something person people partner partners boyfriend girlfriend wife husband spouse relationship adult adults sex sexual kink fetish thing stuff things really very more certain specific kind types type some any also other just tell explain mean meaning please'.split(' '));
const stem=w=>w.endsWith('ies')&&w.length>5?w.slice(0,-3)+'y':w.endsWith('ing')&&w.length>6?w.slice(0,-3):w.endsWith('ed')&&w.length>6?w.slice(0,-2):w.endsWith('s')&&w.length>5&&!w.endsWith('ss')?w.slice(0,-1):w;
const words=s=>[...new Set(norm(s).split(' ').filter(x=>x.length>=3&&!stop.has(x)).map(stem))];
function levenshtein(a,b){
 if(Math.abs(a.length-b.length)>2)return 3;
 let prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=0;i<a.length;i++){
  const curr=[i+1];
  for(let j=0;j<b.length;j++)curr[j+1]=Math.min(curr[j]+1,prev[j+1]+1,prev[j]+(a[i]===b[j]?0:1));
  prev=curr;
 }
 return prev[b.length];
}
function expand(question){
 let text=' '+norm(question)+' ';
 const found=[];
 for(const [phrase,replacement] of replacements){
  const search=' '+phrase+' ';
  if(text.includes(search)){
   found.push(replacement);
   text=text.replace(search,' '+replacement+' ');
  }
 }
 const tokens=words(text+' '+found.join(' '));
 return {text:norm(text),tokens,found,original:norm(question)};
}
const usefulTags={control:'the ability to choose, lead or follow',trust:'trust and freedom to say no',ritual:'a meaningful shared ritual',sensation:'physical or sensory experience',associations:'personal memories and learned associations',aesthetics:'visual style, clothing or texture',narrative:'storytelling and imagined roles',novelty:'newness and discovery',anticipation:'suspense and timing',affirmation:'feeling noticed and valued',attachment:'closeness and emotional reassurance',taboo:'the contrast between fantasy and ordinary expectations'};
function candidates(q,context){
 const rows=(context.topics||[]).map(t=>({...t,kind:'topic'}));
 for(const faq of context.faqs||[])rows.push({name:faq[0],description:faq[1],tags:[],kind:'faq',cat:'Common questions'});
 const searched=expand(q),tokens=searched.tokens;
 const relevant=[];
 for(const t of rows){
  const title=norm(t.name),titleWords=words(t.name),descWords=words(t.description).slice(0,60);
  const titleSet=new Set(titleWords),descSet=new Set(descWords);
  const tagSet=new Set((t.tags||[]).map(stem));
  let score=0,matched=0,major=0;
  if(title&&searched.text.includes(title)&&title.length>=5){score+=11;major++;}
  for(const term of tokens){
   if(titleSet.has(term)){score+=5;matched++;major++;continue;}
   if(tagSet.has(term)){score+=1.1;matched++;continue;}
   if(descSet.has(term)){score+=0.55;matched++;continue;}
   const near=titleWords.some(x=>x.length>=5&&term.length>=5&&levenshtein(term,x)<=(Math.min(term.length,x.length)>=8?2:1));
   if(near){score+=3.4;matched++;major++;continue;}
  }
  // Avoid accidental "sex" or "adult" terms being treated as relevance.
  if(score>0)relevant.push({t,score:score+matched/Math.max(2,tokens.length),major,matched});
 }
 relevant.sort((a,b)=>b.score-a.score||b.major-a.major||a.t.name.localeCompare(b.t.name));
 return {relevant,tokens};
}
function answer(question,context){
 const q=norm(question);if(!q)return null;
 const {relevant,tokens}=candidates(question,context);
 const first=relevant[0];
 const isWhy=/\b(why|cause|reasons?|attraction|appeal|enjoy|enjoying|desire|like|liking|turn on)\b/.test(q);
 const isPartner=/\b(partner|wife|husband|girlfriend|boyfriend|spouse|relationship|someone else|share|tell them|talk to them|bring up|discuss|explain to)\b/.test(q);
 const isSafety=/\b(safe|risk|danger|hurt|health|clean|hygiene|consent|boundaries|how to do)\b/.test(q);
 const isTalk=/\b(tell|talk|communicat|listen|ask|respond|discuss|bring up|explain|decline|rejection|accept)\b/.test(q);
 if(isPartner&&(isTalk||/\b(how|what|why)\b/.test(q))){
  const subject=first?.score>=3.3?first.t:null;
  return 'Start with an invitation, not a demand: “There is something personal I want to explain, and you do not have to agree or participate. Would you be open to hearing about it?”\n\n'+
  (subject?'About '+subject.name+': '+subject.description+'\n\nPossible reasons it matters: '+(subject.tags||[]).slice(0,3).map(t=>usefulTags[t]).filter(Boolean).join(', ')+'.\n\n':'')+
  'A useful three-part conversation:\n1. What it means to me: describe the feeling or story, not just the activity.\n2. What I am and am not asking: explain whether this is fantasy-only, a question, or something you might discuss trying.\n3. What you think: invite curiosity, questions, time, or an unqualified no.\n\n'+
  'The listener can say: “Thank you for trusting me. I can listen and ask questions, but I am not agreeing to participate.” Neither person should push the other toward a yes. You can revisit later only if both want to.';
 }
 if(!first||first.score<2.8||(!first.major&&first.score<5)){
  const proposals=relevant.filter(x=>x.major&&x.score>=2.2).slice(0,3).map(x=>x.t.name);
  if(proposals.length)return 'I am not completely sure which topic you mean. Did you mean '+proposals.join(', ')+ '? You can use a shorter phrase or a keyword, and I will explain the closest match rather than guessing.';
  return 'I could not match an Atlas topic confidently from that phrasing. Try one or two keywords, or name the experience—for example “pegging,” “praise kink,” “why do I like restraint,” “aftercare,” or “talk to my partner about a fantasy.”';
 }
 const t=first.t;
 const why=(t.tags||[]).slice(0,4).map(k=>usefulTags[k]).filter(Boolean);
 let reply=(isWhy?'One possible explanation for enjoying ':'About ')+t.name+': '+t.description;
 if(isWhy||/psycholog|meaning|feel|emotion|reason/.test(q))
  reply+='\n\nPeople might connect with this because of '+(why.length?why.join(', '):'personal feelings, imagination and the context')+'. These are possibilities to reflect on—not a way to infer your identity or diagnose a cause.';
 if(isSafety)reply+='\n\nIf considering any real-world activity, discuss specific limits, comfort, sexual health or injury risks, and ongoing consent. Some physical practices require specialized professional safety knowledge.';
 if(isTalk)reply+='\n\nTry asking: “What part of this interests you, and which parts would you prefer to keep imaginary?”';
 const alternatives=relevant.slice(1).filter(x=>x.major&&x.score>=first.score*0.63).slice(0,2).map(x=>x.t.name);
 if(alternatives.length)reply+='\n\nRelated Atlas topics: '+alternatives.join(' · ')+'.';
 reply+='\n\nFor your own reflection: is the appeal mostly sensation, attention, power, trust, anticipation, aesthetics or a specific story?';
 return reply;
}
window.AtlasFlexibleSearch=Object.freeze({answer,rank:candidates});
})();