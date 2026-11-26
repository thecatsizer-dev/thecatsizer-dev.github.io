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
