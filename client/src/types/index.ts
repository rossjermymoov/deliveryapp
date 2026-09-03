export type OrderStatus = 'PENDING' | 'ROUTED' | 'LOADED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';

export type UserRole = 'HEAD_OFFICE_ADMIN' | 'DEPOT_CONTROLLER' | 'DRIVER';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedDepotId?: string;
  driverId?: string;
}

export type VanFaultSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_GROUND_VEHICLE';

export type VanStatus = 'AVAILABLE' | 'ON_ROUTE' | 'FAULT_REPORTED' | 'MAINTENANCE' | 'GROUNDED';

export interface VehicleFaultReport {
  id: string;
  vanId: string;
  vanRegistration: string;
  reportedByDriverId: string;
  reportedByDriverName: string;
  depotId: string;
  timestamp: string;
  category: 'BRAKES' | 'TYRES' | 'ENGINE_LIGHT' | 'LIGHTS_ELECTRICS' | 'BODYWORK_DAMAGE' | 'CARGO_DOORS' | 'STEERING_SUSPENSION' | 'OTHER';
  severity: VanFaultSeverity;
  description: string;
  photoUrl?: string | null;
  status: 'OPEN' | 'INVESTIGATING' | 'REPAIRED' | 'GROUNDED';
}

export interface VanVehicle {
  id: string;
  registration: string;
  depotId: string;
  model: string;
  status: VanStatus;
  barcode: string;
  maxPayloadKg?: number;
  // Fleet Compliance Dates
  motExpiryDate?: string; // YYYY-MM-DD
  nextServiceDueDate?: string; // YYYY-MM-DD
  lastServiceDate?: string; // YYYY-MM-DD
  mileage?: number;
  activeFaultsCount?: number;
}

export interface OrderItem {
  sku: string;
  name?: string;
  description?: string;
  quantity: number;
  weightKg?: number;
  lengthMetres?: number;
  dwellMins?: number;
  dwellMinsPerUnit?: number;
  scanStatus?: 'PENDING' | 'LOADED_TO_VAN' | 'OFFLOADED' | 'EXCEPTION';
}

export interface ProofOfDelivery {
  id: string;
  orderId: string;
  recipientName: string;
  signatureData?: string;
  photoUrl?: string | null;
  notes?: string | null;
  deliveredLat?: number | null;
  deliveredLng?: number | null;
  timestamp: string;
  hasItemExceptions?: boolean;
  itemExceptionNotes?: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  depotId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  items: OrderItem[];
  totalDwellMins: number;
  manualDwellOverrideMins?: number;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  specialNotes?: string;
  status: OrderStatus;
  routeId?: string;
  stopSequence?: number;
  proofOfDelivery?: ProofOfDelivery;
  createdAt: string;
  belowRouteCriteria?: boolean;
  criteriaReason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  depotId: string;
  assignedVanId?: string;
  assignedVanReg?: string;
  vehicleReg?: string;
  currentLat: number;
  currentLng: number;
  lastUpdated: string;
  status: 'IDLE' | 'ON_ROUTE' | 'DELIVERING' | 'OFF_DUTY';
}

export interface DeliveryRoute {
  id: string;
  routeNumber: string;
  depotId: string;
  date: string;
  driverId?: string;
  driver?: Driver;
  vanId?: string;
  vanRegistration?: string;
  orders: Order[];
  status: 'DRAFT' | 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  totalDwellMins: number;
  totalDrivingMins: number;
  breakTimeMins: number;
  totalEstimatedMins: number;
  totalDistanceKm: number;
  shiftUtilisationPct: number;
  isProblemRoute?: boolean;
  problemReason?: string;
  allLoaded?: boolean;
}

export interface Depot {
  id: string;
  code: string;
  name: string;
  region: string;
  address: string;
  city: string;
  postcode: string;
  lat: number;
  lng: number;
  contactPhone?: string;
  maxDeliveryRadiusMiles: number;
  activeVansCount: number;
  maxOrdersPerVan?: number;
  minOrdersPerRoute?: number;
  maxDistancePerDropMiles?: number;
  maxDailyCapacityOrders: number;
}

export interface SkuDwellSetting {
  sku: string;
  name: string;
  defaultDwellMins: number;
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
  isProblemShift: boolean;
  problemReason?: string;
}

export interface BrandTheme {
  companyName: string;
  logoText: string;
  tagline: string;
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  supportPhone?: string;
}
