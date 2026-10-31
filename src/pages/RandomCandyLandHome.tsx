import React, { useEffect, useState } from 'react';
import { ArrowRight, Music2, Gamepad2, Sparkles, MoonStar, WandSparkles } from 'lucide-react';
import { TrumpCartoonLookalike } from '../components/TrumpCartoonLookalike';
import { RandomNonsenseGenerator } from '../components/RandomNonsenseGenerator';
import { CandyGoo } from '../components/CandyGoo';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

type Category = 'all' | 'games' | 'music' | 'discovery';

type Portal = {
  emoji: string;
  title: string;
  blurb: string;
  kind: Exclude<Category, 'all'>;
  label: string;
  href?: string;
  palette: string;
  oldPet?: boolean;
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
  {emoji:'🏰',name:'Full Candy Land',url:'/'},
  {emoji:'🐣',name:'Trumpagotchi Tiny Pet',url:'/trumpagotchi-fm1/'},
  {emoji:'🎮',name:'Trumpagotchi',url:'/trump/'},
  {emoji:'🍬',name:'Goo Rush',url:'/goo-rush/'},
  {emoji:'🎰',name:'Candy Land Casino',url:'/candy-casino/'},
  {emoji:'🍭',name:'Candy Simon Says',url:'/candy-simon/'},
  {emoji:'🃏',name:'Candy Match',url:'/candy-match/'},
  {emoji:'🌈',name:'Candy Pulse',url:'/music-visualizer/'},
  {emoji:'🌙',name:'The Velvet Rabbit Hole',url:'/after-dark/'},
] as const;

