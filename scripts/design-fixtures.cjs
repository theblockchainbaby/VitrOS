const fs=require('node:fs');
const path=require('node:path');
const output=path.resolve(__dirname,'../docs/design-verification');
fs.mkdirSync(path.join(output,'screenshots'),{recursive:true});
const origin=process.env.DESIGN_BASE_URL || 'http://127.0.0.1:3100';
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw new Error('Design verification accepts localhost only.');
const now='2026-10-05T12:00:00Z';
const cultivar={id:'c1',name:'Monstera deliciosa · extended cultivar name for responsive verification',code:'MD',species:'Monstera deliciosa',cultivarType:'ornamental',targetMultiplicationRate:3,_count:{vessels:2},createdAt:now,updatedAt:now};
const loc={id:'l1',name:'Growth room A / Shelf 04',type:'shelf',capacity:300,_count:{vessels:2},site:{id:'s1',name:'Research lab'},children:[],isActive:true};
const vessels=['VIT-2026-LONG-BARCODE-00000001','VIT-2026-0002'].map((barcode,i)=>({id:`v${i+1}`,barcode,cultivarId:'c1',cultivar,locationId:'l1',location:loc,status:'growing',stage:'multiplication',healthStatus:'healthy',explantCount:10,subcultureNumber:2,generation:2,createdAt:now,updatedAt:now,nextSubcultureDate:now,activities:[],photos:[],childVessels:[],notes:null}));
const stats={totalVessels:20,activeVessels:12,mediaPrepVessels:4,totalExplants:120,contaminationRate:0,multiplicationRate:3,vesselsByStatus:[{status:'growing',count:12}],vesselsByStage:[{stage:'multiplication',count:8},{stage:'initiation',count:4}],vesselsByCultivar:[{cultivarId:'c1',cultivarName:cultivar.name,vesselCount:12,explantCount:120}],recentActivities:[],healthBreakdown:[{status:'healthy',count:12}],readyToMultiply:vessels.map(v=>({...v,cultivarName:cultivar.name})),subcultureDue:{overdue:2,today:0,thisWeek:2}};
const analytics={period:'month',contaminationRate:0,multiplicationRate:3,growthTrends:[],contaminationByType:[],contaminationByCultivar:[],locationCapacity:[{id:'l1',name:loc.name,capacity:300,used:12,pct:4}],healthBreakdown:stats.healthBreakdown,stageBreakdown:stats.vesselsByStage};
const recipe={id:'m1',name:'MS multiplication · standard media',baseMedia:'MS',targetPH:5.8,stage:'multiplication',isActive:true,components:[],batches:[],_count:{vessels:2},createdAt:now,updatedAt:now};
const batch={id:'mb1',batchNumber:'MEDIA-2026-001',recipeId:'m1',recipe,volumeL:2,vesselCount:20,measuredPH:5.8,autoclaved:true,createdAt:now,expiresAt:'2027-01-01T00:00:00Z',preparedBy:{id:'u1',name:'Design reviewer'}};
const clone={id:'cl1',name:'Mother line one',code:'ML-01',lineNumber:1,status:'active',sourceType:'mother_plant',cultivar,startDate:now,lastTestResult:'clean',lastTestedAt:now,vesselCount:2,byStage:{multiplication:2},pathogenTests:[],createdAt:now};
const inventory={id:'i1',name:'Agar powder · 1 kg laboratory stock',category:'chemical',unit:'g',currentStock:250,reorderLevel:100,supplier:'Fixture supplier',isActive:true,createdAt:now,updatedAt:now,usageLogs:[],usage:[]};
async function setup(context,{authenticated=true,failStats=false}={}){
 await context.addInitScript(()=>{localStorage.setItem('vitros_welcome_dismissed','1');localStorage.setItem('theme','light')});
 if(authenticated)await context.addCookies([{name:'authjs.session-token',value:'local-browser-fixture',domain:new URL(origin).hostname,path:'/'}]);
 await context.route('**/api/**',async route=>{
  const u=new URL(route.request().url());const p=u.pathname;
  let data=[];
  if(p==='/api/auth/session')data=authenticated?{user:{id:'u1',name:'Design reviewer',email:'fixture@example.test',role:'admin',organizationId:'fixture-org',organizationName:'Botanical research lab'},expires:'2099-01-01T00:00:00Z'}:null;
  else if(p==='/api/stats'){if(failStats)return route.fulfill({status:503,json:{error:'Fixture service unavailable'}});data=stats}
  else if(p==='/api/stats/analytics')data=analytics;
  else if(p==='/api/vessels')data={vessels,total:2,page:1,limit:50,mediaPrepCount:0};
  else if(p==='/api/vessels/barcode')data={found:true,vessel:vessels[0]};
  else if(p==='/api/vessels/due-subculture')data=u.searchParams.get('range')==='today'?[]:vessels;
  else if(p==='/api/vessels/v1')data=vessels[0];
  else if(p==='/api/cultivars')data=[cultivar];
  else if(p==='/api/cultivars/c1')data={...cultivar,vessels,cloneLines:[clone],metrics:{totalVessels:2,activeVessels:2,disposedVessels:0,totalExplants:20,contaminationRate:0,healthyRate:100,cultivarHealth:'healthy',vesselsByStage:stats.vesselsByStage,vesselsByHealthStatus:stats.healthBreakdown,vesselsByStatus:stats.vesselsByStatus}};
  else if(p==='/api/locations')data=[loc];
  else if(p==='/api/locations/l1')data={...loc,vessels};
  else if(p==='/api/clone-lines')data=[clone];
  else if(p==='/api/clone-lines/cl1')data=clone;
  else if(p==='/api/inventory')data=u.searchParams.get('filter')==='low_stock'?[]:[inventory];
  else if(p==='/api/inventory/i1')data=inventory;
  else if(p==='/api/media-recipes')data=[recipe];
  else if(p==='/api/media-recipes/m1')data=recipe;
  else if(p==='/api/media-batches')data=[batch];
  else if(p==='/api/sites')data=[{id:'s1',name:'Research lab',locations:[loc]}];
  else if(p==='/api/protocols')data=[{id:'pr1',name:'Multiplication protocol',stage:'multiplication',version:1,steps:[{order:1,instruction:'Prepare the working area.'}],isActive:true,safetyNotes:'Follow approved laboratory procedures.'}];
  else if(p==='/api/vessels/v1/lineage')data={root:{...vessels[0],cultivarName:cultivar.name,children:[]},currentVesselId:'v1',totalNodes:1,maxGeneration:2};
  else if(p==='/api/alerts')data={alerts:[],unreadCount:0};
  else if(p==='/api/billing'||p==='/api/billing/status')data={plan:'free',planName:'Free',planStatus:'active',hasSubscription:false,limits:{maxVessels:100,maxTeamMembers:5,currentVessels:2,currentTeamMembers:1}};
  else if(p==='/api/team-performance')data={period:{from:now,to:now,type:'week'},config:{baseHourlyRate:16,pointDollarValue:0.025,contaminationThreshold:5,dailyVesselTarget:100,bonusPeriod:'weekly',enableIncentives:false},team:{totalVessels:0,totalPoints:0,totalHours:0,avgEffectiveRate:0,avgContaminationRate:0,totalBonusPool:0,eligibleCount:0,techCount:0},technicians:[],stations:[],flaggedMediaBatches:[]};
  else if(p==='/api/analytics')data={...analytics,startDate:now,endDate:now,totalActive:12,totalContaminated:0,multiplicationEvents:0,totalCreated:12,productionTrends:[],contaminationTrend:[],cultivarPerformance:[],survivalFunnel:[],cycleTime:[],healthDistribution:[]};
  else if(p==='/api/settings')data={name:'Fixture lab',plan:'free',settings:{}};
  else if(p.includes('/forecast'))data={};
  else if(p==='/api/users')data=[];
  return route.fulfill({json:data});
 });
}

module.exports={setup,stats,analytics,vessels,cultivar,loc,now,output,origin,recipe,batch,clone,inventory};
