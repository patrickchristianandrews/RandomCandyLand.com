import React, { useState } from 'react';
import { X, Globe, Download, Check, Copy, Server, ArrowRight, ShieldCheck, Crown } from 'lucide-react';

interface DomainDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTrump: () => void;
}

export function DomainDeployModal({ isOpen, onClose, onNavigateToTrump }: DomainDeployModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#1c1130] via-[#10071c] to-[#07030c] border-2 border-amber-400/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* 24K Gold top trim */}
        <div className="absolute top-0 inset-x-0 h-1.5 gold-shimmer" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚜️</span>
            <div>
              <h2 className="text-xl font-serif-luxury font-bold text-white flex items-center gap-2">
                Five-Star Deployment: <span className="text-amber-300">randomcandyland.com</span>
              </h2>
              <p className="text-xs text-amber-200/70 font-serif-luxury">
                Setup guide &amp; complete project ZIP bundle for custom domain publishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Route Map */}
          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4">
            <h3 className="text-xs font-serif-luxury font-bold tracking-widest text-amber-400 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" /> FIVE-STAR ROUTE ARCHITECTURE
            </h3>
            <div className="space-y-2 text-xs font-serif-luxury">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b102c] border border-amber-500/20">
                <span className="font-mono text-amber-300 font-bold">randomcandyland.com/</span>
                <span className="text-amber-100">Main 5-Star Landing Page &amp; High-Roller Game Room</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1b102c] border border-amber-500/20">
                <span className="font-mono text-amber-300 font-bold">randomcandyland.com/trump</span>
                <div className="flex items-center gap-3">
                  <span className="text-amber-100">Trumpagotchi Subpage</span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTrump();
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg gold-shimmer text-black cursor-pointer flex items-center gap-1 active:scale-95"
                  >
                    Launch <ArrowRight className="w-3 h-3 text-black" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DNS Configuration Guide */}
          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-4">
            <h3 className="text-xs font-serif-luxury font-bold tracking-widest text-amber-400 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" /> DNS RECORDS FOR RANDOMCANDYLAND.COM
            </h3>
            <p className="text-xs text-amber-200/70 font-serif-luxury mb-3">
              To point your domain directly to this live instance or to your CDN, add these records at your domain registrar (GoDaddy, Namecheap, Cloudflare, Route53):
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#140b20] border border-amber-500/30">
                <div className="text-amber-200 truncate mr-2">
                  <span className="text-amber-400 font-bold">Type:</span> CNAME &nbsp;|&nbsp;
                  <span className="text-amber-300">Host:</span> @ or www &nbsp;|&nbsp;
                  <span className="text-emerald-400 font-bold">Target:</span> ais-pre-tbytyaiajs6c3susl2k2li-513211631453.us-east1.run.app
                </div>
                <button
                  onClick={() => copyText('ais-pre-tbytyaiajs6c3susl2k2li-513211631453.us-east1.run.app', 'dns-cname-cloudrun')}
                  className="p-1 rounded hover:bg-white/10 text-amber-300 cursor-pointer shrink-0"
                >
                  {copiedKey === 'dns-cname-cloudrun' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#140b20] border border-amber-500/30">
                <div className="text-amber-200">
                  <span className="text-amber-400 font-bold">Vercel/Netlify Alternative:</span> CNAME to <span className="text-emerald-400 font-bold">cname.vercel-dns.com</span>
                </div>
                <button
                  onClick={() => copyText('cname.vercel-dns.com', 'dns-cname')}
                  className="p-1 rounded hover:bg-white/10 text-amber-300 cursor-pointer shrink-0"
                >
                  {copiedKey === 'dns-cname' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* GitHub Pages 1-Click Update */}
          <div className="bg-gradient-to-r from-[#211438] via-[#140a24] to-[#211438] border-2 border-amber-400/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-serif-luxury font-bold text-white">GitHub Pages Live Deploy Bundle</h4>
              </div>
              <a
                href="/github-pages-ready.zip"
                download="randomcandyland-github-pages.zip"
                className="px-4 py-2 rounded-xl gold-shimmer text-black font-serif-luxury font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                Download GitHub ZIP
              </a>
            </div>
            <p className="text-xs text-amber-200/70 font-serif-luxury">
              Contains the production <code className="text-amber-300">index.html</code>, <code className="text-amber-300">404.html</code>, and assets ready to drag into your GitHub repo at <code className="text-amber-300">patrickchristianandrews/RandomCandyLand.com</code>.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <a
                href="https://github.com/patrickchristianandrews/RandomCandyLand.com/upload/main"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-serif-luxury font-bold transition flex items-center gap-1.5"
              >
                <span>Upload to GitHub Web</span>
                <ArrowRight className="w-3 h-3" />
              </a>
              <a
                href="/trumpagotchi-project.zip"
                download="randomcandyland-full-project.zip"
                className="px-3.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 text-amber-300 border border-amber-500/30 font-serif-luxury font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3 h-3 text-amber-400" />
                <span>Full Source Code ZIP</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-amber-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-serif-luxury font-bold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
