# seed/

`collect.py` — the capture (stdlib only, resumes from `raw/cursor.json`).
`build_seed.py` — curates `raw/` into `voices.jsonl.gz` (committed).
`voices.jsonl.gz` — the seed, in the voices contract.
`readings.jsonl.gz` — readings computed ahead of time, keyed by external id (committed when present).
`raw/` — everything captured; ignored.
