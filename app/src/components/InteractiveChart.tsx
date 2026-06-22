import { useMemo, useState } from "react";

import type { SimulationResult } from "@sfcr/core";
import { ResultChart } from "@web/components/ResultChart";
import {
  appendChartVariable,
  buildResolvedChartSeriesRanges,
  buildResolvedChartSeriesWithUnits,
  moveChartSeriesByDisplayName,
  removeChartSeriesByDisplayName
} from "@web/notebook/chartSeries";
import { buildNotebookVariableUnitMetadata } from "@web/notebook/notebookAppHelpers";
import type { ChartCell, NotebookCell } from "@web/notebook/types";
import type { PublicationVariableInteraction } from "@web/publication/publicationInspect";
import { buildPublicationVariableDescriptions } from "@web/publication/publicationVariables";

/**
 * Docs-site chart wrapper that mirrors the submodule's PublicationChart but
 * re-enables the two interactive affordances the publication path turns off:
 * the time-range scrubber (`timeRangeSlider`) and the legend "+" add-trace
 * menu (`onAddVariable`/`addVariableOptions`). Trace edits are kept in local
 * state only — the precomputed run data is never mutated.
 */
export function InteractiveChart({
  cell,
  cells,
  interaction,
  result,
  selectedPeriodIndex
}: {
  cell: ChartCell;
  cells: NotebookCell[];
  interaction: PublicationVariableInteraction;
  result: SimulationResult | null;
  selectedPeriodIndex: number;
}) {
  const [chartCell, setChartCell] = useState<ChartCell>(cell);

  const variableUnitMetadata = useMemo(() => buildNotebookVariableUnitMetadata(cells), [cells]);
  const variableDescriptions = useMemo(() => buildPublicationVariableDescriptions(cells), [cells]);

  if (!result) {
    return <p className="publication-status-hint">Chart data is not available.</p>;
  }

  const series = buildResolvedChartSeriesWithUnits(chartCell, result, variableUnitMetadata);
  if (series.length === 0) {
    return <p className="publication-status-hint">Chart data is not available.</p>;
  }

  const seriesRanges = buildResolvedChartSeriesRanges(chartCell, series);
  const seriesLength = Math.max(...series.map((entry) => entry.values.length), 1);

  const addVariableOptions = Object.entries(result.series)
    .filter(([, values]) => values.length > 1 && Array.from(values).some(Number.isFinite))
    .map(([name]) => name)
    .sort((left, right) => left.localeCompare(right));

  return (
    <div className="publication-chart">
      <ResultChart
        addVariableOptions={addVariableOptions}
        axisMode={chartCell.axisMode ?? "shared"}
        axisSnapTolarance={chartCell.axisSnapTolarance}
        niceScale={chartCell.niceScale}
        highlightedVariable={interaction.highlightedVariable}
        onAddVariable={(variableName) =>
          setChartCell((current) => appendChartVariable(current, variableName))
        }
        onInspectScenarioShockVariable={interaction.onSelectVariable}
        onMoveVariable={(variableName, direction) =>
          setChartCell((current) => moveChartSeriesByDisplayName(current, variableName, direction))
        }
        onRemoveVariable={(variableName) =>
          setChartCell((current) => removeChartSeriesByDisplayName(current, variableName))
        }
        periodLabelOffset={0}
        selectedIndex={Math.min(selectedPeriodIndex, seriesLength - 1)}
        series={series}
        seriesRanges={seriesRanges}
        sharedRange={chartCell.sharedRange}
        showAxisSummary={false}
        timeRangeDefaults={{ endPeriodInclusive: seriesLength, startPeriodInclusive: 1 }}
        timeRangeInclusive={chartCell.timeRangeInclusive}
        timeRangeSlider="auto"
        variableDescriptions={variableDescriptions}
        variableUnitMetadata={variableUnitMetadata}
        xAxisTitle={chartCell.xAxis?.title}
        yAxis={chartCell.yAxis}
        yAxisTickCount={chartCell.yAxisTickCount}
      />
    </div>
  );
}
