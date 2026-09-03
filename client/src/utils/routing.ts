import { Order, ShiftParameters, RouteShiftAnalysis } from '../types';

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

  return {
    drivingTimeMins: drivingMins,
    dwellTimeMins: dwellMins,
    breakTimeMins: breakMins,
    totalShiftMins,
    maxShiftMins,
    fitsInShift,
    utilisationPct,
  };
}

/**
 * Optimises route sequence using TSP Nearest Neighbour with Shift Feasibility & Traffic Analysis.
 */
export function optimizeRouteStops(
  orders: Order[],
  params: ShiftParameters = DEFAULT_SHIFT_PARAMS
) {
  if (orders.length === 0) {
    return {
      orderedStops: [],
      totalDistanceKm: 0,
      totalDurationMins: 0,
      totalDrivingMins: 0,
      totalDwellMins: 0,
      breakTimeMins: 0,
      shiftAnalysis: analyzeRouteShift(0, 0, params),
    };
  }

  const unvisited = [...orders];
  const orderedStops: Order[] = [];
  let currentLocation = { lat: DEPOT_LOCATION.lat, lng: DEPOT_LOCATION.lng };
  let totalDistanceKm = 0;
  let totalDrivingMins = 0;
  let totalDwellMins = 0;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let shortestDist = calculateDistanceKm(
      currentLocation.lat,
      currentLocation.lng,
      unvisited[0].lat,
      unvisited[0].lng
    );

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIdx = i;
      }
    }

    const nextStop = unvisited.splice(nearestIdx, 1)[0];
    const dwell = nextStop.manualDwellOverrideMins !== undefined
      ? nextStop.manualDwellOverrideMins
      : (nextStop.totalDwellMins || 15);

    const legDriveMins = estimateDriveTimeMinutes(shortestDist, params.trafficBufferMultiplier);

    totalDistanceKm += shortestDist;
    totalDrivingMins += legDriveMins;
    totalDwellMins += dwell;

    orderedStops.push({
      ...nextStop,
      stopSequence: orderedStops.length + 1,
    });
    currentLocation = { lat: nextStop.lat, lng: nextStop.lng };
  }

  // Return to base
  const returnDist = calculateDistanceKm(
    currentLocation.lat,
    currentLocation.lng,
    DEPOT_LOCATION.lat,
    DEPOT_LOCATION.lng
  );
  const returnDriveMins = estimateDriveTimeMinutes(returnDist, params.trafficBufferMultiplier);
  totalDistanceKm += returnDist;
  totalDrivingMins += returnDriveMins;

  const shiftAnalysis = analyzeRouteShift(totalDrivingMins, totalDwellMins, params);

  return {
    orderedStops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMins: shiftAnalysis.totalShiftMins,
    totalDrivingMins,
    totalDwellMins,
    breakTimeMins: shiftAnalysis.breakTimeMins,
    shiftAnalysis,
  };
}
