export type ChannelType = 'B&Q' | 'Shopify' | 'eBay' | 'Direct';

export interface SkuDwellRule {
  skuCode: string;
  name: string;
  dwellMins: number;
  vanUnits: number; // Space unit consumption (e.g. 1 unit = 1 standard parcel, 4 units = 5m Fascia)
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  individualDwellMins: number;
  unitSize: number;
}

export interface Depot {
  id: string;
  code: string;
  name: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  drivers?: Driver[];
}

export interface Driver {
  id: string;
  username: string;
  name: string;
  phone: string;
  vehicleReg: string;
  depotId: string;
}

export interface ProofOfDelivery {
  id: string;
  shipmentId: string;
  recipientName: string;
  signatureData: string;
  photoUrl?: string | null;
  notes?: string | null;
  deliveredLat?: number | null;
  deliveredLng?: number | null;
  timestamp: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  externalOrderId: string;
  sourceChannel: ChannelType;
  labelApiRef?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  itemsDescription: string;
  itemsList?: OrderItem[];
  specialNotes?: string;
  calculatedDwellMins: number; // Dynamic calculated from SKUs
  manualDwellOverrideMins?: number; // Dispatcher override
  vanCapacityUnits: number; // Calculated volume consumption
  status: 'BUCKET_PENDING' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  depotId: string;
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
}

export interface DepotSettings {
  maxVanCapacityUnits: number; // e.g., 20 capacity units per van run
  maxStopsPerRun: number;       // e.g., 8 stops max
  dwellCalculationMode: 'SUM' | 'MAX_PLUS_BUFFER' | 'AVERAGE'; // Formula logic
  baseBufferMins: number;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string;
  name?: string; // e.g. "Route Wave #1 - North Birmingham"
  date: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  dwellTimeTotalMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  totalVanCapacityUsed: number;
  maxVanCapacity: number;
  depotId: string;
  driverId?: string;
  depot?: Depot;
  driver?: Driver;
  shipments: Shipment[];
}
