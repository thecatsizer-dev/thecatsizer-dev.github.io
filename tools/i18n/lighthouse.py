"""Sequential Lighthouse measurements on the published five-language entry points."""
from pathlib import Path
import subprocess,json,os

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT.parents[1]/'outputs/municipal-i18n'
RAW=OUT/'lighthouse';RAW.mkdir(exist_ok=True)
CLI=ROOT.parent/'municipal-tooling/node_modules/lighthouse/cli/index.js'
chrome=Path(os.environ.get('CHROME_PATH',Path.home()/'AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe'))
assert chrome.exists(),chrome
results=[]
for lang in ['fr','en','es','it','de']:
 for site,path in [('Portfolio','/' if lang=='en' else '/'+lang+'/'),('Valmer','/demos/municipal-website/'+('' if lang=='fr' else lang+'/'))]:
  url='https://thecatsizerlab.github.io'+path
  for device in ['mobile','desktop']:
   report=RAW/f'{site.lower()}-{lang}-{device}.json'
   if not report.exists():
    cmd=['node',str(CLI),url,'--chrome-flags=--headless --no-sandbox','--output=json','--output-path='+str(report),'--only-categories=performance,accessibility,best-practices,seo','--quiet']
    if device=='desktop':cmd.append('--preset=desktop')
    subprocess.run(cmd,cwd=ROOT,env={**os.environ,'CHROME_PATH':str(chrome)},check=True,timeout=180)
   r=json.loads(report.read_text(encoding='utf8'))
   assert not r.get('runtimeError'),r.get('runtimeError')
   assert r['finalDisplayedUrl'].rstrip('/')==url.rstrip('/'),(url,r['finalDisplayedUrl'])
   scores={key:round(item['score']*100) for key,item in r['categories'].items()}
   results.append({'site':site,'language':lang,'device':device,'url':url,'fetchTime':r['fetchTime'],'lighthouseVersion':r['lighthouseVersion'],'scores':scores,'metrics':{key:{'value':r['audits'][key]['numericValue'],'unit':r['audits'][key]['numericUnit']} for key in ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index']},'config':{key:r['configSettings'].get(key) for key in ['formFactor','throttlingMethod','screenEmulation','throttling']}})
   (OUT/'lighthouse-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
   print(site,lang,device,scores,flush=True)
print('Completed',len(results),'production measurements',flush=True)
