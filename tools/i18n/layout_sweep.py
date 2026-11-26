from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-i18n'
result={'routes':[],'overflow':[],'errors':[]}
retry=set()
if '--failed' in sys.argv and (OUT/'layout-sweep.json').exists():
 result=json.loads((OUT/'layout-sweep.json').read_text(encoding='utf8'));retry={x['route'] for x in result['overflow']};result['overflow']=[];result['routes']=[x for x in result['routes'] if x['route'] not in retry]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True);page=browser.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:result['errors'].append(str(e)))
 for lang in ['fr','en','es','it','de']:
  folder=ROOT/'demos/municipal-website'/('' if lang=='fr' else lang);routes=[x['path'] for x in json.loads((folder/'routes.json').read_text(encoding='utf8'))]
  prefix='' if lang=='en' else '/'+lang
  routes += [prefix+'/',*[prefix+'/projects/'+p.name for p in (ROOT/'projects').glob('*.html') if p.name!='pixelozor.html']]
  for route in routes:
   if '--failed' in sys.argv and route not in retry:continue
   page.goto('http://127.0.0.1:8769'+route,wait_until='domcontentloaded');page.wait_for_function('document.documentElement.dataset.i18nReady==="true"');page.evaluate('document.fonts.ready')
   if 'administration/' in route:page.locator('.admin-shell').wait_for()
   overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
   if overflow:
    nodes=page.evaluate('Array.from(document.querySelectorAll("#page-content *,main *")).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(e=>({tag:e.tagName,class:typeof e.className==="string"?e.className:"",text:e.textContent.slice(0,90),right:e.getBoundingClientRect().right})).slice(0,8)')
    result['overflow'].append({'language':lang,'route':route,'nodes':nodes})
   result['routes'].append({'route':route,'width':390,'overflow':overflow})
  print('Checked',lang,len(routes),'pages',flush=True)
 browser.close()
(OUT/'layout-sweep.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('Sweep:',len(result['routes']),'pages;',len(result['overflow']),'overflows;',len(result['errors']),'JS errors')
if result['overflow']:print(json.dumps(result['overflow'],ensure_ascii=False,indent=2)[:6000])
assert not result['overflow'] and not result['errors']
