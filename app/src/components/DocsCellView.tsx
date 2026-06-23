import type { SimulationResult } from "@sfcr/core";
import type { MatrixGraphRequest } from "@web/notebook/matrixSliceGraph";
import type { NotebookCell } from "@web/notebook/types";
import type { PublicationSection } from "@web/publication/buildPublicationViewModel";
import { PublicationCellView } from "@web/publication/PublicationCellView";
import { PublicationCaption } from "@web/publication/components/PublicationCaption";
import { PublicationMore } from "@web/publication/components/PublicationMore";
import type { PublicationVariableInteraction } from "@web/publication/publicationInspect";

import { InteractiveChart } from "./InteractiveChart";

/**
 * Drop-in replacement for the submodule's PublicationCellView. Chart cells are
 * rendered through the local InteractiveChart (scrubber + add-trace menu); every
 * other cell kind is delegated unchanged to the submodule component.
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
  const { cells, getResult, interaction, section, selectedPeriodIndex } = props;
  const { cell } = section;

  if (section.kind === "chart" && cell.type === "chart") {
    return (
      <figure id={section.anchorId} className="publication-section publication-section-chart">
        <InteractiveChart
          cell={cell}
          cells={cells}
          interaction={interaction}
          result={getResult(cell.sourceRunCellId)}
          selectedPeriodIndex={selectedPeriodIndex}
        />
        <PublicationCaption description={cell.description} note={cell.note} title={cell.title} />
        {cell.more?.trim() ? <PublicationMore interaction={interaction} source={cell.more} /> : null}
      </figure>
    );
  }

  return <PublicationCellView {...props} />;
}
