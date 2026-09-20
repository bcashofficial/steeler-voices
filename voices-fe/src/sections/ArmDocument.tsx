/**
 * One arm's document as the generator wrote it: the title, each section's
 * heading and body, the voices it cites as links back to the community,
 * and under it the run and its scored outcomes. Without a document it
 * shows the run's state, so a failed or pending arm is not a blank.
 */

import { TextLink } from "design_system/theme";

import type { ArmDocument as ArmDocumentData, DocumentSection } from "../api/types";
import { Display } from "../Display";
import { clockFor, dayFor, handleFor } from "../format";
import { BODY, SMALL, TABULAR, TITLE } from "../text";

interface ArmDocumentProps {
  document: ArmDocumentData;
  platform: string;
  /** The title in the display face; off when the arm's label already heads it. */
  heading?: boolean;
}

function Section({ section, platform }: { section: DocumentSection; platform: string }) {
  return (
    <section style={{ display: "grid", gap: 6 }}>
      <h3 style={TITLE}>{section.heading}</h3>
      <p style={{ ...BODY, whiteSpace: "pre-wrap" }}>{section.body}</p>
      {section.citations.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
          {section.citations.map((citation) => (
            <TextLink key={citation.voice_id} href={citation.external_url} size="sm">
              {handleFor(citation.handle, platform)}
            </TextLink>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ArmDocument({ document, platform, heading = true }: ArmDocumentProps) {
  const { run } = document;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {heading && document.title ? <Display size={34}>{document.title}</Display> : null}
      {document.sections.map((section) => (
        <Section key={section.position} section={section} platform={platform} />
      ))}
      {run ? (
        <div style={{ display: "grid", gap: 4 }}>
          <div style={SMALL}>
            {run.status} · {run.model}
            {run.finished_at ? ` · ${dayFor(run.finished_at)} ${clockFor(run.finished_at)}` : ""}
          </div>
          {run.error ? <div style={{ ...SMALL, color: "var(--sv-ink-3)" }}>{run.error}</div> : null}
          {document.outcomes.map((outcome) => (
            <div
              key={outcome.metric}
              style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
            >
              <span style={SMALL}>{outcome.label}</span>
              <span style={TABULAR}>{outcome.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
