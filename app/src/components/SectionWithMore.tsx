import { useId, useState, type ReactNode } from "react";

import { AssistantMarkdown } from "@web/components/AssistantMarkdown";
import type { PublicationVariableInteraction } from "@web/publication/publicationInspect";

export function SectionWithMore({
  anchorId,
  title,
  extraSource,
  interaction,
  children,
  headingTag: HeadingTag = "h2",
  headingClassName = "publication-section-heading",
  wrapperClassName = "docs-section-with-more"
}: {
  anchorId?: string;
  title: string;
  extraSource: string;
  interaction: PublicationVariableInteraction;
  children: ReactNode;
  headingTag?: "h2" | "h3";
  headingClassName?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  const hasTitle = title.trim().length > 0;

  return (
    <div className={wrapperClassName} id={anchorId}>
      {hasTitle ? <HeadingTag className={headingClassName}>{title}</HeadingTag> : null}
      {children}
      {open ? (
        <div id={panelId} className="docs-more-panel">
          <AssistantMarkdown
            className="publication-markdown"
            currentValues={interaction.currentValues}
            highlightedVariable={interaction.highlightedVariable}
            onSelectVariable={interaction.onSelectVariable}
            text={extraSource}
            variableDescriptions={interaction.variableDescriptions}
            variableUnitMetadata={interaction.variableUnitMetadata}
          />
        </div>
      ) : null}
      <div className="docs-more-row">
        <button
          type="button"
          className="docs-more-toggle publication-no-print"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "less" : "more"}
        </button>
      </div>
    </div>
  );
}
