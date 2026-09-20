from unittest.mock import MagicMock, patch

from pipelines.shared.services import runner
from pipelines.shared.services.config import Misconfigured


def test_a_missing_setting_exits_two():
    with patch.object(runner, "settings", side_effect=Misconfigured("BACKEND_URL is required")):
        assert runner.run("ingest", lambda _: {}) == runner.EXIT_MISCONFIGURED


def test_a_run_announces_itself_and_reports_its_counts():
    backend = MagicMock()
    backend.start_run.return_value = "run-1"
    with (
        patch.object(runner, "settings", return_value=MagicMock(host="local")),
        patch.object(runner, "BackendClient", return_value=backend),
    ):
        assert runner.run("ingest", lambda _: {"new": 3}) == runner.EXIT_OK
    backend.start_run.assert_called_once_with("ingest", "local", False)
    backend.finish_run.assert_called_once_with("run-1", runner.EXIT_OK, {"new": 3})


def test_a_failing_run_exits_one_and_still_reports():
    backend = MagicMock()
    backend.start_run.return_value = "run-2"

    def explode(_context):
        raise RuntimeError("archive down")

    with (
        patch.object(runner, "settings", return_value=MagicMock(host="local")),
        patch.object(runner, "BackendClient", return_value=backend),
    ):
        assert runner.run("ingest", explode) == runner.EXIT_FAILED
    backend.finish_run.assert_called_once_with("run-2", runner.EXIT_FAILED, {}, "see logs")


def test_a_dry_run_never_announces():
    backend = MagicMock()
    with (
        patch.object(runner, "settings", return_value=MagicMock(host="local")),
        patch.object(runner, "BackendClient", return_value=backend),
    ):
        assert runner.run("ingest", lambda _: {}, dry_run=True) == runner.EXIT_OK
    backend.start_run.assert_not_called()
