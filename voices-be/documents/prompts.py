"""What the generator says to the model: the writer's brief and the judge's
brief, and the JSON shapes each must answer in. Prompt text is the
generator's own; nothing here is shown on screen.
"""

import json

EVIDENCE_CHARS = 400

WRITER_SYSTEM = (
    "You write the Community Voices Document for an online fan community: a short, plain, "
    "specific account of what the community talked about in the past week and what it will talk "
    "about in the week to come. Write in the third person about the community ('fans', 'the "
    "community'), never as a member. Every claim is one sentence. When evidence is provided, "
    "each claim cites the evidence numbers that back it; a claim with no evidence to cite has an "
    "empty list. When no evidence is provided, say what you can from the facts given and mark "
    "every claim's evidence as an empty list. Do not invent quotes, names, scores or injuries."
)

JUDGE_SYSTEM = (
    "You judge claims about what an online fan community said in a week, against a sample of "
    "what the community actually posted. A claim is supported when the sample contains posts "
    "that make it true; unsupported when the sample contradicts it or says nothing about it. "
    "Judge each claim on the sample alone."
)


def writer_schema(section_keys: list[str]) -> dict:
    claim = {
        "type": "object",
        "properties": {"text": {"type": "string"}, "evidence": {"type": "array", "items": {"type": "integer"}}},
        "required": ["text", "evidence"],
    }
    section = {
        "type": "object",
        "properties": {
            "kind": {"type": "string", "enum": section_keys},
            "heading": {"type": "string"},
            "body": {"type": "string"},
            "claims": {"type": "array", "items": claim},
        },
        "required": ["kind", "heading", "body", "claims"],
    }
    return {
        "type": "object",
        "properties": {"title": {"type": "string"}, "sections": {"type": "array", "items": section}},
        "required": ["title", "sections"],
    }


JUDGE_SCHEMA = {
    "type": "object",
    "properties": {
        "verdicts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"claim": {"type": "integer"}, "supported": {"type": "boolean"}},
                "required": ["claim", "supported"],
            },
        }
    },
    "required": ["verdicts"],
}


def evidence_lines(evidence: list[dict]) -> str:
    return "\n".join(
        f"[{item['index']}] u/{item['handle']}"
        f"{f' · {item["score"]} points' if item.get('score') is not None else ''}: "
        f"{item['text'][:EVIDENCE_CHARS]}"
        for item in evidence
    )


def writer_user(brief: dict, sections: list[dict], evidence: list[dict]) -> str:
    facts = {
        "community": brief["team"],
        "week": f"{brief['week_start']} to {brief['week_end']}",
        "game": brief["game"],
        "posts": brief["posts"],
        "comments": brief["comments"],
    }
    if evidence:
        facts["loudest_threads"] = brief["titles"]
        facts["subjects"] = brief["subjects"]
    asks = "\n".join(f"- section '{s['key']}' ({s['label']}): {s['question']}" for s in sections)
    parts = [
        f"Facts:\n{json.dumps(facts, indent=1)}",
        f"Write these sections, in this order, each with a heading, a body of a few sentences, and its claims:\n{asks}",
    ]
    if evidence:
        parts.append(f"Evidence — what the community posted this week, numbered:\n{evidence_lines(evidence)}")
    else:
        parts.append("No posts are available; write from the facts alone.")
    return "\n\n".join(parts)


def judge_user(claims: list[str], sample: list[dict]) -> str:
    numbered = "\n".join(f"({i}) {text}" for i, text in enumerate(claims))
    return f"Claims:\n{numbered}\n\nSample of what the community posted:\n{evidence_lines(sample)}"
