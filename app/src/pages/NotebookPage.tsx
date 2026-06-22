import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildPublicationContentsEntries,
  buildPublicationViewModel
} from "@web/publication/buildPublicationViewModel";
import { PublicationAppendixSection } from "@web/publication/components/PublicationAppendix";
import {
  buildPublicationInspectRequest,
  mergePublicationVariableInteraction,
  resolvePublicationInspectContext,
  type PublicationVariableInteraction
} from "@web/publication/publicationInspect";
import { PublicationVariableInspectorPopup } from "@web/publication/PublicationVariableInspectorPopup";
import { PublicationMatrixGraphPopup } from "@web/publication/PublicationMatrixGraphPopup";
import { buildPublicationVariableDescriptions } from "@web/publication/publicationVariables";
import { buildNotebookVariableUnitMetadata } from "@web/notebook/notebookAppHelpers";
import {
  addMatrixGraphChartSeries,
  applyMatrixGraphRequest,
  removeMatrixGraphChart,
  removeMatrixGraphChartSeries,
  toggleMatrixGraphChartLegendMode,
  toggleMatrixGraphChartPin,
  type MatrixGraphChartEntry
} from "@web/notebook/matrixGraphRailState";
import {
  collectMatrixGraphSliceSeries,
  type MatrixGraphRequest
} from "@web/notebook/matrixSliceGraph";
import type { MatrixCell, NotebookCell } from "@web/notebook/types";
import type { NotebookTemplateId } from "@web/notebook/templates";
import { useInspectorVariableHistory } from "@web/hooks/useInspectorVariableHistory";
import { isSameInspectorContext, type VariableInspectRequest } from "@web/lib/variableInspect";
import "@web/styles/publication-bundle.css";
import "@web/styles/partials/inspector.css";

