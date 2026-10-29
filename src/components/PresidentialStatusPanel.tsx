import React from 'react';
import type { PetStats } from '../types/game';

interface PresidentialStatusPanelProps {
  stats: PetStats;
}

const readable = (value: number) => Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)));

/** Live values from the older Trumpagotchi's own save/game state—not a second simulation. */
export function PresidentialStatusPanel({ stats }: PresidentialStatusPanelProps) {
  const meters = [
    { label: 'FOOD', icon: '🍔', value: readable(stats.hunger) },
    { label: 'MOOD', icon: '💛', value: readable(stats.happiness) },
    { label: 'ENERGY', icon: '⚡', value: readable(stats.energy) },
    { label: 'CLEANLINESS', icon: '✨', value: readable(stats.cleanliness) },
  ];
  const needs: { icon: string; title: string; action: string; severity: number }[] = [];
  if (stats.isSick || stats.health < 40) needs.push({ icon: '💊', title: 'He needs medical attention', action: 'Select MEDICINE with A, then press B.', severity: 0 });
  if (stats.hunger < 40) needs.push({ icon: '🍔', title: 'He is hungry', action: 'Select FEED with A, then press B.', severity: stats.hunger < 20 ? 0 : 1 });
  if (stats.energy < 35) needs.push({ icon: '🛌', title: 'He needs rest', action: 'Select LIGHTS with A and press B to sleep.', severity: stats.energy < 20 ? 0 : 1 });
  if (stats.cleanliness < 45 || stats.messCount >= 2) needs.push({ icon: '🧹', title: 'He needs cleaning', action: 'Select CLEAN with A, then press B to remove the mess.', severity: stats.cleanliness < 25 ? 0 : 2 });
  if (stats.happiness < 45) needs.push({ icon: '💛', title: 'He needs cheering up', action: 'Try DANCE or PEP TALK from the A/B menu.', severity: stats.happiness < 25 ? 0 : 2 });
  if (stats.hairStyle < 45) needs.push({ icon: '💇', title: 'He needs grooming', action: 'Select GROOM with A, then press B.', severity: 2 });
  if (stats.ratings < 40) needs.push({ icon: '📊', title: 'His approval is low', action: 'Improve food, mood, health and appearance.', severity: 3 });
  needs.sort((a, b) => a.severity - b.severity);
  return (
    <aside aria-label="Presidential Status and what Donald needs" className="relative z-20 w-full max-w-md mx-auto lg:mx-0 lg:sticky lg:top-5 rounded-3xl border-2 border-fuchsia-300/50 bg-[#20152f]/95 p-4 sm:p-5 shadow-[0_18px_45px_#09031999] text-white">
      <div className="flex items-center gap-3 border-b border-fuchsia-200/20 pb-3">
        <span aria-hidden="true" className="text-3xl">📊</span>
        <div><h2 className="text-lg sm:text-xl font-black tracking-wide text-amber-200">PRESIDENTIAL STATUS</h2>
          <p className="text-xs text-fuchsia-100/80">Live report from Donald's handheld.</p></div>
      </div>
      <div className="mt-4 space-y-3" aria-label="Pet needs meters">
        {meters.map(meter => (
          <div key={meter.label}>
            <div className="flex items-center justify-between gap-2 mb-1 text-xs font-bold">
              <span>{meter.icon} {meter.label}</span><span className="tabular-nums text-amber-100">{meter.value}%</span>
            </div>
            <progress aria-label={meter.label} className="block w-full h-3 rounded-full overflow-hidden accent-fuchsia-400" max={100} value={meter.value} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4" aria-label="Other presidential vital statistics">
        <div className="rounded-xl bg-white/10 px-1 py-3 text-center"><div className="text-[10px] text-fuchsia-100">💇 HAIR</div><strong className="text-lg tabular-nums">{readable(stats.hairStyle)}%</strong></div>
        <div className="rounded-xl bg-white/10 px-1 py-3 text-center"><div className="text-[10px] text-fuchsia-100">❤️ HEALTH</div><strong className="text-lg tabular-nums">{readable(stats.health)}%</strong></div>
        <div className="rounded-xl bg-white/10 px-1 py-3 text-center"><div className="text-[10px] text-fuchsia-100">⭐ POLL</div><strong className="text-lg tabular-nums">{readable(stats.ratings)}%</strong></div>
      </div>
      <section aria-label="What Donald needs" className="mt-5 border-t border-fuchsia-200/20 pt-4">
        <h3 className="text-base font-black text-amber-200">🩺 WHAT HE NEEDS</h3>
        <p className="mt-1 text-xs text-fuchsia-100/80">Updates automatically as you care for him.</p>
        {stats.isSleeping && <p className="mt-3 rounded-xl bg-sky-900/45 p-3 text-sm">💤 Donald is sleeping and recovering energy.</p>}
        {needs.length ? (
          <ul className="mt-3 space-y-2">
            {needs.slice(0, 4).map(need => (
              <li key={need.title} className="rounded-xl border border-fuchsia-200/15 bg-white/5 p-3">
                <strong className="block text-sm">{need.icon} {need.title}</strong>
                <span className="block mt-1 text-xs leading-relaxed text-fuchsia-100/90">{need.action}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-3 text-sm">
            ✅ All systems are looking good. Keep feeding, cleaning and checking in with him.
          </p>
        )}
      </section>
    </aside>
  );
}
