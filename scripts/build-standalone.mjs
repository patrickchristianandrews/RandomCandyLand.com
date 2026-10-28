import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const assetsDir = path.resolve(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('dist or dist/assets not found.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  console.error('Could not find css or js bundle in dist/assets');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>Random Candy Land | A World of Play, Music & Discovery</title>
    <meta name="description" content="Explore Random Candy Land: a colorful universe of playful experiences, music visualizations, creative surprises, and curiosity." />
    <meta property="og:title" content="Random Candy Land | A World of Play, Music & Discovery" />
    <meta property="og:description" content="Explore Random Candy Land: a colorful universe of playful experiences, music visualizations, creative surprises, and curiosity." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- PWA & Mobile Home Screen Links -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#d4af37" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Random Candy Land" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="icon" type="image/png" href="/favicon.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Cinzel:wght@700;900&family=Fredoka:wght@600;700;800;900&family=Permanent+Marker&family=Plus+Jakarta+Sans:wght@500;700;800&family=VT323&display=swap" rel="stylesheet">
    <style>
${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>
`;

// Save to dist/
fs.writeFileSync(path.join(distDir, 'index.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, 'standalone.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, '404.html'), standaloneHtml, 'utf-8');

const trumpDir = path.join(distDir, 'trump');
if (!fs.existsSync(trumpDir)) fs.mkdirSync(trumpDir, { recursive: true });
fs.writeFileSync(path.join(trumpDir, 'index.html'), standaloneHtml, 'utf-8');

// Copy to root index.html, 404.html, and trump/index.html so GitHub Pages serves the production bundle directly!
fs.writeFileSync(path.resolve(process.cwd(), 'index.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.resolve(process.cwd(), '404.html'), standaloneHtml, 'utf-8');
const rootTrumpDir = path.resolve(process.cwd(), 'trump');
if (!fs.existsSync(rootTrumpDir)) fs.mkdirSync(rootTrumpDir, { recursive: true });
fs.writeFileSync(path.join(rootTrumpDir, 'index.html'), standaloneHtml, 'utf-8');

// Also save to public/
fs.writeFileSync(path.resolve(process.cwd(), 'public/standalone.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.resolve(process.cwd(), 'public/index.html'), standaloneHtml, 'utf-8');

console.log('Successfully built and deployed standalone bundle to root index.html, 404.html, and trump/index.html!');
