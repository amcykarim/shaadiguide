import fs from 'node:fs';
import path from 'node:path';
import './validate-release.mjs';
import './validate-phase10.mjs';
import './validate-phase11.mjs';
import './validate-phase12.mjs';
import './validate-phase13.mjs';
import './validate-phase14.mjs';
import './validate-phase15.mjs';
const root=process.cwd();
const files=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const errors=[];const titles=new Map(),descs=new Map();
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const title=html.match(/<title>(.*?)<\/title>/)?.[1];
 const desc=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 if(!title)errors.push(`${file}: missing title`); else if(titles.has(title))errors.push(`${file}: duplicate title with ${titles.get(title)}`); else titles.set(title,file);
 if(!desc)errors.push(`${file}: missing description`); else if(descs.has(desc))errors.push(`${file}: duplicate description with ${descs.get(desc)}`); else descs.set(desc,file);
 if(!canonical)errors.push(`${file}: missing canonical`);
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${file}: expected exactly one H1`);
 if(/<body class="[^"]*guide/.test(html)&&!/<main id="main"><section class="section(?:\s[^"]*)?">/.test(html))errors.push(`${file}: guide content is not inside the shared centred section wrapper`);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const u=match[1]; if(/^(https?:|mailto:|#)/.test(u))continue;
   const clean=u.split('#')[0].split('?')[0]; if(!clean)continue;
   if(!fs.existsSync(path.join(root,clean)))errors.push(`${file}: broken local reference ${u}`);
   const fragment=u.includes('#')?u.split('#')[1]:'';
   if(fragment&&clean.endsWith('.html')){const target=fs.readFileSync(path.join(root,clean),'utf8');if(!target.includes(`id="${fragment}"`))errors.push(`${file}: missing fragment target ${u}`)}
 }
 if(/lorem ipsum|href="#"|href=""|src=""|�|â†|â‚|Ã©/.test(html))errors.push(`${file}: placeholder, empty link or encoding problem found`);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const file of files.filter(f=>f!=='404.html')){const url=file==='index.html'?'https://shaadiguide.in/':`https://shaadiguide.in/${file}`;if(!sitemap.includes(`<loc>${url}</loc>`))errors.push(`sitemap missing ${file}`)}
