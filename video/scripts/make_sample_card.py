#!/usr/bin/env python3
"""data/sample-analysis.json → data/sample-card.html (분석 카드) + data/question.html (문제 페이지).
분석 카드는 data/card-style.css(기존 지문분석 HTML과 같은 스타일)를 그대로 쓴다."""
import html, json

e = lambda s: html.escape(str(s), quote=False)
d = json.load(open("data/sample-analysis.json", encoding="utf-8"))
css = open("data/card-style.css", encoding="utf-8").read()

def sent(s):
    gr = "".join(f"<li>{e(g)}</li>" for g in s["grammar"])
    return f'''<div class="sent-card">
  <div class="sent-header"><div class="sent-no">{e(s["no"])}</div><div class="sent-en">{e(s["en"])}</div></div>
  <div class="field-row"><div class="field-label">해석</div><div class="field-content">{e(s["ko"])}</div></div>
  <div class="field-row easy"><div class="field-label">쉬운 설명</div><div class="field-content">{e(s["easy"])}</div></div>
  <div class="field-row"><div class="field-label">내용 해설</div><div class="field-content">{e(s["note"])}</div></div>
  <div class="field-row"><div class="field-label">문법</div><div class="field-content"><ul>{gr}</ul></div></div>
</div>'''

vocab = "".join(f'<div class="vocab-item"><span class="vocab-word">{e(w)}</span> — {e(m)}</div>' for w, m in d["vocab"])
stages = "".join(
    f'<div class="stage-item"><div class="stage-head"><span class="stage-num">{i+1}</span><span class="stage-title">{e(t)}</span></div><div class="stage-desc">{e(x)}</div></div>'
    for i, (t, x) in enumerate(d["logic"]))
a = d["analogy"]
dis = "".join(f'<div class="distractor-row"><div class="distractor-choice">{e(c)}</div><div class="distractor-reason">{e(r)}</div></div>' for c, r in d["distractors"])
tips = "".join(f"<li>{e(t)}</li>" for t in d["tips"])
EXTRA_CSS = """
.vgroup{margin-bottom:16px}.vgroup-title{font-weight:700;color:#2563eb;font-size:14px;margin-bottom:8px}
.vitem{background:#fff;border:1px solid #e5e7eb;border-left:4px solid #2563eb;border-radius:10px;padding:12px 16px;margin-bottom:10px}
.vgroup.wr .vitem{border-left-color:#f59e0b}
.vtype{display:inline-block;background:#eff6ff;color:#2563eb;font-weight:700;font-size:12.5px;padding:2px 10px;border-radius:999px;margin-bottom:6px}
.vgroup.wr .vtype{background:#fffbeb;color:#b45309}
.vstem{font-weight:600;color:#111827}.vnote{color:#6b7280;font-size:13.5px;margin-top:4px}
"""
def vitems(rows):
    return "".join(f'<div class="vitem"><span class="vtype">{e(t)}</span><div class="vstem">{e(st)}</div><div class="vnote">{e(n)}</div></div>' for t, st, n in rows)
variants = f'<div class="vgroup"><div class="vgroup-title">객관식 변형</div>{vitems(d["variants"]["mc"])}</div><div class="vgroup wr"><div class="vgroup-title">서술형 변형</div>{vitems(d["variants"]["wr"])}</div>'

card = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>{e(d["title"])}</title><style>{css}{EXTRA_CSS}</style></head><body><div class="container">
<div class="source-ref">{e(d["source_ref"])}</div>
<h1 class="title">{e(d["title"])}</h1>
<div class="topic-box"><div class="topic-label">주제 TOPIC</div><div class="topic-text">{e(d["topic"])}</div>
<div class="topic-label">핵심 소재 MAIN IDEA</div><div class="topic-text">{e(d["main_idea"])}</div>
<div class="eli5-box"><div class="eli5-label">쉬운 설명 (초등학생도 이해하는 버전)</div><div class="eli5-text">{e(d["eli5"])}</div></div></div>
<h2 class="section-title">개념 스케치</h2>
<div class="sketch-box"><div class="sketch-title">{e(d["sketch_title"])}</div><div class="sketch-svg-wrap">{d["sketch_svg"]}</div><div class="sketch-caption">{e(d["sketch_caption"])}</div></div>
<h2 class="section-title">어휘</h2><div class="vocab-grid">{vocab}</div>
<h2 class="section-title">문장별 분석</h2>
{"".join(sent(s) for s in d["sentences"])}
<h2 class="section-title">논리 흐름</h2><div class="stage-list">{stages}</div>
<h2 class="section-title">티칭 포인트: 비유</h2>
<div class="analogy-box"><div class="analogy-title">{e(a["title"])}</div><div class="analogy-setup">{e(a["setup"])}</div>
<div class="compare-grid"><div class="compare-box myth"><div class="compare-label">통념</div><div class="compare-text">{e(a["myth"])}</div></div>
<div class="compare-box truth"><div class="compare-label">이 글의 주장(진실)</div><div class="compare-text">{e(a["truth"])}</div></div></div>
<div class="analogy-conclusion">{e(a["conclusion"])}</div></div>
<h2 class="section-title">정답 근거</h2>
<div class="correct-box"><div class="correct-choice">{e(d["correct"]["choice"])}</div><div class="correct-reason">{e(d["correct"]["reason"])}</div></div>{dis}
<h2 class="section-title">수업 팁</h2><ul class="tips-list">{tips}</ul>
<h2 class="section-title">수능형 변형문제 추천</h2>{variants}
</div></body></html>'''
open("data/sample-card.html", "w", encoding="utf-8").write(card)

# 문제 페이지(캡처해서 채팅창에 끌어다 놓는 장면용). 교재 로고/문항코드 없이 일반적인 시험지 형태.
S = d["sentences"]
def mark(s):
    return f'{s["no"]} {s["en"]}' if s["no"] in "①②③④⑤" else s["en"]
body = " ".join(mark(s) for s in S)
q = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>
body{{margin:0;background:transparent;font-family:"NotoLocal","Noto Sans KR",sans-serif}}
.page{{width:560px;background:#fff;padding:26px 30px 22px;color:#111;border:1px solid #d9dde3}}
.qh{{display:flex;gap:14px;align-items:baseline;margin-bottom:12px}}
.qn{{font-size:34px;font-weight:900;color:#111}}
.qt{{font-size:15.5px;font-weight:700}}.qt u{{text-underline-offset:3px}}
.psg{{font-family:"Times New Roman","Liberation Serif","DejaVu Serif",serif;font-size:15.5px;line-height:1.72;text-align:justify}}
.fn{{margin-top:8px;text-align:right;font-size:12px;color:#444}}
</style></head><body><div class="page" id="page">
<div class="qh"><div class="qn">05</div><div class="qt">다음 글에서 전체 흐름과 관계 <u>없는</u> 문장은?</div></div>
<div class="psg">{e(body)}</div>
<div class="fn">* lecturer: 강연자 &nbsp; ** transcription: 받아쓰기</div></div></body></html>'''
open("data/question.html", "w", encoding="utf-8").write(q)
print("ok")
