import { Depot, Shipment, DepotSettings } from '../types';

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
 * Splits unassigned bucket shipments into multiple van route batches/waves based on:
 * - Max van capacity units (e.g. 16 units)
 * - Max stops per route (e.g. 6-8 stops)
 */
export function autoBatchRoutesByVanCapacity(
  _depot: Depot,
  shipments: Shipment[],
  settings: DepotSettings
): { batches: Shipment[][] } {
  if (shipments.length === 0) return { batches: [] };

  const remaining = [...shipments];
  const batches: Shipment[][] = [];

  while (remaining.length > 0) {
    const currentBatch: Shipment[] = [];
    let currentCapacity = 0;

    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      const sCapacity = s.vanCapacityUnits || 2;

      // Check constraints
      const wouldExceedCapacity = currentCapacity + sCapacity > settings.maxVanCapacityUnits && currentBatch.length > 0;
      const wouldExceedStops = currentBatch.length >= settings.maxStopsPerRun;

      if (!wouldExceedCapacity && !wouldExceedStops) {
        currentBatch.push(s);
        currentCapacity += sCapacity;
        remaining.splice(i, 1);
        i--;
      }
    }

    if (currentBatch.length === 0 && remaining.length > 0) {
      // Force at least 1 heavy order if a single order exceeds max capacity
      currentBatch.push(remaining.shift()!);
    }

    batches.push(currentBatch);
  }

  return { batches };
}

/**
 * Optimizes a single route wave using TSP Nearest Neighbor.
 */
export function optimizeRouteStops(
  depot: Depot,
  shipments: Shipment[]
) {
  if (shipments.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, totalDurationMins: 0, totalDrivingMins: 0, totalDwellMins: 0, totalCapacityUnits: 0 };
  }

  const unvisited = [...shipments];
  const orderedStops: Shipment[] = [];
  let currentLocation = { lat: depot.lat, lng: depot.lng };
  let totalDistanceKm = 0;
  let totalDrivingMins = 0;
  let totalDwellMins = 0;
  let totalCapacityUnits = 0;

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
      : (nextStop.calculatedDwellMins || 15);

    totalDistanceKm += shortestDist;
    totalDrivingMins += estimateDriveTimeMinutes(shortestDist);
    totalDwellMins += dwell;
    totalCapacityUnits += (nextStop.vanCapacityUnits || 2);

    orderedStops.push({
      ...nextStop,
      stopSequence: orderedStops.length + 1
    });
    currentLocation = { lat: nextStop.lat, lng: nextStop.lng };
  }

  // Return to depot
  const returnDist = calculateDistanceKm(
    currentLocation.lat,
    currentLocation.lng,
    depot.lat,
    depot.lng
  );
  totalDistanceKm += returnDist;
  totalDrivingMins += estimateDriveTimeMinutes(returnDist);

  return {
    orderedStops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMins: Math.round(totalDrivingMins + totalDwellMins),
    totalDrivingMins,
    totalDwellMins,
    totalCapacityUnits,
  };
}
