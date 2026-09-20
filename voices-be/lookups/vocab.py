"""The words of the platform, in one place. `seed_lookups` writes these rows;
the design system's `vocab.ts` mirrors them.

SECTION_KINDS is intentionally empty until its words are chosen — the document
template reads from that table, so the taxonomy is data, not code.
"""

SOURCES = [
    {
        "label": "r/steelers",
        "platform": "reddit",
        "community": "steelers",
        "url": "https://www.reddit.com/r/steelers",
        "posts_feed_url": "https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=steelers",
        "comments_feed_url": "https://arctic-shift.photon-reddit.com/api/comments/search?subreddit=steelers",
        "adapter": "archive",
    },
    {
        "label": "r/steelers (rss)",
        "platform": "reddit",
        "community": "steelers",
        "url": "https://www.reddit.com/r/steelers",
        "posts_feed_url": "https://www.reddit.com/r/steelers/new.rss",
        "comments_feed_url": "https://www.reddit.com/r/steelers/comments.rss",
        "adapter": "rss",
    },
]

VOICE_TYPES = [
    {"key": "post", "label": "post"},
    {"key": "comment", "label": "comment"},
]

# Mirrors voices-design-system src/theme/vocab.ts MOODS; `color_token` is the
# design-system mood key whose gradient paints this mood's pulse bar.
MOODS = [
    {"key": "hyped", "label": "Hyped", "color_token": "hyped"},
    {"key": "hopeful", "label": "Hopeful", "color_token": "hopeful"},
    {"key": "proud", "label": "Proud", "color_token": "proud"},
    {"key": "level", "label": "Level", "color_token": "level"},
    {"key": "uneasy", "label": "Uneasy", "color_token": "uneasy"},
    {"key": "frustrated", "label": "Frustrated", "color_token": "frustrated"},
    {"key": "heated", "label": "Heated", "color_token": "heated"},
]

TARGETS = [
    {"key": "player", "label": "player"},
    {"key": "coach", "label": "coach"},
    {"key": "front_office", "label": "front office"},
    {"key": "refs", "label": "refs"},
    {"key": "opponent", "label": "opponent"},
    {"key": "fans", "label": "fans"},
    {"key": "media", "label": "media"},
    {"key": "none", "label": "none"},
]

SECTION_KINDS: list[dict] = []

ARMS = [
    {"key": "rag", "label": "rag", "uses_retrieval": True},
    {"key": "baseline", "label": "baseline", "uses_retrieval": False},
]

EXPERIMENT_KINDS = [
    {"key": "generation", "label": "generation"},
    {"key": "ui", "label": "ui"},
]

METRICS = [
    {"key": "groundedness", "label": "groundedness", "unit": "ratio", "higher_is_better": True},
    {"key": "specificity", "label": "specificity", "unit": "ratio", "higher_is_better": True},
    {"key": "judge_score", "label": "judge score", "unit": "1-5", "higher_is_better": True},
    {"key": "click_through", "label": "click-through", "unit": "count", "higher_is_better": True},
]

# local_schedule is cron (APScheduler); remote_schedule is an EventBridge expression.
PIPELINES = [
    {
        "key": "load_seed",
        "label": "load seed",
        "description": "The committed capture, into an empty store, once.",
        "local_schedule": "boot",
        "remote_schedule": "manual",
    },
    {
        "key": "ingest",
        "label": "ingest",
        "description": "New posts and comments from the archive feed.",
        "local_schedule": "*/10 * * * *",
        "remote_schedule": "rate(10 minutes)",
    },
    {
        "key": "ingest_rss",
        "label": "ingest (rss)",
        "description": "The same voices, straight from reddit.com's feeds.",
        "local_schedule": "*/15 * * * *",
        "remote_schedule": "rate(15 minutes)",
    },
    {
        "key": "schedule",
        "label": "schedule",
        "description": "The season schedule and results from ESPN.",
        "local_schedule": "0 6 * * *",
        "remote_schedule": "cron(0 10 * * ? *)",
    },
    {
        "key": "embed",
        "label": "embed",
        "description": "Vectors for every voice without one.",
        "local_schedule": "5,20,35,50 * * * *",
        "remote_schedule": "rate(15 minutes)",
    },
    {
        "key": "tag",
        "label": "tag",
        "description": "Batch readings: mood, intensity, target, subjects.",
        "local_schedule": "0 * * * *",
        "remote_schedule": "rate(1 hour)",
    },
    {
        "key": "project",
        "label": "project",
        "description": "The 2-D map of every embedding.",
        "local_schedule": "10 * * * *",
        "remote_schedule": "rate(1 hour)",
    },
    {
        "key": "cluster",
        "label": "cluster",
        "description": "This week's topics from the vectors.",
        "local_schedule": "15 * * * *",
        "remote_schedule": "rate(1 hour)",
    },
    {
        "key": "generate",
        "label": "generate",
        "description": "The week's document, both arms.",
        "local_schedule": "0 6 * * 2",
        "remote_schedule": "cron(0 10 ? * TUE *)",
    },
]
