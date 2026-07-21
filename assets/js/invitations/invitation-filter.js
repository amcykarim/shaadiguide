const invitationCards=[...document.querySelectorAll('[data-invitation-card]')];
const invitationSearch=document.querySelector('[data-invitation-search]');
const invitationFilters=[...document.querySelectorAll('[data-invitation-filter]')];
const invitationStatus=document.querySelector('[data-invitation-status]');let invitationType='all';
function filterInvitations(){const query=(invitationSearch?.value||'').trim().toLowerCase();let visible=0;invitationCards.forEach(card=>{const types=(card.dataset.types||'').split(' ');const show=(invitationType==='all'||types.includes(invitationType))&&(!query||card.textContent.toLowerCase().includes(query));card.hidden=!show;if(show)visible++});if(invitationStatus)invitationStatus.textContent=`${visible} resource${visible===1?'':'s'} shown.`}
invitationSearch?.addEventListener('input',filterInvitations);invitationFilters.forEach(button=>button.addEventListener('click',()=>{invitationType=button.dataset.invitationFilter;invitationFilters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));filterInvitations()}));filterInvitations();
