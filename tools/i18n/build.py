"""Generate five static language versions from one set of layouts and business modules."""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment, Doctype
from urllib.parse import urlsplit
import json,re,subprocess,os,sys

ROOT=Path(__file__).resolve().parents[2]
LANGS=['fr','en','es','it','de'];NAMES={'fr':'Français','en':'English','es':'Español','it':'Italiano','de':'Deutsch'}
BASE='/demos/municipal-website/';ORIGIN='https://thecatsizerlab.github.io'
subprocess.run([sys.executable,str(ROOT/'tools/i18n/compile_catalogs.py')],cwd=ROOT,check=True)
def localpath(href,lang):
 hotel_origin=ORIGIN+'/casa-suprana-hotel/'
 if href and href.startswith(hotel_origin):
  rest=re.sub(r'^(fr|en|it|es|de)/','',href[len(hotel_origin):])
  return hotel_origin+rest if re.match(r'(assets|src|docs|server|integrations)/',rest) else hotel_origin+('' if lang=='fr' else lang+'/')+rest
 if not href or re.match(r'^(?:[a-z]+:|//|#)',href,re.I):return href
 match=re.match(r'^([^?#]*)([\s\S]*)$',href);path,suffix=match.groups()
 if path.startswith(BASE) and not re.match(r'(?:assets|src)/',path[len(BASE):]):
  rest=re.sub(r'^(fr|en|es|it|de)/','',path[len(BASE):]);return BASE+('' if lang=='fr' else lang+'/')+rest+suffix
 clean=re.sub(r'^/(fr|en|es|it|de)(?=/)','',path)
 if clean.startswith('/assets/media/hotel/'):return re.sub(r'/hotel/(fr|en|it|es|de)/','/hotel/'+lang+'/',clean)+suffix
 if clean in ['/','/index.html'] or clean.startswith('/projects/'):return ('' if lang=='en' else '/'+lang)+clean+suffix
 if clean.startswith('/assets/media/municipal/'):
  clean=re.sub(r'/municipal/(?:fr|en|es|it|de)/','/municipal/',clean)
  return clean.replace('/municipal/','/municipal/'+('' if lang=='fr' else lang+'/'))+suffix
 return href
def make_translator(catalog):
 messages=catalog['messages'];patterns=[]
 for source,target in messages.items():
  if re.search(r'\{\w+\}',source):
   names=[];parts=[]
   for part in re.split(r'(\{\w+\})',source):
    if re.fullmatch(r'\{\w+\}',part):names.append(part);parts.append('(.+?)')
    else:parts.append(re.escape(part))
   patterns.append((re.compile('^'+''.join(parts)+'$'),target,names))
 def translate(raw):
  key=re.sub(r'\s+',' ',str(raw).replace('\u00ad','')).strip()
  if not key:return str(raw)
  value=messages.get(key)
  if value is None:
   for expression,target,names in patterns:
    match=expression.fullmatch(key)
    if match:
     value=target
     for name,found in zip(names,match.groups()):value=value.replace(name,translate(found))
     break
  if value is None and re.search(r'\n\s*\n',str(raw)):return ''.join(p if p.isspace() else translate(p) for p in re.split(r'(\n\s*\n)',str(raw)))
  if value is None:
   numbered=re.match(r'^(\d+\.\s+)(.+)$',key)
   if numbered:value=numbered[1]+translate(numbered[2])
  if value is None:
   for separator in [' · ',' — ',' | ']:
    if separator in key:value=separator.join(translate(p) for p in key.split(separator));break
  if value is None:return str(raw)
  return re.match(r'^\s*',str(raw))[0]+value+re.search(r'\s*$',str(raw))[0]
 return translate
def language_picker(soup,path,lang):
 label={'fr':'Langue','en':'Language','es':'Idioma','it':'Lingua','de':'Sprache'}[lang]
 markup=f'<details class="language-picker"><summary aria-label="{label} : {lang.upper()}">{lang.upper()}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><nav class="language-options" aria-label="{label}">'
 for code in LANGS:markup+=f'<a data-language="{code}" href="{localpath(path,code)}" lang="{code}" hreflang="{code}"'+(' aria-current="true"' if code==lang else '')+f'>{NAMES[code]}</a>'
 return BeautifulSoup(markup+'</nav></details>','html.parser').details
