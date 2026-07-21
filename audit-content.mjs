import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const files=fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
const strip=html=>html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const main=html=>html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]||'';
const findings=[];let articlePages=0,longParagraphs=0;
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const bodyClass=html.match(/<body class="([^"]*)"/)?.[1]||'';
 const isArticle=/\b(guide|simple|vendor-guide|regional-guide|wording-page|message-guide)\b/.test(bodyClass);
 if(isArticle)articlePages++;
 const body=main(html)
  .replace(/<article class="speech-example-card">[\s\S]*?<\/article>/gi,' ')
  .replace(/<article class="wording-card">[\s\S]*?<\/article>/gi,' ')
  .replace(/<article class="government-link-card">[\s\S]*?<\/article>/gi,' ')
  .replace(/<article class="city-card"[\s\S]*?<\/article>/gi,' ')
  .replace(/<div class="venue-type-grid">[\s\S]*?<\/div>/gi,' ');
 const paragraphs=[...body.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)].map(m=>strip(m[1])).filter(x=>x.length>45);
 const seen=new Map();
 for(const p of paragraphs){const key=p.toLocaleLowerCase('en-IN');if(seen.has(key))findings.push([file,'duplicate paragraph',p.slice(0,100)]);else seen.set(key,true);const words=p.split(/\s+/).length;if(words>105){longParagraphs++;findings.push([file,`long paragraph (${words} words)`,p.slice(0,100)])}}
 const sentences=strip(body).split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>55);
 const sentenceSeen=new Set();for(const sentence of sentences){const key=sentence.toLocaleLowerCase('en-IN');if(sentenceSeen.has(key))findings.push([file,'repeated sentence',sentence.slice(0,100)]);sentenceSeen.add(key)}
}
const report=[
 '# Phase 10 Content Quality Audit','',`Generated: ${new Intl.DateTimeFormat('en-IN',{dateStyle:'long'}).format(new Date())}  `,
 `HTML pages reviewed: ${files.length}  `,`Article-style and trust pages reviewed: ${articlePages}  `,
 `Exact duplicate or repeated-text findings: ${findings.filter(x=>!x[1].startsWith('long paragraph')).length}  `,
 `Paragraphs over 105 words: ${longParagraphs}`,'',
 '## Method','',
 'The audit compares narrative main-content paragraphs and sentences within each page. Shared navigation, footer text, structured data, scripts, reusable wording/speech example cards and repeated government-link verification labels are excluded. The excluded components are covered by their dedicated feature, safety and source validators. Long paragraphs are flagged for human review rather than rewritten automatically.','',
 '## Findings','',
 ...(findings.length?findings.map(([file,type,text])=>`- **${file} — ${type}:** ${text}…`):['No exact duplicate paragraphs, repeated sentences or unusually long paragraphs were found.']),''
];
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','content-quality-audit.md'),report.join('\n'),'utf8');
if(findings.some(x=>x[1]==='duplicate paragraph'||x[1]==='repeated sentence')){console.error(`FAIL: ${findings.length} content-quality findings; see reports/content-quality-audit.md`);process.exit(1)}
console.log(`PASS: reviewed ${files.length} HTML pages (${articlePages} article/trust pages); no duplicate paragraphs or repeated sentences.`);
