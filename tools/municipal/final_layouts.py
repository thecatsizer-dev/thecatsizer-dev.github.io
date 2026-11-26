from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-qa';BASE='http://127.0.0.1:8769/demos/municipal-website/'
AXE=ROOT.parent/'municipal-tooling/node_modules/axe-core/axe.min.js'
samples=[('home',''),('mairie','mairie/'),('article','actualites/place-aux-rencontres/'),('agenda','agenda/'),('booking','demarches/salles/'),('map','carte/'),('citizen','espace-citoyen/'),('admin','administration/')]
result={'layouts':[],'axe':[],'errors':[],'routes':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);page=b.new_page(locale='fr-FR');page.on('pageerror',lambda e:result['errors'].append(str(e)))
 for w,h in [(1920,1080),(1440,900),(768,1024),(390,844)]:
  page.set_viewport_size({'width':w,'height':h})
  for name,route in samples:
   page.goto(BASE+route,wait_until='networkidle')
   for y in range(0,int(page.locator('body').bounding_box()['height']),700):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(45)
   page.locator('img').evaluate_all('(imgs)=>Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})))')
   page.evaluate('scrollTo(0,0)')
   overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth');assert not overflow,(name,w)
   assert not page.locator('img').evaluate_all('(imgs)=>imgs.some(i=>!i.naturalWidth)')
   page.screenshot(path=str(OUT/f'{name}-{w}.jpg'),full_page=True,type='jpeg',quality=82)
   result['layouts'].append({'page':name,'width':w,'height':h,'overflow':False})
   if w in [1440,390]:
    page.add_script_tag(path=str(AXE));violations=page.evaluate('async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});return r.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))}')
    result['axe'].append({'page':name,'width':w,'violations':violations})
   print(name,w,'OK',flush=True)
 page.set_viewport_size({'width':390,'height':844})
 for route in json.loads((ROOT/'demos/municipal-website/routes.json').read_text(encoding='utf8')):
  if route['route'] in ['article','event','directory-detail','custom-page']:continue
  page.goto('http://127.0.0.1:8769'+route['path'],wait_until='domcontentloaded');page.locator('h1').first.wait_for()
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),route['path'];result['routes'].append(route['path'])
 # Static editorial details also work with JS disabled.
 nojs=b.new_context(java_script_enabled=False);static=nojs.new_page()
 for route in ['agenda/marche-hiver/','annuaire/mediatheque/','actualites/place-aux-rencontres/']:
  static.goto(BASE+route);assert static.locator('h1').inner_text()!='Ce contenu n’est pas disponible'
 static.goto(BASE+'demarches/salles/');expect(static.locator('#booking-form fieldset.script-fields')).to_have_attribute('disabled','')
 expect(static.locator('#booking-form button[type="submit"]')).to_be_disabled()
 nojs.close();b.close()
(OUT/'final-layout-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
# Full-length visual review sheets, every requested viewport represented.
for name,_ in samples:
 thumbs=[]
 for w in [1920,1440,768,390]:
  im=Image.open(OUT/f'{name}-{w}.jpg').convert('RGB');tw=300 if w>700 else 180;th=round(im.height*tw/im.width);im=im.resize((tw,th));thumbs.append((w,im))
 height=max(im.height for _,im in thumbs)+50;width=sum(im.width for _,im in thumbs)+50
 sheet=Image.new('RGB',(width,height),'#e4e7e0');draw=ImageDraw.Draw(sheet);x=10
 for w,im in thumbs:draw.text((x,10),f'{name} / {w}px',fill='#173e4b');sheet.paste(im,(x,40));x+=im.width+10
 sheet.save(OUT/f'review-{name}.jpg',quality=88)
print('FINAL',len(result['layouts']),'layouts',len(result['routes']),'routes',len(result['errors']),'JS errors',sum(len(x['violations']) for x in result['axe']),'axe violations')
assert not result['errors'] and not any(x['violations'] for x in result['axe'])
