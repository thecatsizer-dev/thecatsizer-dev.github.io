from playwright.sync_api import sync_playwright
from pathlib import Path
import json
root=Path(__file__).resolve().parents[4]
out=root/'outputs'/'municipal-qa';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 for w,h in [(1920,1080),(1440,900),(768,1024),(390,844)]:
  page.set_viewport_size({'width':w,'height':h})
  page.goto('http://127.0.0.1:8769/demos/municipal-website/',wait_until='networkidle')
  for y in range(0,page.locator('body').bounding_box()['height'].__int__(),650):
   page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(80)
  page.locator('img').evaluate_all('(imgs)=>Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})))')
  page.evaluate('scrollTo(0,0)')
  page.screenshot(path=str(out/f'home-{w}.jpg'),full_page=True,type='jpeg',quality=82)
  print(w,'overflow',page.evaluate('document.documentElement.scrollWidth>innerWidth'),'h1',page.locator('h1').inner_text())
 page.set_viewport_size({'width':1440,'height':900})
 page.goto('http://127.0.0.1:8769/demos/municipal-website/administration/',wait_until='networkidle')
 page.get_by_role('heading',name='Vue d’ensemble',exact=True).wait_for()
 page.screenshot(path=str(out/'admin-1440.jpg'),full_page=True,type='jpeg',quality=82)
 print('JS errors',errors)
 (out/'smoke.json').write_text(json.dumps({'errors':errors}),encoding='utf8')
 browser.close()
