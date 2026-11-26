from pathlib import Path
from bs4 import BeautifulSoup,Comment,Doctype
from urllib.parse import urlsplit,unquote
import json,re
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT.parents[1]/'outputs/municipal-i18n';OUT.mkdir(parents=True,exist_ok=True)
ORIGIN='https://thecatsizerlab.github.io';LANGS=['fr','en','es','it','de'];BASE='/demos/municipal-website/'
result={'pages':0,'broken_links':[],'untranslated':[],'metadata_errors':[],'screenshots':[]}
def norm(s):return re.sub(r'\s+',' ',str(s)).strip()
for lang in LANGS:
 catalog=json.loads((ROOT/f'assets/i18n/locales/{lang}.json').read_text(encoding='utf8'))['messages']
 directory=ROOT/'demos/municipal-website'/('' if lang=='fr' else lang)
 routes=json.loads((directory/'routes.json').read_text(encoding='utf8'));files=[ROOT/x['path'].lstrip('/')/'index.html' for x in routes]
 portfolio=ROOT/('' if lang=='en' else lang);files += [portfolio/'index.html',*list((portfolio/'projects').glob('*.html'))]
 files=[p for p in files if p.name!='pixelozor.html']
 for path in files:
  soup=BeautifulSoup(path.read_text(encoding='utf8'),'html.parser');result['pages']+=1
  if soup.html.get('lang')!=lang or len(soup.select('h1'))!=1 or not soup.select_one('meta[name=description]'):result['metadata_errors'].append(str(path.relative_to(ROOT)))
  alternate=soup.select('link[rel=alternate][hreflang]')
  if {x['hreflang'] for x in alternate}!={'fr','en','es','it','de','x-default'}:result['metadata_errors'].append(str(path.relative_to(ROOT))+': hreflang')
  if len(soup.select('.language-picker'))!=1:result['metadata_errors'].append(str(path.relative_to(ROOT))+': language selector')
  public_path='/'+path.relative_to(ROOT).as_posix()
  if public_path.endswith('index.html'):public_path=public_path[:-10]
  canonical=soup.select_one('link[rel=canonical]')
  if not canonical or canonical.get('href')!=ORIGIN+public_path:result['metadata_errors'].append(str(path.relative_to(ROOT))+': canonical')
  og=soup.select_one('meta[property="og:url"]')
  if not og or og.get('content')!=ORIGIN+public_path:result['metadata_errors'].append(str(path.relative_to(ROOT))+': og:url')
  for item in alternate:
   target_lang=item['hreflang']
   if target_lang=='x-default':target_lang='fr' if public_path.startswith(BASE) else 'en'
   if public_path.startswith(BASE):expected=BASE+('' if target_lang=='fr' else target_lang+'/')+re.sub(r'^(en|es|it|de)/','',public_path[len(BASE):])
   else:expected=('' if target_lang=='en' else '/'+target_lang)+re.sub(r'^/(fr|es|it|de)(?=/)','',public_path)
   if item.get('href')!=ORIGIN+expected:result['metadata_errors'].append(str(path.relative_to(ROOT))+': alternate '+item['hreflang'])
  for node in soup.find_all(string=True):
   if isinstance(node,(Comment,Doctype)) or node.parent.name in ['script','style'] or node.parent.find_parent(class_='language-picker'):continue
   key=norm(node)
   if key in catalog and catalog[key]!=key and '{' not in key:result['untranslated'].append({'page':str(path.relative_to(ROOT)),'text':key,'expected':catalog[key]})
  for node in soup.select('[href],[src],[poster]'):
   for attr in ['href','src','poster']:
    value=node.get(attr)
    if not value:continue
    if value.startswith(ORIGIN+'/casa-suprana-hotel/'):continue # Separate repository; checked on its own published origin path.
    if value.startswith(ORIGIN):value=value[len(ORIGIN):]
    split=urlsplit(value)
    if split.scheme or value.startswith('//') or not split.path:continue
    target=ROOT/unquote(split.path.lstrip('/')) if split.path.startswith('/') else path.parent/unquote(split.path)
    if target.is_dir():target/='index.html'
    if not target.exists():result['broken_links'].append({'page':str(path.relative_to(ROOT)),'link':value})
    if '/assets/media/municipal/' in value:
     expected='/assets/media/municipal/'+('' if lang=='fr' else lang+'/')
     assert split.path.startswith(expected),(lang,value)
     if lang=='fr':assert not re.search(r'/municipal/(en|es|it|de)/',split.path)
     result['screenshots'].append({'language':lang,'page':str(path.relative_to(ROOT)),'asset':split.path})
(OUT/'static-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
print('Checked',result['pages'],'pages;',len(result['broken_links']),'broken links;',len(result['untranslated']),'untranslated strings;',len(result['metadata_errors']),'metadata errors;',len(result['screenshots']),'language-matched media references')
assert not result['broken_links'],result['broken_links'][:12]
assert not result['untranslated'],result['untranslated'][:12]
assert not result['metadata_errors'],result['metadata_errors'][:12]
