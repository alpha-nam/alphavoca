#!/usr/bin/env python3
"""
generate_html.py — render a passage-analysis JSON payload into a styled,
self-contained HTML "card" for Korean CSAT-style English reading passages.

Design: "Supa Resume" blue card system — light blue gradient background,
white rounded cards, Microsoft Fluent Emoji "Flat" style icons (solid-color
inline SVGs, MIT license, no colored chip/backdrop behind them) per
section/field, bold highlighter-style section labels, Light/Dark toggle
(client-side, no persistence needed — each render starts in Light). Icons
are fetched once per session from raw.githubusercontent.com and cached in
a sibling .icon_cache/ folder next to this script; if the sandbox is
offline the download silently fails and that chip just renders empty (no
crash).

Usage:
    python3 generate_html.py <input.json> <output.html>

Schema (see references/schema.md):
  title, source_ref, topic, main_idea,
  concept_sketch?: {title?, svg, caption?}  # hand-authored inline SVG illustrating
                                             # the passage's core concept or analogy
  order_flow?: [                            # 순서배열/문장삽입: macro block-order diagram
    {badge, text, given?: bool, link?: str}, ...
  ]                                          # link = connecting-clue label shown on the
                                             # arrow ABOVE this node (omit on first node)
  phrase_trace?: [                          # reference-tracing diagram (word-level clues)
    {source: str, text: str}, ...
  ]                                          # text supports **bold**, `code`, and
                                             # {{a|...}}/{{b|...}}/{{c|...}}/{{d|...}}
                                             # colored highlight spans (pair matching
                                             # referents with the same letter)
  blueprint?: {                              # 글의 설계도 (card near the top)
    text_type: {label, tip},                 # e.g. "통념 제시 → 반박 → 사례 논증" + where the answer clue sits
    signals?: [{word, no}],                  # discourse markers: but / For example / although ...
    structure: [{part, role, range:[a,b], desc}],  # 서론/본론/결론 over sentence numbers
    key_sentences: [{no, label, why}],       # 주제문 / 재진술 ... shown as ★ tag on that sentence card
    tricky: [{no, reason}]                   # 해석 주의 sentences, shown as ! tag + reason on that sentence card
  }
  given_sentence?: {english, translation}
  sentences: [
    {
      no?: int,                 # numbered badge (fallback "?") — ALWAYS the true
                                 # sequential position; never overridden by block_label
      block_label?: str,        # e.g. "①" — a circled-choice marker (grammar-error
                                 # question types), rendered inline in the English text
                                 # right before the first **bold** span, NOT as the badge
      english: str,              # supports **bold** and `code`
      translation: str,          # supports **bold** and `code`
      easy_explanation?: str,
      content_note?: str,
      grammar_points?: [str] | str,
      mini_analogy?: str,
      culture_note?: str,
      blank_marker_after?: str,  # e.g. "④" — renders a blank-slot marker after this card
      blank_is_target?: bool     # true = highlight as the correct blank slot
    }, ...
  ]
  summary: {
    logic_stages: [{stage, description}, ...],
    analogy?: {title, setup, misconception?, truth?, conclusion?},
    distractors: [{choice, reason}, ...],
    correct_answer: {choice, reason},
    vocabulary: [{word, meaning, pos?, synonym?}, ...],
    tips: [str, ...]
  }
  variant_questions?: {                     # 수능형 변형문제 추천 (지문 특성에 맞게 유연하게
                                             # 2~3개씩 선정 — 정해진 유형 목록에 얽매이지 말 것)
    multiple_choice?: [{type, stem, note?}, ...],
    written?: [{type, stem, note?}, ...]
  }
"""

import sys
import os
import json
import re
import html
import base64
import urllib.request


def esc(s):
    if s is None:
        return ""
    return html.escape(str(s), quote=False)


def inline_markup(text):
    """Escape text, then render **bold** and `code` spans."""
    if text is None:
        return ""
    text = str(text)
    # Split on **bold** first (non-greedy, keep delimiters via capture group)
    parts = re.split(r"\*\*(.+?)\*\*", text)
    escaped = [esc(p) if i % 2 == 0 else f"<b>{esc(p)}</b>" for i, p in enumerate(parts)]
    joined = "".join(escaped)
    # Then render `code` spans within the already-escaped string
    parts2 = re.split(r"`(.+?)`", joined)
    out = [p if i % 2 == 0 else f'<code>{p}</code>' for i, p in enumerate(parts2)]
    return "".join(out)


def trace_markup(text):
    """Like inline_markup, but also renders {{a|...}}/{{b|...}}/{{c|...}}/{{d|...}}
    as colored <mark> highlight spans (for pairing matching referents)."""
    if text is None:
        return ""
    text = str(text)
    out = []
    last = 0
    for m in re.finditer(r"\{\{(a|b|c|d)\|(.+?)\}\}", text):
        out.append(inline_markup(text[last:m.start()]))
        out.append(f'<mark class="{m.group(1)}">{esc(m.group(2))}</mark>')
        last = m.end()
    out.append(inline_markup(text[last:]))
    return "".join(out)


FLOW_COLORS = ["c-accent", "c-amber", "c-teal"]

