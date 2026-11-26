"""Fresh, sequential Lighthouse measurements for the studio redesign."""
from pathlib import Path
import subprocess,json,os
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT.parents[1]/'outputs/portfolio-studio-20261126/lighthouse';OUT.mkdir(parents=True,exist_ok=True)
CLI=ROOT.parent/'municipal-tooling/node_modules/lighthouse/cli/index.js'
CHROME=Path.home()/'AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe'
results=[]
for lang,device in [('fr','mobile'),('fr','desktop'),('en','mobile'),('de','desktop')]:
 url='http://127.0.0.1:8783/'+('' if lang=='en' else lang+'/')
 path=OUT/f'{lang}-{device}.json'
 cmd=['node',str(CLI),url,'--chrome-flags=--headless --no-sandbox','--output=json','--output-path='+str(path),'--only-categories=performance,accessibility,best-practices,seo','--quiet']
 if device=='desktop':cmd.append('--preset=desktop')
 subprocess.run(cmd,cwd=ROOT,env={**os.environ,'CHROME_PATH':str(CHROME)},check=True,timeout=180)
 r=json.loads(path.read_text(encoding='utf8'));assert not r.get('runtimeError'),r.get('runtimeError')
 row={'language':lang,'device':device,'url':url,'fetchTime':r['fetchTime'],'version':r['lighthouseVersion'],'scores':{k:round(v['score']*100) for k,v in r['categories'].items()},'metrics':{k:r['audits'][k]['numericValue'] for k in ['largest-contentful-paint','total-blocking-time','cumulative-layout-shift']},'failedAudits':[{'id':k,'title':v['title']} for k,v in r['audits'].items() if v.get('score') is not None and v['score']<1 and v.get('scoreDisplayMode')=='binary']}
 results.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
 (OUT.parent/'lighthouse-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
