import { SkuDwellSetting, BrandTheme, Depot, Order, Driver, VanVehicle, DeliveryRoute, UserAccount, VehicleFaultReport } from '../types';

export const KALSI_BRAND_THEME: BrandTheme = {
  companyName: 'Kalsi Plastics (UK) Ltd',
  primaryColour: '#0F1E36', // Deep Kalsi Navy
  secondaryColour: '#E2231A', // Vibrant Kalsi Red
  accentColour: '#F4F5F7',
  tagline: 'Precision Building Products & Direct-to-Site Logistics',
  logoText: 'KALSI LOGISTICS',
};

export const PRESET_THEMES: Record<string, BrandTheme> = {
  kalsi: KALSI_BRAND_THEME,
  travis: {
    companyName: 'Travis Perkins Direct',
    primaryColour: '#005339',
    secondaryColour: '#FDB813',
    accentColour: '#F4F6F5',
    tagline: 'Leading Builders Merchant & Site Logistics',
    logoText: 'TP DIRECT',
  },
  eurocell: {
    companyName: 'Eurocell Building Plastics',
    primaryColour: '#0B2265',
    secondaryColour: '#E65100',
    accentColour: '#F0F4F8',
    tagline: 'Extrusion Solutions & Fast Depot Delivery',
    logoText: 'EUROCELL EXPRESS',
  },
  jewson: {
    companyName: 'Jewson Timber & Civils',
    primaryColour: '#003366',
    secondaryColour: '#0099FF',
    accentColour: '#F8FAFC',
    tagline: 'Materials for the Tradesperson',
    logoText: 'JEWSON DISPATCH',
  },
};

// SKU CATALOG WITH GENERIC LEAVE-SAFE RULES & STANDALONE AGE VERIFICATION
export const INITIAL_SKU_SETTINGS: SkuDwellSetting[] = [
  { sku: 'FAS-5M-WHT', name: '5m Fascia Board (Pack of 5)', defaultDwellMins: 12, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'SOF-5M-BLK', name: '5m Hollow Soffit Board (Pack of 10)', defaultDwellMins: 10, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'GUT-4M-RND', name: '4m Roundline Gutter (Pack of 6)', defaultDwellMins: 15, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'CLAD-5M-ANT', name: '5m Shiplap Cladding Anthracite', defaultDwellMins: 20, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'DWN-4M-SQR', name: '4m Square Downpipe Pack', defaultDwellMins: 15, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'TRM-5M-OAK', name: '5m Architrave Trim Golden Oak', defaultDwellMins: 8, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'FOAM-GUN-750', name: 'Expanding Foam 750ml (Box of 12)', defaultDwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'SEAL-SIL-CLR', name: 'Low Modulus Silicone (Box of 24)', defaultDwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: false },
  { sku: 'POLY-SHEET-3X1', name: 'Multiwall Polycarbonate 3m x 1m', defaultDwellMins: 25, allowLeaveSafe: false, requiresAgeVerification: false }, // High value / fragile
  { sku: 'SOLV-CLEANER-1L', name: 'PVC Solvent Cleaner & Degreaser 1L (18+)', defaultDwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: true }, // 18+ Solvent
  { sku: 'ADH-SOLV-500ML', name: 'Heavy Duty Solvent Weld Cement 500ml (18+)', defaultDwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: true }, // 18+ Solvent
  { sku: 'DRY-VERGE-GRY', name: 'Dry Verge Units Grey (Pack of 50)', defaultDwellMins: 10, allowLeaveSafe: true, requiresAgeVerification: false },
];

