import React, { useEffect, useState } from 'react';
import { RandomNonsenseGenerator } from '../components/RandomNonsenseGenerator';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

type Category = 'all' | 'pets' | 'quick' | 'deep' | 'music' | 'learning' | 'discovery';

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
  {icon:'/tool-icons/casino.svg',name:'Candy Land Casino',url:'/candy-casino/'},
  {icon:'/tool-icons/simon.svg',name:'Candy Simon Says',url:'/candy-simon/'},
  {icon:'/tool-icons/candy-match.svg',name:'Candy Match',url:'/candy-match/'},
  {icon:'/tool-icons/candy-pulse.svg',name:'Candy Pulse',url:'/music-visualizer/'},
  {icon:'/tool-icons/osint-academy.svg',name:'TRACE OSINT Academy',url:'/osint-academy/'},
  {icon:'/tool-icons/moodropolis.svg',name:'Moodropolis',url:'/moodropolis/'},
  {icon:'/tool-icons/the-corridors.svg',name:'The Corridors',url:'/the-corridors/'},
  {icon:'/tool-icons/the-docket.svg',name:'The Docket',url:'/the-docket/'},
  {icon:'/tool-icons/candy-studio.svg',name:'Candy Studio',url:'/studio/'},
] as const;

const TOOL_MENU_NAMES = ['Unwrapped','Trumpagotchi OG','FM-1 Trumpagotchi','Goo Rush','Candy Casino','Simon Says','Candy Match','Candy Pulse','TRACE OSINT','Moodropolis','The Corridors','The Docket','Candy Studio'] as const;
const TOOL_MENU_ICONS = [
  '/tool-icons/unwrapped.svg',
  '/tool-icons/trumpagotchi-2.svg',
  '/trumpagotchi-fm1/pixel-icon.svg',
  '/tool-icons/goo-rush.svg',
  '/tool-icons/casino.svg',
  '/tool-icons/simon.svg',
  '/tool-icons/candy-match.svg',
  '/tool-icons/candy-pulse.svg',
  '/tool-icons/osint-academy.svg',
  '/tool-icons/moodropolis.svg',
  '/tool-icons/the-corridors.svg',
  '/tool-icons/the-docket.svg',
  '/tool-icons/candy-studio.svg'
] as const;

const PORTALS: Portal[] = [
  {icon:TOOL_MENU_ICONS[0],title:'Unwrapped',blurb:"There's more to you. Understand every layer. Appreciate the whole person. Explore psychology, feelings, attraction, communication and relationships, then share what matters through quizzes, guides and partner-friendly reports.",kind:'discovery',label:'KNOW YOURSELF · SHARE MORE · 18+',palette:'purple',href:'/after-dark/'},
  {icon:TOOL_MENU_ICONS[1],title:'Trumpagotchi OG',blurb:"The original talking Trumpagotchi: care for him, play mini-games, and hear complete recorded reactions.",kind:'pets',label:'RETRO DIGIPET',palette:'peach',oldPet:true},
  {icon:TOOL_MENU_ICONS[2],title:'FM-1 Trumpagotchi',blurb:"A playful pixel-art digital pet with food, praise, cleaning, naps, news and music. Keep your tiny pet happy.",kind:'pets',label:'NOW PLAYABLE · PIXEL PET',palette:'pink',href:'/trumpagotchi-fm1/'},
  {icon:TOOL_MENU_ICONS[3],title:'GOO RUSH! — Candy Arcade',blurb:"A lightning-fast candy-hunting game with combos, fever bonuses, same-screen 2-player duels, daily puzzles, and friend challenges.",kind:'quick',label:'NEW · SOLO & MULTIPLAYER',palette:'pink',href:'/goo-rush/'},
  {icon:TOOL_MENU_ICONS[4],title:'Candy Land Casino!',blurb:'A sugar-dripped casino with five-card draw poker, high-card clashes and dice duels. Every game pits you against Candybot or a real person online. Virtual chips only!',kind:'quick',label:'NEW · POKER & HUMAN OR COMPUTER RIVALS',palette:'purple',href:'/candy-casino/'},
  {icon:TOOL_MENU_ICONS[5],title:'Candy Simon Says!',blurb:"Watch four adorable musical gummies light up, then repeat the candy pattern to win stars and reach the next level.",kind:'quick',label:'NEW · MUSIC MEMORY',palette:'peach',href:'/candy-simon/'},
  {icon:TOOL_MENU_ICONS[6],title:'Candy Match!',blurb:"Flip colorful mystery cards, find two of the same candy, build your memory and beat your best score.",kind:'quick',label:'NEW · MATCHING PAIRS',palette:'purple',href:'/candy-match/'},
  {icon:TOOL_MENU_ICONS[7],title:'Candy Pulse',blurb:"A hypnotic music-powered universe of shifting mandalas, kaleidoscopes, glowing particles, geometric tunnels, and bass-reactive light trails.",kind:'music',label:'MUSIC VISUALIZER',palette:'blue',href:'/music-visualizer/'},
  {icon:TOOL_MENU_ICONS[8],title:'TRACE: OSINT Academy',blurb:'Train as an open-source investigator with 25 simulated cases, research tools, workstation setup, source verification, and case reporting.',kind:'learning',label:'INTERACTIVE INVESTIGATION ACADEMY',palette:'blue',href:'/osint-academy/',duration:'LONG COURSE'},
  {icon:TOOL_MENU_ICONS[9],title:'Moodropolis',blurb:'Build a city that feels alive. Meet citizens, respond to their problems, rebuild neighborhoods, discover events, and shape the future of Meridian.',kind:'deep',label:'CITY SIMULATION · OPEN-ENDED',palette:'pink',href:'/moodropolis/',duration:'ONGOING WORLD'},
  {icon:TOOL_MENU_ICONS[10],title:'The Corridors: Rise to Power',blurb:'Enter seven chapters of shifting political alliances. Negotiate with factions and uncover the decisions behind closed doors.',kind:'deep',label:'INTERACTIVE POLITICAL STORY',palette:'blue',href:'/the-corridors/',duration:'30–60 MIN'},
  {icon:TOOL_MENU_ICONS[11],title:'The Docket',blurb:'Enter the courtroom. Review evidence, question witnesses, build a case and navigate five investigations, verdicts, and appeals.',kind:'deep',label:'LEGAL INVESTIGATION SIMULATION',palette:'peach',href:'/the-docket/',duration:'30–60 MIN'},
  {icon:TOOL_MENU_ICONS[12],title:'Candy Studio',blurb:'An all-in-one creative workspace: local-model chat, 24 guided writing tools, original abstract art, photo editing, read-aloud voices, and dictation. Save your work right in your browser.',kind:'discovery',label:'CREATIVE SUITE · NO ACCOUNT NEEDED',palette:'purple',href:'/studio/',duration:'CREATE ANYTIME'},
];

