"use client";

import { useRef, useState } from "react";

type Artwork = { url: string; prompt: string; createdAt: string };
const styles = ["Cinematic", "Dreamlike", "Watercolor", "Photorealistic", "Abstract", "Neon dream", "Pencil sketch", "Fantasy art"];
const ratios = [{ label: "Square", value: "1024x1024" }, { label: "Portrait", value: "1024x1536" }, { label: "Landscape", value: "1536x1024" }];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [studioPassword, setStudioPassword] = useState("");
  const [style, setStyle] = useState("Dreamlike");
  const [size, setSize] = useState("1024x1024");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [history, setHistory] = useState<Artwork[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function generate() {
    if (!prompt.trim()) { setError("Describe what you want to create first."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json", "x-studio-password": studioPassword }, body: JSON.stringify({ prompt: prompt.trim(), style, size }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image generation failed. Please try again.");
      const item = { url: data.image, prompt: prompt.trim(), createdAt: new Date().toLocaleString() };
      setArtwork(item); setHistory((old) => [item, ...old].slice(0, 12));
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">f</span><span>fibo<span className="muted-brand"> studio</span><small>YOUR IMAGINATION, IN COLOR</small></span></a><span className="top-pill"><i /> CREATIVE SPACE</span></header>
    <section className="hero"><div className="eyebrow"><span>✳</span> AI IMAGE WORKSHOP</div><h1>Make room for<br /><em>the impossible.</em></h1><p className="intro">A thought, a feeling, a tiny spark. Give it words and turn it into something you can see.</p></section>
    <section className="workspace">
      <div className="panel controls"><div className="section-head"><span className="step">01</span><div><h2>Your idea</h2><p>Describe the world in your head.</p></div></div>
        <label className="field-label" htmlFor="studio-password">PRIVATE STUDIO PASSWORD</label><input id="studio-password" type="password" autoComplete="off" value={studioPassword} onChange={(e) => setStudioPassword(e.target.value)} placeholder="Enter your private studio password" style={{width:"100%",padding:"14px",marginBottom:"18px",borderRadius:"10px",border:"1px solid #777",background:"transparent",color:"inherit"}} />
        <label className="field-label" htmlFor="prompt">IMAGE PROMPT</label><textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1800} placeholder="A tiny glass greenhouse floating above a lavender ocean at dusk, soft glowing stars, intricate details..." />
        <div className="char-count">{prompt.length}/1800</div>
        <label className="field-label">ART DIRECTION</label><div className="style-grid">{styles.map((s) => <button type="button" key={s} className={style === s ? "style-chip selected" : "style-chip"} onClick={() => setStyle(s)}>{s}</button>)}</div>
        <label className="field-label">CANVAS SHAPE</label><div className="ratio-grid">{ratios.map((r) => <button type="button" key={r.value} onClick={() => setSize(r.value)} className={size === r.value ? "ratio selected" : "ratio"}><span className={"ratio-icon " + (r.value === "1024x1536" ? "portrait" : r.value === "1536x1024" ? "landscape" : "")} /><span>{r.label}</span></button>)}</div>
        <button className="generate" onClick={generate} disabled={busy}>{busy ? <><span className="spinner" /> Creating your image…</> : <>✦ &nbsp; Generate artwork <span>↗</span></>}</button>
        <p className="privacy-note">Your API key stays on the server. Generation may incur API charges.</p>
        {error && <div className="error" role="alert">{error}</div>}
        <div className="upload-note"><button className="text-button" onClick={() => fileRef.current?.click()}>＋ Add a reference image</button><span>{fileName || "Visual reference upload UI (editing setup coming next)"}</span><input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} /></div>
      </div>
      <div className="panel preview-panel"><div className="preview-head"><div><span className="step">02</span><h2>Your canvas</h2></div><span className="live-label"><i /> LIVE PREVIEW</span></div>
        <div className={"canvas " + (artwork ? "has-art" : "")}>{busy ? <div className="loading-state"><div className="orb"><span>✳</span></div><h3>Mixing colors and possibilities</h3><p>This can take a little while.</p><div className="loading-line"><span /></div></div> : artwork ? <img src={artwork.url} alt={artwork.prompt} /> : <div className="empty-state"><div className="abstract-art"><span className="shape shape-one" /><span className="shape shape-two" /><span className="shape shape-three" /><span className="shape shape-four" /><span className="shape-center">✳</span></div><h3>Your next idea starts here.</h3><p>Your generated image will appear in this space.</p></div>}</div>
        {artwork && <div className="art-actions"><div><strong>Freshly imagined</strong><p>{artwork.prompt}</p></div><a className="download" href={artwork.url} download="fibo-artwork.png">↓ Save image</a></div>}
        <div className="canvas-footer"><span>✦ Made from imagination</span><span>{artwork ? "Image ready" : "Waiting for your first creation"}</span></div>
      </div>
    </section>
    <section className="gallery"><div className="gallery-head"><div><span className="step">03</span><h2>Recent creations</h2><p>Your session gallery. Images are kept in this browser session only.</p></div><span className="count">{history.length.toString().padStart(2, "0")} / 12</span></div>{history.length ? <div className="gallery-grid">{history.map((item, i) => <button className="gallery-item" key={item.createdAt + i} onClick={() => setArtwork(item)}><img src={item.url} alt={item.prompt} /><span>{item.prompt}</span></button>)}</div> : <div className="gallery-empty">Your gallery is waiting for its first spark <span>✧</span></div>}</section>
    <footer><a className="brand footer-brand" href="#"><span className="brand-mark">f</span><span>fibo studio<small>MAKE SOMETHING THAT FEELS LIKE YOU.</small></span></a><span>Creative tools for curious minds.</span></footer>
  </main>;
}
