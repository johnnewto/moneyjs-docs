import type { SimulationResult } from "@sfcr/core";
import type { NotebookDocument } from "@web/notebook/types";

export interface ManifestEntry {
  id: string;
  label: string;
  description: string;
  title: string;
}

interface SerializedResult extends Omit<SimulationResult, "series"> {
  series: Record<string, number[]>;
}

interface NotebookPayload {
  id: string;
  label: string;
  description: string;
  title: string;
  document: NotebookDocument;
  results: Record<string, SerializedResult>;
}

export interface LoadedNotebook {
  meta: ManifestEntry;
  document: NotebookDocument;
  getResult: (runCellId: string) => SimulationResult | null;
}

const notebookModules = import.meta.glob<{ default: NotebookPayload }>("./data/*.json");
const manifestModule = import.meta.glob<{ default: ManifestEntry[] }>("./data/index.json");

function rehydrateResult(serialized: SerializedResult): SimulationResult {
  const series: SimulationResult["series"] = {};
  for (const [name, values] of Object.entries(serialized.series)) {
    series[name] = Float64Array.from(values);
  }
  return { ...serialized, series };
}

export async function loadManifest(): Promise<ManifestEntry[]> {
  const loader = manifestModule["./data/index.json"];
  if (!loader) {
    return [];
  }
  const module = await loader();
  return module.default;
}

export async function loadNotebook(id: string): Promise<LoadedNotebook | null> {
  const loader = notebookModules[`./data/${id}.json`];
  if (!loader) {
    return null;
  }

  const payload = (await loader()).default;
  const results = new Map<string, SimulationResult>();
  for (const [cellId, serialized] of Object.entries(payload.results)) {
    results.set(cellId, rehydrateResult(serialized));
  }

  return {
    meta: {
      id: payload.id,
      label: payload.label,
      description: payload.description,
      title: payload.title
    },
    document: payload.document,
    getResult: (runCellId: string) => results.get(runCellId) ?? null
  };
}
