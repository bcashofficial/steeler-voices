/**
 * The document: the week's Community Voices Document on the retrieval arm,
 * the one the platform publishes.
 */

import { Pane } from "design_system/theme";

import { paths } from "../api/client";
import type { ArmDocument as ArmDocumentData, Week } from "../api/types";
import { useRead } from "../api/useRead";
import { ArmDocument } from "./ArmDocument";

interface DocumentSectionProps {
  week: Week;
  platform: string;
}

export function DocumentSection({ week, platform }: DocumentSectionProps) {
  const documents = useRead<{ documents: ArmDocumentData[] }>(paths.documents(week.starts_on));
  const published = documents.data?.documents.find((document) => document.uses_retrieval);
  if (!published) return null;
  return (
    <div style={{ maxWidth: 760 }}>
      <Pane>
        <ArmDocument document={published} platform={platform} />
      </Pane>
    </div>
  );
}
