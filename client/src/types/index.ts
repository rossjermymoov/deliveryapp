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
  totalDwellMins: number;
  manualDwellOverrideMins?: number;
  specialNotes?: string;
  status: 'PENDING' | 'ROUTED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
}

export interface ShiftParameters {
  shiftLengthHours: number; // e.g. 8.0 hours max working shift
  mandatoryBreakMins: number; // e.g. 45 mins statutory driver break
  trafficBufferMultiplier: number; // e.g. 1.25x for peak UK urban traffic
}

export interface RouteShiftAnalysis {
  drivingTimeMins: number;
  dwellTimeMins: number;
  breakTimeMins: number;
  totalShiftMins: number;
  maxShiftMins: number;
  fitsInShift: boolean;
  utilizationPct: number;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string; // e.g. "Route 1"
  date: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  totalDwellMins: number;
  totalDrivingMins: number;
  breakTimeMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  shiftUtilizationPct: number;
  driverId?: string;
  driver?: Driver;
  orders: Order[];
}
