#!/usr/bin/env python3
"""샘플 지문(오리지널)용 학습지(학생용) + 정답지(교사용) HTML 생성.
스타일은 passage-worksheet-builder 스킬(WCSS)과 csat-passage-card 렌더러(CSS/PRINT_CSS)를 그대로 쓴다.
출력: data/worksheet-student.html, data/worksheet-key.html"""
import importlib.util, os, sys

sp = importlib.util.spec_from_file_location("g", "scripts/skill_card/generate_html.py")
g = importlib.util.module_from_spec(sp); sp.loader.exec_module(g)
chip, h2 = g.chip, g.h2
WCSS = open("data/ws.css", encoding="utf-8").read()
FONT = os.path.abspath("public/fonts/NotoSansKR.ttf")
BASE_FONT = f'@font-face{{font-family:NotoLocal;src:url("file://{FONT}");font-weight:100 900}}:root{{--font-body:NotoLocal,sans-serif!important;--font-display:NotoLocal,sans-serif!important}}body,.card{{font-family:NotoLocal,sans-serif}}'
KEY_CSS = '.bl.ans{border-bottom:1.6px solid #c3272c;background:none;color:#c3272c;font-weight:800;text-align:center;min-width:34px;padding:0 6px 1px;height:auto;line-height:1.25;vertical-align:baseline}.ans-t{color:#c3272c;font-weight:700}'

SENTS = [
    "Taking notes by hand slows you down, and that is exactly why it works.",
    "Because you cannot write down every word a lecturer says, you are forced to decide which ideas matter and to put them into your own words.",
    "This quiet act of selecting and rephrasing turns passive listening into active thinking.",
    "Studies comparing students who wrote by hand with those who typed found that the handwriters often did better on conceptual questions, even though the typists produced longer notes.",
    "Typing tends to encourage word-for-word transcription, which lets information pass from the ears to the fingers without ever being processed.",
    "Modern laptops have longer battery lives and lighter bodies than they did a decade ago, making them easier to carry between classes.",
    "In other words, the limits of handwriting are not a flaw but a built-in filter that rewards understanding over copying.",
]
VOC = [("conceptual", "adj.", "개념적인"), ("transcription", "n.", "받아쓰기, 필사"), ("rephrase", "v.", "다른 말로 바꿔 말하다"),
       ("passive", "adj.", "수동적인"), ("filter", "n.", "걸러 내는 장치"), ("lecturer", "n.", "강연자")]


