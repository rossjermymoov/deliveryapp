import { Order, Driver, DeliveryRoute, SkuDwellSetting, BrandTheme } from '../types';

export const KALSI_BRAND_THEME: BrandTheme = {
  companyName: 'Kalsi Plastics',
  tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
  logoText: 'KALSI',
  primaryColor: '#0F1E36', // Kalsi Navy
  secondaryColor: '#0072CE', // Kalsi Blue
  accentColor: '#16A34A', // Kalsi Green
  headerBgColor: '#0F1E36',
};

export const PRESET_THEMES: Record<string, BrandTheme> = {
  kalsi: {
    companyName: 'Kalsi Plastics',
    tagline: 'Advanced Building Product Manufacturing & Fleet Logistics',
    logoText: 'KALSI',
    primaryColor: '#0F1E36', // Kalsi Navy
    secondaryColor: '#0072CE', // Kalsi Blue
    accentColor: '#16A34A', // Kalsi Green
    headerBgColor: '#0F1E36',
  },
  moov: {
    companyName: 'Moov Logistics',
    tagline: 'Next-Generation Delivery & Route Optimization Engine',
    logoText: 'MOOV',
    primaryColor: '#18181B', // Dark Zinc
    secondaryColor: '#6366F1', // Indigo
    accentColor: '#EC4899', // Pink Accent
    headerBgColor: '#18181B',
  },
  timber: {
    companyName: 'Premier Timber & Building',
    tagline: 'Nationwide Heavy Goods & Trade Delivery Network',
    logoText: 'PREMIER',
    primaryColor: '#27272A',
    secondaryColor: '#D97706', // Amber Gold
    accentColor: '#059669', // Emerald
    headerBgColor: '#1C1917',
  },
  generic: {
    companyName: 'Enterprise Delivery OS',
    tagline: 'Multi-Depot Routing & Fleet Management Platform',
    logoText: 'FLEET',
    primaryColor: '#0F172A', // Slate 900
    secondaryColor: '#2563EB', // Blue 600
    accentColor: '#10B981', // Emerald 500
    headerBgColor: '#0F172A',
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
    currentLat: 52.4862,
    currentLng: -1.8904,
    lastUpdated: '10:42 AM',
    status: 'ON_ROUTE',
  },
  {
    id: 'drv-2',
    name: 'Sarah Miller',
    phone: '07700 900102',
    vehicleReg: 'KP23 BHM',
    currentLat: 52.4550,
    currentLng: -1.9400,
    lastUpdated: '10:40 AM',
    status: 'DELIVERING',
  },
  {
    id: 'drv-3',
    name: 'Kieran Scott',
    phone: '07700 900103',
    vehicleReg: 'KV72 BHM',
    currentLat: 52.5200,
    currentLng: -1.8600,
    lastUpdated: '10:35 AM',
    status: 'IDLE',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-01',
    trackingNumber: 'KAL-889101',
    customerName: 'Marcus Evans',
    customerPhone: '07711 223344',
    customerEmail: 'm.evans@apexbuilders.co.uk',
    address: '42 Highfield Road, Edgbaston',
    city: 'Birmingham',
    postcode: 'B15 3DZ',
    lat: 52.4688,
    lng: -1.9325,
    items: [
      { sku: 'FAS-5M-ANT', name: '5m Fascia Board (Anthracite Grey)', quantity: 4, dwellMinsPerUnit: 20 },
      { sku: 'GUT-4M-BLK', name: '4m Deepflow Gutter (Black)', quantity: 3, dwellMinsPerUnit: 12 },
      { sku: 'BOX-BRK-20', name: 'Box of Gutter Brackets & Jointers (20pk)', quantity: 1, dwellMinsPerUnit: 5 },
    ],
    totalDwellMins: 25,
    specialNotes: 'Heavy 5m lengths. Gate entry code 1984.',
    status: 'PENDING',
    createdAt: '2026-09-03T08:30:00Z',
  },
  {
    id: 'ord-02',
    trackingNumber: 'KAL-889102',
    customerName: 'Janet Wood',
    customerPhone: '07822 334455',
    customerEmail: 'janet.wood@outlook.com',
    address: '15 Sutton Road, Erdington',
    city: 'Birmingham',
    postcode: 'B23 6QJ',
    lat: 52.5273,
    lng: -1.8411,
    items: [
      { sku: 'SOF-5M-HOL', name: '5m Hollow Soffit (White)', quantity: 3, dwellMinsPerUnit: 15 },
      { sku: 'PIPE-4M-RND', name: '4m Rainwater Downpipe (Round)', quantity: 2, dwellMinsPerUnit: 10 },
    ],
    totalDwellMins: 18,
    specialNotes: 'Leave on driveway if no answer.',
    status: 'PENDING',
    createdAt: '2026-09-03T08:45:00Z',
  },
  {
    id: 'ord-03',
    trackingNumber: 'KAL-889103',
    customerName: 'Liam Patterson',
    customerPhone: '07933 445566',
    customerEmail: 'liam@pattersonplastics.co.uk',
    address: 'Unit 4, Redfern Industrial Estate, Tyseley',
    city: 'Birmingham',
    postcode: 'B11 2BE',
    lat: 52.4578,
    lng: -1.8415,
    items: [
      { sku: 'CLAD-5M-OAK', name: '5m Shiplap Cladding Pack (Oak)', quantity: 6, dwellMinsPerUnit: 25 },
    ],
    totalDwellMins: 25,
    specialNotes: 'Forklift available on site.',
    status: 'PENDING',
    createdAt: '2026-09-03T09:00:00Z',
  },
  {
    id: 'ord-04',
    trackingNumber: 'KAL-889104',
    customerName: 'Claire Smith',
    customerPhone: '07544 112233',
    customerEmail: 'c.smith88@gmail.com',
    address: '88 Solihull Road, Shirley',
    city: 'Solihull',
    postcode: 'B90 3HG',
    lat: 52.4144,
    lng: -1.8211,
    items: [
      { sku: 'DRAIN-3M-110', name: '110mm Underground Drainage Pipe 3m', quantity: 4, dwellMinsPerUnit: 15 },
      { sku: 'MDPE-50M-25', name: '25mm MDPE Water Supply Pipe 50m', quantity: 2, dwellMinsPerUnit: 10 },
    ],
    totalDwellMins: 20,
    status: 'PENDING',
    createdAt: '2026-09-03T09:15:00Z',
  },
  {
    id: 'ord-05',
    trackingNumber: 'KAL-889105',
    customerName: 'Arthur Pendelton',
    customerPhone: '07633 889900',
    customerEmail: 'arthur.p@renovations.co.uk',
    address: '102 Walsall Road, Perry Barr',
    city: 'Birmingham',
    postcode: 'B42 1SG',
    lat: 52.5204,
    lng: -1.9056,
    items: [
      { sku: 'FAS-5M-WHT', name: '5m Fascia Board (White)', quantity: 5, dwellMinsPerUnit: 20 },
    ],
    totalDwellMins: 20,
    status: 'PENDING',
    createdAt: '2026-09-03T09:30:00Z',
  },
  {
    id: 'ord-06',
    trackingNumber: 'KAL-889106',
    customerName: 'David Miller',
    customerPhone: '07412 884411',
    customerEmail: 'dave@millersroofing.co.uk',
    address: '19 Harborne High St',
    city: 'Birmingham',
    postcode: 'B17 9NT',
    lat: 52.4590,
    lng: -1.9442,
    items: [
      { sku: 'GUT-4M-BLK', name: '4m Deepflow Gutter (Black)', quantity: 5, dwellMinsPerUnit: 12 },
      { sku: 'PIPE-4M-RND', name: '4m Rainwater Downpipe (Round)', quantity: 3, dwellMinsPerUnit: 10 },
    ],
    totalDwellMins: 16,
    status: 'PENDING',
    createdAt: '2026-09-03T09:45:00Z',
  },
];

export const INITIAL_ROUTES: DeliveryRoute[] = [];
