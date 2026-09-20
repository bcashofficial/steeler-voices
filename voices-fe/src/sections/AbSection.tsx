/**
 * The A/B: the same week written by both arms, side by side — retrieval
 * on the left, the plain model on the right — each with its run, its
 * retrieval count in the corner, and its scored outcomes.
 */

import { Pane } from "design_system/theme";

import { paths } from "../api/client";
import type { ArmDocument as ArmDocumentData, Week } from "../api/types";
import { useRead } from "../api/useRead";
import { ArmDocument } from "./ArmDocument";

interface AbSectionProps {
  week: Week;
  platform: string;
}

export function AbSection({ week, platform }: AbSectionProps) {
  const documents = useRead<{ documents: ArmDocumentData[] }>(paths.documents(week.starts_on));
  if (!documents.data) return null;
  return (
    <div className="sv-side">
      {documents.data.documents.map((document) => (
        <Pane key={document.arm} bar={{ title: document.label, count: document.run?.retrievals }}>
          <ArmDocument document={document} platform={platform} heading={false} />
        </Pane>
      ))}
    </div>
  );
}
