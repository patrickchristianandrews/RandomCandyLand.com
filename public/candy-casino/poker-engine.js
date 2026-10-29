/* Candy Land Casino five-card draw rules: standard 52-card deck, no duplicate
   cards, and complete poker hand comparisons (including kickers). */
(() => {
  'use strict';
  const suits=['♥','♦','♣','♠'];
  const random=n=>{if(!Number.isInteger(n)||n<1)throw Error('Invalid range');const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]%n;};
  const deck=()=>{const cards=[];for(let rank=2;rank<=14;rank++)for(const suit of suits)cards.push({rank,suit});for(let i=cards.length-1;i>0;i--){const j=random(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;};
  const valid=cards=>Array.isArray(cards)&&cards.length===5&&cards.every(c=>c&&Number.isInteger(c.rank)&&c.rank>=2&&c.rank<=14&&suits.includes(c.suit))&&new Set(cards.map(c=>c.rank+'-'+c.suit)).size===5;
  const names=['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'];
  function score(cards){
    if(!valid(cards))throw Error('Invalid five-card poker hand');
    const desc=cards.map(c=>c.rank).sort((a,b)=>b-a);
    const counts=new Map();for(const n of desc)counts.set(n,(counts.get(n)||0)+1);
    const countSorted=[...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
    const unique=[...counts.keys()].sort((a,b)=>b-a);
    const highStraight=unique.length===5&&(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0);
    const flush=cards.every(c=>c.suit===cards[0].suit);
    const pairs=countSorted.filter(x=>x[1]===2);
    const triples=countSorted.find(x=>x[1]===3);
    if(flush&&highStraight)return [8,highStraight];
    if(countSorted[0][1]===4)return [7,countSorted[0][0],countSorted[1][0]];
    if(triples&&pairs.length)return [6,triples[0],pairs[0][0]];
    if(flush)return [5,...desc];
    if(highStraight)return [4,highStraight];
    if(triples)return [3,triples[0],...countSorted.filter(x=>x[1]===1).map(x=>x[0]).sort((a,b)=>b-a)];
    if(pairs.length===2)return [2,Math.max(...pairs.map(x=>x[0])),Math.min(...pairs.map(x=>x[0])),countSorted.find(x=>x[1]===1)[0]];
    if(pairs.length)return [1,pairs[0][0],...countSorted.filter(x=>x[1]===1).map(x=>x[0]).sort((a,b)=>b-a)];
    return [0,...desc];
  }
  function compare(a,b){
    const x=score(a),y=score(b);
    for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)>(y[i]||0))return 1;if((x[i]||0)<(y[i]||0))return -1;}
    return 0;
  }
  const title=cards=>names[score(cards)[0]];
  // Basic opponent strategy: retain made sets, potential 4-card flush,
  // or a 4-card open-ended straight; otherwise hold the highest two cards.
  function computerDiscards(hand){
    const ranks=hand.map(c=>c.rank),counts=ranks.map(n=>ranks.filter(k=>k===n).length);
    const category=score(hand)[0];
    if(category>=4||category===2)return [];
    const kept=hand.map((c,i)=>counts[i]>1?i:-1).filter(i=>i>=0);
    if(kept.length)return hand.map((_,i)=>i).filter(i=>!kept.includes(i)).slice(0,3);
    for(const suit of suits){
      const same=hand.map((c,i)=>c.suit===suit?i:-1).filter(i=>i>=0);
      if(same.length===4)return hand.map((_,i)=>i).filter(i=>!same.includes(i));
    }
    // With no existing hand, keep the two highest cards.
    const sorted=hand.map((c,i)=>({rank:c.rank,i})).sort((a,b)=>b.rank-a.rank);
    return sorted.slice(2).map(c=>c.i);
  }
  window.CandyPoker=Object.freeze({deck,score,compare,title,computerDiscards,random,valid});
})();