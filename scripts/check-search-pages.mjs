import fs from 'node:fs';import assert from 'node:assert/strict';import {pages} from './search-pages.mjs';
const titles=new Set(),descriptions=new Set();
for(const [route,title,desc] of pages){const h=fs.readFileSync('dist/'+route.slice(1)+'index.html','utf8');assert.equal((h.match(/<title>/g)||[]).length,1,route);assert.equal((h.match(/name="description"/g)||[]).length,1,route);assert.equal((h.match(/rel="canonical"/g)||[]).length,1,route);assert(h.includes('href="https://randomcandyland.com'+route+'"'),route);assert(!/name="robots"[^>]*noindex/.test(h),route);assert(!titles.has(title));assert(!descriptions.has(desc));titles.add(title);descriptions.add(desc);}
const home=fs.readFileSync('dist/index.html','utf8');assert(home.includes('<h1>'));const structured=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(structured['@graph'][0]['@type'],'WebSite');assert.equal(structured['@graph'][2].itemListElement.length,23);
assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,pages.length);
assert(fs.readFileSync('dist/robots.txt','utf8').includes('Sitemap: https://randomcandyland.com/sitemap.xml'));
console.log('PASS: 27 unique titles/descriptions/canonicals, initial H1, valid JSON-LD, sitemap and robots.');
