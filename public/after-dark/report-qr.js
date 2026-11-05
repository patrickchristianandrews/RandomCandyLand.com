/* Shared, offline QR and explanatory footer for locally generated After Dark PDF reports.
 * The PNG is an embedded high-contrast QR, so PDF export never needs a network request. */
(()=>{
'use strict';
const link='https://randomcandyland.com/after-dark/';
const png='iVBORw0KGgoAAAANSUhEUgAAALkAAAC5CAIAAAD7zwkLAAADV0lEQVR42u3dS3LjMAxF0SjV+9+yM89A1Qg+JKVzp4klW3ULfIYp6Pp8Pl/Af/DtEoAr4Aq4Aq6AK+AKwBVwBVwBV8AVcAXgCrgCroAr4Aq4ghfyL/Pi67pm3uWvTcG/znv/1/tD3X+iwvOGPtHYlVRXYA0CV8AVyLYNuakwNYdiY+ZEoRCdSb6bfP9QV8AVcAVcwZuybSZVhdJc5p8zXd2+BLrqSqor4Aq4Aq5Atl1NpmF6/9cjWrHqCrgCroArwIOybSZjFm5CCG3dVVdgDQK4Aq7g5Gy7qlPZ104NNXkzuXiTK6mugCvgCriCF2fbsU5l3zSDUALtm6KwZ89XXQFXwBVwBY/OtnvuIc28q0wbd+y86gq4Aq6AK0BDti2cM3vEcNjQ1Qil18xO3r5BEOoKuAKugCs4jKtvlGpf5uoLs32hcuxNZlKzugJrELgCruBsGp/d0Dd8K3TezD/35eKxIxd+d1FXwBVwBVzB7qT6toX3dBX+ZD8WKvtOVNhs1beFNQhcAVcg25Ycum7/aSZy9mW9wvA+dmHVFViDwBVwBU9m7tkNfZ3ZTPTL3MM2tlU59BHcSwZrELgCrkC2bUhkYy3RUCDtm41bmLj7gr+6Aq6AK+AKnsy1yW/lY4+zHds50Peloe+16gq4Aq6AK3hxth2793+Tea9983zHGtPqCqxB4Aq4gidT+VyyzNCv0H6Gsb7tJqMeMhts1RVYg8AVcAUv4lo1c6Cv2ZppeoYOtWpD8aptFeoKuAKugCt4dLbdJAiHXpvJp2OpOXMo2RbWIHAFXMF7qZwBVvjj+FiYLQyGfU88G9t1oK6AK+AKuIKzuTaZDFCY9foapqtu8Rp7MLC6AmsQuAKu4Gwq59v2MRbAQw9NuL8aoYvTd6eZOQmwBoEr4Apk29UJtK9Duiomr3pQrroCroAr4Apk29X5tDA23r+rwk2yY9sMzEmANQhcAVeA8Wy7SWrehMJnN4zN1VVXwBVwBVyBbPugmNx3P1imT92XXtUVcAVcAVcg2/4pkfUd+YidrYWPZXMvGaxB4Aq4AjRk27GtAoUzwArvQ9tkvK+6Aq6AK+AK3suR822hroAr4Aq4AnAFXAFXwBVwBVwBuAKugCvgCrgCroArAFfAFQzxA0HqLISU1ASEAAAAAElFTkSuQmCC';
const element=(tag,text,cls)=>{
 const e=document.createElement(tag);
 if(text!==undefined)e.textContent=String(text);
 if(cls)e.className=cls;
 return e;
};
function create(){
 const flyer=element('section',undefined,'afterdark-qr-section afterdark-methodology-last-page afterdark-share-flyer');
 flyer.setAttribute('aria-label','Last page: shareable flyer about The Other Drawer and QR code to the program');
 const mast=element('div',undefined,'od-flyer-mast');
 mast.append(element('span','RANDOM CANDY LAND PRESENTS','od-flyer-eyebrow'));
 mast.append(element('span','THE OTHER DRAWER','od-flyer-brand'));
 mast.append(element('span','A SPACE TO EXPLORE. REFLECT. CONNECT.','od-flyer-tagline'));
 flyer.append(mast);

 const hero=element('div',undefined,'od-flyer-hero');
 hero.append(
  element('h2','Curious about what makes you, you?'),
  element('p','The Other Drawer is an adults-only educational experience about attraction, interests, everyday psychology and relationships. Explore privately, understand yourself better, and find better ways to start meaningful conversations.')
 );
 flyer.append(hero);

 const value=element('div',undefined,'od-flyer-value-grid');
 const cards=[
  ['FOR YOURSELF','Put words to your curiosity','Explore your interests, preferences, imagination and boundaries — at your own pace.'],
  ['FOR COUPLES','Understand each other more deeply','Compare how you like to connect, communicate and feel understood, without assuming you must share every interest.'],
  ['FOR NEW RELATIONSHIPS','Make getting to know each other easier','Create a thoughtful introduction covering everyday life, emotional needs, communication and only the intimate details you choose.']
 ];
 for(const [label,title,detail] of cards){
  const card=element('article',undefined,'od-flyer-value-card');
  card.append(element('span',label,'od-flyer-card-label'),element('h3',title),element('p',detail));
  value.append(card);
 }
 flyer.append(value);

 const method=element('div',undefined,'od-flyer-method');
 method.append(element('h3','What happens when you use the program?'));
 method.append(element('p','Two connected questionnaires — 69 Sexual Preferences questions and 32 nonsexual Psychology questions — organize the answers you choose around shared themes such as trust, sensation, affirmation, imagination and anticipation. You can take either quiz or both.'));
 method.append(element('p','Your answers are used to prepare a detailed personal report with your own selections, interest-by-interest explanations, links between the questionnaires, reflection prompts and optional topics for further discovery. Theme matches are exploratory, not diagnoses, scientific probabilities or hidden facts about you.'));
 method.append(element('p','Unwrapped also has a free Sex Toy Guide comparing male, female and partner uses for 12 toy categories. Where direct quiz answers support a category, the personal report can explain its suitability and safer-use limits. Partner reports include such details only by separate choice.'));
 const outputs=element('div',undefined,'od-flyer-outputs');
 outputs.append(
  element('span','PRIVATE PERSONAL REPORT','od-flyer-output-pill'),
  element('span','CHOOSE-WHAT-TO-SHARE PARTNER PDF','od-flyer-output-pill'),
  element('span','NEW-PARTNER INTRODUCTION','od-flyer-output-pill')
 );
 method.append(outputs);flyer.append(method);

 const end=element('div',undefined,'od-flyer-last');
 const message=element('div',undefined,'od-flyer-invite');
 message.append(element('span','PASS THE CURIOSITY ON','od-flyer-eyebrow'));
 message.append(element('h3','Know someone who might enjoy this?'));
 message.append(element('p','This page is yours to share. Hand this flyer to a friend, send them the website, or scan the QR code to explore The Other Drawer yourself.'));
 message.append(element('p','You choose what you answer and what you share. No partner gets your private answers automatically.','od-flyer-disclaimer'));
 const qr=element('div',undefined,'afterdark-qr-block od-flyer-qr');
 qr.append(element('strong','SCAN TO EXPLORE','od-flyer-scan'));
 const img=document.createElement('img');
 img.src='data:image/png;base64,'+png;
 img.alt='QR code linking to The Other Drawer on Random Candy Land';
 img.width=190;img.height=190;img.decoding='sync';
 qr.append(img);
 const url=element('p',link,'afterdark-qr-url');qr.append(url);
 const anchor=document.createElement('a');anchor.href=link;anchor.rel='noopener noreferrer';
 anchor.textContent='Open The Other Drawer';qr.append(anchor);
 end.append(message,qr);flyer.append(end);
 flyer.append(element('p','ADULT EDUCATION · SELF-REFLECTION · RESPECT · CONSENT · NO DIAGNOSES','od-flyer-footnote'));
 return flyer;
}
window.AfterDarkReportQR=Object.freeze({create,link});
})();