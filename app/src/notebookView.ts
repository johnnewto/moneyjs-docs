import type { SimulationResult } from "@sfcr/core";

export function resolveMaxPeriodIndex(
  getResult: (cellId: string) => SimulationResult | null,
  runCellIds: string[]
): number {
  let max = 0;
  for (const cellId of runCellIds) {
    const result = getResult(cellId);
    if (!result) {
      continue;
    }
    const lengths = Object.values(result.series).map((values) => values.length);
    const periods = result.options.periods ?? (lengths.length > 0 ? Math.max(...lengths) : 0);
    max = Math.max(max, Math.max(periods - 1, 0));
  }
  return max;
}
