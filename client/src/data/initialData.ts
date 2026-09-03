import { Depot, Driver, Shipment, DeliveryRoute, SkuDwellRule, DepotSettings } from '../types';

export const INITIAL_SKU_RULES: SkuDwellRule[] = [
  { skuCode: 'FASCIA-5M', name: '5m Heavy Fascia Board (Anthracite/White)', dwellMins: 20, vanUnits: 4 },
  { skuCode: 'GUTTER-4M', name: '4m Rainwater Gutter / Downpipe Pack', dwellMins: 12, vanUnits: 2 },
  { skuCode: 'SOFFIT-3M', name: '3m Hollow Cladding & Soffit Pack', dwellMins: 10, vanUnits: 2 },
  { skuCode: 'POLYCARB-SHEET', name: '4m Polycarbonate Roof Sheet (Bulky 2-man)', dwellMins: 25, vanUnits: 5 },
  { skuCode: 'SILL-UPVC-3M', name: '3m Window Sills & Trims', dwellMins: 8, vanUnits: 1 },
  { skuCode: 'JOINTS-FITTINGS', name: 'Box of Gutter Brackets & Joint Outlets', dwellMins: 5, vanUnits: 1 },
];

export const DEFAULT_DEPOT_SETTINGS: DepotSettings = {
  maxVanCapacityUnits: 16, // Typical 3.5t LWB Sprinter can fit up to 16 capacity units of plastic lengths
  maxStopsPerRun: 8,
  dwellCalculationMode: 'MAX_PLUS_BUFFER', // Takes highest item dwell + 5 min per additional item
  baseBufferMins: 5,
};

export const INITIAL_DEPOTS: Depot[] = [
  { id: 'depot-bhm', code: 'BHM', name: 'Birmingham Central Depot', address: 'Nechells Parkway, Birmingham', postcode: 'B7 5EX', lat: 52.4938, lng: -1.8687 },
  { id: 'depot-man', code: 'MAN', name: 'Manchester North Depot', address: 'Trafford Park, Manchester', postcode: 'M17 1HH', lat: 53.4682, lng: -2.3168 },
  { id: 'depot-lds', code: 'LDS', name: 'Leeds West Depot', address: 'Gellderd Road, Leeds', postcode: 'LS12 6LU', lat: 53.7786, lng: -1.5835 },
  { id: 'depot-brs', code: 'BRS', name: 'Bristol Avonmouth Depot', address: 'Avonmouth Way, Bristol', postcode: 'BS11 9YS', lat: 51.5034, lng: -2.6983 },
  { id: 'depot-lone', code: 'LONE', name: 'London East (Barking) Depot', address: 'Barking Industrial Park, London', postcode: 'IG11 0TT', lat: 51.5284, lng: 0.1197 },
  { id: 'depot-lonw', code: 'LONW', name: 'London West (Park Royal) Depot', address: 'Park Royal Rd, London', postcode: 'NW10 7JH', lat: 51.5362, lng: -0.2745 },
  { id: 'depot-sou', code: 'SOU', name: 'Southampton Maritime Depot', address: 'Western Docks, Southampton', postcode: 'SO15 0HH', lat: 50.9038, lng: -1.4312 },
  { id: 'depot-not', code: 'NOT', name: 'Nottingham Trent Depot', address: 'Queens Drive Industrial Estate, Nottingham', postcode: 'NG2 1NB', lat: 52.9362, lng: -1.1612 },
  { id: 'depot-new', code: 'NEW', name: 'Newcastle Team Valley Depot', address: 'Team Valley Trading Estate, Gateshead', postcode: 'NE11 0NA', lat: 54.9281, lng: -1.6154 },
  { id: 'depot-shf', code: 'SHF', name: 'Sheffield Meadowhall Depot', address: 'Meadowhall Way, Sheffield', postcode: 'S9 1BW', lat: 53.4184, lng: -1.4112 },
  { id: 'depot-gla', code: 'GLA', name: 'Glasgow Cambuslang Depot', address: 'Cambuslang Investment Park, Glasgow', postcode: 'G72 7UU', lat: 55.8234, lng: -4.1593 },
  { id: 'depot-edn', code: 'EDN', name: 'Edinburgh Newbridge Depot', address: 'Cliftonhall Rd, Newbridge, Edinburgh', postcode: 'EH28 8PW', lat: 55.9328, lng: -3.4285 },
  { id: 'depot-cdf', code: 'CDF', name: 'Cardiff Ocean Way Depot', address: 'Ocean Way, Cardiff', postcode: 'CF24 5HF', lat: 51.4791, lng: -3.1532 },
  { id: 'depot-swa', code: 'SWA', name: 'Swansea Enterprise Depot', address: 'Phoenix Way, Swansea', postcode: 'SA7 9EQ', lat: 51.6582, lng: -3.9011 },
  { id: 'depot-liv', code: 'LIV', name: 'Liverpool Knowsley Depot', address: 'Knowsley Business Park, Liverpool', postcode: 'L34 9HJ', lat: 53.4561, lng: -2.8451 },
  { id: 'depot-ply', code: 'PLY', name: 'Plymouth Tamar Depot', address: 'Valley Rd, Plympton, Plymouth', postcode: 'PL7 1RF', lat: 50.3872, lng: -4.0531 },
  { id: 'depot-exr', code: 'EXR', name: 'Exeter Sowton Depot', address: 'Sowton Industrial Estate, Exeter', postcode: 'EX2 7QL', lat: 50.7221, lng: -3.4721 },
  { id: 'depot-nor', code: 'NOR', name: 'Norwich Broadland Depot', address: 'Broadland Business Park, Norwich', postcode: 'NR7 0WF', lat: 52.6341, lng: 1.3712 },
  { id: 'depot-cam', code: 'CAM', name: 'Cambridge North Depot', address: 'Cowley Road, Cambridge', postcode: 'CB4 0WS', lat: 52.2351, lng: 0.1492 },
  { id: 'depot-oxf', code: 'OXF', name: 'Oxford Cowley Depot', address: 'Watlington Rd, Cowley, Oxford', postcode: 'OX4 6NF', lat: 51.7289, lng: -1.1983 },
  { id: 'depot-mil', code: 'MIL', name: 'Milton Keynes Depot', address: 'Tongwell, Milton Keynes', postcode: 'MK15 8HG', lat: 52.0621, lng: -0.7182 },
  { id: 'depot-mid', code: 'MID', name: 'Middlesbrough Riverside Depot', address: 'Riverside Park Rd, Middlesbrough', postcode: 'TS2 1UT', lat: 54.5824, lng: -1.2415 }
];

