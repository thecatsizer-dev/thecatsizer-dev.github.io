"""Smoke-check the deployed release, not a local preview."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import json

ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-i18n'
result={'origin':'https://thecatsizerlab.github.io','pages':[],'errors':[]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.on('pageerror',lambda e:result['errors'].append(str(e)))
 for lang in ['fr','en','es','it','de']:
  prefix='' if lang=='en' else '/'+lang
  municipal='/demos/municipal-website/'+('' if lang=='fr' else lang+'/')
  for kind,route in [('portfolio',prefix+'/'),('case',prefix+'/projects/municipal-portal.html'),('valmer',municipal),('admin',municipal+'administration/')]:
   response=page.goto(result['origin']+route,wait_until='networkidle')
   assert response.status==200,(route,response.status)
   expect(page.locator('html')).to_have_attribute('lang',lang)
   page.wait_for_function('document.documentElement.dataset.i18nReady==="true"')
   if kind=='admin':expect(page.locator('.admin-shell')).to_be_visible()
   expect(page.locator('h1')).to_be_visible()
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),route
   if kind in ['portfolio','valmer']:
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUT/f'production-{lang}-{kind}.png'))
   if kind=='case':
    for href in page.locator('a[data-screenshot]').evaluate_all('(links)=>links.map(a=>a.getAttribute("href"))'):
     assert '/assets/media/municipal/'+('' if lang=='fr' else lang+'/') in href,(lang,href)
   result['pages'].append({'language':lang,'kind':kind,'url':page.url,'status':response.status,'h1':page.locator('h1').inner_text()})
  if lang in ['fr','de']:
   page.set_viewport_size({'width':390,'height':844})
   page.goto(result['origin']+municipal,wait_until='networkidle');page.evaluate('document.fonts.ready')
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
   page.screenshot(path=str(OUT/f'production-{lang}-valmer-mobile.png'))
   page.set_viewport_size({'width':1440,'height':900})
  print('Production passed:',lang,flush=True)
 browser.close()
(OUT/'production-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
assert not result['errors'],result['errors']
print('PASS',len(result['pages']),'published entry points, 0 JS errors')
