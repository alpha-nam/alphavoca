(function () {
  "use strict";
  window.EXAMS = window.EXAMS || {};
  var EXAMS = window.EXAMS;
  var MAX_DAY = 30;
  var AVAILABLE = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
  function loadDay(n, cb) {
    if (EXAMS[n]) return cb(true);
    var s = document.createElement("script");
    s.src = "data/day" + (n < 10 ? "0" : "") + n + ".js";
    s.onload = function () { cb(!!EXAMS[n]); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }
  var app = document.getElementById("app");
  var EXAM = null, flat = [], total = 0, KEY = "";

  var state = { view: "days", day: 0, cur: 0, answers: {}, filter: "all", mode: "study" };

  function selectDay(n) {
    state.day = n;
    EXAM = EXAMS[n];
    flat = [];
    EXAM.sections.forEach(function (s, si) {
      s.questions.forEach(function (q) { flat.push({ q: q, si: si, s: s }); });
    });
    total = flat.length;
    KEY = "vocab-exam-day" + n + "-v1";
    state.cur = 0; state.answers = {}; state.filter = "all"; state.mode = "study";
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && d.answers) { state.answers = d.answers; state.cur = d.cur || 0; state.mode = d.mode || "study"; }
      }
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ answers: state.answers, cur: state.cur, mode: state.mode })); } catch (e) {}
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
  function cardHtml(i, clickable) {
    var f = flat[i], q = f.q, my = state.answers[i], ok = my === q.ans;
    var label = clickable ? (q.n + "번") : (q.n + "번 · " + esc(f.s.id) + ". " + esc(f.s.title));
    var html = '<div class="rv' + (clickable ? " rv-live" : "") + '"><div class="h"><span>' + label + '</span>' +
      '<span class="tag ' + (my === undefined ? "skip" : ok ? "ok" : "bad") + '">' + (my === undefined ? "미응답" : ok ? "정답" : "오답") + '</span></div>' +
      '<div class="stem">' + stem(q.q) + '</div>';
    var tag = clickable ? "button" : "div";
    q.opts.forEach(function (o, k) {
      var p = optParts(o), cls = "opt", mark = "";
      if (k + 1 === q.ans) { cls += " correct"; mark = "정답"; }
      else if (k + 1 === my) { cls += " wrong"; mark = "내 답"; }
      if (k + 1 === q.ans && my === q.ans) mark = "정답 · 내 답";
      html += "<" + tag + ' class="' + cls + '"' + (clickable ? ' data-i="' + (k + 1) + '"' : "") + '><span class="no">' + (k + 1) + '</span><span>' + esc(p.text) + '</span>' + (mark ? '<span class="mark">' + mark + '</span>' : '') + "</" + tag + ">";
    });
    html += (q.kr || q.why)
      ? '<div class="exp">' + (q.kr ? "<b>해석</b> " + esc(q.kr) + (q.why ? "<br>" : "") : "") + (q.why ? "<b>해설</b> " + esc(q.why) : "") + '</div></div>'
      : '<div class="exp soft">이 Day는 아직 해설이 준비되지 않았어요. 정답만 확인할 수 있습니다.</div></div>';
    return html;
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
    var html = '<div class="top"><span class="spacer"></span><h1>Alpha-male Voca</h1><span class="spacer"></span></div>' +
      '<div class="sheet"><div class="hero"><h2>어휘 실력을 점검해 보세요</h2>' +
      '<p>아래에서 학습한 범위를 선택하세요. 끝까지 풀고 제출하면 자동으로 채점하고 해설도 보여 드려요.</p></div>' +
      '<h3 class="sec">학습 범위</h3><div class="daygrid">';
    for (var n = 1; n <= MAX_DAY; n++) {
      var ex = AVAILABLE.indexOf(n) >= 0;
      if (ex) {
        var p = dayProgress(n);
        html += '<button class="daycard" data-day="' + n + '"><b>Day ' + n + '</b><span>' + '100문항' + (p ? " · " + p + " 풀이" : "") + '</span></button>';
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
    app.innerHTML = '<div class="top"><span class="spacer"></span><h1>Day ' + n + '</h1><span class="spacer"></span></div><div class="sheet"><p class="note">불러오는 중…</p></div>';
    loadDay(n, function (ok) {
      if (!ok) { alert("시험 데이터를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요."); return closeDay(); }
      selectDay(n);
      try { history.replaceState(null, "", "#day" + n); } catch (e) {}
      go("home");
    });
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
    var startBlock;
    if (n) {
      startBlock = '<button class="btn btn-light btn-block" id="start">이어서 풀기 (' + n + '/' + total + ')</button>';
    } else {
      var mStudy = state.mode !== "exam";
      startBlock =
        '<div class="modesel">' +
          '<label class="moderadio' + (mStudy ? " on" : "") + '"><input type="radio" name="mode" value="study"' + (mStudy ? " checked" : "") + '><b>학습 모드</b><span>문제마다 바로 정답·해설 확인</span></label>' +
          '<label class="moderadio' + (!mStudy ? " on" : "") + '"><input type="radio" name="mode" value="exam"' + (!mStudy ? " checked" : "") + '><b>시험 모드</b><span>100문항 다 풀고 한번에 채점</span></label>' +
        '</div>' +
        '<button class="btn btn-light btn-block" id="start">시작하기</button>';
    }
    var html = '<div class="top"><button class="icon" id="days" aria-label="Day 선택">←</button><h1>Day ' + state.day + '</h1><span class="spacer"></span></div>' +
      '<div class="sheet">' +
      '<div class="hero"><h2>' + esc(EXAM.title) + '</h2>' +
      '<p>6가지 유형 · 총 ' + total + '문항. 학습 모드는 문제마다 바로 확인, 시험 모드는 끝까지 풀고 한번에 채점해요.</p>' +
      startBlock + '</div>' +
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
    document.getElementById("start").onclick = function () {
      if (!n) {
        var checked = app.querySelector('input[name="mode"]:checked');
        state.mode = checked ? checked.value : "study";
        save();
      }
      state.cur = n ? state.cur : 0; go("quiz");
    };
    Array.prototype.forEach.call(app.querySelectorAll(".moderadio"), function (lab) {
      lab.onclick = function () {
        Array.prototype.forEach.call(app.querySelectorAll(".moderadio"), function (l) { l.classList.remove("on"); });
        lab.classList.add("on");
      };
    });
    var r = document.getElementById("reset");
    if (r) r.onclick = function () { if (confirm("지금까지의 답안을 모두 지우고 처음부터 시작할까요?")) { state.answers = {}; state.cur = 0; save(); render(); } };
    Array.prototype.forEach.call(app.querySelectorAll("[data-sec]"), function (b) {
      b.onclick = function () { state.cur = firstIndexOf(+b.getAttribute("data-sec")); save(); go("quiz"); };
    });
  }

  /* ---------- quiz ---------- */
  function quiz() {
    var f = flat[state.cur], q = f.q, sel = state.answers[state.cur];
    var revealed = state.mode === "study" && sel !== undefined;
    var pct = Math.round(answeredCount() / total * 100);
    var html = '<div class="top"><button class="icon" id="back" aria-label="홈">←</button>' +
      '<h1>' + esc(f.s.id) + '. ' + esc(f.s.title) + '</h1><span class="spacer"></span></div>' +
      '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
      '<div class="sheet">';
    if (revealed) {
      html += cardHtml(state.cur, true);
    } else {
      html += '<div class="qcard">' +
        '<div class="qmeta"><span class="n">Question: ' + q.n + '/' + total + '</span><span class="k">답안 ' + answeredCount() + '/' + total + '</span></div>' +
        '<div class="inst">' + esc(q.inst || f.s.instruction) + '</div>' +
        '<div class="stem">' + stem(q.q) + '</div>';
      q.opts.forEach(function (o, i) {
        var p = optParts(o), cls = "opt" + (sel === i + 1 ? " sel" : "");
        html += '<button class="' + cls + '" data-i="' + (i + 1) + '"><span class="no">' + (i + 1) + '</span><span>' + esc(p.text) + '</span></button>';
      });
      html += '</div>';
    }
    var last = state.cur === total - 1;
    html += '<div class="nav"><button class="prev" id="prev"' + (state.cur === 0 ? " disabled" : "") + '>이전 문제</button>' +
      (last ? '<button class="next" id="submit">제출</button>' : '<button class="next" id="next">다음 문제</button>') + '</div>' +
      '<button class="gridbtn" id="grid">문항 목록 · 제출하기</button></div>';
    app.innerHTML = html;
    document.getElementById("back").onclick = function () { save(); go("home"); };
    Array.prototype.forEach.call(app.querySelectorAll(".opt"), function (b) {
      b.onclick = function () {
        var v = +b.getAttribute("data-i");
        if (state.mode === "study") { state.answers[state.cur] = v; }
        else if (state.answers[state.cur] === v) { delete state.answers[state.cur]; }
        else { state.answers[state.cur] = v; }
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
      var ok = state.answers[i] === f.q.ans;
      if (state.filter === "wrong" && ok) return;
      shown++;
      html += cardHtml(i);
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
  if (m && AVAILABLE.indexOf(+m[1]) >= 0) openDay(+m[1]); else render();
})();
