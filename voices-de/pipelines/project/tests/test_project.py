import numpy as np

from pipelines.project.services import pca_2d


def test_pca_keeps_the_dominant_direction_and_scales_to_the_unit_box():
    rng = np.random.default_rng(1)
    line = rng.normal(size=(50, 1)) * np.array([[3.0]])
    vectors = np.hstack([line, line * 0.1, rng.normal(size=(50, 4)) * 0.01])
    points = pca_2d(vectors)
    assert points.shape == (50, 2)
    assert np.abs(points).max() <= 1.0 + 1e-6
    assert abs(np.corrcoef(points[:, 0], vectors[:, 0])[0, 1]) > 0.99
