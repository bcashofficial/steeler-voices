"""The A/B's arithmetic, pure: how grounded a document's claims are (backed
by a citation to a real voice), how specific (naming the week's own
people and threads), and the judge's verdict as a score out of five.
"""

from lookups.vocab import METRICS

METRIC_KEYS = [metric["key"] for metric in METRICS]


def grounded_share(claims: list[dict], evidence_count: int) -> float:
    """The share of claims that cite at least one real piece of evidence."""
    if not claims:
        return 0.0
    grounded = sum(1 for claim in claims if any(0 <= i < evidence_count for i in claim.get("evidence", [])))
    return grounded / len(claims)


def specific_share(claims: list[dict], entities: set[str]) -> float:
    """The share of claims that name one of the week's subjects or threads."""
    if not claims or not entities:
        return 0.0
    specific = sum(1 for claim in claims if any(name in claim["text"].lower() for name in entities))
    return specific / len(claims)


def judge_score(supported: int, total: int) -> float:
    """The judge's verdict on a 1–5 scale: 1 when nothing holds, 5 when all does."""
    if total == 0:
        return 1.0
    return round(1 + 4 * (supported / total), 2)


def valid_citations(claim: dict, evidence_count: int) -> list[int]:
    return sorted({i for i in claim.get("evidence", []) if 0 <= i < evidence_count})