import { DocsCellView } from "../components/DocsCellView";
import { NotebookContents } from "../components/NotebookContents";
import { SectionWithMore } from "../components/SectionWithMore";
import { resolveMaxPeriodIndex } from "../notebookView";
import { loadNotebook, type LoadedNotebook } from "../staticRunner";

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

  const [inspectorContext, setInspectorContext] = useState<VariableInspectRequest | null>(null);
  const inspectorHistory = useInspectorVariableHistory();

  const [matrixGraphCharts, setMatrixGraphCharts] = useState<MatrixGraphChartEntry[]>([]);
  const matrixGraphChartIdRef = useRef(0);

  const handleMatrixGraphRequest = useCallback((request: MatrixGraphRequest) => {
    setMatrixGraphCharts((current) =>
      applyMatrixGraphRequest(current, request, () => {
        matrixGraphChartIdRef.current += 1;
        return `docs-matrix-graph-${matrixGraphChartIdRef.current}`;
      })
    );
  }, []);

  const handleToggleMatrixGraphChartPin = useCallback((chartId: string) => {
    setMatrixGraphCharts((current) => toggleMatrixGraphChartPin(current, chartId));
  }, []);

  const handleToggleMatrixGraphChartLegendMode = useCallback((chartId: string) => {
    setMatrixGraphCharts((current) => toggleMatrixGraphChartLegendMode(current, chartId));
  }, []);

  const handleDismissMatrixGraphChart = useCallback((chartId: string) => {
    setMatrixGraphCharts((current) => removeMatrixGraphChart(current, chartId));
  }, []);

  const handleRemoveMatrixGraphChartSeries = useCallback((chartId: string, source: string) => {
    setMatrixGraphCharts((current) => removeMatrixGraphChartSeries(current, chartId, source));
  }, []);

  const handleCloseMatrixGraph = useCallback(() => {
    setMatrixGraphCharts([]);
  }, []);

  const handleAddMatrixGraphChartSeries = useCallback(
    (chartId: string, source: string) => {
      if (!notebook) {
        return;
      }

      setMatrixGraphCharts((charts) => {
        const chart = charts.find((entry) => entry.id === chartId);
        if (!chart) {
          return charts;
        }

        const matrixCell = notebook.document.cells.find(
          (cell): cell is MatrixCell => cell.type === "matrix" && cell.id === chart.matrixCellId
        );
        const result = notebook.getResult(chart.sourceRunCellId);
        if (!matrixCell || !result) {
          return charts;
        }

        const sliceEntry = collectMatrixGraphSliceSeries(
          matrixCell,
          chart.kind,
          chart.index,
          result
        ).find((entry) => entry.source === source);
        if (!sliceEntry) {
          return charts;
        }

        return addMatrixGraphChartSeries(charts, chartId, sliceEntry);
      });
    },
    [notebook]
  );

  const handleInspectRequest = useCallback(
    (request: VariableInspectRequest) => {
      setInspectorContext((current) => {
        if (current && isSameInspectorContext(current, request)) {
          inspectorHistory.push(request.selectedVariable);
        } else {
          inspectorHistory.reset(request.selectedVariable);
        }
        return request;
      });
    },
    [inspectorHistory]
  );

  const handleInspectorSelectVariable = useCallback(
    (selectedVariable: string) => {
      setInspectorContext((current) =>
        current ? { ...current, selectedVariable } : current
      );
      inspectorHistory.push(selectedVariable);
    },
    [inspectorHistory]
  );

  const handleInspectorGoBack = useCallback(() => {
    const variableName = inspectorHistory.goBack();
    if (variableName) {
      setInspectorContext((current) =>
        current ? { ...current, selectedVariable: variableName } : current
      );
    }
  }, [inspectorHistory]);

  const handleInspectorGoForward = useCallback(() => {
    const variableName = inspectorHistory.goForward();
    if (variableName) {
      setInspectorContext((current) =>
        current ? { ...current, selectedVariable: variableName } : current
      );
    }
  }, [inspectorHistory]);

  const handleCloseInspector = useCallback(() => {
    setInspectorContext(null);
  }, []);

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

  const highlightedVariable = inspectorContext?.selectedVariable ?? null;
  const loadedNotebook = notebook;

  const buildCellInteraction = (cell: NotebookCell): PublicationVariableInteraction => {
    const inspectContext = resolvePublicationInspectContext({
      cell,
      document: loadedNotebook.document,
      getResult: loadedNotebook.getResult,
      selectedPeriodIndex
    });

    return mergePublicationVariableInteraction({
      descriptions: variableDescriptions,
      unitMetadata: variableUnitMetadata,
      inspectContext,
      highlightedVariable,
      onInspectVariable: inspectContext
        ? (selectedVariable) => {
            handleInspectRequest(
              buildPublicationInspectRequest({
                context: inspectContext,
                document: loadedNotebook.document,
                selectedVariable
              })
            );
          }
        : undefined
    });
  };

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
            {viewModel.bodySections.map((section) => {
              const interaction = buildCellInteraction(section.cell);
              const extraSource = notebook.extrasByCellId.get(section.anchorId);

              if (!extraSource) {
                return (
                  <DocsCellView
                    key={section.anchorId}
                    cells={notebook.document.cells}
                    getResult={notebook.getResult}
                    interaction={interaction}
                    onRequestMatrixGraph={handleMatrixGraphRequest}
                    section={section}
                    selectedPeriodIndex={selectedPeriodIndex}
                  />
                );
              }

              return (
                <SectionWithMore
                  key={section.anchorId}
                  title={section.cell.title}
                  extraSource={extraSource}
                  interaction={interaction}
                >
                  <DocsCellView
                    cells={notebook.document.cells}
                    getResult={notebook.getResult}
                    interaction={interaction}
                    onRequestMatrixGraph={handleMatrixGraphRequest}
                    section={section}
                    selectedPeriodIndex={selectedPeriodIndex}
                    showHeading={false}
                  />
                </SectionWithMore>
              );
            })}

            {viewModel.appendixSections.length > 0 ? (
              <section className="publication-appendix publication-page-break-before">
                <h2 className="publication-appendix-title">Appendix</h2>
                {viewModel.appendixSections.map((section) => {
                  const interaction = buildCellInteraction(section.cell);
                  const extraSource = notebook.extrasByCellId.get(section.anchorId);

                  if (!extraSource) {
                    return (
                      <DocsCellView
                        key={section.anchorId}
                        cells={notebook.document.cells}
                        getResult={notebook.getResult}
                        interaction={interaction}
                        onRequestMatrixGraph={handleMatrixGraphRequest}
                        section={section}
                        selectedPeriodIndex={selectedPeriodIndex}
                      />
                    );
                  }

                  return (
                    <SectionWithMore
                      key={section.anchorId}
                      anchorId={section.anchorId}
                      title={section.cell.title}
                      extraSource={extraSource}
                      interaction={interaction}
                      headingTag="h3"
                      headingClassName="publication-appendix-heading"
                      wrapperClassName="publication-section publication-section-appendix docs-section-with-more"
                    >
                      <PublicationAppendixSection cell={section.cell} />
                    </SectionWithMore>
                  );
                })}
              </section>
            ) : null}
          </main>

          {showContents ? (
            <NotebookContents entries={contentsEntries} document={notebook.document} />
          ) : null}
        </div>
      </div>

      {inspectorContext ? (
        <PublicationVariableInspectorPopup
          canGoBack={inspectorHistory.canGoBack}
          canGoForward={inspectorHistory.canGoForward}
          getResult={notebook.getResult}
          inspectorContext={inspectorContext}
          notebookDocument={notebook.document}
          onClose={handleCloseInspector}
          onGoBack={handleInspectorGoBack}
          onGoForward={handleInspectorGoForward}
          onSelectVariable={handleInspectorSelectVariable}
          selectedPeriodIndex={selectedPeriodIndex}
        />
      ) : null}

      {matrixGraphCharts.length > 0 ? (
        <PublicationMatrixGraphPopup
          cells={notebook.document.cells}
          charts={matrixGraphCharts}
          getResult={notebook.getResult}
          onAddChartSeries={handleAddMatrixGraphChartSeries}
          onClose={handleCloseMatrixGraph}
          onDismissChart={handleDismissMatrixGraphChart}
          onRemoveChartSeries={handleRemoveMatrixGraphChartSeries}
          onToggleChartLegendMode={handleToggleMatrixGraphChartLegendMode}
          onToggleChartPin={handleToggleMatrixGraphChartPin}
          selectedPeriodIndex={selectedPeriodIndex}
        />
      ) : null}
    </div>
  );
}
