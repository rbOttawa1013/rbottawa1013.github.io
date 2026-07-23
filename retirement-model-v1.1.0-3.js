function applyScenario(name){state=scenarioState(name);renderAll()}
function load(){
 let raw=null;
 try{const v2=localStorage.getItem(STORAGE_KEY);if(v2){const payload=JSON.parse(v2);raw=payload&&payload.state?payload.state:payload}else{const legacy=localStorage.getItem(LEGACY_STORAGE_KEY);if(legacy)raw=JSON.parse(legacy)}}catch(e){console.warn('Retirement model storage load failed:',e)}
 state=sanitizeState(raw?{...DEFAULTS,...raw}:{...DEFAULTS});
}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:APP_META.storageSchema,appVersion:APP_META.version,savedAt:new Date().toISOString(),state}));toast('Saved to this browser.','good')}catch(e){console.error(e);toast('Could not save locally. Browser storage may be blocked.','bad')}}
function reset(){if(confirm('Reset all assumptions to the model defaults?')){state=sanitizeState({...DEFAULTS});try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY)}catch{}renderAll();toast('Model reset to defaults.','good')}}
function toast(msg,type='warn'){const el=document.getElementById('toast');if(!el)return;el.innerHTML=`<div class="callout ${type==='bad'?'danger':type==='warn'?'warning':''}">${escapeHtml(msg)}</div>`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.innerHTML='',4000)}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function selectedBuybacks(){const x=[];if(state.buy63)x.push('63-day');if(state.buy220)x.push('220-day');return x.length?x.join(' + '):'None'}
function inputAttrs(key,type){const b=INPUT_BOUNDS[key];if(!b)return '';const scale=type==='percent'?100:1;return ` min="${b[0]*scale}" max="${b[1]*scale}"`}
function renderForms(){const host=document.getElementById('assumptionForms');host.innerHTML=fields.map(([title,items])=>`<div class="form-section"><h3>${title}</h3><div class="form-grid">${items.map(([key,label,type,opts])=>fieldHtml(key,label,type,opts)).join('')}</div></div>`).join('');host.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('change',e=>{const k=e.target.dataset.key,t=e.target.dataset.type;const value=t==='check'?e.target.checked:t==='number'||t==='money'?Number(e.target.value):t==='percent'?Number(e.target.value)/100:e.target.value;state=sanitizeState({...state,[k]:value,scenario:'Custom'});document.getElementById('scenario').value='Custom';renderAll(true)}))}
function fieldHtml(key,label,type,opts){const v=state[key];if(type==='check')return `<div class="field"><label><input data-key="${key}" data-type="check" type="checkbox" ${v?'checked':''}>${label}</label></div>`;if(type==='select')return `<div class="field"><label>${label}</label><select data-key="${key}" data-type="select">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></div>`;let step='1',val=v;if(type==='percent'){step='.1';val=(v*100).toFixed(2)}else if(type==='number')step='.001';else if(type==='money')step='.01';return `<div class="field"><label>${label}</label><input data-key="${key}" data-type="${type}" type="${type==='date'?'date':'number'}" step="${step}"${inputAttrs(key,type)} value="${val}"><small>${type==='percent'?'Enter percent, e.g. 5 for 5%':''}</small></div>`}
function runSelfTests(){
 const original={...state},tests=[];try{state=sanitizeState({...DEFAULTS});const rows=project(),first=rows[0],last=rows[rows.length-1],b63=buybackRows().find(x=>x.name==='63-day only');
  tests.push(['Finite projection',rows.every(r=>Object.values(r).filter(v=>typeof v==='number').every(Number.isFinite))]);
  tests.push(['Service cap',service()<=35+1e-9]);
  tests.push(['63-day pension cross-check',Math.abs(b63.pre-421)<=5]);
  tests.push(['TFSA room non-negative',rows.every(r=>r.tfsaRoomEnd>=-1e-9)]);
  tests.push(['Asset reconciliation',rows.every(r=>Math.abs(r.total-(r.rrsp+r.tfsa+r.cash))<.01)]);
  tests.push(['First-year fraction',Math.abs(first.fraction-127/365)<1e-9]);
  tests.push(['Benefit PV no same-year double count',Math.abs(last.benefitPV)<.01]);
  state=sanitizeState({...DEFAULTS,baseService:34.95});const capped=buybackRows().find(x=>x.name==='Both');tests.push(['Buyback marginal service cap',capped.add<=.0500001]);
 }catch(e){tests.push(['Self-test execution',false,String(e)])}finally{state=sanitizeState(original)}return tests;
}