export const UK_DEPOTS: Depot[] = [
  { 
    id: 'depot-bhm', 
    code: 'BHM', 
    name: 'Birmingham Central Distribution Centre', 
    region: 'Midlands', 
    city: 'Birmingham', 
    address: 'Sparkhill Trading Estate, Stratford Rd', 
    postcode: 'B11 4AR', 
    lat: 52.4540, 
    lng: -1.8650, 
    contactPhone: '0121 772 8899',
    activeVansCount: 6,
    maxDeliveryRadiusMiles: 25,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 36,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
  },
  { 
    id: 'depot-lon-n', 
    code: 'LON-N', 
    name: 'London North Logistics Depot', 
    region: 'Greater London', 
    city: 'London North', 
    address: 'Innova Park, Mollison Ave', 
    postcode: 'EN3 7FL', 
    lat: 51.6700, 
    lng: -0.0300, 
    contactPhone: '0208 804 1122',
    activeVansCount: 8,
    maxDeliveryRadiusMiles: 18,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 48,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
  },
  { 
    id: 'depot-lon-s', 
    code: 'LON-S', 
    name: 'London South Depot', 
    region: 'Greater London', 
    city: 'London South', 
    address: 'Beddington Cross Industrial Estate', 
    postcode: 'CR0 4XH', 
    lat: 51.3750, 
    lng: -0.1250, 
    contactPhone: '0208 680 9944',
    activeVansCount: 7,
    maxDeliveryRadiusMiles: 18,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 42,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
  },
  { 
    id: 'depot-man', 
    code: 'MAN', 
    name: 'Manchester & North West Hub', 
    region: 'North West', 
    city: 'Manchester', 
    address: 'Trafford Park Logistics Hub', 
    postcode: 'M17 1EH', 
    lat: 53.4680, 
    lng: -2.3150, 
    contactPhone: '0161 872 3311',
    activeVansCount: 7,
    maxDeliveryRadiusMiles: 28,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 42,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: false,
      sameDayCutoffTime: '08:30',
      allowInFlightSafePlace: true,
    }
  },
  { 
    id: 'depot-lds', 
    code: 'LDS', 
    name: 'Leeds & Yorkshire Depot', 
    region: 'Yorkshire', 
    city: 'Leeds', 
    address: 'Stourton Industrial Estate', 
    postcode: 'LS10 1DW', 
    lat: 53.7750, 
    lng: -1.5120, 
    contactPhone: '0113 270 4455',
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 26,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
  },
  { 
    id: 'depot-brs', 
    code: 'BRS', 
    name: 'Bristol & West Depot', 
    region: 'South West', 
    city: 'Bristol', 
    address: 'Avonmouth Docks Estate', 
    postcode: 'BS11 9DJ', 
    lat: 51.5050, 
    lng: -2.7050, 
    contactPhone: '0117 982 7788',
    activeVansCount: 5,
    maxDeliveryRadiusMiles: 30,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 30,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
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
    contactPhone: '0191 487 6622',
    activeVansCount: 4,
    maxDeliveryRadiusMiles: 32,
    maxOrdersPerVan: 6,
    maxDailyCapacityOrders: 24,
    minOrdersPerRoute: 3,
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
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
    policySettings: {
      allowSameDayReschedule: true,
      sameDayCutoffTime: '09:00',
      allowInFlightSafePlace: true,
    }
  },
];

// DECOUPLED FLEET OF VANS WITH COMPLIANCE DATES & OPERATIONAL STATUSES
export const INITIAL_VANS: VanVehicle[] = [
  {
    id: 'van-1',
    registration: 'KL24 BHM',
    depotId: 'depot-bhm',
    model: 'Mercedes Sprinter 3.5t Long-Wheelbase',
    status: 'AVAILABLE',
    barcode: 'VAN-KL24BHM',
    maxPayloadKg: 1350,
    motExpiryDate: '2027-03-15',
    nextServiceDueDate: '2026-11-20',
    lastServiceDate: '2026-05-10',
    mileage: 24500,
    activeFaultsCount: 0
  },
  {
    id: 'van-2',
    registration: 'KP23 BHM',
    depotId: 'depot-bhm',
    model: 'Ford Transit 350 Leader Jumbo',
    status: 'FAULT_REPORTED',
    barcode: 'VAN-KP23BHM',
    maxPayloadKg: 1280,
    motExpiryDate: '2026-10-10',
    nextServiceDueDate: '2026-12-05',
    lastServiceDate: '2026-04-12',
    mileage: 48900,
    activeFaultsCount: 1
  },
  {
    id: 'van-3',
    registration: 'KV72 BHM',
    depotId: 'depot-bhm',
    model: 'Mercedes Sprinter Extra-Long Frame',
    status: 'AVAILABLE',
    barcode: 'VAN-KV72BHM',
    maxPayloadKg: 1400,
    motExpiryDate: '2026-12-01',
    nextServiceDueDate: '2026-10-15',
    lastServiceDate: '2026-03-20',
    mileage: 62100,
    activeFaultsCount: 0
  },
  {
    id: 'van-4',
    registration: 'KB70 BHM',
    depotId: 'depot-bhm',
    model: 'Volkswagen Crafter CR35 Maxi',
    status: 'MAINTENANCE',
    barcode: 'VAN-KB70BHM',
    maxPayloadKg: 1300,
    motExpiryDate: '2026-09-28',
    nextServiceDueDate: '2026-09-15',
    lastServiceDate: '2026-01-10',
    mileage: 89400,
    activeFaultsCount: 0
  },
  {
    id: 'van-5',
    registration: 'KN73 BHM',
    depotId: 'depot-bhm',
    model: 'Iveco Daily 35S14 Hi-Matic',
    status: 'GROUNDED',
    barcode: 'VAN-KN73BHM',
    maxPayloadKg: 1450,
    motExpiryDate: '2027-01-18',
    nextServiceDueDate: '2026-11-30',
    lastServiceDate: '2026-05-18',
    mileage: 31200,
    activeFaultsCount: 1
  },
  {
    id: 'van-6',
    registration: 'KL24 LON',
    depotId: 'depot-lon-n',
    model: 'Mercedes Sprinter 3.5t Long-Wheelbase',
    status: 'AVAILABLE',
    barcode: 'VAN-KL24LON',
    maxPayloadKg: 1350,
    motExpiryDate: '2027-04-10',
    nextServiceDueDate: '2026-12-01',
    lastServiceDate: '2026-05-01',
    mileage: 18900,
    activeFaultsCount: 0
  },
];

