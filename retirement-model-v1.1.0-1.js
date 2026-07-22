
'use strict';

/*
 * CALCULATION ENGINE / AI MAINTAINER MAP
 * --------------------------------------
 * APP_META: versioning and persisted-state schema.
 * DEFAULTS: user-specific starting assumptions; values are editable in the UI.
 * SCENARIOS: only scenario-managed variables. Personal balances and buyback payment status are not reset.
 * sanitizeState(): hard boundary that prevents invalid/NaN/unsafe state from entering calculations.
 * Pension functions: annualLifetimePension(), annualBridge(), pensionIndexFactor().
 * Tax functions: federalTax(), ontarioTax(), taxAndClawback(). 2026 Ontario base rules; future
 * thresholds are planning-indexed using the model inflation assumption, not a forecast of legislation.
 * project(): deterministic annual roll-forward. Account balances are END-OF-YEAR values.
 * benefitPV: PV of FUTURE gross government benefits AFTER each row's year-end; excludes current-year
 * benefits to avoid double-counting them with end-of-year financial assets.
 * buybackRows(): marginal service benefit is capped by the 35-year pensionable-service maximum.
 * runSelfTests(): calculation invariants. Add a test whenever a formula defect is fixed.
 */
const APP_META=Object.freeze({name:'Integrated Retirement Model',version:'1.1.0',storageSchema:2,modelBaseYear:2026,reviewed:'2026-07-22',auditPasses:22});
const STORAGE_KEY='retirementModelV2',LEGACY_STORAGE_KEY='retirementModelV1';
const money=new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0});
const money2=new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:2});
const num=new Intl.NumberFormat('en-CA',{maximumFractionDigits:3});
const pct=v=>(v*100).toFixed(1)+'%';
const DAY_MS=86400000;

