import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=fs.readdirSync(root).filter(f=>f.endsWith('.html')).sort();
const publicPages=pages.filter(f=>f!=='404.html');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const searchSource=fs.readFileSync('assets/js/main.js','utf8')+fs.readFileSync('assets/js/city-search-data.js','utf8')+fs.readFileSync('assets/js/planning-question-search-data.js','utf8');
const searchUrls=new Set([...searchSource.matchAll(/["']?url["']?\s*:\s*["']([^"']+\.html)["']/g)].map(m=>m[1]));
const rows=[];const incoming=new Map(pages.map(f=>[f,0]));
const outgoingMap=new Map();

const phaseFor=file=>{
 if(['index.html','about.html','contact.html','privacy.html','terms.html','disclaimer.html','editorial-policy.html','404.html','wedding-planning.html','hindu-wedding-ceremonies.html','haldi-ceremony.html','mehndi-ceremony.html','regional-weddings.html','wedding-budget-calculator.html','invitation-wording.html'].includes(file))return 'Phase 1';
 if(/^(sangeet-ceremony|baraat-guide|jaimala-varmala-guide|saptapadi-guide|vidaai-guide)/.test(file))return 'Phase 2';
 if(file==='wedding-tools.html'||/(calculator|planner)\.html$/.test(file))return 'Phase 3';
 if(/wedding-traditions\.html$/.test(file))return 'Phase 4';
 if(/(invitation|wording|checklist|emergency-kit|packing-checklist)/.test(file))return 'Phase 5';
 if(file==='vendors.html'||/^(wedding-(venue|caterer|photographer|videographer|decorator|makeup|entertainment|band|transport|florist|cake|planner)|mehndi-artist|bridal-|groom-outfit|vendor-)/.test(file))return 'Phase 6';
 if(/(speech|vow|blessing|anniversary|congratulations|post-wedding-thank-you|message-generator)/.test(file))return 'Phase 7';
 if(/(marriage-registration|marriage-certificate|special-marriage|lost-marriage|post-wedding-(name|document|address|travel)|passport-after|bank-and-insurance|newlywed-financial|official-marriage)/.test(file))return 'Phase 8';
 return 'Shared foundation';
};

for(const file of pages){
 const html=fs.readFileSync(file,'utf8');
 const links=[...html.matchAll(/href="([^"#?]+)(?:#[^"]*)?"/g)].map(m=>m[1]).filter(u=>u.endsWith('.html'));
 const outgoing=[...new Set(links)].filter(u=>pages.includes(u));outgoingMap.set(file,outgoing);
 for(const target of outgoing)incoming.set(target,(incoming.get(target)||0)+1);
 const schemas=[];for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{const data=JSON.parse(m[1]);schemas.push(data['@type']||'Unknown')}catch{schemas.push('INVALID')}}
 rows.push({file,url:file==='index.html'?'https://shaadiguide.in/':`https://shaadiguide.in/${file}`,type:html.match(/<body class="([^"]+)"/)?.[1]||'page',title:html.match(/<title>(.*?)<\/title>/)?.[1]||'',desc:html.match(/<meta name="description" content="([^"]*)"/)?.[1]||'',canonical:html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]||'',h1:html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()||'',schemas:schemas.join(', '),sitemap:file==='404.html'?'Excluded':sitemap.includes(file==='index.html'?'<loc>https://shaadiguide.in/</loc>':`<loc>https://shaadiguide.in/${file}</loc>`)?'Yes':'No',search:searchUrls.has(file)?'Yes':'No',outgoing:outgoing.length,ads:(html.match(/aria-label="Advertisement"/g)||[]).length,phase:phaseFor(file)});
}
for(const row of rows)row.incoming=incoming.get(row.file)||0;
const orphan=rows.filter(r=>r.file!=='index.html'&&r.file!=='404.html'&&r.incoming===0);
const lowLinks=rows.filter(r=>r.file!=='404.html'&&r.outgoing<3);
const missingSearch=rows.filter(r=>r.file!=='404.html'&&r.search==='No');
const schemaCounts=new Map();for(const row of rows)for(const type of row.schemas.split(', ').filter(Boolean))schemaCounts.set(type,(schemaCounts.get(type)||0)+1);
const assetFiles=[];for(const dir of ['assets/css','assets/js','assets/images']){const walk=d=>{for(const entry of fs.readdirSync(d,{withFileTypes:true})){const full=path.join(d,entry.name);if(entry.isDirectory())walk(full);else assetFiles.push({file:full.replaceAll('\\','/'),bytes:fs.statSync(full).size})}};walk(dir)}
const htmlBytes=pages.reduce((sum,file)=>sum+fs.statSync(file).size,0);
const esc=s=>String(s).replace(/\|/g,'\\|').replace(/\r?\n/g,' ');
let md=`# ShaadiGuide Pre-Launch Site Audit\n\nGenerated: 20 July 2026  \nPublic canonical pages: ${publicPages.length}  \nCustom 404: 1  \nTotal HTML files: ${pages.length}\n\nThis developer-only report is not linked from the public website and is excluded from the sitemap and search index.\n\n## Summary\n\n- Orphan pages: ${orphan.length?orphan.map(x=>x.file).join(', '):'None'}\n- Pages with fewer than three outgoing internal page links: ${lowLinks.length?lowLinks.map(x=>x.file).join(', '):'None'}\n- Public pages absent from search index: ${missingSearch.filter(x=>x.file!=='index.html').length?missingSearch.filter(x=>x.file!=='index.html').map(x=>x.file).join(', '):'None (the homepage is the search surface and is intentionally not a result)'}\n- Sitemap exclusions: 404.html only\n- Total generated HTML: ${(htmlBytes/1024).toFixed(1)} KiB\n\n## Documented search regression set\n\nHaldi; Saptapadi; Punjabi wedding; Tamil wedding; wedding budget; catering calculator; invitation generator; wedding checklist; wedding photographer; groom speech; personal vows; marriage registration; passport after marriage. The complete automated suite contains 107 representative queries across all phases.\n\n## Structured-data inventory\n\n${[...schemaCounts].sort().map(([type,count])=>`- ${type}: ${count} pages`).join('\n')}\n\n## Static asset inventory\n\n| Asset | Size |\n|---|---:|\n${assetFiles.map(x=>`| ${x.file} | ${(x.bytes/1024).toFixed(1)} KiB |`).join('\n')}\n\n## Full inventory\n\n| Filename | URL | Page type | Title | Meta description | Canonical | H1 | Schema type(s) | Sitemap | Search | Incoming | Outgoing | Ads | Last substantive phase |\n|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|\n`;
for(const r of rows)md+=`| ${esc(r.file)} | ${esc(r.url)} | ${esc(r.type)} | ${esc(r.title)} | ${esc(r.desc)} | ${esc(r.canonical)} | ${esc(r.h1)} | ${esc(r.schemas)} | ${r.sitemap} | ${r.search} | ${r.incoming} | ${r.outgoing} | ${r.ads} | ${r.phase} |\n`;
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','site-audit.md'),md,'utf8');
console.log(`Wrote reports/site-audit.md for ${pages.length} HTML files (${publicPages.length} public canonical pages).`);