def build(ANS: bool) -> str:
    def bl(cls="", a=None):
        return f'<span class="bl {cls} ans">{a}</span>' if (ANS and a is not None) else f'<span class="bl {cls}"></span>'

    def opt(text, hit=False):
        return f'<span class="opt2 {"hit" if (ANS and hit) else ""}"><i></i>{text}</span>'

    def line(a=None, style="flex:1"):
        inner = f'<b class="ans-t" style="font-size:10.5px;white-space:nowrap">{a}</b>' if (ANS and a) else ""
        return f'<div class="ln" style="{style}">{inner}</div>'

    starts = "".join(f'<span class="st"><sup>{i+1}</sup>{" ".join(x.split()[:4])}…</span>' for i, x in enumerate(SENTS))

    def hd(k):
        return f'<section class="card hd"><span class="kicker">{k}</span><h1>Why Handwriting Helps You Learn</h1><span class="sp"></span><span class="who"><span class="f">이름<u></u></span><span class="f">번호<u></u></span></span></section>'

    vocab = '<div class="vg">' + "".join(
        f'<div><span><b>{i+1}. {w}</b><i>{p}</i></span>' + (f'<span class="ans-t">{m}</span>' if ANS else '<span class="bl" style="min-width:0;margin:0;width:48%"></span>') + '</div>'
        for i, (w, p, m) in enumerate(VOC)) + "</div>"

    gram = [
        (2, "…you are forced ( to decide / deciding ) which ideas matter…", "be forced to + 동사원형 → to decide"),
        (4, "…the handwriters often did ( good / better ) on conceptual questions…", "비교 대상(타자 친 학생)이 있으므로 비교급 better"),
        (5, "…which lets information ( pass / to pass ) from the ears to the fingers…", "let + 목적어 + 동사원형 → pass"),
        (6, "…making them ( easier / easily ) to carry between classes.", "make + 목적어 + 형용사(보어) → easier"),
        (7, "…are not a flaw ( but / and ) a built-in filter…", "not A but B 구문 → but"),
    ]
    gram_html = "".join(
        f'<div><sup>{n}</sup>{t}<span class="r">{("<b class=ans-t>이유: " + why + "</b>") if ANS else "이유:"}</span></div>' for n, t, why in gram)

    judge = [(3, "①", "This quiet act of…", False), (4, "②", "Studies comparing…", False), (5, "③", "Typing tends to…", False),
             (6, "④", "Modern laptops have…", True), (7, "⑤", "In other words…", False)]
    judge_html = "".join(
        f'<div class="row"><sup class="n">{n}</sup><p>{c} {t}</p><span style="flex:1"></span>{opt("흐름에 맞음", not bad)} {opt("무관", bad)}</div>' for n, c, t, bad in judge)

    p1 = f'''<div class="pg">{hd("05번 · 샘플 · 1/2")}
<section class="card">{h2("scan_text","c-accent","준비 · 책 지문에 문장 번호 매기기")}
<div class="starts">{starts}</div></section>
<section class="card">{h2("compass","c-accent","STEP 1 · 글의 유형과 단서")}
<div class="row"><span class="label">유형</span><div class="opts">{opt("역설 주장 → 이유 → 재진술", True)}{opt("통념 → 반박 → 사례")}{opt("문제 → 해결")}{opt("원인 → 결과")}</div></div>
<div class="row"><span class="label">단서</span><p>글의 주제를 밝히는 <b class="k">첫 주장 문장</b> 번호 {bl("s","1")}번</p></div></section>
<section class="card"><h2>{chip("blueprint","c-accent")}STEP 2 · 글의 설계도 완성<small>번호는 위 준비 활동 기준</small></h2>
<div class="bpbar">
<div class="seg s0"><h4>서론<span>{bl("n","1")}~{bl("n","2")}번</span></h4>손필기는 {bl("s","느림")} 때문에 효과가 있다</div>
<div class="seg s1"><h4>본론<span>{bl("n","3")}~{bl("n","5")}번</span></h4>{bl("s","능동적")} 사고 → 연구 근거 → 타이핑은 {bl("s","처리")} 없이 지나감</div>
<div class="seg s2"><h4>결론<span>{bl("n","7")}번</span></h4>느림은 결함이 아닌 {bl("s","거름망")}</div></div></section>
<section class="card"><h2>{chip("map_pin","c-teal")}STEP 3 · 핵심 문장 찾기와 손해석<small>책의 지문에 밑줄 긋기</small></h2>
<div class="row"><span class="label">주제문</span><p>{bl("n","1")}번   <span class="hint">밑줄 그은 주제문을 옮겨 쓰고 해석한 뒤, 재진술문 번호와 문장을 쓰세요.</span></p></div>
<div class="row s3"><span class="hint">영문</span>{line(SENTS[0])}</div>
<div class="row s3"><span class="hint">해석</span>{line("손으로 필기하는 것은 속도를 늦추는데, 바로 그 점 때문에 효과가 있다.")}</div>
<div class="row" style="margin-top:4px"><span class="label">재진술문</span><p>{bl("n","7")}번</p>{line("In other words, the limits of handwriting are not a flaw but a built-in filter…","flex:1;height:23px")}</div></section>
<section class="card"><h2>{chip("arrow_left_right","c-rose")}STEP 4 · 연결어와 지칭 단서<small>책의 지문에서 찾아 쓰기</small></h2>
<div class="row"><sup class="n">2</sup><p>이유를 이끄는 접속사: {bl("","Because")}</p></div>
<div class="row"><sup class="n">3</sup><p><b class="k">This quiet act</b>가 가리키는 앞 내용: {bl("l","중요한 생각을 고르고 자기 말로 바꾸는 것")}</p></div>
<div class="row"><sup class="n">4</sup><p>양보를 나타내는 표현: {bl("","even though")}   더 긴 필기를 쓴 쪽: {bl("m","타자를 친 학생")}</p></div>
<div class="row"><sup class="n">7</sup><p>앞 내용을 다시 정리하는 표지: {bl("m","In other words")}</p></div></section>
<section class="card fill" style="display:flex;flex-direction:column"><h2>{chip("list_checks","c-rose")}STEP 5 · 무관한 문장 찾기<small>주제: 필기 방식과 이해 · ✓ 체크</small></h2>
{judge_html}
<div class="row" style="margin-top:2px"><span class="label">무관한 문장</span><p>{bl("n","6")}번 (책의 {bl("n","④")}번 선택지)</p></div></section></div>'''

    wr_chips = "".join(opt(c, h) for c, h in [("소재만 같음", True), ("논점 이탈", True), ("정반대", False), ("일부만", False)])
    p2 = f'''<div class="pg">{hd("05번 · 샘플 · 2/2")}
<section class="card"><h2>{chip("languages","c-teal")}STEP 6 · 수능 필수 Grammar Check<small>번호 = 책 지문의 문장 번호(첫 문장이 1번)</small></h2>
<div class="gc">{gram_html}</div></section>
<section class="card"><h2>{chip("list_checks","c-rose")}STEP 7 · 무관한 이유 쓰기<small>책의 선택지 ①~⑤를 보고 쓰기</small></h2>
<div class="row"><span class="label">정답</span><p>{bl("n","④")}번   앞뒤 문장과 어긋나는 문장 번호: {bl("n","6")}번</p></div>
<div class="row" style="margin-bottom:3px"><span class="label">이유 유형</span><div class="chips">{wr_chips}</div></div>
<div class="row s3"><span class="hint">이유</span>{line("노트북의 휴대성은 '필기 방식과 이해'라는 논점과 무관하다")}</div></section>
<section class="card">{h2("sparkles","c-violet","STEP 8 · 한 줄 요약")}
<div class="wb"><span class="label">보기</span><b>고르게</b><b>느림</b><b>그대로</b><b>이해</b></div>
<p style="margin:0;line-height:2">손필기는 {bl("s","느림")} 때문에 핵심을 {bl("s","고르게")} 만들어 {bl("s","이해")}를 깊게 하지만, 타이핑은 {bl("s","그대로")} 받아쓰기를 부추긴다.</p></section>
<section class="card">{h2("book_open","c-accent","Vocabulary Check")}{vocab}</section>
<section class="card fill" style="display:flex;flex-direction:column"><h2>{chip("history","c-rose")}STEP 9 · 서술형 영작<small>8~12단어 · be forced to, own words 포함</small></h2>
<p style="margin:0 0 3px">“학생은 핵심만 골라 자기 말로 바꿔 쓰게 된다”를 영어로 쓰시오.</p>
{('<div class="ln" style="flex:none"><b class="ans-t">모범: Students are forced to put key ideas into their own words.</b></div><div class="ln" style="flex:none"><b class="ans-t" style="font-size:10.5px;white-space:nowrap">인정: Students are forced to rewrite key ideas in their own words.</b></div><div style="margin-top:3px;font-size:10px;line-height:1.3;white-space:nowrap"><b class="ans-t">채점 기준</b> ① be forced to, own words 포함 ② 8~12단어 ③ 수 일치 ④ 의미 일치 → 표현이 달라도 ①~④ 충족 시 정답</div>') if ANS else '<div class="ln f"></div><div class="ln f"></div><div class="row" style="margin:4px 0 0"><span class="hint">셀프 체크</span>' + opt("be forced to") + opt("own words") + opt("8~12단어") + opt("수 일치") + opt("의미 일치") + '</div>'}</section></div>'''

    extra = KEY_CSS if ANS else ""
    return (f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>{g.BASE_CSS}</style><style>{g.CSS}</style><style>{g.PRINT_CSS}</style>'
            f'<style>{BASE_FONT}{WCSS}{extra}@media print{{.card{{padding:11px 14px!important}}.wrap{{gap:7px}}}}</style></head><body><main class="wrap">{p1}{p2}</main></body></html>')


open("data/worksheet-student.html", "w", encoding="utf-8").write(build(False))
open("data/worksheet-key.html", "w", encoding="utf-8").write(build(True))
print("ok")
