import { Order, Driver, DeliveryRoute, SkuDwellSetting, BrandTheme, Depot } from '../types';

export const KALSI_BRAND_THEME: BrandTheme = {
  companyName: 'Kalsi Plastics',
  tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
  logoText: 'KALSI',
  primaryColour: '#0F1E36', // Kalsi Deep Navy
  secondaryColour: '#0072CE', // Kalsi Blue
  accentColour: '#16A34A', // Kalsi Emerald
  headerBgColour: '#0F1E36',
};

// Clean list of actual physical UK Depots
export const UK_DEPOTS: Depot[] = [
  { 
    id: 'depot-bhm', 
    code: 'BHM', 
    name: 'Birmingham Central (Kalsi Main Works)', 
    region: 'Midlands', 
    city: 'Birmingham', 
    address: 'Nechells Parkway', 
    postcode: 'B7 5EX', 
    lat: 52.4938, 
    lng: -1.8687, 
    activeVansCount: 8,
    maxDeliveryRadiusMiles: 18,
    maxOrdersPerVan: 6, // 6 drops max per van for 5m building lengths
    maxDailyCapacityOrders: 48,
    trafficMultiplierOverride: 1.25,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 12
  },
  { 
    id: 'depot-lon-n', 
    code: 'LON-N', 
    name: 'London North (Enfield Hub)', 
    region: 'Greater London', 
    city: 'London', 
    address: 'Innova Park, Enfield', 
    postcode: 'EN3 7FL', 
    lat: 51.6680, 
    lng: -0.0350, 
    activeVansCount: 7,
    maxDeliveryRadiusMiles: 10,
    maxOrdersPerVan: 5,
    maxDailyCapacityOrders: 35,
    trafficMultiplierOverride: 1.45,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 6
  },
  { 
    id: 'depot-lon-s', 
    code: 'LON-S', 
    name: 'London South (Croydon Depot)', 
    region: 'Greater London', 
    city: 'Croydon', 
    address: 'Purley Way', 
    postcode: 'CR0 4XJ', 
    lat: 51.3780, 
    lng: -0.1190, 
    activeVansCount: 6,
    maxDeliveryRadiusMiles: 10,
    maxOrdersPerVan: 5,
    maxDailyCapacityOrders: 30,
    trafficMultiplierOverride: 1.40,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 6
  },
  { 
    id: 'depot-ncl', 
    code: 'NCL', 
    name: 'Newcastle & North East Depot', 
    region: 'North East', 
    city: 'Newcastle', 
    address: 'Team Valley Trading Estate', 
    postcode: 'NE11 0QA', 
    lat: 54.9350, 
    lng: -1.6150, 
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 30,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    trafficMultiplierOverride: 1.15,
    minOrdersPerRoute: 2,
    maxDistancePerDropMiles: 25
  },
  { 
    id: 'depot-man', 
    code: 'MAN', 
    name: 'Manchester North West Works', 
    region: 'North West', 
    city: 'Manchester', 
    address: 'Trafford Park Way', 
    postcode: 'M17 1EH', 
    lat: 53.4680, 
    lng: -2.3120, 
    activeVansCount: 6,
    maxDeliveryRadiusMiles: 16,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 36,
    trafficMultiplierOverride: 1.30,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 12
  },
  { 
    id: 'depot-lee', 
    code: 'LEE', 
    name: 'Leeds & Yorkshire Works', 
    region: 'Yorkshire', 
    city: 'Leeds', 
    address: 'Hunslet Trading Park', 
    postcode: 'LS10 1BD', 
    lat: 53.7850, 
    lng: -1.5300, 
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 22,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    trafficMultiplierOverride: 1.20,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 15
  },
  { 
    id: 'depot-cov', 
    code: 'COV', 
    name: 'Coventry & Warwickshire Hub', 
    region: 'Midlands', 
    city: 'Coventry', 
    address: 'Foleshill Road', 
    postcode: 'CV6 5HN', 
    lat: 52.4200, 
    lng: -1.5000, 
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 20,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    trafficMultiplierOverride: 1.20,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 14
  },
  { 
    id: 'depot-not', 
    code: 'NOT', 
    name: 'Nottingham & East Midlands Works', 
    region: 'East Midlands', 
    city: 'Nottingham', 
    address: 'Queens Drive', 
    postcode: 'NG2 1AL', 
    lat: 52.9548, 
    lng: -1.1581, 
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 22,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    trafficMultiplierOverride: 1.20,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 15
  },
  { 
    id: 'depot-bri', 
    code: 'BRI', 
    name: 'Bristol & South West Works', 
    region: 'South West', 
    city: 'Bristol', 
    address: 'Avonmouth Industrial Estate', 
    postcode: 'BS11 9HS', 
    lat: 51.5000, 
    lng: -2.6900, 
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 25,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    trafficMultiplierOverride: 1.25,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 18
  },
  { 
    id: 'depot-sou', 
    code: 'SOU', 
    name: 'Southampton & South Coast Depot', 
    region: 'South Coast', 
    city: 'Southampton', 
    address: 'Western Docks', 
    postcode: 'SO15 0HH', 
    lat: 50.9000, 
    lng: -1.4200, 
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 24,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    trafficMultiplierOverride: 1.20,
    minOrdersPerRoute: 3,
    maxDistancePerDropMiles: 16
  },
];