for(const asset of ['assets/css/style.css','assets/js/main.js','assets/js/budget-calculator.js','robots.txt','CNAME'])if(!fs.existsSync(path.join(root,asset)))errors.push(`missing ${asset}`);
const calc=fs.readFileSync(path.join(root,'assets/js/budget-calculator.js'),'utf8');
for(const behavior of ['Intl.NumberFormat','form.addEventListener(\'reset\'','window.print()','guests*value(\'catering\')'])if(!calc.includes(behavior))errors.push(`calculator behavior missing: ${behavior}`);
if(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim()!=='shaadiguide.in')errors.push('CNAME is not shaadiguide.in');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const requirement of ['class="category-grid"','ceremony-mini-grid','12 months','Wedding week','catering-cost-calculator.html','cost-per-guest-calculator.html','traditional Hindu','WhatsApp','home-faq','aria-autocomplete="list"','assets/images/hero-wedding.webp','Culturally Respectful Guidance'])if(!home.includes(requirement))errors.push(`homepage premium feature missing: ${requirement}`);
if((home.match(/class="category-card"/g)||[]).length!==9)errors.push('homepage must contain nine category cards');
if((home.match(/<details>/g)||[]).length!==5)errors.push('homepage must contain five FAQs');
for(const footerLink of ['index.html','wedding-planning.html','hindu-wedding-ceremonies.html','regional-weddings.html','wedding-tools.html','wedding-budget-calculator.html','invitation-wording.html','about.html','contact.html','privacy.html','terms.html','disclaimer.html','editorial-policy.html'])if(!home.slice(home.indexOf('<footer>')).includes(`href="${footerLink}"`))errors.push(`footer missing ${footerLink}`);
const mainJs=fs.readFileSync(path.join(root,'assets/js/main.js'),'utf8');
for(const term of ['checklist','budget','haldi','mehndi','punjabi','gujarati','bengali','tamil','telugu','whatsapp invitation','privacy','contact'])if(!mainJs.toLowerCase().includes(term))errors.push(`search index missing ${term}`);
for(const behavior of ['ArrowDown','ArrowUp','aria-activedescendant','location.href=matches[0].url'])if(!mainJs.includes(behavior))errors.push(`search keyboard behavior missing ${behavior}`);
if(!fs.existsSync(path.join(root,'assets/images/hero-wedding.webp')))errors.push('missing premium hero WebP');
for(const ceremonyFile of ['haldi-ceremony.html','mehndi-ceremony.html','sangeet-ceremony.html','baraat-guide.html','jaimala-varmala-guide.html','saptapadi-guide.html','vidaai-guide.html']){
 const ceremony=fs.readFileSync(path.join(root,ceremonyFile),'utf8');
 for(const feature of ['guide-meta','quick-facts','article-toc','guide-note','related-grid','class="faq"','guide-cta','Advertisement','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!ceremony.includes(feature))errors.push(`${ceremonyFile}: missing ceremony-library feature ${feature}`);
}
const toolPages=['wedding-budget-calculator.html','catering-cost-calculator.html','cost-per-guest-calculator.html','venue-budget-calculator.html','decoration-budget-calculator.html','invitation-cost-calculator.html','jewellery-budget-calculator.html','accommodation-planner.html','transportation-cost-calculator.html','return-gift-budget-calculator.html'];
for(const toolFile of toolPages){
 const html=fs.readFileSync(path.join(root,toolFile),'utf8');
 for(const feature of ['data-calculator-app','tool-fields','data-breakdown','data-print','type="reset"','assets/js/calculators/shared-calculator.js','"@type":"WebApplication"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.includes(feature))errors.push(`${toolFile}: missing calculator feature ${feature}`);
 if([...html.matchAll(/<input[^>]+type="number"[^>]*>/g)].some(m=>!m[0].includes('min="0"')))errors.push(`${toolFile}: numeric input without negative-value prevention`);
}
const regionalPages=['punjabi-wedding-traditions.html','gujarati-wedding-traditions.html','bengali-wedding-traditions.html','marathi-wedding-traditions.html','tamil-wedding-traditions.html','telugu-wedding-traditions.html','kannada-wedding-traditions.html','kerala-hindu-wedding-traditions.html','rajasthani-wedding-traditions.html','sindhi-wedding-traditions.html','bihari-wedding-traditions.html','odia-wedding-traditions.html','assamese-wedding-traditions.html','kashmiri-pandit-wedding-traditions.html','himachali-wedding-traditions.html','haryanvi-wedding-traditions.html'];
for(const regionalFile of regionalPages){const html=fs.readFileSync(path.join(root,regionalFile),'utf8');for(const feature of ['regional-hero','guide-meta','article-toc','quick-facts','class="schedule"','Planning checklist','interregional','Common planning mistakes','regional-weddings.html','wedding-tools.html','Advertisement','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.toLowerCase().includes(feature.toLowerCase()))errors.push(`${regionalFile}: missing regional-guide feature ${feature}`)}
const regionalHub=fs.readFileSync(path.join(root,'regional-weddings.html'),'utf8');
for(const feature of ['data-region-search','data-region-filter="north"','data-region-filter="south"','data-region-filter="east"','data-region-filter="west"','data-region-filter="northeast"','assets/js/regional-filter.js','Compare planning priorities','Interregional'])if(!regionalHub.toLowerCase().includes(feature.toLowerCase()))errors.push(`regional hub missing ${feature}`);
const wordingPages=['hindu-wedding-invitation-wording.html','modern-indian-wedding-invitation-wording.html','whatsapp-wedding-invitation-messages.html','engagement-invitation-wording.html','haldi-invitation-wording.html','mehndi-invitation-wording.html','sangeet-invitation-wording.html','wedding-reception-invitation-wording.html','wedding-rsvp-wording.html','no-gifts-wedding-wording.html','wedding-postponement-wording.html','wedding-cancellation-wording.html','wedding-thank-you-messages.html','wedding-announcement-wording.html'];
for(const wordingFile of wordingPages){const html=fs.readFileSync(path.join(root,wordingFile),'utf8');for(const feature of ['wording-card','data-copy-wording','assets/js/invitations/copy-wording.js','invitation-wording-generator.html','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.includes(feature))errors.push(`${wordingFile}: missing wording feature ${feature}`)}
const checklistPages=['12-month-wedding-checklist.html','6-month-wedding-checklist.html','3-month-wedding-checklist.html','wedding-week-checklist.html','bride-wedding-checklist.html','groom-wedding-checklist.html','family-responsibility-checklist.html','wedding-day-emergency-kit.html','vendor-question-checklist.html','wedding-packing-checklist.html'];
for(const checklistFile of checklistPages){const html=fs.readFileSync(path.join(root,checklistFile),'utf8');for(const feature of ['data-checklist','type="checkbox"','data-progress','data-checklist-print','data-checklist-reset','assets/js/checklists/checklist-progress.js','"@type":"Article"','"@type":"BreadcrumbList"'])if(!html.includes(feature))errors.push(`${checklistFile}: missing checklist feature ${feature}`)}
const generator=fs.readFileSync(path.join(root,'invitation-wording-generator.html'),'utf8');for(const feature of ['data-invitation-generator','data-generator-output','data-copy-wording','data-generator-print','privacy-note','"@type":"WebApplication"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!generator.toLowerCase().includes(feature.toLowerCase()))errors.push(`invitation generator missing ${feature}`);
const vendorPages=['wedding-venue-guide.html','wedding-caterer-guide.html','wedding-photographer-guide.html','wedding-videographer-guide.html','wedding-decorator-guide.html','wedding-makeup-artist-guide.html','mehndi-artist-guide.html','wedding-entertainment-guide.html','wedding-band-dj-guide.html','wedding-transport-guide.html','wedding-florist-guide.html','bridal-jewellery-guide.html','bridal-outfit-guide.html','groom-outfit-guide.html','wedding-cake-dessert-guide.html','wedding-planner-guide.html'];
for(const vendorFile of vendorPages){const html=fs.readFileSync(path.join(root,vendorFile),'utf8');for(const feature of ['guide-meta','quick-facts','article-toc','What this vendor does','When to book','Questions to ask','Budget considerations','Contract checklist','Warning signs','Comparison checklist','data-checklist','data-checklist-print','vendors.html','wedding-tools.html','wedding-checklists.html','Advertisement','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.toLowerCase().includes(feature.toLowerCase()))errors.push(`${vendorFile}: missing vendor-guide feature ${feature}`)}
const vendorSheets=['vendor-comparison-sheet.html','vendor-question-sheet.html','vendor-budget-sheet.html','vendor-booking-timeline.html'];for(const sheet of vendorSheets){const html=fs.readFileSync(path.join(root,sheet),'utf8');for(const feature of ['Print sheet','vendors.html','"@type":"Article"','"@type":"BreadcrumbList"'])if(!html.includes(feature))errors.push(`${sheet}: missing printable feature ${feature}`)}
const vendorHub=fs.readFileSync(path.join(root,'vendors.html'),'utf8');for(const feature of ['vendor-card-grid','Suggested booking order','Compare vendors consistently','Questions every vendor','Budget tips','vendor-comparison-sheet.html','vendor-question-sheet.html','vendor-budget-sheet.html','vendor-booking-timeline.html','"@type":"CollectionPage"','"@type":"FAQPage"'])if(!vendorHub.includes(feature))errors.push(`vendor hub missing ${feature}`);
const messageGuides=['bride-wedding-speech.html','groom-wedding-speech.html','parents-of-the-bride-speech.html','parents-of-the-groom-speech.html','sibling-wedding-speech.html','best-friend-wedding-speech.html','wedding-toast-examples.html','hindu-wedding-vows-guide.html','personal-wedding-vow-examples.html','wedding-blessings-for-couple.html','hindu-wedding-blessing-guidance.html','wedding-thank-you-speech.html','wedding-welcome-speech.html','wedding-anniversary-messages.html','marriage-congratulations-messages.html','post-wedding-thank-you-messages.html'];
for(const messageFile of messageGuides){const html=fs.readFileSync(path.join(root,messageFile),'utf8');for(const feature of ['guide-meta','article-toc','quick-tips','speech-example-card','data-copy-example','Writing framework','What to avoid','Delivery guidance','assets/js/messages/copy-example.js','Advertisement','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.toLowerCase().includes(feature.toLowerCase()))errors.push(`${messageFile}: missing message-guide feature ${feature}`)}
const messageHub=fs.readFileSync(path.join(root,'wedding-speeches-messages.html'),'utf8');for(const feature of ['data-speech-filter','data-speaker','data-occasion','data-tone','data-length','speech-filter.js','Speech-writing framework','What to avoid','wedding-speech-builder.html','wedding-vow-builder.html','wedding-message-generator.html','"@type":"CollectionPage"','"@type":"FAQPage"'])if(!messageHub.toLowerCase().includes(feature.toLowerCase()))errors.push(`message hub missing ${feature}`);
for(const tool of ['wedding-speech-builder.html','wedding-vow-builder.html','wedding-message-generator.html']){const html=fs.readFileSync(path.join(root,tool),'utf8');for(const feature of ['data-builder-output','data-copy-example','data-builder-print','privacy-note','"@type":"WebApplication"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.includes(feature))errors.push(`${tool}: missing builder feature ${feature}`)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: ${files.length} pages; unique titles/descriptions; one H1 each; all local links/assets resolve; sitemap, CNAME and calculator behaviors verified.`);
