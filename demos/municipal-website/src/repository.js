import {seed} from './data.js';
export const STORAGE_KEY='valmer-municipal-demo-v1';
const collections=['pages','news','events','directory','rooms','alerts','requests'];
const clone=v=>JSON.parse(JSON.stringify(v));
let memory=clone(seed), persistent=true;
// Replace this adapter with an HTTP/CMS repository for a real deployment.
// localStorage is demo persistence, never authentication or a shared database.
export function load(){
  try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(raw?.schema===1){for(const key of collections)if(Array.isArray(raw[key]))memory[key]=raw[key].filter(x=>x&&typeof x==='object'&&typeof x.id==='string');}}
  catch{persistent=false;}
  return clone(memory);
}
export function persist(state){memory=clone(state);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(memory));persistent=true;}catch{persistent=false;}return persistent;}
export const storageAvailable=()=>persistent;
export function reset(){memory=clone(seed);return persist(memory);}
export function upsert(state,type,item){if(!collections.includes(type))throw Error('Collection inconnue');const next=clone(state);const index=next[type].findIndex(x=>x.id===item.id);if(index<0)next[type].unshift(item);else next[type][index]=item;persist(next);return next;}
export const published=(state,type)=>state[type].filter(x=>x.status==='published');
export const makeId=(prefix='item')=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