def convert(html,lang,path,portfolio=False):
 soup=BeautifulSoup(html,'html.parser');translate=make_translator(json.loads((ROOT/f'assets/i18n/locales/{lang}.json').read_text(encoding='utf8')))
 for option in soup.select('option'):
  if not option.has_attr('value'):option['value']=option.get_text()
 for node in list(soup.find_all(string=True)):
  if isinstance(node,(Comment,Doctype)) or node.parent.name in ['script','style'] or node.parent.find_parent(class_='language-picker'):continue
  node.replace_with(NavigableString(translate(str(node))))
 for el in soup.find_all(True):
  if el.find_parent(class_='language-picker'):continue
  for attr in ['alt','aria-label','placeholder','title']:
   if el.has_attr(attr):el[attr]=translate(el[attr])
  if el.name=='meta' and (el.get('name')=='description' or el.get('property') in ['og:title','og:description']):el['content']=translate(el.get('content',''))
  for attr in ['href','src','poster']:
   if el.has_attr(attr):el[attr]=localpath(el[attr],lang)
  if el.name=='meta' and el.get('property')=='og:image' and el.get('content','').startswith(ORIGIN):el['content']=ORIGIN+localpath(el['content'][len(ORIGIN):],lang)
 soup.html['lang']=lang
 for track in soup.select('track[src*="pms-walkthrough.en.vtt"]'):
  track['src']=track['src'].replace('.en.vtt','.'+lang+'.vtt');track['srclang']=lang;track['label']=NAMES[lang]
 for old in soup.select('link[rel=alternate][hreflang]'):old.decompose()
 canonical=ORIGIN+localpath(path,lang)
 tag=soup.select_one('link[rel=canonical]')
 if tag:tag['href']=canonical
 for el in soup.select('meta[property="og:url"]'):el['content']=canonical
 for code in LANGS:
  tag=soup.new_tag('link',rel='alternate',hreflang=code,href=ORIGIN+localpath(path,code));soup.head.append(tag)
 soup.head.append(soup.new_tag('link',rel='alternate',hreflang='x-default',href=ORIGIN+localpath(path,'en' if portfolio else 'fr')))
 if not soup.select_one('link[href="/assets/i18n/language.css"]'):soup.head.append(soup.new_tag('link',rel='stylesheet',href='/assets/i18n/language.css'))
 if portfolio:
  for old in soup.select('.language-link'):old.decompose()
  nav=soup.select_one('.nav-links')
  if nav:nav.insert(0,language_picker(soup,path,lang))
  script=soup.new_tag('script',type='module',src='/assets/i18n/portfolio.js');soup.head.append(script)
 return str(soup)

for lang in LANGS:
 env={**os.environ,'MUNICIPAL_LOCALE':lang};subprocess.run(['node',str(ROOT/'tools/municipal/build.mjs')],cwd=ROOT,env=env,check=True)
 directory=ROOT/'demos/municipal-website'/('' if lang=='fr' else lang)
 routes=json.loads((directory/'routes.json').read_text(encoding='utf8'))
 for route in routes:
  path=ROOT/route['path'].lstrip('/')/'index.html';html=path.read_text(encoding='utf8');path.write_text(convert(html,lang,route['path']),encoding='utf8')
 print(lang,':',len(routes),'municipal pages',flush=True)
 for source in [ROOT/'tools/i18n/templates/index.html',*sorted((ROOT/'tools/i18n/templates/projects').glob('*.html'))]:
  relative=source.relative_to(ROOT/'tools/i18n/templates');url='/' if relative.as_posix()=='index.html' else '/'+relative.as_posix()
  target=ROOT/('' if lang=='en' else lang)/relative;target.parent.mkdir(parents=True,exist_ok=True)
  target.write_text(convert(source.read_text(encoding='utf8'),lang,url,True),encoding='utf8')
# Localised captions retain their original timing and video.
original=(ROOT/'assets/media/pms/pms-walkthrough.en.vtt').read_text(encoding='utf8')
for lang in LANGS:
 translate=make_translator(json.loads((ROOT/f'assets/i18n/locales/{lang}.json').read_text(encoding='utf8')))
 content='\n'.join(line if not line.strip() or '-->' in line or line=='WEBVTT' else translate(line) for line in original.splitlines())+'\n'
 if lang!='en':(ROOT/f'assets/media/pms/pms-walkthrough.{lang}.vtt').write_text(content,encoding='utf8')
print('Generated 375 municipal pages and 55 portfolio pages from shared sources.')
