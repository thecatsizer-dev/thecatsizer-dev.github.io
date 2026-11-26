export const languages=['fr','en','es','it','de'];
export const locales={fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',de:'de-DE'};
export const municipalBase='/demos/municipal-website/';
const inBrowser=typeof document!=='undefined';
export const language=(inBrowser?document.documentElement.lang:process.env.MUNICIPAL_LOCALE)||'fr';
export const intlLocale=locales[language]||locales.fr;
const catalogURL=new URL(`./locales/${language}.json`,import.meta.url);
export const catalog=inBrowser?await fetch(catalogURL).then(r=>{if(!r.ok)throw Error('Translation catalog unavailable');return r.json();}):JSON.parse(await (await import('node:fs/promises')).readFile(catalogURL,'utf8'));
const messages=catalog.messages||{};
const normalize=s=>String(s).replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
const escapeRegExp=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=Object.entries(messages).filter(([s])=>/\{\w+\}/.test(s)).map(([source,target])=>{
 const names=[];const parts=source.split(/(\{\w+\})/).map(p=>{if(/^\{\w+\}$/.test(p)){names.push(p);return '(.+?)';}return escapeRegExp(p);});
 return {expression:new RegExp('^'+parts.join('')+'$'),target,names};
});
export function t(value){
 if(value==null)return '';
 const raw=String(value),key=normalize(raw);
 if(!key)return raw;
 let translated=messages[key];
 if(translated===undefined){
  for(const p of patterns){const match=key.match(p.expression);if(match){translated=p.target;p.names.forEach((name,i)=>translated=translated.split(name).join(t(match[i+1])));break;}}
 }
 if(translated===undefined&&/\n\s*\n/.test(raw))return raw.split(/(\n\s*\n)/).map(p=>/^\s*$/.test(p)?p:t(p)).join('');
 if(translated===undefined){const numbered=key.match(/^(\d+\.\s+)(.+)$/);if(numbered)translated=numbered[1]+t(numbered[2]);}
 if(translated===undefined){
  for(const separator of [' · ',' — ',' | '])if(key.includes(separator)){translated=key.split(separator).map(t).join(separator);break;}
 }
 if(translated===undefined)return raw;
 return raw.match(/^\s*/)[0]+translated+raw.match(/\s*$/)[0];
}
const reverse=new Map(Object.entries(messages).filter(([s])=>!s.includes('{')).map(([s,v])=>[normalize(v),s]));
for(const source of catalog.municipalSources||[])if(messages[source]&&!source.includes('{'))reverse.set(normalize(messages[source]),source);
export const sourceText=value=>/\n\s*\n/.test(value)?value.split(/(\n\s*\n)/).map(p=>/^\s*$/.test(p)?p:sourceText(p)).join(''):reverse.get(normalize(value))||value;
export function localizedPath(href,lang=language){
 const hotelOrigin='https://thecatsizerlab.github.io/casa-suprana-hotel/';
 if(href?.startsWith(hotelOrigin)){const rest=href.slice(hotelOrigin.length).replace(/^(fr|en|it|es|de)\//,'');return /^(assets|src|docs|server|integrations)\//.test(rest)?hotelOrigin+rest:hotelOrigin+(lang==='fr'?'':lang+'/')+rest;}
 if(!href||/^(?:[a-z]+:|\/\/|#)/i.test(href))return href;
 const [,pathname,suffix]=href.match(/^([^?#]*)([\s\S]*)$/);
 if(pathname.startsWith(municipalBase)&&!pathname.slice(municipalBase.length).match(/^(assets|src)\//)){
  const rest=pathname.slice(municipalBase.length).replace(/^(fr|en|es|it|de)\//,'');
  return municipalBase+(lang==='fr'?'':lang+'/')+rest+suffix;
 }
 const clean=pathname.replace(/^\/(fr|en|es|it|de)(?=\/)/,'');
 if(clean.startsWith('/assets/media/hotel/'))return clean.replace(/\/hotel\/(fr|en|it|es|de)\//,'/hotel/'+lang+'/')+suffix;
 if(clean==='/'||clean==='/index.html'||clean.startsWith('/projects/'))return (lang==='en'?'':'/'+lang)+clean+suffix;
 if(clean.startsWith('/assets/media/municipal/'))return clean.replace(/\/municipal\/(?:fr|en|es|it|de)\//,'/municipal/').replace('/municipal/','/municipal/'+(lang==='fr'?'':lang+'/'))+suffix;
 return href;
}
export function languageSelector(pathname,context='municipal'){
 const label={fr:'Langue',en:'Language',es:'Idioma',it:'Lingua',de:'Sprache'}[language];
 const names={fr:'Français',en:'English',es:'Español',it:'Italiano',de:'Deutsch'};
 return `<details class="language-picker"><summary aria-label="${label} : ${language.toUpperCase()}">${language.toUpperCase()}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><nav class="language-options" aria-label="${label}">${languages.map(lang=>`<a data-language="${lang}" href="${localizedPath(pathname,lang)}" lang="${lang}" hreflang="${lang}"${lang===language?' aria-current="true"':''}>${names[lang]}</a>`).join('')}</nav></details>`;
}
export function localize(root=document){
 if(!inBrowser)return;
 const elements=root.nodeType===1?[root,...root.querySelectorAll('*')]:[...root.querySelectorAll('*')];
 for(const el of elements){
  if(el.closest('script,style,.language-picker,code,pre'))continue;
  if(el.tagName==='OPTION'&&!el.hasAttribute('value'))el.setAttribute('value',el.textContent);
  for(const attr of ['alt','aria-label','placeholder','title'])if(el.hasAttribute(attr)){const old=el.getAttribute(attr),next=t(old);if(next!==old)el.setAttribute(attr,next);}
  if(el.matches('a[href]')){const old=el.getAttribute('href'),next=localizedPath(old);if(next!==old)el.setAttribute('href',next);}
  if(el.matches('img[src]')){const old=el.getAttribute('src'),next=localizedPath(old);if(next!==old)el.setAttribute('src',next);}
  if(el.matches('input[name="title"],input[name="intro"],input[name="hours"],input[name="equipment"]')&&!el.dataset.localizedValue){el.value=t(el.value);el.dataset.localizedValue='true';}
  if(el.tagName==='TEXTAREA'&&!el.dataset.localizedValue){el.value=t(el.value);el.textContent=el.value;el.dataset.localizedValue='true';}
  for(const node of [...el.childNodes])if(node.nodeType===3){const next=t(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}
 }
}
export function installLocalization(){
 localize(document);
 const observer=new MutationObserver(records=>{const roots=new Set();for(const record of records)roots.add(record.type==='characterData'?record.target.parentElement:record.target);for(const root of roots)if(root?.isConnected)localize(root);});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 document.addEventListener('invalid',event=>{const input=event.target;if(!input.setCustomValidity)return;const key=input.validity.valueMissing?(input.type==='checkbox'?'Confirmez ce choix pour continuer.':input.matches('select,input[type="radio"]')?'Choisissez une valeur.':'Renseignez ce champ.'):'Vérifiez la valeur saisie.';input.setCustomValidity(t(key));},true);
 const clearValidity=event=>{const input=event.target;if(input.setCustomValidity)input.setCustomValidity('');if(input.type==='radio'&&input.form)for(const item of input.form.elements)if(item.name===input.name&&item.setCustomValidity)item.setCustomValidity('');};
 document.addEventListener('input',clearValidity);document.addEventListener('change',clearValidity);
 document.addEventListener('click',event=>{const link=event.target.closest('[data-language]');if(link){try{localStorage.setItem('thecatsizerlab-language',link.dataset.language);}catch{}if(location.search||location.hash)link.href=link.getAttribute('href')+location.search+location.hash;}document.querySelectorAll('.language-picker[open]').forEach(p=>{if(!p.contains(event.target))p.open=false;});});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.language-picker[open]').forEach(p=>{p.open=false;p.querySelector('summary').focus();});});
 document.documentElement.dataset.i18nReady='true';
}
