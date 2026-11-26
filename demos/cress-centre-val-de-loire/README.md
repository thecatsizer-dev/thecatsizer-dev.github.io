# CRESS Centre-Val de Loire — proposition de refonte 2026–2027

Maquette haute fidélité et prototype responsive de la page d’accueil, réalisés par **José Giovinazzo** pour sa candidature freelance à l’appel à prestataires 2026. **Concept indépendant, non officiel, non validé par la CRESS.**

Le bandeau d’ouverture et le pied de page distinguent explicitement cette proposition du véritable site institutionnel. Le design, les huit sections, les quatre parcours et les fonctionnalités de la proposition initiale sont conservés. Les logos des soutiens de la CRESS n’expriment aucun soutien à cette candidature.

## Consulter les livrables

- [Ouvrir la maquette interactive](./index.html)
- [Accueil desktop complet, 1440 px](./deliverables/desktop-1440.png)
- [Accueil mobile complet, 390 px](./deliverables/mobile-390.png)
- [Maquette desktop en PDF](./deliverables/maquette-desktop.pdf)
- [Maquette mobile en PDF](./deliverables/maquette-mobile.pdf)
- [Rapport de vérification de l’accueil](./deliverables/verification.json)
- [Recette des 111 destinations et aperçus](./deliverables/navigation-verification.json)
- [Exemple d’aperçu service, desktop](./deliverables/apercu-service-desktop.png)
- [Exemple d’aperçu territorial, mobile](./deliverables/apercu-territoire-mobile.png)
- [Crédits et statut des droits des visuels](./CREDITS-VISUELS.md)

Le prototype fonctionne sans installation ni compilation. Ouvrir `index.html` dans un navigateur, ou lancer `python -m http.server 4174` dans ce dossier. Les images, polices et données sont locales. Les liens de détail ouvrent désormais des aperçus internes. La sortie vers une source officielle nécessite un clic sur le bouton « Ouvrir le site officiel (externe) ».

## Principaux choix UX/UI

**Entrer par un besoin.** Quatre accès immédiats orientent les porteurs de projets, structures ESS, collectivités et personnes recherchant des études. La navigation distingue comprendre, être accompagné, explorer un territoire et s’informer, conformément au principe directeur du cahier des charges.

**Moderniser l’identité existante.** Le logo officiel CRESS/ESS est conservé dans son intégralité. Le bleu institutionnel `#00628b`, le cyan et l’accent rouge structurent une composition sobre. La typographie Manrope, les niveaux de titres et les espaces donnent une lecture éditoriale plutôt qu’un catalogue de cartes.

**Montrer une économie incarnée.** Quatre photographies Pexels à licence vérifiée évoquent le jardinage, la récolte collective, les rencontres et les collectivités. Les légendes les identifient comme des illustrations ; les personnes ne sont pas assimilées aux acteurs ESS régionaux. Les actualités réelles et leurs liens CRESS sont conservés. La couverture de publication est un visuel SVG original de maquette.

**Faire du territoire une véritable entrée.** La carte représente les contours géographiques des six départements réels. Carte et sélection de département sont synchronisées. Le second champ propose les 79 fiches EPCI actuellement référencées sur l’accueil CRESS. Chaque choix met à jour le nom et le lien vers son aperçu interne. Les champs offrent une alternative complète à la carte, notamment sur mobile et au clavier. Aucun indicateur territorial n’est inventé ; les données chiffrées restent dans leur publication source avec son millésime.

**Rendre les ressources trouvables.** La recherche par mot-clé, insensible aux accents, et le filtre par type agissent sur une sélection de publications vérifiées. Le nombre de résultats, la réinitialisation et l’absence de résultat sont traités. La recherche d’en-tête inclut services, publications et territoires. Ce moteur local sert la démonstration ; l’index documentaire complet relève du futur CMS.

**Adapter réellement la composition au mobile.** La navigation devient un menu repliable, les quatre parcours une grille de deux colonnes, la carte et ses champs se suivent, et l’agenda rejoint le flux éditorial. Aucun contenu essentiel n’est masqué sur petit écran.