export const INITIAL_DRIVERS: Driver[] = [
  { id: 'drv-bhm-1', username: 'dave_bhm', name: 'Dave Jenkins (Lead Driver)', phone: '+44 7700 900101', vehicleReg: 'KL24 BHM', depotId: 'depot-bhm' },
  { id: 'drv-bhm-2', username: 'sarah_bhm', name: 'Sarah Miller', phone: '+44 7700 900102', vehicleReg: 'KP23 BHM', depotId: 'depot-bhm' },
  { id: 'drv-bhm-3', username: 'kieran_bhm', name: 'Kieran Scott', phone: '+44 7700 900103', vehicleReg: 'KV72 BHM', depotId: 'depot-bhm' },
  { id: 'drv-man-1', username: 'tom_man', name: 'Tom Higgins', phone: '+44 7700 900201', vehicleReg: 'KL24 MAN', depotId: 'depot-man' },
  { id: 'drv-brs-1', username: 'alex_brs', name: 'Alex Carter', phone: '+44 7700 900301', vehicleReg: 'KL24 BRS', depotId: 'depot-brs' },
  { id: 'drv-lone-1', username: 'marcus_lone', name: 'Marcus Campbell', phone: '+44 7700 900401', vehicleReg: 'KL24 LNE', depotId: 'depot-lone' },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'shp-101',
    trackingNumber: 'KAL-BHM-9011',
    externalOrderId: 'BQ-881920',
    sourceChannel: 'B&Q',
    labelApiRef: 'lbl_bq_9981',
    customerName: 'Marcus Evans (Trade Builder)',
    customerPhone: '+44 7711 223344',
    customerEmail: 'marcus.e@builder.co.uk',
    address: '42 Highfield Road, Edgbaston',
    city: 'Birmingham',
    postcode: 'B15 3DZ',
    lat: 52.4688,
    lng: -1.9325,
    itemsDescription: '4x 5m Anthracite Grey Fascia Boards (SKU: FASCIA-5M), 3x Square Gutter 4m (SKU: GUTTER-4M)',
    itemsList: [
      { sku: 'FASCIA-5M', name: '5m Heavy Fascia Board', quantity: 4, individualDwellMins: 20, unitSize: 4 },
      { sku: 'GUTTER-4M', name: '4m Gutter Pack', quantity: 3, individualDwellMins: 12, unitSize: 2 },
    ],
    specialNotes: 'Heavy 5m lengths. Site gate entry code 1984.',
    calculatedDwellMins: 25,
    vanCapacityUnits: 6,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-102',
    trackingNumber: 'KAL-BHM-9012',
    externalOrderId: 'SHOP-94101',
    sourceChannel: 'Shopify',
    labelApiRef: 'lbl_sp_4412',
    customerName: 'Mrs. Janet Wood',
    customerPhone: '+44 7822 334455',
    customerEmail: 'j.wood@outlook.com',
    address: '15 Sutton Road, Erdington',
    city: 'Birmingham',
    postcode: 'B23 6QJ',
    lat: 52.5273,
    lng: -1.8411,
    itemsDescription: '2x 3m Hollow Soffit White (SKU: SOFFIT-3M)',
    itemsList: [
      { sku: 'SOFFIT-3M', name: '3m Hollow Soffit', quantity: 2, individualDwellMins: 10, unitSize: 2 }
    ],
    specialNotes: 'Leave on driveway if no answer.',
    calculatedDwellMins: 10,
    vanCapacityUnits: 2,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-103',
    trackingNumber: 'KAL-BHM-9013',
    externalOrderId: 'EBAY-49210',
    sourceChannel: 'eBay',
    labelApiRef: 'lbl_eb_1190',
    customerName: 'Liam Patterson Plastics Ltd',
    customerPhone: '+44 7933 445566',
    customerEmail: 'liam@pattersonplastics.co.uk',
    address: 'Unit 4, Redfern Industrial Estate, Tyseley',
    city: 'Birmingham',
    postcode: 'B11 2BE',
    lat: 52.4578,
    lng: -1.8415,
    itemsDescription: '10x 5m Black Ash Shiplap Cladding (SKU: FASCIA-5M)',
    itemsList: [
      { sku: 'FASCIA-5M', name: '5m Heavy Cladding', quantity: 10, individualDwellMins: 20, unitSize: 4 },
      { sku: 'JOINTS-FITTINGS', name: 'Joint Outlets', quantity: 4, individualDwellMins: 5, unitSize: 1 }
    ],
    specialNotes: 'Forklift available on site for offload.',
    calculatedDwellMins: 25,
    vanCapacityUnits: 5,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-104',
    trackingNumber: 'KAL-BHM-9014',
    externalOrderId: 'BQ-881944',
    sourceChannel: 'B&Q',
    labelApiRef: 'lbl_bq_1002',
    customerName: 'Claire Smith (DIY)',
    customerPhone: '+44 7544 112233',
    address: '88 Solihull Road, Shirley',
    city: 'Solihull',
    postcode: 'B90 3HG',
    lat: 52.4144,
    lng: -1.8211,
    itemsDescription: '3x Deepflow Guttering 4m Black (SKU: GUTTER-4M)',
    itemsList: [
      { sku: 'GUTTER-4M', name: '4m Guttering', quantity: 3, individualDwellMins: 12, unitSize: 2 }
    ],
    specialNotes: 'Please ring bell twice.',
    calculatedDwellMins: 12,
    vanCapacityUnits: 2,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-105',
    trackingNumber: 'KAL-BHM-9015',
    externalOrderId: 'SHOP-94145',
    sourceChannel: 'Shopify',
    labelApiRef: 'lbl_sp_9918',
    customerName: 'Arthur Pendelton',
    customerPhone: '+44 7633 889900',
    address: '102 Walsall Road, Perry Barr',
    city: 'Birmingham',
    postcode: 'B42 1SG',
    lat: 52.5204,
    lng: -1.9056,
    itemsDescription: '6x UPVC Window Sills 3m White (SKU: SILL-UPVC-3M)',
    itemsList: [
      { sku: 'SILL-UPVC-3M', name: '3m Window Sills', quantity: 6, individualDwellMins: 8, unitSize: 1 }
    ],
    specialNotes: 'Fragile profile edges. Handle with care.',
    calculatedDwellMins: 10,
    vanCapacityUnits: 2,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-106',
    trackingNumber: 'KAL-BHM-9016',
    externalOrderId: 'EBAY-49288',
    sourceChannel: 'eBay',
    labelApiRef: 'lbl_eb_5521',
    customerName: 'Kieran Scott (Roofing contractor)',
    customerPhone: '+44 7412 884411',
    address: '19 Harborne High St',
    city: 'Birmingham',
    postcode: 'B17 9NT',
    lat: 52.4590,
    lng: -1.9442,
    itemsDescription: '5x 5m Anthracite Round Downpipes (SKU: GUTTER-4M)',
    itemsList: [
      { sku: 'GUTTER-4M', name: '4m Downpipes', quantity: 5, individualDwellMins: 12, unitSize: 2 }
    ],
    specialNotes: 'Side driveway access.',
    calculatedDwellMins: 15,
    vanCapacityUnits: 3,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-107',
    trackingNumber: 'KAL-BHM-9017',
    externalOrderId: 'BQ-882109',
    sourceChannel: 'B&Q',
    labelApiRef: 'lbl_bq_4402',
    customerName: 'Midlands Conservatories',
    customerPhone: '+44 7333 551122',
    address: 'Unit 9 Kings Norton Trade Park',
    city: 'Birmingham',
    postcode: 'B30 3HB',
    lat: 52.4082,
    lng: -1.9288,
    itemsDescription: '8x Polycarbonate Roofing Sheets 4m (SKU: POLYCARB-SHEET)',
    itemsList: [
      { sku: 'POLYCARB-SHEET', name: '4m Polycarbonate Roof Sheet', quantity: 8, individualDwellMins: 25, unitSize: 5 }
    ],
    specialNotes: 'Extra long bulky sheets. Requires 2 person lift.',
    calculatedDwellMins: 30,
    vanCapacityUnits: 5,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-108',
    trackingNumber: 'KAL-BHM-9018',
    externalOrderId: 'SHOP-94210',
    sourceChannel: 'Shopify',
    labelApiRef: 'lbl_sp_9871',
    customerName: 'Bradley Cooper Renovations',
    customerPhone: '+44 7122 998877',
    address: '55 Stoney Lane, Sparkbrook',
    city: 'Birmingham',
    postcode: 'B12 8AJ',
    lat: 52.4632,
    lng: -1.8741,
    itemsDescription: '4x Hollow Soffit Oak 5m (SKU: SOFFIT-3M), 2x J-Trims',
    itemsList: [
      { sku: 'SOFFIT-3M', name: '5m Soffit Oak', quantity: 4, individualDwellMins: 10, unitSize: 2 }
    ],
    specialNotes: 'Call 10 mins before arrival.',
    calculatedDwellMins: 12,
    vanCapacityUnits: 2,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-109',
    trackingNumber: 'KAL-BHM-9019',
    externalOrderId: 'BQ-882201',
    sourceChannel: 'B&Q',
    labelApiRef: 'lbl_bq_5510',
    customerName: 'Solihull Window & Fascia Co',
    customerPhone: '+44 7899 221100',
    address: '14 Warwick Road, Solihull',
    city: 'Solihull',
    postcode: 'B92 7HX',
    lat: 52.4201,
    lng: -1.7820,
    itemsDescription: '6x 5m Anthracite Fascia (SKU: FASCIA-5M), 4x 4m Gutters (SKU: GUTTER-4M)',
    itemsList: [
      { sku: 'FASCIA-5M', name: '5m Anthracite Fascia', quantity: 6, individualDwellMins: 20, unitSize: 4 },
      { sku: 'GUTTER-4M', name: '4m Gutters', quantity: 4, individualDwellMins: 12, unitSize: 2 }
    ],
    specialNotes: 'Trade counter delivery.',
    calculatedDwellMins: 25,
    vanCapacityUnits: 6,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  },
  {
    id: 'shp-110',
    trackingNumber: 'KAL-BHM-9020',
    externalOrderId: 'EBAY-49330',
    sourceChannel: 'eBay',
    labelApiRef: 'lbl_eb_8801',
    customerName: 'Apex Cladding Supplies',
    customerPhone: '+44 7654 321987',
    address: '8 Aston Cross, Birmingham',
    city: 'Birmingham',
    postcode: 'B6 5RQ',
    lat: 52.4981,
    lng: -1.8842,
    itemsDescription: '12x UPVC Window Trims (SKU: SILL-UPVC-3M)',
    itemsList: [
      { sku: 'SILL-UPVC-3M', name: 'Window Trims', quantity: 12, individualDwellMins: 8, unitSize: 1 }
    ],
    specialNotes: 'Rear loading dock.',
    calculatedDwellMins: 15,
    vanCapacityUnits: 3,
    status: 'BUCKET_PENDING',
    depotId: 'depot-bhm',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ROUTES: DeliveryRoute[] = [];
