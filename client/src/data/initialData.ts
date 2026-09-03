import { Order, Driver, DeliveryRoute, SkuDwellSetting, BrandTheme, Depot } from '../types';

export const KALSI_BRAND_THEME: BrandTheme = {
  companyName: 'Kalsi Plastics',
  tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
  logoText: 'KALSI',
  primaryColour: '#0F1E36', // Kalsi Navy
  secondaryColour: '#0072CE', // Kalsi Blue
  accentColour: '#16A34A', // Kalsi Green
  headerBgColour: '#0F1E36',
};

export const UK_DEPOTS: Depot[] = [
  { id: 'depot-all', code: 'ALL', name: 'All 22 UK Depots (National Overview)', region: 'UK Nationwide', city: 'National', address: '22 Distribution Hubs', lat: 52.4862, lng: -1.8904, activeVansCount: 48 },
  { id: 'depot-bhm', code: 'BHM', name: 'Birmingham Central (Kalsi Main Works)', region: 'Midlands', city: 'Birmingham', address: 'Nechells Parkway, B7 5EX', lat: 52.4938, lng: -1.8687, activeVansCount: 8 },
  { id: 'depot-cov', code: 'COV', name: 'Coventry & Warwickshire Depot', region: 'Midlands', city: 'Coventry', address: 'Foleshill Road, CV6 5HN', lat: 52.4200, lng: -1.5000, activeVansCount: 4 },
  { id: 'depot-not', code: 'NOT', name: 'Nottingham & East Midlands Hub', region: 'East Midlands', city: 'Nottingham', address: 'Queens Drive, NG2 1AL', lat: 52.9548, lng: -1.1581, activeVansCount: 4 },
  { id: 'depot-man', code: 'MAN', name: 'Manchester North West Depot', region: 'North West', city: 'Manchester', address: 'Trafford Park, M17 1EH', lat: 53.4680, lng: -2.3120, activeVansCount: 6 },
  { id: 'depot-lee', code: 'LEE', name: 'Leeds & Yorkshire Works', region: 'Yorkshire', city: 'Leeds', address: 'Hunslet Trading Park, LS10 1BD', lat: 53.7850, lng: -1.5300, activeVansCount: 5 },
  { id: 'depot-lon-n', code: 'LON-N', name: 'London North (Enfield Hub)', region: 'Greater London', city: 'London', address: 'Innova Park, EN3 7FL', lat: 51.6680, lng: -0.0350, activeVansCount: 7 },
  { id: 'depot-lon-s', code: 'LON-S', name: 'London South (Croydon Depot)', region: 'Greater London', city: 'Croydon', address: 'Purley Way, CR0 4XJ', lat: 51.3780, lng: -0.1190, activeVansCount: 6 },
  { id: 'depot-bri', code: 'BRI', name: 'Bristol & South West Works', region: 'South West', city: 'Bristol', address: 'Avonmouth Industrial Estate, BS11 9HS', lat: 51.5000, lng: -2.6900, activeVansCount: 4 },
  { id: 'depot-sou', code: 'SOU', name: 'Southampton & Coast Depot', region: 'South Coast', city: 'Southampton', address: 'Western Docks, SO15 0HH', lat: 50.9000, lng: -1.4200, activeVansCount: 4 },
];

export const PRESET_THEMES: Record<string, BrandTheme> = {
  kalsi: {
    companyName: 'Kalsi Plastics',
    tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
    logoText: 'KALSI',
    primaryColour: '#0F1E36', // Kalsi Navy
    secondaryColour: '#0072CE', // Kalsi Blue
    accentColour: '#16A34A', // Kalsi Green
    headerBgColour: '#0F1E36',
  },
  moov: {
    companyName: 'Moov Logistics',
    tagline: 'Next-Generation Delivery & Route Optimisation Engine',
    logoText: 'MOOV',
    primaryColour: '#18181B', // Dark Zinc
    secondaryColour: '#6366F1', // Indigo
    accentColour: '#EC4899', // Pink Accent
    headerBgColour: '#18181B',
  },
  timber: {
    companyName: 'Premier Timber & Building',
    tagline: 'Nationwide Heavy Goods & Trade Delivery Network',
    logoText: 'PREMIER',
    primaryColour: '#27272A',
    secondaryColour: '#D97706', // Amber Gold
    accentColour: '#059669', // Emerald
    headerBgColour: '#1C1917',
  },
  generic: {
    companyName: 'Enterprise Delivery OS',
    tagline: 'Multi-Depot Routing & Fleet Management Platform',
    logoText: 'FLEET',
    primaryColour: '#0F172A', // Slate 900
    secondaryColour: '#2563EB', // Blue 600
    accentColour: '#10B981', // Emerald 500
    headerBgColour: '#0F172A',
  },
};

