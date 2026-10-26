import React, { useState } from 'react';
import { Share, PlusSquare, Smartphone, Check, X, ArrowRight, ExternalLink } from 'lucide-react';

interface InstallModalProps {
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallModal: React.FC<InstallModalProps> = ({ onClose, deferredPrompt }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [installed, setInstalled] = useState(false);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
    } else {
      alert("To install on Android: Tap the 3 dots (⋮) in the top right of Chrome, then tap 'Install app' or 'Add to Home screen'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#120824] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative space-y-4 animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center text-2xl">
            📱
          </div>
          <h3 className="text-lg sm:text-xl font-serif-luxury font-black text-amber-300 tracking-wide">
            Add Trump Gotcha to Home Screen
          </h3>
          <p className="text-xs text-amber-100/70 font-sans">
            Play anytime in full screen with one tap — zero browser bars!
          </p>
        </div>

        {/* Platform Tabs: Apple iPhone vs Android */}
        <div className="grid grid-cols-2 p-1 bg-black/60 rounded-xl border border-amber-500/30 text-xs font-serif-luxury font-bold">
          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'gold-shimmer text-black font-black shadow-sm'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <span>🍎 Apple iPhone / iPad</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android'
                ? 'gold-shimmer text-black font-black shadow-sm'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <span>🤖 Android / Chrome</span>
          </button>
        </div>

        {/* TAB 1: APPLE iOS INSTRUCTIONS */}
        {activeTab === 'ios' && (
          <div className="space-y-3 bg-black/40 border border-amber-500/20 rounded-2xl p-4 text-xs font-sans">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                1
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>Open in Safari &amp; Tap Share</span>
                  <Share className="w-3.5 h-3.5 text-sky-400" />
                </p>
                <p className="text-neutral-400 text-[11px]">
                  Tap the rectangular icon with the upward arrow <span className="text-white font-mono">[↑]</span> at the bottom of Safari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                2
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>Scroll &amp; Tap "Add to Home Screen"</span>
                  <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
                </p>
                <p className="text-neutral-400 text-[11px]">
                  Scroll down the share sheet and tap the <strong className="text-amber-200">"Add to Home Screen"</strong> button.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                3
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>Tap "Add" in Top-Right</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </p>
                <p className="text-neutral-400 text-[11px]">
                  Tap <strong className="text-white">Add</strong>. Trump Gotcha will appear on your phone home screen with its custom gold icon!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANDROID INSTRUCTIONS */}
        {activeTab === 'android' && (
          <div className="space-y-3 bg-black/40 border border-amber-500/20 rounded-2xl p-4 text-xs font-sans">
            {deferredPrompt ? (
              <div className="text-center space-y-3 py-2">
                <p className="text-amber-200 font-medium">
                  Your Android device supports 1-tap installation!
                </p>
                <button
                  onClick={handleAndroidInstall}
                  className="w-full py-3 rounded-xl gold-shimmer text-black font-serif-luxury font-black text-sm uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer"
                >
                  {installed ? '✓ App Installed!' : '⚡ Install to Home Screen'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Tap Chrome Menu [⋮]</p>
                    <p className="text-neutral-400 text-[11px]">
                      Tap the 3 vertical dots in the top-right corner of Google Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Tap "Install App" or "Add to Home Screen"</p>
                    <p className="text-neutral-400 text-[11px]">
                      Select the install option from the menu list.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">Confirm "Install"</p>
                    <p className="text-neutral-400 text-[11px]">
                      The gold Trump Gotcha icon will be added to your app drawer and home screen.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Got It Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-serif-luxury font-bold text-xs uppercase tracking-wider transition cursor-pointer"
        >
          Got It, Return to Digi-Pet
        </button>

      </div>
    </div>
  );
};
