import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

import { notebookToJson } from "@sfcr/notebook-core";
import type { NotebookDocument } from "@web/notebook/types";
import {
  NOTEBOOK_SHARE_HASH_ROUTE,
  NOTEBOOK_SHARE_QUERY_PARAM,
  compressNotebookSharePayload
} from "@web/notebook/notebookShareLink";
import type { PublicationContentsEntry } from "@web/publication/buildPublicationViewModel";

const SHARE_ORIGIN = (import.meta.env.VITE_MONEYJS_SHARE_ORIGIN ?? "https://johnnewto.github.io")
  .trim()
  .replace(/\/$/, "");
const SHARE_BASE_PATH = (import.meta.env.VITE_MONEYJS_SHARE_BASE ?? "/moneyjs/").trim().replace(/\/?$/, "/");
const SHARE_MAX_COMPRESSED_LENGTH = 64_000;

function buildMoneyjsShareUrl(document: NotebookDocument): { url: string } | { error: string } {
  const nbz = compressNotebookSharePayload(notebookToJson(document));
  if (nbz.length > SHARE_MAX_COMPRESSED_LENGTH) {
    return {
      error: `This notebook is too large to share as a link (${nbz.length.toLocaleString()} characters compressed; limit is ${SHARE_MAX_COMPRESSED_LENGTH.toLocaleString()}).`
    };
  }

  const params = new URLSearchParams();
  params.set(NOTEBOOK_SHARE_QUERY_PARAM, nbz);
  // Hash routing keeps nbz off the HTTP request line (avoids HTTP 414 on GitHub Pages).
  return { url: `${SHARE_ORIGIN}${SHARE_BASE_PATH}${NOTEBOOK_SHARE_HASH_ROUTE}?${params.toString()}` };
}

export function NotebookContents({
  entries,
  document
}: {
  entries: PublicationContentsEntry[];
  document: NotebookDocument;
}) {
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(entries[0]?.anchorId ?? null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (entries.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const elements = entries
      .map((entry) => window.document.getElementById(entry.anchorId))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (records) => {
        const intersecting = records
          .filter((record) => record.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        const nextId = intersecting[0]?.target.id?.trim();
        if (nextId) {
          setActiveAnchorId(nextId);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.15, 0.5, 1]
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [entries]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (dialogMessage && !dialog.open) {
      dialog.showModal();
    } else if (!dialogMessage && dialog.open) {
      dialog.close();
    }
  }, [dialogMessage]);

  const handleNavigate = useCallback((anchorId: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    setActiveAnchorId(anchorId);
  }, []);

  const handleOpenInteractive = useCallback(() => {
    const result = buildMoneyjsShareUrl(document);
    if ("error" in result) {
      setDialogMessage(result.error);
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }, [document]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <aside className="publication-contents publication-no-print" aria-label="Contents">
      <nav className="publication-contents-nav">
        <h2 className="publication-contents-title">Contents</h2>
        <ol className="publication-contents-list">
          {entries.map((entry) => (
            <li key={entry.anchorId}>
              <a
                className={
                  activeAnchorId === entry.anchorId
                    ? "publication-contents-link is-active"
                    : "publication-contents-link"
                }
                href={`#${entry.anchorId}`}
                onClick={(event) => handleNavigate(entry.anchorId, event)}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ol>
        <div className="publication-action-links publication-action-links-sidebar">
          <button
            type="button"
            className="publication-interactive-link"
            onClick={handleOpenInteractive}
          >
            Open interactive notebook ↗
          </button>
          <button
            type="button"
            className="publication-print-button"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
          <a className="publication-interactive-link" href="#/">
            ← All notebooks
          </a>
        </div>
      </nav>
      <dialog
        ref={dialogRef}
        className="docs-share-dialog publication-no-print"
        onClose={() => setDialogMessage(null)}
      >
        <p className="docs-share-dialog-message">{dialogMessage}</p>
        <form method="dialog" className="docs-share-dialog-actions">
          <button type="submit" className="publication-interactive-link">
            Close
          </button>
        </form>
      </dialog>
    </aside>
  );
}