## Transposition WordPress

Le prototype est volontairement indépendant d’un CMS. Une intégration WordPress peut reprendre ses composants en blocs Gutenberg : ouverture, parcours, service mis en avant, liste de services, explorateur territorial, bibliothèque, actualités, agenda et adhésion.

| Contenu | Modèle proposé | Champs ou taxonomies utiles |
| --- | --- | --- |
| Services | Type de contenu Service | Public, besoin, dispositif, contact, lien partenaire |
| Ressources | Type de contenu Ressource | Type, thème, territoire, année, fichier, source et millésime |
| Fiches territoriales | Type de contenu Territoire | Département, code EPCI, nom, indicateurs datés, publication associée |
| Actualités et portraits | Articles | Catégorie, département, visuel et crédits |
| Agenda | Type de contenu Événement | Début, fin, lieu, format, inscription |

Le bloc territorial consommerait les contenus structurés via l’API REST de WordPress. Les fichiers de ce prototype ne constituent pas un thème WordPress prêt à installer. Le futur développement devra prévoir l’administration, les redirections des anciennes URL, la migration qualifiée des contenus, le moteur de recherche global, la sécurité, les sauvegardes, la mesure d’audience et la formation mentionnés dans le cahier des charges. Les composants et le périmètre de la maquette visent à rester compatibles avec l’enveloppe annoncée de 10 000 € TTC, sans constituer une offre financière.

## Accessibilité et vérifications

Contrôles effectués sur Chromium :

- Aucun débordement horizontal aux largeurs 320, 375, 390, 768, 1024, 1440 et 1920 px.
- Six départements, chacune des 79 sélections EPCI vérifiée (libellé et URL source), activation de la carte au clavier et synchronisation des liens.
- Recherche documentaire, filtres, absence de résultat et réinitialisation.
- Recherche globale, conservation du mot-clé dans la recherche interne, fermeture des fenêtres avec Échap et menus mobiles aux largeurs 320, 375, 390 et 768 px.
- Texte exact du bandeau, attribution du concept, huit sections conservées, mentions de démonstration, crédits et fenêtres d’information.
- Chargement de toutes les images et absence d’erreur JavaScript.
- Analyse axe-core 4.10.3 : **aucune violation détectée sur les règles WCAG A/AA sélectionnées, 26 vérifications réussies**. Le rapport est joint.

Ces contrôles automatiques ne constituent pas un audit RGAA ni une déclaration de conformité. La recette du futur site devra inclure des tests avec lecteur d’écran, zoom, navigateurs multiples et utilisateurs représentatifs. Le prototype propose des champs étiquetés, une hiérarchie sémantique, un lien d’évitement, des focus visibles, des alternatives d’images et la prise en compte de la réduction des animations.

## Sources et crédits

Sources consultées le **23 novembre 2026**, avant la conception :

