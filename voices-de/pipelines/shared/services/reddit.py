"""Shaping Reddit rows — from the archive's JSON or reddit.com's Atom feeds
— into the voices contract. Pure functions; the tests run without a
network."""

import html
import re
import xml.etree.ElementTree as ET
from datetime import UTC, datetime

ATOM = {"a": "http://www.w3.org/2005/Atom"}
_TAGS = re.compile(r"<[^>]+>")
_PERMALINK = re.compile(r"/comments/(?P<post>[a-z0-9]+)/[^/]*/?(?P<comment>[a-z0-9]+)?")
_DELETED = {"[deleted]", "[removed]", ""}


def strip_html(markup: str) -> str:
    return html.unescape(_TAGS.sub("", markup)).strip()


def strip_prefix(fullname: str | None) -> str | None:
    """`t3_1wj04z1` → `1wj04z1`; None stays None."""
    if not fullname:
        return None
    return fullname.split("_", 1)[1] if "_" in fullname else fullname


def is_usable(body: str, author: str) -> bool:
    return body.strip() not in _DELETED and author not in _DELETED


def shape_archive_post(row: dict) -> dict | None:
    if not is_usable(row.get("title", ""), row.get("author", "")):
        return None
    return {
        "external_id": row["id"],
        "voice_type": "post",
        "external_url": f"https://www.reddit.com{row['permalink']}",
        "thread_external_id": None,
        "parent_external_id": None,
        "author": row["author"],
        "title": row.get("title", ""),
        "body_text": row.get("selftext", "") if row.get("selftext") not in _DELETED else "",
        "body_html": row.get("selftext_html") or "",
        "flair": row.get("link_flair_text") or "",
        "score": row.get("score"),
        "reply_count": row.get("num_comments"),
        "posted_at": datetime.fromtimestamp(row["created_utc"], tz=UTC).isoformat(),
    }


def shape_archive_comment(row: dict) -> dict | None:
    if not is_usable(row.get("body", ""), row.get("author", "")):
        return None
    return {
        "external_id": row["id"],
        "voice_type": "comment",
        "external_url": f"https://www.reddit.com{row['permalink']}",
        "thread_external_id": strip_prefix(row.get("link_id")),
        "parent_external_id": strip_prefix(row.get("parent_id")),
        "author": row["author"],
        "title": "",
        "body_text": row["body"],
        "body_html": row.get("body_html") or "",
        "flair": row.get("author_flair_text") or "",
        "score": row.get("score"),
        "reply_count": None,
        "posted_at": datetime.fromtimestamp(row["created_utc"], tz=UTC).isoformat(),
    }


def shape_rss_entries(xml_text: str, kind: str) -> list[dict]:
    """reddit.com's Atom feeds carry no score and no parent for a comment —
    only the post it belongs to, from the permalink — so RSS voices arrive
    weak: they create a voice the archive has not delivered yet and never
    overwrite one it has; the archive run relinks and scores them."""
    root = ET.fromstring(xml_text)
    voices = []
    for entry in root.findall("a:entry", ATOM):
        link = entry.find("a:link", ATOM).get("href")
        match = _PERMALINK.search(link)
        if not match:
            continue
        author = (entry.findtext("a:author/a:name", default="", namespaces=ATOM) or "").removeprefix("/u/")
        body = strip_html(entry.findtext("a:content", default="", namespaces=ATOM) or "")
        title = entry.findtext("a:title", default="", namespaces=ATOM) or ""
        posted = entry.findtext("a:updated", default="", namespaces=ATOM)
        comment_id, post_id = match.group("comment"), match.group("post")
        if kind == "comment" and not comment_id:
            continue
        if not is_usable(body if kind == "comment" else title, author):
            continue
        voices.append(
            {
                "external_id": comment_id if kind == "comment" else post_id,
                "voice_type": kind,
                "external_url": link,
                "thread_external_id": post_id if kind == "comment" else None,
                "parent_external_id": post_id if kind == "comment" else None,
                "author": author,
                "title": "" if kind == "comment" else title,
                "body_text": body,
                "body_html": "",
                "flair": "",
                "score": None,
                "reply_count": None,
                "posted_at": posted,
                "weak": True,
            }
        )
    return voices


def batched(items: list, size: int):
    for start in range(0, len(items), size):
        yield items[start : start + size]
