import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const files=fs.readdirSync(root).filter(file=>file.endsWith('.html'));
const errors=[];
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const ad of html.matchAll(/<aside class="ad[^"]*"([^>]*)>/g))if(!/aria-label="Advertisement"/.test(ad[1]))errors.push(`${file}: advertisement placeholder lacks an accessible label`);
 for(const image of html.matchAll(/<img\b([^>]*)>/g)){const attrs=image[1];if(!/\balt="[^"]*"/.test(attrs))errors.push(`${file}: image missing alt`);if(!/\bwidth="\d+"/.test(attrs)||!/\bheight="\d+"/.test(attrs))errors.push(`${file}: image missing intrinsic dimensions`)}
 const bodyClass=html.match(/<body class="([^"]*)"/)?.[1]||'';
 if(/\b(guide|simple|calculator-page|tool-page-body)\b/.test(bodyClass)&&file!=='404.html'&&!/<section class="page-hero/.test(html))errors.push(`${file}: content page lacks a clear introductory hero`);
}
const required={
 'about.html':['Sources and verification','Updates and corrections','differ by region, language, community, family'],
 'editorial-policy.html':['Sources and verification','Editorial review','Corrections policy','AI-assisted content policy','Updating older pages'],
 'disclaimer.html':['Educational purpose','Cultural and religious variation','Legal and administrative information','No professional advice'],
 'privacy.html':['user database','advertising network is currently installed','analytics service'],
 'contact.html':['reliable source or local context','do not email identity documents','does not send messages']
};
for(const [file,tokens] of Object.entries(required)){const html=fs.readFileSync(path.join(root,file),'utf8');for(const token of tokens)if(!html.toLowerCase().includes(token.toLowerCase()))errors.push(`${file}: missing trust statement ${token}`)}
const css=fs.readFileSync(path.join(root,'assets/css/style.css'),'utf8');
for(const token of ['.ad{','min-height:112px','@media(prefers-reduced-motion:reduce)',':focus-visible'])if(!css.includes(token))errors.push(`style.css: missing ${token}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: Phase 10 trust, content introductions, advertisements, images and accessibility safeguards verified across ${files.length} HTML pages.`);
