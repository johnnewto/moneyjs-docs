import { useEffect, useMemo, useState } from "react";

import type { SimulationResult } from "@sfcr/core";
import {
  buildPublicationContentsEntries,
  buildPublicationViewModel
} from "@web/publication/buildPublicationViewModel";
import { PublicationCellView } from "@web/publication/PublicationCellView";
import { mergePublicationVariableInteraction } from "@web/publication/publicationInspect";
import { buildPublicationVariableDescriptions } from "@web/publication/publicationVariables";
import { buildNotebookVariableUnitMetadata } from "@web/notebook/notebookAppHelpers";
import type { NotebookTemplateId } from "@web/notebook/templates";
import "@web/styles/partials/tokens.css";
import "@web/styles/partials/shared-components.css";
import "@web/styles/partials/results-charts.css";
import "@web/styles/partials/misc.css";
import "@web/styles/partials/publication.css";

import { NotebookContents } from "../components/NotebookContents";
import { loadNotebook, type LoadedNotebook } from "../staticRunner";

function resolveMaxPeriodIndex(getResult: (cellId: string) => SimulationResult | null, runCellIds: string[]): number {
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

export function NotebookPage({ id }: { id: string }) {
  const [notebook, setNotebook] = useState<LoadedNotebook | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    void loadNotebook(id).then((loaded) => {
      if (cancelled) {
        return;
      }
      if (!loaded) {
        setStatus("missing");
        return;
      }
      setNotebook(loaded);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const viewModel = useMemo(
    () =>
      notebook
        ? buildPublicationViewModel({
            document: notebook.document,
            templateId: notebook.meta.id as NotebookTemplateId,
            mode: "publish"
          })
        : null,
    [notebook]
  );

  const contentsEntries = useMemo(
    () => (viewModel ? buildPublicationContentsEntries(viewModel.bodySections) : []),
    [viewModel]
  );

  const variableDescriptions = useMemo(
    () => (notebook ? buildPublicationVariableDescriptions(notebook.document.cells) : null),
    [notebook]
  );

  const variableUnitMetadata = useMemo(
    () => (notebook ? buildNotebookVariableUnitMetadata(notebook.document.cells) : null),
    [notebook]
  );

  const selectedPeriodIndex = useMemo(() => {
    if (!notebook) {
      return 0;
    }
    const runCellIds = notebook.document.cells
      .filter((cell) => cell.type === "run")
      .map((cell) => cell.id);
    return resolveMaxPeriodIndex(notebook.getResult, runCellIds);
  }, [notebook]);

  if (status === "loading") {
    return (
      <div className="docs-shell">
        <p className="docs-status">Loading notebook…</p>
      </div>
    );
  }

  if (status === "missing" || !notebook || !viewModel || !variableDescriptions || !variableUnitMetadata) {
    return (
      <div className="docs-shell">
        <p className="docs-status">
          No notebook found for <code>{id}</code>. <a href="#/">Back to gallery</a>
        </p>
      </div>
    );
  }

  const interaction = mergePublicationVariableInteraction({
    descriptions: variableDescriptions,
    unitMetadata: variableUnitMetadata,
    inspectContext: null,
    highlightedVariable: null
  });

  const showContents = contentsEntries.length > 1;

  return (
    <div className="publication-root publication-mode-publish docs-notebook">
      <nav className="docs-breadcrumb publication-no-print">
        <a href="#/">← All notebooks</a>
      </nav>
      <header className="publication-header">
        <p className="publication-eyebrow">MoneyJS publication</p>
        <h1 className="publication-title">{viewModel.title}</h1>
      </header>

      <div className="publication-page-shell">
        <div
          className={`publication-layout${
            showContents ? " publication-layout-with-contents" : ""
          }`}
        >
          <main className="publication-main">
            {viewModel.bodySections.map((section) => (
              <PublicationCellView
                key={section.anchorId}
                cells={notebook.document.cells}
                getResult={notebook.getResult}
                interaction={interaction}
                section={section}
                selectedPeriodIndex={selectedPeriodIndex}
              />
            ))}

            {viewModel.appendixSections.length > 0 ? (
              <section className="publication-appendix publication-page-break-before">
                <h2 className="publication-appendix-title">Appendix</h2>
                {viewModel.appendixSections.map((section) => (
                  <PublicationCellView
                    key={section.anchorId}
                    cells={notebook.document.cells}
                    getResult={notebook.getResult}
                    interaction={interaction}
                    section={section}
                    selectedPeriodIndex={selectedPeriodIndex}
                  />
                ))}
              </section>
            ) : null}
          </main>

          {showContents ? <NotebookContents entries={contentsEntries} /> : null}
        </div>
      </div>
    </div>
  );
}
