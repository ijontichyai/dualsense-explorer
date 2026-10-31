(()=>{'use strict';
 const scene=makeScene(k,G).scene,machine=document.getElementById('machine'),slider=document.getElementById('time');
 const readout=document.querySelector('[data-readout]'),stage=document.querySelector('.iso-stage');
 const play=document.getElementById('play'),stepButtons=[...document.querySelectorAll('[data-step]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let time=0,playing=!reduced.matches,visible=true,last=0,prevStep=-1,dirty=true,lastDraw=0;
 const groups=new Map([...machine.children].map(el=>[el.dataset.name,el]));
 const index=new Map(INITIAL_ORDER.map((name,i)=>[name,i]));
 function render(){
 const s=model(time),built=scene(s);
 for(const item of built.items)if(item.live){const el=groups.get(item.name);el.innerHTML=item.svg;}
 // The layout uses distinct axial layers; the audit-settled slots remain stable throughout the tour.
 for(const it of built.items.sort((a,b)=>index.get(a.name)-index.get(b.name)))machine.appendChild(groups.get(it.name));
 slider.value=s.t;document.getElementById('angle').textContent=s.trigger.toFixed(1)+'°';document.getElementById('motor').textContent=(s.motor/360).toFixed(2)+' vueltas';
 document.getElementById('contact').textContent=s.contact?'Oposición':'Libre';readout.textContent=s.trigger.toFixed(1)+'° · '+(s.contact?'contacto':'sin contacto');
 if(prevStep!==s.step){prevStep=s.step;document.getElementById('stepTitle').textContent=steps[s.step][0];document.getElementById('stepText').textContent=steps[s.step][1];stepButtons.forEach((b,i)=>b.setAttribute('aria-current',String(i===s.step)));}
 play.textContent=playing?'Pausar':'Reproducir';play.setAttribute('aria-pressed',String(playing));dirty=false;
 }
 function seek(t){time=Math.max(0,Math.min(23.99,t));playing=false;dirty=true;render();}
 slider.addEventListener('input',()=>seek(Number(slider.value)));
 play.onclick=()=>{playing=!playing;dirty=true;render()};document.getElementById('restart').onclick=()=>{time=0;dirty=true;render()};
 document.getElementById('theme').onclick=()=>{const light=document.body.dataset.theme!=='light';document.body.dataset.theme=light?'light':'dark';document.getElementById('theme').textContent=light?'Tema oscuro':'Tema claro'};
 stepButtons.forEach((b,i)=>b.onclick=()=>seek([0,4.1,9.1,15.5,18.5][i]));
 stage.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();play.click()}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();seek(time+(e.key==='ArrowRight'?.4:-.4))}else if(e.key==='Home'){e.preventDefault();seek(0)}});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0});observer.observe(stage);
 document.addEventListener('visibilitychange',()=>{last=0});
 reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;dirty=true;render()}});
 function tick(now){const dt=last?Math.min((now-last)/1000,.06):0;last=now;if(!document.hidden&&visible){if(playing){time=(time+dt)%PERIOD;dirty=true}if(dirty&&now-lastDraw>=1000/24){render();lastDraw=now}}requestAnimationFrame(tick)}
 // Deterministic inspection hook used by verify.mjs and browser QA.
 window.l2Explorer={seek,model,get state(){return model(time)},get playing(){return playing},get parts(){return groups.size}};
 render();requestAnimationFrame(tick);
})();