const DEFAULTS={
 retirementAge:60,endAge:95,dateOfBirth:'',has:122076.84,baseService:31+351/365,ampe:69180,pensionIndex:.02,bridgeEnd:65,retirementDate:'2026-08-27',
 buy63:true,buy63Paid:true,buy63Service:63/365,buy63Cost:3400.61,buy220:true,buy220Paid:false,buy220Service:220/365,buy220Cost:12866.74,buybackFunding:'Cash',
 cppStart:65,cpp65:16500,oasStart:65,oas65:9023.64,oasEligibilityPct:1,oas75Uplift:.10,oasThreshold:95323,oasRecovery:.15,benefitEscalation:.02,
 rrsp:150000,tfsa:0,cash:0,rrspReturn:.05,tfsaReturn:.05,cashReturn:.02,firstYearReturn:.05,inflation:.02,spending:70000,spendingInflation:.02,
 tfsaContribution:7000,tfsaRoom:7000,tfsaAnnualLimit:7000,rrspTargetDraw:0,rrifStart:72,emergencyFloor:25000,preserveFloor:true,pvDiscount:.04,
 currentSalary:125912,tsmWeeks:52,tsmRetirementYearPct:.50,vacationDays:30,workdays:260,projectionMode:'Post-retirement only',dollarBasis:'nominal',scenario:'Base'
};
const SCENARIOS={
 Base:{rrspReturn:.05,tfsaReturn:.05,inflation:.02,spending:70000,spendingInflation:.02,pensionIndex:.02,benefitEscalation:.02,cppStart:65,oasStart:65,buy63:true,buy220:true,firstYearReturn:.05},
 Conservative:{rrspReturn:.035,tfsaReturn:.035,inflation:.025,spending:75000,spendingInflation:.025,pensionIndex:.025,benefitEscalation:.025,cppStart:65,oasStart:65,buy63:true,buy220:false,firstYearReturn:-.10},
 Growth:{rrspReturn:.065,tfsaReturn:.065,inflation:.02,spending:70000,spendingInflation:.02,pensionIndex:.02,benefitEscalation:.02,cppStart:70,oasStart:70,buy63:true,buy220:true,firstYearReturn:.065},
 'No Buybacks':{rrspReturn:.05,tfsaReturn:.05,inflation:.02,spending:70000,spendingInflation:.02,pensionIndex:.02,benefitEscalation:.02,cppStart:65,oasStart:65,buy63:false,buy220:false,firstYearReturn:.05},
 'High Inflation':{rrspReturn:.04,tfsaReturn:.04,inflation:.04,spending:75000,spendingInflation:.04,pensionIndex:.04,benefitEscalation:.04,cppStart:65,oasStart:65,buy63:true,buy220:true,firstYearReturn:-.05},
 Custom:{}
};
const SCENARIO_KEYS=['rrspReturn','tfsaReturn','inflation','spending','spendingInflation','pensionIndex','benefitEscalation','cppStart','oasStart','buy63','buy220','firstYearReturn'];
const RRIF={71:.0528,72:.0540,73:.0553,74:.0567,75:.0582,76:.0598,77:.0617,78:.0636,79:.0658,80:.0682,81:.0708,82:.0738,83:.0771,84:.0808,85:.0851,86:.0899,87:.0955,88:.1021,89:.1099,90:.1192,91:.1306,92:.1449,93:.1634,94:.1879,95:.20};
const AUDIT_LOG=[
 ['1','Versioning','No explicit app/schema version','Added v1.1.0, schema v2, visible badge and metadata.'],
 ['2','AI maintainability','Calculation assumptions were undocumented in source','Added AI maintainer map, safe-change rules and authoritative update areas.'],
 ['3','Persistence','Legacy localStorage had no schema/migration','Added versioned payload and v1 migration with sanitization.'],
 ['4','Input safety','Negative/invalid values could create NaN or impossible projections','Added sanitizeState(), bounds, enum/date validation and finite-number guards.'],
 ['5','Scenarios','Switching scenarios could retain stale managed values from prior/custom scenarios','Scenario-managed keys now reset to defaults before applying a scenario.'],
 ['6','Inflation stress','High-inflation scenario changed inflation but not pension/benefit/spending escalation','Scenario now aligns those inflation-sensitive assumptions explicitly.'],
 ['7','Date arithmetic','Local-time/DST date subtraction could skew first-year fractions','Replaced with UTC date arithmetic.'],
 ['8','Tax','Full transition-year employment omitted Canada Employment Amount credit','Added employment-income credit to federal planning tax.'],
 ['9','Ontario tax','Future surtax/tax-reduction thresholds were held at 2026 nominal values','Planning-indexed surtax and reduction base amounts.'],
 ['10','RRSP target draw','Annual target was not prorated in a partial retirement year','First-year target draw now uses the projection fraction.'],
 ['11','RRSP buyback','Buyback cost above available RRSP could disappear silently','Added explicit RRSP buyback funding shortfall and model warning.'],
 ['12','OAS','No partial-OAS eligibility factor','Added editable OAS eligibility percentage, default 100%.'],
 ['13','Benefit valuation','End-year assets were combined with PV including same-year benefits','PV now includes future benefits only, avoiding current-year double count.'],
 ['14','Buyback analysis','PV horizon and 5-year bridge were hard-coded; service cap not marginally applied','Buyback PV now follows model ages/bridge/end-age and effective service cap.'],
 ['15','Dashboard','Buyback summary could display “63-day None”; retirement pension KPI assumed under-65','Added selection helper and age-aware pension KPI.'],
 ['16','Charts','Single-year projections could divide by zero on x-axis','Chart renderer now handles one-point ranges and filters non-finite values.'],
 ['17','Export/save','CSV lacked version metadata/BOM; localStorage failures were uncaught','Added robust CSV metadata/escaping and storage error handling.'],
 ['18','Accessibility/QA','Tabs lacked ARIA state/keyboard behavior and there were no embedded regression tests','Added accessible tabs, live toast and runSelfTests() invariants.'],
 ['19','Percent inputs','HTML min/max used fractional bounds while displayed values were whole percentages','Percentage bounds are now scaled to displayed percent units.'],
 ['20','Real-dollar view','Today-dollar table/KPIs converted only selected columns, mixing nominal and real values','All monetary projection columns and asset KPIs now use one selected basis consistently.'],
 ['21','Horizon / age consistency','Projection text was hard-coded to 60–95 and DOB was not checked against retirement age','Made horizon text dynamic and added DOB/retirement-age consistency check.'],
 ['22','Compatibility / final QA','Used newer Object.hasOwn and needed a final regression sweep','Switched to broadly compatible hasOwnProperty call and completed syntax/self-test/static validation.']
];
let state={...DEFAULTS};