export const PRESET_THEMES: Record<string, BrandTheme> = {
  kalsi: {
    companyName: 'Kalsi Plastics',
    tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
    logoText: 'KALSI',
    primaryColour: '#0F1E36',
    secondaryColour: '#0072CE',
    accentColour: '#16A34A',
    headerBgColour: '#0F1E36',
  },
  moov: {
    companyName: 'Moov Logistics',
    tagline: 'Next-Generation Delivery & Route Optimisation Engine',
    logoText: 'MOOV',
    primaryColour: '#18181B',
    secondaryColour: '#6366F1',
    accentColour: '#EC4899',
    headerBgColour: '#18181B',
  },
  timber: {
    companyName: 'Premier Timber & Building',
    tagline: 'Nationwide Heavy Goods & Trade Delivery Network',
    logoText: 'PREMIER',
    primaryColour: '#27272A',
    secondaryColour: '#D97706',
    accentColour: '#059669',
    headerBgColour: '#1C1917',
  },
  generic: {
    companyName: 'Enterprise Delivery OS',
    tagline: 'Multi-Depot Routing & Fleet Management Platform',
    logoText: 'FLEET',
    primaryColour: '#0F172A',
    secondaryColour: '#2563EB',
    accentColour: '#10B981',
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
  { id: 'drv-1', name: 'Dave Jenkins', phone: '07700 900101', vehicleReg: 'KL24 BHM', depotId: 'depot-bhm', currentLat: 52.4862, currentLng: -1.8904, lastUpdated: '08:42 AM', status: 'ON_ROUTE' },
  { id: 'drv-2', name: 'Sarah Miller', phone: '07700 900102', vehicleReg: 'KP23 BHM', depotId: 'depot-bhm', currentLat: 52.4550, currentLng: -1.9400, lastUpdated: '08:40 AM', status: 'DELIVERING' },
  { id: 'drv-3', name: 'Kieran Scott', phone: '07700 900103', vehicleReg: 'KV72 BHM', depotId: 'depot-bhm', currentLat: 52.5200, currentLng: -1.8600, lastUpdated: '08:35 AM', status: 'IDLE' },
  { id: 'drv-4', name: 'Gary Wright', phone: '07700 900104', vehicleReg: 'KM73 MAN', depotId: 'depot-man', currentLat: 53.4680, currentLng: -2.3120, lastUpdated: '08:30 AM', status: 'ON_ROUTE' },
  { id: 'drv-5', name: 'Tom Henderson', phone: '07700 900105', vehicleReg: 'KL71 LON', depotId: 'depot-lon-n', currentLat: 51.6680, currentLng: -0.0350, lastUpdated: '08:25 AM', status: 'IDLE' },
  { id: 'drv-6', name: 'Alan Armstrong', phone: '07700 900106', vehicleReg: 'KN24 NCL', depotId: 'depot-ncl', currentLat: 54.9350, currentLng: -1.6150, lastUpdated: '08:20 AM', status: 'IDLE' },
];

// High-resolution realistic heavy trade / big parcel / building materials delivery photos
const REALISTIC_POD_PHOTOS = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', // Heavy bundled parcel goods
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80', // Industrial packaged cargo on site
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80', // Palletized trade goods & large parcels
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80', // Warehouse yard & building supplies
];

