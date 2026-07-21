const cityCards=[...document.querySelectorAll('[data-city-card]')];
const citySearch=document.querySelector('[data-city-search]');
const cityButtons=[...document.querySelectorAll('[data-city-filter]')];
const cityStatus=document.querySelector('[data-city-status]');
let cityFilter='all';
function updateCities(){const query=(citySearch?.value||'').trim().toLowerCase();let visible=0;cityCards.forEach(card=>{const tags=(card.dataset.cityTags||'').split(/\s+/);const matchesFilter=cityFilter==='all'||tags.includes(cityFilter);const matchesQuery=!query||(card.dataset.citySearch||card.textContent).toLowerCase().includes(query)||card.textContent.toLowerCase().includes(query);card.hidden=!(matchesFilter&&matchesQuery);if(!card.hidden)visible++});if(cityStatus)cityStatus.textContent=`${visible} city guide${visible===1?'':'s'} shown.`}
citySearch?.addEventListener('input',updateCities);
cityButtons.forEach(button=>button.addEventListener('click',()=>{cityFilter=button.dataset.cityFilter;cityButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));updateCities()}));
updateCities();
