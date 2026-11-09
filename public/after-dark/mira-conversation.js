/* Mira's privacy-preserving conversation layer.
 * Handles everyday messages and surprise prompts before the reference-library
 * keyword lookup. No remote model or sensitive quiz data is used.
 */
(()=>{'use strict';
let lastKind='',lastFact='',lastIndex=-1;
const clean=s=>String(s||'').toLowerCase().trim().replace(/[!?.,;:]+$/g,'').replace(/\s+/g,' ');
const facts=[
 ['Octopuses have three hearts.','Two move blood toward the gills; the third helps circulate it through the body.'],
 ['The smell after rain has a name: petrichor.','The familiar scent partly comes from compounds released from soil after rain.'],
 ['A day on Venus lasts longer than a Venusian year.','Venus rotates so slowly that one full rotation takes longer than its orbit around the Sun.'],
 ['In botany, bananas are berries, but strawberries are not.','Botanical categories follow how fruits develop, not how they look in a grocery store.'],
 ['Wombats can produce cube-shaped droppings.','Their intestines shape the material, and the cubes are less likely to roll away.'],
 ['The Eiffel Tower grows a little taller when it gets hot.','Steel expands as its temperature rises.']
];
const prompts=[
 'Here is a conversation wildcard: what tiny, ordinary thing makes a day noticeably better for you?',
 'A completely different question: what would you learn if you could master one skill overnight?',
 'Try this: which everyday rule would you rewrite if you could?',
 'Odd but interesting: what is something you used to dislike that you now enjoy?',
 'A surprising question: what is a place you would visit again just for the atmosphere?',
 'For an unusual angle: do you prefer discovering a new favorite or returning to an old one?'
];
const jokes=[
 'Why did the calendar look nervous? Its days were numbered.',
 'I asked the elevator for advice. It said life has its ups and downs.',
 'Why did the spreadsheet bring a ladder? It wanted to reach a higher cell.',
 'My invisible friend is doing great. We just do not see each other much.'
];
function pick(items){
 let n=Math.floor(Math.random()*items.length);
 if(items.length>1&&n===lastIndex)n=(n+1)%items.length;
 lastIndex=n;return items[n];
}
function reply(message){
 const s=clean(message);
 if(!s)return null;
 const another=/^(?:another|more|one more|give me another|try another|something else|again|next|more please|surprise me again|tell me another)(?: one| please)?$/;
 const random=/^(?:(?:tell|give|show|say|send) me |i (?:want|need|would like) |how about )?(?:something |anything |a |an )?(?:totally |completely |really )?(?:random|random fact|random question|weird fact|fun fact|interesting fact|something surprising|something interesting|surprise|surprise me|something weird)(?: please| for fun| today)?$/;
 const joke=/^(?:(?:tell|give) me )?(?:a |another )?(?:joke|funny joke|something funny)(?: please)?$/;
 const conversation=/^(?:(?:ask|give) me )?(?:a |another )?(?:conversation starter|question to think about|interesting question|thought provoking question)$/;
 if(another.test(s)&&lastKind){
  if(lastKind==='fact'){const fact=pick(facts);lastFact=fact[1];return 'Here is another: '+fact[0]+'\n\n'+fact[1]}
  if(lastKind==='joke')return pick(jokes);
  return pick(prompts);
 }
 if(/^(?:tell me more|can you explain|explain that|why is that|how come|what do you mean|go deeper)$/i.test(s)&&lastKind==='fact')
  return lastFact||'Which part would you like to explore?';
 if(joke.test(s)){lastKind='joke';return pick(jokes)}
 if(conversation.test(s)){lastKind='prompt';return pick(prompts)}
 if(random.test(s)||/^(?:pick something random|tell me something unusual|what is something random|give me a random (?:fact|thought)|tell me a fun fact|say anything random|tell me anything random)$/i.test(s)){
  lastKind='fact';
  const fact=pick(facts);lastFact=fact[1];
  return 'Something delightfully random: '+fact[0]+'\n\n'+fact[1]+'\n\nWant another random fact, a joke, or a conversation starter?';
 }
 if(/^(?:hi|hey|hello|hiya|yo|good morning|good afternoon|good evening|hey mira|hi mira|hello mira)(?: there)?$/i.test(s)){
  lastKind='chat';return 'Hey! I am here. We can talk about an Unwrapped topic, think through a relationship question, or just have a light conversation. What are you in the mood for?';
 }
 if(/^(?:how are you|how is it going|how are things|whats up|what is up|hows your day|how are you doing)$/i.test(s)){
  lastKind='chat';return 'Ready to chat! What is on your mind? We can keep it light, explore something unusual, or get into an Unwrapped topic.';
 }
 if(/^(?:thanks|thank you|thx|ty|cheers)(?: so much| a lot)?$/i.test(s)){lastKind='chat';return 'You are welcome. Want to explore something else?'}
 if(/^(?:bye|goodbye|see you|later|good night)$/i.test(s)){lastKind='chat';return 'See you!'}
 if(/^(?:what can you do|help|help me|how does this work|what do you do|what can i ask|what are you)$/i.test(s)){
  lastKind='chat';return 'I can look up Unwrapped topics, explain common psychological themes, discuss communication and boundaries, and suggest conversation starters. I can also give you a random fact or a joke. I use an on-device reference library, not an open-ended AI model, so for unfamiliar subjects I will say when I do not know.';
 }
 if(/^(?:you(?:re| are) (?:wrong|confusing|bad|useless)|that (?:makes no sense|is wrong|is confusing)|your answer (?:is|was) wrong|that (?:did not|didnt) answer my question|what are you talking about)$/i.test(s)){
  lastKind='chat';return 'That response missed what you meant. I am sorry about that. You can rephrase the question, or tell me what I misunderstood. I will not pretend a keyword match is the answer.';
 }
 if(/^(?:i (?:just |really )?(?:had a (?:long|bad|good|weird) day|am (?:bored|tired|happy|sad|excited|lonely))|i feel (?:bored|tired|happy|sad|excited|lonely)|im (?:bored|tired|happy|sad|excited|lonely))$/i.test(s)){
  lastKind='chat';return 'I am listening. Do you want to tell me more, find a distraction, or get a random conversation starter?';
 }
 if(/^(?:i just |guess what|today i |my day |can we just chat|let us just chat|lets just chat)/i.test(s)){
  lastKind='chat';return 'I am listening. What happened, or what would you like to talk about next?';
 }
 lastKind='';
 return null;
}
window.MiraConversation=Object.freeze({reply,isRecent:()=>Boolean(lastKind)});
})();