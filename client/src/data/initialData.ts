import { Order, Driver, DeliveryRoute, SkuDwellSetting, BrandTheme, Depot, UserAccount, VanVehicle } from '../types';

export const KALSI_BRAND_THEME: BrandTheme = {
  companyName: 'Kalsi Plastics',
  tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
  logoText: 'KALSI',
  primaryColour: '#0F1E36', // Kalsi Deep Navy
  secondaryColour: '#0072CE', // Kalsi Blue
  accentColour: '#16A34A', // Kalsi Emerald
  supportPhone: '0800 123 4567',
};

// Physical UK Regional Depots
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
    contactPhone: '0121 555 0199',
    activeVansCount: 8,
    maxDeliveryRadiusMiles: 18,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 48,
    minOrdersPerRoute: 3,
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
    contactPhone: '0208 555 0122',
    activeVansCount: 7,
    maxDeliveryRadiusMiles: 10,
    maxOrdersPerVan: 5,
    maxDailyCapacityOrders: 35,
    minOrdersPerRoute: 3,
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
    contactPhone: '0208 555 0188',
    activeVansCount: 6,
    maxDeliveryRadiusMiles: 10,
    maxOrdersPerVan: 5,
    maxDailyCapacityOrders: 30,
    minOrdersPerRoute: 3,
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
    contactPhone: '0191 555 0144',
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 30,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    minOrdersPerRoute: 2,
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
    contactPhone: '0161 555 0133',
    activeVansCount: 6,
    maxDeliveryRadiusMiles: 16,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 36,
    minOrdersPerRoute: 3,
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
    contactPhone: '0113 555 0177',
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 22,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    minOrdersPerRoute: 3,
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
    contactPhone: '0247 555 0166',
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 20,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    minOrdersPerRoute: 3,
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
    contactPhone: '0115 555 0155',
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 22,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    minOrdersPerRoute: 3,
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
    contactPhone: '0117 555 0188',
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 25,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    minOrdersPerRoute: 3,
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
    contactPhone: '0238 555 0122',
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 24,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    minOrdersPerRoute: 3,
  },
];

// DECOUPLED FLEET OF VANS (Assigned per depot, selectable / scan barcode by any driver)
export const INITIAL_VANS: VanVehicle[] = [
  { id: 'van-1', registration: 'KL24 BHM', depotId: 'depot-bhm', model: 'Mercedes Sprinter 3.5t Long-Wheelbase', status: 'AVAILABLE', barcode: 'VAN-KL24BHM', maxPayloadKg: 1350 },
  { id: 'van-2', registration: 'KP23 BHM', depotId: 'depot-bhm', model: 'Ford Transit 350 Leader Jumbo', status: 'ON_ROUTE', barcode: 'VAN-KP23BHM', maxPayloadKg: 1280 },
  { id: 'van-3', registration: 'KV72 BHM', depotId: 'depot-bhm', model: 'Mercedes Sprinter Extra-Long Frame', status: 'AVAILABLE', barcode: 'VAN-KV72BHM', maxPayloadKg: 1400 },
  { id: 'van-4', registration: 'KB70 BHM', depotId: 'depot-bhm', model: 'Volkswagen Crafter CR35 Maxi', status: 'MAINTENANCE', barcode: 'VAN-KB70BHM', maxPayloadKg: 1300 },
  { id: 'van-5', registration: 'KM73 MAN', depotId: 'depot-man', model: 'Ford Transit 350 L4 H3 Long', status: 'ON_ROUTE', barcode: 'VAN-KM73MAN', maxPayloadKg: 1320 },
  { id: 'van-6', registration: 'KL71 LON', depotId: 'depot-lon-n', model: 'Mercedes Sprinter 315 CDI Pro', status: 'AVAILABLE', barcode: 'VAN-KL71LON', maxPayloadKg: 1350 },
  { id: 'van-7', registration: 'KN24 NCL', depotId: 'depot-ncl', model: 'Iveco Daily 35S14 Hi-Matic 5m Bed', status: 'AVAILABLE', barcode: 'VAN-KN24NCL', maxPayloadKg: 1450 },
  { id: 'van-8', registration: 'KC72 CRO', depotId: 'depot-lon-s', model: 'Ford Transit Jumbo High Roof', status: 'AVAILABLE', barcode: 'VAN-KC72CRO', maxPayloadKg: 1300 },
];

