"""End-to-end internationalisation checks in isolated browsers, never user sessions."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import json,re,traceback,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-i18n';OUT.mkdir(parents=True,exist_ok=True)
ORIGIN='http://127.0.0.1:8769';LANGS=['fr','en','es','it','de']
AXE=ROOT.parent/'municipal-tooling/node_modules/axe-core/axe.min.js'
expected={
 'fr':{'school':'ecole','library':'bibliotheque','booking':'Votre réservation fictive est enregistrée.','appointment':'Votre rendez-vous fictif est enregistré.','signal':'Votre signalement fictif est enregistré.','required':'Renseignez ce champ.'},
 'en':{'school':'school','library':'library','booking':'Your fictional booking has been saved.','appointment':'Your fictional appointment has been saved.','signal':'Your fictional report has been saved.','required':'Please fill in this field.'},
 'es':{'school':'escuela','library':'biblioteca','booking':'Tu reserva ficticia se ha guardado.','appointment':'Tu cita ficticia se ha guardado.','signal':'Tu aviso ficticio se ha guardado.','required':'Completa este campo.'},
 'it':{'school':'scuola','library':'biblioteca','booking':'La tua prenotazione immaginaria è stata registrata.','appointment':'Il tuo appuntamento immaginario è stato registrato.','signal':'La tua segnalazione immaginaria è stata registrata.','required':'Compila questo campo.'},
 'de':{'school':'Schule','library':'Bibliothek','booking':'Ihre fiktive Buchung wurde gespeichert.','appointment':'Ihr fiktiver Termin wurde gespeichert.','signal':'Ihre fiktive Meldung wurde gespeichert.','required':'Bitte füllen Sie dieses Feld aus.'}}
result={'languages':{},'errors':[],'network_submissions':[],'axe':[],'layouts':[]}
if '--resume' in sys.argv and (OUT/'browser-results.json').exists():
 result=json.loads((OUT/'browser-results.json').read_text(encoding='utf8'));result.pop('failure',None)
def goto(page,base,route=''):page.goto(base+route,wait_until='networkidle')
def overflow(page):return page.evaluate('document.documentElement.scrollWidth>innerWidth')
def check_axe(page,lang,name):
 page.add_script_tag(path=str(AXE));rows=page.evaluate('async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});return r.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))}')
 result['axe'].append({'language':lang,'page':name,'violations':rows})
def ok(lang,name):result['languages'][lang].append(name);print('PASS',lang,name,flush=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 try:
  for lang in LANGS:
   if 'Demo reset preserves shared business behaviour' in result['languages'].get(lang,[]):continue
   result['layouts']=[x for x in result['layouts'] if x['language']!=lang];result['axe']=[x for x in result['axe'] if x['language']!=lang]
   result['languages'][lang]=[];e=expected[lang];base=ORIGIN+'/demos/municipal-website/'+('' if lang=='fr' else lang+'/')
   context=browser.new_context(viewport={'width':1440,'height':900},locale='en-GB',timezone_id='Europe/Paris',accept_downloads=True)
   context.on('page',lambda p:p.on('pageerror',lambda err:result['errors'].append(str(err))))
   context.on('request',lambda r:result['network_submissions'].append(r.url) if r.method not in ['GET','HEAD'] else None)
   page=context.new_page();admin=context.new_page()
   goto(page,base);expect(page.locator('html')).to_have_attribute('lang',lang)
   page.locator('#search-home').fill(e['school']);expect(page.locator('#suggestions-home')).to_be_visible();assert page.locator('#suggestions-home a').count()>0
   page.locator('#search-home').press('Enter');expect(page.locator('.search-results article').first).to_be_visible()
   page.locator('#search-filter select').select_option('Actualités');page.locator('#search-filter button').click();expect(page.locator('.search-results article').first).to_be_visible()
   assert page.url.startswith(base);ok(lang,'Global search, suggestions and content-type filter')
   goto(page,base,'annuaire/');page.locator('#directory-filters input').fill(e['library']);page.locator('#directory-filters select').select_option('Équipements');expect(page.locator('#directory-results .directory-card')).to_have_count(1);expect(page.locator('#directory-results')).to_contain_text('Médiathèque des Rives');ok(lang,'Localized directory search and category values')
   goto(page,base,'agenda/');page.locator('[data-agenda-view=calendar]').click();month=page.locator('.calendar-heading h2').inner_text();page.locator('[data-calendar-month="1"]').click();assert page.locator('.calendar-heading h2').inner_text()!=month
   page.locator('[data-calendar-month="-1"]').click();expect(page.locator('.calendar-heading h2')).to_have_text(re.compile(re.escape(month),re.I))
   page.locator('#event-category').select_option('Nature');page.locator('.calendar-day a').first.click();assert page.url.startswith(base)
   with page.expect_download() as info:page.locator('[data-ics]').click()
   file=OUT/f'event-{lang}.ics';info.value.save_as(file);ics=file.read_text(encoding='utf8');assert 'BEGIN:VEVENT' in ics and 'Europe/Paris' in ics and 'SUMMARY:[' in ics;ok(lang,'Agenda month/category navigation and localized ICS export')
   goto(page,base,'carte/');page.locator('[data-select-place="hotel-ville"]').click();assert page.locator('#map-detail h2').inner_text() in ['Hôtel de ville','Town hall','Ayuntamiento','Municipio','Rathaus']
   before=page.locator('#map-canvas svg').get_attribute('viewBox');page.locator('[data-map-zoom=in]').click();assert before!=page.locator('#map-canvas svg').get_attribute('viewBox');page.locator('#map-pan').select_option('east');page.locator('[data-map-reset]').click();ok(lang,'Map details, zoom, pan and reset')
   goto(page,base,'demarches/salles/');form=page.locator('#booking-form');date=form.locator('[name=date]').input_value();radio=form.locator('input[name=slot]:not([disabled])').first;slot=radio.get_attribute('value');radio.check();form.locator('button[type=submit]').click();page.locator('#confirm-booking').click();expect(page.locator('#booking-summary h3')).to_have_text(e['booking'])
   goto(page,base,'demarches/salles/');page.locator('[name=date]').select_option(date);expect(page.locator(f'input[name=slot][value="{slot}"]')).to_be_disabled();ok(lang,'Room booking, recap, localized confirmation and duplicate protection')
   goto(page,base,'demarches/rendez-vous/');page.locator('input[name=slot]:not([disabled])').first.check();page.locator('#booking-form button[type=submit]').click();page.locator('#confirm-booking').click();expect(page.locator('#booking-summary h3')).to_have_text(e['appointment']);ok(lang,'Appointment and localized confirmation')
   goto(page,base,'demarches/signalement/');page.locator('textarea[name=description]').fill('QA fictional street light problem.');page.locator('[name=area]').select_option('39,48');page.locator('#sample-attachment').click();expect(page.locator('#attachment-preview')).to_be_visible();page.locator('[name=demo-consent]').check();page.locator('#signal-form button[type=submit]').click();expect(page.locator('#signal-confirmation h2')).to_have_text(e['signal']);ok(lang,'Citizen report, location, sample attachment and confirmation')
   goto(page,base,'contact/');page.locator('#contact-form button').click();assert page.locator('[name=subject]').evaluate('(el)=>el.validationMessage')==e['required'];page.locator('[name=subject]').fill('QA fictional question');page.locator('[name=message]').fill('QA fictional message, no personal data.');page.locator('#contact-form button').click();expect(page.locator('#contact-confirmation')).not_to_be_empty();ok(lang,'Localized native validation and contact simulation')
   goto(admin,base,'administration/?section=news&edit=new');title='QA '+lang+' <b>plain text</b>';admin.locator('[name=title]').fill(title);admin.locator('[name=intro]').fill('QA fictional introduction.');admin.locator('[name=body]').fill('QA fictional editorial content.');admin.locator('#preview-content-button').click();expect(admin.locator('#preview-content')).to_contain_text(title);assert admin.locator('#preview-content b').count()==0;admin.locator('#preview-dialog [data-close-dialog]').click();admin.locator('button[value=draft]').click()
   goto(page,base,'actualites/');expect(page.locator('#news-results')).not_to_contain_text(title)
   admin.locator('.admin-item-list article').filter(has_text=title).locator('[data-edit]').click();admin.locator('button[value=published]').click();expect(page.locator('#news-results')).to_contain_text(title);ok(lang,'CMS preview escaping, draft isolation and cross-tab publication')
   goto(admin,base,'administration/?section=requests');admin.locator('#request-filter').select_option('reservation');expect(admin.locator('.requests-admin>article')).to_have_count(1);admin.locator('.requests-admin select[name=status]').select_option('Confirmée');admin.locator('.requests-admin textarea').fill('QA status notification');admin.locator('.requests-admin button').click();goto(page,base,'espace-citoyen/');expect(page.locator('.notification-list')).to_contain_text('QA status notification');ok(lang,'Translated request filters, status and citizen notifications')
   # Saving an unchanged translated seed must keep its canonical content usable in another language.
   goto(admin,base,'administration/?section=news&edit=place-aux-rencontres');admin.locator('button[value=published]').click();state=admin.evaluate('JSON.parse(localStorage.getItem("valmer-municipal-demo-v1"))');assert next(n for n in state['news'] if n['id']=='place-aux-rencontres')['title']=='Sur la place, l’hiver se prépare ensemble';ok(lang,'Translated editor preserves canonical seed on save')
   # Layout and keyboard checks in the same language after interactive use.
   for width,height in [(1440,900),(768,1024),(390,844),(320,844)]:
    page.set_viewport_size({'width':width,'height':height})
    for name,route in [('home',''),('booking','demarches/salles/'),('contact','contact/'),('admin','administration/')]:
     goto(page,base,route);assert not overflow(page),(lang,name,width);result['layouts'].append({'language':lang,'page':name,'width':width,'overflow':False})
     if width in [1440,390]:
      page.screenshot(path=str(OUT/f'{lang}-{name}-{width}.jpg'),full_page=True,type='jpeg',quality=78)
      if name in ['home','admin']:check_axe(page,lang,f'{name}-{width}')
   goto(page,base);page.locator('[data-open-menu]').click();expect(page.locator('#mobile-menu')).to_be_visible();page.keyboard.press('Escape');expect(page.locator('#mobile-menu')).not_to_be_visible()
   page.locator('.language-picker summary').click();expect(page.locator('.language-options')).to_be_visible();links=page.locator('.language-options a');assert links.count()==5
   target='it' if lang!='it' else 'en'
   page.locator(f'.language-options [data-language="{target}"]').click();expect(page.locator('html')).to_have_attribute('lang',target)
   ok(lang,'Four responsive widths, keyboard menu and language switch')
   goto(admin,base,'administration/');admin.locator('#admin-reset').click();admin.locator('#confirm-reset-demo').click();state=admin.evaluate('JSON.parse(localStorage.getItem("valmer-municipal-demo-v1"))');assert state['requests']==[];ok(lang,'Demo reset preserves shared business behaviour')
   context.close()
  browser.close()
 except Exception:
  result['failure']=traceback.format_exc()
  try:page.screenshot(path=str(OUT/'failure-public.jpg'),full_page=True);admin.screenshot(path=str(OUT/'failure-admin.jpg'),full_page=True)
  except:pass
  raise
 finally:(OUT/'browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
assert not result['errors'],result['errors']
assert not result['network_submissions'],result['network_submissions']
assert not any(x['violations'] for x in result['axe']),result['axe']
print('ALL LANGUAGES PASSED',sum(map(len,result['languages'].values())),'journeys;',len(result['layouts']),'layouts; no JS errors, submissions or axe violations.')