// INITIAL VEHICLE DEFECT REPORTS (WORKSHOP & SAFETY STREAM)
export const INITIAL_FAULTS: VehicleFaultReport[] = [
  {
    id: 'flt-1',
    vanId: 'van-2',
    vanRegistration: 'KP23 BHM',
    depotId: 'depot-bhm',
    reportedByDriverId: 'drv-2',
    reportedByDriverName: 'Sarah Miller',
    timestamp: 'Today 07:15 AM',
    category: 'LIGHTS_ELECTRICS',
    severity: 'MEDIUM',
    description: 'Engine management orange light illuminated on dashboard after startup. Vehicle drives normally without power loss.',
    status: 'OPEN',
  },
  {
    id: 'flt-2',
    vanId: 'van-5',
    vanRegistration: 'KN73 BHM',
    depotId: 'depot-bhm',
    reportedByDriverId: 'drv-1',
    reportedByDriverName: 'Dave Taylor',
    timestamp: 'Yesterday 16:45',
    category: 'BRAKES',
    severity: 'CRITICAL_GROUND_VEHICLE',
    description: 'Severe grinding noise and spongy pedal travel under heavy braking. Front nearside brake pads worn to metal.',
    status: 'GROUNDED',
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    name: 'Ross Jermy (Operations Director)',
    email: 'r.jermy@kalsi.co.uk',
    role: 'HEAD_OFFICE_ADMIN',
  },
  {
    id: 'usr-controller-bhm',
    name: 'Karan Kalsi (BHM Controller)',
    email: 'karan@kalsi.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-bhm',
  },
  {
    id: 'usr-controller-lon-n',
    name: 'Mark Henderson (London N Controller)',
    email: 'm.henderson@kalsi.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-lon-n',
  },
  {
    id: 'usr-controller-lon-s',
    name: 'Paul Cooper (London S Controller)',
    email: 'p.cooper@kalsi.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-lon-s',
  },
  {
    id: 'usr-controller-man',
    name: 'Claire Edwards (Manchester Controller)',
    email: 'c.edwards@kalsi.co.uk',
    role: 'DEPOT_CONTROLLER',
    assignedDepotId: 'depot-man',
  },
];