const fields=[
 ['Personal & Public Service Pension',[
  ['retirementDate','Retirement date','date'],['dateOfBirth','Date of birth (optional; validation only)','date'],['retirementAge','Retirement age used for annual rows','number'],['endAge','Projection end age','number'],
  ['has','Best-5 average salary','money'],['baseService','Base pensionable service (years)','number'],['ampe','AMPE / coordination base','money'],['pensionIndex','Pension indexing assumption','percent'],['bridgeEnd','Bridge ends at age','number']]],
 ['Buybacks',[
  ['buy63','Include 63-day buyback','check'],['buy63Paid','63-day cost already paid','check'],['buy63Cost','63-day cost','money'],['buy220','Include 220-day NRC buyback','check'],['buy220Paid','220-day cost already paid','check'],['buy220Cost','220-day cost','money'],['buybackFunding','Funding source for unpaid buybacks','select',['Cash','RRSP']]]],
 ['CPP / OAS',[
  ['cppStart','CPP start age','number'],['cpp65','CPP annual at age 65 (base-year $)','money'],['oasStart','OAS start age','number'],['oas65','OAS annual at age 65 (base-year $)','money'],['oasEligibilityPct','OAS eligibility percentage','percent'],
  ['benefitEscalation','CPP/OAS annual escalation','percent'],['oas75Uplift','OAS age-75 uplift','percent'],['oasThreshold','OAS recovery threshold (2026)','money'],['oasRecovery','OAS recovery rate','percent']]],
 ['Assets & Spending',[
  ['rrsp','RRSP/RRIF opening balance','money'],['tfsa','TFSA opening balance','money'],['cash','Cash/non-registered opening balance','money'],['rrspReturn','RRSP/RRIF long-run return','percent'],['tfsaReturn','TFSA long-run return','percent'],['cashReturn','Cash/non-registered return','percent'],
  ['firstYearReturn','First-year risky-asset return','percent'],['inflation','Inflation','percent'],['spending','Annual spending target','money'],['spendingInflation','Spending inflation','percent'],['emergencyFloor','Emergency cash floor','money'],['preserveFloor','Preserve cash floor','check']]],
 ['TFSA / RRIF',[
  ['tfsaRoom','Opening TFSA contribution room','money'],['tfsaAnnualLimit','Annual TFSA dollar limit','money'],['tfsaContribution','Planned annual TFSA contribution','money'],['rrifStart','RRIF minimum draw starts age','number'],['rrspTargetDraw','Target annual RRSP draw before RRIF','money']]],
 ['Valuation & Transition Year',[
  ['pvDiscount','Benefit PV discount rate','percent'],['projectionMode','Projection mode','select',['Post-retirement only','Full transition year']],['currentSalary','Current salary','money'],['tsmWeeks','TSM weeks','number'],['tsmRetirementYearPct','TSM share paid in retirement year','percent'],['vacationDays','Vacation payout days','number'],['workdays','Workdays per year','number']]]
];
const INPUT_BOUNDS={retirementAge:[50,80],endAge:[50,110],has:[0,1e7],baseService:[0,35],ampe:[0,1e7],pensionIndex:[0,.15],bridgeEnd:[60,70],buy63Cost:[0,1e7],buy220Cost:[0,1e7],cppStart:[60,70],cpp65:[0,1e6],oasStart:[65,70],oas65:[0,1e6],oasEligibilityPct:[0,1],benefitEscalation:[0,.15],oas75Uplift:[0,1],oasThreshold:[0,1e7],oasRecovery:[0,1],rrsp:[0,1e9],tfsa:[0,1e9],cash:[0,1e9],rrspReturn:[-.95,1],tfsaReturn:[-.95,1],cashReturn:[-.95,1],firstYearReturn:[-.95,1],inflation:[-.05,.15],spending:[0,1e7],spendingInflation:[-.05,.15],emergencyFloor:[0,1e8],tfsaRoom:[0,1e8],tfsaAnnualLimit:[0,1e6],tfsaContribution:[0,1e7],rrifStart:[71,95],rrspTargetDraw:[0,1e8],pvDiscount:[0,.25],currentSalary:[0,1e7],tsmWeeks:[0,104],tsmRetirementYearPct:[0,1],vacationDays:[0,365],workdays:[1,366]};

function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function finiteNumber(v,fallback=0){const n=Number(v);return Number.isFinite(n)?n:fallback}
function isoParts(value){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));if(!m)return null;const y=+m[1],mo=+m[2],d=+m[3],dt=new Date(Date.UTC(y,mo-1,d));return dt.getUTCFullYear()===y&&dt.getUTCMonth()===mo-1&&dt.getUTCDate()===d?{y,mo,d}:null}
function utcMs(value){const p=isoParts(value);return p?Date.UTC(p.y,p.mo-1,p.d):NaN}
function daysInYear(y){return ((y%4===0&&y%100!==0)||y%400===0)?366:365}
function yearOf(d){const p=isoParts(d);return p?p.y:APP_META.modelBaseYear}
function monthOf(d){const p=isoParts(d);return p?p.mo:12}
function ageAtDate(birth,date){const b=isoParts(birth),d=isoParts(date);if(!b||!d)return null;let age=d.y-b.y;if(d.mo<b.mo||(d.mo===b.mo&&d.d<b.d))age--;return age}
function sanitizeState(raw){
 const s={...DEFAULTS,...(raw||{})};
 for(const [k,[lo,hi]] of Object.entries(INPUT_BOUNDS))s[k]=clamp(finiteNumber(s[k],DEFAULTS[k]),lo,hi);
 for(const k of ['retirementAge','endAge','bridgeEnd','cppStart','oasStart','rrifStart','workdays'])s[k]=Math.round(s[k]);
 s.endAge=Math.max(s.retirementAge,s.endAge);
 s.retirementDate=isoParts(s.retirementDate)?s.retirementDate:DEFAULTS.retirementDate;
 s.dateOfBirth=isoParts(s.dateOfBirth)?s.dateOfBirth:'';
 s.projectionMode=['Post-retirement only','Full transition year'].includes(s.projectionMode)?s.projectionMode:DEFAULTS.projectionMode;
 s.dollarBasis=['nominal','real'].includes(s.dollarBasis)?s.dollarBasis:DEFAULTS.dollarBasis;
 s.buybackFunding=['Cash','RRSP'].includes(s.buybackFunding)?s.buybackFunding:DEFAULTS.buybackFunding;
 s.scenario=Object.prototype.hasOwnProperty.call(SCENARIOS,s.scenario)?s.scenario:'Custom';
 for(const k of ['buy63','buy63Paid','buy220','buy220Paid','preserveFloor'])s[k]=Boolean(s[k]);
 return s;
}
