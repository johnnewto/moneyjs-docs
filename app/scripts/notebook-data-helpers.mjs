// Pure helpers used by build-notebook-data.mjs. Kept side-effect free so they
// can be unit tested without starting Vite or touching the filesystem.

export function serializeResult(result) {
  const series = {};
  for (const [name, values] of Object.entries(result.series)) {
    series[name] = Array.from(values);
  }
  return { ...result, series };
}

export function resolveModelIdFromRunCellKey(modelKey) {
  if (!modelKey) {
    return null;
  }
  return modelKey.replace(/^model:/, "").replace(/^cell:/, "") || null;
}

export function snapshotBaseline(baseline, baselineStartPeriod) {
  if (baselineStartPeriod == null) {
    return baseline;
  }
  if (!Number.isInteger(baselineStartPeriod) || baselineStartPeriod < 1) {
    throw new Error("baselineStartPeriod must be an integer >= 1.");
  }
  if (baselineStartPeriod > baseline.options.periods) {
    throw new Error(
      `baselineStartPeriod ${baselineStartPeriod} exceeds baseline length ${baseline.options.periods}.`
    );
  }
  const series = {};
  for (const [name, values] of Object.entries(baseline.series)) {
    series[name] = values.slice(0, baselineStartPeriod);
  }
  return {
    ...baseline,
    options: { ...baseline.options, periods: baselineStartPeriod },
    series
  };
}