# Microsoft Fluent Emoji, "Flat" style (MIT license) —
# https://github.com/microsoft/fluentui-emoji. Each chip/heading uses one of
# these icons instead of a letter initial or line-icon.
#
# NOTE on style choice: an earlier version of this script used the "3D"
# style (glossy, gradient-shaded PNGs). Even though those PNGs have
# perfectly clean alpha transparency (verified pixel-by-pixel — no halo,
# no baked-in shadow blob), the soft ambient shading/gradient that's part
# of the 3D art style itself reads as "fuzzy" / "not properly cut out" at
# the ~22-28px chip size this card uses — a real visual complaint, just not
# a transparency bug. The "Flat" style (solid-color SVGs, no gradient
# shading) reads as a crisp, unambiguous cutout at any size, so that's
# what's used now. SVGs are fetched as raw text (not PNG/base64) and
# inlined directly into the HTML — vector-sharp at every size, cached to
# disk after the first download so later renders this session don't
# re-fetch.
ICON_URLS = {
    'compass': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Compass/Flat/compass_flat.svg',
    'map_pin': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Round%20pushpin/Flat/round_pushpin_flat.svg',
    'smile': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Slightly%20smiling%20face/Flat/slightly_smiling_face_flat.svg',
    'sparkles': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Sparkles/Flat/sparkles_flat.svg',
    'book_open': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Open%20book/Flat/open_book_flat.svg',
    'quote': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bookmark%20tabs/Flat/bookmark_tabs_flat.svg',
    'list_ordered': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Repeat%20button/Flat/repeat_button_flat.svg',
    'scan_text': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Magnifying%20glass%20tilted%20right/Flat/magnifying_glass_tilted_right_flat.svg',
    'workflow': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Puzzle%20piece/Flat/puzzle_piece_flat.svg',
    'scale': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Balance%20scale/Flat/balance_scale_flat.svg',
    'arrow_left_right': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Left-right%20arrow/Flat/left-right_arrow_flat.svg',
    'list_checks': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Straight%20ruler/Flat/straight_ruler_flat.svg',
    'lightbulb': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Light%20bulb/Flat/light_bulb_flat.svg',
    'shuffle': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Shuffle%20tracks%20button/Flat/shuffle_tracks_button_flat.svg',
    'message_square': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Megaphone/Flat/megaphone_flat.svg',
    'languages': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Gear/Flat/gear_flat.svg',
    'history': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Scroll/Flat/scroll_flat.svg',
    'x': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cross%20mark/Flat/cross_mark_flat.svg',
    'check': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark/Flat/check_mark_flat.svg',
    'globe': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Globe%20with%20meridians/Flat/globe_with_meridians_flat.svg',
    'blueprint': 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Triangular%20ruler/Flat/triangular_ruler_flat.svg',
}

_ICON_SVG_CACHE = {}


def _icon_cache_dir():
    d = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".icon_cache")
    os.makedirs(d, exist_ok=True)
    return d


def icon_b64(name):
    """Fetch a Fluent Emoji Flat SVG's raw markup (cached on disk after the
    first download this session), with its own width/height attributes
    stripped so the .ico CSS class controls final size while the viewBox
    keeps it scaling correctly. Returns "" on any failure (offline, blocked
    host, unknown name) so a card still renders — just with an empty icon
    chip — instead of crashing. (Named icon_b64 for historical reasons —
    it now returns inline SVG markup, not base64.)"""
    if name in _ICON_SVG_CACHE:
        return _ICON_SVG_CACHE[name]
    url = ICON_URLS.get(name)
    if not url:
        return ""
    path = os.path.join(_icon_cache_dir(), f"{name}.svg")
    if not os.path.exists(path):
        try:
            urllib.request.urlretrieve(url, path)
        except Exception:
            return ""
    try:
        with open(path, "r", encoding="utf-8") as f:
            svg = f.read()
    except Exception:
        return ""
    svg = re.sub(r'\swidth="[^"]*"', '', svg, count=1)
    svg = re.sub(r'\sheight="[^"]*"', '', svg, count=1)
    svg = svg.replace("<svg ", '<svg class="ico" ', 1)
    _ICON_SVG_CACHE[name] = svg
    return svg


def icon_svg(name, size=22):
    """Returns the inline <svg> markup for a Fluent Emoji Flat icon, sized
    via the .ico CSS class (the size param is kept for call-site
    compatibility but actual sizing is CSS-driven)."""
    return icon_b64(name)


def chip(icon_name, cls):
    return f'<span class="chip {cls}">{icon_svg(icon_name)}</span>'


def h2(icon_name, cls, text):
    return f'<h2>{chip(icon_name, cls)}{inline_markup(text)}</h2>'


def field(icon_name, cls, label, content_html):
    if not content_html:
        return ""
    return f'''<div class="field">{chip(icon_name, cls)}<div><span class="label">{esc(label)}</span>{content_html}</div></div>'''


def grammar_list(points):
    if not points:
        return ""
    if isinstance(points, str):
        points = [points]
    items = "".join(f"<li>{inline_markup(p)}</li>" for p in points)
    return f"<ul>{items}</ul>"


