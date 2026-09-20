#!/usr/bin/env python3
"""The rig — a rented GPU running Ollama, for the pipelines that need one.

    python infra/rig/rig.py up       rent a card, start Ollama, pull the models, print the URL
    python infra/rig/rig.py status   is it up, what does it cost, what is loaded
    python infra/rig/rig.py url      the OLLAMA_BASE_URL to point a pipeline at
    python infra/rig/rig.py down     terminate it (ephemeral: nothing to pay for idle)

Everything else runs where it always runs; only OLLAMA_BASE_URL changes:

    OLLAMA_BASE_URL=$(python infra/rig/rig.py url) TAG_WORKERS=4 make pipeline P=tag

Needs RUNPOD_API_KEY in the environment or in ~/.config/steeler-voices/rig.env.
Standard library only. State in ~/.config/steeler-voices/rig.json.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://api.runpod.io/v2"
UA = "Mozilla/5.0 steeler-voices-rig/0.1"  # the proxy and Cloudflare reject bare tool agents
CFG = Path.home() / ".config" / "steeler-voices"
ENV_FILE, STATE_FILE = CFG / "rig.env", CFG / "rig.json"
POD_NAME = "steeler-voices-rig"
IMAGE = "ollama/ollama:latest"
DISK_GB = 30
MAX_HOURLY = 0.90
# 24 GB is plenty for qwen3:4b and qwen3:8b; 48 GB cards are the fallback when none can be placed.
GPUS_24 = ["NVIDIA RTX A5000", "NVIDIA GeForce RTX 4090", "NVIDIA GeForce RTX 3090", "NVIDIA L4"]
GPUS_48 = ["NVIDIA A40", "NVIDIA RTX A6000", "NVIDIA L40", "NVIDIA L40S"]
MODELS = [os.environ.get("OLLAMA_TAGGING_MODEL", "qwen3:4b-instruct"), os.environ.get("OLLAMA_GENERATION_MODEL", "qwen3:8b")]


def api_key() -> str:
    key = os.environ.get("RUNPOD_API_KEY", "")
    if not key and ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("RUNPOD_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"')
    if not key:
        sys.exit(f"RUNPOD_API_KEY is required (env or {ENV_FILE})")
    return key


def api(method: str, path: str, body: dict | None = None, params: dict | None = None):
    url = f"{API}{path}" + (f"?{urllib.parse.urlencode(params)}" if params else "")
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(url, data=data, method=method)
    request.add_header("Authorization", f"Bearer {api_key()}")
    request.add_header("Content-Type", "application/json")
    request.add_header("User-Agent", UA)
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"{method} {path}: {error.code} {error.read().decode()[:300]}") from error


def state() -> dict:
    return json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}


def save(data: dict) -> None:
    CFG.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(data, indent=2))


def proxy_url(pod_id: str) -> str:
    return f"https://{pod_id}-11434.proxy.runpod.net"


def in_stock(gpus: list[str], cloud: str) -> list[tuple[str, float, list[str]]]:
    data = api("GET", "/catalog/gpus", params={"include": "AVAILABILITY", "product": "POD", "cloud": cloud})
    by_id = {g["id"]: g for g in data.get("gpus", [])}
    found = []
    for gpu in gpus:
        entry = by_id.get(gpu)
        if not entry:
            continue
        centers = [d["id"] for d in entry.get("dataCenters", []) if d.get("availability") not in (None, "NONE")]
        price = (entry.get("price") or {}).get(cloud.lower())
        if centers and price and price <= MAX_HOURLY:
            found.append((gpu, price, centers))
    return found


def create_pod() -> dict:
    body = {
        "name": POD_NAME,
        "image": IMAGE,
        "ports": ["11434/http"],
        "disk": DISK_GB,
        "env": {"OLLAMA_HOST": "0.0.0.0", "OLLAMA_KEEP_ALIVE": "2h", "OLLAMA_NUM_PARALLEL": "4", "OLLAMA_FLASH_ATTENTION": "1"},
    }
    for gpus in (GPUS_24, GPUS_48):
        for cloud in ("SECURE", "COMMUNITY"):
            for gpu, price, centers in in_stock(gpus, cloud):
                print(f"trying {gpu} ({cloud.lower()}) ${price:.2f}/hr in {','.join(centers)}")
                try:
                    pod = api("POST", "/pods", {**body, "cloud": cloud, "gpu": {"id": gpu, "count": 1}, "dataCenterIds": centers})
                except RuntimeError as error:
                    print(f"  could not place: {error}")
                    continue
                save({"pod_id": pod["id"], "gpu": gpu, "price": price, "started_at": time.time()})
                return pod
    sys.exit("no card could be placed under the price cap; try again in a few minutes")


def ollama(base: str, path: str, body: dict | None = None, timeout: int = 900):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(f"{base}{path}", data=data, method="POST" if body is not None else "GET")
    request.add_header("Content-Type", "application/json")
    request.add_header("User-Agent", UA)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode()


def wait_for_ollama(base: str, timeout: int = 600) -> None:
    started = time.time()
    while time.time() - started < timeout:
        try:
            ollama(base, "/api/tags")
            return
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            time.sleep(5)
    sys.exit("ollama never answered through the proxy")


def pull_models(base: str) -> None:
    for model in MODELS:
        print(f"pulling {model} ...")
        ollama(base, "/api/pull", {"model": model, "stream": False})


def cmd_up() -> None:
    current = state()
    if current.get("pod_id"):
        print(f"already up: {proxy_url(current['pod_id'])}")
        return
    pod = create_pod()
    base = proxy_url(pod["id"])
    print(f"pod {pod['id']} placed; waiting for ollama ...")
    wait_for_ollama(base)
    pull_models(base)
    print(f"\nexport OLLAMA_BASE_URL={base}")


def cmd_status() -> None:
    current = state()
    if not current.get("pod_id"):
        print("down")
        return
    pod = api("GET", f"/pods/{current['pod_id']}")
    hours = (time.time() - current["started_at"]) / 3600
    print(f"{pod.get('desiredStatus', pod.get('status'))} · {current['gpu']} · ${current['price']:.2f}/hr · {hours:.1f} h · ~${hours * current['price']:.2f}")
    print(proxy_url(current["pod_id"]))


def cmd_url() -> None:
    current = state()
    if not current.get("pod_id"):
        sys.exit("the rig is down")
    print(proxy_url(current["pod_id"]))


def cmd_down() -> None:
    current = state()
    if not current.get("pod_id"):
        print("down")
        return
    api("DELETE", f"/pods/{current['pod_id']}")
    hours = (time.time() - current["started_at"]) / 3600
    save({})
    print(f"terminated · {hours:.1f} h · ~${hours * current['price']:.2f}")


if __name__ == "__main__":
    {"up": cmd_up, "status": cmd_status, "url": cmd_url, "down": cmd_down}.get(
        sys.argv[1] if len(sys.argv) > 1 else "", lambda: sys.exit(__doc__)
    )()
