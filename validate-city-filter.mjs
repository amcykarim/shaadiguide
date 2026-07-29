import fs from 'node:fs';import vm from 'node:vm';
const tags=['north metro','south coastal','east heritage','west destination','central metro','northeast metro','north hill'];
const cards=tags.map((tag,i)=>({dataset:{cityTags:tag,citySearch:['delhi','chennai','kolkata','goa','indore','guwahati','shimla'][i]},textContent:['Delhi','Chennai','Kolkata','Goa','Indore','Guwahati','Shimla'][i],hidden:false}));
const search={value:'',h:{},addEventListener(t,f){this.h[t]=f}};const status={textContent:''};const buttons=['all','north','south','east','west','central','northeast','metro','heritage','coastal','hill','destination'].map(v=>({dataset:{cityFilter:v},h:{},addEventListener(t,f){this.h[t]=f},setAttribute(){}}));
const document={querySelectorAll:s=>s==='[data-city-card]'?cards:buttons,querySelector:s=>s==='[data-city-search]'?search:s==='[data-city-status]'?status:null};vm.runInNewContext(fs.readFileSync('assets/js/city-filter.js','utf8'),{document});const fail=[];
for(const button of buttons.slice(1)){button.h.click();if(!cards.some(x=>!x.hidden))fail.push(`filter ${button.dataset.cityFilter} has no result`)}
buttons[0].h.click();search.value='Guwahati';search.h.input();if(cards.filter(x=>!x.hidden).length!==1||!cards[5]||cards[5].hidden)fail.push('city text search failed');
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log('PASS: all city filter groups and city text search update cards and live status.');
