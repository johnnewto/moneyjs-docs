import { describe, expect, it } from "vitest";

import { resolveMaxPeriodIndex } from "../src/notebookView";

type FakeResult = {
  options: { periods?: number };
  series: Record<string, { length: number }>;
};

function makeResults(map: Record<string, FakeResult>) {
  return (cellId: string) => (map[cellId] ?? null) as never;
}

describe("resolveMaxPeriodIndex", () => {
  it("returns 0 when there are no run cells", () => {
    expect(resolveMaxPeriodIndex(makeResults({}), [])).toBe(0);
  });

  it("returns 0 when no result is available", () => {
    expect(resolveMaxPeriodIndex(makeResults({}), ["missing"])).toBe(0);
  });

  it("uses options.periods minus one as the max index", () => {
    const getResult = makeResults({
      a: { options: { periods: 5 }, series: { gdp: { length: 5 } } }
    });

    expect(resolveMaxPeriodIndex(getResult, ["a"])).toBe(4);
  });

  it("falls back to the longest series length when periods is missing", () => {
    const getResult = makeResults({
      a: { options: {}, series: { gdp: { length: 3 }, debt: { length: 7 } } }
    });

    expect(resolveMaxPeriodIndex(getResult, ["a"])).toBe(6);
  });

  it("takes the maximum across multiple run cells", () => {
    const getResult = makeResults({
      a: { options: { periods: 3 }, series: {} },
      b: { options: { periods: 9 }, series: {} }
    });

    expect(resolveMaxPeriodIndex(getResult, ["a", "b"])).toBe(8);
  });

  it("never returns a negative index", () => {
    const getResult = makeResults({
      a: { options: { periods: 0 }, series: {} }
    });

    expect(resolveMaxPeriodIndex(getResult, ["a"])).toBe(0);
  });
});
