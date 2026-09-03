export interface OrderItem {
  sku: string;
  category: 'Aquacel Roofline' | 'Duraklad Cladding' | 'Aquaflow Drainage' | 'Underground Soil/Waste' | 'Panelling & MDPE';
  name: string;
  dimensions: string; // e.g., "5m Length x 225mm Width"
  quantity: number;
  individualDwellMins: number;
  vanSpaceUnits: number; // Volume unit score in the delivery van
}

export interface SkuDwellSetting {
  sku: string;
  name: string;
  category: string;
  dimensions: string;
  defaultDwellMins: number;
  vanSpaceUnits: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleReg: string;
  currentLat: number;
  currentLng: number;
  lastUpdated: string;
  status: 'IDLE' | 'ON_ROUTE' | 'DELIVERING' | 'OFF_DUTY';
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

export interface Order {
  id: string;
  trackingNumber: string; // Sequential tracking e.g. KAL-889101
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  items: OrderItem[];
  totalItemCount: number;
  totalVanUnits: number;
  calculatedDwellMins: number;
  manualDwellOverrideMins?: number;
  specialNotes?: string;
  status: 'PENDING_DISPATCH' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string; // e.g. ROUTE-01
  date: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  dwellTimeTotalMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  totalVanUnitsUsed: number;
  maxVanCapacity: number;
  driverId?: string;
  driver?: Driver;
  orders: Order[];
}

export interface GlobalSettings {
  maxVanCapacityUnits: number;
  maxStopsPerVan: number;
  baseStopBufferMins: number;
}
