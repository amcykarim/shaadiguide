const regionalCards=[...document.querySelectorAll('[data-region-card]')];
const regionalSearch=document.querySelector('[data-region-search]');
const regionalButtons=[...document.querySelectorAll('[data-region-filter]')];
const regionalStatus=document.querySelector('[data-region-status]');
let regionalArea='all';
function filterRegions(){const query=(regionalSearch?.value||'').trim().toLowerCase();let visible=0;regionalCards.forEach(card=>{const matchesArea=regionalArea==='all'||card.dataset.area===regionalArea;const matchesText=!query||card.textContent.toLowerCase().includes(query);const show=matchesArea&&matchesText;card.hidden=!show;if(show)visible++});if(regionalStatus)regionalStatus.textContent=`${visible} regional guide${visible===1?'':'s'} shown.`}
regionalSearch?.addEventListener('input',filterRegions);
regionalButtons.forEach(button=>button.addEventListener('click',()=>{regionalArea=button.dataset.regionFilter;regionalButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));filterRegions()}));
filterRegions();
