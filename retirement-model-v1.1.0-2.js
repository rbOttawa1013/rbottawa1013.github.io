function projectionFraction(year){const ry=yearOf(state.retirementDate);if(year!==ry)return 1;const start=utcMs(state.retirementDate),end=Date.UTC(year,11,31);return clamp(((end-start)/DAY_MS+1)/daysInYear(year),0,1)}
function service(){return Math.min(35,state.baseService+(state.buy63?state.buy63Service:0)+(state.buy220?state.buy220Service:0))}
function pensionIndexFactor(year){const ry=yearOf(state.retirementDate);if(year<=ry)return 1;const fullMonths=Math.max(0,12-monthOf(state.retirementDate));const first=1+Math.max(0,state.pensionIndex)*fullMonths/12;return first*Math.pow(1+Math.max(0,state.pensionIndex),Math.max(0,year-ry-1))}
function annualLifetimePension(year,svc=service()){return ((.01375*Math.min(state.has,state.ampe)*svc)+(.02*Math.max(state.has-state.ampe,0)*svc))*pensionIndexFactor(year)}
function annualBridge(year,svc=service()){return .00625*Math.min(state.has,state.ampe)*svc*pensionIndexFactor(year)}
function cppAnnual(age,year){if(age<state.cppStart)return 0;const adj=state.cppStart<65?1-.072*(65-state.cppStart):1+.084*(state.cppStart-65);return state.cpp65*adj*Math.pow(1+state.benefitEscalation,Math.max(0,year-APP_META.modelBaseYear))}
function oasAnnual(age,year){if(age<state.oasStart)return 0;const defer=1+Math.min(.36,.072*Math.max(0,state.oasStart-65));const uplift=age>=75?1+state.oas75Uplift:1;return state.oas65*state.oasEligibilityPct*defer*uplift*Math.pow(1+state.benefitEscalation,Math.max(0,year-APP_META.modelBaseYear))}
function indexed(base,year){return base*Math.pow(1+state.inflation,Math.max(0,year-APP_META.modelBaseYear))}
function federalTax(income,age,pension,year,employmentIncome=0){
 income=Math.max(0,finiteNumber(income));const b=[58523,117045,181440,258482].map(x=>indexed(x,year)),r=[.14,.205,.26,.29,.33];
 let tax=Math.min(income,b[0])*r[0]+Math.max(Math.min(income,b[1])-b[0],0)*r[1]+Math.max(Math.min(income,b[2])-b[1],0)*r[2]+Math.max(Math.min(income,b[3])-b[2],0)*r[3]+Math.max(income-b[3],0)*r[4];
 const maxB=indexed(16452,year),minB=indexed(14829,year),bpa=income<=b[2]?maxB:income>=b[3]?minB:maxB-(income-b[2])/(b[3]-b[2])*(maxB-minB);
 const ageAmt=age>=65?Math.max(0,indexed(9209,year)-.15*Math.max(0,income-indexed(46432,year))):0,penAmt=Math.min(2000,Math.max(0,pension));
 const canadaEmployment=Math.min(indexed(1501,year),Math.max(0,employmentIncome));
 return Math.max(0,tax-.14*(bpa+ageAmt+penAmt+canadaEmployment));
}
function ontarioTax(income,age,pension,year){
 income=Math.max(0,finiteNumber(income));const b=[53891,107785,150000,220000].map(x=>indexed(x,year)),r=[.0505,.0915,.1116,.1216,.1316];
 let gross=Math.min(income,b[0])*r[0]+Math.max(Math.min(income,b[1])-b[0],0)*r[1]+Math.max(Math.min(income,b[2])-b[1],0)*r[2]+Math.max(Math.min(income,b[3])-b[2],0)*r[3]+Math.max(income-b[3],0)*r[4];
 const ageAmt=age>=65?Math.max(0,indexed(6341,year)-.15*Math.max(0,income-indexed(47210,year))):0,penAmt=Math.min(indexed(1795,year),Math.max(0,pension));
 let basic=Math.max(0,gross-.0505*(indexed(12989,year)+ageAmt+penAmt));
 const reductionBase=indexed(300,year),reduction=Math.min(basic,Math.max(0,2*reductionBase-basic));basic=Math.max(0,basic-reduction);
 const surtax=.20*Math.max(0,basic-indexed(5818,year))+.36*Math.max(0,basic-indexed(7446,year));
 let health=0;if(income>20000&&income<=36000)health=Math.min(300,.06*(income-20000));else if(income<=48000&&income>36000)health=Math.min(450,300+.06*(income-36000));else if(income<=72000&&income>48000)health=Math.min(600,450+.25*(income-48000));else if(income<=200000&&income>72000)health=Math.min(750,600+.25*(income-72000));else if(income>200000)health=Math.min(900,750+.25*(income-200000));
 return Math.max(0,basic+surtax+health);
}
function taxAndClawback(income,age,pension,year,oas,employmentIncome=0){const tax=federalTax(income,age,pension,year,employmentIncome)+ontarioTax(income,age,pension,year);const threshold=state.oasThreshold*Math.pow(1+state.inflation,Math.max(0,year-APP_META.modelBaseYear));const claw=Math.max(0,Math.min(oas,(income-threshold)*state.oasRecovery));return {tax,claw}}
function unpaidBuyback(){let v=0;if(state.buy63&&!state.buy63Paid)v+=state.buy63Cost;if(state.buy220&&!state.buy220Paid)v+=state.buy220Cost;return v}
function solveRrspDraw(age,year,baseIncome,pension,oas,employmentIncome,spending,available,minDraw,target){const fixed=Math.max(0,Math.min(available,Math.max(minDraw,target))),netAt=d=>{const inc=baseIncome+d,t=taxAndClawback(inc,age,pension,year,oas,employmentIncome);return inc-t.tax-t.claw};if(netAt(fixed)>=spending)return fixed;let lo=fixed,hi=available;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(netAt(mid)>=spending)hi=mid;else lo=mid}return Math.min(available,hi)}
function project(){
 state=sanitizeState(state);const rows=[],svc=service(),ry=yearOf(state.retirementDate);let rrsp=state.rrsp,tfsa=state.tfsa,cash=state.cash,room=state.tfsaRoom;
 for(let age=state.retirementAge;age<=state.endAge;age++){
  const year=ry+(age-state.retirementAge),fraction=projectionFraction(year),life=annualLifetimePension(year,svc)*fraction,bridge=age<state.bridgeEnd?annualBridge(year,svc)*fraction:0,cpp=cppAnnual(age,year),oas=oasAnnual(age,year);
  let employment=0,tsm=0,vac=0;
  if(state.projectionMode==='Full transition year'&&year===ry){const daysBefore=(utcMs(state.retirementDate)-Date.UTC(year,0,1))/DAY_MS;employment=state.currentSalary*clamp(daysBefore/daysInYear(year),0,1);tsm=state.currentSalary*state.tsmWeeks*state.tsmRetirementYearPct/52;vac=state.currentSalary/state.workdays*state.vacationDays}
  else if(state.projectionMode==='Full transition year'&&year===ry+1)tsm=state.currentSalary*state.tsmWeeks*(1-state.tsmRetirementYearPct)/52;
  const unpaid=age===state.retirementAge?unpaidBuyback():0,rrspRequested=age===state.retirementAge&&state.buybackFunding==='RRSP'?unpaid:0,rrspBuy=Math.min(rrsp,rrspRequested),rrspBuyShortfall=Math.max(0,rrspRequested-rrsp),cashBuy=age===state.retirementAge&&state.buybackFunding==='Cash'?unpaid:0;
  const available=Math.max(0,rrsp-rrspBuy),spendFrac=(year===ry&&state.projectionMode==='Post-retirement only')?fraction:1,spending=state.spending*Math.pow(1+state.spendingInflation,Math.max(0,year-ry))*spendFrac;
  const baseIncome=life+bridge+cpp+oas+employment+tsm+vac,pension=life+bridge,employmentCreditIncome=employment+vac,minDraw=age>=state.rrifStart?(RRIF[age]||.20)*available:0,targetDraw=state.rrspTargetDraw*(year===ry?fraction:1);
  const draw=solveRrspDraw(age,year,baseIncome,pension,oas,employmentCreditIncome,spending,available,minDraw,targetDraw),gross=baseIncome+draw,tc=taxAndClawback(gross,age,pension,year,oas,employmentCreditIncome),net=gross-tc.tax-tc.claw;
  const surplus=net-spending-cashBuy,tfsaRoomStart=room,contribution=Math.min(Math.max(surplus,0),state.tfsaContribution,room);room=Math.max(0,room-contribution);
  const floor=state.preserveFloor?state.emergencyFloor*Math.pow(1+state.inflation,Math.max(0,year-ry)):0;let cashDraw=0,tfsaDraw=0,unfunded=rrspBuyShortfall;
  if(surplus<0){let need=-surplus;cashDraw=Math.min(Math.max(cash-floor,0),need);need-=cashDraw;tfsaDraw=Math.min(tfsa,need);need-=tfsaDraw;unfunded+=Math.max(0,need)}
  const rr=Math.pow(1+(age===state.retirementAge?state.firstYearReturn:state.rrspReturn),fraction)-1,tr=Math.pow(1+(age===state.retirementAge?state.firstYearReturn:state.tfsaReturn),fraction)-1,cr=Math.pow(1+state.cashReturn,fraction)-1;
  rrsp=Math.max(0,(available-draw)*(1+rr));tfsa=Math.max(0,(tfsa+contribution-tfsaDraw)*(1+tr));cash=Math.max(0,(cash+Math.max(surplus,0)-contribution-cashDraw)*(1+cr));
  const total=rrsp+tfsa+cash;rows.push({age,year,fraction,life,bridge,cpp,oas,employment,tsm,vac,draw,gross,tax:tc.tax,claw:tc.claw,net,spending,surplus,contribution,tfsaRoomStart,tfsaRoomEnd:room,cashDraw,tfsaDraw,unfunded,rrsp,tfsa,cash,total,floor,buybackOutlay:cashBuy+rrspBuy,buybackFundingGap:rrspBuyShortfall});
  room=room+state.tfsaAnnualLimit+tfsaDraw;
 }
 // Rows hold end-of-year assets. benefitPV therefore excludes the current row's benefits to prevent double-counting.
 let futurePv=0;for(let i=rows.length-1;i>=0;i--){rows[i].benefitPV=futurePv;rows[i].economic=rows[i].total+futurePv;const def=Math.pow(1+state.inflation,Math.max(0,rows[i].year-ry));rows[i].realNet=rows[i].net/def;rows[i].realSpending=rows[i].spending/def;rows[i].realTotal=rows[i].total/def;const currentBenefits=rows[i].life+rows[i].bridge+rows[i].cpp+rows[i].oas;futurePv=(currentBenefits+futurePv)/(1+state.pvDiscount)}
 return rows;
}
function buybackRows(){
 const options=[['No buyback',0,0],['63-day only',state.buy63Service,state.buy63Cost],['220-day only',state.buy220Service,state.buy220Cost],['Both',state.buy63Service+state.buy220Service,state.buy63Cost+state.buy220Cost]],remainingCap=Math.max(0,35-state.baseService),ry=yearOf(state.retirementDate);
 return options.map(([name,requestedAdd,cost])=>{const add=Math.min(requestedAdd,remainingCap),pre=.02*state.has*add,life=((.01375*Math.min(state.has,state.ampe))+.02*Math.max(state.has-state.ampe,0))*add;let pv=0,t=0;for(let age=state.retirementAge;age<=state.endAge;age++,t++){const year=ry+t,fraction=projectionFraction(year),annual=(age<state.bridgeEnd?pre:life)*pensionIndexFactor(year)*fraction;pv+=annual/Math.pow(1+state.pvDiscount,t)}return {name,requestedAdd,add,cost,total:Math.min(35,state.baseService+add),pre,life,breakeven:pre?cost/pre:null,pv,npv:pv-cost,capped:add+1e-12<requestedAdd}});
}
function scenarioState(name){const next={...state};if(name!=='Custom'){for(const k of SCENARIO_KEYS)next[k]=DEFAULTS[k];Object.assign(next,SCENARIOS[name])}next.scenario=name;return sanitizeState(next)}
