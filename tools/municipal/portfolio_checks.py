from playwright.sync_api import sync_playwright,expect
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlsplit,unquote,urljoin
import json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-qa'
errors=[];layouts=[];broken=[]
files=[ROOT/'index.html',ROOT/'fr/index.html',ROOT/'projects/municipal-portal.html',*list((ROOT/'demos/municipal-website').rglob('*.html'))]
for file in files:
 s=BeautifulSoup(file.read_text(encoding='utf8'),'html.parser')
 assert len(s.select('h1'))==1,(file,'h1')
 assert s.select_one('meta[name=description]'),file
 for node in s.select('[href],[src]'):
  link=node.get('href') or node.get('src');u=urlsplit(link)
  if u.scheme or link.startswith('//') or not u.path:continue
  target=ROOT/unquote(u.path.lstrip('/')) if u.path.startswith('/') else file.parent/unquote(u.path)
  if target.is_dir():target=target/'index.html'
  if not target.exists():broken.append({'file':str(file.relative_to(ROOT)),'link':link})
assert not broken,broken
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);page=browser.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 for w,h in [(1920,1080),(1440,900),(768,1024),(390,844)]:
  page.set_viewport_size({'width':w,'height':h})
  for name,path in [('portfolio','/'),('portfolio-fr','/fr/'),('municipal-case','/projects/municipal-portal.html')]:
   page.goto('http://127.0.0.1:8769'+path,wait_until='networkidle')
   for y in range(0,int(page.locator('body').bounding_box()['height']),700):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(50)
   page.locator('img[src]').evaluate_all('(imgs)=>Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})))')
   page.evaluate('scrollTo(0,0)')
   overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth');assert not overflow,(name,w,'overflow')
   assert not page.locator('img[src]').evaluate_all('(imgs)=>imgs.some(i=>!i.naturalWidth)'),(name,w,'image')
   page.screenshot(path=str(OUT/f'{name}-{w}.jpg'),full_page=True,type='jpeg',quality=82)
   if path=='/':
    titles=page.locator('#work article h4').all_text_contents();assert len(titles)==10,titles
    assert titles[:4]==['Valmer-sur-Rive','L’Ortu di Ghjaseppu','Learning Studio','WordPress × Beds24'],titles
   layouts.append({'page':name,'width':w,'height':h,'overflow':False})
 page.goto('http://127.0.0.1:8769/projects/municipal-portal.html',wait_until='networkidle')
 page.locator('.gallery a').first.click();expect(page.locator('dialog')).to_be_visible()
 page.wait_for_function('document.querySelector("dialog img").naturalWidth > 0');page.keyboard.press('Escape')
 browser.close()
result={'pages_static_checked':len(files),'broken_local_links':broken,'layouts':layouts,'js_errors':errors,'gallery':True,'all_10_projects_preserved':True}
(OUT/'portfolio-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('PASS',len(files),'static pages, local links, 12 portfolio layouts, project ordering, 10 projects, gallery; JS errors:',errors)
assert not errors
