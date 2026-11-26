import {dayISO} from './shared.js';
export const roomSlots=['09:00–12:00','14:00–18:00','18:30–22:00'];
export const appointmentSlots=['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];
export const services=['État civil','Urbanisme','Enfance et inscriptions','Vie municipale','Aide aux démarches'];
export function dateOptions(days=28){const result=[];for(let i=1;i<=days;i++){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);result.push(dayISO(d));}return result;}
export function slotsFor(state,kind,target,date){
 const d=new Date(date+'T12:00:00');const weekday=d.getDay();
 const all=kind==='reservation'?roomSlots:appointmentSlots;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<=dayISO()||date>dateOptions(90).at(-1))return [];
 if(kind==='rendez-vous'&&(weekday===0||weekday===6))return [];
 const room=state.rooms.find(r=>r.id===target);
 if(kind==='reservation'&&(!room||room.status!=='published'))return [];
 return all.map((slot,i)=>{
  const seedBlock=(d.getDate()+i+(kind==='reservation'?target.length:target.length+2))%7===0;
  const manual=kind==='reservation'&&room?.blocked?.includes(date+'|'+slot);
  const booked=state.requests.some(r=>r.kind===kind&&r.target===target&&r.date===date&&r.slot===slot&&!['Refusée','Annulée'].includes(r.status));
  return {slot,available:!(seedBlock||manual||booked)};
 });
}