def sentence_card(sent):
    no = sent.get("no", "?")
    block_label = sent.get("block_label")
    # The badge always shows the TRUE sequential sentence number — it must
    # never be replaced by block_label, or two different sentences (e.g.
    # no=1 with no block_label, and no=2 with block_label="①") end up
    # showing visually-similar badges ("1" vs "①") that read as duplicate
    # "sentence 1"s. block_label (the circled-choice marker for grammar-
    # error question types) is instead woven into the English text itself,
    # right before the first **bold** underlined phrase — matching how it
    # actually appears on a real CSAT answer sheet.
    badge_text = str(no)
    if isinstance(no, int):
        no_cls = FLOW_COLORS[(no - 1) % len(FLOW_COLORS)]
    else:
        no_cls = "c-accent"
    is_given = sent.get("_is_given", False)
    card_cls = "card given" if is_given else "card"

    en_html = inline_markup(sent.get("english", ""))
    if block_label:
        mark_html = f'<span class="choice-mark">{esc(block_label)}</span>'
        if "<b>" in en_html:
            en_html = en_html.replace("<b>", mark_html + "<b>", 1)
        else:
            en_html = mark_html + " " + en_html

    translation = sent.get("translation", "")
    easy = sent.get("easy_explanation", "")
    content_note = sent.get("content_note", "")
    mini_analogy = sent.get("mini_analogy", "")
    culture_note = sent.get("culture_note", "")

    fields = [
        field("globe", "c-accent", "해석", f'<p>{inline_markup(translation)}</p>' if translation else ""),
        field("smile", "c-green", "쉬운 설명", f'<p>{inline_markup(easy)}</p>' if easy else ""),
        field("message_square", "c-amber", "내용 해설", f'<p>{inline_markup(content_note)}</p>' if content_note else ""),
        field("languages", "c-teal", "문법·구문", grammar_list(sent.get("grammar_points"))),
        field("scale", "c-violet", "미니 비유", f'<p>{inline_markup(mini_analogy)}</p>' if mini_analogy else ""),
        field("history", "c-rose", "배경지식·뉘앙스", f'<p>{inline_markup(culture_note)}</p>' if culture_note else ""),
    ]
    fields_html = "".join(f for f in fields if f)

    tags = []
    if sent.get("_key"):
        tags.append(f'<span class="stag key">★ {esc(sent["_key"][0])}</span>')
        if sent["_key"][1]:
            tags.append(f'<span class="stag-note">{inline_markup(sent["_key"][1])}</span>')
    if sent.get("_tricky"):
        tags.append(f'<span class="stag warn">! 해석 주의</span><span class="stag-note">{inline_markup(sent["_tricky"])}</span>')
    tags_html = f'<div class="stags">{"".join(tags)}</div>' if tags else ""

    card = f'''<section class="{card_cls}">
  <div class="sent">
    <div class="sent-top"><span class="no {no_cls}">{esc(badge_text)}</span>
      <p class="en">{en_html}</p></div>
    {tags_html}
    <div class="fields">{fields_html}</div>
  </div>
</section>'''

    marker = ""
    blank = sent.get("blank_marker_after")
    if blank:
        target = sent.get("blank_is_target")
        if target:
            marker = f'<div class="blank-marker target">( {esc(blank)} ) ← 주어진 문장이 들어갈 자리</div>'
        else:
            marker = f'<div class="blank-marker">( {esc(blank)} )</div>'

    return card + marker


def render_given_sentence(gs):
    if not gs:
        return ""
    return f'''<section class="card">
  {h2("quote", "c-amber", "주어진 문장")}
  <p class="given-en">"{inline_markup(gs.get("english", ""))}"</p>
  <p class="tr">{inline_markup(gs.get("translation", ""))}</p>
</section>'''


def render_blueprint(bp, n_sent=0):
    """글의 설계도: text-type tag + intro/body/conclusion bar (with sentence-number rail,
    key-sentence star, tricky-sentence warning) + key / tricky lists."""
    if not bp:
        return ""
    tt = bp.get("text_type") or {}
    structure = bp.get("structure") or []
    keys = {k.get("no"): k for k in (bp.get("key_sentences") or [])}
    tricky = {k.get("no"): k for k in (bp.get("tricky") or [])}

    type_html = ""
    if tt:
        sig = "".join(f'<span class="bp-sig"><b>{esc(x.get("word",""))}</b>{esc(x.get("no",""))}번</span>' for x in (bp.get("signals") or []))
        sig_html = f'<div class="bp-sigs"><span class="bp-sig-title">단서 표현</span>{sig}</div>' if sig else ""
        type_html = f'''<div class="bp-type"><span class="bp-pill">{esc(tt.get("label",""))}</span><p class="bp-tip">{inline_markup(tt.get("tip",""))}</p></div>{sig_html}'''

    segs = []
    for i, st in enumerate(structure):
        a, b = (st.get("range") or [0, 0])[0], (st.get("range") or [0, 0])[-1]
        nums = []
        for n in range(a, b + 1):
            cls = "bp-no" + (" key" if n in keys else "") + (" warn" if n in tricky else "")
            nums.append(f'<span class="{cls}">{n}</span>')
        rng = f"{a}번" if a == b else f"{a}–{b}번"
        segs.append(f'''<div class="bp-seg seg{i % 3}" style="flex:{max(b - a + 1, 1.8)} 1 0">
  <div class="bp-seg-top"><b>{esc(st.get("part",""))}</b><span class="rng">{rng}</span></div>
  <div class="bp-role">{esc(st.get("role",""))}</div>
  <div class="bp-nums">{"".join(nums)}</div>
  <p>{inline_markup(st.get("desc",""))}</p>
</div>''')
    bar_html = f'<div class="bp-bar">{"".join(segs)}</div><div class="bp-legend"><span><i class="bp-no key">★</i> 핵심 문장</span><span><i class="bp-no warn">!</i> 해석 주의</span></div>' if segs else ""

    def lst(items, kind):
        out = []
        for it in items:
            label = it.get("label") or ("해석 주의" if kind == "warn" else "")
            txt = it.get("why") or it.get("reason") or ""
            out.append(f'<div class="bp-item"><span class="bp-no {kind}">{esc(it.get("no",""))}</span><div><b>{esc(label)}</b><p>{inline_markup(txt)}</p></div></div>')
        return "".join(out)
    cols = []
    if keys:
        cols.append(f'<div class="bp-col"><span class="label">핵심 문장</span>{lst(bp.get("key_sentences") or [], "key")}</div>')
    if tricky:
        cols.append(f'<div class="bp-col"><span class="label">해석 주의 문장</span>{lst(bp.get("tricky") or [], "warn")}</div>')
    cols_html = f'<div class="bp-cols">{"".join(cols)}</div>' if cols else ""

    return f'''<section class="card bp">
  {h2("blueprint", "c-accent", "글의 설계도")}
  {type_html}
  {bar_html}
</section>'''


