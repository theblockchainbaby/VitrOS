/**
 * Actual VitrOS UI, synthetic demonstration records. No production APIs or DB.
 * Run from the repo: DESIGN_BASE_URL=http://127.0.0.1:3100 node scripts/design-product-image.cjs
 * The existing vitros-design app must already be serving on localhost.
 */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { setup, origin } = require('./design-fixtures.cjs');
// design-fixtures.cjs rejects non-localhost origins before capture starts.
const output = path.resolve(__dirname, '../public/images/product');
const reportOutput = path.resolve(__dirname, '../docs/design-verification');
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(reportOutput, { recursive: true });
const now = '2026-10-05T17:00:00Z';
const minutesAgo = n => new Date(new Date(now).getTime() - n * 60000).toISOString();
const cultivar = { id: 'c1', name: 'Monstera deliciosa', code: 'MD', species: 'Monstera deliciosa', cultivarType: 'ornamental', targetMultiplicationRate: 3, _count: { vessels: 480 }, createdAt: '2026-05-04T16:00:00Z', updatedAt: now };
const cultivars = [cultivar,
  { ...cultivar, id: 'c2', name: 'Philodendron Birkin', code: 'PB', species: 'Philodendron', _count: { vessels: 336 } },
  { ...cultivar, id: 'c3', name: 'Alocasia Polly', code: 'AP', species: 'Alocasia', _count: { vessels: 240 } },
  { ...cultivar, id: 'c4', name: 'Anthurium crystallinum', code: 'AC', species: 'Anthurium crystallinum', _count: { vessels: 192 } }];
const location = { id: 'l1', name: 'Growth room A / Shelf 04', type: 'shelf', capacity: 300, _count: { vessels: 228 }, site: { id: 's1', name: 'Demo tissue culture lab' }, children: [], isActive: true };
const recipe = { id: 'm1', name: 'MS multiplication', baseMedia: 'MS', targetPH: 5.8, stage: 'multiplication', isActive: true, components: [], batches: [], _count: { vessels: 480 }, createdAt: '2026-05-04T16:00:00Z', updatedAt: now };
const batch = { id: 'mb1', batchNumber: 'MS-2026-0921', recipeId: 'm1', recipe, volumeL: 5, vesselCount: 200, measuredPH: 5.8, autoclaved: true, createdAt: '2026-09-21T15:00:00Z', expiresAt: '2026-10-21T15:00:00Z', preparedBy: { id: 'u2', name: 'Maya Chen' } };
const people = [{ id: 'u1', name: 'Alex Rivera' }, { id: 'u2', name: 'Maya Chen' }, { id: 'u3', name: 'Sam Patel' }];
const activity = (id, vesselId, barcode, type, notes, minutes, user = people[0]) => ({ id, vesselId, vessel: { id: vesselId, barcode }, userId: user.id, user, type, category: 'production', previousState: null, newState: null, metadata: null, notes, createdAt: minutesAgo(minutes) });
const currentActivities = [
  activity('a1', 'v1', 'TC-2026-0042', 'health_check', 'Healthy shoots; ready to multiply.', 12, people[1]),
  activity('a6', 'v1', 'TC-2026-0042', 'moved', 'Moved to Growth room A / Shelf 04.', 1440, people[0]),
  { ...activity('a7', 'v1', 'TC-2026-0042', 'created', 'Established from parent TC-2026-0014 with 3 explants.', 0, people[1]), createdAt: '2026-09-21T17:30:00Z' },
];
const main = { id: 'v1', barcode: 'TC-2026-0042', cultivarId: 'c1', cultivar, mediaRecipeId: 'm1', mediaRecipe: recipe, mediaBatchId: 'mb1', mediaBatch: batch, locationId: 'l1', location, status: 'ready_to_multiply', stage: 'multiplication', healthStatus: 'healthy', explantCount: 3, subcultureNumber: 3, generation: 2, createdAt: '2026-09-21T17:30:00Z', updatedAt: minutesAgo(12), plantedAt: '2026-09-21T17:30:00Z', lastSubcultureDate: '2026-09-21T17:30:00Z', nextSubcultureDate: '2026-10-05T17:30:00Z', parentVesselId: 'p1', parentVessel: { id: 'p1', barcode: 'TC-2026-0014' }, activities: currentActivities, photos: [], childVessels: [], contaminationType: null, contaminationDate: null, disposalReason: null, notes: 'Uniform shoot growth. Ready for multiplication.', isOffType: false, isMotherPlant: false };
const vessels = [main, ...['TC-2026-0056', 'TC-2026-0071', 'TC-2026-0088'].map((barcode, i) => ({ ...main, id: `v${i+2}`, barcode, explantCount: 8, cultivar: cultivars[i + 1], cultivarId: cultivars[i + 1].id, activities: [], parentVessel: null, parentVesselId: null, updatedAt: minutesAgo([28, 47, 65][i]) }))];
const recentActivities = [currentActivities[0],
  activity('a2', 'v2', 'TC-2026-0056', 'status_changed', 'Ready for multiplication.', 28, people[0]),
  activity('a3', 'v9', 'TC-2026-0093', 'stage_advanced', 'Moved to rooting.', 36, people[2]),
  activity('a4', 'v3', 'TC-2026-0071', 'health_check', 'Healthy growth confirmed.', 47, people[1]),
  activity('a5', 'v4', 'TC-2026-0088', 'moved', 'Transferred to Shelf 04.', 65, people[0])];
