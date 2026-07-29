import fs from 'node:fs';

const slugs=['punjab','haryana','delhi','uttar-pradesh','rajasthan','gujarat','maharashtra','goa','madhya-pradesh','bihar','jharkhand','west-bengal','odisha','assam','tamil-nadu','kerala','karnataka','andhra-pradesh','telangana','jammu-kashmir','himachal-pradesh','uttarakhand','chhattisgarh'];
const files=slugs.map(x=>`${x}-wedding-traditions-guide.html`);const errors=[];
for(const file of files){const html=fs.readFileSync(file,'utf8');for(const token of ['regional-hero','Overview','Wedding traditions and common ceremonies','Typical wedding timeline','Traditional attire and wedding colours','Food traditions, music and dance','Regional rituals and family traditions','Planning and budget considerations','Seasonal advice','Common mistakes','hindu-wedding-ceremonies.html','wedding-planning.html','wedding-tools.html','vendors.html','invitation-wording.html','wedding-checklists.html','"@type":"Article"','"@type":"BreadcrumbList"','"@type":"FAQPage"'])if(!html.toLowerCase().includes(token.toLowerCase()))errors.push(`${file}: missing ${token}`)}
const hub=fs.readFileSync('regional-weddings.html','utf8');for(const file of files)if(!hub.includes(`href="${file}"`))errors.push(`regional hub missing ${file}`);
const search=fs.readFileSync('assets/js/main.js','utf8');for(const file of files)if(!search.includes(`url:'${file}'`))errors.push(`search missing ${file}`);
const sitemap=fs.readFileSync('sitemap.xml','utf8');for(const file of files)if(!sitemap.includes(`https://shaadiguide.in/${file}`))errors.push(`sitemap missing ${file}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('PASS: 23 state and union-territory wedding guides include Phase 12 content, cross-links, schema, hub, search and sitemap coverage.');
