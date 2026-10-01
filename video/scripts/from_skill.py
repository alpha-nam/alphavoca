#!/usr/bin/env python3
"""csat-passage-card 스킬 JSON → 릴스용 passage.json 변환.

Usage: python3 scripts/from_skill.py data/skill-output.json src/data/passage.json "<원문 지문>"
"""
import json
import re
import sys


def plain(s):
    return re.sub(r"\*\*(.+?)\*\*", r"\1", s or "")


def main(src, dst, passage_text):
    d = json.load(open(src, encoding="utf-8"))
    summ = d["summary"]
    stages = {s["stage"]: s["description"] for s in summ["logic_stages"]}

    # 선지: 오답 + 정답을 번호순으로 합친다 ("① 문장" 형태 → label/text 분리)
    raw = [(c["choice"], False) for c in summ["distractors"]]
    raw.append((summ["correct_answer"]["choice"], True))
    choices = []
    for text, ok in raw:
        m = re.match(r"^\s*([①-⑤])\s*(.+)$", text)
        choices.append({"label": m.group(1) if m else "", "text": m.group(2) if m else text, "correct": ok})
    choices.sort(key=lambda c: c["label"])

    out = {
        "passage": passage_text,
        "topic": d["topic"],
        "main_idea": d["main_idea"],
        "sentences": [
            {"no": s["no"], "english": s["english"], "translation": plain(s["translation"])}
            for s in d["sentences"]
        ],
        "sketch": {
            "caption": (d.get("concept_sketch") or {}).get("title", ""),
            # 영상용 짧은 라벨(reel_sketch) 우선, 없으면 비유 문장을 잘라 사용
            "left": d.get("reel_sketch", {}).get("left") or ("통념: " + summ.get("analogy", {}).get("misconception", ""))[:14],
            "right": d.get("reel_sketch", {}).get("right") or ("주장: " + summ.get("analogy", {}).get("truth", ""))[:14],
        },
        "choices": choices,
    }
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("wrote", dst, "| stages:", list(stages))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
