import {measurementId as id} from './config.js';
import {messages} from './messages.js';

// No Google connection, cookie or banner while the measurement ID is unset.
if (/^G-[A-Z0-9]+$/.test(id) && ['thecatsizerlab.github.io','thecatsizer-dev.github.io'].includes(location.hostname)) {
 const text=messages[document.documentElement.lang]||messages.en;
 const key='tcl.analytics-consent.v1',duration=180*24*60*60*1000;
 let saved=null,loaded=false;
 try {const value=JSON.parse(localStorage.getItem(key));if(value&&typeof value.allowed==='boolean'&&Date.now()-value.at>=0&&Date.now()-value.at<duration)saved=value;}catch{}
 const disable='ga-disable-'+id;window[disable]=true;
 const deny={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
 function clearCookies(){
  for(const item of document.cookie.split(';')){
   const name=item.split('=')[0].trim();if(!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name))continue;
   const domains=['',location.hostname,'.'+location.hostname],paths=['/'];
   let path='';for(const part of location.pathname.split('/').filter(Boolean)){path+='/'+part;paths.push(path,path+'/');}
   for(const domain of domains)for(const path of paths)document.cookie=name+'=; Max-Age=0; Path='+path+(domain?'; Domain='+domain:'')+'; SameSite=Lax; Secure';
  }
 }
 function start(){
  window[disable]=false;if(loaded)return;loaded=true;
  window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',deny);
  window.gtag('consent','update',{...deny,analytics_storage:'granted'});
  window.gtag('js',new Date());
  let referrer='';try{referrer=new URL(document.referrer).origin+'/';}catch{}
  window.gtag('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false,cookie_domain:'none',cookie_expires:15552000,cookie_update:false,page_location:location.origin+location.pathname,page_referrer:referrer,language:document.documentElement.lang});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script);
 }
 const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/analytics/analytics.css';document.head.append(css);
 const panel=document.createElement('section');panel.className='analytics-panel';panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','analytics-title');panel.hidden=true;
 const node=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
 const title=node('h2',text.title);title.id='analytics-title';panel.append(title,node('p',text.body));
 const details=document.createElement('details');details.append(node('summary',text.details));
 const notice=node('p',text.notice);notice.className='analytics-notice';const email=node('a','contact.thecatsizerlab@gmail.com');email.href='mailto:contact.thecatsizerlab@gmail.com';notice.append(' ',email,'. ');
 const google=node('a',text.google);google.href='https://policies.google.com/technologies/partner-sites';google.target='_blank';google.rel='noopener noreferrer';notice.append(google);details.append(notice);panel.append(details);
 const actions=document.createElement('div');actions.className='analytics-actions';const reject=node('button',text.reject),accept=node('button',text.accept);reject.type=accept.type='button';actions.append(reject,accept);panel.append(actions);
 const status=node('p','');status.className='analytics-sr';status.setAttribute('role','status');
 const settings=node('button',text.settings);settings.type='button';settings.className='analytics-settings';settings.setAttribute('aria-controls','analytics-title');settings.addEventListener('click',()=>{panel.hidden=false;reject.focus();});
 function choose(allowed){
  const wasLoaded=loaded;saved={allowed,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(saved));}catch{}
  if(allowed)start();else{window[disable]=true;clearCookies();}
  panel.hidden=true;status.textContent=text.saved;settings.focus();
  // A fresh page also removes an already-loaded Google library after withdrawal.
  if(!allowed&&wasLoaded)location.reload();
 }
 reject.addEventListener('click',()=>choose(false));accept.addEventListener('click',()=>choose(true));
 document.body.append(panel,status);(document.querySelector('.footer-links')||document.querySelector('.site-footer')||document.body).append(settings);
 if(saved?.allowed)start();else clearCookies();
 if(!saved&&navigator.globalPrivacyControl!==true)panel.hidden=false;
}
