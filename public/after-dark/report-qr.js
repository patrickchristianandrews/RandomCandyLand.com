/* Shared, offline QR and explanatory footer for locally generated After Dark PDF reports.
 * The PNG is an embedded high-contrast QR, so PDF export never needs a network request. */
(()=>{
'use strict';
const link='https://randomcandyland.com/after-dark/';
const png='iVBORw0KGgoAAAANSUhEUgAAAWgAAAFoAQAAAABSnlx4AAACS0lEQVR42u2awWqcQQyD9ZW+/yurB9sz00APoV5oQVnIZvfXSTGyLBvrGz8/FHTQQQcd9L+B/ilJ1N/GaPQcSbLweRoGt/gukpGQsTBGkpGEz9MwuMW3kFy0G7tY7/I+T8PgNhqBDEy1H6kJgx9B4xIQJFuGcPIZPfnSJat1ytS/wGFwCy3bQ6f/8LrAMPi3aPzlE64q99Mvw+A6utpj+e9iWjYl4YCIH9xDI8xUNLKnaQoJbBMGN9H0HAmyEL622/VFGNxEuyd3G84M75o361HmnUW0Kz1p+bavlAuBPX01DC7piTUioiefsnDpSfKT5bxq2mUlKOrMyt0yO8AKg1v+pHMqgaGZLzdY82UblDC45U88OoIl28iW3IVN5+JhcCk/GQvSiSwtKvWhBSYM7uk3rqboKvXS7Z42zemhYXCtvqdndjjos3/ozDD9ctF/4xtdoV6jVXKCjkMPg4v5SUUmJyk5u8vunPEnO2juMrgV5ewun4pPv1zOT+ya4MuflHqXpIt7EhEGd+p7aloWv0fgp4emvhf9idGUdI/vz86SJ1MJgzv9ssgePXG995JHj0EJg0t+UNQQXyHhW9I09ZnnN/2g1SvKc+aD4WaxJI/d1O9Ju+t48BjwJykMg4t8z4xTIUpPm51d6VxIhMG9vKpZvznVHXqeX2FwC905CXNkRe8gcF2fOPcnH0DP/H6vqvqgLfcnH0G3WveGp6zhmTTD4J5+32myu6Xw2fBU2cd/L+Ynh/THnsxFih5LGAZX+A4nQQcddND/HfoXkmJE2OrXgGkAAAAASUVORK5CYII=';
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
  element('p','After Dark is a private, adults-only self-reflection and educational resource. It offers a 69-question Sexual Preferences Quiz, a 32-question non-explicit Psychology Quiz, an interest library, and tools for understanding preferences, boundaries, and partner communication.'));
 text.append(element('h3','How this report was created'));
 text.append(element('p','Your selected answers are organized by predefined themes such as trust, sensation, affirmation, novelty, control, and imagination. Related topics are offered as editorial suggestions, not scientifically validated predictions or diagnoses. Direct choices carry more weight than thematic similarities. A percentage shown elsewhere is an illustrative match score, not the probability that someone likes an activity.'));
 text.append(element('p','Answers remain in the browser unless you explicitly choose to export or share them. A shared PDF contains only what the person who created it chose to include.','afterdark-qr-privacy'));
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