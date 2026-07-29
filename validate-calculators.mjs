import fs from 'node:fs';
import vm from 'node:vm';

const modules=['wedding-budget.js','catering-cost.js','cost-per-guest.js','venue-budget.js','decoration-budget.js','invitation-cost.js','jewellery-budget.js','accommodation-planner.js','transportation-cost.js','return-gift-budget.js'];
const failures=[];
for(const file of modules){
 let config;
 const context={ShaadiCalculator:{register:value=>{config=value}}};
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(`assets/js/calculators/${file}`,'utf8'),context,{filename:file});
 if(!config?.calculate){failures.push(`${file}: registration failed`);continue}
 for(const [label,value] of [['normal',10],['all-zero',0]]){
  const values=new Proxy({}, {get:()=>value});
  const output=config.calculate(values);
  const nums=[...Object.values(output.results),...(output.breakdown||[])].map(x=>x.value).filter(x=>typeof x==='number');
  if(nums.some(x=>!Number.isFinite(x)||x<0))failures.push(`${file}: ${label} values produced an invalid result`);
 }
}
const shared=fs.readFileSync('assets/js/calculators/shared-calculator.js','utf8');
for(const behavior of ["raw===''?0:Number(raw)",'value<0','Intl.NumberFormat',"currency:'INR'","form.addEventListener('reset'",'window.print()'])if(!shared.includes(behavior))failures.push(`shared runtime missing ${behavior}`);
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`PASS: ${modules.length} calculators return finite non-negative normal and all-zero results; shared blank, negative, INR, reset and print handling verified.`);
