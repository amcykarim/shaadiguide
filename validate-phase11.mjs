import fs from 'node:fs';

const newPages=['roka-ceremony-guide.html','sagai-engagement-ceremony-guide.html','ganesh-puja-wedding-guide.html','tilak-ceremony-guide.html','kanyadaan-ceremony-guide.html','vivah-havan-guide.html','saat-phere-ceremony-guide.html','sindoor-daan-guide.html','mangalsutra-ceremony-guide.html','griha-pravesh-wedding-guide.html','wedding-reception-guide.html'];
const existing=['haldi-ceremony.html','mehndi-ceremony.html','sangeet-ceremony.html','baraat-guide.html','jaimala-varmala-guide.html','saptapadi-guide.html','vidaai-guide.html'];
const errors=[];
for(const file of newPages){const html=fs.readFileSync(file,'utf8');for(const token of ['page-hero','Meaning and importance','History and cultural context','When it is performed and who participates','Items and preparation','Step-by-step ceremony','North India','South India','East India','West India','Common mistakes','data-checklist','data-checklist-print','data-checklist-reset','wedding-tools.html','wedding-checklists.html','regional-weddings.html','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.toLowerCase().includes(token.toLowerCase()))errors.push(`${file}: missing ${token}`)}
for(const file of existing){const html=fs.readFileSync(file,'utf8');for(const token of ['regional-variations','North India','South India','East India','West India','data-checklist','data-checklist-print','wedding-tools.html','wedding-checklists.html','regional-weddings.html'])if(!html.toLowerCase().includes(token.toLowerCase()))errors.push(`${file}: missing Phase 11 enhancement ${token}`)}
const hub=fs.readFileSync('hindu-wedding-ceremonies.html','utf8');for(const file of newPages)if(!hub.includes(`href="${file}"`))errors.push(`ceremony hub missing ${file}`);
const search=fs.readFileSync('assets/js/main.js','utf8');for(const file of newPages)if(!search.includes(`url:'${file}'`))errors.push(`search missing ${file}`);
const sitemap=fs.readFileSync('sitemap.xml','utf8');for(const file of newPages)if(!sitemap.includes(`https://shaadiguide.in/${file}`))errors.push(`sitemap missing ${file}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS: all 18 ceremony guides include the Phase 11 library requirements; 11 new guides are present in hub, search and sitemap.');
