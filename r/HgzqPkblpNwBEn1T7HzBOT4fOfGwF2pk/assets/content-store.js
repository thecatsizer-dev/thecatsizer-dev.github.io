import {clone,validateState} from './model.js';
export const root=new URL('../',import.meta.url);
export const storageKey='powerhouse-v2-editor:'+root.pathname;
export const baseline=await fetch(new URL('assets/data.json',root)).then(r=>{if(!r.ok)throw Error('Unable to load initial content.');return r.json();});
export const layouts=await fetch(new URL('assets/layouts.json',root)).then(r=>r.json());
export function read(){try{const saved=localStorage.getItem(storageKey);if(saved)return validateState(JSON.parse(saved));}catch(e){console.warn('Local content could not be read; initial content is shown.',e.message);}return clone(baseline);}
export function save(s){validateState(s);try{localStorage.setItem(storageKey,JSON.stringify(s));}catch{throw Error('Browser storage is full or unavailable. Use a smaller image or export a backup before continuing.');}window.dispatchEvent(new CustomEvent('ph:saved'));}
export function restore(){const fresh=clone(baseline);save(fresh);return fresh;}
export const absolute=value=>value?.startsWith('assets/')?new URL(value,root).href:value;
