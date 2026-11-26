/* Prototype autonome : les données territoriales et liens viennent du site CRESS. */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const base = 'https://www.cresscentre.org';
const departments = {'18':'Cher','28':'Eure-et-Loir','36':'Indre','37':'Indre-et-Loire','41':'Loir-et-Cher','45':'Loiret'};
const resources = [
 {title:'Les chiffres clés de l’emploi de l’ESS en Centre-Val de Loire',type:'Étude',description:'Panorama · Économie et emploi · Échelle régionale',url:'/ressources/panorama-les-chiffres-cles-de-lemploi-de-less-en-centre-val-de-loire/'},
 {title:'Les fiches de votre territoire',type:'Fiche territoriale',description:'Départements et EPCI · Emplois et établissements',url:'/epci/'},
 {title:'Créer son activité dans l’économie sociale et solidaire',type:'Guide',description:'Panorama pratique · Entrepreneuriat ESS',url:'/ressources/6515-2/'},
 {title:'L’égalité femme-homme au sein de l’emploi de l’ESS',type:'Étude',description:'Panorama · Égalité professionnelle',url:'/ressources/panorama-legalite-femme-homme-au-sein-de-lemploi-de-less/'},
 {title:'L’ESS en chiffres : les indicateurs régionaux',type:'Indicateurs',description:'Observatoire régional · Emploi et secteurs d’activité',url:'/nos-etudes/'}
];
function makeResource(item) {
 const link = document.createElement('a'); link.className = 'resource-result'; link.href = base + item.url;
 const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('class','icon'); svg.setAttribute('aria-hidden','true');
 const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#document'); svg.append(use);
 const content = document.createElement('div'); const type = document.createElement('small'); type.textContent = item.type;
 const title = document.createElement('h3'); title.textContent = item.title; const desc = document.createElement('p'); desc.textContent = item.description;
 content.append(type,title,desc); link.append(svg,content); return link;
}
function filterResources() {
 const query = normalise($('#resource-query').value.trim()); const type = $('#resource-type').value;
 const found = resources.filter(r => (type === 'all' || r.type === type) && normalise(`${r.title} ${r.type} ${r.description}`).includes(query));
 const visible = query || type !== 'all' ? found : found.filter(r => r !== resources[0]).slice(0,3);
 $('#resource-results').replaceChildren(...visible.map(makeResource));
 $('#resource-count').textContent = query || type !== 'all' ? `${found.length} ressource${found.length > 1 ? 's' : ''} dans cette sélection` : 'Une sélection des publications et ressources de la CRESS';
 if (!found.length) {const p = document.createElement('p');p.className='empty-state';p.textContent='Aucun document dans cette sélection. Essayez un autre mot-clé ou réinitialisez les filtres.';$('#resource-results').append(p);}
 $('.publication-feature').hidden = Boolean(query || type !== 'all');
 $('.resource-layout').classList.toggle('is-filtered', Boolean(query || type !== 'all'));
}
$('#resource-query').addEventListener('input',filterResources);$('#resource-type').addEventListener('change',filterResources);
$('#reset-resources').addEventListener('click',()=>{$('#resource-query').value='';$('#resource-type').value='all';filterResources();$('#resource-query').focus();});
filterResources();
const coords = {"18": [306, 321], "28": [181, 102], "36": [204, 369], "37": [106, 289], "41": [188, 230], "45": [289, 181]};
const map = document.createElementNS('http://www.w3.org/2000/svg','svg');map.setAttribute('viewBox','0 0 490 465');map.setAttribute('role','group');map.setAttribute('aria-label','Choisir un des six départements du Centre-Val de Loire');
for (const [code,path] of Object.entries(window.CRESS_DATA.paths)) {
 const group=document.createElementNS('http://www.w3.org/2000/svg','g');
 const shape=document.createElementNS('http://www.w3.org/2000/svg','path');shape.setAttribute('d',path);shape.setAttribute('class','dept');shape.setAttribute('data-code',code);shape.setAttribute('role','button');shape.setAttribute('tabindex','0');shape.setAttribute('aria-label',`${code} · ${departments[code]}`);shape.setAttribute('aria-pressed',code==='45'?'true':'false');
 const choose=()=>{$('#department').value=code;changeDepartment();};shape.addEventListener('click',choose);shape.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
 group.append(shape);const [x,y]=coords[code];
 for(const [text,dy,cls] of [[code,0,'dept-code'],[departments[code],19,'dept-label']]) {const label=document.createElementNS('http://www.w3.org/2000/svg','text');label.setAttribute('x',x);label.setAttribute('y',y+dy);label.setAttribute('class',cls);label.textContent=text;group.append(label);}
 map.append(group);
}
for (const label of [...map.querySelectorAll('text')]) map.append(label);
$('#region-map').append(map);
function updateTerritory() {const option=$('#epci').selectedOptions[0];$('#territory-name').textContent=option.textContent;$('#territory-link').href=option.value;}
function changeDepartment() {
 const code=$('#department').value;const list=window.CRESS_DATA.territories[code];
 $('#epci').replaceChildren(...list.map(item=>new Option(item.name,item.url)));
 const preferred=list.find(r=>/Orléans|Bourges Plus|Chartres Métropole|Chateauroux|Tours Métropole|Blois Agglopolys/.test(r.name));
 if(preferred)$('#epci').value=preferred.url;
 $$('.dept').forEach(el=>el.setAttribute('aria-pressed',el.dataset.code===code?'true':'false'));updateTerritory();
}
$('#department').addEventListener('change',changeDepartment);$('#epci').addEventListener('change',updateTerritory);changeDepartment();
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('is-open',open);});
$$('#navigation a').forEach(a=>a.addEventListener('click',()=>{$('#navigation').classList.remove('is-open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
const searchIndex=[
 ...resources.map(r=>({...r,description:r.type,url:base+r.url})),
 {title:'Le Dispositif local d’accompagnement (DLA)',description:'Accompagnement · Consolider une structure ESS',url:base+'/dispositif-local-daccompagnement-en-region-centre/'},
 {title:'Créer et développer un projet ESS',description:'Entrepreneuriat · Accompagnement',url:base+'/entreprendre-ess/'},
 {title:'Se former et comprendre l’ESS',description:'Formations et sensibilisation',url:base+'/sensibilisation-jeunes/'},
 {title:'Adhérer à la CRESS',description:'Réseau · Adhésion',url:base+'/adherer-a-la-cress/'},
 {title:'Achats publics responsables',description:'Agenda · 2 décembre 2026 · LAB’O',url:base+'/events/rencontre-achats-publics-responsables/'},
 ...Object.entries(window.CRESS_DATA.territories).flatMap(([code,list])=>list.map(r=>({title:r.name,description:`Fiche territoriale · ${departments[code]}`,url:r.url})))
];
function globalSearch(){$('#official-search').href=base+'/?s='+encodeURIComponent($('#global-query').value.trim());const q=normalise($('#global-query').value.trim());const found=(q?searchIndex.filter(r=>normalise(r.title+' '+r.description).includes(q)):searchIndex.slice(0,4)).slice(0,8);$('#global-results').replaceChildren(...found.map(r=>{const a=document.createElement('a');a.href=r.url;a.textContent=r.title;const small=document.createElement('small');small.textContent=r.description;a.append(small);return a;}));if(!found.length){const p=document.createElement('p');p.textContent='Aucun résultat dans cette sélection. Essayez un autre mot-clé dans la recherche du concept.';$('#global-results').append(p);}}
$('.search-toggle').addEventListener('click',()=>{$('#search-dialog').showModal();globalSearch();$('#global-query').focus();});$('#global-query').addEventListener('input',globalSearch);
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));$$('dialog').forEach(d=>{d.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();d.close();}});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$('#accessibility-info').addEventListener('click',()=>{$('#info-title').textContent='Une accessibilité pensée dès la conception';$('#info-content').innerHTML='<p>Cette maquette intègre une navigation au clavier, des liens d’évitement, des champs étiquetés, des états de focus visibles, des titres structurés et des alternatives textuelles aux images.</p><p>La sélection par département et EPCI reste accessible sans utiliser la carte. Les fenêtres peuvent être fermées avec la touche Échap.</p><p>Cette proposition n’a pas fait l’objet d’un audit RGAA complet. Aucun niveau de conformité n’est revendiqué. Un audit et des tests utilisateurs seront nécessaires sur le futur site.</p>';$('#info-dialog').showModal();});
$('#design-info').addEventListener('click',()=>{$('#info-title').textContent='Concept indépendant de José Giovinazzo';$('#info-content').innerHTML='<p>Proposition réalisée par José Giovinazzo dans le cadre de sa candidature freelance à l’appel à prestataires 2026 de la CRESS Centre-Val de Loire. Maquette non officielle, non validée par la CRESS. La CRESS ne publie pas cette démonstration.</p><p>La conception s’appuie sur le <a href="https://www.cresscentre.org/">site institutionnel actuel</a> et son <a href="https://www.cresscentre.org/wp-content/uploads/2026/11/CDC-V1.pdf">cahier des charges</a>, consultés le 23 novembre 2026. Les textes éditoriaux proposés ne constituent pas une communication officielle.</p><p>La recherche et les filtres fonctionnent sur des données locales de démonstration, non exhaustives et sans actualisation en temps réel. Les liens de services, fiches, publications, adhésion et newsletter ouvrent des aperçus locaux. Les sources officielles sont accessibles uniquement par un bouton externe explicite. Cette maquette ne traite aucune inscription, adhésion ou demande de contact et ne fournit pas une administration WordPress.</p><p>Le concept ne comporte aucun formulaire de collecte, outil de mesure d’audience ou cookie applicatif. Il est hébergé sur GitHub Pages ; les traitements techniques de cet hébergeur relèvent de sa <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement">politique de confidentialité</a>.</p><p>Les crédits des visuels sont accessibles depuis le pied de page. Les quatre photographies proviennent de Pexels et leur licence de réutilisation a été vérifiée. Elles sont identifiées comme des illustrations, sans lien avec les acteurs ou événements cités. La couverture documentaire est un visuel original de maquette.</p>';$('#info-dialog').showModal();});
$('#credits-info').addEventListener('click',()=>{$('#info-title').textContent='Crédits et droits des visuels';$('#info-content').replaceChildren($('#credits-content').content.cloneNode(true));$('#info-dialog').showModal();});