def render_concept_sketch(sketch):
    if not sketch:
        return ""
    title = sketch.get("title", "")
    caption = sketch.get("caption", "")
    svg = sketch.get("svg", "")
    if not svg:
        return ""
    title_html = f'<p class="sketch-title">{inline_markup(title)}</p>' if title else ""
    caption_html = f'<p class="sketch-caption">{inline_markup(caption)}</p>' if caption else ""
    return f'''<section class="card">
  {h2("sparkles", "c-teal", "개념 스케치")}
  {title_html}
  <div class="sketch-svg">{svg}</div>
  {caption_html}
</section>'''


def render_vocabulary(vocab):
    if not vocab:
        return ""
    items = []
    for v in vocab:
        word = esc(v.get("word", ""))
        pos = v.get("pos")
        meaning = inline_markup(v.get("meaning", ""))
        synonym = v.get("synonym")
        pos_html = f'<i>{esc(pos)}</i>' if pos else ""
        meaning_line = f'{meaning} · {esc(synonym)}' if synonym else meaning
        items.append(f'<div class="word"><b>{word}</b>{pos_html}<div>{meaning_line}</div></div>')
    return f'''<section class="card">
  {h2("book_open", "c-accent", "핵심 어휘")}
  <div class="vocab">{"".join(items)}</div>
</section>'''


def render_order_flow(flow):
    if not flow:
        return ""
    items = []
    for i, node in enumerate(flow):
        badge = node.get("badge", "")
        text = node.get("text", "")
        given = node.get("given", False)
        link = node.get("link")
        if i > 0:
            if link:
                items.append(f'<div class="flow-connector"><span class="arrow">↓</span><span class="lbl">{inline_markup(link)}</span></div>')
            else:
                items.append('<div class="flow-connector"><span class="arrow">↓</span></div>')
        pill_cls = "c-amber" if given else "c-accent"
        items.append(f'<div class="step"><span class="pill {pill_cls}">{esc(badge)}</span><p>{inline_markup(text)}</p></div>')
    return f'''<section class="card">
  {h2("list_ordered", "c-teal", "순서 흐름")}
  <div class="flow">{"".join(items)}</div>
</section>'''


def render_phrase_trace(trace):
    if not trace:
        return ""
    items = []
    for i, t in enumerate(trace):
        source = t.get("source", "")
        text = t.get("text", "")
        if i > 0:
            items.append('<div class="flow-connector"><span class="arrow">↓</span><span class="lbl">같은 대상</span></div>')
        items.append(f'<div class="trace-item"><span class="src">{esc(source)}</span><p>{trace_markup(text)}</p></div>')
    return f'''<section class="card">
  {h2("arrow_left_right", "c-rose", "표현 연결 (지시어 추적)")}
  <div class="trace-list">{"".join(items)}</div>
</section>'''


def render_logic_stages(stages):
    if not stages:
        return ""
    items = []
    for i, s in enumerate(stages):
        cls = FLOW_COLORS[i % len(FLOW_COLORS)]
        items.append(f'<div class="step"><span class="pill {cls}">{esc(s.get("stage",""))}</span><p>{inline_markup(s.get("description",""))}</p></div>')
    return f'''<section class="card">
  {h2("workflow", "c-teal", "논리 흐름")}
  <div class="flow">{"".join(items)}</div>
</section>'''


def render_analogy(analogy):
    if not analogy:
        return ""
    title = analogy.get("title", "")
    setup = analogy.get("setup", "")
    misconception = analogy.get("misconception", "")
    truth = analogy.get("truth", "")
    conclusion = analogy.get("conclusion", "")

    compare_html = ""
    if misconception or truth:
        compare_html = f'''<div class="vs">
  <div class="a"><span class="label">통념</span><p>{inline_markup(misconception)}</p></div>
  <div class="b"><span class="label">이 글의 주장(진실)</span><p>{inline_markup(truth)}</p></div>
</div>'''
    setup_html = f'<p class="sub">{inline_markup(setup)}</p>' if setup else ""
    conclusion_html = f'<p class="closing">{inline_markup(conclusion)}</p>' if conclusion else ""

    return f'''<section class="card">
  {h2("scale", "c-amber", title or "티칭 포인트: 비유")}
  {setup_html}
  {compare_html}
  {conclusion_html}
</section>'''


def render_answer(summary):
    correct = summary.get("correct_answer") or {}
    distractors = summary.get("distractors") or []
    if not correct and not distractors:
        return ""

    rows = []
    for d in distractors:
        rows.append(f'<div class="opt"><span class="chip c-rose">{icon_svg("x")}</span><div><strong>{inline_markup(d.get("choice",""))}</strong><span>{inline_markup(d.get("reason",""))}</span></div></div>')
    if correct:
        rows.append(f'<div class="opt ok"><span class="chip c-violet">{icon_svg("check")}</span><div><strong>{inline_markup(correct.get("choice",""))}</strong><span>{inline_markup(correct.get("reason",""))}</span></div></div>')

    return f'''<section class="card">
  {h2("list_checks", "c-rose", "정답과 오답 분석")}
  <div class="ans">{"".join(rows)}</div>
</section>'''


def render_tips(tips):
    if not tips:
        return ""
    items = "".join(f'<div class="field">{chip("lightbulb","c-green")}<div><p>{inline_markup(t)}</p></div></div>' for t in tips)
    return f'''<section class="card">
  {h2("lightbulb", "c-green", "수업 팁")}
  <div class="tip-list">{items}</div>
</section>'''


