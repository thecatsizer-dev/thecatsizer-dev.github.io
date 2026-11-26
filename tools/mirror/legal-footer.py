"""Restore the original publisher information after a portfolio build or sync."""
from pathlib import Path
from bs4 import BeautifulSoup
import json
ROOT=Path(__file__).resolve().parents[2]
DATA=json.loads((Path(__file__).parent/'legal.json').read_text(encoding='utf8'))
labels={'fr':'Mentions légales et contact','en':'Legal notice and contact','it':'Note legali e contatti','es':'Aviso legal y contacto','de':'Impressum und Kontakt'}
count=0
for lang,prefix in [('en',''),('fr','fr'),('it','it'),('es','es'),('de','de')]:
 for file in [ROOT/prefix/'index.html',*sorted((ROOT/prefix/'projects').glob('*.html'))]:
  soup=BeautifulSoup(file.read_text(encoding='utf8'),'html.parser');footer=soup.select_one('.site-footer')
  if not footer:continue # Legacy redirects do not carry the portfolio layout.
  for old in soup.select('.publisher-legal'):old.decompose()
  if not soup.select_one('link[href="/assets/publisher-legal.css"]'):
   soup.head.append(soup.new_tag('link',rel='stylesheet',href='/assets/publisher-legal.css'))
  section=soup.new_tag('section',attrs={'class':'wrap publisher-legal','aria-labelledby':'publisher-legal-title'})
  heading=soup.new_tag('h2',id='publisher-legal-title');heading.string=labels[lang];section.append(heading)
  details=soup.new_tag('div',attrs={'class':'publisher-legal-grid','lang':'fr'})
  for line in DATA['paragraphs']:
   p=soup.new_tag('p')
   if line.startswith('Contact : '):
    p.append('Contact : ');a=soup.new_tag('a',href='tel:+33645372106');a.string=line[len('Contact : '):];p.append(a)
   elif line.startswith('Mail : '):
    p.append('Mail : ');a=soup.new_tag('a',href='mailto:'+line[len('Mail : '):]);a.string=line[len('Mail : '):];p.append(a)
   else:p.string=line
   details.append(p)
  section.append(details);footer.append(section);file.write_text(str(soup),encoding='utf8');count+=1
print('Preserved the six original legal/contact paragraphs on',count,'portfolio pages.')