export function generateLargeOrderDataset(): Order[] {
  const seedData = [
    // Birmingham Hub (BHM)
    { name: 'Marcus Evans (Apex Builders)', phone: '07711 223344', email: 'm.evans@apex.co.uk', addr: '42 Highfield Rd, Edgbaston', city: 'Birmingham', pc: 'B15 3DZ', lat: 52.4688, lng: -1.9325, depot: 'depot-bhm', status: 'DELIVERED', date: 'Today 08:15 AM', deliveredBy: 'Dave Jenkins (KL24 BHM)', notes: 'Signed at trade counter', photoIdx: 0 },
    { name: 'Janet Wood (Wood Renovations)', phone: '07822 334455', email: 'janet@wood.co.uk', addr: '15 Sutton Rd, Erdington', city: 'Birmingham', pc: 'B23 6QJ', lat: 52.5273, lng: -1.8411, depot: 'depot-bhm', status: 'OUT_FOR_DELIVERY' },
    { name: 'Liam Patterson (Patterson Plastics)', phone: '07933 445566', email: 'liam@patterson.co.uk', addr: 'Unit 4 Redfern Estate, Tyseley', city: 'Birmingham', pc: 'B11 2BE', lat: 52.4578, lng: -1.8415, depot: 'depot-bhm', status: 'ROUTED' },
    { name: 'Claire Smith (Shirley Roofing)', phone: '07544 112233', email: 'claire@shirleyroof.co.uk', addr: '88 Solihull Rd, Shirley', city: 'Solihull', pc: 'B90 3HG', lat: 52.4144, lng: -1.8211, depot: 'depot-bhm', status: 'DELIVERED', date: 'Today 08:35 AM', deliveredBy: 'Dave Jenkins (KL24 BHM)', notes: 'Large parcel pack placed securely behind front gate', photoIdx: 1 },
    { name: 'Arthur Pendelton (Midlands Cladding)', phone: '07633 889900', email: 'arthur@midlandsclad.co.uk', addr: '102 Walsall Rd, Perry Barr', city: 'Birmingham', pc: 'B42 1SG', lat: 52.5204, lng: -1.9056, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'David Miller (Miller Gutters)', phone: '07412 884411', email: 'dave@millers.co.uk', addr: '19 Harborne High St', city: 'Birmingham', pc: 'B17 9NT', lat: 52.4590, lng: -1.9442, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'Keith Reynolds (Brum Fascias)', phone: '07700 882211', email: 'keith@brumfascias.co.uk', addr: '77 Kingsbury Rd', city: 'Birmingham', pc: 'B24 8QQ', lat: 52.5180, lng: -1.8320, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'Darren Cox (Telford Far Outpost)', phone: '07700 994433', email: 'darren@telforddev.co.uk', addr: '88 Wrekin View, Telford', city: 'Telford', pc: 'TF1 2AA', lat: 52.6780, lng: -2.4490, depot: 'depot-bhm', status: 'PENDING', belowRouteCriteria: true, criteriaReason: 'Isolated single stop (32 miles from depot cluster). Awaiting order consolidation.' },

    // London North Hub (LON-N)
    { name: 'Graham Walker (Enfield Drainage)', phone: '07700 556677', email: 'graham@enfielddrain.co.uk', addr: '10 Innova Way, Enfield', city: 'London', pc: 'EN3 7FL', lat: 51.6680, lng: -0.0350, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Toby Marshall (Tottenham Timber & Plastic)', phone: '07700 667788', email: 'toby@tottenhamtp.co.uk', addr: '44 High Rd, Tottenham', city: 'London', pc: 'N17 9TA', lat: 51.5980, lng: -0.0710, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Oliver King (Barnet Building Supplies)', phone: '07700 778899', email: 'oliver@barnetbuild.co.uk', addr: '12 Wood St, Barnet', city: 'London', pc: 'EN5 4BP', lat: 51.6540, lng: -0.2010, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Dean Harris (Islington Civils)', phone: '07700 889911', email: 'dean@islingtoncivils.co.uk', addr: '82 Upper St, Islington', city: 'London', pc: 'N1 0NU', lat: 51.5380, lng: -0.1030, depot: 'depot-lon-n', status: 'DELIVERED', date: 'Yesterday 15:40', deliveredBy: 'Tom Henderson (KL71 LON)', notes: 'Heavy parcel cargo offloaded into site store', photoIdx: 2 },

    // London South Hub (LON-S)
    { name: 'Steven Clark (Croydon Roofing)', phone: '07700 443322', email: 'steven@croydonroof.co.uk', addr: '94 Purley Way', city: 'Croydon', pc: 'CR0 4XJ', lat: 51.3780, lng: -0.1190, depot: 'depot-lon-s', status: 'PENDING' },
    { name: 'Ray Campbell (Bromley Plastics)', phone: '07700 332211', email: 'ray@bromleyplastics.co.uk', addr: '28 Masons Hill', city: 'Bromley', pc: 'BR2 9HG', lat: 51.3980, lng: 0.0190, depot: 'depot-lon-s', status: 'PENDING' },
    { name: 'Lewis Finch (Mitcham Civils)', phone: '07700 221100', email: 'lewis@mitcham.co.uk', addr: '14 London Rd', city: 'Mitcham', pc: 'CR4 2YR', lat: 51.4020, lng: -0.1680, depot: 'depot-lon-s', status: 'DELIVERED', date: 'Yesterday 11:20', deliveredBy: 'Sarah Miller (KP23 BHM)', notes: 'Palletized trade goods delivered at loading bay', photoIdx: 3 },

    // Newcastle & North East (NCL)
    { name: 'Ian Robson (Tyne Valley Plastics)', phone: '07700 665544', email: 'ian@tyneplastics.co.uk', addr: '34 Team Valley Way', city: 'Gateshead', pc: 'NE11 0QA', lat: 54.9350, lng: -1.6150, depot: 'depot-ncl', status: 'PENDING' },
    { name: 'Barry Dobson (Durham Trade Counters)', phone: '07700 554433', email: 'barry@durhamtrade.co.uk', addr: 'Unit 2 Belmont Estate', city: 'Durham', pc: 'DH1 1TW', lat: 54.7890, lng: -1.5420, depot: 'depot-ncl', status: 'PENDING' },
    { name: 'Graeme Watson (Sunderland Roofing)', phone: '07700 445566', email: 'graeme@sunderlandroof.co.uk', addr: '18 Riverside Rd', city: 'Sunderland', pc: 'SR5 3JG', lat: 54.9120, lng: -1.4110, depot: 'depot-ncl', status: 'PENDING' },

    // Manchester (MAN)
    { name: 'Paul Gallagher (Manchester Plastics)', phone: '07700 998811', email: 'paul@mcrplastics.co.uk', addr: '78 Trafford Park Way', city: 'Manchester', pc: 'M17 1AN', lat: 53.4680, lng: -2.3120, depot: 'depot-man', status: 'OUT_FOR_DELIVERY' },
    { name: 'Martin Green (Salford Developments)', phone: '07700 887766', email: 'martin@salforddev.co.uk', addr: '22 Chapel St', city: 'Salford', pc: 'M3 5BZ', lat: 53.4830, lng: -2.2590, depot: 'depot-man', status: 'PENDING' },
    { name: 'Craig Hughes (Stockport Cladding)', phone: '07700 776655', email: 'craig@stockportclad.co.uk', addr: '5 Buxton Rd', city: 'Stockport', pc: 'SK2 6LS', lat: 53.3980, lng: -2.1450, depot: 'depot-man', status: 'PENDING' },
  ];

  const skuList = INITIAL_SKU_SETTINGS;

  return seedData.map((s, idx) => {
    const item1 = skuList[idx % skuList.length];
    const item2 = skuList[(idx + 3) % skuList.length];
    const isDelivered = s.status === 'DELIVERED';
    const isOut = s.status === 'OUT_FOR_DELIVERY';
    const isRouted = s.status === 'ROUTED';

    return {
      id: `ord-oms-${idx + 1}`,
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
      status: (isDelivered ? 'DELIVERED' : isOut ? 'OUT_FOR_DELIVERY' : isRouted ? 'ROUTED' : 'PENDING') as any,
      belowRouteCriteria: (s as any).belowRouteCriteria || false,
      criteriaReason: (s as any).criteriaReason,
      createdAt: new Date(Date.now() - (idx * 7200000)).toISOString(),
      proofOfDelivery: isDelivered ? {
        id: `pod-oms-${idx + 1}`,
        orderId: `ord-oms-${idx + 1}`,
        recipientName: s.name.split(' ')[0] + ' ' + s.name.split(' ')[1],
        signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><text y="28" font-family="cursive" font-size="22" fill="%230F1E36">Verified Signee</text></svg>',
        photoUrl: REALISTIC_POD_PHOTOS[(s as any).photoIdx ?? 0],
        notes: (s as any).notes || 'Large parcel goods delivered to site',
        deliveredLat: s.lat + 0.0001,
        deliveredLng: s.lng + 0.0001,
        timestamp: (s as any).date || 'Today 08:30 AM',
      } : undefined,
    };
  });
}

export const INITIAL_ORDERS: Order[] = generateLargeOrderDataset();

export const INITIAL_ROUTES: DeliveryRoute[] = [
  {
    id: 'route-bhm-1',
    routeNumber: 'Route 1 (Birmingham Central)',
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
    id: 'route-bhm-2',
    routeNumber: 'Route 2 (Birmingham North & Solihull)',
    depotId: 'depot-bhm',
    date: new Date().toISOString(),
    status: 'UNASSIGNED',
    totalDwellMins: 120,
    totalDrivingMins: 190,
    breakTimeMins: 45,
    totalEstimatedMins: 355,
    totalDistanceKm: 78.0,
    shiftUtilisationPct: 74,
    isProblemRoute: false,
    orders: [INITIAL_ORDERS[1], INITIAL_ORDERS[2], INITIAL_ORDERS[4]],
  },
];
