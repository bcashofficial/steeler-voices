# The rig

A rented GPU running Ollama, for the pipelines that need one — tagging a
whole season of voices, or generating documents faster than a CPU can.
Everything else stays where it is; only `OLLAMA_BASE_URL` changes.

```bash
make rig-up                       # rent a card (24 GB, under $0.90/hr), start Ollama, pull the models
make rig-status
OLLAMA_BASE_URL=$(python infra/rig/rig.py url) TAG_WORKERS=4 make pipeline P=tag
make rig-down                     # terminate; ephemeral, nothing to pay for idle
```

Needs a RunPod account and `RUNPOD_API_KEY` (in the environment or
`~/.config/steeler-voices/rig.env`). A 24 GB card runs qwen3:4b at roughly
a hundred tokens a second against two on a CPU laptop; with four parallel
workers the tagger reads a few thousand voices an hour.

Not required for `make dev`: the seed ships with readings already computed,
and the live tagger only has to keep up with new voices.
