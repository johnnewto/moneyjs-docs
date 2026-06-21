import { useCallback, useEffect, useState, type MouseEvent } from "react";

import type { PublicationContentsEntry } from "@web/publication/buildPublicationViewModel";

export function NotebookContents({ entries }: { entries: PublicationContentsEntry[] }) {
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(entries[0]?.anchorId ?? null);

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

  const handleNavigate = useCallback((anchorId: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.document.getElementById(anchorId)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    setActiveAnchorId(anchorId);
  }, []);

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
    </aside>
  );
}