def render_variant_questions(vq):
    if not vq:
        return ""
    mc = vq.get("multiple_choice") or []
    wr = vq.get("written") or []
    if not mc and not wr:
        return ""

    def item(it, pill_cls):
        note = it.get("note", "")
        note_html = f'<p class="note">{inline_markup(note)}</p>' if note else ""
        return f'<div class="vitem"><span class="pill {pill_cls}">{esc(it.get("type",""))}</span><div><p class="stem">{inline_markup(it.get("stem",""))}</p>{note_html}</div></div>'

    groups = []
    if mc:
        groups.append(f'<div class="vgroup"><span class="vgroup-title">객관식 변형</span>{"".join(item(i, "c-accent") for i in mc)}</div>')
    if wr:
        groups.append(f'<div class="vgroup"><span class="vgroup-title">서술형 변형</span>{"".join(item(i, "c-amber") for i in wr)}</div>')

    return f'''<section class="card">
  {h2("shuffle", "c-rose", "수능형 변형문제 추천")}
  {"".join(groups)}
</section>'''


BASE_CSS = """
:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#faf9f5;color:#141413}
img{max-width:100%}
[hidden]:not([hidden=until-found i]){display:none!important}
"""

CSS = """
:root{
  --bg:#F2F6FD; --bg-glow:#D9E6FF; --sheet:#FFFFFF; --sheet-2:#F8FAFF;
  --fg:#131A2B; --muted:#5F6B85; --line:#E1E8F5;
  --accent:#1F6BFF; --accent-soft:#E6EFFF; --accent-ink:#0B4FCC;
  --amber:#F59E0B; --amber-soft:#FFF5DC;
  --teal:#0EA5A4; --teal-soft:#DFF6F5;
  --rose:#E5484D; --rose-soft:#FFE9EA;
  --green:#12A150; --green-soft:#DFF7E8;
  --violet:#7C5CFC; --violet-soft:#EEE9FF;
  --code-bg:#E6EFFF; --code-fg:#0B4FCC;
  --shadow:0 1px 2px rgba(20,60,160,.06),0 8px 24px rgba(20,60,160,.07);
  --font-display:"Plus Jakarta Sans","Noto Sans KR",system-ui,sans-serif;
  --font-body:"Noto Sans KR","Plus Jakarta Sans",system-ui,sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#0B1222; --bg-glow:#14336E; --sheet:#131B33; --sheet-2:#19233F;
  --fg:#EEF3FF; --muted:#9AA8C7; --line:#25325A;
  --accent:#6FA2FF; --accent-soft:#182E5C; --accent-ink:#B8D0FF;
  --amber:#FBBF24; --amber-soft:#3A2F14;
  --teal:#2DD4BF; --teal-soft:#123A3A;
  --rose:#FF7A80; --rose-soft:#3C1B22;
  --green:#4ADE80; --green-soft:#16391F;
  --violet:#A78BFA; --violet-soft:#2C2154;
  --code-bg:#182E5C; --code-fg:#CFE0FF;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 28px rgba(0,0,0,.35);
  color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0B1222; --bg-glow:#14336E; --sheet:#131B33; --sheet-2:#19233F;
  --fg:#EEF3FF; --muted:#9AA8C7; --line:#25325A;
  --accent:#6FA2FF; --accent-soft:#182E5C; --accent-ink:#B8D0FF;
  --amber:#FBBF24; --amber-soft:#3A2F14;
  --teal:#2DD4BF; --teal-soft:#123A3A;
  --rose:#FF7A80; --rose-soft:#3C1B22;
  --green:#4ADE80; --green-soft:#16391F;
  --violet:#A78BFA; --violet-soft:#2C2154;
  --code-bg:#182E5C; --code-fg:#CFE0FF;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 28px rgba(0,0,0,.35);
  color-scheme:dark}

*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font-family:var(--font-body);font-size:14px;line-height:1.7;
  background-image:radial-gradient(900px 420px at 15% -10%,var(--bg-glow),transparent 70%),radial-gradient(700px 380px at 100% 0%,var(--accent-soft),transparent 70%);
  background-repeat:no-repeat;
  word-break:keep-all;overflow-wrap:break-word;line-break:strict}
.wrap{max-width:850px;margin-inline:auto;padding-inline:16px;padding-block:20px 32px;display:flex;flex-direction:column;gap:16px}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;font-size:12.5px;color:var(--muted)}
.bar b{color:var(--fg);font-weight:700}
.toggle{display:inline-flex;background:var(--sheet);border:1px solid var(--line);border-radius:999px;padding:3px;box-shadow:var(--shadow)}
.toggle button{font:inherit;font-weight:700;font-size:12.5px;border:0;background:none;color:var(--muted);padding:6px 14px;border-radius:999px;cursor:pointer}
.toggle button[aria-pressed="true"]{background:var(--accent);color:#fff}
.toggle button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

.card{background:var(--sheet);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:var(--shadow)}
.head{display:flex;flex-direction:column;gap:12px;padding:28px 24px}
.kicker{display:inline-flex;align-self:flex-start;gap:8px;align-items:center;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:.04em;color:var(--accent-ink);background:var(--accent-soft);padding:5px 12px;border-radius:999px}
h1{font-family:var(--font-display);font-size:clamp(24px,5vw,32px);line-height:1.25;margin:0;font-weight:800;letter-spacing:-.02em;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.intro{margin:0;color:var(--muted);max-width:62ch}

.chip{flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:14px}
.ico{width:24px;height:24px;display:block}
.c-accent{background:var(--accent-soft);color:var(--accent-ink)}
.c-amber{background:var(--amber-soft);color:var(--amber)}
.c-teal{background:var(--teal-soft);color:var(--teal)}
.c-rose{background:var(--rose-soft);color:var(--rose)}
.c-green{background:var(--green-soft);color:var(--green)}
.c-violet{background:var(--violet-soft);color:var(--violet)}
/* Icon chips render the bare Flat-style icon with no colored square/backdrop
   behind it (no "chip"), per explicit user request — the color classes above
   still supply background+color for non-icon uses (.pill tags, .no badges),
   so this override (two classes beats one on specificity) strips just the
   chip's own background/radius while leaving those other uses untouched. */
.chip.c-accent,.chip.c-amber,.chip.c-teal,.chip.c-rose,.chip.c-green,.chip.c-violet{background:transparent;border-radius:0}
.label{font-family:var(--font-display);font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--fg);display:inline-block;padding:0 2px 2px;margin-left:-2px;background-image:linear-gradient(var(--accent-soft),var(--accent-soft));background-repeat:no-repeat;background-size:100% 42%;background-position:0 92%}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:16px}
.mini{display:flex;gap:14px;align-items:flex-start}
.mini > div{min-width:0}
.mini p{margin:4px 0 0;font-weight:700;font-size:15px;line-height:1.55}
.mini.wide{width:100%}

h2{font-family:var(--font-display);font-size:18px;margin:0 0 14px;font-weight:800;display:flex;gap:10px;align-items:center}
code{font-family:var(--font-display);font-weight:700;font-size:.92em;background:var(--code-bg);color:var(--code-fg);padding:1px 7px;border-radius:6px}

.sent{display:flex;flex-direction:column;gap:14px}
.sent-top{display:flex;gap:14px;align-items:flex-start}
.no{flex:none;width:28px;height:28px;padding:0;border-radius:50%;display:grid;place-items:center;font-family:var(--font-display);font-weight:800;font-size:12.5px;margin-top:2px;color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.15);box-shadow:0 2px 5px rgba(15,40,120,.28),inset 0 1px 1px rgba(255,255,255,.5),inset 0 -2px 3px rgba(0,0,0,.12)}
.no.c-accent{background:linear-gradient(155deg,color-mix(in srgb,var(--accent) 65%,white) 0%,var(--accent) 55%,color-mix(in srgb,var(--accent) 78%,black) 100%)}
.no.c-amber{background:linear-gradient(155deg,color-mix(in srgb,var(--amber) 65%,white) 0%,var(--amber) 55%,color-mix(in srgb,var(--amber) 78%,black) 100%)}
.no.c-teal{background:linear-gradient(155deg,color-mix(in srgb,var(--teal) 65%,white) 0%,var(--teal) 55%,color-mix(in srgb,var(--teal) 78%,black) 100%)}
.choice-mark{display:inline-block;font-weight:800;color:var(--accent-ink);margin-right:2px}
.en{font-family:var(--font-display);font-weight:500;font-size:16px;line-height:1.6;margin:0;min-width:0}
.tr{margin:0;padding:12px 14px;background:var(--sheet-2);border:1px solid var(--line);border-radius:12px;font-weight:500}
.given-en{font-weight:700;font-style:italic;margin:0 0 10px;font-size:16px;color:var(--fg)}
.fields{display:grid;gap:10px}
.field{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:12px 14px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line)}
.field .chip{width:28px;height:28px;border-radius:8px;font-size:12px}
.field ul{margin:0;padding-left:1.1em}
.field p{margin:0}
.field .label{display:inline-block;margin-bottom:2px}
.field > div{min-width:0}
.card.given{border-color:var(--amber)}

.flow{display:grid;gap:10px}
.step{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:12px 14px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line)}
.pill{font-family:var(--font-display);font-weight:800;font-size:12px;padding:4px 12px;border-radius:999px;white-space:nowrap}
.step p{margin:0;min-width:0}
.flow-connector{display:flex;flex-direction:column;align-items:center;gap:2px;padding:2px 0}
.flow-connector .arrow{color:var(--muted);font-size:14px;line-height:1}
.flow-connector .lbl{font-size:11px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);padding:2px 10px;border-radius:999px}

.vs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:12px;margin-block:12px}
.vs > div{border-radius:16px;padding:16px}
.vs .a{background:var(--amber-soft)} .vs .b{background:var(--teal-soft)}
.vs .label{color:inherit;margin-bottom:6px;display:inline-block}
.vs .a .label{color:var(--amber)} .vs .b .label{color:var(--teal)}
.vs p{margin:0;font-weight:500}
.closing{margin:0;font-weight:800;color:var(--accent-ink)}
.sub{margin:0 0 4px;color:var(--muted)}

.ans{display:grid;gap:10px}
.opt{display:grid;grid-template-columns:auto 1fr;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--sheet-2)}
.opt.ok{background:var(--green-soft);border-color:transparent}
.opt strong{display:block;font-weight:700}
.opt span{color:var(--muted)}
.opt.ok span{color:var(--fg)}

.vocab{display:flex;flex-wrap:wrap;gap:10px}
.word{padding:10px 14px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line);min-width:0}
.word b{font-family:var(--font-display);font-weight:800}
.word i{font-style:normal;font-size:11px;color:var(--accent-ink);background:var(--accent-soft);border-radius:6px;padding:1px 6px;margin-left:6px;font-weight:700}
.word div{color:var(--muted);font-size:13px}

.sketch-title{font-weight:700;color:var(--fg);margin:0 0 10px;font-size:15px}
.sketch-svg{display:flex;justify-content:center;margin:4px 0}
.sketch-svg svg{width:100%;max-width:100%;height:auto;display:block}
.sketch-caption{margin:10px 0 0;color:var(--muted);font-size:12.5px;text-align:center}

.trace-list{display:grid;gap:10px}
.trace-item{display:grid;gap:4px;padding:12px 14px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line)}
.trace-item .src{font-size:11px;color:var(--muted)}
.trace-item p{margin:0}
mark.a{background:var(--accent-soft);color:var(--fg);padding:0 4px;border-radius:5px}
mark.b{background:var(--amber-soft);color:var(--fg);padding:0 4px;border-radius:5px}
mark.c{background:var(--teal-soft);color:var(--fg);padding:0 4px;border-radius:5px}
mark.d{background:var(--rose-soft);color:var(--fg);padding:0 4px;border-radius:5px}

.blank-marker{text-align:center;font-size:12.5px;font-weight:700;color:var(--muted);padding:4px 0}
.blank-marker.target{color:var(--rose);border:2px dashed var(--rose);background:var(--rose-soft);border-radius:12px;padding:8px;margin:2px 0}

.tip-list{display:grid;gap:10px}
.tip-list .chip{width:28px;height:28px;border-radius:8px;font-size:12px}

.vgroup{display:grid;gap:10px;margin-bottom:14px}
.vgroup:last-child{margin-bottom:0}
.vgroup-title{justify-self:start;width:fit-content;font-family:var(--font-display);font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--fg);display:inline-block;padding:0 2px 2px;margin-left:-2px;background-image:linear-gradient(var(--accent-soft),var(--accent-soft));background-repeat:no-repeat;background-size:100% 42%;background-position:0 92%}
.vitem{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:12px 14px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line)}
.vitem p.stem{margin:0;font-weight:600;font-style:italic}
.vitem p.note{margin:4px 0 0;color:var(--muted);font-size:12.5px}

.bp-type{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.bp-pill{font-family:var(--font-display);font-weight:800;font-size:15px;padding:7px 16px;border-radius:999px;background:var(--accent);color:var(--sheet)}
.bp-tip{margin:0;flex:1 1 260px;color:var(--muted);min-width:0}
.bp-sigs{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
.bp-sig-title{font-size:12px;font-weight:800;color:var(--muted);margin-right:2px}
.bp-sig{font-size:12.5px;padding:3px 10px;border-radius:999px;background:var(--sheet-2);border:1px solid var(--line)}
.bp-sig b{font-family:var(--font-display);margin-right:5px;color:var(--accent-ink)}
.bp-bar{display:flex;gap:8px;margin-top:16px;align-items:stretch}
.bp-seg{border-radius:16px;padding:12px 14px;border:1.5px solid;min-width:0}
.bp-seg.seg0{background:var(--accent-soft);border-color:var(--accent)}
.bp-seg.seg1{background:var(--amber-soft);border-color:var(--amber)}
.bp-seg.seg2{background:var(--teal-soft);border-color:var(--teal)}
.bp-seg-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.bp-seg-top b{font-family:var(--font-display);font-size:16px;font-weight:800}
.bp-seg .rng{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap}
.bp-role{font-weight:700;font-size:13px;margin-top:2px}
.bp-nums{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 8px}
.bp-seg p{margin:0;font-size:12.5px;color:var(--fg);line-height:1.5}
.bp-no{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;font-family:var(--font-display);font-weight:800;font-size:12.5px;background:var(--sheet);border:1.5px solid var(--line);color:var(--fg);font-style:normal;position:relative}
.bp-no.key{background:var(--accent);border-color:var(--accent);color:var(--sheet)}
.bp-no.warn{border-color:var(--rose);color:var(--fg);background:var(--rose-soft)}
.bp-no.key.warn{background:var(--accent);color:var(--sheet);box-shadow:0 0 0 2.5px var(--rose)}
.bp-nums .bp-no.key::after{content:"★";position:absolute;top:-9px;right:-7px;font-size:12px;color:var(--amber)}
.bp-nums .bp-no.warn::before{content:"!";position:absolute;bottom:-7px;right:-6px;width:14px;height:14px;border-radius:50%;background:var(--rose);color:var(--sheet);font-size:10px;line-height:14px;text-align:center}
.bp-legend{display:flex;gap:16px;margin-top:10px;font-size:12px;color:var(--muted)}
.bp-legend span{display:inline-flex;gap:6px;align-items:center}
.bp-legend .bp-no{width:20px;height:20px;font-size:11px}
.bp-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px;margin-top:16px}
.bp-col{display:grid;gap:8px;align-content:start}
.bp-col .label{justify-self:start;width:fit-content}
.bp-item{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:10px 12px;border-radius:14px;background:var(--sheet-2);border:1px solid var(--line)}
.bp-item b{font-size:13px}
.bp-item p{margin:2px 0 0;font-size:13px;color:var(--muted);line-height:1.55}
.stags{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:-4px 0 0 42px}
.stag{font-family:var(--font-display);font-weight:800;font-size:12px;padding:3px 11px;border-radius:999px}
.stag.key{background:var(--accent);color:var(--sheet)}
.stag.warn{background:var(--rose-soft);color:var(--fg);border:1.5px solid var(--rose)}
.stag-note{font-size:12.5px;color:var(--muted)}
.print-btn{font:inherit;font-weight:700;font-size:12.5px;border:1px solid var(--line);background:var(--sheet);color:var(--accent-ink);padding:6px 14px;border-radius:999px;cursor:pointer;box-shadow:var(--shadow)}
.print-btn:hover{background:var(--accent-soft)}
"""

