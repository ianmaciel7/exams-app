"""Regression tests for stable evidence dates after squash merges."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build-evidence-catalog.py"
spec = importlib.util.spec_from_file_location("build_evidence_catalog", SCRIPT)
catalog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(catalog)


class EvidenceDateStabilityTests(unittest.TestCase):
    def test_identical_asset_keeps_original_date_after_squash(self):
        previous = {"prototype/a.png": {"sha256": "same", "data": "2026-11-16"}}
        latest = {"prototype/a.png": "2026-11-17"}
        self.assertEqual(catalog.evidence_date("prototype/a.png", "same", previous, latest), "2026-11-16")

    def test_changed_asset_updates_date(self):
        previous = {"prototype/a.png": {"sha256": "old", "data": "2026-11-16"}}
        self.assertEqual(catalog.evidence_date("prototype/a.png", "new", previous,
                                               {"prototype/a.png": "2026-11-17"}), "2026-11-17")

    def test_new_asset_uses_git_date(self):
        self.assertEqual(catalog.evidence_date("prototype/new.png", "new", {},
                                               {"prototype/new.png": "2026-11-17"}), "2026-11-17")

    def test_existing_catalog_dates_are_loaded_for_media_and_tests(self):
        with tempfile.TemporaryDirectory() as d:
            old_out = catalog.OUT
            try:
                catalog.OUT = d
                Path(d, "catalog.json").write_text(json.dumps({
                    "evidencias": [{"caminho": "prototype/a.png", "sha256": "same", "data": "2026-11-16"}],
                    "testes": [{"caminho": "prototype/evidence_e2e.json", "data": "2026-11-16"}],
                }), encoding="utf-8")
                media, tests = catalog.previous_catalog_dates()
                self.assertEqual(media["prototype/a.png"]["sha256"], "same")
                self.assertEqual(tests["prototype/evidence_e2e.json"], "2026-11-16")
            finally:
                catalog.OUT = old_out


if __name__ == "__main__":
    unittest.main()
