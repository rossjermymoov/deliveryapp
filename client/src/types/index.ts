export type ChannelType = 'B&Q' | 'Shopify' | 'eBay' | 'Direct';

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
  specialNotes?: string;
  dwellTimeMins: number;
  status: 'BUCKET_PENDING' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  depotId: string;
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string;
  date: string;
  status: 'DRAFT' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  dwellTimePerStop: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  depotId: string;
  driverId?: string;
  depot?: Depot;
  driver?: Driver;
  shipments: Shipment[];
}
