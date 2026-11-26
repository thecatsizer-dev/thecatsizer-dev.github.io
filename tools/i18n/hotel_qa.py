"""Verify the updated hotel card and case without changing other projects."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
import json
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/hotel-qa';result={'layouts':[],'galleries':[],'links':[],'errors':[]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);page=browser.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)))
 for lang in ['fr','en','it','es','de']:
  prefix='' if lang=='en' else '/'+lang
  for route,name in [(prefix+'/','portfolio'),(prefix+'/projects/wordpress-pms.html','hotel-case')]:
   for width,height in [(1440,1000),(768,1024),(390,844),(320,844)]:
    page.set_viewport_size({'width':width,'height':height});page.goto('http://127.0.0.1:8769'+route,wait_until='networkidle');page.wait_for_function('document.documentElement.dataset.i18nReady==="true"');page.evaluate('document.fonts.ready');expect(page.locator('html')).to_have_attribute('lang',lang)
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(lang,name,width)
    result['layouts'].append({'language':lang,'page':name,'width':width,'overflow':False})
    if name=='portfolio':
     cards=page.locator('.work-domain a[href*="/projects/"]').evaluate_all('(links)=>[...new Set(links.map(a=>new URL(a.href).pathname.split("/").at(-1)))]')
     assert set(cards)=={'municipal-portal.html','ortu-di-ghjaseppu.html','wordpress-pms.html','learning-studio.html','sharespend.html','ultracast.html','image-resizer.html','rescue-crew.html','sudoku-battle.html','tri-spells-arena.html'},cards
     expect(page.locator('h4').filter(has_text='Casa Suprana')).to_have_count(1)
    if name=='hotel-case':
     expected='https://thecatsizerlab.github.io/casa-suprana-hotel/'+('' if lang=='fr' else lang+'/')
     links=page.locator('main a[href*="casa-suprana-hotel/"]').evaluate_all('(a)=>a.map(x=>x.href)')
     for suffix in ['', 'reserver/', 'administration/']:assert expected+suffix in links,(lang,suffix,links)
     for src in page.locator('main img[src*="/hotel/"]').evaluate_all('(images)=>images.map(i=>i.getAttribute("src"))'):assert '/hotel/'+lang+'/' in src,(lang,src)
     if width==390:
      page.locator('a[data-screenshot]').first.click();expect(page.locator('#screenshot-viewer')).to_be_visible();assert '/hotel/'+lang+'/' in page.locator('#screenshot-viewer img').get_attribute('src');page.keyboard.press('Escape');expect(page.locator('#screenshot-viewer')).not_to_be_visible();result['galleries'].append(lang)
    if width in [1440,390]:
     page.locator('img[src]').evaluate_all('(images)=>{images.forEach(i=>i.loading="eager");return Promise.all(images.map(i=>i.decode().catch(()=>{})))}')
     assert page.locator('img[src]').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)')
     page.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}')
     page.screenshot(path=str(OUT/f'{lang}-{name}-{width}.jpg'),full_page=True,quality=75)
   page.locator('.language-picker summary').click();box=page.locator('.language-options').bounding_box();assert box['x']>=0 and box['x']+box['width']<=320;page.keyboard.press('Escape');result['links'].append({'language':lang,'page':name})
  print('Portfolio hotel integration passed:',lang,flush=True)
 browser.close()
(OUT/'portfolio-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
assert not result['errors'],result['errors']
print('PASS',len(result['layouts']),'layouts; 5 localized galleries; 10 original projects preserved; 0 JS errors')