| Élément | Source |
| --- | --- |
| Brief institutionnel complet, 11 pages | [Cahier des charges CRESS](https://www.cresscentre.org/wp-content/uploads/2026/11/CDC-V1.pdf) |
| Identité, coordonnées, partenaires et 79 liens territoriaux | [Accueil CRESS](https://www.cresscentre.org/) |
| Services et accompagnement | [Offre de services](https://www.cresscentre.org/offre-de-services/), [DLA](https://www.cresscentre.org/dispositif-local-daccompagnement-en-region-centre/), [Entreprendre](https://www.cresscentre.org/entreprendre-ess/), [Se former](https://www.cresscentre.org/sensibilisation-jeunes/), [Achats responsables](https://www.cresscentre.org/achats-responsables/) |
| Portrait d’ouverture et initiative mise en avant | [Les Jardins de la Voie Romaine, article du 5 décembre 2025](https://www.cresscentre.org/15105-2/) |
| Photographies d’illustration actuelles | Pexels : Centre for Ageing Better, Zen Chung, Luis Quintero et Mozzapics . ; [sources et licences](./CREDITS-VISUELS.md) |
| Ressources | [Panoramas](https://www.cresscentre.org/type/panoramas/), [Observatoire](https://www.cresscentre.org/nos-etudes/), liens individuels conservés dans `app.js` |
| Actualités | [CORESS](https://www.cresscentre.org/conference-regionale-de-leconomie-sociale-et-solidaire-coress/), [Salon des Maires 2026](https://www.cresscentre.org/salon-des-maires-2026-nous-y-serons/), [Appel à prestataires](https://www.cresscentre.org/recherche-prestataire-site-internet/) |
| Agenda du 2 décembre 2026 | [Achats publics responsables](https://www.cresscentre.org/events/rencontre-achats-publics-responsables/), [Accueil Information Orientation](https://www.cresscentre.org/events/webinaire-decouvrez-less-10/) |
| Adhésion | [Adhérer à la CRESS](https://www.cresscentre.org/adherer-a-la-cress/) |
| Fond cartographique | [france-geojson, Grégoire David](https://github.com/gregoiredavid/france-geojson), contours issus des données IGN, selon les crédits du projet ; projection SVG simplifiée pour cette maquette |
| Typographie | [Manrope](https://fonts.google.com/specimen/Manrope), SIL Open Font License, fichiers hébergés localement |

Les quatre photographies sont désormais utilisées sous **licence Pexels vérifiée**, avec auteur, page source et licence consignés dans le [registre des crédits](./CREDITS-VISUELS.md) et le [manifeste des fichiers](./assets/photo-licenses.json). Les anciennes photos et affiches CRESS ainsi que la couverture reproduite ont été remplacées. Les logos institutionnels demeurent des identités de référence ; ils ne relèvent pas de la licence des photographies et ne constituent pas un soutien à cette candidature.

Les filtres territoriaux, le filtre documentaire et la recherche fonctionnent localement ; leur périmètre de démonstration est indiqué près des contrôles. Ils ne sont pas connectés à un CMS et ne s’actualisent pas en temps réel. Les démarches d’adhésion, de contact et de newsletter disposent de formulaires de démonstration, explicitement simulés, sans envoi ni stockage. Le partage copie le lien du concept sans service social connecté.

La page ne comporte aucun formulaire de collecte, cookie applicatif ou outil de mesure d’audience. Son hébergement relève de GitHub Pages. Elle porte la directive `noindex,nofollow,noimageindex`, confirmée dans les tests. Aucun fichier `robots.txt` bloquant l’accès à cette directive n’est ajouté.


## Navigation interne et limites de la démo

Les liens CRESS de l’accueil, du pied de page, des filtres, de la recherche et des crédits ouvrent des vues locales dans le même design. Les 79 fiches EPCI disposent d’un aperçu contextualisé, sans indicateur inventé. Les aperçus de services, publications, actualités, agenda, contact, adhésion et newsletter présentent un contenu synthétique et leurs limites. Aucun HTML WordPress du site existant n’est importé.

Les destinations utilisent des fragments d’URL, ce qui permet les liens directs, le rechargement et les boutons précédent/suivant sur GitHub Pages. La page d’accueil conserve ses huit sections. Chaque vue propose un retour à l’accueil et un bouton distinct pour ouvrir volontairement la source officielle dans un nouvel onglet. Le composant « Partager cette page du concept » copie le lien et propose un champ sélectionnable si le presse-papiers n’est pas disponible. Aucun code d’extension de partage n’est affiché.

Les formulaires contact, newsletter et demande d’information sur l’adhésion ne font aucun appel réseau et ne stockent pas les saisies. Leur validation affiche un statut de simulation puis réinitialise les champs. Ils ne constituent pas une messagerie, un abonnement ou une adhésion réels.

Recette de navigation : **111 destinations vérifiées**, dont les 79 fiches territoriales ; absence de contenu brut d’extension WordPress, partage de lien, formulaires sans envoi, liens directs, rechargement et historique. Sept modèles d’aperçu sont contrôlés à 320, 375, 390, 768 et 1440 px. Aucune requête externe inattendue, erreur JavaScript ou violation axe-core A/AA n’est détectée sur les modèles testés. Ces contrôles automatiques ne remplacent pas un audit RGAA.