// Seed User Accounts
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Ross Jermy',
    email: 'admin@kalsiplastics.co.uk',
    role: 'HEAD_OFFICE_ADMIN',
  },
  {
    id: 'usr-2',
    name: 'Marcus Bell',
    email: 'marcus.bell@kalsiplastics.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-lon-s',
  },
  {
    id: 'usr-3',
    name: 'Steve Parker',
    email: 'steve.parker@kalsiplastics.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-bhm',
  },
  {
    id: 'usr-4',
    name: 'Craig Foster',
    email: 'craig.foster@kalsiplastics.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-ncl',
  },
  {
    id: 'usr-5',
    name: 'Dave Jenkins',
    email: 'dave.jenkins@kalsi-fleet.co.uk',
    role: 'DRIVER',
    assignedDepotId: 'depot-bhm',
  }
];

export const PRESET_THEMES: Record<string, BrandTheme> = {
  kalsi: {
    companyName: 'Kalsi Plastics',
    tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
    logoText: 'KALSI',
    primaryColour: '#0F1E36',
    secondaryColour: '#0072CE',
    accentColour: '#16A34A',
    supportPhone: '0800 123 4567',
  },
  moov: {
    companyName: 'Moov Logistics',
    tagline: 'Next-Generation Delivery & Route Optimisation Engine',
    logoText: 'MOOV',
    primaryColour: '#18181B',
    secondaryColour: '#6366F1',
    accentColour: '#EC4899',
    supportPhone: '0800 999 8888',
  },
  timber: {
    companyName: 'Premier Timber & Building',
    tagline: 'Nationwide Heavy Goods & Trade Delivery Network',
    logoText: 'PREMIER',
    primaryColour: '#27272A',
    secondaryColour: '#D97706',
    accentColour: '#059669',
    supportPhone: '0800 555 4433',
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

// DECOUPLED DRIVERS (No hardcoded vehicle registrations)
export const INITIAL_DRIVERS: Driver[] = [
  { id: 'drv-1', name: 'Dave Jenkins', phone: '07700 900101', depotId: 'depot-bhm', currentLat: 52.4862, currentLng: -1.8904, lastUpdated: '08:42 AM', status: 'ON_ROUTE', assignedVanId: 'van-1', assignedVanReg: 'KL24 BHM' },
  { id: 'drv-2', name: 'Sarah Miller', phone: '07700 900102', depotId: 'depot-bhm', currentLat: 52.4550, currentLng: -1.9400, lastUpdated: '08:40 AM', status: 'DELIVERING', assignedVanId: 'van-2', assignedVanReg: 'KP23 BHM' },
  { id: 'drv-3', name: 'Kieran Scott', phone: '07700 900103', depotId: 'depot-bhm', currentLat: 52.5200, currentLng: -1.8600, lastUpdated: '08:35 AM', status: 'IDLE' },
  { id: 'drv-4', name: 'Gary Wright', phone: '07700 900104', depotId: 'depot-man', currentLat: 53.4680, currentLng: -2.3120, lastUpdated: '08:30 AM', status: 'ON_ROUTE', assignedVanId: 'van-5', assignedVanReg: 'KM73 MAN' },
  { id: 'drv-5', name: 'Tom Henderson', phone: '07700 900105', depotId: 'depot-lon-n', currentLat: 51.6680, currentLng: -0.0350, lastUpdated: '08:25 AM', status: 'IDLE' },
  { id: 'drv-6', name: 'Alan Armstrong', phone: '07700 900106', depotId: 'depot-ncl', currentLat: 54.9350, currentLng: -1.6150, lastUpdated: '08:20 AM', status: 'IDLE' },
];

const REALISTIC_POD_PHOTOS = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
];

export function generateLargeOrderDataset(): Order[] {
  const seedData = [
    // Birmingham Hub (BHM)
    { name: 'Marcus Evans (Apex Builders)', phone: '07711 223344', email: 'm.evans@apex.co.uk', addr: '42 Highfield Rd, Edgbaston', city: 'Birmingham', pc: 'B15 3DZ', lat: 52.4688, lng: -1.9325, depot: 'depot-bhm', status: 'DELIVERED', date: 'Today 08:15 AM', notes: 'Signed at trade counter', photoIdx: 0 },
    { name: 'Janet Wood (Wood Renovations)', phone: '07822 334455', email: 'janet@wood.co.uk', addr: '15 Sutton Rd, Erdington', city: 'Birmingham', pc: 'B23 6QJ', lat: 52.5273, lng: -1.8411, depot: 'depot-bhm', status: 'OUT_FOR_DELIVERY' },
    { name: 'Liam Patterson (Patterson Plastics)', phone: '07933 445566', email: 'liam@patterson.co.uk', addr: 'Unit 4 Redfern Estate, Tyseley', city: 'Birmingham', pc: 'B11 2BE', lat: 52.4578, lng: -1.8415, depot: 'depot-bhm', status: 'ROUTED' },
    { name: 'Claire Smith (Shirley Roofing)', phone: '07544 112233', email: 'claire@shirleyroof.co.uk', addr: '88 Solihull Rd, Shirley', city: 'Solihull', pc: 'B90 3HG', lat: 52.4144, lng: -1.8211, depot: 'depot-bhm', status: 'DELIVERED', date: 'Today 08:35 AM', notes: 'Large parcel pack placed securely behind front gate', photoIdx: 1 },
    { name: 'Arthur Pendelton (Midlands Cladding)', phone: '07633 889900', email: 'arthur@midlandsclad.co.uk', addr: '102 Walsall Rd, Perry Barr', city: 'Birmingham', pc: 'B42 1SG', lat: 52.5204, lng: -1.9056, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'David Miller (Miller Gutters)', phone: '07412 884411', email: 'dave@millers.co.uk', addr: '19 Harborne High St', city: 'Birmingham', pc: 'B17 9NT', lat: 52.4590, lng: -1.9442, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'Keith Reynolds (Brum Fascias)', phone: '07700 882211', email: 'keith@brumfascias.co.uk', addr: '77 Kingsbury Rd', city: 'Birmingham', pc: 'B24 8QQ', lat: 52.5180, lng: -1.8320, depot: 'depot-bhm', status: 'PENDING' },
    { name: 'Darren Cox (Telford Far Outpost)', phone: '07700 994433', email: 'darren@telforddev.co.uk', addr: '88 Wrekin View, Telford', city: 'Telford', pc: 'TF1 2AA', lat: 52.6780, lng: -2.4490, depot: 'depot-bhm', status: 'PENDING', belowRouteCriteria: true, criteriaReason: 'Isolated single stop (32 miles from depot cluster). Awaiting order consolidation.' },

    // London North Hub (LON-N)
    { name: 'Graham Walker (Enfield Drainage)', phone: '07700 556677', email: 'graham@enfielddrain.co.uk', addr: '10 Innova Way, Enfield', city: 'London', pc: 'EN3 7FL', lat: 51.6680, lng: -0.0350, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Toby Marshall (Tottenham Timber & Plastic)', phone: '07700 667788', email: 'toby@tottenhamtp.co.uk', addr: '44 High Rd, Tottenham', city: 'London', pc: 'N17 9TA', lat: 51.5980, lng: -0.0710, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Oliver King (Barnet Building Supplies)', phone: '07700 778899', email: 'oliver@barnetbuild.co.uk', addr: '12 Wood St, Barnet', city: 'London', pc: 'EN5 4BP', lat: 51.6540, lng: -0.2010, depot: 'depot-lon-n', status: 'PENDING' },
    { name: 'Dean Harris (Islington Civils)', phone: '07700 889911', email: 'dean@islingtoncivils.co.uk', addr: '82 Upper St, Islington', city: 'London', pc: 'N1 0NU', lat: 51.5380, lng: -0.1030, depot: 'depot-lon-n', status: 'DELIVERED', date: 'Yesterday 15:40', notes: 'Heavy parcel cargo offloaded into site store', photoIdx: 2 },

    // London South Hub (LON-S)
    { name: 'Steven Clark (Croydon Roofing)', phone: '07700 443322', email: 'steven@croydonroof.co.uk', addr: '94 Purley Way', city: 'Croydon', pc: 'CR0 4XJ', lat: 51.3780, lng: -0.1190, depot: 'depot-lon-s', status: 'PENDING' },
    { name: 'Ray Campbell (Bromley Plastics)', phone: '07700 332211', email: 'ray@bromleyplastics.co.uk', addr: '28 Masons Hill', city: 'Bromley', pc: 'BR2 9HG', lat: 51.3980, lng: 0.0190, depot: 'depot-lon-s', status: 'PENDING' },
    { name: 'Lewis Finch (Mitcham Civils)', phone: '07700 221100', email: 'lewis@mitcham.co.uk', addr: '14 London Rd', city: 'Mitcham', pc: 'CR4 2YR', lat: 51.4020, lng: -0.1680, depot: 'depot-lon-s', status: 'DELIVERED', date: 'Yesterday 11:20', notes: 'Palletized trade goods delivered at loading bay', photoIdx: 3 },

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
        { sku: item1.sku, description: item1.name, quantity: 3 + (idx % 4), dwellMins: item1.defaultDwellMins },
        { sku: item2.sku, description: item2.name, quantity: 2 + (idx % 3), dwellMins: item2.defaultDwellMins },
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
    vanId: 'van-1',
    vanRegistration: 'KL24 BHM',
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
