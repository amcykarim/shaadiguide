document.querySelectorAll('[data-copy-wording]').forEach(button=>{button.setAttribute('aria-live','polite');button.addEventListener('click',async()=>{
 const target=document.getElementById(button.getAttribute('aria-controls'));if(!target)return;
 const wording=target.innerText.trim();const original=button.textContent;
 try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(wording);else{const area=document.createElement('textarea');area.value=wording;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const copied=document.execCommand('copy');area.remove();if(!copied)throw new Error('copy unavailable')}button.textContent='Copied';}
 catch{button.textContent='Select and copy';const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(target);selection.removeAllRanges();selection.addRange(range)}
 setTimeout(()=>button.textContent=original,1800);
})});
