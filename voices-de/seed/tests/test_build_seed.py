from seed.build_seed import MIN_CHARS, MIN_SCORE, TOP_PER_THREAD, keep_comments


def comment(i, score, body="a comment that is long enough"):
    return {"id": f"c{i}", "score": score, "body": body}


def test_keeps_the_top_by_score_plus_anything_that_landed():
    quiet = [comment(i, 1) for i in range(TOP_PER_THREAD + 50)]
    landed = comment("x", MIN_SCORE)
    short = comment("y", 999, body="lol")
    kept = keep_comments(quiet + [landed, short])
    ids = {c["id"] for c in kept}
    assert "cx" in ids and "cy" not in ids
    assert len(kept) == TOP_PER_THREAD + 1
    assert all(len(c["body"]) >= MIN_CHARS for c in kept)
