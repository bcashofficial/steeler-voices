from pipelines.shared.services.reddit import (
    shape_archive_comment,
    shape_archive_post,
    shape_rss_entries,
    strip_html,
    strip_prefix,
)

POST = {
    "id": "1wj04z1",
    "author": "Stealth_Well_worn",
    "title": "Joey Porter Jr leaves steelers practice",
    "selftext": "",
    "permalink": "/r/steelers/comments/1wj04z1/joey_porter_jr_leaves_steelers_practice/",
    "link_flair_text": None,
    "score": 1900,
    "num_comments": 601,
    "created_utc": 1789665360,
}
COMMENT = {
    "id": "c1",
    "author": "swampthingsden",
    "body": "Really can’t believe it got to this point.",
    "permalink": "/r/steelers/comments/1wj04z1/_/c1/",
    "link_id": "t3_1wj04z1",
    "parent_id": "t3_1wj04z1",
    "score": 313,
    "created_utc": 1789665540,
}
RSS = """<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
<entry><author><name>/u/T_Dillerson99</name></author>
<content type="html">&lt;p&gt;He’s the best qb we’ve had since Ben.&lt;/p&gt;</content>
<link href="https://www.reddit.com/r/steelers/comments/1wkwhdz/packers_fan/paxabc/" />
<updated>2026-09-20T07:43:24+00:00</updated><title>/u/T_Dillerson99 on Packers Fan</title></entry>
<entry><author><name>/u/[deleted]</name></author><content type="html">gone</content>
<link href="https://www.reddit.com/r/steelers/comments/1wkwhdz/packers_fan/paxdef/" />
<updated>2026-09-20T07:44:00+00:00</updated><title>x</title></entry>
</feed>"""


def test_post_and_comment_take_the_contract_shape():
    post = shape_archive_post(POST)
    assert post["voice_type"] == "post" and post["reply_count"] == 601
    assert post["external_url"].startswith("https://www.reddit.com/r/steelers/comments/1wj04z1/")
    assert post["posted_at"].startswith("2026-09-17T")
    comment = shape_archive_comment(COMMENT)
    assert comment["thread_external_id"] == "1wj04z1" and comment["parent_external_id"] == "1wj04z1"
    assert comment["title"] == "" and comment["score"] == 313


def test_deleted_voices_are_dropped():
    assert shape_archive_comment({**COMMENT, "body": "[deleted]"}) is None
    assert shape_archive_post({**POST, "author": "[deleted]"}) is None


def test_rss_comments_carry_their_post_and_lose_the_deleted():
    voices = shape_rss_entries(RSS, "comment")
    assert len(voices) == 1
    voice = voices[0]
    assert voice["external_id"] == "paxabc" and voice["thread_external_id"] == "1wkwhdz"
    assert voice["author"] == "T_Dillerson99"
    assert voice["body_text"] == "He’s the best qb we’ve had since Ben."
    assert voice["score"] is None and voice["weak"] is True


def test_helpers():
    assert strip_prefix("t1_abc") == "abc" and strip_prefix(None) is None
    assert strip_html("<p>a &amp; b</p>") == "a & b"