export const INITIAL_SKU_SETTINGS: SkuDwellSetting[] = [
  { sku: 'FAS-5M-WHT', name: '5m Fascia Board (White)', defaultDwellMins: 20 },
  { sku: 'FAS-5M-ANT', name: '5m Fascia Board (Anthracite Grey)', defaultDwellMins: 20 },
  { sku: 'SOF-5M-HOL', name: '5m Hollow Soffit (White)', defaultDwellMins: 15 },
  { sku: 'CLAD-5M-OAK', name: '5m Shiplap Cladding Pack (Oak)', defaultDwellMins: 25 },
  { sku: 'GUT-4M-BLK', name: '4m Deepflow Gutter (Black)', defaultDwellMins: 12 },
  { sku: 'PIPE-4M-RND', name: '4m Rainwater Downpipe (Round)', defaultDwellMins: 10 },
  { sku: 'DRAIN-3M-110', name: '110mm Underground Drainage Pipe 3m', defaultDwellMins: 15 },
  { sku: 'MDPE-50M-25', name: '25mm MDPE Water Supply Pipe 50m', defaultDwellMins: 10 },
  { sku: 'BOX-BRK-20', name: 'Box of Gutter Brackets & Jointers (20pk)', defaultDwellMins: 5 },
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Dave Jenkins',
    phone: '07700 900101',
    vehicleReg: 'KL24 BHM',
    depotId: 'depot-bhm',
    currentLat: 52.4862,
    currentLng: -1.8904,
    lastUpdated: '08:42 AM',
    status: 'ON_ROUTE',
  },
  {
    id: 'drv-2',
    name: 'Sarah Miller',
    phone: '07700 900102',
    vehicleReg: 'KP23 BHM',
    depotId: 'depot-bhm',
    currentLat: 52.4550,
    currentLng: -1.9400,
    lastUpdated: '08:40 AM',
    status: 'DELIVERING',
  },
  {
    id: 'drv-3',
    name: 'Kieran Scott',
    phone: '07700 900103',
    vehicleReg: 'KV72 BHM',
    depotId: 'depot-bhm',
    currentLat: 52.5200,
    currentLng: -1.8600,
    lastUpdated: '08:35 AM',
    status: 'IDLE',
  },
  {
    id: 'drv-4',
    name: 'Gary Wright',
    phone: '07700 900104',
    vehicleReg: 'KM73 MAN',
    depotId: 'depot-man',
    currentLat: 53.4680,
    currentLng: -2.3120,
    lastUpdated: '08:30 AM',
    status: 'ON_ROUTE',
  },
  {
    id: 'drv-5',
    name: 'Tom Henderson',
    phone: '07700 900105',
    vehicleReg: 'KL71 LON',
    depotId: 'depot-lon-n',
    currentLat: 51.6680,
    currentLng: -0.0350,
    lastUpdated: '08:25 AM',
    status: 'IDLE',
  },
];

