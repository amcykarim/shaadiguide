import fs from 'node:fs';
import {planningQuestionUrls,planningQuestionCount,planningQuestionSearchEntries} from './phase15-planning-questions.mjs';
const errors=[];const read=f=>fs.readFileSync(f,'utf8');
if(planningQuestionCount!==50)errors.push(`expected 50 guides, found ${planningQuestionCount}`);
for(const file of planningQuestionUrls){if(!fs.existsSync(file)){errors.push(`missing ${file}`);continue}const html=read(file);if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${file}: one H1 required`);if(!html.includes(`https://shaadiguide.in/${file}`))errors.push(`${file}: canonical/schema URL missing`);if(file!=='wedding-planning-questions.html'){for(const token of ['Direct answer','Step-by-step planning guidance','Decision checklist','A practical example','Common mistakes','Questions to discuss','wedding-planning-questions.html','FAQPage'])if(!html.includes(token))errors.push(`${file}: missing ${token}`)}}
const sitemap=read('sitemap.xml');for(const file of planningQuestionUrls)if(!sitemap.includes(`https://shaadiguide.in/${file}`))errors.push(`sitemap missing ${file}`);
const search=read('assets/js/planning-question-search-data.js');for(const item of planningQuestionSearchEntries)if(!search.includes(item.url))errors.push(`search missing ${item.url}`);
const hub=read('wedding-planning-questions.html');for(const token of ['data-question-search','data-question-filter="budget"','data-question-reset','data-question-empty','planning-question-filter.js'])if(!hub.includes(token))errors.push(`hub missing ${token}`);
for(const file of ['index.html','wedding-planning.html','wedding-tools.html','wedding-checklists.html'])if(!read(file).includes('wedding-planning-questions.html'))errors.push(`${file}: hub link missing`);
if(read('CNAME').trim()!=='shaadiguide.in')errors.push('CNAME changed');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Phase 15 validation passed: hub + ${planningQuestionCount} guides, search, sitemap and integrations.`);
