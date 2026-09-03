import { OrderItem, SkuDwellSetting } from '../types';

export function calculateOrderDwellAndUnits(
  items: OrderItem[],
  catalog: SkuDwellSetting[]
): { calculatedDwellMins: number; totalVanUnits: number; totalItemCount: number } {
  if (!items || items.length === 0) {
    return { calculatedDwellMins: 15, totalVanUnits: 3, totalItemCount: 1 };
  }

  let totalUnits = 0;
  let totalCount = 0;
  const dwellTimes: number[] = [];

  for (const item of items) {
    const matched = catalog.find((c) => c.sku === item.sku);
    const dwell = matched ? matched.defaultDwellMins : (item.individualDwellMins || 15);
    const units = matched ? matched.vanSpaceUnits : (item.vanSpaceUnits || 2);

    dwellTimes.push(dwell);
    totalUnits += units;
    totalCount += item.quantity;
  }

  // Primary bulky product dwell + 5 min buffer per additional bulky line
  const maxDwell = Math.max(...dwellTimes, 10);
  const extraLines = Math.max(0, items.length - 1);
  const calculatedDwell = maxDwell + extraLines * 5;

  return {
    calculatedDwellMins: calculatedDwell,
    totalVanUnits: totalUnits,
    totalItemCount: totalCount,
  };
}
