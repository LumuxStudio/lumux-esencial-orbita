/* Hallmark · pre-emit critique: P5 H5 E5 S5 R4 V5 · portrait and landscape share each choreography */
import {startMotion,gsap,ScrollTrigger} from './scroll-engine';
startMotion(()=>{
  const hero=gsap.timeline({scrollTrigger:{trigger:'.orbital-hero',start:'top top',end:'bottom top',scrub:.6}});
  hero.to('.hero-copy',{yPercent:-15,opacity:.15,ease:'none'},0).to('.hero-bottom',{y:-30,opacity:0,ease:'none'},0);
  const type=document.querySelector<SVGTextPathElement>('[data-orbit-text]');
  if(type)gsap.fromTo(type,{attr:{startOffset:'6%'}},{attr:{startOffset:'46%'},ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.fromTo('.manifesto-svg',{rotation:-12},{rotation:12,ease:'none',scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:.8}});
  document.querySelectorAll<HTMLElement>('[data-poster]').forEach((poster,i)=>{
    const rotation=[-4,7,3][i];
    gsap.fromTo(poster,{rotation:rotation+(i%2?7:-7),rotationY:i%2?-15:15,y:70,scale:.9},{rotation,rotationY:0,y:0,scale:1,ease:'none',scrollTrigger:{trigger:poster,start:'top 96%',end:'top 26%',scrub:.65}});
    const image=poster.querySelector('img');if(image)gsap.fromTo(image,{scale:1.16,yPercent:-3},{scale:1.05,yPercent:3,ease:'none',scrollTrigger:{trigger:poster,start:'top bottom',end:'bottom top',scrub:.7}});
  });
  gsap.fromTo('.work-scribble',{rotation:-70},{rotation:70,ease:'none',scrollTrigger:{trigger:'.poster-wall',start:'top bottom',end:'bottom top',scrub:.8}});
  gsap.fromTo('.phase-meter span',{scaleX:.03},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.laboratory',start:'top top',end:'bottom bottom',scrub:.4}});
  gsap.fromTo('.lab-copy',{y:0},{y:-30,ease:'none',scrollTrigger:{trigger:'.laboratory',start:'top top',end:'bottom bottom',scrub:.65}});
  gsap.fromTo('.notes-arrow',{rotation:-10,y:20},{rotation:10,y:-10,ease:'none',scrollTrigger:{trigger:'.notes',start:'top bottom',end:'bottom top',scrub:.7}});
  gsap.fromTo('.brief-asterisk',{rotation:-30},{rotation:70,ease:'none',scrollTrigger:{trigger:'.brief-section',start:'top bottom',end:'bottom top',scrub:1}});
});
const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-service]'));
const panels=Array.from(document.querySelectorAll<HTMLElement>('[data-service-panel]'));
const nodes=Array.from(document.querySelectorAll<SVGElement>('[data-network-node]'));
const select=(index:string)=>{
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.service===index)));
  panels.forEach(p=>{p.hidden=p.dataset.servicePanel!==index;});
  nodes.forEach(n=>n.dataset.active=String(n.dataset.networkNode===index));
  ScrollTrigger.refresh();
};
buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.service!)));select('0');
