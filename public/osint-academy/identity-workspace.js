/* Switch between simulated practice and self/authorized public-profile review.
 * The profile pane performs explicit user-triggered, public-API lookups; this switch performs none.
 */
(()=>{'use strict';
 const root=document.getElementById('view-identity');
 if(!root)return;
 const panes={cases:document.getElementById('identity-cases-pane'),profile:document.getElementById('identity-profile-pane')};
 const profileButton=root.querySelector('[data-identity-mode="profile"]');
 const casesButton=root.querySelector('[data-identity-mode="cases"]');
 if(profileButton&&casesButton){
  const heading=profileButton.querySelector('strong'),caption=profileButton.querySelector('small');
  if(heading)heading.textContent='Research a clue';
  if(caption)caption.textContent='One detail · public evidence';
  casesButton.parentNode.insertBefore(profileButton,casesButton);
 }
 function choose(mode){
  if(!panes[mode])return;
  Object.entries(panes).forEach(([id,pane])=>{pane.hidden=id!==mode});
  root.querySelectorAll('[data-identity-mode]').forEach(button=>{
   const chosen=button.dataset.identityMode===mode;button.setAttribute('aria-selected',String(chosen));button.classList.toggle('active',chosen);
  });
  root.dataset.identityMode=mode;
 }
 root.querySelectorAll('[data-identity-mode]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.identityMode)));
 choose('profile');
 window.TraceIdentityWorkspace=Object.freeze({choose,current:()=>root.dataset.identityMode});
})();