// Helper to generate a batch of realistic UK orders for morning dashboard presentation
export function generateMorningOrders(): Order[] {
  const seedNames = [
    { name: 'Marcus Evans (Apex Builders)', phone: '07711 223344', email: 'm.evans@apex.co.uk', addr: '42 Highfield Rd, Edgbaston', city: 'Birmingham', pc: 'B15 3DZ', lat: 52.4688, lng: -1.9325, depot: 'depot-bhm' },
    { name: 'Janet Wood (Wood Renovations)', phone: '07822 334455', email: 'janet@wood.co.uk', addr: '15 Sutton Rd, Erdington', city: 'Birmingham', pc: 'B23 6QJ', lat: 52.5273, lng: -1.8411, depot: 'depot-bhm' },
    { name: 'Liam Patterson (Patterson Plastics)', phone: '07933 445566', email: 'liam@patterson.co.uk', addr: 'Unit 4 Redfern Estate, Tyseley', city: 'Birmingham', pc: 'B11 2BE', lat: 52.4578, lng: -1.8415, depot: 'depot-bhm' },
    { name: 'Claire Smith (Shirley Roofing)', phone: '07544 112233', email: 'claire@shirleyroof.co.uk', addr: '88 Solihull Rd, Shirley', city: 'Solihull', pc: 'B90 3HG', lat: 52.4144, lng: -1.8211, depot: 'depot-bhm' },
    { name: 'Arthur Pendelton (Midlands Cladding)', phone: '07633 889900', email: 'arthur@midlandsclad.co.uk', addr: '102 Walsall Rd, Perry Barr', city: 'Birmingham', pc: 'B42 1SG', lat: 52.5204, lng: -1.9056, depot: 'depot-bhm' },
    { name: 'David Miller (Miller Gutters)', phone: '07412 884411', email: 'dave@millers.co.uk', addr: '19 Harborne High St', city: 'Birmingham', pc: 'B17 9NT', lat: 52.4590, lng: -1.9442, depot: 'depot-bhm' },
    { name: 'Richard Hall (Coventry Civils)', phone: '07700 112299', email: 'rich@covcivils.co.uk', addr: '55 Foleshill Rd', city: 'Coventry', pc: 'CV1 4NR', lat: 52.4180, lng: -1.5050, depot: 'depot-cov' },
    { name: 'Simon Fletcher (Warwick Build)', phone: '07700 334488', email: 'simon@warwickbuild.co.uk', addr: '12 Castle Hill', city: 'Warwick', pc: 'CV34 4EX', lat: 52.2810, lng: -1.5890, depot: 'depot-cov' },
    { name: 'Paul Gallagher (Manchester Plastics)', phone: '07700 998811', email: 'paul@mcrplastics.co.uk', addr: '78 Trafford Park Way', city: 'Manchester', pc: 'M17 1AN', lat: 53.4680, lng: -2.3120, depot: 'depot-man' },
    { name: 'Martin Green (Salford Developments)', phone: '07700 887766', email: 'martin@salforddev.co.uk', addr: '22 Chapel St', city: 'Salford', pc: 'M3 5BZ', lat: 53.4830, lng: -2.2590, depot: 'depot-man' },
    { name: 'Graham Walker (Enfield Drainage)', phone: '07700 556677', email: 'graham@enfielddrain.co.uk', addr: '10 Innova Way, Enfield', city: 'London', pc: 'EN3 7FL', lat: 51.6680, lng: -0.0350, depot: 'depot-lon-n' },
    { name: 'Steven Clark (Croydon Roofing)', phone: '07700 443322', email: 'steven@croydonroof.co.uk', addr: '94 Purley Way', city: 'Croydon', pc: 'CR0 4XJ', lat: 51.3780, lng: -0.1190, depot: 'depot-lon-s' },
  ];

  const skuList = INITIAL_SKU_SETTINGS;

  return seedNames.map((s, idx) => {
    const item1 = skuList[idx % skuList.length];
    const item2 = skuList[(idx + 2) % skuList.length];

    const isDelivered = idx === 0;
    const isOut = idx === 1 || idx === 8;
    const isRouted = idx === 2 || idx === 3;

    return {
      id: `ord-seed-${idx + 1}`,
      trackingNumber: `KAL-${889100 + idx + 1}`,
      depotId: s.depot,
      customerName: s.name,
      customerPhone: s.phone,
      customerEmail: s.email,
      address: s.addr,
      city: s.city,
      postcode: s.pc,
      lat: s.lat,
      lng: s.lng,
      items: [
        { sku: item1.sku, name: item1.name, quantity: 3 + (idx % 4), dwellMinsPerUnit: item1.defaultDwellMins },
        { sku: item2.sku, name: item2.name, quantity: 2 + (idx % 3), dwellMinsPerUnit: item2.defaultDwellMins },
      ],
      totalDwellMins: item1.defaultDwellMins + (idx % 2 === 0 ? 5 : 0),
      status: isDelivered ? 'DELIVERED' : isOut ? 'OUT_FOR_DELIVERY' : isRouted ? 'ROUTED' : 'PENDING',
      createdAt: new Date(Date.now() - (idx * 3600000)).toISOString(),
      proofOfDelivery: isDelivered ? {
        id: 'pod-demo-1',
        orderId: `ord-seed-1`,
        recipientName: 'Marcus Evans',
        signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><text y="20" font-family="cursive" font-size="16" fill="%230F1E36">M. Evans</text></svg>',
        notes: 'Signed at trade counter',
        deliveredLat: 52.4688,
        deliveredLng: -1.9325,
        timestamp: '08:15 AM',
      } : undefined,
    };
  });
}

export const INITIAL_ORDERS: Order[] = generateMorningOrders();

export const INITIAL_ROUTES: DeliveryRoute[] = [
  {
    id: 'route-morning-1',
    routeNumber: 'Route 1 (Birmingham South & Solihull)',
    depotId: 'depot-bhm',
    date: new Date().toISOString(),
    status: 'IN_PROGRESS',
    totalDwellMins: 45,
    totalDrivingMins: 110,
    breakTimeMins: 45,
    totalEstimatedMins: 200,
    totalDistanceKm: 42.5,
    shiftUtilisationPct: 42,
    isProblemRoute: false,
    driverId: 'drv-1',
    driver: INITIAL_DRIVERS[0],
    orders: [INITIAL_ORDERS[0], INITIAL_ORDERS[3]],
  },
  {
    id: 'route-morning-2',
    routeNumber: 'Route 2 (Overloaded Peak Birmingham - Problem Warning)',
    depotId: 'depot-bhm',
    date: new Date().toISOString(),
    status: 'UNASSIGNED',
    totalDwellMins: 290, // Heavy dwell
    totalDrivingMins: 280, // Heavy traffic
    breakTimeMins: 45,
    totalEstimatedMins: 615, // 10.25 Hours -> OVER 8H SHIFT!
    totalDistanceKm: 148.0,
    shiftUtilisationPct: 128,
    isProblemRoute: true,
    problemReason: 'Exceeds Legal 8h Shift Limit (10h 15m total estimated shift time). Driver would breach statutory driving hours.',
    orders: [INITIAL_ORDERS[1], INITIAL_ORDERS[2], INITIAL_ORDERS[4], INITIAL_ORDERS[5]],
  },
];
