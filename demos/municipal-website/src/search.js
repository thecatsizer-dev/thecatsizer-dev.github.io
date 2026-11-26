import {t,intlLocale} from '../../../assets/i18n/runtime.js';
import {normalize,url} from './shared.js';
import {pagePaths,newsItems,events,directory} from './data.js';
const seededNews=new Set(newsItems.map(n=>n.id));
export const newsURL=n=>seededNews.has(n.id)?url('actualites/'+n.id):url('actualites/article')+'?id='+encodeURIComponent(n.id);
const seededEvents=new Set(events.map(n=>n.id));
const seededPlaces=new Set(directory.map(n=>n.id));
export const searchAliases=n=>t(({'hotel-ville':'mairie hôtel de ville','service-urbanisme':'urbanisme logement',mediatheque:'bibliothèque médiathèque','ecole-bourg':'école inscription','parc-sportif':'sport loisirs','jardin-avelines':'parc jardin nature','cours-plus-fraiches':'école inscription','atelier-ecoles':'école inscription',education:'école inscription','sports-ouverts':'sport loisirs'})[n.id]||'');
export const eventURL=n=>seededEvents.has(n.id)?url('agenda/'+n.id):url('agenda/evenement')+'?id='+encodeURIComponent(n.id);
export const directoryURL=n=>seededPlaces.has(n.id)?url('annuaire/'+n.id):url('annuaire/fiche')+'?id='+encodeURIComponent(n.id);
export function searchIndex(state){
 const live=type=>state[type].filter(x=>x.status==='published');
 return [
 ...live('pages').map(p=>({...p,type:'Pages et services',href:url(pagePaths[p.id]||'page')+(pagePaths[p.id]?'':'?id='+encodeURIComponent(p.id)),body:t(p.body)+' '+p.details?.map(s=>t(s.title)+' '+t(s.text)).join(' ')})),
 ...live('news').map(n=>({...n,type:'Actualités',href:newsURL(n),body:t(n.body)+' '+searchAliases(n)})),
 ...live('events').map(n=>({...n,type:'Agenda',href:eventURL(n),body:t(n.body)+' '+searchAliases(n)})),
 ...live('directory').map(n=>({...n,type:'Annuaire',href:directoryURL(n),body:t(n.body)+' '+searchAliases(n)})),
 ...[{title:'Réserver une salle municipale',intro:'Salles, capacités, équipements et disponibilités simulées.',href:url('demarches/salles')},{title:'Prendre rendez-vous',intro:'État civil, urbanisme, enfance et vie municipale.',href:url('demarches/rendez-vous')},{title:'Signaler un problème',intro:'Voirie, éclairage, propreté et espaces verts.',href:url('demarches/signalement')},{title:'Horaires et contacts',intro:'Annuaire des services et contact de démonstration.',href:url('contact')}].map((n,i)=>({...n,id:'service-'+i,type:'Pages et services'}))
 ];
}
export function search(state,query,type='Tous'){
 const q=normalize(query).trim();const words=q.split(/\s+/).filter(Boolean).slice(0,12);
 return searchIndex(state).filter(n=>type==='Tous'||n.type===type).map(n=>{
  const title=normalize(t(n.title)),intro=normalize(t(n.intro)),body=normalize(t(n.body));
  const hay=title+' '+intro+' '+body;
  if(words.length&&!words.every(w=>hay.includes(w)))return null;
  const score=(title===q?50:title.startsWith(q)&&q?20:0)+words.reduce((a,w)=>a+(title.includes(w)?8:0)+(intro.includes(w)?3:0)+(body.includes(w)?1:0),0);
  return {...n,score};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||t(a.title).localeCompare(t(b.title),intlLocale));
}
