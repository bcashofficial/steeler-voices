"""Project: every embedding onto two dimensions with PCA — a plain SVD,
deterministic, no extra library — so the map draws the whole corpus in one
consistent frame. Recomputed whole each run."""

import numpy as np

from pipelines.shared.services.reddit import batched
from pipelines.shared.services.runner import Context

PAGE = 2000


def fetch_all(context: Context) -> list[dict]:
    rows, offset = [], 0
    while True:
        page = context.backend.embeddings(None, PAGE, offset)
        rows.extend(page)
        if len(page) < PAGE:
            return rows
        offset += PAGE


def pca_2d(vectors: np.ndarray) -> np.ndarray:
    """Rows centered, projected onto the two leading right-singular vectors,
    scaled so the wider axis spans roughly -1 to 1."""
    centered = vectors - vectors.mean(axis=0)
    _, _, components = np.linalg.svd(centered, full_matrices=False)
    points = centered @ components[:2].T
    scale = np.abs(points).max() or 1.0
    return points / scale


def project(context: Context) -> dict:
    rows = fetch_all(context)
    counts = {"embeddings": len(rows), "written": 0}
    if len(rows) < 3:
        return counts
    points = pca_2d(np.array([row["vector"] for row in rows], dtype=np.float32))
    if context.dry_run:
        return counts
    items = [
        {"voice_id": row["voice_id"], "x": float(x), "y": float(y)} for row, (x, y) in zip(rows, points, strict=True)
    ]
    for batch in batched(items, 1000):
        counts["written"] += context.backend.apply_projection(context.run_id, batch)["written"]
    return counts
