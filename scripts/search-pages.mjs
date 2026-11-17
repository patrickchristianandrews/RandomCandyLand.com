import fs from 'node:fs';
import path from 'node:path';
export const pages = [
  [
    "/",
    "Random Candy Land | Free Browser Games & Interactive Play",
    "Find your next browser game at Random Candy Land: quick memory challenges, multiplayer rounds, virtual pets and interactive stories, with creative tools to explore.",
    "Free browser games and interactive play",
    "Pick a quick memory challenge, play with a friend, care for a virtual pet, or settle into an interactive story. Explore AI tools and learning activities when you want to try something different."
  ],
  [
    "/trump/",
    "Trumpagotchi OG | Talking Virtual Pet Game",
    "Care for Trumpagotchi, play mini-games and hear recorded reactions in this satirical virtual pet game. Check in on your pet and keep his needs balanced.",
    "Trumpagotchi OG: a talking virtual pet",
    "Feed and care for your cartoon companion, balance his needs, and play mini-games between check-ins. Recorded reactions are part of this fictional political parody."
  ],
  [
    "/candy-match/",
    "Candy Match | Candy Matching Pairs Memory Game",
    "Flip candy cards, remember their positions and find matching pairs. Play Candy Match in your browser and use hints when you need a peek.",
    "Find matching candy pairs",
    "Flip cards to find two identical candies and remember where each picture appeared. Use a hint for a peek at a pair; the cards shuffle for each new game."
  ],
  [
    "/candy-simon/",
    "Candy Simon Says | Musical Pattern Memory Game",
    "Watch the musical gummies light up and repeat their sequence. Play Candy Simon Says with taps or keyboard controls and beat your saved high score.",
    "Repeat the musical candy pattern",
    "Watch and listen to the four gummies, then repeat their sequence in order. Tap the colors or use keys 1–4; replay the pattern once per level when you need help."
  ],
  [
    "/goo-rush/",
    "Goo Rush | Fast Candy Search & Multiplayer Arcade Game",
    "Spot the target candy, build combos and race the clock in Goo Rush. Play solo, challenge a friend or compete in a same-screen candy-hunting duel.",
    "Find the candy before time runs out",
    "Match the target candy to the grid as quickly as you can. Correct picks build multipliers, while wrong picks cost points. Choose solo practice, a duel or a shared friend challenge."
  ],
  [
    "/candy-casino/",
    "Candy Land Poker | Five-Card Draw with Friends",
    "Play five-card draw against Candybot or invite a friend online. Exchange cards, compare poker hands and play five rounds using virtual chips only.",
    "Learn five-card draw by playing",
    "Receive five cards and exchange up to three before the showdown. Play Candybot or share a room link with a friend, then compare hands across five rounds. Chips have no cash value."
  ],
  [
    "/the-corridors/",
    "The Corridors | Political Decisions & Consequences Game",
    "Make policy decisions in a fictional city and explore their effects over time. Play The Corridors to weigh political choices, tradeoffs and consequences.",
    "Make a policy choice and follow its consequences",
    "Choose a response to a fictional political scenario, then compare its immediate effects with outcomes six months and two years later. Try the next decision to see how your choices interact."
  ],
  [
    "/the-docket/",
    "The Docket | Courtroom Investigation Story Game",
    "Investigate fictional legal cases, examine evidence and question witnesses in The Docket. Explore verdicts, appeals and due process through interactive play.",
    "Build a case from the evidence",
    "Review evidence, question witnesses and decide what supports your case. Follow fictional investigations through verdicts and appeals while exploring due process and the limits of each clue."
  ],
  [
    "/keys-to-life/",
    "The Keys to Life | Seven-Realm Puzzle Adventure",
    "Explore seven magical realms, solve interactive puzzles and collect keys in The Keys to Life. Follow daily miniature quests and keep a personal journey journal.",
    "Solve puzzles across seven magical realms",
    "Each realm offers its own story, hands-on challenge and practical reflection. Collect seven keys, try a daily miniature quest and revisit your discoveries in the Lantern Journal."
  ],
  [
    "/trumpagotchi-fm1/",
    "FM-1 Trumpagotchi | Pixel Art Virtual Pet",
    "Feed, praise, clean and rest your pixel-art Trumpagotchi. Balance food, mood, energy and cleanliness in this browser-based cartoon pet game.",
    "Care for a pixel-art Trumpagotchi",
    "Watch Food, Mood, Energy and Cleanliness, then choose the care action your pet needs. Feeding, praise, cleaning and rest each affect a different part of his wellbeing."
  ],
  [
    "/studio/",
    "Random AI | Local AI Chat & Model Explorer",
    "Explore local AI models for compatible devices, start a browser chat and compare model options. Find writing, coding, image and voice tools in Random AI.",
    "Explore local AI models and start a chat",
    "Choose a model that fits your device, download it and try a writing, coding or brainstorming prompt. Local chat runs on compatible hardware; other tools may use external services."
  ],
  [
    "/image-studio/",
    "Image Studio | AI Image Generator & Art Maker",
    "Create AI-generated images in Random Candy Land Image Studio. Describe your idea, choose an image model and aspect ratio, and download or save your artwork.",
    "Create AI images in Image Studio",
    "Turn a written idea into AI-made artwork. Pick an image shape, choose a model, and generate designs using supported third-party services. Download finished creations or save favorites in this browser."
  ],
  [
    "/ai-academy/",
    "AI Academy | Hands-On Prompt Writing Lessons",
    "Learn to write useful AI prompts through short lessons, quizzes and hands-on challenges. Practice with Prompt Coach, Prompt Showdown and a live Prompt Builder.",
    "Learn AI prompting through practice",
    "Choose a short lesson, try its challenge and refine a prompt you can use in Random AI. Practice writing, research, images and code with guided exercises and a live Prompt Builder."
  ],
  [
    "/after-dark/",
    "Unwrapped | Self-Discovery & Relationship Quizzes",
    "Explore psychology, communication and adult interests with Unwrapped quizzes. Create personal reports and choose what to share in partner comparisons. Ages 18+.",
    "Understand yourself and share what matters",
    "Take the psychology quiz, the adult interests quiz or both. Use your answers to explore personal themes, create a report and choose specific information to share with a partner."
  ],
  [
    "/after-dark/psychology-lab/",
    "Clue Compass | Habits, Curiosity & Psychology Quiz",
    "Explore everyday habits, comfort and curiosity with the Clue Compass questionnaire. Read possible interpretations and research-aware explanations for adults.",
    "Explore habits without jumping to conclusions",
    "Start with everyday-life questions and explore themes in comfort, sensation and curiosity. Read possible interpretations alongside their limits; a daily habit does not establish an intimate preference."
  ],
  [
    "/after-dark/report-samples/",
    "Unwrapped Report Samples | Personal & Partner File Guide",
    "Preview fictional Unwrapped personal and partner reports. Learn which PDF or JSON file to download, share or import for a consent-selected comparison.",
    "Preview reports and choose the right file",
    "See fictional examples before completing your quizzes. Use a PDF for reading, a private JSON backup for restoring answers and a consent-selected JSON file for partner comparisons."
  ],
  [
    "/curiosity/",
    "The Wonder Index | Curious Ideas & Research Discovery",
    "Discover thought-provoking ideas, psychology research and surprising patterns in real data. Choose a short read, explore publications or test a correlation.",
    "Find an idea worth exploring",
    "Browse short explanations of surprising ideas, follow recent research records or compare real statistical series. Each section offers its own route from curiosity to the underlying sources."
  ],
  [
    "/curiosity/ideas/",
    "Thinking Traps & Surprising Ideas | The Wonder Index",
    "Browse short explanations of thinking traps and surprising ideas, with everyday examples, practical exercises and sources for further reading.",
    "Explore thinking traps with everyday examples",
    "Choose an idea by theme or pick one at random. Each short read explains the concept, shows an everyday example and offers something to try, plus a source for further reading."
  ],
  [
    "/curiosity/research/",
    "Psychology Research Feed | The Wonder Index",
    "Browse recently indexed psychology and human behavior publications. Follow OpenAlex source records to investigate the research behind each title.",
    "Follow psychology research to its source",
    "Browse recently indexed publication records on psychology and human behavior. Open the linked source to check the publication date, methods and findings before drawing a conclusion."
  ],
  [
    "/curiosity/correlations/",
    "Spurious Correlation Generator | Compare Real Data",
    "Generate surprising correlations from World Bank indicators. Compare time series, inspect the source data and explore why correlation does not prove causation.",
    "Compare real data and question the connection",
    "Select two indicators or generate a pairing, then compare their values across shared years. Inspect the sources and first differences to explore whether a striking pattern has a meaningful explanation."
  ],
  [
    "/osint-academy/",
    "TRACE | Public Records & OSINT Sources Directory",
    "Find public records, research sources and public camera networks with TRACE. Compare source coverage and keep research notes in your browser.",
    "Trace Public Sources Dictionary: find and evaluate records",
    "Browse source categories, check what each source can establish and follow links to the original records. Use the case notebook to organize findings and record the limits of your evidence."
  ],
  [
    "/executive-directory/",
    "Executive Customer Service Contacts | Escalation Directory",
    "Find customer escalation teams, executive business contact details and support numbers. Search the directory to route unresolved service issues to the right team.",
    "Find a customer service escalation contact",
    "Search for a company and review its available support or executive customer service contacts. Choose the route that fits your unresolved issue and include a clear account of your previous support attempts."
  ],
  [
    "/amazon-deal-hunter/",
    "Amazon Discount Finder | Amazon Deal Hunter",
    "Search Amazon by keyword, category, price and discount percentage. Open matching listings and compare the current price, seller and shipping before buying.",
    "Search Amazon by discount percentage",
    "Enter a product or brand, choose a department and set a price or discount range. Open the results on Amazon and verify the checkout price; Amazon may ignore its discount filter."
  ],
  [
    "/black-friday/",
    "Black Friday & Cyber Monday 2026 | Hot Deal Picks",
    "Browse recently reported Black Friday and Cyber Monday 2026 deals. Compare featured offers, open the full deal catalog and find retailer ad previews.",
    "Browse reported holiday deal highlights",
    "Start with featured offers, then open the full catalog for category filters and upcoming promotions. Check the retailer's current price, seller, delivery and promotion dates before purchasing."
  ],
  [
    "/black-friday/all/",
    "Black Friday 2026 Deal Catalog | Search by Category",
    "Search the Black Friday and Cyber Monday 2026 deal catalog by product or category. Filter reported offers, save favorites and compare upcoming sales.",
    "Search the complete holiday deal catalog",
    "Filter cataloged offers by product and category, save favorites and compare upcoming sale windows. Reported deal prices can change; follow the source and retailer links for current terms."
  ],
  [
    "/black-friday/ad-scans/",
    "Black Friday 2026 Ad Scans & Retailer Circulars",
    "Find Black Friday 2026 ad previews, retailer circulars and official sale pages. Search by store and follow publisher links to check offers and dates.",
    "Find a retailer's holiday ad or sale preview",
    "Search by store and distinguish published ad scans from weekly circulars and official sale pages. Open the original source to inspect offer dates, exclusions and availability."
  ],
  [
    "/liquid-wave/",
    "Liquid Wave | Browser Music Sequencer & Sound Lab",
    "Generate songs, edit sequencer steps and shape sounds in Liquid Wave. Explore an animal band, instrument controls and a browser-based mixer.",
    "Generate a song and make it your own",
    "Create a pattern, edit individual sequencer steps and adjust the instruments in the Sound Lab and mixer. Tap an animal to hear or mute its channel while shaping the arrangement."
  ],
  [
    "/pocket-wave/",
    "Pocket Wave | Random Song Generator & Animal Band",
    "Generate a short song in your browser and play it with eight animated band members. Mute individual channels and explore simple FM-synthesized sounds.",
    "Generate music with an animated animal band",
    "Press Generate, then Play to hear a new arrangement. Each character represents a channel: tap to mute it or drag it around while drums, bass, chords and melody play together."
  ]
];
const origin = 'https://randomcandyland.com';
const esc = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function pageHtml(html, page) {
 const [route,title,description,heading,copy] = page;
 html = html.replace(/<title>[\s\S]*?<\/title>/gi,'')
 .replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|og:title|og:description|og:url|og:type|twitter:title|twitter:description)["'])[^>]*>/gi,'')
 .replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi,'');
 const metadata = '<title>'+esc(title)+'</title>\n<meta name="description" content="'+esc(description)+'">\n<link rel="canonical" href="'+origin+route+'">\n'
 + ['og:title','twitter:title'].map(key=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+esc(title)+'">').join('\n')
 + ['og:description','twitter:description'].map(key=>'<meta '+(key.startsWith('og:')?'property':'name')+'="'+key+'" content="'+esc(description)+'">').join('\n')
 + '<meta property="og:url" content="'+origin+route+'">\n<meta property="og:type" content="website">';
 html=html.replace(/<\/head>/i,metadata+'\n</head>');
 const intro='<section class="page-purpose" aria-label="About this activity" style="max-width:70rem;margin:1.5rem auto;padding:1rem 1.25rem;font:inherit;line-height:1.6"><h2>'+esc(heading)+'</h2><p>'+esc(copy)+'</p></section>';
 if(route==='/' || route==='/trump/') {
  const links=route==='/'?'<nav aria-label="Explore Random Candy Land">'+pages.filter(p=>!['/','/pocket-wave/','/keys-to-life/','/liquid-wave/'].includes(p[0])).map(p=>'<p><a href="'+p[0]+'">'+esc(p[1].split(' | ')[0])+'</a> — '+esc(p[2])+'</p>').join('')+'</nav>':'<p><a href="/">Explore more browser games</a></p>';
  html=html.replace('<div id="root"></div>','<div id="root"><main style="max-width:70rem;margin:auto;padding:2rem"><h1>'+esc(route==='/'?'Random Candy Land: '+heading:heading)+'</h1><p>'+esc(copy)+'</p>'+links+'</main></div>');
 } else {
  html=html.replace(/<\/body>/i,intro+'\n</body>');
 }
 if(route==='/') {
  html=html.replace('</head>','<meta name="google-site-verification" content="qHbBNcHhZjhCwu48qwoyqCFukbdb_pRQ5XKlPSaUk88"><meta name="msvalidate.01" content="DD983114301F86880BC7C58B5FB9357A">\n</head>');
  const graph={'@context':'https://schema.org','@graph':[
   {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Random Candy Land',description,inLanguage:'en'},
   {'@type':'CollectionPage','@id':origin+'/#webpage',url:origin+'/',name:title,description,isPartOf:{'@id':origin+'/#website'},mainEntity:{'@id':origin+'/#features'}},
   {'@type':'ItemList','@id':origin+'/#features',name:'Explore Random Candy Land',itemListElement:pages.filter(p=>!['/','/pocket-wave/','/keys-to-life/','/liquid-wave/'].includes(p[0])).map((p,i)=>({'@type':'ListItem',position:i+1,name:p[1].split(' | ')[0],url:origin+p[0]}))}
  ]};
  html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify(graph).replaceAll('<','\\u003c')+'</script>\n</head>');
 }
 return html;
}
export function publishSearchPages(distDir) {
 for(const page of pages) {
  const file=path.join(distDir,page[0].slice(1),'index.html');
  if(!fs.existsSync(file)) throw new Error('Missing indexable page: '+file);
  fs.writeFileSync(file,pageHtml(fs.readFileSync(file,'utf8'),page));
 }
 const aliases={'fm1-emu/index.html':'/trumpagotchi-fm1/','studio/stack-lab/index.html':'/studio/','studio/classic.html':'/studio/','black-friday/amazon-discount-finder/index.html':'/amazon-deal-hunter/'};
 for(const [file,route] of Object.entries(aliases)){
  const target=path.join(distDir,file);
  let html=fs.readFileSync(target,'utf8').replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi,'').replace(/<meta\b(?=[^>]*name=["']robots["'])[^>]*>/gi,'');
  html=html.replace('</head>','<meta name="robots" content="noindex,follow"><link rel="canonical" href="'+origin+route+'"></head>');
  fs.writeFileSync(target,html);
 }
 for(const file of ['404.html','studio/background-model-download.html']){
  const target=path.join(distDir,file);
  let html=fs.readFileSync(target,'utf8').replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi,'');
  if(!/name=["']robots["']/i.test(html)) html=html.replace('</head>','<meta name="robots" content="noindex,follow"></head>');
  fs.writeFileSync(target,html);
 }
 fs.writeFileSync(path.join(distDir,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n');
 fs.writeFileSync(path.join(distDir,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>'  <url><loc>'+origin+p[0]+'</loc></url>').join('\n')+'\n</urlset>\n');
}
