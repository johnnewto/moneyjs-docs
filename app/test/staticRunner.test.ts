import { describe, expect, it } from "vitest";

import { rehydrateResult } from "../src/staticRunner";

describe("rehydrateResult", () => {
  it("converts plain-array series back into Float64Array", () => {
    const result = rehydrateResult({
      options: { periods: 3 },
      series: { gdp: [1, 2, 3] }
    } as never);

    expect(result.series.gdp).toBeInstanceOf(Float64Array);
    expect(Array.from(result.series.gdp)).toEqual([1, 2, 3]);
  });

  it("preserves non-series fields", () => {
    const result = rehydrateResult({
      options: { periods: 1 },
      series: {}
    } as never);

    expect(result.options).toEqual({ periods: 1 });
  });

  it("rehydrates every series entry", () => {
    const result = rehydrateResult({
      options: { periods: 2 },
      series: { a: [1, 2], b: [3, 4] }
    } as never);

    expect(Array.from(result.series.a)).toEqual([1, 2]);
    expect(Array.from(result.series.b)).toEqual([3, 4]);
  });
});
