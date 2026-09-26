(function () {
  "use strict";
  var EXAMS = window.EXAMS || {};
  var MAX_DAY = 30;
  var app = document.getElementById("app");
  var EXAM = null, flat = [], total = 0, KEY = "";

  var state = { view: "days", day: 0, cur: 0, answers: {}, filter: "all" };

  function selectDay(n) {
    state.day = n;
    EXAM = EXAMS[n];
    flat = [];
    EXAM.sections.forEach(function (s, si) {
      s.questions.forEach(function (q) { flat.push({ q: q, si: si, s: s }); });
    });
    total = flat.length;
    KEY = "vocab-exam-day" + n + "-v1";
    state.cur = 0; state.answers = {}; state.filter = "all";
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.answers) { state.answers = d.answers; state.cur = d.cur || 0; }
      }
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ answers: state.answers, cur: state.cur })); } catch (e) {}
  }
  function dayProgress(n) {
    try {
      var d = JSON.parse(localStorage.getItem("vocab-exam-day" + n + "-v1"));
      return d && d.answers ? Object.keys(d.answers).length : 0;
    } catch (e) { return 0; }
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function stem(s) {
    return esc(s).replace(/&lt;&lt;(.+?)&gt;&gt;/g, "<u>$1</u>");
  }
  function optParts(o) {
    var m = /^([①②③④⑤])\s*(.*)$/.exec(o);
    return m ? { no: m[1], text: m[2] } : { no: "", text: o };
  }
  function answeredCount() { return Object.keys(state.answers).length; }
  function firstIndexOf(si) {
    for (var i = 0; i < flat.length; i++) if (flat[i].si === si) return i;
    return 0;
  }
  function score() {
    var r = { total: 0, bySec: EXAM.sections.map(function () { return { c: 0, n: 0 }; }) };
    flat.forEach(function (f, i) {
      r.bySec[f.si].n++;
      if (state.answers[i] === f.q.ans) { r.total++; r.bySec[f.si].c++; }
    });
    return r;
  }

  function days() {
    var html = '<div class="top"><span class="spacer"></span><h1>Alpha-male Voca 시험</h1><span class="spacer"></span></div>' +
      '<div class="sheet"><div class="hero"><h2>Day별 어휘 시험</h2>' +
      '<p>Day를 골라 시험을 풀어 보세요. 끝까지 풀고 제출하면 자동 채점과 해설을 볼 수 있어요.</p></div>' +
      '<h3 class="sec">Day 선택</h3><div class="daygrid">';
    for (var n = 1; n <= MAX_DAY; n++) {
      var ex = EXAMS[n];
      if (ex) {
        var p = dayProgress(n);
        html += '<button class="daycard" data-day="' + n + '"><b>Day ' + n + '</b><span>' + ex.total + '문항' + (p ? " · " + p + " 풀이" : "") + '</span></button>';
      } else {
        html += '<div class="daycard off"><b>Day ' + n + '</b><span>준비 중</span></div>';
      }
    }
    html += '</div><p class="note">진행 상황은 이 기기 브라우저에만 저장돼요.<br>학습용 자가 채점이며 점수는 서버에 저장되지 않습니다.</p></div>';
    app.innerHTML = html;
    Array.prototype.forEach.call(app.querySelectorAll("[data-day]"), function (b) {
      b.onclick = function () { openDay(+b.getAttribute("data-day")); };
    });
  }
  function openDay(n) {
    selectDay(n);
    try { history.replaceState(null, "", "#day" + n); } catch (e) {}
    go("home");
  }
  function closeDay() {
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    go("days");
  }

  function render() {
    if (state.view === "days") return days();
    if (state.view === "home") return home();
    if (state.view === "quiz") return quiz();
    if (state.view === "result") return result();
    if (state.view === "review") return review();
  }
  function go(v) { state.view = v; window.scrollTo(0, 0); render(); }

  /* ---------- home ---------- */
  function home() {
    var n = answeredCount();
    var html = '<div class="top"><button class="icon" id="days" aria-label="Day 선택">←</button><h1>Day ' + state.day + '</h1><span class="spacer"></span></div>' +
      '<div class="sheet">' +
      '<div class="hero"><h2>' + esc(EXAM.title) + '</h2>' +
      '<p>6가지 유형 · 총 ' + total + '문항. 끝까지 풀고 제출하면 자동 채점과 해설을 볼 수 있어요.</p>' +
      '<button class="btn btn-light" id="start">' + (n ? "이어서 풀기 (" + n + "/" + total + ")" : "시험 시작") + '</button></div>' +
      '<h3 class="sec">유형별 보기</h3>';
    EXAM.sections.forEach(function (s, si) {
      var done = 0;
      flat.forEach(function (f, i) { if (f.si === si && state.answers[i] !== undefined) done++; });
      var pct = Math.round(done / s.questions.length * 100);
      html += '<button class="type-card" data-sec="' + si + '"><span class="type-badge">' + esc(s.id) + '</span>' +
        '<span class="t"><b>' + esc(s.title) + '</b><span>' + s.questions.length + '문항</span></span>' +
        '<span class="ring" style="--p:' + pct + '"><i>' + done + '/' + s.questions.length + '</i></span></button>';
    });
    html += '<div class="stack" style="margin-top:14px">' +
      (n ? '<button class="btn btn-ghost btn-block" id="reset">처음부터 다시 풀기</button>' : '') + '</div>' +
      '<p class="note">진행 상황은 이 기기 브라우저에만 저장돼요.<br>학습용 자가 채점이며 점수는 서버에 저장되지 않습니다.</p></div>';
    app.innerHTML = html;
    document.getElementById("days").onclick = closeDay;
    document.getElementById("start").onclick = function () { state.cur = n ? state.cur : 0; go("quiz"); };
    var r = document.getElementById("reset");
    if (r) r.onclick = function () { if (confirm("지금까지의 답안을 모두 지우고 처음부터 시작할까요?")) { state.answers = {}; state.cur = 0; save(); render(); } };
    Array.prototype.forEach.call(app.querySelectorAll("[data-sec]"), function (b) {
      b.onclick = function () { state.cur = firstIndexOf(+b.getAttribute("data-sec")); save(); go("quiz"); };
    });
  }

  /* ---------- quiz ---------- */
  function quiz() {
    var f = flat[state.cur], q = f.q, sel = state.answers[state.cur];
    var isFirstOfSec = state.cur === 0 || flat[state.cur - 1].si !== f.si;
    var pct = Math.round(answeredCount() / total * 100);
    var html = '<div class="top"><button class="icon" id="back" aria-label="홈">←</button>' +
      '<h1>' + esc(f.s.id) + '. ' + esc(f.s.title) + '</h1><span class="spacer"></span></div>' +
      '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
      '<div class="sheet"><div class="qcard">' +
      '<div class="qmeta"><span class="n">Question: ' + q.n + '/' + total + '</span><span class="k">답안 ' + answeredCount() + '/' + total + '</span></div>' +
      '<div class="inst">' + esc(f.s.instruction) + '</div>' +
      '<div class="stem">' + stem(q.q) + '</div>';
    q.opts.forEach(function (o, i) {
      var p = optParts(o);
      html += '<button class="opt' + (sel === i + 1 ? " sel" : "") + '" data-i="' + (i + 1) + '"><span class="no">' + (i + 1) + '</span><span>' + esc(p.text) + '</span></button>';
    });
    var last = state.cur === total - 1;
    html += '</div><div class="nav"><button class="prev" id="prev"' + (state.cur === 0 ? " disabled" : "") + '>이전</button>' +
      (last ? '<button class="next" id="submit">제출</button>' : '<button class="next" id="next">다음</button>') + '</div>' +
      '<button class="gridbtn" id="grid">문항 목록 · 제출하기</button></div>';
    app.innerHTML = html;
    document.getElementById("back").onclick = function () { save(); go("home"); };
    Array.prototype.forEach.call(app.querySelectorAll(".opt"), function (b) {
      b.onclick = function () {
        var v = +b.getAttribute("data-i");
        if (state.answers[state.cur] === v) delete state.answers[state.cur]; else state.answers[state.cur] = v;
        save(); quiz();
      };
    });
    var p = document.getElementById("prev"); if (p) p.onclick = function () { state.cur--; save(); go("quiz"); };
    var nx = document.getElementById("next"); if (nx) nx.onclick = function () { state.cur++; save(); go("quiz"); };
    var sb = document.getElementById("submit"); if (sb) sb.onclick = submit;
    document.getElementById("grid").onclick = openGrid;
  }

  function openGrid() {
    var d = document.createElement("div"); d.className = "drawer";
    var h = '<div class="panel"><h4>문항 목록</h4><div class="legend">파란색 = 답 선택함 · 번호를 누르면 이동</div><div class="pgrid">';
    for (var i = 0; i < total; i++) {
      h += '<button data-g="' + i + '" class="' + (state.answers[i] !== undefined ? "done " : "") + (i === state.cur ? "cur" : "") + '">' + (i + 1) + '</button>';
    }
    h += '</div><button class="btn btn-navy btn-block" id="gsub">제출하고 채점하기</button>' +
      '<button class="btn btn-ghost btn-block" id="gclose">닫기</button></div>';
    d.innerHTML = h; document.body.appendChild(d);
    function close() { document.body.removeChild(d); }
    d.onclick = function (e) { if (e.target === d) close(); };
    d.querySelector("#gclose").onclick = close;
    d.querySelector("#gsub").onclick = function () { close(); submit(); };
    Array.prototype.forEach.call(d.querySelectorAll("[data-g]"), function (b) {
      b.onclick = function () { state.cur = +b.getAttribute("data-g"); save(); close(); go("quiz"); };
    });
  }

  function submit() {
    var un = total - answeredCount();
    var msg = un ? "아직 답하지 않은 문항이 " + un + "개 있어요. 그래도 제출할까요?" : "제출하고 채점할까요?";
    if (confirm(msg)) go("result");
  }

  /* ---------- result ---------- */
  function result() {
    var r = score();
    var pct = Math.round(r.total / total * 100);
    var msg = pct >= 90 ? "Excellent!" : pct >= 70 ? "Great job!" : pct >= 50 ? "Good try!" : "Keep going!";
    var sub = pct >= 90 ? "아주 훌륭해요" : pct >= 70 ? "잘했어요" : pct >= 50 ? "조금만 더 다듬어 봐요" : "해설을 보며 다시 도전해요";
    var html = '<div class="top"><button class="icon" id="home" aria-label="홈">←</button><h1>결과</h1><span class="spacer"></span></div>' +
      '<div class="sheet"><div class="scorewrap"><div class="circle"><small>Your Score</small><b>' + r.total + '/' + total + '</b></div>' +
      '<h2>' + msg + '</h2><p>' + sub + ' · 정답률 ' + pct + '%</p></div><div class="bars">';
    EXAM.sections.forEach(function (s, i) {
      var b = r.bySec[i], w = Math.round(b.c / b.n * 100);
      html += '<div class="bar-row"><div class="l"><b>' + esc(s.id) + '. ' + esc(s.title) + '</b><span>' + b.c + '/' + b.n + '</span></div><div class="bar"><div style="width:' + w + '%"></div></div></div>';
    });
    html += '</div><div class="stack"><button class="btn btn-navy btn-block" id="wrong">오답만 해설 보기</button>' +
      '<button class="btn btn-primary btn-block" id="all">전체 해설 보기</button>' +
      '<button class="btn btn-ghost btn-block" id="again">다시 풀기</button></div></div>';
    app.innerHTML = html;
    document.getElementById("home").onclick = function () { go("home"); };
    document.getElementById("wrong").onclick = function () { state.filter = "wrong"; go("review"); };
    document.getElementById("all").onclick = function () { state.filter = "all"; go("review"); };
    document.getElementById("again").onclick = function () { state.answers = {}; state.cur = 0; save(); go("home"); };
  }

  /* ---------- review ---------- */
  function review() {
    var html = '<div class="top"><button class="icon" id="back" aria-label="결과">←</button><h1>해설</h1><span class="spacer"></span></div>' +
      '<div class="sheet"><div class="filters"><button data-f="wrong" class="' + (state.filter === "wrong" ? "on" : "") + '">오답만</button>' +
      '<button data-f="all" class="' + (state.filter === "all" ? "on" : "") + '">전체</button></div>';
    var shown = 0;
    flat.forEach(function (f, i) {
      var q = f.q, my = state.answers[i], ok = my === q.ans;
      if (state.filter === "wrong" && ok) return;
      shown++;
      html += '<div class="rv"><div class="h"><span>' + q.n + '번 · ' + esc(f.s.id) + '. ' + esc(f.s.title) + '</span>' +
        '<span class="tag ' + (my === undefined ? "skip" : ok ? "ok" : "bad") + '">' + (my === undefined ? "미응답" : ok ? "정답" : "오답") + '</span></div>' +
        '<div class="stem">' + stem(q.q) + '</div>';
      q.opts.forEach(function (o, k) {
        var p = optParts(o), cls = "opt", mark = "";
        if (k + 1 === q.ans) { cls += " correct"; mark = "정답"; }
        else if (k + 1 === my) { cls += " wrong"; mark = "내 답"; }
        if (k + 1 === q.ans && my === q.ans) mark = "정답 · 내 답";
        html += '<div class="' + cls + '"><span class="no">' + (k + 1) + '</span><span>' + esc(p.text) + '</span>' + (mark ? '<span class="mark">' + mark + '</span>' : '') + '</div>';
      });
      html += '<div class="exp">' + (q.kr ? '<b>해석</b> ' + esc(q.kr) + '<br>' : '') + '<b>해설</b> ' + esc(q.why) + '</div></div>';
    });
    if (!shown) html += '<p class="note">틀린 문항이 없어요. 완벽합니다!</p>';
    html += '<button class="btn btn-ghost btn-block" id="back2" style="margin-top:6px">결과로 돌아가기</button></div>';
    app.innerHTML = html;
    document.getElementById("back").onclick = function () { go("result"); };
    document.getElementById("back2").onclick = function () { go("result"); };
    Array.prototype.forEach.call(app.querySelectorAll("[data-f]"), function (b) {
      b.onclick = function () { state.filter = b.getAttribute("data-f"); review(); };
    });
  }

  var m = /^#day(\d+)$/.exec(location.hash);
  if (m && EXAMS[+m[1]]) { selectDay(+m[1]); state.view = "home"; }
  render();
})();
