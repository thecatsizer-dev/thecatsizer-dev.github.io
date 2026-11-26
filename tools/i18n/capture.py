"""Real browser captures in each language. No text is painted or replaced on images."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import sys
ROOT=Path(__file__).resolve().parents[2]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for lang in (sys.argv[1:] or ['fr','en','es','it','de']):
  assert lang in ['fr','en','es','it','de'],lang
  base='http://127.0.0.1:8769/demos/municipal-website/'+('' if lang=='fr' else lang+'/')
  out=ROOT/'assets/media/municipal'/('' if lang=='fr' else lang);out.mkdir(parents=True,exist_ok=True)
  context=browser.new_context(viewport={'width':1440,'height':900},locale={'fr':'fr-FR','en':'en-GB','es':'es-ES','it':'it-IT','de':'de-DE'}[lang])
  page=context.new_page()
  def capture(name,route,calendar=False):
   page.goto(base+route,wait_until='networkidle');page.locator('h1').first.wait_for();page.evaluate('document.fonts.ready')
   if calendar:page.locator('[data-agenda-view=calendar]').click()
   page.locator('img').evaluate_all('(images)=>Promise.all(images.filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})))')
   assert page.locator('html').get_attribute('lang')==lang
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(lang,name)
   png=out/(name+'.png');page.screenshot(path=str(png))
   with Image.open(png) as image:image.convert('RGB').save(out/(name+'.webp'),'WEBP',quality=88,method=6)
   png.unlink()
  for name,route in [('home',''),('administration','administration/'),('services','demarches/'),('map','carte/'),('agenda','agenda/')]:capture(name,route,name=='agenda')
  page.set_viewport_size({'width':390,'height':844})
  for name,route in [('mobile',''),('mobile-services','demarches/'),('mobile-booking','demarches/salles/')]:capture(name,route)
  context.close();print('Captured',lang,'8 genuine interface screenshots',flush=True)
 browser.close()
