import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {messages} from '../../assets/analytics/messages.js';
const source=readFileSync(new URL('../../assets/analytics/analytics.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
function run({id='G-TEST12345',saved=null,blocked=false,language='fr',gpc=false}={}){
 const elements=[],cookies=[],stored=new Map(),reloads=[];
 if(saved)stored.set('tcl.analytics-consent.v1',JSON.stringify(saved));
 const element=tag=>{const el={tag,children:[],events:{},hidden:false,append(...v){this.children.push(...v);},setAttribute(k,v){this[k]=v;},addEventListener(k,v){this.events[k]=v;},focus(){el.focused=true;}};elements.push(el);return el;};
 const footer=element('footer'),head=element('head'),body=element('body');
 const document={head,body,documentElement:{lang:language},referrer:'https://example.com/private?email=private@example.test',createElement:element,querySelector:()=>footer};
 Object.defineProperty(document,'cookie',{get:()=> '_ga=old; _ga_TEST12345=old; application=keep',set:v=>cookies.push(v)});
 const location={hostname:'thecatsizerlab.github.io',origin:'https://thecatsizerlab.github.io',pathname:'/fr/projects/wordpress-pms.html',search:'?email=private@example.test',reload:()=>reloads.push(true)};
 const localStorage={getItem:k=>{if(blocked)throw Error('blocked');return stored.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');stored.set(k,v);}};
 const context={id,messages,document,location,localStorage,navigator:{globalPrivacyControl:gpc},URL,Date,window:{}};
 vm.runInNewContext(source,context);
 const button=label=>elements.find(e=>e.tag==='button'&&e.textContent===label);
 return {context,elements,head,cookies,stored,reloads,button,panel:elements.find(e=>e.tag==='section'),scripts:()=>elements.filter(e=>e.tag==='script')};
}
test('disabled configuration has no UI, cookies or network tag',()=>{const x=run({id:''});assert.equal(x.panel,undefined);assert.equal(x.scripts().length,0);assert.equal(x.cookies.length,0);});
test('all five languages offer equally available accept and reject with no pre-consent tag',()=>{for(const language of Object.keys(messages)){const x=run({language});assert.equal(x.panel.hidden,false);assert.ok(x.button(messages[language].accept));assert.ok(x.button(messages[language].reject));assert.equal(x.scripts().length,0);}});
test('rejection persists and removes only Analytics cookies without loading Google',()=>{const x=run();x.button(messages.fr.reject).events.click();assert.equal(JSON.parse(x.stored.get('tcl.analytics-consent.v1')).allowed,false);assert.equal(x.scripts().length,0);assert.ok(x.cookies.some(c=>c.startsWith('_ga=')));assert.ok(x.cookies.every(c=>!c.startsWith('application=')));});
test('acceptance loads a single tag with sanitized URLs and denied advertising',()=>{const x=run();x.button(messages.fr.accept).events.click();x.button(messages.fr.accept).events.click();assert.equal(x.scripts().length,1);const events=x.context.window.dataLayer.map(x=>Array.from(x));const config=events.find(x=>x[0]==='config')[2];assert.equal(config.page_location,'https://thecatsizerlab.github.io/fr/projects/wordpress-pms.html');assert.equal(config.page_referrer,'https://example.com/');assert.equal(config.allow_google_signals,false);assert.equal(config.cookie_domain,'none');assert.equal(events.find(x=>x[0]==='consent'&&x[1]==='update')[2].ad_user_data,'denied');});
test('withdrawal immediately disables collection and reloads after clearing cookies',()=>{const x=run({saved:{allowed:true,at:Date.now()}});assert.equal(x.scripts().length,1);x.button(messages.fr.reject).events.click();assert.equal(x.context.window['ga-disable-G-TEST12345'],true);assert.equal(x.reloads.length,1);assert.equal(JSON.parse(x.stored.get('tcl.analytics-consent.v1')).allowed,false);});
test('expired choices require a new decision; a saved refusal blocks loading',()=>{let x=run({saved:{allowed:true,at:Date.now()-181*86400000}});assert.equal(x.scripts().length,0);assert.equal(x.panel.hidden,false);x=run({saved:{allowed:false,at:Date.now()}});assert.equal(x.scripts().length,0);assert.equal(x.panel.hidden,true);});
test('blocked storage and privacy signals remain usable without collecting silently',()=>{const x=run({blocked:true,gpc:true});assert.equal(x.panel.hidden,true);assert.equal(x.scripts().length,0);x.button(messages.fr.settings).events.click();assert.equal(x.panel.hidden,false);x.button(messages.fr.reject).events.click();assert.equal(x.scripts().length,0);});
