import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('assets/js/city-search-data.js','utf8')+'\n'+fs.readFileSync('assets/js/planning-question-search-data.js','utf8')+'\n'+fs.readFileSync('assets/js/main.js','utf8')+'\n;globalThis.__searchTest={searchData,normalise,scoreResult};';
const noop=()=>{};
const context={
 document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop},
 window:{addEventListener:noop,innerWidth:1440},navigator:{},location:{href:''},setTimeout,globalThis:null
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(source,context);
const {searchData,normalise,scoreResult}=context.__searchTest;
const cases={
 'wedding checklist':'wedding-checklists.html','budget calculator':'wedding-budget-calculator.html','haldi':'haldi-ceremony.html','roka ceremony':'roka-ceremony-guide.html','sagai ceremony':'sagai-engagement-ceremony-guide.html','ganesh puja wedding':'ganesh-puja-wedding-guide.html','tilak ceremony':'tilak-ceremony-guide.html','kanyadaan':'kanyadaan-ceremony-guide.html','vivah havan':'vivah-havan-guide.html','saat phere':'saat-phere-ceremony-guide.html','sindoor daan':'sindoor-daan-guide.html','mangalsutra ceremony':'mangalsutra-ceremony-guide.html','griha pravesh':'griha-pravesh-wedding-guide.html','wedding reception guide':'wedding-reception-guide.html','groom styling':'groom-styling-guide.html','wedding pandit':'wedding-priest-pandit-guide.html','live wedding music':'live-wedding-music-guide.html','invitation printer':'wedding-invitation-vendor-guide.html','wedding gift supplier':'wedding-gifts-guide.html','luxury wedding car':'luxury-wedding-car-guide.html','honeymoon planning':'honeymoon-planning-guide.html',
 'mehndi artist':'mehndi-ceremony.html','hindu ceremonies':'hindu-wedding-ceremonies.html','punjabi wedding':'punjabi-wedding-traditions.html',
 'gujarati wedding':'gujarati-wedding-traditions.html','bengali wedding':'bengali-wedding-traditions.html','tamil wedding':'tamil-wedding-traditions.html','telugu wedding':'telugu-wedding-traditions.html','punjab state wedding':'punjab-wedding-traditions-guide.html','uttar pradesh state wedding':'uttar-pradesh-wedding-traditions-guide.html','goa state wedding':'goa-wedding-traditions-guide.html','assam state wedding':'assam-wedding-traditions-guide.html','kerala state wedding':'kerala-wedding-traditions-guide.html','telangana state wedding':'telangana-wedding-traditions-guide.html',
 'whatsapp invitation':'invitation-wording.html','about':'about.html','privacy':'privacy.html','contact':'contact.html'
 ,'delhi wedding':'delhi-wedding-planning-guide.html','mumbai wedding':'mumbai-wedding-planning-guide.html','bengaluru wedding':'bengaluru-wedding-planning-guide.html','bangalore wedding':'bengaluru-wedding-planning-guide.html','hyderabad wedding':'hyderabad-wedding-planning-guide.html','chennai wedding':'chennai-wedding-planning-guide.html','kolkata wedding':'kolkata-wedding-planning-guide.html','ahmedabad wedding':'ahmedabad-wedding-planning-guide.html','pune wedding':'pune-wedding-planning-guide.html','jaipur wedding':'jaipur-wedding-planning-guide.html','udaipur wedding':'udaipur-wedding-planning-guide.html','jodhpur wedding':'jodhpur-wedding-planning-guide.html','lucknow wedding':'lucknow-wedding-planning-guide.html','chandigarh wedding':'chandigarh-wedding-planning-guide.html','amritsar wedding':'amritsar-wedding-planning-guide.html','goa wedding':'goa-wedding-planning-guide.html','shimla wedding':'shimla-wedding-planning-guide.html','rishikesh wedding':'rishikesh-wedding-planning-guide.html','kochi wedding':'kochi-wedding-planning-guide.html','cochin wedding':'kochi-wedding-planning-guide.html','trivandrum wedding':'thiruvananthapuram-wedding-planning-guide.html','mysore wedding':'mysuru-wedding-planning-guide.html','allahabad wedding':'prayagraj-wedding-planning-guide.html','destination wedding india':'city-wedding-guides.html','city wedding planning':'city-wedding-guides.html','heritage wedding':'city-wedding-guides.html','beach wedding':'city-wedding-guides.html','hill wedding':'city-wedding-guides.html'
 ,'sangeet':'sangeet-ceremony.html','baraat safety':'baraat-guide.html','varmala':'jaimala-varmala-guide.html','seven steps':'saptapadi-guide.html','vidaai':'vidaai-guide.html',
 'wedding calculator':'wedding-budget-calculator.html','wedding budget':'wedding-budget-calculator.html','catering calculator':'catering-cost-calculator.html',
 'cost per guest':'cost-per-guest-calculator.html','venue calculator':'venue-budget-calculator.html','decoration calculator':'decoration-budget-calculator.html',
 'invitation cost':'invitation-cost-calculator.html','jewellery budget':'jewellery-budget-calculator.html','hotel rooms':'accommodation-planner.html',
 'accommodation':'accommodation-planner.html','transport calculator':'transportation-cost-calculator.html','return gifts':'return-gift-budget-calculator.html',
 'marathi wedding':'marathi-wedding-traditions.html','kannada wedding':'kannada-wedding-traditions.html','kerala wedding':'kerala-hindu-wedding-traditions.html',
 'rajasthani wedding':'rajasthani-wedding-traditions.html','sindhi wedding':'sindhi-wedding-traditions.html','bihari wedding':'bihari-wedding-traditions.html',
 'odia wedding':'odia-wedding-traditions.html','assamese wedding':'assamese-wedding-traditions.html','kashmiri wedding':'kashmiri-pandit-wedding-traditions.html',
 'himachali wedding':'himachali-wedding-traditions.html','haryanvi wedding':'haryanvi-wedding-traditions.html','regional traditions':'regional-weddings.html','indian wedding customs':'regional-weddings.html',
 'hindu invitation':'hindu-wedding-invitation-wording.html','modern invitation':'modern-indian-wedding-invitation-wording.html','whatsapp wedding invitation':'whatsapp-wedding-invitation-messages.html',
 'haldi invitation':'haldi-invitation-wording.html','mehndi invitation':'mehndi-invitation-wording.html','sangeet invitation':'sangeet-invitation-wording.html','reception invitation':'wedding-reception-invitation-wording.html',
 'rsvp wording':'wedding-rsvp-wording.html','no gifts wording':'no-gifts-wedding-wording.html','postponement message':'wedding-postponement-wording.html','cancellation message':'wedding-cancellation-wording.html',
 'thank you message':'wedding-thank-you-messages.html','wedding announcement':'wedding-announcement-wording.html','invitation generator':'invitation-wording-generator.html',
 'bride checklist':'bride-wedding-checklist.html','groom checklist':'groom-wedding-checklist.html','wedding packing list':'wedding-packing-checklist.html','emergency kit':'wedding-day-emergency-kit.html','vendor questions':'vendor-question-sheet.html',
 'venue':'wedding-venue-guide.html','photographer':'wedding-photographer-guide.html','videographer':'wedding-videographer-guide.html','decorator':'wedding-decorator-guide.html',
 'makeup artist':'wedding-makeup-artist-guide.html','mehndi artist':'mehndi-artist-guide.html','planner':'wedding-planner-guide.html','dj':'wedding-band-dj-guide.html','band':'wedding-band-dj-guide.html',
 'transport':'wedding-transport-guide.html','jewellery':'bridal-jewellery-guide.html','bridal outfit':'bridal-outfit-guide.html','vendor checklist':'vendor-question-sheet.html',
 'bride speech':'bride-wedding-speech.html','groom speech':'groom-wedding-speech.html','parent speech':'parents-of-the-bride-speech.html','sibling speech':'sibling-wedding-speech.html','best friend speech':'best-friend-wedding-speech.html',
 'wedding toast':'wedding-toast-examples.html','wedding vows':'hindu-wedding-vows-guide.html','personal vows':'personal-wedding-vow-examples.html','wedding blessing':'wedding-blessings-for-couple.html','hindu wedding blessing':'hindu-wedding-blessing-guidance.html',
 'thank you speech':'wedding-thank-you-speech.html','welcome speech':'wedding-welcome-speech.html','anniversary message':'wedding-anniversary-messages.html','congratulations message':'marriage-congratulations-messages.html',
 'post wedding thank you':'post-wedding-thank-you-messages.html','speech builder':'wedding-speech-builder.html','vow builder':'wedding-vow-builder.html','message generator':'wedding-message-generator.html',
 'marriage registration':'marriage-registration-guide.html','marriage certificate':'marriage-registration-guide.html','hindu marriage registration':'hindu-marriage-registration-guide.html',
 'special marriage act':'special-marriage-act-guide.html','marriage documents':'marriage-certificate-document-checklist.html','registration witnesses':'marriage-registration-witness-guide.html',
 'certificate correction':'marriage-certificate-correction-guide.html','lost marriage certificate':'lost-marriage-certificate-guide.html','name change after marriage':'post-wedding-name-change-guide.html',
 'passport after marriage':'passport-after-marriage-guide.html','document update checklist':'post-wedding-document-update-checklist.html','newlywed finances':'newlywed-financial-planning-checklist.html',
 'address change':'post-wedding-address-change-checklist.html','official marriage registration portal':'official-marriage-registration-links.html'
};
const failures=[];
for(const [query,expected] of Object.entries(cases)){
 const q=normalise(query);const best=searchData.map(item=>({...item,score:scoreResult(item,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title))[0];
 if(best?.url!==expected)failures.push(`${query}: expected ${expected}, got ${best?.url||'none'}`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`PASS: ${Object.keys(cases).length} representative search queries route to the intended existing pages.`);
