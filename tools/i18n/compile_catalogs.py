"""Compile reviewed source catalogues; no machine translation or network calls."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[2]
LANGS=['fr','en','es','it','de']
messages={lang:{} for lang in LANGS}
municipal_sources=[]
existing_fr=json.loads((ROOT/'tools/i18n/portfolio-existing-fr.json').read_text(encoding='utf8')) if (ROOT/'tools/i18n/portfolio-existing-fr.json').exists() else {}
def norm(s):return re.sub(r'\s+',' ',s).strip()
def add(source,values,targets):
 for lang,value in zip(targets,values):messages[lang][norm(source)]=value
for group,targets in [('portfolio',['fr','es','it','de']),('municipal',['en','es','it','de'])]:
 sources=json.loads((ROOT/f'tools/i18n/{group}-messages.json').read_text(encoding='utf8'))
 for path in sorted((ROOT/'tools/i18n').glob(group+'-*.tsv')):
  for number,line in enumerate(path.read_text(encoding='utf8').splitlines(),1):
   if not line.strip():continue
   parts=line.split('\t')
   if len(parts)!=5:raise ValueError(f'{path.name}:{number}: expected five tab-separated columns')
   source=sources[int(parts[0])] if parts[0].isdigit() else parts[0]
   values=parts[1:]
   if group=='portfolio' and values[0]=='=':values[0]=existing_fr[source]
   add(source,values,targets)
   if group=='municipal':
    messages['fr'][norm(source)]=norm(source);municipal_sources.append(norm(source))
   else:messages['en'][norm(source)]=norm(source)
out=ROOT/'assets/i18n/locales';out.mkdir(parents=True,exist_ok=True)
for lang in LANGS:
 if lang=='de':
  breaks={'Unternehmenssoftware':'Unternehmens\u00adsoftware','Bürgerangelegenheiten':'Bürger\u00adangelegen\u00adheiten','Gemeinderatssitzung':'Gemeinderats\u00adsitzung','Verfügbarkeit':'Verfüg\u00adbarkeit','Bürgeranliegen':'Bürger\u00adanliegen','Veranstaltungen':'Veranstal\u00adtungen'}
  for source,value in messages[lang].items():
   for word,broken in breaks.items():value=value.replace(word,broken)
   messages[lang][source]=value
 (out/(lang+'.json')).write_text(json.dumps({'messages':messages[lang],'municipalSources':list(dict.fromkeys(municipal_sources))},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print('Compiled reviewed catalogues:',{lang:len(rows) for lang,rows in messages.items()})
(ROOT/'assets/i18n/studio-messages.js').write_text('export const messages='+json.dumps({lang:{key:rows[key] for key in ['Pause animations','Resume animations']} for lang,rows in messages.items()},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
