import fs from 'node:fs';
import vm from 'node:vm';
import {registrationUrls} from './phase8-registration.mjs';

const fail=[];
const officialHosts=new Set(['www.indiacode.nic.in','services.india.gov.in','www.passportindia.gov.in','www.uidai.gov.in','uidai.gov.in','voters.eci.gov.in','www.incometax.gov.in','sarathi.parivahan.gov.in','irdai.gov.in','revenue.delhi.gov.in','aaplesarkar.mahaonline.gov.in']);
for(const file of registrationUrls){
 const html=fs.readFileSync(file,'utf8');
 const h1=(html.match(/<h1\b/g)||[]).length;
 if(h1!==1)fail.push(`${file}: ${h1} H1 elements`);
 if(!html.includes('General information, not legal advice'))fail.push(`${file}: missing legal disclaimer`);
 if(file!=='official-marriage-registration-links.html'&&!html.includes('Sources and verification'))fail.push(`${file}: missing sources section`);
 for(const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"#]+)"/g)){
  const host=new URL(match[1]).hostname;
  if(!officialHosts.has(host))fail.push(`${file}: non-government external host ${host}`);
 }
 if(/₹|Rs\.?\s*\d|INR\s*\d/i.test(html))fail.push(`${file}: numeric fee claim found`);
}
for(const file of ['marriage-certificate-document-checklist.html','marriage-registration-appointment-checklist.html','post-wedding-document-update-checklist.html']){
 const html=fs.readFileSync(file,'utf8');
 for(const token of ['data-checklist','data-progress','data-checklist-reset','data-checklist-print','may apply; confirm officially'])if(!html.includes(token))fail.push(`${file}: missing ${token}`);
}
const source=fs.readFileSync('assets/js/checklists/checklist-progress.js','utf8');
const boxes=[{checked:false,addEventListener:(type,fn)=>boxes[0].change=fn},{checked:false,addEventListener:(type,fn)=>boxes[1].change=fn}];
const progress={textContent:''};const style={value:'',setProperty:(k,v)=>style.value=v};
const reset={addEventListener:(type,fn)=>reset.click=fn};const print={addEventListener:(type,fn)=>print.click=fn};
const scope={querySelector:s=>s==='[data-progress]'?progress:null,querySelectorAll:s=>s==='[data-checklist-reset]'?[reset]:s==='[data-checklist-print]'?[print]:[],style};
const root={closest:()=>scope,querySelectorAll:()=>boxes};let printed=false;
vm.runInNewContext(source,{document:{querySelectorAll:()=>[root]},window:{print:()=>printed=true}});
boxes[0].checked=true;boxes[0].change();if(progress.textContent!=='1 of 2 completed')fail.push('checklist progress failed');reset.click();if(boxes.some(x=>x.checked))fail.push('checklist reset failed');print.click();if(!printed)fail.push('checklist print failed');
if(fail.length){console.error(fail.join('\n'));process.exit(1)}
console.log(`PASS: ${registrationUrls.length} Phase 8 pages use official-source domains, legal disclaimers and non-universal fee language; checklist progress, reset and print verified.`);
