#!/usr/bin/env python3
"""data/sample-analysis.json → 최신 csat-passage-card 스킬 형식 payload → data/skill-card2.html

사용법: python3 scripts/to_skill_payload.py
(렌더러는 스킬의 generate_html.py 사본: scripts/skill_card/generate_html.py)"""
import json, subprocess, sys

d = json.load(open("data/sample-analysis.json", encoding="utf-8"))
POS = {"conceptual": "adj.", "transcription": "n.", "rephrase": "v.", "passive": "adj.", "filter": "n.", "lecturer": "n."}

payload = {
    "title": d["title"],
    "source_ref": d["source_ref"],
    "topic": d["topic"],
    "main_idea": d["main_idea"],
    "eli5": d["eli5"],
    "concept_sketch": {"title": d["sketch_title"], "svg": d["sketch_svg"], "caption": d["sketch_caption"]},
    "blueprint": d["blueprint"],
    "sentences": [
        {"no": i + 1, **({"block_label": s["no"]} if s["no"] in "①②③④⑤" else {}),
         "english": s["en"], "translation": s["ko"], "easy_explanation": s["easy"],
         "content_note": s["note"], "grammar_points": s["grammar"]}
        for i, s in enumerate(d["sentences"])
    ],
    "summary": {
        "logic_stages": [{"stage": t, "description": x} for t, x in d["logic"]],
        "analogy": {"title": d["analogy"]["title"], "setup": d["analogy"]["setup"],
                    "misconception": d["analogy"]["myth"], "truth": d["analogy"]["truth"],
                    "conclusion": d["analogy"]["conclusion"]},
        "distractors": [{"choice": f"{c} 흐름에 맞는 문장", "reason": r} for c, r in d["distractors"]],
        "correct_answer": {"choice": "④ 관계없는 문장 (정답)", "reason": d["correct"]["reason"]},
        "vocabulary": [{"word": w, "meaning": m, "pos": POS.get(w)} for w, m in d["vocab"]],
        "tips": d["tips"],
    },
    "variant_questions": {
        "multiple_choice": [{"type": t, "stem": st, "note": n} for t, st, n in d["variants"]["mc"]],
        "written": [{"type": t, "stem": st, "note": n} for t, st, n in d["variants"]["wr"]],
    },
}
json.dump(payload, open("data/skill-payload.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)
subprocess.check_call([sys.executable, "scripts/skill_card/generate_html.py", "data/skill-payload.json", "data/skill-card2.html"])
