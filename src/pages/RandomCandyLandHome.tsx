import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TrumpCartoonLookalike } from '../components/TrumpCartoonLookalike';

interface RandomCandyLandHomeProps {
  onNavigateToTrump: () => void;
}

function CandyLink({
  emoji, title, subtitle, href, shade, label,
}: {
  emoji: string; title: string; subtitle: string;
  href: string; shade: string; label: string;
}) {
  return (
    <a className={'sugar-offering sugar-offering--' + shade} href={href} aria-label={'Open ' + title}>
      <div className="sugar-offering-orb" aria-hidden="true">{emoji}</div>
      <div className="sugar-offering-body">
        <span className="sugar-tag">{label}</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <span className="sugar-linktext">Explore <ArrowRight size={16} /></span>
      </div>
    </a>
  );
}

export function RandomCandyLandHome({ onNavigateToTrump }: RandomCandyLandHomeProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const showGroup = (id: string) => activeCategory === 'all' || activeCategory === id;

  return (
    <main id="top" className="sugar-universe">
      <div className="sugar-sky" aria-hidden="true">
        <i className="sugar-cloud sugar-cloud-a" />
        <i className="sugar-cloud sugar-cloud-b" />
        <i className="sugar-cloud sugar-cloud-c" />
        <span className="sugar-floater one">🍭</span>
        <span className="sugar-floater two">🍬</span>
        <span className="sugar-floater three">🍩</span>
        <span className="sugar-floater four">🌈</span>
        <span className="sugar-floater five">⭐</span>
      </div>

      <header className="sugar-nav">
        <a href="#top" className="sugar-mark" aria-label="Go to the top of the current Candy Land homepage"><img src="/random-candy-land-art.webp" width={48} height={48} alt="" /><strong>RANDOM<span>CANDYLAND</span></strong><small>.com</small></a>
        <div className="sugar-navlinks">
          <a href="#attractions">✨ Explore attractions</a>
          <a href="/music-visualizer/">🎵 Music & color</a>
          <a href="/after-dark/">🌙 After Dark</a>
        </div>
      </header>

      <section className="sugar-hero">
        <span className="sugar-kicker">🍭 SWEET, SILLY & A LITTLE BIT WILD ✦</span>
        <h1><span>WONDER.</span><br /><em>WEIRDNESS.</em><br /><b>PURE CANDY CHAOS!</b></h1>
        <p>Welcome to our rainbow-powered candy universe. Meet the cheerful candy crew, play unexpected games, make some noise, and get wonderfully weird.</p>
        <div className="sugar-herobuttons">
          <a href="#attractions" className="sugar-mainbtn">EXPLORE THE UNIVERSE <ArrowRight size={19} /></a>
          <a href="/music-visualizer/" className="sugar-otherbtn">🌈 Experience the music</a>
        </div>
        <div className="sugar-hero-stats">
          <span>🎮 PLAY</span>
          <span>🎵 CREATE & LISTEN</span>
          <span>🌙 DISCOVER</span>
        </div>
        {/* Restore the original smiling candy planet as a background element. */}
        <div className="sugar-hero-planet sugar-planet-behind" aria-hidden="true">
          <span className="planet-ring" />
          <span className="planet-eye eye-left" />
          <span className="planet-eye eye-right" />
          <span className="planet-smile" />
          <span className="planet-star">✦</span>
        </div>
        <div className="sugar-hero-brand" aria-hidden="true">
          <img src="/random-candy-land-art.webp" alt="" width={460} height={460} decoding="async" fetchPriority="high" />
          <span>🍬 WELCOME TO THE SWEET SIDE! 🍬</span>
        </div>
      </section>

      <section id="attractions" className="sugar-section sugar-attractions">
        <div className="sugar-sectiontop">
          <div>
            <span className="sugar-eyebrow">✦ CHOOSE YOUR NEXT ADVENTURE</span>
            <h2>Every corner is <em>something different.</em></h2>
            <p>Games, live music visuals, a pocket synth, and curious little worlds. Pick your next adventure.</p>
          </div>
        </div>
        <div className="sugar-filter" role="group" aria-label="Filter attractions">
          {[
            ['all', '✨ Everything'],
            ['games', '🎮 Games'],
            ['music', '🎵 Music'],
            ['discovery', '🌙 Discovery'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={activeCategory === id ? 'on' : ''}
              aria-pressed={activeCategory === id}
              onClick={() => setActiveCategory(id)}
            >{label}</button>
          ))}
        </div>
        <div className="sugar-offerings">
          {showGroup('games') && (
            <button className="sugar-offering sugar-offering--gold sugar-trump-feature" type="button" onClick={onNavigateToTrump}>
              <div className="sugar-trump-portrait" aria-hidden="true"><TrumpCartoonLookalike size={112} animate /></div>
              <div className="sugar-offering-body">
                <span className="sugar-tag">🎮 GAMES · RETRO PET</span>
                <h3>Donald's Pocket Pet</h3>
                <p>Keep an outrageous little presidential digi-pet happy, fed, groomed, and entertained.</p>
                <span className="sugar-linktext">Play the pet game <ArrowRight size={16} /></span>
              </div>
            </button>
          )}
          {showGroup('music') && (
            <CandyLink
              emoji="🌈"
              title="Candy Pulse"
              subtitle="Turn music into hypnotic neon waves, dancing light, and mesmerizing color."
              href="/music-visualizer/"
              shade="pink"
              label="🎵 MUSIC · VISUALIZER"
            />
          )}
          {showGroup('music') && (
            <CandyLink
              emoji="🎹"
              title="FM-1 Synth Lab"
              subtitle="Make strange, wonderful sounds in a playful pocket-sized synth experiment."
              href="/fm1-emu/"
              shade="blue"
              label="🎵 MUSIC · SYNTH LAB"
            />
          )}
          {showGroup('discovery') && (
            <CandyLink
              emoji="✳️"
              title="After Dark"
              subtitle="An adults-only, judgment-free atlas of curiosity, reflection, and psychology."
              href="/after-dark/"
              shade="midnight"
              label="🌙 DISCOVERY · 18+"
            />
          )}
        </div>
      </section>

      <section className="sugar-endcap">
        <img src="/random-candy-land-art.webp" alt="" width={78} height={78} loading="lazy" />
        <div>
          <h2>The internet should feel <em>this fun.</em></h2>
          <p>Something colorful, unusual, and completely unexpected is just a click away.</p>
        </div>
        <a href="#attractions" className="sugar-mainbtn"><Sparkles size={18} /> Discover more <ArrowRight size={18} /></a>
      </section>
      <footer className="sugar-footer">
        <span>✦ RANDOMCANDYLAND.COM ✦</span>
        <span>Made with sugar, imagination, and a spectacular lack of seriousness.</span>
        <a href="#attractions">Back to the portals ↑</a>
      </footer>
    </main>
  );
}
