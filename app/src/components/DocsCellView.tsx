import type { SimulationResult } from "@sfcr/core";
import type { MatrixGraphRequest } from "@web/notebook/matrixSliceGraph";
import type { NotebookCell } from "@web/notebook/types";
import type { PublicationSection } from "@web/publication/buildPublicationViewModel";
import { PublicationCellView } from "@web/publication/PublicationCellView";
import type { PublicationVariableInteraction } from "@web/publication/publicationInspect";

/**
 * Thin wrapper over the submodule's PublicationCellView that opts chart cells
 * into the interactive affordances (time-range scrubber + add/reorder/remove
 * traces) via `interactiveCharts`. Trace edits are kept inside PublicationChart's
 * local state only — the precomputed run data is never mutated.
 */
export function DocsCellView(props: {
  cells: NotebookCell[];
  getResult(runCellId: string): SimulationResult | null;
  interaction: PublicationVariableInteraction;
  onRequestMatrixGraph?(request: MatrixGraphRequest): void;
  section: PublicationSection;
  selectedPeriodIndex: number;
  showHeading?: boolean;
}) {
  return <PublicationCellView {...props} interactiveCharts />;
}