// DECOUPLED DRIVER ROSTER
export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Dave Taylor',
    phone: '07700 900123',
    currentLat: 52.4862,
    currentLng: -1.8904,
    lastUpdated: '10:42 AM',
    status: 'IDLE',
    depotId: 'depot-bhm',
  },
  {
    id: 'drv-2',
    name: 'Sarah Miller',
    phone: '07700 900456',
    currentLat: 52.4144,
    currentLng: -1.8211,
    lastUpdated: '10:45 AM',
    status: 'DELIVERING',
    depotId: 'depot-bhm',
  },
  {
    id: 'drv-3',
    name: 'Michael Wright',
    phone: '07700 900789',
    currentLat: 52.5204,
    currentLng: -1.9056,
    lastUpdated: '10:30 AM',
    status: 'IDLE',
    depotId: 'depot-bhm',
  },
  {
    id: 'drv-4',
    name: 'Emma Johnson',
    phone: '07700 900321',
    currentLat: 51.6700,
    currentLng: -0.0300,
    lastUpdated: '10:15 AM',
    status: 'IDLE',
    depotId: 'depot-lon-n',
  },
  {
    id: 'drv-5',
    name: 'Tom Bradley',
    phone: '07700 900654',
    currentLat: 51.5980,
    currentLng: -0.0710,
    lastUpdated: '09:50 AM',
    status: 'DELIVERING',
    depotId: 'depot-lon-n',
  },
  {
    id: 'drv-6',
    name: 'James Wilson',
    phone: '07700 900987',
    currentLat: 51.3750,
    currentLng: -0.1250,
    lastUpdated: '10:10 AM',
    status: 'IDLE',
    depotId: 'depot-lon-s',
  },
  {
    id: 'drv-7',
    name: 'Sophie Bennett',
    phone: '07700 900234',
    currentLat: 53.4680,
    currentLng: -2.3150,
    lastUpdated: '10:20 AM',
    status: 'IDLE',
    depotId: 'depot-man',
  },
  {
    id: 'drv-8',
    name: 'Gary Robinson',
    phone: '07700 900567',
    currentLat: 54.9350,
    currentLng: -1.6150,
    lastUpdated: '09:40 AM',
    status: 'IDLE',
    depotId: 'depot-ncl',
  }
];

export const REALISTIC_POD_PHOTOS = [
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
];

