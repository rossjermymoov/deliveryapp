import { OrderItem, SkuDwellRule, DepotSettings } from '../types';

/**
 * Calculates dwell time & van volume capacity units for an order based on customer SKU rules & mode.
 */
export function calculateOrderMetrics(
  items: OrderItem[],
  skuRules: SkuDwellRule[],
  settings: DepotSettings
): { calculatedDwellMins: number; vanCapacityUnits: number } {
  if (!items || items.length === 0) {
    return { calculatedDwellMins: 15, vanCapacityUnits: 2 };
  }

  let totalCapacity = 0;
  const dwellTimes: number[] = [];

  for (const item of items) {
    const matchedRule = skuRules.find((r) => r.skuCode === item.sku);
    const itemDwell = matchedRule ? matchedRule.dwellMins : (item.individualDwellMins || 10);
    const itemCapacity = matchedRule ? matchedRule.vanUnits : (item.unitSize || 1);

    dwellTimes.push(itemDwell);
    totalCapacity += itemCapacity;
  }

  let finalDwell = 15;

  if (settings.dwellCalculationMode === 'SUM') {
    // Total sum of all dwell times
    finalDwell = dwellTimes.reduce((a, b) => a + b, 0);
  } else if (settings.dwellCalculationMode === 'MAX_PLUS_BUFFER') {
    // Highest dwell SKU + buffer per additional bulky line
    const maxDwell = Math.max(...dwellTimes, 10);
    const extraLines = Math.max(0, dwellTimes.length - 1);
    finalDwell = maxDwell + extraLines * settings.baseBufferMins;
  } else if (settings.dwellCalculationMode === 'AVERAGE') {
    const sum = dwellTimes.reduce((a, b) => a + b, 0);
    finalDwell = Math.round(sum / dwellTimes.length);
  }

  return {
    calculatedDwellMins: Math.max(5, finalDwell),
    vanCapacityUnits: Math.max(1, totalCapacity),
  };
}