# Print-specific overrides, appended as its OWN <style> tag after the main
# CSS so it wins the cascade (same selector specificity, later source order)
# even when the OS is in dark mode while printing. Goals: force the light
# palette (dark-on-paper and glow gradients waste ink / print illegibly on
# some printers), drop the on-screen toolbar and shadows, and keep each
# card/field/sentence block from splitting across a page break. This CSS
# backs BOTH the user's own browser print-to-PDF (File > Print > Save as
# PDF / the in-page "인쇄 / PDF" button) and the Playwright page.pdf() step
# in the pipeline, since Chromium applies @media print rules for both.
PRINT_CSS = """
@media print{
  :root{
    --bg:#FFFFFF;--bg-glow:#FFFFFF;--sheet:#FFFFFF;--sheet-2:#F6F7FA;
    --fg:#131A2B;--muted:#5F6B85;--line:#D9DEE8;
    --accent:#1F6BFF;--accent-soft:#E6EFFF;--accent-ink:#0B4FCC;
    --amber:#B45309;--amber-soft:#FFF5DC;
    --teal:#0B7A79;--teal-soft:#DFF6F5;
    --rose:#C3272C;--rose-soft:#FFE9EA;
    --green:#0F7A3D;--green-soft:#DFF7E8;
    --violet:#5B3FD6;--violet-soft:#EEE9FF;
    --code-bg:#E6EFFF;--code-fg:#0B4FCC;
    --shadow:none;color-scheme:light}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
  body{background:#fff!important;background-image:none!important}
  .bar{display:none!important}
  .wrap{max-width:100%;padding:0;gap:8px}
  .card{box-shadow:none!important;padding:16px}
  .card,.step,.field,.opt,.vitem,.trace-item,.word,.given-en,.blank-marker,.bp-seg,.bp-item{break-inside:avoid}
  .card:has(.sent),.card.bp{break-inside:auto}
  .sent-top{break-inside:avoid;break-after:avoid}
  h1,h2{break-after:avoid}
  .sketch-svg svg{max-height:92vh}
}
@page{size:A4;margin:8mm 8mm}
"""

