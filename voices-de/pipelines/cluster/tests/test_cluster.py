from datetime import UTC, date, datetime

import numpy as np

from pipelines.cluster.services import choose_k, kmeans, tuesday_week


def test_kmeans_separates_two_obvious_groups():
    rng = np.random.default_rng(3)
    a = rng.normal(loc=[1, 0, 0], scale=0.05, size=(30, 3))
    b = rng.normal(loc=[0, 1, 0], scale=0.05, size=(30, 3))
    labels, centers = kmeans(np.vstack([a, b]), 2)
    assert len(set(labels[:30])) == 1 and len(set(labels[30:])) == 1
    assert labels[0] != labels[30]
    assert centers.shape == (2, 3)


def test_k_grows_slowly_with_the_week():
    assert choose_k(20) == 3
    assert choose_k(4000) == 12


def test_tuesday_week():
    assert tuesday_week(datetime(2026, 9, 20, 17, tzinfo=UTC)) == date(2026, 9, 15)
    assert tuesday_week(datetime(2026, 9, 15, 5, tzinfo=UTC)) == date(2026, 9, 15)
