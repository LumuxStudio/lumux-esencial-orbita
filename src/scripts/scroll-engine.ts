import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import raw from '../content/motion.json';
import {motionSchema} from '../lib/motion-settings';
export {gsap,ScrollTrigger};
gsap.registerPlugin(ScrollTrigger);gsap.ticker.lagSmoothing(0);

export function startMotion(choreograph:()=>void){
 const settings=motionSchema.parse(raw);const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');const abort=new AbortController();const signal=abort.signal;
 let lenis:Lenis|null=null;let context:gsap.Context|null=null;let tick:((time:number)=>void)|null=null;
 let paused=false,introduced=false;
 const stop=()=>{context?.revert();context=null;if(tick)gsap.ticker.remove(tick);tick=null;lenis?.destroy();lenis=null;delete root.dataset.lenis;delete root.dataset.gsap;};
 const start=()=>{
  if(paused||reduced.matches)return;
  lenis=new Lenis({lerp:settings.lerp,wheelMultiplier:settings.wheelMultiplier,smoothWheel:true,syncTouch:false,autoRaf:false,anchors:false,prevent:node=>node instanceof HTMLElement&&node.matches('textarea,[data-lenis-prevent]')});
  lenis.on('scroll',ScrollTrigger.update);tick=t=>{if(!document.hidden)lenis?.raf(t*1000)};gsap.ticker.add(tick);
  context=gsap.context(()=>{
   if(!introduced){gsap.from('[data-intro]',{y:35,opacity:0,duration:1.05,stagger:.09,ease:'power3.out'});introduced=true;}
   document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{y:42,opacity:.35,ease:'none',scrollTrigger:{trigger:el,start:'top 96%',end:'top 66%',scrub:.45}}));
   document.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach(path=>{const length=path.getTotalLength();gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:path.closest('svg'),start:'top 94%',end:'bottom 35%',scrub:.7}});});
   document.querySelectorAll<HTMLElement>('[data-parallax]').forEach(img=>gsap.fromTo(img,{scale:1.12,yPercent:-5},{scale:1.12,yPercent:5,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:.65}}));
   choreograph();
  });
  root.dataset.lenis='ready';root.dataset.gsap='ready';ScrollTrigger.refresh();
 };
 const sync=()=>{root.dataset.motion=reduced.matches?'reduced':paused?'paused':'active';document.querySelectorAll<HTMLButtonElement>('.motion-control').forEach(b=>{b.disabled=reduced.matches;b.setAttribute('aria-pressed',String(paused));b.textContent=paused?b.dataset.resume!:b.dataset.pause!;});};
 document.querySelectorAll<HTMLButtonElement>('.motion-control').forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('lumux:motion',{detail:!paused})),{signal}));
 window.addEventListener('lumux:motion',event=>{const next=(event as CustomEvent<boolean>).detail;if(next===paused)return;const y=scrollY;paused=next;stop();if(!paused)start();window.scrollTo({top:y,behavior:'instant'});sync();ScrollTrigger.refresh();},{signal});
 reduced.addEventListener('change',()=>{paused=false;stop();start();sync();window.dispatchEvent(new CustomEvent('lumux:motion',{detail:reduced.matches}));},{signal});
 document.addEventListener('click',event=>{const a=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const target=document.getElementById(a.hash.slice(1));if(!target)return;const menu=a.closest<HTMLDetailsElement>('.mobile-menu');if(menu)menu.open=false;
  if(!lenis)return;event.preventDefault();const skip=a.classList.contains('skip');lenis.scrollTo(target,{offset:skip?0:-24,immediate:skip,onComplete:()=>{history.pushState(null,'',a.hash);if(!target.hasAttribute('tabindex'))target.tabIndex=-1;target.focus({preventScroll:true});}});
 },{signal});
 document.querySelectorAll<HTMLDetailsElement>('details').forEach(item=>item.addEventListener('toggle',()=>{requestAnimationFrame(()=>{lenis?.resize();ScrollTrigger.refresh();});},{signal}));
 const menu=document.querySelector<HTMLDetailsElement>('.mobile-menu');document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary')?.focus();}},{signal});
 const refresh=()=>{lenis?.resize();ScrollTrigger.refresh();};document.fonts.ready.then(refresh);window.addEventListener('load',refresh,{once:true,signal});
 // Responsive composition changes preserve the same choreography and input mapping.
 const observer=new ResizeObserver(refresh);observer.observe(document.body);
 start();sync();window.addEventListener('pagehide',()=>{abort.abort();observer.disconnect();stop();},{once:true});
}
