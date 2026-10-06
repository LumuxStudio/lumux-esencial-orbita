const form=document.querySelector<HTMLFormElement>('.contact-form');
if(form){
 const fields=Array.from(form.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input,textarea'));
 const status=form.querySelector<HTMLElement>('.form-status')!;
 const button=form.querySelector<HTMLButtonElement>('button')!;
 const original=button.innerHTML;
 button.disabled=false;
 const validate=(field:HTMLInputElement|HTMLTextAreaElement)=>{let error='';if(!field.value.trim()) error=form.dataset.required!;else if(field.type==='email'&&!field.validity.valid) error=form.dataset.emailError!;else if(field.name==='message'&&field.value.trim().length<10) error=form.dataset.minimum!;field.setAttribute('aria-invalid',String(!!error));document.getElementById(`${field.id}-error`)!.textContent=error;return !error;};
 fields.forEach(f=>{f.addEventListener('blur',()=>{f.dataset.touched='true';validate(f)});f.addEventListener('input',()=>{if(f.dataset.touched)validate(f);status.textContent='';delete status.dataset.state;});});
 form.addEventListener('submit',async(e)=>{e.preventDefault();const checks=fields.map(validate);if(checks.some(v=>!v)){status.textContent=form.dataset.error!;status.dataset.state='error';fields.find(f=>f.getAttribute('aria-invalid')==='true')?.focus();return;}button.disabled=true;form.setAttribute('aria-busy','true');button.textContent=form.dataset.loading!;await new Promise(r=>setTimeout(r,350));status.textContent=form.dataset.valid!;status.dataset.state='success';button.disabled=false;form.removeAttribute('aria-busy');button.innerHTML=original;window.dispatchEvent(new CustomEvent('lumux:action',{detail:{action:'demo_form_validated'}}));});
}
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));const first=document.querySelector<HTMLButtonElement>('[data-filter]')?.dataset.filter;document.querySelectorAll<HTMLElement>('[data-category]').forEach(p=>{p.hidden=b.dataset.filter!==first&&p.dataset.category!==b.dataset.filter;});}));
document.querySelectorAll<HTMLAnchorElement>('[data-track]').forEach(a=>a.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('lumux:action',{detail:{action:a.dataset.track,path:location.pathname}}))));
const menu=document.querySelector<HTMLDetailsElement>('.mobile-menu');menu?.addEventListener('click',e=>{if((e.target as Element).closest('a'))menu.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus()}});
