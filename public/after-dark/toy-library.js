/* Unwrapped Toy Library: adult sexual-wellness education and conservative self-report matching.
 * No purchases, affiliate links, network calls, tracking, diagnosis or inferred orientation.
 * Quiz suggestions rely on directly selected interests; fantasy-only stays reading-only.
 */
(()=>{
'use strict';
const TOYS=[
 {id:'wand',icon:'✦',group:'External stimulation',name:'Wand massager',summary:'A larger handheld vibrator with adjustable intensity.',uses:[
 'External stimulation around the vulva or clitoral hood, according to personal comfort.',
 'External sensation around the perineum or other intact, sensitive skin.',
 'Over thin clothing or a soft fabric barrier when direct contact feels too intense.',
 'A partner can hold or guide it with permission; some wands are also designed for ordinary body massage.'
 ],safety:'Generally for external use only unless the specific product explicitly permits an attachment and the intended use. Start low; stop for numbness, pain or irritation.',tags:['vibrat','clitor','vulva','external','sensory','massage','toy','pleasure'],extra:'A broad, adjustable option if your direct answers mention external sensation or vibration.'},
 {id:'bullet',icon:'◇',group:'External stimulation',name:'Bullet vibrator',summary:'Small, portable and typically intended for external contact.',uses:[
 'Focused external sensation around the clitoral hood or vulva.',
 'Light external touch around the perineum or other intact body areas.',
 'A partner can use it during mutually agreed intimacy or conversation about preferences.',
 'A compact alternative for people who prefer lighter equipment or adjustable settings.'
 ],safety:'Do not insert a small external-only bullet into the anus, where it can become trapped; never assume waterproofing or insertability. Check the maker’s specifications.',tags:['vibrat','clitor','vulva','external','compact','sensory','toy'],extra:'Might suit someone who prefers focused, adjustable external sensation.'},
 {id:'air-pulse',icon:'◉',group:'External stimulation',name:'Air-pulse stimulator',summary:'A contact-style external device using pulses of air or pressure variation.',uses:[
 'Focused external clitoral-area sensation without relying solely on surface vibration.',
 'Comparing different pulse levels and patterns at a comfortable pace.',
 'An alternative to a wand or bullet for someone exploring varied kinds of external sensation.',
 'A partner may help choose the setting if both people welcome that.'
 ],safety:'Choose a device intended for the relevant external anatomy, follow fit instructions and stop if suction or pressure is uncomfortable. Not for internal use.',tags:['clitor','vulva','external','sensory','novel','toy','vibrat'],extra:'A different external sensory option when clitoral-area interests are directly selected.'},
 {id:'insertable-vibe',icon:'✧',group:'Internal options',name:'Insertable vibrator',summary:'A smooth device manufactured for vaginal use, sometimes with external settings.',uses:[
 'Comfortable vaginal stimulation when insertion is personally welcome.',
 'Some designs also work externally on the vulva or other intact skin.',
 'A partner can help hold a suitable device when everyone agrees.',
 'Compare shape, handle design, intensity and ease of cleaning rather than assuming bigger is better.'
 ],safety:'Use nonporous body-safe materials and compatible lubricant. Vaginal-rated does NOT mean anal-safe; anal insertion requires a design expressly rated for it with a flared base.',tags:['vagin','insert','penetrat','internal','toy','vibrat','pelvic'],extra:'Worth learning about if vaginal or insertable stimulation was explicitly selected.'},
 {id:'dildo',icon:'◈',group:'Internal options',name:'Body-safe dildo',summary:'A non-vibrating, purpose-made device with different shapes, sizes and materials.',uses:[
 'Vaginal insertion when the person involved wishes to explore that sensation.',
 'External contact for people who do not want penetration.',
 'A compatible model can be paired with a harness for agreed partnered use.',
 'An expressly anal-safe design with a wide flared base may be used for anal exploration.'
 ],safety:'Choose smooth, nonporous materials, clean between uses and never use an unflared model anally. Check size and design for the intended body area.',tags:['insert','penetrat','vagin','dildo','strap','pegg','toy','internal'],extra:'Can be relevant to directly named penetration or harness interests, but not implied by orientation.'},
 {id:'prostate',icon:'⬡',group:'Anal & pelvic',name:'Prostate massager',summary:'An anatomically designed anal device for people with a prostate.',uses:[
 'A purpose-made option for adults who explicitly want to learn about prostate-area stimulation.',
 'Some models offer vibration or adjustable shapes; others work without motors.',
 'Can be explored privately or with a partner after clear agreement.',
 'External perineal massage may be preferred over internal use by some people.'
 ],safety:'Internal anal devices must have a secure flared base, a smooth surface and sufficient compatible lubricant. Stop for pain or bleeding. Avoid use where a clinician has advised against anal insertion.',tags:['prostat','anal','pegg','rectal','pelvic'],extra:'Only relevant when prostate or anal-area curiosity is directly named.'},
 {id:'anal-plug',icon:'❖',group:'Anal & pelvic',name:'Anal plug',summary:'A flared-base device designed specifically for anal insertion.',uses:[
 'An option for adults who have actively chosen to learn about anal sensations.',
 'Some designs are non-vibrating; others feature limited vibration settings.',
 'Choosing a smaller, body-safe model can prioritize comfort and control.',
 'The person using it should always be able to remove it promptly and comfortably.'
 ],safety:'A wide flared base is essential. Use plenty of compatible lubricant, never force insertion and avoid prolonged wear contrary to maker guidance. Seek medical help for a retained item or significant pain.',tags:['anal','rectal','butt','plug','pegg'],extra:'Consider only if an anal interest is directly selected; it is not a general recommendation.'},
 {id:'sleeve',icon:'▣',group:'Penis & body',name:'Penis sleeve or stroker',summary:'A soft device intended for external penile sensation.',uses:[
 'Solo exploration of comfortable, controllable sensation.',
 'Textures and materials can be compared without involving another person.',
 'Some compatible styles include vibration; others are non-powered.',
 'Partners may discuss its use as an optional shared activity.'
 ],safety:'Choose a washable product designed for the purpose, use suitable lubricant and follow material-specific care instructions. Stop for discomfort, irritation or loss of sensation.',tags:['penis','penile','stroker','sleeve','masturb','sensory','toy'],extra:'May be interesting when penile sensation or texture is directly named.'},
 {id:'ring',icon:'◎',group:'Penis & body',name:'Flexible vibrating ring',summary:'A removable penis ring, sometimes with external vibration.',uses:[
 'An option for adults interested in penile sensations and adjustable fit.',
 'Vibrating models can add external sensation for a willing partner.',
 'Some designs allow comfortable, low-intensity sensation without vibration.',
 'Discuss fit, release mechanism and limits before partnered use.'
 ],safety:'Choose flexible, easily removable material. Rings affect circulation: follow manufacturer limits, never sleep while wearing one, remove immediately for pain, numbness or color change, and consult a clinician first if you have circulation or bleeding concerns.',tags:['penis','erect','ring','vibrat','partner','toy'],extra:'A specific option to review when a person has directly selected penile or partnered vibration interests.'},
 {id:'nipple-massager',icon:'✿',group:'External stimulation',name:'External nipple/body massager',summary:'A gentle, externally rated device for people curious about breast or chest sensation.',uses:[
 'Low-intensity external sensation near the breast or chest on intact skin.',
 'Indirect contact through fabric to moderate sensitivity.',
 'Learning which settings are comfortable without concentrating on intensity.',
 'A partner may help with a gentle external massage if invited.'
 ],safety:'Avoid suction or pressure that causes bruising, numbness, skin damage or pain. Do not use on irritated or broken skin; persistent new breast or nipple symptoms need clinical assessment.',tags:['nipple','breast','chest','sensory','massage','toy'],extra:'A reading option when chest or nipple sensation is specifically selected.'},
 {id:'harness',icon:'▤',group:'Partner options',name:'Harness and compatible toy',summary:'An adjustable harness designed to hold a compatible, body-safe attachment.',uses:[
 'Learn about giver and receiver roles without assuming gender or orientation.',
 'Use with a compatible attachment in a mutually agreed adult setting.',
 'Choose fit, accessibility, easy removal and cleaning as practical criteria.',
 'Can also be a topic for discussion or fantasy without any physical trial.'
 ],safety:'Follow both the harness and attachment instructions. If any attachment is used anally it must be explicitly anal-safe with a flared base, and lubricant, comfort and consent are essential.',tags:['strap','pegg','harness','role','giving','receiving','toy','penetrat'],extra:'Relevant when strap-on or role-switching was explicitly selected, without predicting desire.'},
 {id:'remote',icon:'⌁',group:'Partner options',name:'Remote-controlled wearable vibrator',summary:'A user-operated device whose intensity may be controlled locally or through an app.',uses:[
 'The wearer can choose to adjust settings privately.',
 'A consenting partner may control settings for a limited, agreed period.',
 'Some models support remote connection, but local-only models avoid account-sharing concerns.',
 'Can be used as a conversation about trust, boundaries and technology privacy.'
 ],safety:'The wearer must retain a reliable stop control. Read app permissions and privacy terms, avoid recording intimate use and do not use in public if it involves nonconsenting bystanders.',tags:['remote','control','partner','trust','technology','vibrat','toy'],extra:'A possibility to read about if shared control or partner-led sensation was specifically selected.'},
];
const BODY_GUIDE=Object.freeze({
  "wand": {
    "male": {
      "fit": "direct",
      "note": "External penile, perineal or other intact-skin sensation; no insertion unless the specific attachment is explicitly approved."
    },
    "female": {
      "fit": "direct",
      "note": "External vulvar or clitoral-hood sensation; use a fabric barrier or lower setting if direct contact is too intense."
    },
    "together": "One person can operate it for another, or either can use it solo; communicate about intensity and change of body area."
  },
  "bullet": {
    "male": {
      "fit": "direct",
      "note": "External contact on penile shaft, perineum or other intact skin when the product permits; small bullets are not anal insertables."
    },
    "female": {
      "fit": "direct",
      "note": "Focused external sensation around the vulva or clitoral hood; adjust pressure and settings for comfort."
    },
    "together": "Small size can make it easy to use with a consenting partner, provided each person has a reliable stop option."
  },
  "air-pulse": {
    "male": {
      "fit": "not-targeted",
      "note": "Typically designed around clitoral anatomy, not for penile stimulation. A person with a penis could help operate a partner’s device if invited; do not assume it is compatible with other anatomy."
    },
    "female": {
      "fit": "direct",
      "note": "A clitoral-area model can provide localized external pulsing sensation when the fit is comfortable."
    },
    "together": "A partner can help with controls if requested; avoid assuming the device fits the other partner’s anatomy."
  },
  "insertable-vibe": {
    "male": {
      "fit": "conditional",
      "note": "Most vaginal models are not safe for anal insertion. Some may be approved for external contact only; for anal use choose a separately anal-rated model with a flared base."
    },
    "female": {
      "fit": "direct",
      "note": "A vagina-rated device may offer internal vaginal stimulation, and some models offer external vulvar settings; always check the maker’s use instructions."
    },
    "together": "A partner can assist with agreed external or vaginal use; use a fresh barrier or clean carefully when moving between body areas."
  },
  "dildo": {
    "male": {
      "fit": "conditional",
      "note": "A dildo expressly rated for anal use, with a secure wide flared base, can be considered for anal stimulation; ordinary vaginal-only models are not anal-safe."
    },
    "female": {
      "fit": "direct",
      "note": "A vagina-rated, nonporous model can be considered for vaginal use; anal use requires a separate, clearly anal-safe design."
    },
    "together": "Either partner may hold a compatible device or use it with an adjustable harness if both choose; clean between people and body areas."
  },
  "prostate": {
    "male": {
      "fit": "direct",
      "note": "For someone who has a prostate, a purpose-built, flared-base device can be explored if internal anal use is appropriate and welcome."
    },
    "female": {
      "fit": "not-targeted",
      "note": "A person without a prostate has no prostate tissue for this device to target. Do not treat a prostate-specific product as a general vaginal toy; only use it where its design permits."
    },
    "together": "A partner of any gender can assist or discuss prostate-area interests, but the person using the device decides whether to proceed."
  },
  "anal-plug": {
    "male": {
      "fit": "direct",
      "note": "An expressly anal-rated plug with a broad flared base can be used regardless of whether the person has a prostate."
    },
    "female": {
      "fit": "direct",
      "note": "The same anal-safety design rules apply for someone with a vulva; do not transfer from anus to vagina without cleaning and a fresh barrier."
    },
    "together": "Either partner may use an anal-safe product if interested; never share or transfer it between body areas without appropriate hygiene."
  },
  "sleeve": {
    "male": {
      "fit": "direct",
      "note": "A penile sleeve is shaped for external penile use, with appropriate lubricant, gentle pressure and careful cleaning."
    },
    "female": {
      "fit": "partner",
      "note": "A penis-shaped sleeve is not designed to fit the vulva or vagina. Someone with a vulva can choose to help a consenting partner use it instead."
    },
    "together": "The wearer or owner keeps control of pressure and stopping; a partner may participate by mutual agreement."
  },
  "ring": {
    "male": {
      "fit": "direct",
      "note": "An easily removable penis ring is designed for suitable penile anatomy; remove immediately for numbness, color changes or pain."
    },
    "female": {
      "fit": "partner",
      "note": "Penis rings are not designed to be worn on the vulva. A vibrating attachment may provide external partner sensation, if the product is designed for this and both want it."
    },
    "together": "A vibrating model may create external sensation for both partners; fit, circulation, easy removal and time limits are essential."
  },
  "nipple-massager": {
    "male": {
      "fit": "direct",
      "note": "For a person with chest or nipple sensitivity, low-level external massage over intact skin may be appropriate regardless of breast size."
    },
    "female": {
      "fit": "direct",
      "note": "External breast/chest or nipple-area sensation can be explored gently, including over clothing if sensitivity is high."
    },
    "together": "Each partner can try externally rated modes on their own chest area or invite the other to help, without assuming equal sensitivity."
  },
  "harness": {
    "male": {
      "fit": "direct",
      "note": "A person with a penis can wear a compatible adjustable harness, or be a receiving partner, depending on agreed roles and fit."
    },
    "female": {
      "fit": "direct",
      "note": "A person with a vulva can also wear a compatible harness or be a receiving partner; the device itself does not determine gender or role."
    },
    "together": "A harness can support shared role choices; attachments must be rated for their intended body area, especially for anal use."
  },
  "remote": {
    "male": {
      "fit": "conditional",
      "note": "Choose a wearable model explicitly manufactured for the relevant anatomy; some penile or external designs exist, but vulva-focused insertables are not universal."
    },
    "female": {
      "fit": "conditional",
      "note": "Choose a model explicitly designed for vulvar, vaginal or other intended anatomy; the label 'remote-controlled' alone does not make it insertable or safe."
    },
    "together": "Any remote play is optional and private. The wearer must retain an immediate, dependable stop control and know what data the app collects."
  }
});
const FIT_LABELS=Object.freeze({
 direct:'Can be used as designed',
 conditional:'Check model and body-area approval',
 partner:'Partner-assisted, not a direct fit',
 'not-targeted':'Not designed for this anatomy'
});
const SOURCES=[
 {label:'Planned Parenthood · Sex toys and how to use them safely',url:'https://www.plannedparenthood.org/learn/sex-pleasure-and-sexual-dysfunction/sex-and-pleasure/sex-toys'},
 {label:'American Sexual Health Association · Safer-sex toolbox',url:'https://www.ashasexualhealth.org/safer-sex-toolbox/'}
];
const make=(tag,txt,cls)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=String(txt);return node};
const normalize=s=>String(s||'').toLowerCase();
const negatives=/\b(not interested|not for me|no interest|none of these|do not want|don't want|never|avoid|skip|not appealing|prefer not to|no thanks)\b/i;
function recommendations(data){
 const answers=(data?.direct?.specificSelections||[]).filter(x=>x&&x.text&&!negatives.test(x.text));
 const interestItems=(data?.interests||[]).filter(x=>(x.directSelection===1||x.directSelection===2)&&!x.warn);
 const selected=[...answers.map(x=>({text:String(x.text),intent:x.intent||'',context:'Q'+x.questionNumber+' · '+(x.intentLabel||'Not specified')})),
   ...interestItems.map(x=>({text:x.name,intent:x.directSelection===1?'curious':'',context:'Directly named interest'}))];
 const excluded=(data?.direct?.specificSelections||[]).filter(x=>x?.text&&negatives.test(x.text)).map(x=>normalize(x.text));
 const MATCH_TERMS={
  wand:['vibrat','clitor','vulva','external','massage','sex toy','adult toy','toys'],
  bullet:['vibrat','clitor','vulva','external','sex toy','adult toy','toys'],
  'air-pulse':['clitor','air pulse','suction stimulat'],
  'insertable-vibe':['vaginal','vagin','internal stimulat','insertable'],
  dildo:['dildo','strap-on','strap on','penetrat','vaginal'],
  prostate:['prostat'],
  'anal-plug':['anal','rectal','butt plug','pegging'],
  sleeve:['penis','penile','stroker','sleeve'],
  ring:['penis ring','cock ring','erection ring','vibrating ring'],
  'nipple-massager':['nipple','breast','chest stimulat'],
  harness:['strap-on','strap on','pegging','harness'],
  remote:['remote control','remote-control','app controlled','partner control of a toy','remote vibrator']
 };
 const matched=[];
 for(const toy of TOYS){
  let score=0;const reasons=[];let active=false;
  const terms=MATCH_TERMS[toy.id]||[];
  for(const item of selected){
   const hits=terms.filter(term=>normalize(item.text).includes(term));
   if(!hits.length)continue;
   const strong=hits.some(term=>!['sex toy','adult toy','toys','vibrat','external','massage','penetrat'].includes(term));
   score+=strong?3:1;
   if(item.intent!=='fantasy'&&item.intent!=='curious')active=true;
   if(reasons.length<3)reasons.push(item.context+': '+item.text.slice(0,120));
  }
  if(!score)continue;
  // Explicitly excluded topic/region blocks a suggestion, including generalized toy matches.
  const rejected=excluded.some(text=>terms.some(term=>text.includes(term)));
  if(rejected)continue;
  const PROFILE_THEMES={
   wand:['sensation'],bullet:['sensation'], 'air-pulse':['sensation','novelty'],
   'insertable-vibe':['sensation'],dildo:['novelty','sensation'],
   prostate:['sensation','trust'], 'anal-plug':['sensation','trust'],
   sleeve:['sensation'],ring:['sensation'], 'nipple-massager':['sensation'],
   harness:['control','trust'],remote:['control','trust','novelty']
  };
  // Psychology themes may reorder an already directly supported match; they never create one.
  const profileThemes=(PROFILE_THEMES[toy.id]||[]).filter(key=>Number(data?.axes?.psych?.[key]||0)>0);
  score+=profileThemes.length*.15;
  const mode=!active?'Fantasy-only / read about it':score>=3?'Based on direct interest':'Tentative topic for reading';
  matched.push({id:toy.id,name:toy.name,summary:toy.summary,why:toy.extra,mode,
   safety:toy.safety,uses:toy.uses.slice(),bodyUses:BODY_GUIDE[toy.id],evidence:reasons,
   profileThemes:profileThemes.map(key=>data?.lenses?.[key]?.label||key),score});
 }
 return matched.sort((a,b)=>b.score-a.score||TOYS.findIndex(t=>t.id===a.id)-TOYS.findIndex(t=>t.id===b.id)).slice(0,4);
}
function init(){
 const root=document.getElementById('toy-library');if(!root)return;
 const search=root.querySelector('#toy-search'),filter=root.querySelector('#toy-filter'),
 bodyFocus=root.querySelector('#toy-body-focus'),
 grid=root.querySelector('#toy-grid'),detail=root.querySelector('#toy-detail'),count=root.querySelector('#toy-count'),
 recommend=root.querySelector('#toy-recommendations');
 const groups=[...new Set(TOYS.map(x=>x.group))];
 for(const group of groups){const opt=make('option',group);opt.value=group;filter.append(opt)}
 function open(id){
  const toy=TOYS.find(x=>x.id===id);if(!toy)return;
  grid.querySelectorAll('button[data-toy-open]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.toyOpen===id)));
  detail.replaceChildren();detail.hidden=false;detail.dataset.toyId=id;
  detail.append(make('span',toy.group,'toy-eyebrow'),make('h3',toy.name),make('p',toy.summary,'toy-intro'));
  detail.append(make('h4','Different ways this toy can be considered'));
  const ul=make('ul');toy.uses.forEach(use=>ul.append(make('li',use)));detail.append(ul);
  const comparison=make('section',undefined,'toy-body-comparison');
  comparison.append(make('h4','How this same type applies to male and female anatomy'));
  comparison.append(make('p','Anatomy matters more than gender: not every toy is compatible with every body. A partner can often participate without being the person who wears or uses it.','toy-disclaimer'));
  const rows=make('div',undefined,'toy-body-rows'),guide=BODY_GUIDE[id];
  for(const [kind,title] of [['male','Male anatomy · penis / prostate'],['female','Female anatomy · vulva / vagina']]){
   const content=guide[kind],card=make('article',undefined,'toy-body-cell');
   card.dataset.fit=content.fit;
   card.append(make('h5',title),make('span',FIT_LABELS[content.fit],'toy-body-fit'),make('p',content.note));
   rows.append(card);
  }
  const shared=make('article',undefined,'toy-body-cell toy-body-shared');
  shared.append(make('h5','With a partner · any gender'),make('span','Shared use and communication','toy-body-fit'),make('p',guide.together));rows.append(shared);
  comparison.append(rows);detail.append(comparison);
  const caution=make('div',undefined,'toy-safety');caution.append(make('strong','Important safety notes'),make('p',toy.safety));detail.append(caution);
  detail.append(make('p','These are educational possibilities, not a checklist. Suitability depends on the device model, anatomy, individual comfort and informed consent.','toy-disclaimer'));
  const bar=make('div',undefined,'toy-actions');
  const close=make('button','Close details','btn alt');close.type='button';close.onclick=()=>{detail.hidden=true;grid.querySelectorAll('[data-toy-open]').forEach(b=>b.setAttribute('aria-pressed','false'))};
  bar.append(close);detail.append(bar);detail.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 function render(){
  const q=normalize(search.value.trim()),category=filter.value;
  const focus=bodyFocus?.value||'both';
  const items=TOYS.filter(x=>(!category||category===x.group)&&(!q||normalize([x.name,x.summary,x.group,...x.uses,...x.tags,BODY_GUIDE[x.id].male.note,BODY_GUIDE[x.id].female.note].join(' ')).includes(q)));
  grid.replaceChildren();count.textContent=items.length+' of '+TOYS.length+' toy categories';
  for(const t of items){
   const card=make('article',undefined,'toy-card'),b=make('button',undefined,'toy-open');b.type='button';b.dataset.toyOpen=t.id;b.setAttribute('aria-pressed',String(detail.dataset.toyId===t.id&&!detail.hidden));
   b.append(make('span',t.icon,'toy-card-icon'),make('small',t.group),make('strong',t.name),make('span',t.summary,'toy-card-desc'));
   const fit=BODY_GUIDE[t.id];
   if(focus==='male'||focus==='female'){
    const selected=fit[focus];
    const note=make('span',undefined,'toy-card-body-note');
    note.append(make('b',(focus==='male'?'Male anatomy':'Female anatomy')+' · '+FIT_LABELS[selected.fit]),make('span',selected.note));
    b.append(note);
   }else if(focus==='together'){
    b.append(make('span','For partners: '+fit.together,'toy-card-body-note'));
   }else{
    const badges=make('span',undefined,'toy-card-body-badges');
    badges.append(make('span','Male: '+(fit.male.fit==='direct'?'Direct':fit.male.fit==='conditional'?'Check model':fit.male.fit==='partner'?'Partner use':'Not targeted')),
      make('span','Female: '+(fit.female.fit==='direct'?'Direct':fit.female.fit==='conditional'?'Check model':fit.female.fit==='partner'?'Partner use':'Not targeted')));
    b.append(badges);
   }
   b.append(make('em','Compare male, female and partner uses →'));b.onclick=()=>open(t.id);card.append(b);grid.append(card);
  }
  if(!items.length)grid.append(make('p','No toy types matched. Try a different keyword or choose All categories.','toy-empty'));
 }
 function renderMatches(){
  recommend.replaceChildren();
  const report=window.AfterDarkCanonicalReport?.buildData?.();
  const hasDirect=(report?.direct?.specificSelections||[]).length>0||(report?.interests||[]).some(x=>x.directSelection||x.specificSelected);
  const matches=recommendations(report);
  if(!matches.length){
   recommend.append(make('p',hasDirect?'No directly supported toy suggestions from these answers. That is fine—browse the guide without making any assumptions.':'No suggestions yet. Select any relevant interests in the quiz first, or browse the guide without taking a quiz.','toy-empty'));return;
  }
  for(const item of matches){
   const row=make('article',undefined,'toy-match');
   row.append(make('span',item.mode,'toy-match-label'),make('h4',item.name),make('p',item.why));
   if(item.evidence.length)row.append(make('p','Based on: '+item.evidence.slice(0,2).join(' · '),'toy-match-evidence'));
   if(item.profileThemes?.length)row.append(make('p','Related psychology themes: '+item.profileThemes.join(', ')+'. These help prioritize reading, not predict enjoyment.','toy-match-evidence'));
   const body=item.bodyUses;
   if(body){
    row.append(make('p','Male anatomy: '+FIT_LABELS[body.male.fit]+' · Female anatomy: '+FIT_LABELS[body.female.fit]+'. Choose by the actual body area and device instructions.','toy-match-evidence'));
   }
   const b=make('button','Read male / female uses & safety','btn alt');b.type='button';b.onclick=()=>open(item.id);row.append(b);recommend.append(row);
  }
 }
 search.addEventListener('input',render);filter.addEventListener('change',render);
 bodyFocus?.addEventListener('change',render);
 root.querySelector('#toy-refresh-matches').addEventListener('click',renderMatches);
 render();renderMatches();
}
// Use the same guide for Mira answers, the standalone explorer, and report exports.
function answer(question){
 const raw=normalize(question);
 if(!/\b(sex toys?|adult toys?|vibrat\w*|wand|bullet|air.?pulse|dildo|prostate massager|anal plug|butt plug|sleeve|stroker|harness|pegging toy|remote.controlled toy|toy guide|cock ring|penis ring)\b/i.test(raw))return '';
 const patterns=[
  ['wand',/\bwand\b/],['bullet',/\bbullet\b/],['air-pulse',/air.?pulse|clitoral suction|air pressure/],
  ['insertable-vibe',/insertable vibrator|internal vibrator|vaginal vibrator/],
  ['dildo',/\bdildo\b/],['prostate',/prostate massager/],
  ['anal-plug',/anal plug|butt plug/],['sleeve',/sleeve|stroker/],
  ['ring',/cock ring|penis ring|vibrating ring/],
  ['nipple-massager',/nipple massager|chest massager|breast massager/],
  ['harness',/\bharness\b|strap.?on toy|pegging toy/],
  ['remote',/remote.controlled|remote vibrator/]
 ];
 const id=patterns.find(([,regex])=>regex.test(raw))?.[0];
 if(!id)return 'The Unwrapped Sex Toy Guide compares 12 types by male anatomy, female anatomy, and shared/partner use. Each type has multiple uses, fit restrictions, and safety guidance. Explore the Sex Toy Guide section. An idea found through a quiz is not a requirement to try anything.';
 const item=TOYS.find(x=>x.id===id),body=BODY_GUIDE[id];
 return item.name+' — '+item.summary+'\n\nMale anatomy: '+FIT_LABELS[body.male.fit]+'. '+body.male.note+'\n\nFemale anatomy: '+FIT_LABELS[body.female.fit]+'. '+body.female.note+'\n\nPartner use: '+body.together+'\n\nSafety: '+item.safety+'\n\nRead the full Sex Toy Guide for additional uses. No assumptions about gender, orientation or consent.';
}
window.UnwrappedToyLibrary=Object.freeze({types:TOYS,bodyUses:id=>BODY_GUIDE[id]||null,fitLabels:FIT_LABELS,find:id=>TOYS.find(x=>x.id===id)||null,recommend:recommendations,answer,sources:SOURCES});
init();
})();