export function generateLargeOrderDataset(): Order[] {
  const seedData = [
    // Birmingham Hub (BHM)
    { 
      name: 'Marcus Evans (Apex Builders)', 
      phone: '07711 223344', 
      email: 'm.evans@apex.co.uk', 
      addr: '42 Highfield Rd, Edgbaston', 
      city: 'Birmingham', 
      pc: 'B15 3DZ', 
      lat: 52.4688, 
      lng: -1.9325, 
      depot: 'depot-bhm', 
      status: 'DELIVERED', 
      date: 'Today 08:15 AM', 
      notes: 'Signed at trade counter', 
      photoIdx: 0,
      allowLeaveSafe: true,
      requiresAgeVerification: false
    },
    { 
      name: 'Janet Wood (Wood Renovations)', 
      phone: '07822 334455', 
      email: 'janet@wood.co.uk', 
      addr: '15 Sutton Rd, Erdington', 
      city: 'Birmingham', 
      pc: 'B23 6QJ', 
      lat: 52.5273, 
      lng: -1.8411, 
      depot: 'depot-bhm', 
      status: 'OUT_FOR_DELIVERY',
      allowLeaveSafe: true,
      requiresAgeVerification: true, // Solvent order
      itemsExtra: [{ id: 'itm-solv-1', sku: 'SOLV-CLEANER-1L', name: 'PVC Solvent Cleaner 1L (18+)', quantity: 2, dwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: true }]
    },
    { 
      name: 'Liam Patterson (Patterson Plastics)', 
      phone: '07933 445566', 
      email: 'liam@patterson.co.uk', 
      addr: 'Unit 4 Redfern Estate, Tyseley', 
      city: 'Birmingham', 
      pc: 'B11 2BE', 
      lat: 52.4578, 
      lng: -1.8415, 
      depot: 'depot-bhm', 
      status: 'ROUTED',
      allowLeaveSafe: true,
      requiresAgeVerification: false,
      leaveSafePreference: {
        requested: true,
        locationType: 'BEHIND_SIDE_GATE',
        accessInstructions: 'Side gate is unlocked. Please leave under the lean-to roof.',
        requestedAt: '08:30 AM',
        inFlightUpdate: true
      }
    },
    { 
      name: 'Claire Smith (Shirley Roofing)', 
      phone: '07544 112233', 
      email: 'claire@shirleyroof.co.uk', 
      addr: '88 Solihull Rd, Shirley', 
      city: 'Solihull', 
      pc: 'B90 3HG', 
      lat: 52.4144, 
      lng: -1.8211, 
      depot: 'depot-bhm', 
      status: 'DELIVERED', 
      date: 'Today 08:35 AM', 
      notes: 'Large parcel pack placed securely behind front gate', 
      photoIdx: 1,
      allowLeaveSafe: true,
      requiresAgeVerification: false
    },
    { 
      name: 'Arthur Pendelton (Midlands Cladding)', 
      phone: '07633 889900', 
      email: 'arthur@midlandsclad.co.uk', 
      addr: '102 Walsall Rd, Perry Barr', 
      city: 'Birmingham', 
      pc: 'B42 1SG', 
      lat: 52.5204, 
      lng: -1.9056, 
      depot: 'depot-bhm', 
      status: 'PENDING',
      allowLeaveSafe: false, // Polycarbonate fragile sheets
      requiresAgeVerification: false,
      itemsExtra: [{ id: 'itm-poly-1', sku: 'POLY-SHEET-3X1', name: 'Multiwall Polycarbonate 3m x 1m', quantity: 4, dwellMins: 25, allowLeaveSafe: false, requiresAgeVerification: false }]
    },
    { 
      name: 'David Miller (Miller Gutters)', 
      phone: '07412 884411', 
      email: 'dave@millers.co.uk', 
      addr: '19 Harborne High St', 
      city: 'Birmingham', 
      pc: 'B17 9NT', 
      lat: 52.4590, 
      lng: -1.9442, 
      depot: 'depot-bhm', 
      status: 'PENDING',
      allowLeaveSafe: true,
      requiresAgeVerification: false
    },
    { 
      name: 'Keith Reynolds (Brum Fascias)', 
      phone: '07700 882211', 
      email: 'keith@brumfascias.co.uk', 
      addr: '77 Kingsbury Rd', 
      city: 'Birmingham', 
      pc: 'B24 8QQ', 
      lat: 52.5180, 
      lng: -1.8320, 
      depot: 'depot-bhm', 
      status: 'PENDING',
      allowLeaveSafe: true,
      requiresAgeVerification: false
    },
    { 
      name: 'Darren Cox (Telford Far Outpost)', 
      phone: '07700 994433', 
      email: 'darren@telforddev.co.uk', 
      addr: '88 Wrekin View, Telford', 
      city: 'Telford', 
      pc: 'TF1 2AA', 
      lat: 52.6780, 
      lng: -2.4490, 
      depot: 'depot-bhm', 
      status: 'PENDING', 
      belowRouteCriteria: true, 
      criteriaReason: 'Isolated single stop (32 miles from depot cluster). Awaiting order consolidation.',
      allowLeaveSafe: true,
      requiresAgeVerification: false
    },

    // London North Hub (LON-N)
    { name: 'Graham Walker (Enfield Drainage)', phone: '07700 556677', email: 'graham@enfielddrain.co.uk', addr: '10 Innova Way, Enfield', city: 'London', pc: 'EN3 7FL', lat: 51.6680, lng: -0.0350, depot: 'depot-lon-n', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Toby Marshall (Tottenham Timber & Plastic)', phone: '07700 667788', email: 'toby@tottenhamtp.co.uk', addr: '44 High Rd, Tottenham', city: 'London', pc: 'N17 9TA', lat: 51.5980, lng: -0.0710, depot: 'depot-lon-n', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: true, itemsExtra: [{ id: 'itm-solv-2', sku: 'ADH-SOLV-500ML', name: 'Solvent Weld Cement 500ml (18+)', quantity: 4, dwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: true }] },
    { name: 'Oliver King (Barnet Building Supplies)', phone: '07700 778899', email: 'oliver@barnetbuild.co.uk', addr: '12 Wood St, Barnet', city: 'London', pc: 'EN5 4BP', lat: 51.6540, lng: -0.2010, depot: 'depot-lon-n', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Dean Harris (Islington Civils)', phone: '07700 889911', email: 'dean@islingtoncivils.co.uk', addr: '82 Upper St, Islington', city: 'London', pc: 'N1 0NU', lat: 51.5380, lng: -0.1030, depot: 'depot-lon-n', status: 'DELIVERED', date: 'Yesterday 15:40', notes: 'Heavy parcel cargo offloaded into site store', photoIdx: 2, allowLeaveSafe: true, requiresAgeVerification: false },

    // London South Hub (LON-S)
    { name: 'Steven Clark (Croydon Roofing)', phone: '07700 443322', email: 'steven@croydonroof.co.uk', addr: '94 Purley Way', city: 'Croydon', pc: 'CR0 4XJ', lat: 51.3780, lng: -0.1190, depot: 'depot-lon-s', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Ray Campbell (Bromley Plastics)', phone: '07700 332211', email: 'ray@bromleyplastics.co.uk', addr: '28 Masons Hill', city: 'Bromley', pc: 'BR2 9HG', lat: 51.3980, lng: 0.0190, depot: 'depot-lon-s', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Lewis Finch (Mitcham Civils)', phone: '07700 221100', email: 'lewis@mitcham.co.uk', addr: '14 London Rd', city: 'Mitcham', pc: 'CR4 2YR', lat: 51.4020, lng: -0.1680, depot: 'depot-lon-s', status: 'DELIVERED', date: 'Yesterday 11:20', notes: 'Palletized trade goods delivered at loading bay', photoIdx: 3, allowLeaveSafe: true, requiresAgeVerification: false },

    // Newcastle & North East (NCL)
    { name: 'Ian Robson (Tyne Valley Plastics)', phone: '07700 665544', email: 'ian@tyneplastics.co.uk', addr: '34 Team Valley Way', city: 'Gateshead', pc: 'NE11 0QA', lat: 54.9350, lng: -1.6150, depot: 'depot-ncl', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Barry Dobson (Durham Trade Counters)', phone: '07700 554433', email: 'barry@durhamtrade.co.uk', addr: 'Unit 2 Belmont Estate', city: 'Durham', pc: 'DH1 1TW', lat: 54.7890, lng: -1.5420, depot: 'depot-ncl', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
    { name: 'Graeme Watson (Sunderland Roofing)', phone: '07700 445566', email: 'graeme@sunderlandroof.co.uk', addr: '18 Riverside Rd', city: 'Sunderland', pc: 'SR5 3JG', lat: 54.9120, lng: -1.4110, depot: 'depot-ncl', status: 'PENDING', allowLeaveSafe: true, requiresAgeVerification: false },
  ];

  return seedData.map((s, idx) => {
    const isDelivered = s.status === 'DELIVERED';
    const baseItems = [
      { id: `itm-1-${idx}`, sku: 'FAS-5M-WHT', name: '5m Fascia Board White', quantity: 8, dwellMins: 12, allowLeaveSafe: true, requiresAgeVerification: false },
      { id: `itm-2-${idx}`, sku: 'GUT-4M-RND', name: '4m Roundline Gutter', quantity: 12, dwellMins: 15, allowLeaveSafe: true, requiresAgeVerification: false },
      { id: `itm-3-${idx}`, sku: 'SEAL-SIL-CLR', name: 'Low Mod Silicone Box', quantity: 2, dwellMins: 5, allowLeaveSafe: true, requiresAgeVerification: false },
    ];
    const finalItems = (s as any).itemsExtra ? [...baseItems, ...(s as any).itemsExtra] : baseItems;
    const allowsSafe = finalItems.every((it) => it.allowLeaveSafe !== false);
    const needsAge = finalItems.some((it) => it.requiresAgeVerification === true);

    return {
      id: `ord-oms-${idx + 1}`,
      trackingNumber: `KAL-${884000 + idx}`,
      depotId: s.depot,
      customerName: s.name,
      customerPhone: s.phone,
      customerEmail: s.email,
      address: s.addr,
      city: s.city,
      postcode: s.pc,
      lat: s.lat,
      lng: s.lng,
      items: finalItems,
      totalDwellMins: finalItems.reduce((acc, it) => acc + (it.dwellMins || 10), 0),
      deliveryWindowStart: '08:00',
      deliveryWindowEnd: '12:00',
      scheduledDeliveryDate: new Date().toISOString().split('T')[0],
      status: s.status as any,
      belowRouteCriteria: (s as any).belowRouteCriteria || false,
      criteriaReason: (s as any).criteriaReason,
      allowLeaveSafe: allowsSafe,
      requiresAgeVerification: needsAge,
      leaveSafePreference: (s as any).leaveSafePreference,
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
    status: 'COMPLETED',
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
    status: 'IN_PROGRESS',
    totalDwellMins: 120,
    totalDrivingMins: 190,
    breakTimeMins: 45,
    totalEstimatedMins: 355,
    totalDistanceKm: 78.0,
    shiftUtilisationPct: 74,
    isProblemRoute: false,
    driverId: 'drv-2',
    driver: INITIAL_DRIVERS[1],
    vanId: 'van-3',
    vanRegistration: 'KV72 BHM',
    orders: [INITIAL_ORDERS[1], INITIAL_ORDERS[2], INITIAL_ORDERS[4]],
  },
];
