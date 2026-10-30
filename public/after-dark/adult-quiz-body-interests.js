/* Six focused additions INSIDE the existing Sexual Preferences Quiz.
 * Existing question IDs 1–62 and answer-option indices are unchanged.
 * Content is educational, adults-only, and separates fantasy from intention.
 */
(()=>{
 'use strict';
 const base=window.AfterDarkAdultQuiz;
 if(!Array.isArray(base)||base.length!==62)return;
 const opts=(text,axes,interests=[],role='unspecified')=>({text,axes,interests,role});
 const questions=[
 {id:63,q:'Which semen-related interests, if any, would you like to understand or explore?',multi:true,freeText:true,options:[
  opts('Seeing or focusing on semen in a consensual adult situation','sensation aesthetics',['Semen-focused curiosity'],'watch'),
  opts('Giving or receiving semen contact with a consenting adult','sensation trust',['Semen contact interest'],'together'),
  opts('Swallowing or tasting semen from a consenting partner','sensation trust',['Semen ingestion interest'],'receive'),
  opts('Sharing or exchanging semen among consenting adult partners','novelty trust',['Consensual semen-sharing fantasy'],'together'),
  opts('Semen-related adult-media or imagined scenarios only','narrative taboo',['Semen-focused curiosity'],'fantasy'),
  opts('None of these / prefer not to answer','',[],'none')
 ]},
 {id:64,q:'Which urine-related (watersports) interests describe your curiosity?',multi:true,freeText:true,options:[
  opts('Observing a consenting adult urinate in a private context','aesthetics novelty',['Consensual urination observation'],'watch'),
  opts('Giving or receiving urine contact as an adult fantasy','sensation trust',['Urine play curiosity'],'together'),
  opts('Being observed urinating by a consenting adult','affirmation trust',['Consensual urination observation'],'receive'),
  opts('Interest in the smell, sound or symbolism, without contact','sensation associations',['Urine-related sensory fantasy'],'watch'),
  opts('Urine-related scenarios only in imagination or adult media','narrative taboo',['Urine play curiosity'],'fantasy'),
  opts('None of these / prefer not to answer','',[],'none')
 ]},
 {id:65,q:'How do you feel about consensual flatulence-related themes?',multi:true,freeText:true,options:[
  opts('The sounds of flatulence from a consenting adult','sensation associations',['Flatulence sound interest'],'watch'),
  opts('The smell or scent component','sensation associations',['Flatulence scent interest'],'receive'),
  opts('Embarrassment, humor, intimacy or playful taboo around flatulence','narrative taboo',['Flatulence-themed fantasy'],'together'),
  opts('Imagined or adult-media scenarios only','narrative taboo',['Flatulence-themed fantasy'],'fantasy'),
  opts('None of these / prefer not to answer','',[],'none')
 ]},
 {id:66,q:'Which other adult bodily-sensation interests deserve their own answer?',multi:true,freeText:true,options:[
  opts('A partner’s natural sweat or body scent','sensation associations',['Sweat and natural body scent interest'],'receive'),
  opts('Saliva or spitting themes between consenting adults','sensation trust',['Saliva and spitting interest'],'together'),
  opts('Breath, body warmth or close-proximity scents','sensation attachment',['Breath and body warmth interest'],'receive'),
  opts('Bathing or cleanliness contrasts as part of a fantasy','ritual sensation',['Cleanliness and sensory ritual'],'together'),
  opts('Only reading, listening or imagining body-focused scenarios','narrative aesthetics',['Body-sensation fantasy'],'fantasy'),
  opts('None of these / prefer not to answer','',[],'none')
 ]},
 {id:67,q:'Which adult lactation or other fluid-related curiosities, if any, do you want listed separately?',multi:true,freeText:true,options:[
  opts('Lactation or breast milk involving consenting adults','sensation attachment',['Adult lactation interest'],'together'),
  opts('Adult nursing as an emotional or nurturing fantasy','attachment ritual',['Adult nursing fantasy'],'fantasy'),
  opts('Body-fluid themes in adult media only','narrative aesthetics',['Body-fluid media fantasy'],'watch'),
  opts('A different body-fluid-related topic I want to describe in my private notes','novelty narrative',['Body-fluid media fantasy'],'unspecified'),
  opts('None of these / prefer not to answer','',[],'none')
 ]},
 {id:68,q:'What boundaries apply to the body-fluid and bodily-function interests you selected?',multi:true,freeText:true,options:[
  opts('Fantasy or media only, with no interest in real-life activity','narrative trust',[],'fantasy'),
  opts('Health screening, barriers and infection risks need discussion first','trust control',[],'boundary'),
  opts('Everyone must explicitly agree to the specific acts and limits','trust control',[],'boundary'),
  opts('Privacy, cleanup and stopping immediately when asked are essential','trust ritual',[],'boundary'),
  opts('I do not want bodily-function or bodily-fluid experiences','trust attachment',[],'none'),
  opts('Unsure or prefer not to answer','',[],'none')
 ]}
 ];
 // Viewing adult media is a separate preference. It is never scored as wanting the real-world activity.
 const media=base.find(q=>q.id===62);
 if(media?.dropdown){
  for(const label of [
   'Semen-related adult media',
   'Consensual urine-themed adult media',
   'Flatulence-related adult media',
   'Natural body-scent or sweat themes',
   'Adult lactation-themed adult media'
  ])media.options.push({text:label,axes:'',role:'watch',mediaGroup:'Bodily themes (adult-only)',mediaOnly:true});
 }
 window.AfterDarkAdultQuiz=base.concat(questions);
})();
window.AfterDarkBodyInterestCategories=[[
 'Body Fluids & Bodily Sensations','💧',
 'Adult-only education about bodily-function, fluid and scent-related curiosities, including options for fantasy-only interest.',
 'A personal attraction may connect with scent, sensory novelty, intimacy, learned associations, taboo, or roleplay. These are possible interpretations, not clinical predictions. Fantasies, viewing preferences and activities are different. Fluid contact or ingestion can involve infection risks, and no one should participate without specific informed consent.',
 'sensation associations novelty trust',
 'Semen-focused curiosity|Interest in the appearance or idea of semen, without assuming any desire for contact|sensation aesthetics;Semen contact interest|Interest in consensual adult semen contact; infection risks and boundaries require discussion|sensation trust;Semen ingestion interest|Curiosity about swallowing or tasting semen from a consenting adult; oral exposure may transmit infections|sensation trust;Consensual semen-sharing fantasy|Interest in semen-sharing or exchange themes among consenting adults, including fantasy-only versions|novelty trust;Urine play curiosity|Interest in urine-related scenarios, distinct from consenting observation and fantasy|sensation novelty;Consensual urination observation|Watching or being watched urinating with every involved adult informed and consenting|aesthetics trust;Urine-related sensory fantasy|Interest in urine-related sound, smell or symbolism without assuming a wish for physical contact|sensation associations;Flatulence sound interest|Interest in sounds associated with flatulence from consenting adults|sensation associations;Flatulence scent interest|Interest in the scent aspect of consensual flatulence-related fantasies|sensation associations;Flatulence-themed fantasy|Fantasy involving flatulence, embarrassment, taboo or humor among consenting adults|narrative taboo;Sweat and natural body scent interest|Curiosity about natural body scent or sweat in a consensual adult context|sensation associations;Saliva and spitting interest|Interest in saliva and spitting themes with consent and hygienic considerations|sensation trust;Breath and body warmth interest|Curiosity about a partner’s breath, proximity or warmth|sensation attachment;Cleanliness and sensory ritual|Interest in bathing or cleanliness as a consensual sensory or fictional ritual|ritual sensation;Body-sensation fantasy|Interest in imagined body-focused sensations without commitment to real-life activity|narrative aesthetics;Adult lactation interest|Curiosity about lactation or breast milk between consenting adults; fantasy and practice differ|sensation attachment;Adult nursing fantasy|Consensual adult nursing as an imagined closeness or nurturing theme|attachment ritual;Body-fluid media fantasy|Adult-media or imaginative interest involving bodily fluids, not evidence of a wish to participate|narrative aesthetics'
]];
window.AfterDarkBodyInterestFaqs=[
 ['Can semen or other body fluids transmit infections?','Yes. Exposure to semen, blood and some other bodily fluids can transmit infections depending on the route of contact and individual health circumstances. Oral contact may also carry STI risks. Talk with a qualified sexual-health professional about screening, barriers, prevention and individual risks; do not assume that appearance or familiarity makes exposure safe.'],
 ['Are urine and sweat sterile or automatically safe?','No. Body fluids are not automatically sterile or risk-free. Risks vary with the person, activity, health conditions and type of exposure. No one should feel pressured to try something for which they cannot evaluate the risks.'],
 ['Why might flatulence, urine, semen or scent be an interest?','Possible personal themes include sensory focus, intimacy, humor, novelty, taboo and associations, but there is no single established explanation and no quiz can reliably predict a specific bodily-fluid interest from personality. A direct, private answer about curiosity or fantasy is more meaningful than any inferred match.'],
 ['How do I mention a body-fluid or bodily-function interest to a partner?','Choose a neutral moment. Name the interest without assuming the other person shares it. State clearly whether it is a fantasy, a topic you want to understand, or an activity you might discuss. Invite a freely chosen no, keep the conversation private, and discuss hygiene and sexual-health risks if relevant.']
];