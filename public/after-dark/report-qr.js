/* Shared, offline QR and explanatory footer for locally generated After Dark PDF reports.
 * The PNG is an embedded high-contrast QR, so PDF export never needs a network request. */
(()=>{
'use strict';
const link='https://randomcandyland.com/after-dark/';
const png='iVBORw0KGgoAAAANSUhEUgAAALkAAAC5AQAAAABc1qPxAAABvUlEQVR42u1XMW7cMBCcPQmgOtovoF4iKVXKfCKfOEDCSTgDLvOlk/yKdNQDApCVKYC6SaE4aZJ2AxjehiS2mCVndjEU4q8xnfCP+Ei8g0QUkVMcBEscpJpFpFKs6kLeUPitw5ODkNR8kl0q2NFVDS4eiFJr8xHLNc1OJP0PMdgRFSK9uhILJmCvDcNUV7BHBVrgk0gXs8OC3oEiogUOHhEuNAwFza/zqNXng2ziRADskhY8rYp9bo23XEdsHXpIK9lpcn5utxN6JKAgYAdJepyH3pm7pYcwA40ljRLnIJnB2wF59SRHR01wl1pmJFh6zsxQvHm4MEmAM3MA0IZeDbwErNTfG2BNn28E+Bi+OkXBAZx59YahR2pQeE3Or94wFD419kpztyOo9+wxO8xfttK8njJiF/WGDEjS827pDQNcgs1OcbZjqvES9jp2KOYKsYTqzUmGgpAAZxig1mpv7hUAGptXLCi81mz/7V7PNW+AQ6Nso3apYEtUsxi/ycO5VXev47GmBs9ey0yUf7bbp/AN9vXxh6pvL5hgM3g/KnieNQU3iXTR+Gqxg4APeoIrAUsAyG826uPv/N4TPwGUTg3KlwEe+wAAAABJRU5ErkJggg==';
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