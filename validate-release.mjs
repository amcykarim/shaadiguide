import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html')).sort();
const errors=[];
const mainJs=fs.readFileSync(path.join(root,'assets/js/main.js'),'utf8')+fs.readFileSync(path.join(root,'assets/js/city-search-data.js'),'utf8')+fs.readFileSync(path.join(root,'assets/js/planning-question-search-data.js'),'utf8');
const indexed=new Set([...mainJs.matchAll(/["']?url["']?\s*:\s*["']([^"']+\.html)["']/g)].map(m=>m[1]));
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const expected=file==='index.html'?'https://shaadiguide.in/':`https://shaadiguide.in/${file}`;
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 if(canonical!==expected)errors.push(`${file}: incorrect canonical`);
 for(const meta of ['og:type','og:title','og:description','og:url'])if(!html.includes(`<meta property="${meta}"`))errors.push(`${file}: missing ${meta}`);
 for(const meta of ['twitter:card','twitter:title','twitter:description'])if(!html.includes(`<meta name="${meta}"`))errors.push(`${file}: missing ${meta}`);
 if(/<meta name="robots"[^>]*noindex/i.test(html))errors.push(`${file}: unexpected noindex`);
 if(/(?:file:\/\/|[A-Z]:\\|localhost|127\.0\.0\.1)/i.test(html))errors.push(`${file}: local machine reference`);
 if(/[\uFFFD]/u.test(html)||/lorem ipsum|insert text here|expert reviewed|star rating/i.test(html))errors.push(`${file}: placeholder, encoding, or unsupported-review text`);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);if(dup.length)errors.push(`${file}: duplicate IDs ${[...new Set(dup)].join(', ')}`);
 for(const fragment of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(fragment[1]))errors.push(`${file}: missing fragment #${fragment[1]}`);
 for(const image of html.matchAll(/<img\b[^>]*>/g)){if(!/\salt="[^"]*"/.test(image[0]))errors.push(`${file}: image missing alt`);if(!/\swidth="\d+"/.test(image[0])||!/\sheight="\d+"/.test(image[0]))errors.push(`${file}: image missing dimensions`)}
 for(const script of html.matchAll(/<script\b(?![^>]*type="application\/ld\+json")[^>]*src="[^"]+"[^>]*>/g))if(!/\sdefer(?:\s|>)/.test(script[0])&&!/\stype="module"/.test(script[0]))errors.push(`${file}: non-deferred script`);
 const scriptSources=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)].map(m=>m[1]);if(new Set(scriptSources).size!==scriptSources.length)errors.push(`${file}: duplicate script include`);
 const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map(m=>m[1]);if(new Set(styles).size!==styles.length)errors.push(`${file}: duplicate stylesheet include`);
 for(const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const data=JSON.parse(block[1]);const type=data['@type'];if(['LocalBusiness','LegalService','Review','AggregateRating'].includes(type))errors.push(`${file}: unsupported schema ${type}`);if(type==='FAQPage'&&!/class="[^"]*faq/.test(html))errors.push(`${file}: FAQ schema without visible FAQ`)}catch{errors.push(`${file}: malformed JSON-LD`)}}
 if(!['index.html','404.html'].includes(file)&&!indexed.has(file))errors.push(`${file}: missing search index entry`);
 if(file!==file.toLowerCase()||/\s/.test(file))errors.push(`${file}: unsafe filename`);
}
const home=fs.readFileSync('index.html','utf8');
for(const token of ['role="combobox"','role="listbox"','aria-expanded="false"'])if(!home.includes(token))errors.push(`homepage search missing ${token}`);
const hero=home.match(/<img[^>]+hero-wedding\.webp[^>]*>/)?.[0]||'';for(const token of ['width="864"','height="582"','loading="eager"','decoding="async"'])if(!hero.includes(token))errors.push(`hero image missing ${token}`);if(hero.includes('loading="lazy"'))errors.push('hero image is lazy-loaded');
if(!mainJs.includes("input?.setAttribute('aria-expanded','false')"))errors.push('search Escape does not restore aria-expanded');
const sitemap=fs.readFileSync('sitemap.xml','utf8');const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);if(new Set(urls).size!==urls.length)errors.push('duplicate sitemap URLs');if(urls.length!==files.length-1)errors.push(`sitemap count ${urls.length} != ${files.length-1}`);if(urls.some(u=>!u.startsWith('https://shaadiguide.in/')))errors.push('sitemap has wrong domain');if(sitemap.includes('404.html'))errors.push('404 is in sitemap');
const robots=fs.readFileSync('robots.txt','utf8');if(!robots.includes('Sitemap: https://shaadiguide.in/sitemap.xml')||/Disallow:\s*\//.test(robots))errors.push('robots.txt configuration invalid');
if(fs.readFileSync('CNAME','utf8').trim()!=='shaadiguide.in')errors.push('CNAME invalid');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: release checks for metadata, JSON-LD, search coverage, images, IDs, sitemap, robots, CNAME and GitHub Pages paths across ${files.length} HTML files.`);
