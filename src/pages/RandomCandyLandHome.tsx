import React, { useEffect, useState } from 'react';
import { RandomNonsenseGenerator } from '../components/RandomNonsenseGenerator';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

type Category = 'all' | 'multiplayer' | 'quick' | 'ongoing' | 'story' | 'learning' | 'discovery' | 'research';

type Portal = {
  icon: string;
  title: string;
  blurb: string;
  kind: Exclude<Category, 'all'>;
  label: string;
  href?: string;
  palette: string;
  oldPet?: boolean;
  duration?: string;
  multiplayer?: 'online' | 'same-screen';
};

// The current app can detect when it is launched from its installed home-screen
// icon (Android/desktop display-mode and iOS Safari navigator.standalone).
// A regular browser tab cannot reliably inspect all OS-installed apps.
function isRunningInstalledCandyLand(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

// These routes each have a separate web-app manifest and start URL.
const INSTALL_CHOICES = [
  {icon:'/icon.svg',name:'Full Candy Land',url:'/'},
  {icon:'/tool-icons/unwrapped.svg',name:'Unwrapped',url:'/after-dark/'},
  {icon:'/tool-icons/trumpagotchi-2.svg',name:'Trumpagotchi OG',url:'/trump/'},
  {icon:'/trumpagotchi-fm1/pixel-icon.svg',name:'FM-1 Trumpagotchi',url:'/trumpagotchi-fm1/'},
  {icon:'/tool-icons/goo-rush.svg',name:'Goo Rush',url:'/goo-rush/'},
  {icon:'/tool-icons/casino.svg',name:'Candy Land Poker',url:'/candy-casino/'},
  {icon:'/tool-icons/simon.svg',name:'Candy Simon Says',url:'/candy-simon/'},
  {icon:'/tool-icons/candy-match.svg',name:'Candy Match',url:'/candy-match/'},
  {icon:'/tool-icons/osint-academy.svg',name:'Trace Public Sources Dictionary',url:'/osint-academy/'},
  {icon:'/tool-icons/the-corridors.svg',name:'The Corridors',url:'/the-corridors/'},
  {icon:'/tool-icons/the-docket.svg',name:'The Docket',url:'/the-docket/'},
  {icon:'/tool-icons/candy-studio.svg',name:'Random AI',url:'/studio/'},
  {icon:'/tool-icons/ai-academy.svg',name:'AI Academy',url:'/ai-academy/'},
  {icon:'/tool-icons/wonder-index.svg',name:'The Wonder Index',url:'/curiosity/'},
] as const;

const TOOL_MENU_NAMES = ['Unwrapped','Trumpagotchi OG','FM-1 Trumpagotchi','Goo Rush','Candy Poker','Simon Says','Candy Match','Trace Public Sources','The Corridors','The Docket','Random AI','AI Academy','The Wonder Index'] as const;
const TOOL_MENU_ICONS = [
  '/tool-icons/unwrapped.svg',
  '/tool-icons/trumpagotchi-2.svg',
  '/trumpagotchi-fm1/pixel-icon.svg',
  '/tool-icons/goo-rush.svg',
  '/tool-icons/casino.svg',
  '/tool-icons/simon.svg',
  '/tool-icons/candy-match.svg',
  '/tool-icons/osint-academy.svg',
  '/tool-icons/the-corridors.svg',
  '/tool-icons/the-docket.svg',
  '/tool-icons/candy-studio.svg',
  '/tool-icons/ai-academy.svg',
  '/tool-icons/wonder-index.svg'
] as const;

const PORTALS: Portal[] = [
  {icon:TOOL_MENU_ICONS[0],title:'Unwrapped',blurb:"There's more to you. Understand every layer. Appreciate the whole person. Explore psychology, feelings, attraction, communication and relationships, then share what matters through quizzes, guides and partner-friendly reports.",kind:'discovery',label:'KNOW YOURSELF · SHARE MORE · 18+',palette:'purple',href:'/after-dark/'},
  {icon:TOOL_MENU_ICONS[1],title:'Trumpagotchi OG',blurb:"The original talking Trumpagotchi: care for him, play mini-games, and hear complete recorded reactions.",kind:'ongoing',label:'RETRO DIGIPET',palette:'peach',oldPet:true},
  {icon:TOOL_MENU_ICONS[2],title:'FM-1 Trumpagotchi',blurb:"A playful pixel-art digital pet with food, praise, cleaning, naps, news and music. Keep your tiny pet happy.",kind:'ongoing',label:'NOW PLAYABLE · PIXEL PET',palette:'pink',href:'/trumpagotchi-fm1/'},
  {icon:TOOL_MENU_ICONS[3],title:'GOO RUSH! — Candy Arcade',blurb:"A lightning-fast candy-hunting game with combos, fever bonuses, same-screen 2-player duels, daily puzzles, and friend challenges.",kind:'multiplayer',label:'NEW · SOLO & MULTIPLAYER',palette:'pink',href:'/goo-rush/',multiplayer:'same-screen',duration:'5–15 MIN'},
  {icon:TOOL_MENU_ICONS[4],title:'Candy Land Poker',blurb:'Play five-card draw poker against Candybot or invite a friend. Exchange up to three cards, compete across five rounds, and see exactly why each winning hand wins. Virtual chips only.',kind:'multiplayer',label:'FIVE-CARD DRAW · SOLO OR ONLINE FRIEND',palette:'purple',href:'/candy-casino/',multiplayer:'online',duration:'5–30 MIN'},
  {icon:TOOL_MENU_ICONS[5],title:'Candy Simon Says!',blurb:"Watch four adorable musical gummies light up, then repeat the candy pattern to win stars and reach the next level.",kind:'quick',label:'NEW · MUSIC MEMORY',palette:'peach',href:'/candy-simon/'},
  {icon:TOOL_MENU_ICONS[6],title:'Candy Match!',blurb:"Flip colorful mystery cards, find two of the same candy, build your memory and beat your best score.",kind:'multiplayer',label:'NEW · MATCHING PAIRS',palette:'purple',href:'/candy-match/',multiplayer:'same-screen',duration:'5–15 MIN'},
  {icon:TOOL_MENU_ICONS[7],title:'Trace Public Sources Dictionary',blurb:'Search public records, verify sources, find live camera networks, and organize your findings.',kind:'research',label:'RESEARCH REFERENCE',palette:'blue',href:'/osint-academy/'},
  {icon:'/tool-icons/osint-academy.svg',title:'Executive Directory',blurb:'Find customer escalation teams, executive business emails, and support numbers.',kind:'research',label:'CUSTOMER ESCALATIONS',palette:'blue',href:'/executive-directory/',duration:'FIND A CONTACT ↗'},
  {icon:TOOL_MENU_ICONS[8],title:'The Corridors: Rise to Power',blurb:'Enter seven chapters of shifting political alliances. Negotiate with factions and uncover the decisions behind closed doors.',kind:'story',label:'INTERACTIVE POLITICAL STORY',palette:'blue',href:'/the-corridors/',duration:'30–60 MIN'},
  {icon:TOOL_MENU_ICONS[9],title:'The Docket',blurb:'Enter the courtroom. Review evidence, question witnesses, build a case and navigate five investigations, verdicts, and appeals.',kind:'story',label:'LEGAL INVESTIGATION SIMULATION',palette:'peach',href:'/the-docket/',duration:'30–60 MIN'},
  {icon:TOOL_MENU_ICONS[11],title:'AI Academy',blurb:'Stop guessing what to type. Master prompting with 13 illustrated lessons, hands-on challenges, interactive quizzes and a live Prompt Builder.',kind:'learning',label:'FREE LEARNING LAB · 13 LESSONS',palette:'blue',href:'/ai-academy/',duration:'SELF-PACED COURSE'},
];

const COLLECTIONS = [
  {id:'discovery',title:'Explore & Understand',description:'A fuller picture of who you are—psychology, personal interests, relationships and how to express what matters.',symbol:'🌙',time:'DISCOVER · CONNECT'},
  {id:'research',title:'Public Research',description:'Find public records and learn how to check them.',symbol:'🔎',time:'REFERENCE'},
  {id:'multiplayer',title:'Multiplayer & Play Together',description:'Play with other people. Online rooms and same-screen modes are clearly marked.',symbol:'👥',time:'PLAY TOGETHER'},
  {id:'quick',title:'Quick Games',description:'Jump in for a round, puzzle or friendly challenge. No long commitment.',symbol:'⚡',time:'2–15 MIN'},
  {id:'ongoing',title:'Ongoing Worlds & Pets',description:'Build, nurture and return. Your evolving worlds and pets wait for you.',symbol:'🌱',time:'PLAY ANYTIME'},
  {id:'story',title:'Story Adventures',description:'Deeper narratives, decisions and case missions that reward a longer session.',symbol:'🎭',time:'30–60 MIN'},
  {id:'learning',title:'Courses & Training',description:'Master prompting in AI Academy with guided practice at your own pace.',symbol:'🧠',time:'EXTENDED'},
] as const;

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [copiedUrl,setCopiedUrl] = useState('');
  const [candyLandInstalled, setCandyLandInstalled] = useState(isRunningInstalledCandyLand);
  // Hide the full-site install CTA when the current PWA is installed, and
  // immediately after an Android/desktop install completes in this tab.
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const syncInstalled = () => {
      if (isRunningInstalledCandyLand()) setCandyLandInstalled(true);
    };
    const installed = () => setCandyLandInstalled(true);
    media.addEventListener?.('change', syncInstalled);
    window.addEventListener('pageshow', syncInstalled);
    window.addEventListener('appinstalled', installed);
    return () => {
      media.removeEventListener?.('change', syncInstalled);
      window.removeEventListener('pageshow', syncInstalled);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  const installChoices = candyLandInstalled ? INSTALL_CHOICES.filter(item => item.url !== '/') : INSTALL_CHOICES;
  const copyAppLink = async (path:string) => {
    const url = new URL(path, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(path);
    } catch {
      window.prompt('Copy this address and open it in Safari or Chrome:', url);
    }
  };

  return (
    <main id="top" className="candyland-next">
      <div className="candyland-starfield" aria-hidden="true">
        <span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span>
      </div>
      <header className="candyland-navbar candyland-navbar-ai" aria-label="Random Candy Land and featured Random AI">
        <a className="candyland-identity" href="#top" aria-label="Random Candy Land — back to top">
          <span className="candyland-brand-icon" aria-hidden="true"><img src="/icon.svg?v=candy-logo-no-white-3" alt="" width={55} height={55} /></span>
          <span>RANDOM <strong>CANDY LAND</strong></span>
        </a>
        <aside className="candyland-random-ai-promo candyland-navbar-feature" aria-label="Featured Random AI creative studio">
          <a className="candyland-random-ai-promo-link candyland-navbar-feature-link" href="/studio/" aria-label="Open Random AI: free, unlimited private local AI chats on compatible devices and recommended writing and coding stacks">
            <img src="/tool-icons/candy-studio.svg" width={48} height={48} alt="" loading="eager" />
            <span className="candyland-navbar-feature-copy">
              <span className="candyland-navbar-feature-kicker">✦ FEATURED · CREATE WITHOUT LIMITS</span>
              <span className="candyland-navbar-feature-title"><strong>Random AI</strong><span>Free, unlimited private local AI</span></span>
              <small>Write, code, brainstorm and solve problems with a recommended AI stack for every task.</small>
              <span className="candyland-navbar-feature-detail">Runs on your device · No local chat message caps · Download a model once · Optional hosted Instant AI when connected</span>
            </span>
            <span className="candyland-navbar-feature-action">Explore Random AI <span aria-hidden="true">↗</span></span>
          </a>
        </aside>
      </header>

      <section className="candyland-opening" aria-label="Welcome to Random Candy Land">
        <div className="candyland-orbit candyland-orbit-one" aria-hidden="true">
          <span className="planet-ring" /><span className="planet-eye eye-left" />
          <span className="planet-eye eye-right" /><span className="planet-smile" /><span className="planet-star">✦</span>
        </div>
        <span className="candyland-confetti confetti-one" aria-hidden="true">🍬</span>
        <span className="candyland-confetti confetti-two" aria-hidden="true">🍭</span>
        <span className="candyland-confetti confetti-three" aria-hidden="true">✨</span>
        <div className="candyland-opening-art">
          <img
            src="/random-candy-land-art.webp"
            alt="A rainbow candy castle, a smiling peppermint and a gummy bear, surrounded by colorful dripping candy letters spelling Random Candy Land"
            width={768}
            height={768}
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="candyland-opening-copy">
          <h1>Stay sweet.<br/><span>Get weird.</span></h1>
        </div>
      </section>

      {/* The Nonsense Dispatch is a small fictional-news ticker at the top. */}
      <RandomNonsenseGenerator />


      <div className="candyland-play-shelves" aria-label="Games and tools organized by experience">
            {COLLECTIONS.map(group => {
              const games = PORTALS.filter(portal => portal.kind === group.id);
              return (<>
                <section className={'candyland-play-shelf candyland-play-shelf-'+group.id} key={group.id} aria-labelledby={'shelf-'+group.id}>
                  {group.id !== "discovery" && (
                  <div className="candyland-play-shelf-heading">
                    <div className="candyland-play-shelf-lead">
                      <span className="candyland-play-shelf-emoji" aria-hidden="true">{group.id === 'discovery' ? <img src="/tool-icons/unwrapped.svg" width={40} height={40} alt="" loading="lazy" /> : group.symbol}</span>
                      <div>
                        <h2 id={'shelf-'+group.id}>{group.title}</h2>
                        <p>{group.description}</p>
                      </div>
                    </div>
                    <span className="candyland-play-shelf-time">{group.time} · {games.length} {games.length===1 ? 'experience' : 'experiences'}</span>
                  </div>
                  )}
                  <nav className="candyland-hero-tools" data-count={games.length} aria-label={group.title}>
                    {games.map(portal => {
                      const content = <>
                        <span className="candyland-hero-tool-image">
                          <span className="candyland-unwrapped-logo-glow" aria-hidden="true" />
                          <img src={portal.icon} width={120} height={120} alt="" loading="lazy" />

                        </span>
                        <span className="candyland-hero-tool-info">
                          {portal.kind === 'discovery' ? (
                            <>
                              <span className="candyland-unwrapped-feature-eyebrow">✦ A DIFFERENT KIND OF SELF-DISCOVERY · 18+</span>
                              <span className="candyland-hero-tool-name">{portal.title}</span>
                              <span className="candyland-unwrapped-feature-body">
                                <span className="candyland-unwrapped-feature-headline">Explore your intimate side. Understand the whole person.</span>
                                <span className="candyland-unwrapped-feature-description">Explore your intimate side or broader psychology separately, or blend both for a holistic understanding of how everything connects. Explore practical toy-use guides for male and female anatomy, plus tailored reading suggestions in your private report. Choose exactly which highlights to share, then compare selected partner reports for communication and understanding.</span>
                                <span className="candyland-unwrapped-feature-output-title">EXPLORE EVERY LAYER · TAKE HOME REAL INSIGHTS</span>
                                <span className="candyland-unwrapped-feature-footer">
                                  <span className="candyland-unwrapped-feature-help">Private, self-paced reflection · Adults 18+ · Not a clinical assessment</span>
                                  <span className="candyland-unwrapped-feature-cta">Explore Unwrapped <span aria-hidden="true">↗</span></span>
                                </span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="candyland-hero-tool-name">{portal.title}</span>
                              <span className="candyland-hero-tool-blurb">{portal.blurb}</span>
                              <span className="candyland-hero-tool-duration">{portal.kind === 'research' ? (portal.duration || 'OPEN DICTIONARY ↗') : portal.duration || (group.id === 'quick' ? '5–15 MIN' : group.id === 'ongoing' ? 'DROP IN ANYTIME' : 'EXPLORE')}</span>
                              {portal.kind !== 'research' && <span className={'candyland-multiplayer-tag '+(portal.multiplayer||'single')}>{portal.multiplayer==='online'?'🌐 Online friends · relay required':portal.multiplayer==='same-screen'?'👥 Same-screen multiplayer':'👤 Single-player / solo'}</span>}
                            </>
                          )}
                        </span>
                      </>;
                      return portal.oldPet
                        ? <button key={portal.title} type="button" onClick={onNavigateToTrump} className="candyland-hero-tool-link" aria-label={'Open '+portal.title}>{content}</button>
                        : <a key={portal.title} href={portal.href} className={'candyland-hero-tool-link'+(portal.kind === 'discovery' ? ' candyland-unwrapped-feature-card' : '')} aria-label={'Open '+portal.title}>{content}</a>;
                    })}
                  </nav>
                </section>
                  {group.id === 'discovery' && (
                    <section className="candyland-curiosity-spotlight" aria-labelledby="curiosity-spotlight-title">
                      <div className="candyland-curiosity-copy">
                        <span className="candyland-curiosity-kicker">✦ DAILY IDEAS · FRESH RESEARCH · REAL DATA</span>
                        <h2 id="curiosity-spotlight-title">The <em>Wonder Index.</em></h2>
                        <p>One surprising idea at a time, new research headlines, and strange correlations made from real statistics.</p>
                        <div className="candyland-curiosity-actions">
                          <a href="/curiosity/">Explore the Wonder Index ↗</a>
                          <a href="/curiosity/correlations/">Try the correlation generator ↗</a>
                        </div>
                      </div>
                      <img className="candyland-curiosity-icon" src="/tool-icons/wonder-index.svg" width={96} height={96} alt="" loading="lazy" />
                    </section>
                  )}
                  {group.id === 'quick' && (
                    <section className="candyland-liquid-spotlight" aria-labelledby="liquid-wave-title">
                      <style>{`
.candyland-next .candyland-liquid-spotlight{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:22px;align-items:center;max-width:1180px;margin:16px auto 32px;padding:clamp(19px,3vw,30px);border:2px solid #ffc2e2;border-radius:22px;background:linear-gradient(120deg,#4c166e 5%,#a3246f 60%,#d9542c);color:#fff;overflow:hidden;box-shadow:0 11px 25px #4c166e55}
.candyland-next .candyland-liquid-kicker{display:block;font:900 10px/1.6 system-ui;letter-spacing:.13em;color:#ffe9a8}
.candyland-next .candyland-liquid-spotlight h2{margin:4px 0 6px}
.candyland-next .candyland-liquid-spotlight em{font-style:normal;color:#ffe9a8}
.candyland-next .candyland-liquid-spotlight p{margin:0 0 8px}
.candyland-next .candyland-liquid-note{font-size:13px;opacity:.92}
.candyland-next .candyland-liquid-spotlight a{display:inline-block;margin:4px 8px 4px 0;padding:10px 16px;border-radius:999px;background:#fff;color:#7a1c52;font-weight:800;text-decoration:none}
.candyland-next .candyland-liquid-spotlight a:hover{background:#ffe9a8}
.candyland-next .candyland-liquid-spotlight img{justify-self:center}
@media (max-width:640px){.candyland-next .candyland-liquid-spotlight{grid-template-columns:1fr}.candyland-next .candyland-liquid-spotlight img{order:-1;width:96px;height:96px}}
                      `}</style>
                      <div>
                        <span className="candyland-liquid-kicker">✦ NEW · MUSIC TOY · FM-1 INSTALLER</span>
                        <h2 id="liquid-wave-title">Liquid <em>Wave.</em></h2>
                        <p>Press Generate and eight cute band members float around, overlap and perform a freshly written song. Own an M-VAVE FM-1? Install the experimental firmware right from here.</p>
                        <p className="candyland-liquid-note">The FM-1 firmware is experimental and has not been tested on a real device. Back up first.</p>
                        <div>
                          <a href="/liquid-wave/">Play Liquid Wave ↗</a>
                          <a href="/liquid-wave/install/">Install on an FM-1 ↗</a>
                        </div>
                      </div>
                      <img src="/tool-icons/liquid-wave.svg" width={120} height={120} alt="" loading="lazy" />
                    </section>
                  )}
              </>);
            })}
          </div>

      <details className="candyland-install-apps" id="install-apps" aria-label="Install individual Candy Land apps on Android or iPhone">
        <summary>📲 Install your favorites <span>Optional</span></summary>
        <div className="candyland-section-heading">
          <span>📲 MAKE IT YOUR OWN</span>
          <h2>Install your <em>favorites.</em></h2>
          <p>Already have Candy Land on your home screen? You can still add each game or tool separately.</p>
        </div>
        <p className="candyland-install-help">
          <strong>Android:</strong> Open the selected game in Chrome and choose ⋮ → Install app or Add to Home screen.
          <strong> iPhone:</strong> Open it in Safari and choose Share → Add to Home Screen.
          If a link opens inside your installed Candy Land app, tap <strong>Copy link</strong> and paste it into Chrome or Safari.
        </p>
        <div className="candyland-install-grid">
          {installChoices.map(item => (
            <article className="candyland-install-card" key={item.url}>
              <div className="candyland-install-card-name"><img src={item.icon} width={45} height={45} alt="" loading="lazy" /><strong>{item.name}</strong></div>
              <div className="candyland-install-card-actions">
                <a href={item.url + (item.url.includes('?') ? '&' : '?') + 'install=1'} target="_blank" rel="noopener noreferrer" aria-label={'Open '+item.name+' installation page'}>
                  📲 Install to Home Screen
                </a>
                <button type="button" onClick={() => copyAppLink(item.url)} aria-label={'Copy '+item.name+' link'}>
                  {copiedUrl===item.url?'✓ Copied':'📋 Copy link'}
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="candyland-install-footnote">These are individually installable web apps, not Apple App Store or Google Play downloads. Installation options vary by browser and device.</p>
      </details>

      <section id="absurder-report-destination" className="candyland-report-destination nonsense-newsroom" tabIndex={-1} aria-label="The Absurdity Report full news story">
        <div className="candyland-report-destination-head">
          <span className="candyland-report-destination-kicker">FICTIONAL SATIRE · THE FULL STORY</span>
          <h2>THE ABSURDITY REPORT</h2>
          <p>All the news that never happened. The latest fictional story stays open here; choose a headline above or select Next Story for another.</p>
        </div>
      </section>

      <footer className="candyland-footer">
        <span>© RANDOM CANDY LAND · MADE OF A LITTLE MAGIC AND A LOT OF SUGAR</span>
        <a href="#top">Back to the candy castle ↑</a>
      </footer>
    </main>
  );
}
