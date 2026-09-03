import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 22 Real UK Depots for Kalsi Plastics distribution
export const UK_DEPOTS = [
  { code: 'BHM', name: 'Birmingham Central Depot', address: 'Nechells Parkway, Birmingham', postcode: 'B7 5EX', lat: 52.4938, lng: -1.8687 },
  { code: 'MAN', name: 'Manchester North Depot', address: 'Trafford Park, Manchester', postcode: 'M17 1HH', lat: 53.4682, lng: -2.3168 },
  { code: 'LDS', name: 'Leeds West Depot', address: 'Gellderd Road, Leeds', postcode: 'LS12 6LU', lat: 53.7786, lng: -1.5835 },
  { code: 'BRS', name: 'Bristol Avonmouth Depot', address: 'Avonmouth Way, Bristol', postcode: 'BS11 9YS', lat: 51.5034, lng: -2.6983 },
  { code: 'LONE', name: 'London East (Barking) Depot', address: 'Barking Industrial Park, London', postcode: 'IG11 0TT', lat: 51.5284, lng: 0.1197 },
  { code: 'LONW', name: 'London West (Park Royal) Depot', address: 'Park Royal Rd, London', postcode: 'NW10 7JH', lat: 51.5362, lng: -0.2745 },
  { code: 'SOU', name: 'Southampton Maritime Depot', address: 'Western Docks, Southampton', postcode: 'SO15 0HH', lat: 50.9038, lng: -1.4312 },
  { code: 'NOT', name: 'Nottingham Trent Depot', address: 'Queens Drive Industrial Estate, Nottingham', postcode: 'NG2 1NB', lat: 52.9362, lng: -1.1612 },
  { code: 'NEW', name: 'Newcastle Team Valley Depot', address: 'Team Valley Trading Estate, Gateshead', postcode: 'NE11 0NA', lat: 54.9281, lng: -1.6154 },
  { code: 'SHF', name: 'Sheffield Meadowhall Depot', address: 'Meadowhall Way, Sheffield', postcode: 'S9 1BW', lat: 53.4184, lng: -1.4112 },
  { code: 'GLA', name: 'Glasgow Cambuslang Depot', address: 'Cambuslang Investment Park, Glasgow', postcode: 'G72 7UU', lat: 55.8234, lng: -4.1593 },
  { code: 'EDN', name: 'Edinburgh Newbridge Depot', address: 'Cliftonhall Rd, Newbridge, Edinburgh', postcode: 'EH28 8PW', lat: 55.9328, lng: -3.4285 },
  { code: 'CDF', name: 'Cardiff Ocean Way Depot', address: 'Ocean Way, Cardiff', postcode: 'CF24 5HF', lat: 51.4791, lng: -3.1532 },
  { code: 'SWA', name: 'Swansea Enterprise Depot', address: 'Phoenix Way, Swansea', postcode: 'SA7 9EQ', lat: 51.6582, lng: -3.9011 },
  { code: 'LIV', name: 'Liverpool Knowsley Depot', address: 'Knowsley Business Park, Liverpool', postcode: 'L34 9HJ', lat: 53.4561, lng: -2.8451 },
  { code: 'PLY', name: 'Plymouth Tamar Depot', address: 'Valley Rd, Plympton, Plymouth', postcode: 'PL7 1RF', lat: 50.3872, lng: -4.0531 },
  { code: 'EXR', name: 'Exeter Sowton Depot', address: 'Sowton Industrial Estate, Exeter', postcode: 'EX2 7QL', lat: 50.7221, lng: -3.4721 },
  { code: 'NOR', name: 'Norwich Broadland Depot', address: 'Broadland Business Park, Norwich', postcode: 'NR7 0WF', lat: 52.6341, lng: 1.3712 },
  { code: 'CAM', name: 'Cambridge North Depot', address: 'Cowley Road, Cambridge', postcode: 'CB4 0WS', lat: 52.2351, lng: 0.1492 },
  { code: 'OXF', name: 'Oxford Cowley Depot', address: 'Watlington Rd, Cowley, Oxford', postcode: 'OX4 6NF', lat: 51.7289, lng: -1.1983 },
  { code: 'MIL', name: 'Milton Keynes Depot', address: 'Tongwell, Milton Keynes', postcode: 'MK15 8HG', lat: 52.0621, lng: -0.7182 },
  { code: 'MID', name: 'Middlesbrough Riverside Depot', address: 'Riverside Park Rd, Middlesbrough', postcode: 'TS2 1UT', lat: 54.5824, lng: -1.2415 }
];

