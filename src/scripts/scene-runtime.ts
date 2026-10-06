import * as THREE from 'three';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export type SceneContext={scene:THREE.Scene;camera:THREE.PerspectiveCamera;renderer:THREE.WebGLRenderer;color:(name:string)=>THREE.Color};
export type SceneState={progress:number;time:number;choice:string;pointer:{x:number;y:number};aspect:number;paused:boolean};
type Effect={update:(state:SceneState)=>void;dispose?:()=>void};

// This file is owned locally by this project. No other template is a runtime dependency.
export function runScene(host:HTMLElement,build:(context:SceneContext)=>Effect){
 if(host.dataset.render==='webgl')return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const status=host.querySelector<HTMLElement>('.scene-status');
 const fallback=()=>{host.dataset.render='fallback';host.classList.remove('is-live');if(status)status.textContent=status.dataset.fallback||'Vista estática del concepto.';};
 const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
 if(reduced.matches||connection?.saveData){fallback();if(reduced.matches)reduced.addEventListener('change',event=>{if(!event.matches&&host.isConnected)runScene(host,build);},{once:true});return;}
 const viewport=host.querySelector<HTMLElement>('.scene-canvas');if(!viewport){fallback();return;}
 let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{fallback();return;}
 const abort=new AbortController();const signal=abort.signal;
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,120);
 const sample=document.createElement('canvas');sample.width=sample.height=1;const ctx=sample.getContext('2d')!;
 const color=(name:string)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=getComputedStyle(host).getPropertyValue(name).trim()||'white';ctx.fillRect(0,0,1,1);const p=ctx.getImageData(0,0,1,1).data;return new THREE.Color().setRGB(p[0]/255,p[1]/255,p[2]/255,THREE.SRGBColorSpace);};
 let effect:Effect;
 const disposeObjects=()=>{const geometries=new Set<THREE.BufferGeometry>();const materials=new Set<THREE.Material>();scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Points||obj instanceof THREE.Line){geometries.add(obj.geometry);for(const m of Array.isArray(obj.material)?obj.material:[obj.material])materials.add(m);gsap.killTweensOf(obj.position);gsap.killTweensOf(obj.rotation);gsap.killTweensOf(obj.scale);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
 try{effect=build({scene,camera,renderer,color});}catch(error){disposeObjects();renderer.dispose();fallback();console.error('No se pudo iniciar la escena',error);return;}
 viewport.append(renderer.domElement);
 const controls=Array.from(host.querySelectorAll<HTMLButtonElement>('[data-scene-mode]'));
 let choice=controls[0]?.dataset.sceneMode||'scroll';
 let paused=document.documentElement.dataset.motion==='paused';let visible=false;let destroyed=false;
 let progress=0,smooth=0,time=0,last=performance.now();const pointer={x:0,y:0};
 const journeyElement=host.closest<HTMLElement>('[data-journey]');
 const trigger=journeyElement||host.closest<HTMLElement>('section')||host;
 const journey=ScrollTrigger.create({trigger,start:journeyElement?'top top':'top bottom',end:journeyElement?'bottom bottom':'bottom top',invalidateOnRefresh:true,onUpdate:self=>{progress=self.progress;host.dataset.scrollProgress=progress.toFixed(3)}});
 progress=journey.progress;smooth=progress;
 const phases:string[]=JSON.parse(host.dataset.phases||'[]');const phaseLabel=host.querySelector<HTMLElement>('[data-phase]');
 const render=(stamp:number,force=false)=>{
  if(destroyed||(!force&&(!visible||document.hidden)))return;
  const dt=Math.min(Math.max(0,(stamp-last)/1000),.04);last=stamp;
  if(!paused){time+=dt;smooth=THREE.MathUtils.damp(smooth,progress,10,dt);}
  const state:SceneState={progress:smooth,time,choice,pointer,aspect:camera.aspect,paused};
  effect.update(state);renderer.render(scene,camera);
  host.dataset.renderProgress=smooth.toFixed(3);host.dataset.mode=choice;
  const index=Math.min(2,Math.floor(smooth*3));host.dataset.phase=String(index);
  if(phaseLabel&&phases[index])phaseLabel.textContent=phases[index];
 };
 const loop=()=>{host.dataset.renderActive=String(visible&&!document.hidden&&!paused);last=performance.now();renderer.setAnimationLoop(visible&&!document.hidden&&!paused?stamp=>render(stamp):null);if(visible&&!document.hidden)render(last,true);};
 const resize=()=>{const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render(performance.now(),true);};
 const ro=new ResizeObserver(resize);ro.observe(viewport);resize();
 const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);loop();});io.observe(host);
 document.addEventListener('visibilitychange',loop,{signal});
 host.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const box=host.getBoundingClientRect();pointer.x=(e.clientX-box.left)/box.width-.5;pointer.y=(e.clientY-box.top)/box.height-.5;},{signal});
 host.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;},{signal});
 const pauseButton=host.querySelector<HTMLButtonElement>('.scene-pause');
 const syncPause=()=>{if(pauseButton){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.textContent=paused?pauseButton.dataset.resume!:pauseButton.dataset.pause!;}loop();};
 if(pauseButton){pauseButton.disabled=false;pauseButton.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('lumux:motion',{detail:!paused})),{signal});}
 window.addEventListener('lumux:motion',event=>{paused=(event as CustomEvent<boolean>).detail;syncPause();},{signal});
 controls.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{choice=button.dataset.sceneMode!;controls.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render(performance.now(),true);},{signal});});
 const cleanup=()=>{if(destroyed)return;destroyed=true;renderer.setAnimationLoop(null);journey.kill();io.disconnect();ro.disconnect();abort.abort();effect.dispose?.();disposeObjects();renderer.dispose();renderer.domElement.remove();controls.forEach(b=>b.disabled=true);if(pauseButton)pauseButton.disabled=true;fallback();};
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cleanup();},{signal});
 window.addEventListener('pagehide',cleanup,{once:true,signal});reduced.addEventListener('change',event=>{if(event.matches){cleanup();reduced.addEventListener('change',next=>{if(!next.matches&&host.isConnected)runScene(host,build);},{once:true});}},{signal});
 host.dataset.render='webgl';host.classList.add('is-live');if(status)status.textContent='';syncPause();
 return cleanup;
}