const COLLECTIONS = [
  {id:'pets',title:'Virtual Pets',description:'Care, evolve, and play with your digital characters.',symbol:'🐣'},
  {id:'quick',title:'Quick Games',description:'Jump in for a short session, challenge, or match.',symbol:'⚡'},
  {id:'deep',title:'Long Adventures',description:'Story-rich worlds, big decisions, and lasting progress.',symbol:'🏙️'},
  {id:'learning',title:'Deep Learning',description:'Immersive guided investigations and skill building.',symbol:'🧠'},
  {id:'music',title:'Music & Visuals',description:'Music-powered interactive environments.',symbol:'🎵'},
  {id:'discovery',title:'Explore & Discover',description:'Psychology, creativity and curious self-discovery.',symbol:'🌙'},
] as const;

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  // The notification client is loaded by the shared PWA installer. React may
  // render this page after DOMContentLoaded, so mount the optional preferences
  // panel once its script becomes available.
  useEffect(() => {
    let tries = 0;
    const mount = () => {
      const api = (window as Window & {RandomCandyNotifications?: {mount?: () => void}}).RandomCandyNotifications;
      if(api?.mount){api.mount();return true}
      return false;
    };
    if(mount()) return;
    const timer=window.setInterval(() => {
      if(mount() || ++tries >= 20) window.clearInterval(timer);
    },250);
    return () => window.clearInterval(timer);
  }, []);
  const [category, setCategory] = useState<Category>('all');
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
      <header className="candyland-navbar">
        <a className="candyland-identity" href="#top" aria-label="Random Candy Land — current homepage, back to top">
          <span className="candyland-brand-icon" aria-hidden="true"><img src="/icon.svg?v=candy-logo-no-white-3" alt="" width={55} height={55} /></span>
          <span>RANDOM <strong>CANDY LAND</strong></span>
        </a>
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
          <div className="candyland-hero-categories" role="group" aria-label="Filter games by category">
            <button type="button" className={category === 'all' ? 'is-selected' : ''} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>✨ All</button>
            {COLLECTIONS.map(group => (
              <button key={group.id} type="button" className={category === group.id ? 'is-selected' : ''} aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>
                <span aria-hidden="true">{group.symbol}</span> {group.title}
              </button>
            ))}
          </div>
          <p className="candyland-hero-filter-summary" aria-live="polite">{category === 'all' ? 'All games & tools' : COLLECTIONS.find(group => group.id === category)?.title} · {PORTALS.filter(portal => category === 'all' || portal.kind === category).length}</p>
          <p className="candyland-category-guide">⚡ Quick Games: a few minutes · 🏙️ Long Adventures: stories worth returning to · 🧠 Deep Learning: guided courses</p>
          <nav className="candyland-hero-tools" aria-label="Game and experience library">
            {PORTALS.map((portal,index) => {
              if (category !== 'all' && portal.kind !== category) return null;
              const content = <>
                <span className="candyland-hero-tool-image">
                  <img src={portal.icon} width={160} height={160} alt="" loading="eager" />
                </span>
                <span className="candyland-hero-tool-name">{TOOL_MENU_NAMES[index]}</span>
                <span className="candyland-hero-tool-duration">{portal.duration || (portal.kind === 'quick' ? '5–15 MIN' : portal.kind === 'pets' ? 'DROP IN ANYTIME' : portal.kind === 'music' ? 'INSTANT' : 'EXPLORE')}</span>
              </>;
              return portal.oldPet
                ? <button key={portal.title} type="button" onClick={onNavigateToTrump} className="candyland-hero-tool-link" aria-label={'Open '+TOOL_MENU_NAMES[index]}>{content}</button>
                : <a key={portal.title} href={portal.href} className="candyland-hero-tool-link" aria-label={'Open '+TOOL_MENU_NAMES[index]}>{content}</a>;
            })}
          </nav>
        </div>
      </section>

      <section className="candyland-notify-section" aria-label="Optional notifications for ongoing games">
        <div id="rcl-notify-center">
          <p>🔔 Opt-in phone reminders for your ongoing adventures, with no surprise alerts.</p>
        </div>
      </section>

      <aside className="candyland-unwrapped-promo" aria-label="Featured: Unwrapped personal insight and connection">
        <img className="candyland-unwrapped-promo-icon" src="/tool-icons/unwrapped.svg" width={76} height={76} alt="" loading="lazy" />
        <div className="candyland-unwrapped-promo-copy">
          <span className="candyland-unwrapped-promo-eyebrow">FEATURED · 18+ · SELF-UNDERSTANDING & CONNECTION</span>
          <h2>Unwrapped <span>— Understand every layer. Appreciate the whole person.</span></h2>
          <p>Two connected quizzes help you reflect on your psychology, feelings, attraction, interests, and ways of connecting. Explore personalized results, explanations, potential interests to consider, and detailed, shareable personal and partner reports—so you can understand yourself more deeply, express what matters, appreciate differences, and build more meaningful conversations.</p>
        </div>
        <a className="candyland-unwrapped-promo-link" href="/after-dark/" aria-label="Explore Unwrapped, for adults 18 and older">Explore Unwrapped <span aria-hidden="true">↗</span></a>
      </aside>

      {/* Nonsense belongs close to the entrance, not buried after every attraction. */}
      <RandomNonsenseGenerator />

      <details className="candyland-future-games" aria-label="Three connected playable worlds">
        <summary>✨ Meet the Meridian universe <span>3 games · Play now</span></summary>
        <div className="candyland-section-heading">
          <span>✨ THREE CONNECTED STORIES</span>
          <h2>A city. Its power. <em>Its justice.</em></h2>
          <p>All three now appear in Long Adventures above. Make choices, uncover surprises and keep a shared Meridian chronicle on your device.</p>
        </div>
        <div className="candyland-future-grid">
          <article><strong>🏙️ Moodropolis</strong><p>Manage neighborhoods, emotional wellbeing, a budget, residents, and evolving city events.</p><a href="/moodropolis/" className="candyland-world-play">Play Moodropolis ↗</a></article>
          <article><strong>🏛️ The Corridors: Rise to Power</strong><p>Navigate seven branching policy battles, political bargains, money, ethics, oversight, and relationships.</p><a href="/the-corridors/" className="candyland-world-play">Enter The Corridors ↗</a></article>
          <article><strong>⚖️ The Docket</strong><p>Work five cases from four professional roles, review evidence, argue procedure, reach a conclusion, and explore appeals.</p><a href="/the-docket/" className="candyland-world-play">Open The Docket ↗</a></article>
        </div>
      </details>

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

      <footer className="candyland-footer">
        <span>© RANDOM CANDY LAND · MADE OF A LITTLE MAGIC AND A LOT OF SUGAR</span>
        <a href="#top">Back to the candy castle ↑</a>
      </footer>
    </main>
  );
}
