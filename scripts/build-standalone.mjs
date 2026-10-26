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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Random Candy Land - Trump Gotcha Virtual Digi-Pet</title>
    <meta name="description" content="Welcome to Random Candy Land (randomcandyland.com) – an eclectic place of confectionery wonder featuring the Trump Gotcha virtual digi-pet." />
    <meta property="og:title" content="Random Candy Land - Trump Gotcha Virtual Digi-Pet" />
    <meta property="og:description" content="Welcome to Random Candy Land (randomcandyland.com) – an eclectic place of confectionery wonder featuring the Trump Gotcha virtual digi-pet." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=VT323&display=swap" rel="stylesheet">
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

// Save to dist/index.html, dist/standalone.html, dist/404.html, dist/trump/index.html
fs.writeFileSync(path.join(distDir, 'index.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, 'standalone.html'), standaloneHtml, 'utf-8');
fs.writeFileSync(path.join(distDir, '404.html'), standaloneHtml, 'utf-8');

const trumpDir = path.join(distDir, 'trump');
if (!fs.existsSync(trumpDir)) fs.mkdirSync(trumpDir, { recursive: true });
fs.writeFileSync(path.join(trumpDir, 'index.html'), standaloneHtml, 'utf-8');

// Also save to public/
fs.writeFileSync(path.resolve(process.cwd(), 'public/standalone.html'), standaloneHtml, 'utf-8');

console.log('Successfully built pristine standalone HTML bundle with 100% inlined CSS and JS!');
