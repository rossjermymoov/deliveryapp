import { Order, ShiftParameters, RouteShiftAnalysis, Depot } from '../types';

export const DEPOT_LOCATION = {
  name: 'Kalsi Works (Birmingham Central)',
  address: 'Nechells Parkway, Birmingham B7 5EX',
  lat: 52.4938,
  lng: -1.8687,
};

export const DEFAULT_SHIFT_PARAMS: ShiftParameters = {
  shiftLengthHours: 8.0, // 8 Hour driver shift (480 mins)
  mandatoryBreakMins: 45, // 45 min statutory driver rest
  trafficBufferMultiplier: 1.25, // 25% traffic buffer
};

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function estimateDriveTimeMinutes(distanceKm: number, trafficMultiplier: number = 1.25): number {
  const baseAvgSpeedKmh = 38; // Average UK mixed urban/arterial driving speed
  const baseMinutes = (distanceKm / baseAvgSpeedKmh) * 60;
  return Math.round(baseMinutes * trafficMultiplier);
}

/**
 * Evaluates whether a set of orders fits into a driver's legal working shift
 * factoring in Traffic Driving Time + Total Dwells + Statutory Driver Breaks.
 */
export function analyzeRouteShift(
  drivingMins: number,
  dwellMins: number,
  params: ShiftParameters = DEFAULT_SHIFT_PARAMS
): RouteShiftAnalysis {
  const maxShiftMins = params.shiftLengthHours * 60;
  
  // UK driver break rule: If working over 4.5 hrs, require 45m break
  const rawWorkMins = drivingMins + dwellMins;
  const breakMins = rawWorkMins > 240 ? params.mandatoryBreakMins : 0;
  const totalShiftMins = rawWorkMins + breakMins;
  
  const fitsInShift = totalShiftMins <= maxShiftMins;
  const utilisationPct = Math.min(100, Math.round((totalShiftMins / maxShiftMins) * 100));
  const isProblemShift = !fitsInShift;

  return {
    drivingTimeMins: drivingMins,
    dwellTimeMins: dwellMins,
    breakTimeMins: breakMins,
    totalShiftMins,
    maxShiftMins,
    fitsInShift,
    utilisationPct,
    isProblemShift,
    problemReason: isProblemShift ? `Exceeds ${params.shiftLengthHours}h legal shift length.` : undefined,
  };
}

/**
 * Heuristic nearest-neighbour sequencer starting from the Depot
 */
export function sequenceOrders(
  orders: Order[],
  depotLat: number = DEPOT_LOCATION.lat,
  depotLng: number = DEPOT_LOCATION.lng
): Order[] {
  if (orders.length <= 1) {
    return orders.map((o, idx) => ({ ...o, stopSequence: idx + 1 }));
  }

  const unvisited = [...orders];
  const sequenced: Order[] = [];
  let currentLat = depotLat;
  let currentLng = depotLng;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(currentLat, currentLng, unvisited[i].lat, unvisited[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const [nearestOrder] = unvisited.splice(nearestIdx, 1);
    sequenced.push({
      ...nearestOrder,
      stopSequence: sequenced.length + 1,
    });
    currentLat = nearestOrder.lat;
    currentLng = nearestOrder.lng;
  }

  return sequenced;
}

export function optimizeRouteStops(
  orders: Order[],
  params: ShiftParameters = DEFAULT_SHIFT_PARAMS,
  depot?: Depot
): {
  orderedOrders: Order[];
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  totalDwellMinutes: number;
  shiftAnalysis: RouteShiftAnalysis;
} {
  const dLat = depot?.lat || DEPOT_LOCATION.lat;
  const dLng = depot?.lng || DEPOT_LOCATION.lng;

  const ordered = sequenceOrders(orders, dLat, dLng);

  let totalDist = 0;
  let prevLat = dLat;
  let prevLng = dLng;

  for (const o of ordered) {
    totalDist += calculateDistanceKm(prevLat, prevLng, o.lat, o.lng);
    prevLat = o.lat;
    prevLng = o.lng;
  }
  // Return leg back to depot
  totalDist += calculateDistanceKm(prevLat, prevLng, dLat, dLng);
  totalDist = Math.round(totalDist * 10) / 10;

  const driveMins = estimateDriveTimeMinutes(totalDist, params.trafficBufferMultiplier);
  const dwellMins = ordered.reduce((sum, o) => sum + (o.manualDwellOverrideMins ?? o.totalDwellMins), 0);
  const analysis = analyzeRouteShift(driveMins, dwellMins, params);

  return {
    orderedOrders: ordered,
    totalDistanceKm: totalDist,
    totalDrivingMinutes: driveMins,
    totalDwellMinutes: dwellMins,
    shiftAnalysis: analysis,
  };
}
