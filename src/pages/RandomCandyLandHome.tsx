import React, { useState } from 'react';
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

const PORTALS: Portal[] = [
  {emoji:'🎮',title:"Donald’s Pocket Pet",blurb:"The original talking Trumpagotchi: care for him, play mini-games, and hear complete recorded reactions.",kind:'games',label:'RETRO DIGIPET',palette:'peach',oldPet:true},
  {emoji:'🐣',title:'Trumpagotchi: Little Pet',blurb:"Care for a very demanding little pet with food, praise, cleaning, naps, music, and a changing mood.",kind:'games',label:'NEW MINI PET',palette:'pink',href:'/trumpagotchi-pet/'},
  {emoji:'🌈',title:'Candy Pulse',blurb:"Turn your own music into mesmerizing colorful waves, bouncing lights, and reactive shapes.",kind:'music',label:'MUSIC VISUALIZER',palette:'blue',href:'/music-visualizer/'},
  {emoji:'🌙',title:'After Dark',blurb:"A grown-up curiosity atlas for discovering and understanding more about yourself.",kind:'discovery',label:'EXPLORE · 18+',palette:'purple',href:'/after-dark/'},
];

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [category, setCategory] = useState<Category>('all');
  const shown = PORTALS.filter(portal => category === 'all' || portal.kind === category);

  return (
    <main id="top" className="candyland-next">
      <div className="candyland-starfield" aria-hidden="true">
        <span>✦</span><span>✧</span><span>✦</span><span>✧</span><span>✦</span>
      </div>
      <header className="candyland-navbar">
        <a className="candyland-identity" href="#top" aria-label="Random Candy Land — current homepage, back to top">
          <img src="/random-candy-land-art.webp" alt="" width={55} height={55} />
          <span>RANDOM <strong>CANDY LAND</strong></span>
        </a>
        <nav aria-label="Main website navigation">
          <a href="#adventures"><Gamepad2 size={17}/> Play</a>
          <a href="#nonsense">🎲 Nonsense</a>
          <a href="/music-visualizer/"><Music2 size={17}/> Music</a>
          <a href="/after-dark/"><MoonStar size={17}/> After Dark</a>
        </nav>
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
          <a className="candyland-primary" href="#adventures">ENTER CANDY LAND <ArrowRight size={21}/></a>
        </div>
        <CandyGoo className="candyland-drips" color="bubblegum" />
      </section>

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
                {portal.oldPet ? <TrumpCartoonLookalike size={98} animate /> : <span>{portal.emoji}</span>}
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

      <RandomNonsenseGenerator />

      <section className="candyland-finale">
        <img src="/random-candy-land-art.webp" width={160} height={160} alt="" loading="lazy" />
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
