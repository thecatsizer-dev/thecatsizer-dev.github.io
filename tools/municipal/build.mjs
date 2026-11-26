import {language,localizedPath} from '../../assets/i18n/runtime.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {seed,pagePaths} from '../../demos/municipal-website/src/data.js';
import {header,footer} from '../../demos/municipal-website/src/layout.js';
import {renderPage,intro} from '../../demos/municipal-website/src/render.js';
import {esc,BASE,mark,photo} from '../../demos/municipal-website/src/shared.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(root,'demos/municipal-website');
const routes=[['','home','Valmer-sur-Rive, une ville à vivre','Portail municipal fictif : démarches, actualités, agenda et vie locale. Démonstration indépendante TheCatsizerLab.']];
for(const p of seed.pages)routes.push([pagePaths[p.id],'page:'+p.id,p.title,p.intro]);
for(const n of seed.news)routes.push(['actualites/'+n.id,'news:'+n.id,n.title,n.intro]);
for(const e of seed.events)routes.push(['agenda/'+e.id,'event:'+e.id,e.title,e.intro]);
for(const e of seed.directory)routes.push(['annuaire/'+e.id,'place:'+e.id,e.title,e.intro]);
routes.push(...[
 ['actualites','news','Actualités','Les informations et projets de la commune fictive.'],['actualites/article','article','Une actualité de Valmer','Article de la démonstration municipale.'],
 ['agenda','agenda','L’agenda','Liste, calendrier et programmes des événements fictifs.'],['agenda/evenement','event','Un rendez-vous à Valmer','Les informations pratiques d’un événement fictif.'],
 ['annuaire','directory','L’annuaire','Services, associations, commerces et équipements fictifs.'],['annuaire/fiche','directory-detail','Un lieu de Valmer','Fiche de l’annuaire municipal de démonstration.'],
 ['carte','map','La carte du territoire','Plan interactif original et fictif des lieux de Valmer.'],['demarches/salles','booking','Réserver une salle','Choix de salle, disponibilités simulées et suivi local.'],
 ['demarches/rendez-vous','appointment','Prendre rendez-vous','Un service, une date et un créneau dans une simulation sans données personnelles.'],['demarches/signalement','signal','Signaler un problème','Signalement fictif avec localisation sur un plan et photo d’exemple.'],
 ['espace-citoyen','citizen','Mon espace citoyen','Suivi local des demandes, rendez-vous et réservations de démonstration.'],['recherche','search','Rechercher','Rechercher une information sur le portail municipal fictif.'],
 ['contact','contact','Horaires et contact','Coordonnées fictives et annuaire des services de Valmer.'],['decouvrir/galerie','gallery','Regards sur Valmer','Une galerie de photographies d’illustration sous licence.'],
 ['plan-du-site','sitemap','Plan du site','Toutes les rubriques de la démonstration municipale.'],['mentions-legales','mentions-legales','Mentions légales','Concept indépendant de commune fictive, réalisé par TheCatsizerLab.'],
 ['confidentialite','confidentialite','Confidentialité','Aucune transmission de dossiers : persistance de démonstration dans le navigateur.'],['accessibilite','accessibilite','Accessibilité','Démarche d’accessibilité du concept, sans revendication de conformité RGAA complète.'],
 ['page','custom-page','Une page de Valmer','Contenu éditorial local de la démonstration.'],['administration','admin','L’atelier municipal','Administration de démonstration locale : contenus, agenda et demandes citoyennes.'],['credits','credits','Crédits photographiques','Sources, auteurs, licences et adaptations des photographies d’illustration.']
]);
const imageTitles={panorama:'La rivière et le bourg',market:'Le marché',townhall:'L’hôtel de ville',oldtown:'Le village',school:'L’école',culture:'La musique',heritage:'Le patrimoine',nature:'Les paysages',sport:'Le sport',shops:'Les commerces',park:'Le parc', 'oldtown-street':'Les rues anciennes',library:'La médiathèque',works:'Les travaux'};
const manifest=JSON.parse(await fs.readFile(path.join(dir,'assets/manifest.json'),'utf8'));
const credits=`${intro('Crédits photographiques','Des photographies réelles, pour un territoire imaginaire.')}<section class="container listing-section"><div class="prose"><p>Valmer-sur-Rive n’existe pas. Ces images de lieux réels illustrent le concept et ne constituent pas un reportage sur la commune fictive. Leurs lieux d’origine sont précisés dans les sources.</p><p>Les fichiers ont été redimensionnés, convertis et compressés en WebP. Les adaptations conservent la licence de leur source, y compris les obligations de partage dans les mêmes conditions lorsqu’elles s’appliquent. Les recadrages d’affichage sont effectués en CSS.</p></div><div class="credits-grid">${Object.entries(manifest).map(([key,m])=>`<article>${photo(key,m.description_fr||m.description||m.title)}<h2>${esc(imageTitles[key]||key)}</h2><p>${esc(m.description_fr||m.description||m.title)}</p><p>Auteur : <strong>${esc(m.author)}</strong></p><p><a href="${esc(m.source)}" target="_blank" rel="noopener">Photographie d’origine</a> · <a href="${esc(m.license_url)}" target="_blank" rel="noopener">${esc(m.license)}</a></p><p class="small-note">${esc(m.changes)}</p></article>`).join('')}</div><p>Typographies locales : Inter et Newsreader, sous licence SIL Open Font License. <a href="/assets/fonts/inter-OFL.txt">Licence Inter</a> · <a href="${BASE}assets/OFL.txt">Licence Newsreader</a>.</p></section>`;
const build=[];
for(const [pathname,route,title,description] of routes){
 let content=route==='credits'?credits:route==='admin'?`${intro('L’atelier municipal','L’administration locale de démonstration se prépare.')}<p class="container">JavaScript est nécessaire pour modifier les contenus. Aucun compte réel n’est requis.</p>`:renderPage(route,seed);
 // A disabled fieldset prevents any accidental submission before the JS module is ready.
 content=content.replace(/(<form\b[^>]*id="(?:booking-form|signal-form|contact-form)"[^>]*>)([\s\S]*?)(<\/form>)/g,'$1<fieldset disabled class="script-fields">$2</fieldset>$3');
 const localPath=localizedPath(BASE+(pathname?pathname+'/':''));
 const canonical='https://thecatsizerlab.github.io'+localPath;
 const html=`<!doctype html>\n<html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173e4b"><title>${esc(title)} · Démonstration Valmer-sur-Rive</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)} — Concept TheCatsizerLab"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="https://thecatsizerlab.github.io${BASE}assets/panorama-960.webp"><meta property="og:url" content="${canonical}">${route==='admin'?'<meta name="robots" content="noindex,follow">':''}<link rel="icon" href="${BASE}assets/mark.svg" type="image/svg+xml"><link rel="preload" href="${BASE}assets/newsreader-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${BASE}assets/site.css"><link rel="stylesheet" href="/assets/i18n/language.css"><script type="module" src="${BASE}src/app.js"></script></head><body data-route="${route}">${header(BASE+(pathname?pathname+'/':''))}<main id="main"><div id="page-content">${content}</div><noscript><div class="container simulation-note">La lecture et la navigation restent disponibles. Les recherches, cartes, filtres et démarches simulées nécessitent JavaScript. Aucun formulaire de démonstration n’est envoyé sans JavaScript.</div></noscript></main>${footer()}</body></html>`;
 const target=path.join(dir,language==='fr'?'':language,pathname,'index.html');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,html);build.push({path:localPath,route,title});
}
await fs.writeFile(path.join(dir,'assets/mark.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" fill="none" color="#173e4b"><rect width="72" height="72" rx="8" fill="#f6f5ef"/>${mark.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]}</svg>`);
await fs.writeFile(path.join(dir,language==='fr'?'':language,'routes.json'),JSON.stringify(build,null,2));
console.log(`Generated ${build.length} complete municipal pages.`);
