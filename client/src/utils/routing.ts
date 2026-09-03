import { Order } from '../types';

export const DEPOT_LOCATION = {
  name: 'Kalsi Works (Birmingham Central)',
  address: 'Nechells Parkway, Birmingham B7 5EX',
  lat: 52.4938,
  lng: -1.8687,
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

export function estimateDriveTimeMinutes(distanceKm: number): number {
  const avgSpeedKmh = 38;
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

/**
 * Optimizes route sequence using TSP Nearest Neighbor.
 */
export function optimizeRouteStops(orders: Order[]) {
  if (orders.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, totalDurationMins: 0, totalDrivingMins: 0, totalDwellMins: 0 };
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

    totalDistanceKm += shortestDist;
    totalDrivingMins += estimateDriveTimeMinutes(shortestDist);
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
  totalDistanceKm += returnDist;
  totalDrivingMins += estimateDriveTimeMinutes(returnDist);

  return {
    orderedStops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMins: Math.round(totalDrivingMins + totalDwellMins),
    totalDrivingMins,
    totalDwellMins,
  };
}
