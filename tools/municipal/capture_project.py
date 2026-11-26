from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/media/municipal';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(viewport={'width':1440,'height':900},locale='fr-FR')
 for name,route in [('home',''),('administration','administration/'),('services','demarches/'),('map','carte/'),('agenda','agenda/')]:
  page.goto('http://127.0.0.1:8769/demos/municipal-website/'+route,wait_until='networkidle')
  page.locator('h1').first.wait_for()
  if name=='agenda':page.locator('[data-agenda-view="calendar"]').click()
  png=OUT/(name+'.png');page.screenshot(path=str(png),full_page=False)
  with Image.open(png) as im:im.convert('RGB').save(OUT/(name+'.webp'),'WEBP',quality=88,method=6)
  png.unlink()
 page.set_viewport_size({'width':390,'height':844})
 for name,route in [('mobile',''),('mobile-services','demarches/'),('mobile-booking','demarches/salles/')]:
  page.goto('http://127.0.0.1:8769/demos/municipal-website/'+route,wait_until='networkidle')
  png=OUT/(name+'.png');page.screenshot(path=str(png))
  with Image.open(png) as im:im.convert('RGB').save(OUT/(name+'.webp'),'WEBP',quality=88,method=6)
  png.unlink()
 b.close()
print('Saved 8 real browser captures, no fabricated interfaces.')