const PORTALS: Portal[] = [
  {emoji:'🐣',title:'Trumpagotchi: The Tiny Pet',blurb:"A playful pixel-art digital pet with food, praise, cleaning, naps, news and music. Keep your tiny pet happy.",kind:'games',label:'NOW PLAYABLE · PIXEL PET',palette:'pink',href:'/trumpagotchi-fm1/'},
  {emoji:'🎮',title:"Donald’s Pocket Pet",blurb:"The original talking Trumpagotchi: care for him, play mini-games, and hear complete recorded reactions.",kind:'games',label:'RETRO DIGIPET',palette:'peach',oldPet:true},
  {emoji:'🍬',title:'GOO RUSH! — Candy Arcade',blurb:"A lightning-fast candy-hunting game with combos, fever bonuses, same-screen 2-player duels, daily puzzles, and friend challenges.",kind:'games',label:'NEW · SOLO & MULTIPLAYER',palette:'pink',href:'/goo-rush/'},
  {emoji:'🎰',title:'Candy Land Casino!',blurb:'A sugar-dripped casino with five-card draw poker, high-card clashes and dice duels. Every game pits you against Candybot or a real person online. Virtual chips only!',kind:'games',label:'NEW · POKER & HUMAN OR COMPUTER RIVALS',palette:'purple',href:'/candy-casino/'},
  {emoji:'🍭',title:'Candy Simon Says!',blurb:"Watch four adorable musical gummies light up, then repeat the candy pattern to win stars and reach the next level.",kind:'games',label:'NEW · MUSIC MEMORY',palette:'peach',href:'/candy-simon/'},
  {emoji:'🃏',title:'Candy Match!',blurb:"Flip colorful mystery cards, find two of the same candy, build your memory and beat your best score.",kind:'games',label:'NEW · MATCHING PAIRS',palette:'purple',href:'/candy-match/'},
  {emoji:'🌈',title:'Candy Pulse',blurb:"A hypnotic music-powered universe of shifting mandalas, kaleidoscopes, glowing particles, geometric tunnels, and bass-reactive light trails.",kind:'music',label:'MUSIC VISUALIZER',palette:'blue',href:'/music-visualizer/'},
  {emoji:'🌙',title:'The Velvet Rabbit Hole',blurb:"A grown-up curiosity atlas for understanding yourself, including the Clue Compass psychology lab.",kind:'discovery',label:'EXPLORE · 18+',palette:'purple',href:'/after-dark/'},
];

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
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
  const shown = PORTALS.filter(portal => category === 'all' || portal.kind === category);
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
        
        <CandyGoo className="candyland-header-goo" color="bubblegum" />
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
          <div className="candyland-eyebrow">WELCOME TO YOUR CANDY-COATED UNIVERSE</div>
          <h1>Stay sweet.<br/><span>Get weird.</span></h1>
          <p>One colorful, wildly imaginative place to play, make things glow, generate ridiculous nonsense, and stumble into something wonderful.</p>
          <div className="candyland-opening-actions"><a className="candyland-primary" href="#adventures">ENTER CANDY LAND <ArrowRight size={21}/></a></div>
        </div>
        <CandyGoo className="candyland-drips" color="bubblegum" />
      </section>

      {/* Nonsense belongs close to the entrance, not buried after every attraction. */}
      <RandomNonsenseGenerator />

      <section id="adventures" className="candyland-adventures">
        <div className="candyland-section-heading">
          <span><Sparkles size={19}/> PICK YOUR PORTAL</span>
          <h2>A world made of <em>what if?</em></h2>
          <p>Every doorway leads somewhere different. Every door opens a fresh adventure. Pick what sounds fun and jump in.</p>
        </div>
        <div className="candyland-filters" role="group" aria-label="Filter attractions">
          {([['all','✨ Everything'],['games','🎮 Games'],['music','🌈 Music'],['discovery','🌙 Explore']] as const).map(([key,label]) => (
            <button key={key} type="button" className={category === key ? 'is-selected' : ''} aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>
          ))}
        </div>
        <div className="candyland-portals">
          {shown.map(portal => {
            const inner = <>
              <div className="candyland-portal-icon">
                {portal.oldPet ? <TrumpCartoonLookalike size={98} animate /> : portal.href === '/trumpagotchi-fm1/' ? <img src="/trumpagotchi-fm1/pixel-icon.svg" width={96} height={96} alt="Pixel-art Trumpagotchi Tiny Pet" loading="lazy" /> : <span>{portal.emoji}</span>}
              </div>
              <span className="candyland-portal-tag">{portal.label}</span>
              <h3>{portal.title}</h3>
              <p>{portal.blurb}</p>
              <span className="candyland-portal-go">Let's go <ArrowRight size={19}/></span>
              <CandyGoo className="candyland-portal-drips" color={portal.palette === 'peach' ? 'peach' : portal.palette === 'blue' ? 'blueberry' : portal.palette === 'purple' ? 'grape' : 'bubblegum'} />
            </>;
            return portal.oldPet ? (
              <button key={portal.title} type="button" onClick={onNavigateToTrump} className={'candyland-portal candyland-portal--'+portal.palette}>{inner}</button>
            ) : (
              <a key={portal.title} href={portal.href} className={'candyland-portal candyland-portal--'+portal.palette}>{inner}</a>
            );
          })}
        </div>
      </section>

      <section className="candyland-install-apps" id="install-apps" aria-label="Install individual Candy Land apps on Android or iPhone">
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
              <div className="candyland-install-card-name"><span aria-hidden="true">{item.emoji}</span><strong>{item.name}</strong></div>
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
      </section>

      <section className="candyland-finale">
        <img src="/icon.svg?v=candy-logo-no-white-3" width={160} height={160} alt="" loading="lazy" />
        <div>
          <span><WandSparkles size={16}/> STILL CURIOUS?</span>
          <h2>Follow the rainbow.</h2>
          <p>The candy door is always open.</p>
        </div>
        <a href="#adventures" className="candyland-primary">EXPLORE MORE <ArrowRight size={20}/></a>
        <CandyGoo className="candyland-finale-goo" color="lemon" />
      </section>
      <footer className="candyland-footer">
        <span>© RANDOM CANDY LAND · MADE OF A LITTLE MAGIC AND A LOT OF SUGAR</span>
        <a href="#top">Back to the candy castle ↑</a>
      </footer>
    </main>
  );
}
