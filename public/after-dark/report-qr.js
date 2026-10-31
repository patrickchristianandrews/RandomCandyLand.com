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
 const page=element('section',undefined,'afterdark-qr-section afterdark-methodology-last-page');
 page.setAttribute('aria-label','Final page: report methodology and QR code to The Other Drawer');
 const top=element('div',undefined,'afterdark-method-top');
 top.append(
   element('p','UNDERSTAND THE METHOD · EXPLORE THE SOURCE','afterdark-qr-eyebrow'),
   element('h2','How your report was created'),
   element('p','The Other Drawer is an adults-only educational space within Random Candy Land. It helps you explore questions about interests, everyday psychology, relationships and how to discuss them thoughtfully. This report organizes your own answers: it does not discover secret facts about you.')
 );
 page.append(top);
 const steps=[
   ['01','You tell us what fits','The 69-question Sexual Preferences Quiz records named interests, curiosity, fantasy-only choices, intentions and boundaries. It respects what you explicitly selected.'],
   ['02','You add everyday context','The 32-question nonsexual Psychology Quiz considers trust, sensory experiences, communication, reassurance, anticipation and other themes. Completing both adds more context; either quiz can produce a partial report.'],
   ['03','Shared themes are compared','Both questionnaires use a shared editorial theme map. The report shows answer-level evidence, overlap and meaningful differences. A direct "Not for me" choice overrides an indirect suggestion.'],
   ['04','You interpret and choose','The personal report explores your answers in detail. Optional partner and new-partner reports let you decide which content, if any, to disclose. Nothing is sent to someone else automatically.']
 ];
 const workflow=element('div',undefined,'afterdark-method-flow');
 for(const [number,heading,body] of steps){
   const card=element('article',undefined,'afterdark-method-step');
   card.append(element('span',number,'afterdark-method-number'),element('h3',heading),element('p',body));
   workflow.append(card);
 }
 page.append(workflow);
 const bottom=element('div',undefined,'afterdark-method-bottom');
 const interpretation=element('div',undefined,'afterdark-method-interpretation');
 interpretation.append(
   element('h3','What the results mean — and what they do not'),
   element('p','Percentages and theme rankings describe relative matches in the site’s editorial scoring system. They are not scientifically validated probabilities, diagnoses, explanations of childhood experiences, measures of compatibility or predictions of enjoyment. Theme-only interests are suggestions for optional reading until you confirm them yourself.'),
   element('p','Your report is assembled in your browser from your saved selections. Downloaded PDFs are copies you control; review sensitive information before sharing.'),
   element('p','You can read about the methodology and the different report formats at randomcandyland.com/after-dark/report-samples/','afterdark-method-location')
 );
 const qr=element('div',undefined,'afterdark-qr-block');
 const img=document.createElement('img');
 img.src='data:image/png;base64,'+png;
 img.alt='QR code to The Other Drawer on Random Candy Land';
 img.width=190;img.height=190;img.decoding='sync';
 qr.append(element('strong','SCAN TO EXPLORE','afterdark-method-scan'),img,element('p',link,'afterdark-qr-url'));
 const linkNode=document.createElement('a');linkNode.href=link;linkNode.rel='noopener noreferrer';linkNode.textContent='Visit The Other Drawer';
 qr.append(linkNode);
 bottom.append(interpretation,qr);page.append(bottom);
 page.append(element('p','THE OTHER DRAWER  ·  RANDOM CANDY LAND  ·  EDUCATIONAL SELF-REFLECTION','afterdark-method-signoff'));
 return page;
}
window.AfterDarkReportQR=Object.freeze({create,link});
})();