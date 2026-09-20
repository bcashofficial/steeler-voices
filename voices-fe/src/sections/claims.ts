/** Which cited voices back each claim: the claim's evidence indices looked
 *  up among the section's citations, one citation per handle. */

import type { Citation, Claim } from "../api/types";

export function citationsFor(claim: Claim, citations: readonly Citation[]): Citation[] {
  return citations.filter(
    (citation) => citation.evidence !== null && claim.evidence.includes(citation.evidence),
  );
}
