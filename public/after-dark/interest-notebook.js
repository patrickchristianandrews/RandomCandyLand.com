/* After Dark private notebook — no remote account, no automatic sharing.
   Only selected text is put in an invite URL fragment or printed to PDF.
   All drafts remain in this browser's localStorage. */
(() => {
  'use strict';
  const api=window.AfterDarkNotebookBridge;
  if (!api) return;
  const $=id=>document.getElementById(id);
  const KEY='afterdark_interest_notebook_v1';
  let notes={};
  try {const x=JSON.parse(localStorage.getItem(KEY)||'{}');if(x && typeof x==='object' && !Array.isArray(x))notes=x;} catch {}
  const selectedToShare=new Set();
  const item=(tag,value='',cls='')=>{const e=document.createElement(tag);e.textContent=String(value);if(cls)e.className=cls;return e;};
  const button=(label,action,cls='btn')=>{const e=item('button',label,cls);e.type='button';e.onclick=action;return e;};
  const safe=(x,n=450)=>String(x||'').trim().slice(0,n);
  const topics=()=>api.getTopics();
  const source=()=>api.getChoices();
  const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(notes));}catch{setStatus('Unable to save in this browser. Use the print/PDF option to keep a copy.');}};
  const setStatus=text=>{const n=$('notebook-status');if(n)n.textContent=text;};
  const field=(label,value,handler,placeholder,rows=3)=>{
    const box=item('div');const caption=item('label',label);
    const area=document.createElement('textarea');area.rows=rows;area.maxLength=650;area.value=value||'';area.placeholder=placeholder;area.setAttribute('aria-label',label);
    area.addEventListener('input',()=>handler(area.value.slice(0,650)));
    box.append(caption,area);return box;
  };
  const included=()=>topics().filter(t=>source()[t.id]==='yes'||source()[t.id]==='maybe'||notes[t.id]).sort((a,b)=>a.name.localeCompare(b.name));
  function goNotebook(){
    document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('visible',e.id==='notebook'));
    document.querySelectorAll('[data-tab]').forEach(e=>e.classList.toggle('selected',e.dataset.tab==='notebook'));
    if($('afterdark-current'))$('afterdark-current').textContent='My Saved Interests';
    history.replaceState(null,'','#notebook');renderNotebook();scrollTo({top:0,behavior:'smooth'});
  }
  function saveTopic(t){
    if(!t?.id||!topics().some(x=>x.id===t.id))return;
    notes[t.id]={...(notes[t.id]||{}),saved:true};store();goNotebook();
    requestAnimationFrame(()=>$('saved-interest-'+t.id)?.scrollIntoView({block:'center',behavior:'smooth'}));
  }
  function renderNotebook(){
    const root=$('notebook-content');if(!root)return;root.replaceChildren();
    root.append(item('p','Everything stays private on this device until you select items and create a share link or PDF. You can remove any saved entry. A link can be forwarded; only share it with someone you trust.','notebook-help'));
    const intro=item('div','','notebook-intro');
    const heading=item('h3','💌 A thoughtful invitation to understand');
    intro.append(heading,item('p','Start with an invitation that asks for listening, not immediate agreement or participation. Choose exactly which topics to include.'));
    const name=field('Name or nickname to sign with',sessionStorage.getItem('afterdark_share_name')||'',v=>{try{sessionStorage.setItem('afterdark_share_name',v);}catch{}},'Your nickname (optional)',1);
    const opening=field('What I want you to understand',sessionStorage.getItem('afterdark_share_intro')||'',v=>{try{sessionStorage.setItem('afterdark_share_intro',v);}catch{}},'I want to share something personal and would appreciate a calm, curious conversation. You do not have to agree or participate.');
    name.dataset.notebook='name';opening.dataset.notebook='intro';intro.append(name,opening);root.append(intro);
    const list=included();root.append(item('h3','Your saved & selected interests ('+list.length+')'));
    if(!list.length){
      root.append(item('div','No saved interests yet. Go to the Curiosity Atlas, mark Interested or Curious, or save any interest directly from your quiz results. Then return here.','notebook-empty'));
      root.append(button('📚 Browse the Curiosity Atlas →',()=>document.querySelector('#home [data-tab=atlas]')?.click(),'btn alt'));
    }
    for(const t of list){
      const v=notes[t.id]||{},card=item('article','','notebook-interest');card.id='saved-interest-'+t.id;
      const top=item('div','','notebook-top');
      top.append(item('h3',t.name+' · '+t.cat));
      const share=item('label','','notebook-share-label');const cb=document.createElement('input');cb.type='checkbox';cb.checked=selectedToShare.has(t.id);
      cb.setAttribute('aria-label','Include '+t.name+' in a partner invitation');
      cb.onchange=()=>{if(cb.checked)selectedToShare.add(t.id);else selectedToShare.delete(t.id);};
      share.append(cb,document.createTextNode('Include in invitation'));top.append(share);card.append(top,item('p',t.description));
      const area=item('div','','notebook-fieldset');
      for(const [key,label,placeholder] of [
        ['meaning','Why this interests me / what it makes me feel','For me, the important part is…'],
        ['boundary','My boundaries / what I do NOT want','I would not be comfortable with…'],
        ['request','How you can best listen and respond','I would appreciate questions, patience or a conversation—not a commitment…']
      ]){
        area.append(field(label,v[key],value=>{notes[t.id]={...(notes[t.id]||{}),[key]:value,saved:true};store();setStatus('💾 Your changes were saved in this browser.');},placeholder));
      }
      card.append(area);
      card.append(button('Remove saved entry',()=>{delete notes[t.id];selectedToShare.delete(t.id);store();renderNotebook();},'text-button'));
      root.append(card);
    }
    const actions=item('div','','notebook-actions');
    actions.append(button('🔗 Create selected invite link',createLink));
    actions.append(button('📋 Copy selected message',copyMessage,'btn alt'));
    actions.append(button('📄 Save private notebook as PDF',printNotebook,'btn alt'));
    root.append(actions);
    const result=item('div','','notebook-public-link');result.id='notebook-output';result.hidden=true;root.append(result);
    const status=item('p','','notebook-help');status.id='notebook-status';status.setAttribute('role','status');root.append(status);
  }
  function buildPack(){
    const chosen=included().filter(x=>selectedToShare.has(x.id));
    if(!chosen.length){setStatus('Select at least one “Include in invitation” box first.');return null;}
    if(chosen.length>6){setStatus('Select at most six interests per link, so the invitation can open on phones.');return null;}
    const name=safe(document.querySelector('[data-notebook=name] textarea')?.value,50);
    const intro=safe(document.querySelector('[data-notebook=intro] textarea')?.value,600);
    const items=chosen.map(t=>({
      title:safe(t.name,100),category:safe(t.cat,80),description:safe(t.description,210),
      meaning:safe(notes[t.id]?.meaning,450),boundary:safe(notes[t.id]?.boundary,450),request:safe(notes[t.id]?.request,450)
    }));
    return {version:1,name,intro,items};
  }
  function packText(pack){
    const result=[(pack.name||'Someone')+' would like to share some interests with you.',
      'This is an invitation to listen with curiosity—not a request for agreement, immediate answers, or participation.',
      pack.intro||'I want you to understand the feelings and meaning behind these interests.',''];
    for(const t of pack.items){
      result.push(t.title+' — '+t.category,t.description);
      if(t.meaning)result.push('What it means to me: '+t.meaning);
      if(t.boundary)result.push('My limits: '+t.boundary);
      if(t.request)result.push('What would help me feel heard: '+t.request);
      result.push('');
    }
    result.push('You can listen without agreeing, ask respectful questions, take more time, or decline. Any activity would require separate, freely given consent.');
    return result.join('\n');
  }
  function encode(pack){
    const raw=new TextEncoder().encode(JSON.stringify(pack));
    if(raw.length>6800)return '';
    let binary='';for(const b of raw)binary+=String.fromCharCode(b);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decode(input){
    if(input.length>10000||!/^[A-Za-z0-9_-]+$/.test(input))return null;
    try{
      const s=atob(input.replace(/-/g,'+').replace(/_/g,'/'));
      const bytes=Uint8Array.from(s,c=>c.charCodeAt(0));
      const p=JSON.parse(new TextDecoder().decode(bytes));
      if(p?.version!==1||!Array.isArray(p.items)||p.items.length>6)return null;
      const valid=p.items.every(x=>x&&typeof x.title==='string'&&typeof x.category==='string'&&typeof x.description==='string'&&Object.values(x).every(v=>typeof v==='string'&&v.length<=600));
      if(!valid)return null;
      return {...p,name:safe(p.name,50),intro:safe(p.intro,600)};
    }catch{return null;}
  }
  async function copy(text){
    try{await navigator.clipboard.writeText(text);setStatus('✓ Copied. Paste into your preferred private message.');}
    catch{const out=$('notebook-output');if(out){out.hidden=false;out.replaceChildren(item('p','Select and copy the text below.'));const t=document.createElement('textarea');t.value=text;t.style.width='100%';out.append(t);t.select();}}
  }
  function createLink(){
    const pack=buildPack();if(!pack)return;
    const data=encode(pack);if(!data){setStatus('Invitation is too long for a reliable link. Choose fewer interests or shorten the notes.');return;}
    const address=new URL('/after-dark/',location.origin);address.hash='partner-view?data='+data;
    const out=$('notebook-output');out.hidden=false;out.replaceChildren(item('p','Share only with someone you trust. The link includes your selected notes, is not encrypted, and can be forwarded.','notebook-help'));
    const input=document.createElement('input');input.readOnly=true;input.value=address.href;input.setAttribute('aria-label','Selected private invitation link');out.append(input);
    out.append(button('📋 Copy invitation link',()=>copy(address.href),'btn alt'));
    out.append(button('👀 Preview their view',()=>showInvitation(pack,true),'btn alt'));
    setStatus('Link created. Unselected interests and other notes are not included.');
  }
  function copyMessage(){const pack=buildPack();if(pack)copy(packText(pack));}
  function putPrint(title,subtitle,entries){
    let doc=$('print-document');if(!doc){doc=item('div');doc.id='print-document';document.body.append(doc);}
    doc.replaceChildren(item('h1',title),item('p',subtitle));
    for(const entry of entries){const block=item('article');block.append(item('h2',entry.title));
      for(const str of entry.paragraphs)if(str)block.append(item('p',str));doc.append(block);}
    document.body.classList.add('print-notebook');
    requestAnimationFrame(()=>window.print());
  }
  function printNotebook(){
    const choices=source();
    const rows=included().map(t=>({title:t.name+' — '+(choices[t.id]||'Saved'),
      paragraphs:[t.description,
       notes[t.id]?.meaning&&'Why it matters: '+notes[t.id].meaning,
       notes[t.id]?.boundary&&'My boundaries: '+notes[t.id].boundary,
       notes[t.id]?.request&&'How I want to communicate: '+notes[t.id].request]}));
    if(!rows.length){setStatus('Save at least one interest before printing your notebook.');return;}
    putPrint('My Private Interest Notebook','Personal reflection · Not a diagnosis · Choose “Save as PDF” in your print dialog.',rows);
  }
  function printQuiz(){
    if(!api.getQuizReady()){goNotebook();setStatus('Finish the Curiosity Quiz first, then use Save Quiz Results as PDF on its results screen.');return;}
    // Clone exactly the visible result text, never send it to a server.
    const root=$('quizCard');let doc=$('print-document');
    if(!doc){doc=item('div');doc.id='print-document';document.body.append(doc);}
    doc.replaceChildren(item('h1','My After Dark Quiz Results'),item('p','Reflection, exploration-fit estimates and self-reported interests · Not a diagnosis or scientifically calibrated probability.'));
    const copy=root.cloneNode(true);copy.querySelectorAll('button,textarea,input,select').forEach(el=>el.remove());
    copy.removeAttribute('id');doc.append(copy);
    document.body.classList.add('print-notebook');
    requestAnimationFrame(()=>window.print());
  }
  function showInvitation(pack,preview=false){
    const area=$('partner-invitation');if(!area)return;
    area.replaceChildren();
    document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('visible',el.id==='partner-view'));
    if($('afterdark-current'))$('afterdark-current').textContent='An Invitation to Listen';
    area.append(item('h3',(pack.name||'Someone')+' would like to share something with you.'));
    area.append(item('p',pack.intro||'I would appreciate you hearing the meaning behind these interests. There is no obligation to agree or participate.'));
    area.append(item('p','💛 You can listen without agreeing, ask questions, take more time, or respectfully decline. This is not consent to any activity.','notebook-help'));
    for(const x of pack.items){
      const block=item('article','','partner-interest');
      block.append(item('h3',x.title),item('p',x.description));
      if(x.meaning)block.append(item('p','💗 Why it matters: '+x.meaning));
      if(x.boundary)block.append(item('p','🛑 Boundaries: '+x.boundary));
      if(x.request)block.append(item('p','💬 How to respond: '+x.request));
      area.append(block);
    }
    const panel=item('div','','partner-accept');panel.append(item('h3','How do you feel about talking?'),item('p','Choose a response that respects both people. No response is sent automatically.'));
    const response=item('p','','notebook-help');response.setAttribute('role','status');
    for(const [name,text] of [
      ['💛 I’m open to listening','I appreciate you sharing this. I am open to listening and asking questions, without making promises.'],
      ['⏳ I need time','Thank you for trusting me. I need some time to think and would like to revisit this later.'],
      ['🛑 Not for me','I hear you, and I respect you sharing it. I do not want to explore this interest, and I hope we can respect that boundary.']
    ]){
      panel.append(button(name,()=>{response.textContent=text;const copyButton=button('📋 Copy this response',()=>navigator.clipboard.writeText(text).then(()=>response.textContent='Copied your reply.').catch(()=>response.textContent=text),'btn alt');response.replaceChildren(document.createTextNode(text),document.createTextNode(' '),copyButton);},'btn alt'));
    }
    panel.append(response);area.append(panel);
    if(preview)area.prepend(button('← Back to my notebook',goNotebook,'btn alt'));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  const rawHash=location.hash.slice(1),encoded=rawHash.startsWith('partner-view?data=')?rawHash.slice('partner-view?data='.length):'';
  const invitation=encoded?decode(encoded):null;
  if(invitation)showInvitation(invitation);
  else if(encoded){document.querySelectorAll('.tab').forEach(el=>el.classList.toggle('visible',el.id==='partner-view'));$('partner-invitation')?.replaceChildren(item('p','This invitation could not be opened. Ask the sender for a fresh link.'));}
  for(const b of document.querySelectorAll('[data-tab=notebook]'))b.addEventListener('click',renderNotebook);
  window.addEventListener('afterprint',()=>{document.body.classList.remove('print-notebook');$('print-document')?.remove();});
  const shortcut=button('💌 My Saved Interests',goNotebook,'notebook-fab');shortcut.setAttribute('aria-label','Open my private saved interests notebook');document.body.append(shortcut);
  window.InterestNotebook={saveTopic,goNotebook,renderNotebook,printQuiz,printNotebook,showInvitation};
  if(location.hash==='#notebook')renderNotebook();
})();
