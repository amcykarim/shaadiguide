import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
const publicFiles=htmlFiles.filter(file=>file!=='404.html');
const errors=[];const warnings=[];
const titles=new Map(),descriptions=new Map(),canonicals=new Map();
const incoming=new Map(htmlFiles.map(file=>[file,0]));
const outgoing=new Map();
const schemas=new Map();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const stripHash=value=>value.split('#')[0].split('?')[0];
const localPageLinks=(html)=>[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]).filter(value=>!value.startsWith('#')&&!/^(?:https?:|mailto:|tel:)/i.test(value)).map(stripHash).filter(value=>value.endsWith('.html'));

for(const file of htmlFiles){
 const html=read(file);
 const title=html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.trim();
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 const expectedCanonical=file==='index.html'?'https://shaadiguide.in/':`https://shaadiguide.in/${file}`;
 if(!title)errors.push(`${file}: missing title`);else if(titles.has(title))errors.push(`${file}: duplicate title with ${titles.get(title)}`);else titles.set(title,file);
 if(!description)errors.push(`${file}: missing meta description`);else if(descriptions.has(description))errors.push(`${file}: duplicate description with ${descriptions.get(description)}`);else descriptions.set(description,file);
 if(canonical!==expectedCanonical)errors.push(`${file}: canonical is not ${expectedCanonical}`);else if(canonicals.has(canonical))errors.push(`${file}: duplicate canonical with ${canonicals.get(canonical)}`);else canonicals.set(canonical,file);
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)errors.push(`${file}: expected one H1`);
 if(!/<meta name="viewport"/.test(html))errors.push(`${file}: missing viewport`);
 for(const property of ['og:type','og:title','og:description','og:url'])if(!html.includes(`property="${property}"`))errors.push(`${file}: missing ${property}`);
 if(!html.includes('class="skip-link"'))errors.push(`${file}: missing skip link`);
 if(!html.includes('<main id="main">'))errors.push(`${file}: missing main landmark`);
 if(!html.includes('aria-controls="site-nav"')||!html.includes('aria-expanded="false"'))errors.push(`${file}: mobile navigation ARIA missing`);
 if(!html.includes('<footer>'))errors.push(`${file}: missing footer`);
 for(const link of ['index.html','wedding-planning.html','hindu-wedding-ceremonies.html','regional-weddings.html','wedding-tools.html','invitation-wording.html','about.html','contact.html','privacy.html','terms.html','disclaimer.html','editorial-policy.html'])if(!html.includes(`href="${link}"`))errors.push(`${file}: global link missing ${link}`);
 if(!['index.html','404.html'].includes(file)&&!html.includes('class="breadcrumbs"'))errors.push(`${file}: breadcrumbs missing`);
 if(/(?:file:\/\/|localhost|127\.0\.0\.1|[A-Za-z]:\\)/i.test(html))errors.push(`${file}: local-machine reference`);
 if(/(?:href|src)="\/(?!\/)/.test(html))errors.push(`${file}: root-relative path may fail under project GitHub Pages`);
 if(/href="(?:"|#")|src=""/.test(html))errors.push(`${file}: empty link or asset reference`);
 if(/\uFFFD|lorem ipsum|insert text here/i.test(html))errors.push(`${file}: placeholder or encoding text`);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
 for(const id of new Set(ids.filter((value,index)=>ids.indexOf(value)!==index)))errors.push(`${file}: duplicate ID ${id}`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(/^(?:https?:|mailto:|tel:|#)/i.test(value))continue;const target=stripHash(value);if(target&&!fs.existsSync(path.join(root,target)))errors.push(`${file}: missing local target ${value}`);
  if(value.includes('#')&&target.endsWith('.html')&&fs.existsSync(path.join(root,target))){const fragment=value.split('#')[1];if(fragment&&!read(target).includes(`id="${fragment}"`))errors.push(`${file}: missing fragment ${value}`)}
 }
 for(const image of html.matchAll(/<img\b[^>]*>/g)){const tag=image[0];if(!/\salt="[^"]*"/.test(tag))errors.push(`${file}: image missing alt`);if(!/\swidth="\d+"/.test(tag)||!/\sheight="\d+"/.test(tag))errors.push(`${file}: image dimensions missing`);if(!/\sdecoding="async"/.test(tag))warnings.push(`${file}: image could use decoding=async`);if(!tag.includes('hero-wedding.webp')&&!/\sloading="lazy"/.test(tag))warnings.push(`${file}: below-fold image could use lazy loading`)}
 for(const input of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/g)){const tag=input[0];if(/type="hidden"/.test(tag))continue;const id=tag.match(/\sid="([^"]+)"/)?.[1];const position=input.index??0;const before=html.slice(0,position);const wrapped=before.lastIndexOf('<label')>before.lastIndexOf('</label>');if(!(id&&html.includes(`for="${id}"`))&&!wrapped&&!/aria-label(?:ledby)?="[^"]+"/.test(tag))errors.push(`${file}: form control lacks an accessible label: ${tag.slice(0,90)}`)}
 const pageSchema=[];for(const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const data=JSON.parse(block[1]);pageSchema.push(data['@type']||'Unknown');if(data['@type']==='FAQPage'&&!html.includes('class="faq"'))errors.push(`${file}: FAQ schema without visible FAQ`);if(['LocalBusiness','Review','AggregateRating','LegalService'].includes(data['@type']))errors.push(`${file}: unsupported schema ${data['@type']}`)}catch{errors.push(`${file}: invalid JSON-LD`)}}
 schemas.set(file,pageSchema);
 const links=[...new Set(localPageLinks(html).filter(link=>htmlFiles.includes(link)))];outgoing.set(file,links);for(const link of links)incoming.set(link,(incoming.get(link)||0)+1);
}

const sitemap=read('sitemap.xml');const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
if(sitemapUrls.length!==publicFiles.length)errors.push(`sitemap has ${sitemapUrls.length} URLs; expected ${publicFiles.length}`);
if(new Set(sitemapUrls).size!==sitemapUrls.length)errors.push('sitemap contains duplicate URLs');
for(const file of publicFiles){const url=file==='index.html'?'https://shaadiguide.in/':`https://shaadiguide.in/${file}`;if(!sitemapUrls.includes(url))errors.push(`sitemap missing ${file}`)}
if(sitemap.includes('404.html'))errors.push('404 page must not be in sitemap');
const robots=read('robots.txt');if(robots.trim()!==`User-agent: *\nAllow: /\n\nSitemap: https://shaadiguide.in/sitemap.xml`)errors.push('robots.txt differs from the expected public configuration');
if(read('CNAME').trim()!=='shaadiguide.in')errors.push('CNAME must remain shaadiguide.in');

const searchSource=['assets/js/main.js','assets/js/city-search-data.js','assets/js/planning-question-search-data.js'].map(read).join('\n');
const indexed=new Set([...searchSource.matchAll(/["']?url["']?\s*:\s*["']([^"']+\.html)["']/g)].map(match=>match[1]));
for(const file of publicFiles)if(file!=='index.html'&&!indexed.has(file))errors.push(`${file}: missing from local search index`);

const queue=[['index.html',0]],visited=new Map([['index.html',0]]);while(queue.length){const [file,depth]=queue.shift();for(const link of outgoing.get(file)||[])if(!visited.has(link)){visited.set(link,depth+1);queue.push([link,depth+1])}}
for(const file of publicFiles)if(!visited.has(file))errors.push(`${file}: orphaned from homepage crawl path`);
const maxDepth=Math.max(...[...visited.values()]);if(maxDepth>4)warnings.push(`maximum homepage click depth is ${maxDepth}`);
for(const file of publicFiles.filter(file=>file!=='index.html'))if((incoming.get(file)||0)===0)errors.push(`${file}: no incoming internal links`);

const css=read('assets/css/style.css');for(const token of [':focus-visible','prefers-reduced-motion','@media print'])if(!css.includes(token))errors.push(`shared CSS missing ${token}`);
const main=read('assets/js/main.js');for(const token of ["event.key==='Escape'","setAttribute('aria-expanded'","data-year"])if(!main.includes(token))errors.push(`main navigation/search behavior missing ${token}`);
const hero=read('index.html').match(/<img[^>]*hero-wedding\.webp[^>]*>/)?.[0]||'';for(const token of ['loading="eager"','decoding="async"','width="864"','height="582"'])if(!hero.includes(token))errors.push(`homepage hero missing ${token}`);

const collectionPages=[...schemas].filter(([,types])=>types.includes('CollectionPage')).map(([file])=>file);
const articlePages=[...schemas].filter(([,types])=>types.includes('Article')).map(([file])=>file);
const calculators=publicFiles.filter(file=>file.endsWith('-calculator.html')||file==='accommodation-planner.html');
const cityPages=publicFiles.filter(file=>/-wedding-planning-guide\.html$/.test(file));
const regionalPages=publicFiles.filter(file=>/-wedding-traditions(?:-guide)?\.html$/.test(file));
const vendorGuidePages=publicFiles.filter(file=>schemas.get(file)?.includes('Article')&&(file==='wedding-planner-guide.html'||file==='mehndi-artist-guide.html'||/^(?:wedding-(?:venue|caterer|photographer|videographer|decorator|makeup-artist|entertainment|band-dj|transport|florist|cake-dessert|planner|priest-pandit|invitation-vendor|gifts)|bridal-(?:jewellery|outfit)|groom-(?:outfit|styling)|live-wedding-music|luxury-wedding-car|honeymoon-planning)-guide\.html$/.test(file)));
const adless=publicFiles.filter(file=>!read(file).includes('aria-label="Advertisement"'));if(adless.length)warnings.push(`${adless.length} public pages intentionally have no advertisement placeholder: ${adless.join(', ')}`);

const report=`# Phase 16 Production Release Report\n\nGenerated: 21 July 2026  \nStatus: ${errors.length?'FAILED':'READY FOR GITHUB UPLOAD'}\n\n## Inventory\n\n- HTML files: ${htmlFiles.length}\n- Public canonical pages: ${publicFiles.length}\n- Collection/hub pages: ${collectionPages.length}\n- Article/guide pages: ${articlePages.length}\n- Calculators and accommodation planner: ${calculators.length}\n- City planning guides: ${cityPages.length}\n- Regional/state tradition guides: ${regionalPages.length}\n- Vendor/service education guides: ${vendorGuidePages.length}\n- Sitemap URLs: ${sitemapUrls.length}\n- Maximum homepage click depth: ${maxDepth}\n\n## Release checks\n\n- Unique titles, descriptions and canonicals\n- One H1, viewport, Open Graph and structured data\n- Local links, fragments, assets and relative GitHub Pages paths\n- Breadcrumbs, global navigation, footer and skip links\n- Form labels, image alt text and intrinsic image dimensions\n- Search coverage, sitemap, robots.txt and CNAME\n- Homepage crawl reachability and incoming internal links\n- Focus, reduced-motion, print and keyboard behavior signals\n- Advertisement placeholder coverage and trust-page links\n\n## Errors\n\n${errors.length?errors.map(item=>`- ${item}`).join('\n'):'None.'}\n\n## Warnings / manual review\n\n${warnings.length?warnings.map(item=>`- ${item}`).join('\n'):'Automated checks found no warnings. Manual cross-browser and assistive-technology review is still recommended before publication.'}\n`;
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports','phase16-release.md'),report,'utf8');
if(errors.length){console.error(`Phase 16 FAILED with ${errors.length} issue(s). See reports/phase16-release.md.`);for(const error of errors.slice(0,40))console.error(`- ${error}`);process.exitCode=1}else console.log(`Phase 16 PASS: ${htmlFiles.length} HTML files, ${publicFiles.length} public pages, ${articlePages.length} guides, ${collectionPages.length} hubs, ${sitemapUrls.length} sitemap URLs; maximum click depth ${maxDepth}.`);
