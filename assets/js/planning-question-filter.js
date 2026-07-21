(()=>{
 const root=document.querySelector('.planning-question-filter'); if(!root)return;
 const input=root.querySelector('[data-question-search]');
 const buttons=[...root.querySelectorAll('[data-question-filter]')];
 const cards=[...document.querySelectorAll('[data-question-card]')];
 const status=root.querySelector('[data-question-status]');
 const empty=root.querySelector('[data-question-empty]');
 let category='all';
 const normalise=value=>value.toLocaleLowerCase('en-IN').trim();
 function update(){const query=normalise(input.value);let count=0;for(const card of cards){const categoryMatch=category==='all'||card.dataset.questionCategory===category;const queryMatch=!query||normalise(card.dataset.questionSearch||card.textContent).includes(query);card.hidden=!(categoryMatch&&queryMatch);if(!card.hidden)count++;}status.textContent=`${count} guide${count===1?'':'s'} shown`;empty.hidden=count!==0;}
 buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.questionFilter;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));update()}));
 input.addEventListener('input',update);
 root.querySelector('[data-question-reset]')?.addEventListener('click',()=>{category='all';input.value='';buttons.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.questionFilter==='all')));update();input.focus()});
 update();
})();
