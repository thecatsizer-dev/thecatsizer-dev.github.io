from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-qa'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':390,'height':844},locale='fr-FR');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for path in ['demarches/salles/','demarches/rendez-vous/']:
  page.goto('http://127.0.0.1:8769/demos/municipal-website/'+path,wait_until='networkidle')
  expect(page.locator('.availability-days')).to_be_visible()
  page.get_by_role('button',name='Mois de disponibilité suivant').click()
  target=page.locator('[data-book-date]:not([disabled])').first;date=target.get_attribute('data-book-date');target.click()
  assert page.locator('select[name=date]').input_value()==date
  page.locator('input[name=slot]:not([disabled])').first.check();page.get_by_role('button',name='Voir le récapitulatif').click()
  page.get_by_role('button',name='Confirmer la simulation').click();expect(page.locator('#booking-summary')).to_contain_text('Votre réservation fictive est enregistrée.')
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
 page.goto('http://127.0.0.1:8769/demos/municipal-website/demarches/salles/',wait_until='networkidle')
 page.add_script_tag(path=str(ROOT.parent/'municipal-tooling/node_modules/axe-core/axe.min.js'))
 axe=page.evaluate('async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}')
 page.screenshot(path=str(OUT/'booking-calendar-390.jpg'),full_page=True,type='jpeg',quality=82)
 result={'calendar_room_and_appointment':True,'recap_and_confirmation':True,'mobile_overflow':False,'errors':errors,'axe_violations':axe}
 (OUT/'calendar-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(result)
 assert not errors and not axe;b.close()
