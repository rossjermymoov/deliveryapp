export interface Depot {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  activeVansCount: number;
}

export interface BrandTheme {
  companyName: string;
  tagline: string;
  logoText: string;
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  headerBgColour: string;
  fontFamily?: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  dwellMinsPerUnit: number;
  loadedOnVan?: boolean;
  damagedQuantity?: number;
  damageReason?: string;
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
  depotId: string;
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
  hasItemExceptions?: boolean;
  itemExceptionNotes?: string;
}

export type OrderStatus = 'PENDING' | 'ROUTED' | 'LOADED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED_EXCEPTION';

export interface CustomerNotificationLog {
  id: string;
  timestamp: string;
  type: 'ORDER_CONFIRMED' | 'ROUTE_SCHEDULED' | 'OUT_FOR_DELIVERY' | 'NEXT_STOP' | 'DELIVERED';
  channel: 'SMS' | 'EMAIL';
  recipient: string;
  messageText: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  depotId: string;
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
  status: OrderStatus;
  routeId?: string;
  stopSequence?: number;
  estimatedDeliveryWindow?: string; // e.g. "09:30 - 10:30 AM"
  proofOfDelivery?: ProofOfDelivery;
  notifications?: CustomerNotificationLog[];
  createdAt: string;
  urgency?: 'STANDARD' | 'PRIORITY' | 'EXPRESS_AM';
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
  utilisationPct: number;
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string; // e.g. "Route 1 (North Birmingham)"
  depotId: string;
  date: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'LOADING' | 'IN_PROGRESS' | 'COMPLETED';
  totalDwellMins: number;
  totalDrivingMins: number;
  breakTimeMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  shiftUtilisationPct: number;
  allLoaded?: boolean;
  isProblemRoute?: boolean;
  problemReason?: string;
  driverId?: string;
  driver?: Driver;
  orders: Order[];
}
