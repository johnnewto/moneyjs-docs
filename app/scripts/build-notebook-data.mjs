import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const moneyjsRoot = process.env.MONEYJS_ROOT
  ? path.resolve(process.env.MONEYJS_ROOT)
  : path.resolve(appRoot, "../moneyjs");
const webRoot = path.resolve(moneyjsRoot, "packages/web");
const templatesRoot = path.resolve(appRoot, "notebooks");
const dataRoot = path.resolve(appRoot, "src/data");

const TEMPLATE_IDS = ["sim", "bmw", "gl2-pc"];

const coreEntry = path.resolve(moneyjsRoot, "packages/core/src/index.ts");
const notebookCoreEntry = path.resolve(moneyjsRoot, "packages/notebook-core/src/index.ts");
const modelSectionsEntry = path.resolve(webRoot, "src/notebook/modelSections.ts");
const editorModelEntry = path.resolve(webRoot, "src/lib/editorModel.ts");
const documentEntry = path.resolve(webRoot, "src/notebook/document.ts");
const templatesEntry = path.resolve(webRoot, "src/notebook/templates.ts");

const viteServer = await createServer({
  configFile: false,
  root: webRoot,
  logLevel: "silent",
  server: { middlewareMode: true },
  optimizeDeps: { disabled: true },
  resolve: {
    alias: {
      "@sfcr/core": coreEntry,
      "@sfcr/core-worker": path.resolve(moneyjsRoot, "packages/core-worker/src/index.ts"),
      "@sfcr/notebook-core": notebookCoreEntry
    }
  }
});

try {
  const load = (entry) => viteServer.ssrLoadModule(pathToFileURL(entry).href);

  const { runBaseline, runScenario } = await load(coreEntry);
  const { notebookFromYaml } = await load(notebookCoreEntry);
  const { buildEditorStateForNotebookModel, resolveRunCellModelKey } = await load(modelSectionsEntry);
  const { buildRuntimeConfig } = await load(editorModelEntry);
  const { normalizeScenarioFromNotebook } = await load(documentEntry);
  const { NOTEBOOK_TEMPLATES } = await load(templatesEntry);

  const helpers = {
    runBaseline,
    runScenario,
    buildEditorStateForNotebookModel,
    resolveRunCellModelKey,
    buildRuntimeConfig,
    normalizeScenarioFromNotebook
  };

  await fs.mkdir(dataRoot, { recursive: true });

  const manifest = [];

  for (const templateId of TEMPLATE_IDS) {
    const yamlPath = path.resolve(templatesRoot, `${templateId}.notebook.yaml`);
    const yamlSource = await fs.readFile(yamlPath, "utf8");
    const document = notebookFromYaml(yamlSource);

    const results = solveDocument(document, helpers);
    const serializedResults = {};
    for (const [cellId, result] of Object.entries(results)) {
      serializedResults[cellId] = serializeResult(result);
    }

    const meta = NOTEBOOK_TEMPLATES[templateId];
    const payload = {
      id: templateId,
      label: meta?.label ?? document.title,
      description: meta?.description ?? "",
      title: document.title,
      document,
      results: serializedResults
    };

    await fs.writeFile(
      path.resolve(dataRoot, `${templateId}.json`),
      `${JSON.stringify(payload)}\n`,
      "utf8"
    );

    manifest.push({
      id: templateId,
      label: payload.label,
      description: payload.description,
      title: payload.title
    });

    console.log(`docs-data: ${templateId} -> src/data/${templateId}.json (${Object.keys(serializedResults).length} runs)`);
  }

  await fs.writeFile(
    path.resolve(dataRoot, "index.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  console.log(`docs-data: manifest -> src/data/index.json (${manifest.length} notebooks)`);
} finally {
  await viteServer.close();
}

function serializeResult(result) {
  const series = {};
  for (const [name, values] of Object.entries(result.series)) {
    series[name] = Array.from(values);
  }
  return { ...result, series };
}

function solveDocument(document, helpers) {
  const runCells = document.cells.filter((cell) => cell.type === "run");
  const runCellsById = new Map(runCells.map((cell) => [cell.id, cell]));
  const results = {};
  const inProgress = new Set();

  function buildRunOptions(cell) {
    const editor = helpers.buildEditorStateForNotebookModel(document, cell);
    if (!editor) {
      return null;
    }
    const modelKey = helpers.resolveRunCellModelKey(document.cells, cell);
    const modelId = resolveModelIdFromRunCellKey(modelKey);
    const runtime = helpers.buildRuntimeConfig(editor, {
      notebookCells: document.cells,
      modelId: modelId ?? undefined,
      runCellId: cell.id
    });
    return { runtime, options: { ...runtime.options, periods: cell.periods } };
  }

  function resolveBaselineRunCell(cell) {
    if (cell.mode !== "scenario") {
      return null;
    }
    if (cell.baselineRunCellId) {
      const baseline = runCellsById.get(cell.baselineRunCellId);
      return baseline && baseline.mode === "baseline" ? baseline : null;
    }
    const scenarioModelKey = helpers.resolveRunCellModelKey(document.cells, cell);
    if (!scenarioModelKey) {
      return null;
    }
    return (
      runCells.find(
        (entry) =>
          entry.mode === "baseline" &&
          helpers.resolveRunCellModelKey(document.cells, entry) === scenarioModelKey
      ) ?? null
    );
  }

  function snapshotBaseline(baseline, baselineStartPeriod) {
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

  function solveCell(cellId) {
    if (results[cellId]) {
      return results[cellId];
    }
    if (inProgress.has(cellId)) {
      throw new Error(`Cyclic run dependency detected at '${cellId}'.`);
    }
    inProgress.add(cellId);

    const cell = runCellsById.get(cellId);
    if (!cell) {
      throw new Error(`Run cell '${cellId}' not found.`);
    }

    const built = buildRunOptions(cell);
    if (!built) {
      throw new Error(`Source model sections not found for run cell '${cellId}'.`);
    }
    const { runtime, options } = built;

    let result;
    if (cell.mode === "baseline") {
      result = helpers.runBaseline(runtime.model, options);
    } else {
      const baselineCell = resolveBaselineRunCell(cell);
      let baseline;
      if (baselineCell) {
        baseline = snapshotBaseline(solveCell(baselineCell.id), cell.baselineStartPeriod);
      } else {
        const baselineBuilt = buildRunOptions({ ...cell, mode: "baseline" });
        if (!baselineBuilt) {
          throw new Error(`Source model sections not found for run cell '${cellId}'.`);
        }
        baseline = snapshotBaseline(
          helpers.runBaseline(runtime.model, baselineBuilt.options),
          cell.baselineStartPeriod
        );
      }
      if (!cell.scenario) {
        throw new Error(`Scenario run cell '${cellId}' is missing its scenario definition.`);
      }
      result = helpers.runScenario(
        baseline,
        helpers.normalizeScenarioFromNotebook(cell.scenario),
        options
      );
    }

    inProgress.delete(cellId);
    results[cellId] = result;
    return result;
  }

  for (const cell of runCells) {
    solveCell(cell.id);
  }

  return results;
}

function resolveModelIdFromRunCellKey(modelKey) {
  if (!modelKey) {
    return null;
  }
  return modelKey.replace(/^model:/, "").replace(/^cell:/, "") || null;
}
