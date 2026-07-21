/* Shared, dependency-free calculator runtime for ShaadiGuide planning tools. */
window.ShaadiCalculator={
 register(config){
  const start=()=>{
   const root=document.querySelector('[data-calculator-app]');if(!root)return;
   const form=root.querySelector('form');const error=root.querySelector('[data-calc-error]');
   const currency=new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});
   const number=new Intl.NumberFormat('en-IN',{maximumFractionDigits:1});
   const read=()=>{const values={};form.querySelectorAll('input[type="number"]').forEach(input=>{const raw=input.value.trim();let value=raw===''?0:Number(raw);if(!Number.isFinite(value)||value<0)value=0;values[input.name]=value});return values};
   const format=(value,type='currency')=>type==='text'?String(value||'—'):type==='number'?number.format(value):type==='percent'?`${number.format(value)}%`:currency.format(value);
   const calculate=(event)=>{
    event?.preventDefault();error.textContent='';
    try{const values=read();const output=config.calculate(values);if(!output||Object.values(output.results).some(v=>typeof v.value==='number'&&!Number.isFinite(v.value))){throw new Error('Please review the entered values.')}
     config.results.forEach(item=>{const target=root.querySelector(`[data-result="${item.key}"]`);if(target){const value=output.results[item.key]?.value;target.textContent=format(value??0,item.type)}});
     const breakdown=root.querySelector('[data-breakdown]');if(breakdown){const rows=output.breakdown||[];const total=Math.max(output.breakdownTotal||rows.reduce((s,x)=>s+x.value,0),0);breakdown.innerHTML=rows.map(row=>`<div class="calc-breakdown-row"><div><span>${row.label}</span><b>${format(row.value,row.type)}</b></div>${row.type==='number'?'':`<div class="calc-bar" aria-hidden="true"><i style="width:${total?Math.min(100,row.value/total*100):0}%"></i></div>`}</div>`).join('')||'<p>No cost has been entered yet.</p>'}
     root.dataset.calculated='true';
    }catch(err){error.textContent=err.message||'Please review the entered values.'}
   };
   form.addEventListener('submit',calculate);form.addEventListener('input',calculate);
   form.addEventListener('reset',()=>setTimeout(calculate,0));
   root.querySelector('[data-print]')?.addEventListener('click',()=>{calculate();window.print()});
   calculate();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 }
};
