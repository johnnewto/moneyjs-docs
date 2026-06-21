import { useEffect, useState } from "react";

import { loadManifest, type ManifestEntry } from "../staticRunner";

export function GalleryPage() {
  const [entries, setEntries] = useState<ManifestEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadManifest().then((manifest) => {
      if (!cancelled) {
        setEntries(manifest);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="docs-shell">
      <header className="docs-header">
        <p className="docs-eyebrow">MoneyJS</p>
        <h1 className="docs-title">Notebook documentation</h1>
        <p className="docs-lede">
          Precomputed, read-only stock-flow-consistent notebooks. No solver runs in the browser.
        </p>
      </header>

      {entries === null ? (
        <p className="docs-status">Loading notebooks…</p>
      ) : entries.length === 0 ? (
        <p className="docs-status">
          No notebook data found. Run <code>pnpm --filter @sfcr/docs-site build:data</code>.
        </p>
      ) : (
        <ul className="docs-gallery">
          {entries.map((entry) => (
            <li key={entry.id} className="docs-card">
              <a className="docs-card-link" href={`#/n/${entry.id}`}>
                <h2 className="docs-card-title">{entry.label}</h2>
                <p className="docs-card-description">{entry.description}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
