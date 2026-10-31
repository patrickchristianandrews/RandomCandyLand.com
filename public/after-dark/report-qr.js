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
 const section=element('section',undefined,'afterdark-qr-section');
 const text=element('div',undefined,'afterdark-qr-description');
 text.append(element('p','EXPLORE THE FULL EXPERIENCE','afterdark-qr-eyebrow'),
  element('h2','Learn more at After Dark'),
  element('p','After Dark is an adults-only place to explore interests, better understand yourself, and find ways to talk openly with a partner. You can take the preferences quiz, explore the psychology quiz, or browse topics at your own pace.'));
 text.append(element('h3','How this report was created'));
 text.append(element('p','The report brings together the answers you chose and looks for connections between them. Themes such as trust, curiosity, closeness, imagination, and sensation help organize the results. Some interests are ones you selected yourself; others are simply ideas that might be worth reading about. The best judge of what fits is you.'));
 text.append(element('p','Your answers stay on your device unless you choose to save or share them. Partner reports contain only the sections you select.','afterdark-qr-privacy'));
 const qr=element('div',undefined,'afterdark-qr-block');
 const img=document.createElement('img');
 img.src='data:image/png;base64,'+png;
 img.alt='QR code for randomcandyland.com/after-dark/';
 img.width=180;img.height=180;img.decoding='sync';
 qr.append(img,element('p',link,'afterdark-qr-url'));
 const a=document.createElement('a');a.href=link;a.textContent='Open the After Dark landing page';a.rel='noopener noreferrer';qr.append(a);
 section.append(text,qr);return section;
}
window.AfterDarkReportQR=Object.freeze({create,link});
})();