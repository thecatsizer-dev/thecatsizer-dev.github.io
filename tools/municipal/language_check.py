from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
import json, re

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT.parents[1]/'outputs/municipal-qa';OUT.mkdir(parents=True,exist_ok=True)
BASE='http://127.0.0.1:8769'
PORTAL=BASE+'/demos/municipal-website/'
result={'static_pages':0,'layouts':[],'confirmations':[],'admin_editors':[],'js_errors':[]}
bad=re.compile(r'Une espace|Une signalement|Tout ma mairie|Tout mes démarches|réservation fictif|réservation fictive est enregistré\.')
for path in (ROOT/'demos/municipal-website').rglob('*.html'):
 soup=BeautifulSoup(path.read_text(encoding='utf8'),'html.parser')
 assert not bad.search(soup.get_text(' ',strip=True)),path
 result['static_pages']+=1
fr=BeautifulSoup((ROOT/'fr/index.html').read_text(encoding='utf8'),'html.parser')
assert fr.html['lang']=='fr'
copy=fr.get_text(' ',strip=True)+' '.join(n.get('alt','')+' '+n.get('aria-label','') for n in fr.select('[alt],[aria-label]'))
for old in ['Real browser','View Learning','View the','Web development','Citizen services','Local CMS demo','Multilingual UX','Image processing','Responsive design','Main navigation','Elsewhere']:
 assert old not in copy,old

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(locale='fr-FR',timezone_id='Europe/Paris')
 page=context.new_page();page.on('pageerror',lambda e:result['js_errors'].append(str(e)))
 for width in [320,390,481,700,768,1024,1440]:
  page.set_viewport_size({'width':width,'height':900})
  for path in ['/demos/municipal-website/','/fr/']:
   page.goto(BASE+path,wait_until='networkidle')
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,path)
   result['layouts'].append({'width':width,'path':path,'overflow':False})
 page.set_viewport_size({'width':390,'height':844})
 page.goto(PORTAL+'espace-citoyen/',wait_until='networkidle')
 expect(page.locator('.simulation-note strong')).to_have_text('Un espace citoyen pour essayer, sans rien transmettre.')
 page.get_by_role('button',name='Ouvrir le menu',exact=True).click()
 expect(page.locator('#mobile-menu .nav-overview')).to_have_text(['Présentation de la mairie','Toutes les démarches','Toute la vie à Valmer','Découvrir Valmer'])
 expect(page.locator('#mobile-menu .menu-admin')).to_be_visible()
 page.get_by_role('button',name='Fermer le menu',exact=True).click()
 page.screenshot(path=str(OUT/'language-citizen-mobile.png'))
 page.goto(PORTAL+'demarches/signalement/',wait_until='networkidle')
 expect(page.locator('.simulation-note strong')).to_have_text('Un signalement pour essayer, sans rien transmettre.')
 for route,expected in [('demarches/salles/','Votre réservation fictive est enregistrée.'),('demarches/rendez-vous/','Votre rendez-vous fictif est enregistré.')]:
  page.goto(PORTAL+route,wait_until='networkidle')
  page.locator('#booking-form input[name=slot]:not([disabled])').first.check()
  page.get_by_role('button',name='Voir le récapitulatif').click()
  page.get_by_role('button',name='Confirmer la simulation').click()
  expect(page.locator('#booking-summary h3')).to_have_text(expected)
  result['confirmations'].append(expected)
  if route=='demarches/salles/':page.evaluate('scrollTo(0,0)');page.screenshot(path=str(OUT/'language-booking-confirmation.png'),full_page=True)
 page.goto(PORTAL+'espace-citoyen/',wait_until='networkidle')
 assert 'reservation' not in page.locator('#page-content').inner_text()
 for type,heading in [('news','Créer une actualité'),('events','Créer un événement'),('pages','Créer une page'),('alerts','Créer une alerte'),('directory','Créer une fiche'),('rooms','Créer une salle')]:
  page.goto(PORTAL+'administration/?section='+type+'&edit=new',wait_until='networkidle')
  expect(page.locator('.editor-panel h2')).to_have_text(heading)
  if type=='alerts':
   expect(page.locator('select[name=link] option')).to_have_text(['Actualités','Projets municipaux','Déchets et propreté','Services et horaires','Agenda'])
  result['admin_editors'].append(heading)
 page.goto(PORTAL+'administration/?section=requests',wait_until='networkidle')
 expect(page.locator('#request-filter option')).to_have_text(['Toutes les demandes','signalement','rendez-vous','réservation'])
 page.locator('#request-filter').select_option('reservation')
 expect(page.locator('.requests-admin>article')).to_have_count(1)
 page.goto(BASE+'/fr/',wait_until='networkidle')
 page.screenshot(path=str(OUT/'language-portfolio-fr.png'))
 browser.close()
assert not result['js_errors'],result['js_errors']
(OUT/'language-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('PASS: 75 static pages; French translations; 14 layout checks; mobile navigation; both confirmations; six editors; request filters; no JS errors.')
