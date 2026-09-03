export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  dwellMinsPerUnit: number;
}

export interface SkuDwellSetting {
  sku: string;
  name: string;
  defaultDwellMins: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleReg: string;
  currentLat: number;
  currentLng: number;
  lastUpdated: string;
  status: 'IDLE' | 'ON_ROUTE' | 'DELIVERING';
}

export interface ProofOfDelivery {
  id: string;
  orderId: string;
  recipientName: string;
  signatureData: string;
  photoUrl?: string | null;
  notes?: string | null;
  deliveredLat?: number | null;
  deliveredLng?: number | null;
  timestamp: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  items: OrderItem[];
  totalDwellMins: number; // Sum of per-product dwell times
  manualDwellOverrideMins?: number;
  specialNotes?: string;
  status: 'PENDING' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string; // e.g. "Route 1"
  date: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  totalDwellMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  driverId?: string;
  driver?: Driver;
  orders: Order[];
}
