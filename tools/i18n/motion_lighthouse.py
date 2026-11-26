"""Fresh local measurements of the kinetic portfolio, sequentially."""
from pathlib import Path
import os,subprocess,json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT.parents[1]/'outputs/portfolio-motion-20261126';OUT.mkdir(parents=True,exist_ok=True)
chrome=Path.home()/'AppData/Local/ms-playwright/chromium-1255/chrome-win64/chrome.exe'
rows=[]
for device in ['mobile','desktop']:
 path=OUT/f'lighthouse-{device}.json'
 cmd=['node',str(ROOT.parent/'municipal-tooling/node_modules/lighthouse/cli/index.js'),'http://127.0.0.1:8783/fr/','--chrome-flags=--headless --no-sandbox','--only-categories=performance,accessibility,best-practices,seo','--output=json','--output-path='+str(path),'--quiet']
 if device=='desktop':cmd.append('--preset=desktop')
 subprocess.run(cmd,cwd=ROOT,env={**os.environ,'CHROME_PATH':str(chrome)},check=True,timeout=180)
 data=json.loads(path.read_text(encoding='utf8'));assert not data.get('runtimeError')
 row={'device':device,'fetchTime':data['fetchTime'],'scores':{k:round(v['score']*100) for k,v in data['categories'].items()},'failures':[{'id':k,'title':v['title']} for k,v in data['audits'].items() if v.get('scoreDisplayMode')=='binary' and v.get('score')==0]}
 rows.append(row);print(json.dumps(row),flush=True)
 (OUT/'lighthouse-results.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