TOGGLE_SCRIPT = """<script>
(function(){
  var root=document.documentElement, L=document.getElementById('t-light'), D=document.getElementById('t-dark'), P=document.getElementById('t-print');
  function set(t){root.setAttribute('data-theme',t);L.setAttribute('aria-pressed',t==='light');D.setAttribute('aria-pressed',t==='dark');}
  L.addEventListener('click',function(){set('light')});
  D.addEventListener('click',function(){set('dark')});
  if(P){P.addEventListener('click',function(){window.print()});}
})();
</script>"""


def build_html(data):
    title = data.get("title", "")
    source_ref = data.get("source_ref", "")
    topic = data.get("topic", "")
    main_idea = data.get("main_idea", "")
    eli5 = data.get("eli5", "")
    summary = data.get("summary", {}) or {}
    vocabulary = summary.get("vocabulary")

    kicker_html = f'<span class="kicker">{esc(source_ref)}</span>' if source_ref else ""

    two_items = [
        f'<section class="card mini">{chip("compass","c-accent")}<div><span class="label">주제 Topic</span><p>{inline_markup(topic)}</p></div></section>',
        f'<section class="card mini">{chip("map_pin","c-teal")}<div><span class="label">요지 Main idea</span><p>{inline_markup(main_idea)}</p></div></section>',
    ]
    two_html = f'<div class="two">{"".join(two_items)}</div>'

    eli5_html = ""
    if eli5:
        eli5_html = f'<section class="card mini wide">{chip("smile","c-green")}<div><span class="label">쉬운 설명</span><p>{inline_markup(eli5)}</p></div></section>'

    bp = data.get("blueprint")
    blueprint_html = render_blueprint(bp)
    _keys = {k.get("no"): (k.get("label", "핵심 문장"), k.get("why", "")) for k in ((bp or {}).get("key_sentences") or [])}
    _tricky = {k.get("no"): k.get("reason", "") for k in ((bp or {}).get("tricky") or [])}
    for _s in data.get("sentences", []):
        if _s.get("no") in _keys:
            _s["_key"] = _keys[_s["no"]]
        if _s.get("no") in _tricky:
            _s["_tricky"] = _tricky[_s["no"]]
    sketch_html = render_concept_sketch(data.get("concept_sketch"))
    vocab_html = render_vocabulary(vocabulary)
    given_html = render_given_sentence(data.get("given_sentence"))
    order_flow_html = render_order_flow(data.get("order_flow"))

    sentence_heading = f'<h2>{chip("scan_text","c-accent")}문장별 분석</h2>'
    sentence_cards = "".join(sentence_card(s) for s in data.get("sentences", []))

    logic_html = render_logic_stages(summary.get("logic_stages"))
    analogy_html = render_analogy(summary.get("analogy"))
    phrase_trace_html = render_phrase_trace(data.get("phrase_trace"))
    answer_html = render_answer(summary)
    tips_html = render_tips(summary.get("tips"))
    variant_html = render_variant_questions(data.get("variant_questions"))

    body = f'''<main class="wrap">
  <div class="bar">
    <span><b>{esc(title)}</b></span>
    <div class="toggle" role="group" aria-label="테마">
      <button type="button" id="t-light" aria-pressed="true">Light</button>
      <button type="button" id="t-dark" aria-pressed="false">Dark</button>
    </div>
    <button type="button" id="t-print" class="print-btn">인쇄 / PDF</button>
  </div>

  <section class="card head">
    {kicker_html}
    <h1>{esc(title)}</h1>
  </section>

  {two_html}
  {eli5_html}
  {blueprint_html}
  {sketch_html}
  {vocab_html}
  {given_html}
  {order_flow_html}

  {sentence_heading}
  {sentence_cards}

  {logic_html}
  {analogy_html}
  {phrase_trace_html}
  {answer_html}
  {tips_html}
  {variant_html}
</main>'''

    full_body = body + "\n" + TOGGLE_SCRIPT

    return f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap">
<style>{BASE_CSS}</style>
<style>{CSS}</style>
<style>{PRINT_CSS}</style>
</head>
<body>
{full_body}
</body>
</html>'''


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate_html.py <input.json> <output.html>")
        sys.exit(1)
    in_path, out_path = sys.argv[1], sys.argv[2]
    with open(in_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    html_out = build_html(data)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html_out)
    print(f"Created: {out_path}")


if __name__ == "__main__":
    main()
