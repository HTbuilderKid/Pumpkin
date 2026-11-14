import { createBody } from './body3d.js';
function send(event) {
  if (typeof window.cefQuery !== 'function') throw new Error('Java bridge unavailable');
  window.cefQuery({request:JSON.stringify(event),onSuccess(){},onFailure(code,msg){console.error(code,msg);}});
}
const message = document.querySelector('#message');
let viewer;
let selected = null, levels = {}, spinning = true;
const ids = new Set();
function select(id, notify = false) {
  if (id !== null && !ids.has(id)) throw new Error('Unknown system: ' + id);
  selected = id; viewer.select(id); if (notify) send({type:'pick',id});
}
function diagnostics() {
  return {...viewer.diagnostics(),selected,levels,spinning,
    markers:[...document.querySelectorAll('.marker')].map((m,i)=>({id:[...ids][i],visible:!m.hidden,label:m.textContent,transform:m.style.transform}))};
}
try {
  const response = await fetch('assets/systems.json');
  if (!response.ok) throw new Error('Could not load body systems');
  const systems = await response.json(); systems.forEach(s => ids.add(s.id));
  viewer = await createBody(document.querySelector('#body'),document.querySelector('#markers'),{systems},id=>select(id,true));
  window.bodyHost = {
    setLevels(next) {
      for (const [id,lv] of Object.entries(next)) if (!ids.has(id)||!Number.isInteger(lv)||lv<0||lv>3) throw new Error('Invalid severity');
      levels={...next}; viewer.setLevels(levels);
    },
    select,
    setSpinning(value) { spinning=Boolean(value); viewer.setSpinning(spinning); },
    diagnostics,
    report(requestId) { requestAnimationFrame(()=>send({type:'report',requestId,data:diagnostics()})); },
    dispose() { viewer.dispose(); },
  };
  message.hidden = true;
  requestAnimationFrame(()=>send({type:'ready',data:diagnostics()}));
} catch (e) {
  message.textContent='3D viewer failed: '+e.message;
  send({type:'error',message:e.stack || String(e)});
}
window.addEventListener('error',e=>send({type:'error',message:e.message}));
window.addEventListener('unhandledrejection',e=>send({type:'error',message:String(e.reason)}));
