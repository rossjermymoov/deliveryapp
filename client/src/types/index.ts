export type UserRole = 'HEAD_OFFICE_ADMIN' | 'DEPOT_CONTROLLER' | 'DRIVER';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedDepotId?: string; // If DEPOT_CONTROLLER, strictly locked to this depot ID
  driverId?: string; // If DRIVER, linked to driver ID
}

export interface Depot {
  id: string;
  code: string;
  name: string;
  region: string;
  city: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  activeVansCount: number;
  maxDeliveryRadiusMiles: number; // e.g. 10 miles for London, 30 miles for Newcastle
  maxOrdersPerVan: number; // e.g. 5-6 drops max per van for 5m building products
  maxDailyCapacityOrders: number;
  trafficMultiplierOverride?: number;
  
  // Route threshold feasibility parameters
  minOrdersPerRoute: number;
  maxDistancePerDropMiles: number;
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
  estimatedDeliveryWindow?: string;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
  urgency?: 'STANDARD' | 'PRIORITY' | 'EXPRESS_AM';
  belowRouteCriteria?: boolean;
  criteriaReason?: string;
}

export interface ShiftParameters {
  shiftLengthHours: number;
  mandatoryBreakMins: number;
  trafficBufferMultiplier: number;
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
  routeNumber: string;
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
