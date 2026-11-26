import '../studio.js?v=20261126-motion3';
// Portfolio pages are fully translated at build time. Only the two motion
// labels need a tiny runtime dictionary; municipal forms keep their own runtime.
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-language]');
 if(link){
  try{localStorage.setItem('thecatsizerlab-language',link.dataset.language);}catch{}
  if(location.search||location.hash)link.href=link.getAttribute('href')+location.search+location.hash;
 }
});
document.documentElement.dataset.i18nReady='true';
import('../analytics/analytics.js').catch(() => {});
