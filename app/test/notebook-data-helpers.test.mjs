import { describe, expect, it } from "vitest";

import {
  resolveModelIdFromRunCellKey,
  serializeResult,
  snapshotBaseline
} from "../scripts/notebook-data-helpers.mjs";

describe("serializeResult", () => {
  it("converts typed-array series into plain arrays", () => {
    const result = {
      options: { periods: 2 },
      series: { gdp: Float64Array.from([1, 2]) }
    };

    const serialized = serializeResult(result);

    expect(Array.isArray(serialized.series.gdp)).toBe(true);
    expect(serialized.series.gdp).toEqual([1, 2]);
    expect(serialized.options).toEqual({ periods: 2 });
  });

  it("does not mutate the original result", () => {
    const series = Float64Array.from([3, 4]);
    const result = { series: { x: series } };

    serializeResult(result);

    expect(result.series.x).toBe(series);
  });
});

describe("resolveModelIdFromRunCellKey", () => {
  it("returns null for a missing key", () => {
    expect(resolveModelIdFromRunCellKey(null)).toBeNull();
    expect(resolveModelIdFromRunCellKey(undefined)).toBeNull();
    expect(resolveModelIdFromRunCellKey("")).toBeNull();
  });

  it("strips a model: prefix", () => {
    expect(resolveModelIdFromRunCellKey("model:bmw")).toBe("bmw");
  });

  it("strips a cell: prefix", () => {
    expect(resolveModelIdFromRunCellKey("cell:abc123")).toBe("abc123");
  });

  it("returns the key unchanged when no prefix is present", () => {
    expect(resolveModelIdFromRunCellKey("plain")).toBe("plain");
  });

  it("returns null when only a prefix is present", () => {
    expect(resolveModelIdFromRunCellKey("model:")).toBeNull();
  });
});

describe("snapshotBaseline", () => {
  const baseline = {
    options: { periods: 4, foo: "bar" },
    series: { gdp: [10, 20, 30, 40] }
  };

  it("returns the baseline unchanged when no start period is given", () => {
    expect(snapshotBaseline(baseline, null)).toBe(baseline);
    expect(snapshotBaseline(baseline, undefined)).toBe(baseline);
  });

  it("truncates series and periods to the start period", () => {
    const snapshot = snapshotBaseline(baseline, 2);

    expect(snapshot.series.gdp).toEqual([10, 20]);
    expect(snapshot.options.periods).toBe(2);
    expect(snapshot.options.foo).toBe("bar");
  });

  it("does not mutate the original baseline", () => {
    snapshotBaseline(baseline, 2);

    expect(baseline.series.gdp).toEqual([10, 20, 30, 40]);
    expect(baseline.options.periods).toBe(4);
  });

  it("rejects non-integer or sub-1 start periods", () => {
    expect(() => snapshotBaseline(baseline, 0)).toThrow(/integer >= 1/);
    expect(() => snapshotBaseline(baseline, 1.5)).toThrow(/integer >= 1/);
  });

  it("rejects start periods beyond the baseline length", () => {
    expect(() => snapshotBaseline(baseline, 5)).toThrow(/exceeds baseline length 4/);
  });
});
