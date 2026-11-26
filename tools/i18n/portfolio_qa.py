"""Final portfolio layout, gallery and language-link checks using real browsers."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT.parents[1]/'outputs/municipal-i18n'
result={'layouts':[], 'errors':[], 'galleries':[], 'language_links':[]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 page=browser.new_page()
 page.on('pageerror',lambda e: result['errors'].append(str(e)))
 for lang in ['fr','en','es','it','de']:
  prefix='' if lang=='en' else '/'+lang
  for route,name in [(prefix+'/', 'portfolio'),(prefix+'/projects/municipal-portal.html','case')]:
   for width,height in [(1440,900),(768,1024),(390,844),(320,844)]:
    page.set_viewport_size({'width':width,'height':height})
    page.goto('http://127.0.0.1:8769'+route,wait_until='networkidle')
    page.wait_for_function('document.documentElement.dataset.i18nReady==="true"')
    page.evaluate('document.fonts.ready')
    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(route,width)
    expect(page.locator('html')).to_have_attribute('lang',lang)
    result['layouts'].append({'language':lang,'page':name,'width':width,'overflow':False})
    if width in [1440,390]:
     page.locator('img[src]').evaluate_all('(images)=>{images.forEach(i=>i.loading="eager");return Promise.all(images.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r})))}')
     page.locator('img[src]').evaluate_all('(images)=>Promise.all(images.map(i=>i.decode().catch(()=>{})))')
     page.evaluate('async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}')
     assert page.locator('img[src]').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)'),route
     page.screenshot(path=str(OUT/f'{lang}-{name}-{width}.jpg'),full_page=True,quality=75)
    if name=='case' and width==390:
     gallery=page.locator('a[data-screenshot]').first
     gallery.click()
     expect(page.locator('#screenshot-viewer')).to_be_visible()
     image=page.locator('#screenshot-viewer img')
     expected='/assets/media/municipal/'+('' if lang=='fr' else lang+'/')
     assert expected in image.get_attribute('src')
     page.keyboard.press('Escape')
     expect(page.locator('#screenshot-viewer')).not_to_be_visible()
     result['galleries'].append(lang)
   picker=page.locator('.language-picker')
   picker.locator('summary').click()
   expect(picker.locator('.language-options')).to_be_visible()
   bounds=picker.locator('.language-options').bounding_box()
   assert bounds['x']>=0 and bounds['x']+bounds['width']<=width,(lang,bounds)
   for code in ['fr','en','es','it','de']:
    href=picker.locator(f'[data-language={code}]').get_attribute('href')
    expected=('' if code=='en' else '/'+code)+('/' if name=='portfolio' else '/projects/municipal-portal.html')
    assert href==expected,(lang,code,href,expected)
   page.keyboard.press('Escape')
   result['language_links'].append({'language':lang,'page':name,'targets':5})
  print('Portfolio and case reviewed:',lang,flush=True)
 browser.close()
(OUT/'portfolio-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
assert not result['errors'],result['errors']
print('PASS',len(result['layouts']),'layouts, 5 galleries, 50 language links, 0 JS errors')
