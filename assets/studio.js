import {messages} from './i18n/studio-messages.js';
const language=document.documentElement.lang;
const t=value=>messages[language]?.[value]||value;

const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#studio-navigation');
function closeMenu(){toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.nav'))closeMenu();for(const picker of document.querySelectorAll('.language-picker[open]'))if(!picker.contains(event.target))picker.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}for(const picker of document.querySelectorAll('.language-picker[open]')){picker.open=false;picker.querySelector('summary').focus();}}});
matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const motion=document.querySelector('.motion-toggle');
motion?.addEventListener('click',()=>{const paused=motion.getAttribute('aria-pressed')!=='true';motion.setAttribute('aria-pressed',String(paused));document.body.classList.toggle('motion-paused',paused);motion.textContent=t(paused?'Resume animations':'Pause animations');});
if(!reduced.matches&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('awaiting');observer.unobserve(entry.target);}},{rootMargin:'0px 0px 60px 0px',threshold:.03});
 document.body.classList.add('motion-ready');
 for(const item of document.querySelectorAll('[data-reveal]')){if(item.getBoundingClientRect().top>innerHeight){item.classList.add('awaiting');observer.observe(item);}}
}

// Real, localized project previews. Native scrolling remains available throughout.
const rail=document.querySelector('.studio-projects');
const cards=rail?[...rail.querySelectorAll('.studio-project')]:[];
const count=document.querySelector('.rail-position');
let railVisible=false,hovered=false,interactingUntil=0;
if(rail){
 rail.removeAttribute('data-reveal');
 cards.forEach(card=>card.classList.remove('awaiting'));
 count?.setAttribute('aria-live','off');
 const current=()=>rail.scrollWidth>rail.clientWidth&&rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-3?cards.length-1:cards.reduce((best,card,i)=>Math.abs(card.offsetLeft-rail.scrollLeft-parseFloat(getComputedStyle(rail).paddingLeft))<Math.abs(cards[best].offsetLeft-rail.scrollLeft-parseFloat(getComputedStyle(rail).paddingLeft))?i:best,0);
 const move=direction=>{const index=current();const target=cards[(index+direction+cards.length)%cards.length];rail.scrollTo({left:target.offsetLeft-parseFloat(getComputedStyle(rail).paddingLeft),behavior:reduced.matches?'instant':'smooth'});};
 for(const [selector,direction] of [['.rail-prev',-1],['.rail-next',1]])document.querySelector(selector)?.addEventListener('click',()=>{interactingUntil=Date.now()+15000;move(direction);});
 rail.addEventListener('scroll',()=>{if(count)count.textContent=String(current()+1).padStart(2,'0')+' / '+cards.length;},{passive:true});
 rail.addEventListener('pointerenter',()=>hovered=true);rail.addEventListener('pointerleave',()=>hovered=false);
 for(const event of ['pointerdown','touchstart','wheel','keydown'])rail.addEventListener(event,()=>interactingUntil=Date.now()+15000,{passive:true});
 rail.addEventListener('keydown',event=>{if(event.target===rail&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{railVisible=entries[0].isIntersecting;},{threshold:.15}).observe(rail);
 setInterval(()=>{if(railVisible&&!hovered&&!rail.contains(document.activeElement)&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('motion-paused')&&Date.now()>interactingUntil)move(1);},5500);
}
const reel=document.querySelector('.project-reel');
if(reel&&'IntersectionObserver' in window)new IntersectionObserver(entries=>reel.classList.toggle('reel-offscreen',!entries[0].isIntersecting)).observe(reel);
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('document-hidden',document.hidden));