const stats = { totalVessels: 1508, activeVessels: 1248, mediaPrepVessels: 96, totalExplants: 9984, contaminationRate: 3.2, multiplicationRate: 3.1, vesselsByStatus: [{ status: 'growing', count: 1244 }, { status: 'ready_to_multiply', count: 4 }, { status: 'media_filled', count: 96 }, { status: 'multiplied', count: 120 }, { status: 'disposed', count: 44 }], vesselsByStage: [{ stage: 'initiation', count: 192 }, { stage: 'multiplication', count: 704 }, { stage: 'rooting', count: 240 }, { stage: 'acclimation', count: 112 }], vesselsByCultivar: cultivars.map(c => ({ cultivarId: c.id, cultivarName: c.name, vesselCount: c._count.vessels, explantCount: c._count.vessels * 8 })), recentActivities, healthBreakdown: [{ status: 'healthy', count: 1144 }, { status: 'stable', count: 64 }, { status: 'critical', count: 40 }], readyToMultiply: vessels.map(v => ({ ...v, cultivarName: v.cultivar.name })), subcultureDue: { overdue: 8, today: 24, thisWeek: 96 } };
const analytics = { period: 'month', contaminationRate: 3.2, multiplicationRate: 3.1, growthTrends: Array.from({ length: 12 }, (_, i) => ({ date: `2026-09-${String(24+i).padStart(2,'0')}`, created: 28+i*3, multiplied: 18+i*2, disposed: i%3, contaminated: i%4, stage_advanced: 14+i*2 })).map((d,i) => ({...d,date:new Date(Date.UTC(2026,8,24+i)).toISOString().slice(0,10)})), contaminationByType: [{ type: 'Bacterial', count: 24 }, { type: 'Fungal', count: 16 }], contaminationByCultivar: cultivars.map((c,i) => ({ cultivar: c.name, count: [12,12,8,8][i] })), locationCapacity: [{ id: 'l1', name: location.name, capacity: 300, used: 228, pct: 76 }, { id: 'l2', name: 'Growth room A / Shelves 01–03', capacity: 900, used: 684, pct: 76 }, { id: 'l3', name: 'Growth room B', capacity: 600, used: 336, pct: 56 }], healthBreakdown: stats.healthBreakdown, stageBreakdown: stats.vesselsByStage };
const node = (id, barcode, generation, children = [], extra = {}) => ({ id, barcode, generation, cultivarName: cultivar.name, stage: 'multiplication', healthStatus: 'healthy', status: children.length ? 'multiplied' : 'growing', explantCount: 8, children, ...extra });
const lineage = { root: node('root', 'TC-2026-0001', 0, [
  node('p1','TC-2026-0014',1,[node('v1','TC-2026-0042',2,[],{status:'ready_to_multiply',explantCount:3}),node('v5','TC-2026-0043',2)]),
  node('p2','TC-2026-0015',1,[node('v6','TC-2026-0044',2),node('v7','TC-2026-0045',2,[],{healthStatus:'critical'})]),
  node('p3','TC-2026-0016',1,[node('v8','TC-2026-0046',2,[],{healthStatus:'stable'})]),
], { stage: 'initiation' }), currentVesselId: 'v1', totalNodes: 9, maxGeneration: 2 };
const responses = { '/api/auth/session': { user: { ...people[0], email: 'alex@example.test', role: 'admin', organizationId: 'demo-org', organizationName: 'Demo tissue culture lab' }, expires: '2099-01-01T00:00:00Z' }, '/api/stats': stats, '/api/stats/analytics': analytics, '/api/vessels': { vessels, total: vessels.length, page: 1, limit: 50, mediaPrepCount: 96 }, '/api/vessels/barcode': { found: true, vessel: main }, '/api/vessels/v1': main, '/api/vessels/v1/lineage': lineage, '/api/cultivars': cultivars, '/api/locations': [location], '/api/media-recipes': [recipe], '/api/media-batches': [batch], '/api/photos': [], '/api/billing': { plan:'enterprise',planName:'Enterprise',planStatus:'active',hasSubscription:true,limits:{maxVessels:10000,maxTeamMembers:50,currentVessels:1248,currentTeamMembers:8} }, '/api/settings': {name:'Demo tissue culture lab',plan:'enterprise',settings:{}}, '/api/alerts': {alerts:[],unreadCount:0}, '/api/protocols': [{id:'pr1',name:'Monstera multiplication',stage:'multiplication',version:3,steps:[{order:1,instruction:'Inspect and record vessel health before transfer.'}],isActive:true,safetyNotes:'Follow the laboratory’s approved SOP.'}] };
responses['/api/billing/status'] = responses['/api/billing'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:2,timezoneId:'America/Los_Angeles',colorScheme:'light',serviceWorkers:'block',reducedMotion:'reduce'});
  await setup(context);
  // Registered after setup, so explicit preview records take precedence. Every
  // remaining API request falls back to setup's fully intercepted response.
  await context.route('**/api/**', route => {
    const url = new URL(route.request().url());
    if (Object.hasOwn(responses,url.pathname)) return route.fulfill({json:responses[url.pathname]});
    return route.fallback();
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(now));
  const report = { provenance:'Actual VitrOS UI rendered locally with synthetic demonstration data; no production API or database.', baseURL:origin, capturedAt:now, viewport:{width:1440,height:1080}, screenshots:[], pageErrors:[] };
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const capture = async (name, route, ready) => {
    await page.goto(origin + route, { waitUntil:'networkidle' });
    await page.getByText(ready,{exact:true}).first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const dimensions = await page.evaluate(() => ({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
    if(dimensions.documentWidth > dimensions.width || dimensions.bodyWidth > dimensions.width) throw new Error(`${name}: horizontal page overflow`);
    await page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
    report.screenshots.push({name:name+'.png',route,dimensions});
    console.log(path.join(output,name+'.png'));
  };
  try {
    await capture('vessel-record','/vessels/v1','Vessel Details');
    await capture('tissue-culture-dashboard','/','Ready to multiply (4)');
    await capture('culture-lineage','/vessels/v1/lineage','9 vessels');
    await page.goto(origin+'/scan',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Scanner / type',exact:true}).click();
    await page.getByPlaceholder('Scan or type barcode...').fill(main.barcode);
    await page.getByPlaceholder('Scan or type barcode...').press('Enter');
    await page.getByRole('button',{name:'Update Vessel',exact:true}).waitFor();
    const scanDimensions = await page.evaluate(() => ({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
    if(scanDimensions.documentWidth > scanDimensions.width) throw new Error('Scan page overflow');
    await page.screenshot({path:path.join(output,'vessel-scanning.png'),animations:'disabled'});
    report.screenshots.push({name:'vessel-scanning.png',route:'/scan',barcode:main.barcode,dimensions:scanDimensions});
    console.log(path.join(output,'vessel-scanning.png'));
    await page.setViewportSize({width:1440,height:1300});
    await page.goto(origin+'/labels',{waitUntil:'networkidle'});
    await page.getByRole('checkbox',{name:'Select '+main.barcode,exact:true}).check();
    await page.getByLabel('Format',{exact:true}).click();
    await page.getByRole('option',{name:'QR Code',exact:true}).click();
    await page.getByRole('img',{name:'QR code '+main.barcode,exact:true}).waitFor();
    const labelDimensions = await page.evaluate(() => ({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
    if(labelDimensions.documentWidth > labelDimensions.width) throw new Error('Labels page overflow');
    await page.getByRole('img',{name:'QR code '+main.barcode,exact:true}).locator('..').screenshot({path:path.join(output,'vessel-label-preview.png')});
    await page.screenshot({path:path.join(output,'label-printing.png'),animations:'disabled'});
    report.screenshots.push({name:'label-printing.png',route:'/labels',barcode:main.barcode,dimensions:labelDimensions,format:'Actual application-generated QR code'});
    console.log(path.join(output,'label-printing.png'));
    fs.writeFileSync(path.join(reportOutput,'product-image-capture.json'),JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(reportOutput,'product-image-demo-data.json'),JSON.stringify({stats,analytics,main,lineage},null,2)+'\n');
    if(report.pageErrors.length) throw new Error(report.pageErrors.join('\n'));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
