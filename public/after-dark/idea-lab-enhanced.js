/* Unwrapped Idea Lab: level-aware, consent-first scenario engine.
 * Uses the existing selected theme and the canonical toy library.
 * User controls level, exclusions and whether a proposal is fantasy-only.
 * Everything is rendered locally; no data is sent anywhere.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const E=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);if(cls)n.className=cls;return n};
const levels=[
 {max:3,label:'Gentle curiosity',hint:'Comfortable, playful and low-pressure ideas'},
 {max:6,label:'Adventurous',hint:'Clearer desires, new roles and optional toys'},
 {max:8,label:'Daring',hint:'More deliberate fantasy, trust and sensory exploration'},
 {max:10,label:'Very freaky',hint:'Layered, intensely adventurous scenarios for consenting adults'}
];
/* [theme, tier, title, premise, three concrete creative components, choice, caution, toy groups, tags] */
const DATA=[
['connection',2,'The three-envelope date','Each person privately makes three envelopes: a compliment, a wish and a boundary.',['Open the compliment envelope first.','Share the wish as something to discuss, not a request.','Leave the boundary visible as a standing agreement.'],'Which wish makes you feel understood?','No expectation to act on a wish.','External stimulation',''],
['connection',2,'A sensory comfort menu','Build a personal comfort menu rather than guessing what is pleasurable.',['Write favorite types of affection.','Mark each one yes, maybe or no.','Trade the menus and choose one mutual yes.'],'What makes you feel safest and most connected?','Do not interpret a maybe as permission.','Comfort & accessibility',''],
['connection',5,'The desire interview','Spend a private evening discovering preferences that ordinary conversations miss.',['One person asks five open questions.','The other can answer honestly or pass without explanation.','Swap roles and identify one shared curiosity.'],'What do you wish a partner would ask you more often?','A disclosure does not require an experiment.','Partner options',''],
['connection',5,'A private discovery box','Create a playful box of safe, mutually chosen sensual options.',['Each person contributes three possible experiences.','Sort the cards into now, later and fantasy-only.','Choose one now-card that works for both people.'],'What would make a new experience feel welcoming?','Keep all decisions reversible.','External stimulation',''],
['connection',8,'The secret preference exchange','Reveal an adventurous preference and let the other person choose how to respond.',['Each person names one specific adventurous idea.','Classify it as fantasy, discussion or possible exploration.','Design a simpler version acceptable to both.'],'Does the appeal come from novelty, vulnerability or trust?','Do not turn disclosure into an obligation.','Partner options',''],
['connection',8,'An alternate-roles evening','Try a private relationship ritual where each adult intentionally changes a familiar role.',['Decide who will plan the environment.','Choose a mutually welcomed shift in leadership.','Close with a specific debrief about surprise and comfort.'],'Which role felt most affirming?','No hidden expectations or tests of obedience.','Sensory & boundaries',''],
['connection',10,'The intimate fantasy vault','Create a daring private collection of fantasies with distinct boundaries and possible future choices.',['Each partner submits a bold scenario card without having to defend it.','Pick one shared theme and one surprising difference.','Build an imaginative two-act version for discussion, with fantasy-only options preserved.'],'Which intense fantasy is compelling specifically because it stays imaginary?','Never treat sharing a fantasy as permission.','Partner options',''],
['connection',10,'The full disclosure game','A structured, high-candor night for unconventional desires and relationship rules.',['Separately rank unconventional interests, including role reversals and consensual multi-partner fantasies.','Reveal only the categories each person is comfortable sharing.','Create a mutual-agreement map with hard limits, maybes and private fantasies.'],'Which new idea would you want to understand psychologically before considering it?','No involving outsiders without their informed agreement.','Sensory & boundaries','group'],
['power',2,'Choose who leads','Explore the simple difference between planning and following.',['Take turns planning a date activity.','Ask which kinds of leadership feel supportive.','Set an easy way to hand control back.'],'What does safe, appealing leadership look like?','Leadership is never ownership or coercion.','Partner options',''],
['power',2,'Permission to say no','Make the right to decline central to a playful choice game.',['Offer two equally comfortable ideas.','Practice choosing a third option: neither.','Affirm that declining does not damage connection.'],'Do you prefer invitations or surprises you have approved in advance?','No unapproved surprises.','Sensory & boundaries',''],
['power',5,'Switch the director','Explore a mutually agreed change in who initiates the activity.',['Agree on which decisions the director may make.','Let the other person veto changes without an explanation.','Swap roles and compare how each felt.'],'Was taking charge or handing off decisions more interesting?','Scope is explicit, specific and revocable.','Partner options',''],
['power',5,'The choice-and-praise game','Pair voluntary leadership with personalized feedback.',['One person chooses from an approved menu of harmless gestures.','Agree on praise language that feels welcome.','Swap leadership and discuss what resonated.'],'Is the appeal being admired, guided or recognized?','Praise and direction must remain optional.','Sensory & boundaries',''],
['power',8,'Negotiated power exchange','Plan a private, time-limited power-dynamics scene without guessing boundaries.',['Define a narrow, mutually welcomed dynamic and a stop word.','Pick a nonrestrictive symbol of roles, such as a chosen title.','Reverse roles or end early and debrief.'],'Which aspect of control is appealing: anticipation, trust or performance?','Never use breath restriction or disable someone’s ability to leave.','Sensory & boundaries','power'],
['power',8,'The private command deck','Build a consensual adult roleplay from preapproved challenge cards.',['Write an explicit yes/no menu of roleplay themes.','Draw a role card only from the shared yes pile.','Use a check-in between segments before changing the scenario.'],'Do you like the story, the structure or the emotional intensity?','A stop word always overrides the game.','Partner options','power'],
['power',10,'The switch night','An advanced, fully negotiated role-reversal scenario for curious adults.',['Separately choose two bold power roles and how they might reverse.','Create an opening act guided by one person and a second act where leadership changes.','Use preagreed language, a clear stopping signal and an aftercare debrief.'],'What emotional difference did you notice between leading and receiving direction?','No humiliation, restraint or surprises without specific advance consent.','Sensory & boundaries','power'],
['power',10,'Private fantasy hierarchy','Explore a provocative, entirely optional roleplay hierarchy with explicit limits.',['Design fictional roles and titles that are exciting to both adults.','Add a second twist: switching roles or inviting a toy only if mutually desired.','End the roleplay explicitly and discuss what was fantasy versus real preference.'],'Is the fantasy primarily about power, surrender, performance or being seen?','No coercion, demeaning language outside agreed boundaries or physical danger.','Partner options','power'],
['story',2,'Pick a playful alter ego','Create a lighthearted fictional identity for an at-home conversation.',['Choose a fictional name and a setting.','Ask a question as the invented persona.','Step out of character and compare what was fun.'],'Which part of the fictional role felt freeing?','Clearly distinguish play from real-life obligations.','Sensory & boundaries',''],
['story',2,'The secret note exchange','Turn an ordinary evening into a collaborative romantic mystery.',['Write three imaginary clues.','Take turns choosing what happens next.','Choose a shared ending that feels comfortable.'],'Was anticipation more appealing than the reveal?','No involving unsuspecting people.','External stimulation',''],
['story',5,'Hotel-room story at home','Transform a familiar room into a fictional adult getaway.',['Agree on a fictional setting and two characters.','Use outfits, lighting or music as cues.','Allow either person to call a scene change at any time.'],'Does anonymity, novelty or the theatrical setting appeal most?','Keep the roleplay private and fully voluntary.','Partner options',''],
['story',5,'The invitation-only club','Invent an exclusive adults-only private club and its rules.',['Make fictional member cards.','Write three attractions that are actually comfortable for both.','Tour the fictional club through prompts or discussion.'],'What is exciting about exclusivity or being invited?','No real third parties without explicit consent.','Sensory & boundaries',''],
['story',8,'The masquerade negotiation','Stage a dramatic private masked-character roleplay.',['Choose fictional personas with different social power.','Negotiate exactly which plot elements are welcome.','Include a deliberate role reversal or surprise that was preapproved.'],'What does the mask change psychologically?','No public play involving others without consent.','Sensory & boundaries','power'],
['story',8,'The forbidden-room fiction','Write an intensely adventurous scene that remains safely imaginary unless jointly approved.',['Build a fictional room with three explicit adult fantasy themes.','Each person chooses which themes remain fantasy only.','Create a mutually welcome closing scene without pressure to act.'],'Is the taboo appeal about secrecy, transgression or freedom of imagination?','Keep dangerous or nonconsensual themes exclusively fictional.','Partner options','power'],
['story',10,'The private fantasy theater','Develop an elaborate multi-act adult fantasy with role switches and negotiated toy options.',['Create characters with contrasting desires and positions of authority.','Draft two connected acts with a clear change in dynamics.','Add a final reveal chosen from mutually approved concepts and a debrief.'],'Which very bold scene element is exciting to imagine but not to practice?','No public or nonconsenting audience and no unapproved physical restrictions.','Partner options','power'],
['story',10,'The alternate-universe invitation','Imagine an underground adults-only world where roles, boundaries and fantasies are explicitly chosen.',['Choose a provocative fictional venue and a personal role.','Explore a fantasy-only scene about consensual exhibition, swapping or being admired by adults.','Separate imaginary scenarios from any real-world discussion about consent and boundaries.'],'Which fictional idea would you keep private, share or consider discussing?','Actual third parties require informed, enthusiastic agreement; no public exposure.','Sensory & boundaries','group'],
['sensory',2,'Create a texture map','Compare safe external textures and note comfort.',['Choose two soft textures.','Try them on ordinary intact skin or discuss preferences.','Mark comfortable and uncomfortable options.'],'Do you enjoy predictability or variety?','No contact with irritated or broken skin.','External stimulation',''],
['sensory',2,'A soundtrack for anticipation','Use music and atmosphere to change a private moment.',['Build a short shared playlist.','Choose low or bright lighting.','Discuss what changes the emotional tone.'],'Does sound, visual atmosphere or anticipation matter most?','Both people control volume and can end the session.','Comfort & accessibility',''],
['sensory',5,'The blind-choice sensory menu','Use preapproved, gentle sensory options as a surprise without uncertainty about consent.',['Choose soft and warm/cool tools from an approved list.','Agree on a stop signal and keep control easy.','Compare the sensations and choose favorites.'],'Is anticipation more interesting than intensity?','Do not use extreme temperatures or sensory overload.','External stimulation','sensory'],
['sensory',5,'A two-person comfort lab','Find what levels of sensation appeal to each person.',['Each adult independently selects an external-only option.','Compare intensity preferences and ergonomic needs.','Create a separate list of what is best kept solo.'],'Are your sensory preferences similar or different?','Avoid pain, numbness and pressure to increase intensity.','External stimulation','sensory'],
['sensory',8,'A private sensory laboratory','Build a more elaborate sensation-focused scenario with explicit control.',['Agree on up to three modalities: sound, soft texture and mild temperature contrast.','Try or simply discuss one at a time.','Choose how to combine atmosphere and a suitable optional device.'],'Which sensory change makes the biggest emotional difference?','No extremes, unsafe restraints or loss of an immediate stop option.','Sensory & boundaries','sensory'],
['sensory',8,'The anticipation experiment','Explore a longer, staged private scenario centered on anticipation and agency.',['Design a two-part progression using preapproved props.','Choose who directs and who can switch the scene.','Add a deliberate pause and choose whether to continue.'],'Is waiting, directing or surrendering decisions more appealing?','No prolonged pressure, breath play or hidden rules.','Partner options','power'],
['sensory',10,'The five-senses fantasy','Build an intense, carefully choreographed adult sensory evening with several chosen dimensions.',['Select up to five approved sensory cues and one clear signal to stop.','Compose two contrasting acts, such as quiet anticipation followed by a mutually chosen higher-energy atmosphere.','Decide whether to add a compatible external device, then debrief the sensory and emotional effects.'],'Which combination felt daring without overwhelming anyone?','No extreme heat/cold, choking, incapacitation, or removal of stop controls.','External stimulation','sensory'],
['sensory',10,'The sensory switchboard','Experiment with changing who directs a bold, multi-layered sensory fantasy.',['Agree on a menu of sound, light, texture and optional toys.','One person selects the first set while the other retains complete veto power.','Switch direction, change one element at a time and end with aftercare.'],'Did control, variety or novelty create the intensity?','Every element must be approved in advance; avoid unwanted sensory overload.','Partner options','power'],
['toys',2,'Two toys on paper','Discover what different device designs might mean without purchasing anything.',['Choose two external devices to compare.','Read material and cleaning guidance.','Mark each as no, maybe or worth learning about.'],'Which feature matters most: size, sound, control or texture?','Reading about a device is not consent to use it.','External stimulation',''],
['toys',2,'Comfort-first selection','Explore a device only through what feels practical and accessible.',['Compare grip and control layouts.','Look for simple cleaning and body-area ratings.','Keep an external-only option on the shortlist.'],'Would an easy-to-hold design change your interest?','Any recommendation depends on actual model instructions.','Comfort & accessibility',''],
['toys',5,'Pick a toy for each person','Create two separate ideas without assuming equal anatomy or interests.',['Each adult picks a different appealing category.','Compare what each device is actually designed to do.','Talk about shared involvement versus solo use.'],'What makes you feel comfortable saying yes or no?','Do not share items between people or body areas without appropriate hygiene.','Partner options',''],
['toys',5,'The accessory challenge','Make a small personal shortlist of devices and accessories worth exploring.',['Choose one external category and one optional accessory.','Compare budget, cleaning and usable intensity.','Discuss which features are appealing rather than purchasing automatically.'],'Is the interest technical curiosity, physical sensation or partner connection?','Read intended-use and fit information first.','External stimulation',''],
['toys',8,'Role-switching with devices','Explore an adventurous scenario about who selects, guides and controls a mutually approved toy.',['Each person identifies a suitable device and body area.','Agree who can adjust controls and who can stop immediately.','Consider a second act with roles reversed.'],'Which is more exciting: shared decision-making or choosing who leads?','Any wearable or app-controlled product needs an immediate wearer stop option.','Partner options','power'],
['toys',8,'The toy-and-story crossover','Combine one imaginative adult roleplay with a suitable accessory.',['Choose a fictional role for each person.','Pick one body-area-rated device and talk about its appeal.','Decide what stays imaginary and what is acceptable to discuss further.'],'Is the prop, story or shifting dynamic the strongest attraction?','No insertable device should be used in an unintended body area.','Strap-ons & harnesses','sensory'],
['toys',10,'A two-act toy experience','Design a very adventurous, explicit-in-intent scenario combining roleplay with several individually chosen devices.',['Each person selects a distinct toy category and checks actual body-area compatibility.','Build act one around an agreed role and act two around a complete change in dynamic.','Discuss whether the devices would be explored separately, together, or only as fantasy.'],'Which combination of novelty, power and sensation feels genuinely appealing?','Never assume two toys are physically compatible or safe to use simultaneously.','Strap-ons & harnesses','power'],
['toys',10,'The extreme-curiosity menu','Create a high-adventure private fantasy menu centered on specialized devices, roles and boundaries.',['List three unconventional devices or role scenarios, including any strap-on or anal curiosity only when it is personally welcome.','Rank each as fantasy-only, learn about it, or a possible discussion.','Choose one idea to research, including cleaning, anatomy and exact exclusions.'],'Is the excitement about the device, the act or what it symbolizes?','Anatomical suitability, lubrication, hygiene and ongoing consent are essential.','Anal & pelvic','anal'],
['trust',2,'A fantasy is not a request','Practice talking about curiosity without promising to act.',['Each adult names a harmless hypothetical fantasy.','Ask what makes it imaginative.','Agree that fantasy-only is a complete answer.'],'Which fictional idea is better left imaginary?','Nobody has to disclose private fantasies.','Sensory & boundaries',''],
['trust',2,'The easy veto','Make a clear language for preferences and boundaries.',['Choose shared yes/maybe/no signals.','Use a hypothetical suggestion.','Practice responding without pressure or hurt feelings.'],'How could saying no feel easier?','A maybe is not yes.','Partner options',''],
['trust',5,'The private curiosity map','Understand what motivates an unconventional preference.',['Pick curiosity, novelty, trust or sensation as themes.','Connect one named preference to any themes that fit.','Discuss what may remain private or fictional.'],'What psychological quality is attractive independently of the act?','Avoid diagnosing a person from one preference.','Sensory & boundaries',''],
['trust',5,'The boundaries workshop','Make an actual written list of practical agreements.',['Separate physical, emotional and privacy boundaries.','Identify optional interests and hard limits.','Decide how to stop or revisit the conversation.'],'Which boundary creates more freedom rather than less?','Consent is specific and can always be withdrawn.','Partner options',''],
['trust',8,'The big taboo conversation','Talk clearly about unconventional adult topics such as power roles and consensual group fantasies.',['Choose which subjects may be discussed.','Mark which ideas stay imagined and which are open for research.','Set rules about privacy, third parties, timing and follow-up.'],'What makes the topic intense without requiring action?','No third parties involved without their own informed consent.','Partner options','group'],
['trust',8,'Fantasy-only scenario design','Collaborate on a daring hypothetical scenario while keeping all activity optional.',['Write a fictional premise involving a taboo-feeling adult dynamic.','Each person edits the plot to keep it acceptable.','Name the real-world limits that would never change.'],'Is the emotional charge in the fantasy different from real-life desire?','Fiction is not a request, permission or plan.','Sensory & boundaries','group'],
['trust',10,'Negotiated taboo atlas','Create a detailed private map of complex desires: exhibition fantasies, consensual swapping, role reversals and boundaries.',['Rank intense topics individually with explicit fantasy-only choices.','Select one imaginary scenario and examine why it appeals without moralizing.','If considering any real-world discussion, list precisely whose consent and safety would be required.'],'Which unconventional interest reveals something about trust, attention or freedom?','Real encounters require willing, informed adults and respect for privacy.','Partner options','group'],
['trust',10,'The all-in agreement game','An advanced candid discussion combining power dynamics, unconventional desires and possible toy ideas.',['Name three bold interests without assuming agreement.','Use separate yes/no/maybe cards for each adult and every element.','Build an optional two-part concept only from mutual yeses, with a fantasy-only version for everything else.'],'What would make an adventurous conversation feel empowering rather than pressured?','Never escalate or add another person or device without new consent.','Sensory & boundaries','power']
].map((a,i)=>Object.freeze({id:i,theme:a[0],tier:a[1],title:a[2],premise:a[3],parts:a[4],question:a[5],caution:a[6],group:a[7],tags:a[8].split(/\s+/).filter(Boolean)}));
const seen=new Set();
let lastOutput='';
function choose(arr){if(!arr.length)return null;const fresh=arr.filter(x=>!seen.has(x.id));if(!fresh.length)seen.clear();const pool=fresh.length?fresh:arr;const pick=pool[Math.floor(Math.random()*pool.length)];seen.add(pick.id);return pick}
function currentLevel(){return Math.max(1,Math.min(10,Number($('freak-level')?.value)||5))}
function tier(level){return level<=3?2:level<=6?5:level<=8?8:10}
function exclusions(){return {penetration:Boolean($('freak-no-penetration')?.checked),anal:Boolean($('freak-no-anal')?.checked),power:Boolean($('freak-no-power')?.checked),fantasy:Boolean($('freak-fantasy-only')?.checked)}}
function filtered(theme){
 const settings=exclusions(),band=tier(currentLevel());
 const bank=window.UnwrappedSpecificIdeaBank||DATA;
 return bank.filter(s=>s.tier===band&&(theme==='any'||theme===s.theme)
 &&(!settings.anal||!s.tags.includes('anal'))
 &&(!settings.power||!s.tags.includes('power'))
 &&(!settings.penetration||!s.tags.includes('penetration'))
 &&(!settings.penetration||!/(penetrat|strap.on|\banal\b|insertab|vaginal|dildo)/i.test([s.title,s.setup||'',s.premise,...s.parts].join(' ')))
 );
}
const fit=(toy,kind)=>['direct','conditional'].includes(window.UnwrappedToyLibrary?.bodyUses(toy.id)?.[kind]?.fit);
const safeToy=(t,settings)=>t&&!((settings.anal||settings.penetration)&&(/\banal\b|\bprostate\b|\bpegging\b|\bstrap.on\b|vaginal|internal options/i.test([t.name,t.group].join(' '))));
function chooseToy(group,kind,skipIds){
 const lib=window.UnwrappedToyLibrary;if(!lib)return null;const settings=exclusions();
 const select=$(kind==='male'?'toy-idea-him':'toy-idea-her');
 if(select?.value){const explicit=lib.find(select.value);if(explicit&&fit(explicit,kind)&&safeToy(explicit,settings)&&!skipIds.has(explicit.id))return explicit}
 let candidates=lib.types.filter(t=>fit(t,kind)&&safeToy(t,settings)&&!skipIds.has(t.id)&&!['Care, materials & barriers','Comfort & accessibility'].includes(t.group));
 const matching=candidates.filter(t=>t.group===group);
 const external=candidates.filter(t=>t.group==='External stimulation');
 const sensory=candidates.filter(t=>t.group==='Sensory & boundaries');
 if(matching.length)candidates=matching;
 else if(external.length)candidates=external;
 else if(sensory.length)candidates=sensory;
 if(!candidates.length)return null;
 return candidates[Math.floor(Math.random()*candidates.length)];
}
function line(name,body){const d=E('div',undefined,'freak-idea-section');d.append(E('h4',name),E('p',body));return d}
function scenarioText(s){
 return [s.title,s.time?'Time: '+s.time:'',s.setup?'Prepare: '+s.setup:'',s.premise,'Do this in order:',...s.parts,s.question,s.caution].filter(Boolean).join('\n');
}
function aSpecificAct(s,number,total){
 const article=E('section',undefined,'freak-idea-act');
 if(total>1)article.append(E('h4','ACT '+number+' · '+s.title,'freak-act-title'));
 if(s.time)article.append(E('div','⏱ '+s.time+' · One specific activity','freak-idea-time'));
 if(s.setup)article.append(line('Prepare this',s.setup));
 article.append(E('h4','Exactly what to do','freak-do-heading'));
 const steps=E('ol',undefined,'freak-idea-steps');
 for(const part of s.parts)steps.append(E('li',part));
 article.append(steps);
 return article;
}
function specificToyStep(toy,actLabel){
 const group=String(toy.group||'');
 if(/strap.on|harness/i.test(group+' '+toy.name))
  return actLabel+': Treat '+toy.name+' as the fitted costume/role-reversal prop first. Check fit and comfort over clothing; discuss any separate intimate use, compatibility and barriers before it happens.';
 if(/anal|pelvic|prostate/i.test(group+' '+toy.name))
  return actLabel+': Set '+toy.name+' alongside the scene props; agree on whether it is discussion-only. Any later use needs a device rated for that anatomy, appropriate lubrication and cleaning, and its own consent.';
 if(/external|vibrat|massag|wand/i.test(group+' '+toy.name))
  return actLabel+': Add one short, pre-agreed test of '+toy.name+' on a manufacturer-approved external area at the lowest comfortable setting. Name who controls it and turn it off before moving on.';
 if(/sensory|blindfold|feather|tickl|temperature/i.test(group+' '+toy.name))
  return actLabel+': Add '+toy.name+' to the prepared objects. Agree on an exact contact area, then try one brief pass; check comfort before any second pass.';
 return actLabel+': Put '+toy.name+' with the props and choose one clearly agreed, manufacturer-approved use during this act. Check body fit and cleaning instructions; skip it if the pairing does not make sense.';
}
function render(mode){
 const root=$('ideaResult');if(!root)return;
 const theme=$('mood')?.value||'any';
 const options=filtered(theme),first=choose(options);
 if(!first){
  root.replaceChildren(E('h3','No idea fits these limits.'),E('p','Try another theme or relax an optional filter. We will not override the boundaries you selected.'));
  return;
 }
 const level=currentLevel(),settings=exclusions(),lbl=levels.find(x=>level<=x.max);
 let second=null;
 if(mode==='full'){
  const all=filtered('any');
  second=choose(all.filter(x=>x.id!==first.id&&x.theme!==first.theme))||choose(all.filter(x=>x.id!==first.id));
 }
 const both=mode==='full'&&!!second;
 root.replaceChildren();root.dataset.ideaType='specific';
 root.append(
  E('span','ONE SPECIFIC PLAN · FREAK LEVEL '+level+'/10 · '+lbl.label.toUpperCase()+(settings.fantasy?' · FANTASY ONLY':''),'eyebrow'),
  E('h3',both?first.title+' → '+second.title:first.title),
  E('p',first.premise,'freak-idea-premise')
 );
 root.append(aSpecificAct(first,1,both?2:1));
 if(both){
  root.append(E('p','After act one, reset the space and check that both people still want to continue. Act two is a new choice—not an automatic escalation.','freak-idea-transition'),
   E('p',second.premise,'freak-idea-premise'));
  root.append(aSpecificAct(second,2,2));
 }
 const notes=E('div',undefined,'freak-idea-notes');
 notes.append(line('Afterward, ask this',first.question+(second?' '+second.question:'')));
 if(settings.fantasy)notes.append(line('Keep it fictional','Use the scene as a story to imagine or discuss. Do not act it out; the fantasy-only setting is respected.'));
 let extra='',toyCopy=[];
 if(mode==='toy'||mode==='full'){
  const lib=window.UnwrappedToyLibrary;
  const selectedIds=new Set(),toys=[];
  const maleChoice=Boolean($('toy-idea-him')?.value),femaleChoice=Boolean($('toy-idea-her')?.value);
  const firstKind=femaleChoice&&!maleChoice?'female':'male';
  const firstToy=chooseToy(first.group,firstKind,selectedIds);
  if(firstToy){toys.push({toy:firstToy,kind:firstKind,act:'Act 1'});selectedIds.add(firstToy.id)}
  if(both){
   const secondKind=firstKind==='male'?'female':'male';
   const secondToy=chooseToy(second.group,secondKind,selectedIds);
   if(secondToy){toys.push({toy:secondToy,kind:secondKind,act:'Act 2'});selectedIds.add(secondToy.id)}
  }
  if(lib&&toys.length){
   const sec=E('section',undefined,'freak-idea-toys');
   sec.append(E('h4',both?'An exact device option for each act':'How the device fits this exact idea'));
   for(const {toy,kind,act} of toys){
    const item=E('article',undefined,'freak-toy-pair');
    const instruction=specificToyStep(toy,act);
    const anatomy=kind==='male'?'Penile / prostate anatomy context':'Vulvar / vaginal anatomy context';
    item.append(E('span',act+' · '+anatomy,'freak-toy-label'),
     E('h5',toy.name),E('p',instruction,'freak-toy-action'),
     E('p',toy.summary),E('p','Body fit: '+(lib.bodyUses(toy.id)?.[kind]?.note||'Check product fit for this person.')),
     E('p','Safety: '+toy.safety,'freak-toy-safety'));
    const btn=E('button','Read about '+toy.name+' in the Toy Guide →','btn alt');btn.type='button';
    btn.addEventListener('click',()=>{
     document.querySelector('[data-tab="toys"]')?.click();
     const search=$('toy-search'),filter=$('toy-filter');
     if(filter)filter.value='';
     if(search){search.value=toy.name;search.dispatchEvent(new Event('input',{bubbles:true}))}
     $('toy-grid')?.querySelector('[data-toy-open="'+toy.id+'"]')?.click();
    });item.append(btn);sec.append(item);
    toyCopy.push([instruction,'Body fit: '+(lib.bodyUses(toy.id)?.[kind]?.note||''),'Safety: '+toy.safety].join('\n'));
   }
   root.append(sec);
   extra=toyCopy.join('\n\n');
  }
 }
 notes.append(line('Boundaries and safer choices','Use only activities that every participant expressly agrees to. Set limits first; never add an unapproved person, act or toy. Any participant can stop immediately.'));
 root.append(notes);
 const actions=E('div',undefined,'freak-idea-actions');
 const again=E('button','🎲 Another specific idea','btn');again.type='button';again.addEventListener('click',()=>render(mode));
 const copy=E('button','Copy this exact plan','btn alt');copy.type='button';copy.addEventListener('click',()=>{
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(lastOutput).then(()=>{copy.textContent='Copied'}).catch(()=>{copy.textContent='Copy unavailable'});
  else copy.textContent='Copy unavailable';
 });
 actions.append(again,copy);root.append(actions);
 lastOutput=scenarioText(first)+(second?'\n\nSECOND ACT\n'+scenarioText(second):'')+(extra?'\n\nOPTIONAL DEVICES\n'+extra:'')+'\n\nConsent is specific and can be withdrawn at any time.'+(settings.fantasy?'\nFantasy-only: imagine or discuss, do not enact.':'');
 root.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function init(){
 const controls=document.querySelector('#ideas .idea-lab-controls'),main=$('drawIdea');if(!controls||!main)return;
 const old=$('ideaLevel')?.closest('label');if(old)old.hidden=true;
 const level=E('section',undefined,'freak-meter');
 level.setAttribute('aria-label','Choose your Freak Level');
 const heading=E('div',undefined,'freak-meter-heading');
 const label=E('label','Freak Level','freak-meter-label');label.htmlFor='freak-level';
 const selected=E('output','5 / 10 · Adventurous','freak-meter-output');selected.htmlFor='freak-level';selected.id='freak-readout';
 heading.append(label,selected);
 const input=E('input');input.type='range';input.min='1';input.max='10';input.step='1';input.value='5';input.id='freak-level';input.setAttribute('aria-label','Freak level from 1 to 10');input.setAttribute('aria-describedby','freak-description');
 const ticks=E('div',undefined,'freak-meter-ticks');for(const s of ['1 · Chill','4 · Curious','7 · Daring','10 · Very freaky'])ticks.append(E('span',s));
 const desc=E('p','Clearer, bolder and more complex suggestions as the level rises.','freak-description');desc.id='freak-description';
 function update(){const v=currentLevel(),l=levels.find(x=>v<=x.max);selected.textContent=v+' / 10 · '+l.label;desc.textContent=l.hint}
 input.addEventListener('input',update);
 level.append(heading,input,ticks,desc);
 controls.insertAdjacentElement('afterend',level);
 const boundaries=E('details',undefined,'freak-boundaries');boundaries.append(E('summary','Optional: limits and fantasy-only mode'));
 const options=E('div',undefined,'freak-boundaries-options');
 for(const [id,title] of [
 ['freak-fantasy-only','Fantasy only — keep suggestions imaginary'],
 ['freak-no-penetration','No penetration'],
 ['freak-no-anal','No anal themes or devices'],
 ['freak-no-power','No power-play themes']
 ]){const label=E('label'),check=E('input');check.type='checkbox';check.id=id;label.append(check,E('span',title));options.append(label)}
 boundaries.append(options);level.insertAdjacentElement('afterend',boundaries);
 const modebar=E('div',undefined,'freak-picker-actions');
 main.textContent='🎲 Random idea';
 main.classList.add('freak-main-random');
 main.onclick=()=>render('idea');
 const withToy=E('button','✦ Idea + Toy','btn alt');withToy.type='button';withToy.onclick=()=>render('toy');
 const allIn=E('button','🔥 Full Combination','btn');allIn.type='button';allIn.onclick=()=>render('full');
 modebar.append(main,withToy,allIn);
 boundaries.insertAdjacentElement('afterend',modebar);
 const helper=E('p','Each result gives one named activity, exact preparation, a time limit and concrete steps. Idea + Toy shows where a specific device fits. Full Combination delivers two separate acts with a device for each. Your Freak Level and limits control the options.','freak-picker-help');
 modebar.insertAdjacentElement('afterend',helper);
 update();
 window.UnwrappedFreakPicker=Object.freeze({generate:render,ideas:(window.UnwrappedSpecificIdeaBank||DATA).length,getLevel:currentLevel});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();