async function seed() {
  console.log('Seeding Kalsi 22 UK Depots...');
  await prisma.proofOfDelivery.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.deliveryRoute.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.depot.deleteMany();

  const createdDepots: any[] = [];
  for (const d of UK_DEPOTS) {
    const depot = await prisma.depot.create({ data: d });
    createdDepots.push(depot);

    // Create 2 drivers per depot
    const driverCodes = [
      { username: `driver_${d.code.toLowerCase()}1`, name: `${d.name.split(' ')[0]} Driver A (Dave)`, phone: '+44 7700 900101', vehicleReg: `KL${d.code.substring(0, 2)} 24V` },
      { username: `driver_${d.code.toLowerCase()}2`, name: `${d.name.split(' ')[0]} Driver B (Sarah)`, phone: '+44 7700 900202', vehicleReg: `KP${d.code.substring(0, 2)} 23L` },
    ];

    for (const dc of driverCodes) {
      await prisma.driver.create({
        data: {
          username: dc.username,
          name: dc.name,
          phone: dc.phone,
          vehicleReg: dc.vehicleReg,
          depotId: depot.id,
        },
      });
    }
  }

  // Pre-seed some mock orders across different channels for Birmingham & Manchester
  const bhm = createdDepots.find(d => d.code === 'BHM');
  const man = createdDepots.find(d => d.code === 'MAN');

  const sampleShipments = [
    {
      trackingNumber: 'KAL-BHM-9011',
      externalOrderId: 'BQ-881920',
      sourceChannel: 'B&Q',
      customerName: 'Marcus Evans (Trade Builder)',
      customerPhone: '+44 7711 223344',
      customerEmail: 'marcus.e@builder.co.uk',
      address: '42 Highfield Road, Edgbaston',
      city: 'Birmingham',
      postcode: 'B15 3DZ',
      lat: 52.4688,
      lng: -1.9325,
      itemsDescription: '4x 5m Anthracite Grey Fascia Boards, 3x Square Gutter 4m, 12x Joint Brackets',
      specialNotes: 'Heavy 5m lengths. Site gate entry code 1984.',
      dwellTimeMins: 20,
      depotId: bhm.id,
    },
    {
      trackingNumber: 'KAL-BHM-9012',
      externalOrderId: 'SHOP-94101',
      sourceChannel: 'Shopify',
      customerName: 'Mrs. Janet Wood',
      customerPhone: '+44 7822 334455',
      customerEmail: 'j.wood@outlook.com',
      address: '15 Sutton Road, Erdington',
      city: 'Birmingham',
      postcode: 'B23 6QJ',
      lat: 52.5273,
      lng: -1.8411,
      itemsDescription: '2x 3m Hollow Soffit White, 1x 110mm Soil Pipe 3m',
      specialNotes: 'Leave on driveway if no answer.',
      dwellTimeMins: 15,
      depotId: bhm.id,
    },
    {
      trackingNumber: 'KAL-BHM-9013',
      externalOrderId: 'EBAY-49210',
      sourceChannel: 'eBay',
      customerName: 'Liam Patterson Plastics Ltd',
      customerPhone: '+44 7933 445566',
      customerEmail: 'liam@pattersonplastics.co.uk',
      address: 'Unit 4, Redfern Industrial Estate, Tyseley',
      city: 'Birmingham',
      postcode: 'B11 2BE',
      lat: 52.4578,
      lng: -1.8415,
      itemsDescription: '10x 5m Black Ash Shiplap Cladding, 4x Starter Trims',
      specialNotes: 'Forklift available on site for offload.',
      dwellTimeMins: 25,
      depotId: bhm.id,
    },
    {
      trackingNumber: 'KAL-BHM-9014',
      externalOrderId: 'BQ-881944',
      sourceChannel: 'B&Q',
      customerName: 'Claire Smith (DIY)',
      customerPhone: '+44 7544 112233',
      address: '88 Solihull Road, Shirley',
      city: 'Solihull',
      postcode: 'B90 3HG',
      lat: 52.4144,
      lng: -1.8211,
      itemsDescription: '3x Deepflow Guttering 4m Black, 2x Running Outlets',
      specialNotes: 'Please ring bell twice.',
      dwellTimeMins: 15,
      depotId: bhm.id,
    },
    {
      trackingNumber: 'KAL-BHM-9015',
      externalOrderId: 'SHOP-94145',
      sourceChannel: 'Shopify',
      customerName: 'Arthur Pendelton',
      customerPhone: '+44 7633 889900',
      address: '102 Walsall Road, Perry Barr',
      city: 'Birmingham',
      postcode: 'B42 1SG',
      lat: 52.5204,
      lng: -1.9056,
      itemsDescription: '6x UPVC Window Sills 3m White',
      specialNotes: 'Fragile profile edges. Handle with care.',
      dwellTimeMins: 15,
      depotId: bhm.id,
    },
    {
      trackingNumber: 'KAL-MAN-4001',
      externalOrderId: 'BQ-882001',
      sourceChannel: 'B&Q',
      customerName: 'David Miller Contracting',
      customerPhone: '+44 7799 123456',
      address: '22 Deansgate, City Centre',
      city: 'Manchester',
      postcode: 'M3 2FW',
      lat: 53.4831,
      lng: -2.2475,
      itemsDescription: '8x 4m Fluted Soffit Boards, 5x Rainwater Pipes',
      specialNotes: 'Delivery bay on left side.',
      dwellTimeMins: 20,
      depotId: man.id,
    }
  ];

  for (const s of sampleShipments) {
    await prisma.shipment.create({ data: s });
  }

  console.log(`Database successfully seeded with 22 Depots, 44 Drivers, and initial Webhook Shipments.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
