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

  var BM_KEY = "vocab-exam-bookmarks";
  function getBookmarks() {
    try { return JSON.parse(localStorage.getItem(BM_KEY) || "{}"); } catch (e) { return {}; }
  }
  function isBookmarked(day, qn) { return !!getBookmarks()[day + ":" + qn]; }
  function toggleBookmark(day, qn) {
    var b = getBookmarks(), k = day + ":" + qn;
    if (b[k]) delete b[k]; else b[k] = true;
    try { localStorage.setItem(BM_KEY, JSON.stringify(b)); } catch (e) {}
  }
  function bookmarkOnWrong(day, qn) {
    var b = getBookmarks(), k = day + ":" + qn;
    if (b[k]) return;
    b[k] = true;
    try { localStorage.setItem(BM_KEY, JSON.stringify(b)); } catch (e) {}
  }
  function starBtnHtml(day, qn) {
    var on = isBookmarked(day, qn);
    return '<button class="star' + (on ? " on" : "") + '" data-bm-day="' + day + '" data-bm-q="' + qn + '" aria-label="즐겨찾기">' + (on ? "★" : "☆") + '</button>';
  }
  function wireStars(container) {
    Array.prototype.forEach.call((container || app).querySelectorAll(".star"), function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var day = +b.getAttribute("data-bm-day"), qn = +b.getAttribute("data-bm-q");
        toggleBookmark(day, qn);
        var on = b.classList.toggle("on");
        b.textContent = on ? "★" : "☆";
      };
    });
  }

  var ICON_HOME = '<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>';
  var ICON_STAR = '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  function tabbar(active) {
    return '<nav class="tabs"><button class="tab' + (active === "home" ? " on" : "") + '" data-tab="home">' + ICON_HOME + '홈</button>' +
      '<button class="tab' + (active === "bm" ? " on" : "") + '" data-tab="bm">' + ICON_STAR + '즐겨찾기</button></nav>';
  }
  function wireTabs() {
    Array.prototype.forEach.call(app.querySelectorAll(".tab"), function (t) {
      t.onclick = function () { if (t.getAttribute("data-tab") === "bm") go("bookmarks"); else closeDay(); };
    });
  }
  var LAST_KEY = "vocab-exam-last";
  function lastDay() {
    try { var n = +localStorage.getItem(LAST_KEY); return AVAILABLE.indexOf(n) >= 0 ? n : 0; } catch (e) { return 0; }
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
  function optsHtml(q, my, clickable) {
    var tag = clickable ? "button" : "div", out = "";
    q.opts.forEach(function (o, k) {
      var p = optParts(o), cls = "opt", mark = "";
      if (k + 1 === q.ans) { cls += " correct"; mark = "정답"; }
      else if (k + 1 === my) { cls += " wrong"; mark = "내 답"; }
      if (k + 1 === q.ans && my === q.ans) mark = "정답 · 내 답";
      out += "<" + tag + ' class="' + cls + '"' + (clickable ? ' data-i="' + (k + 1) + '"' : "") + '><span class="no">' + (k + 1) + '</span><span>' + esc(p.text) + '</span>' + (mark ? '<span class="mark">' + mark + '</span>' : '') + "</" + tag + ">";
    });
    return out;
  }
  function tagHtml(my, ans) {
    var cls = my === undefined ? "skip" : my === ans ? "ok" : "bad";
    var label = my === undefined ? "미응답" : my === ans ? "✓ 정답" : "✕ 오답";
    return '<span class="tag ' + cls + '">' + label + '</span>';
  }
  function expHtml(q) {
    return (q.kr || q.why)
      ? '<div class="exp">' + (q.kr ? "<b>해석</b> " + esc(q.kr) + (q.why ? "<br>" : "") : "") + (q.why ? "<b>해설</b> " + esc(q.why) : "") + '</div>'
      : '<div class="exp soft">이 Day는 아직 해설이 준비되지 않았어요. 정답만 확인할 수 있습니다.</div>';
  }
  function cardHtml(i, clickable) {
    var f = flat[i], q = f.q, my = state.answers[i];
    var label = clickable ? (q.n + "번") : (q.n + "번 · " + esc(f.s.id) + ". " + esc(f.s.title));
    return '<div class="rv' + (clickable ? " rv-live" : "") + '"><div class="h"><span>' + label + '</span>' +
      '<span class="hactions">' + starBtnHtml(state.day, q.n) + tagHtml(my, q.ans) + '</span></div>' +
      '<div class="inst">' + esc(q.inst || f.s.instruction) + '</div>' +
      '<div class="stem">' + stem(q.q) + '</div>' +
      optsHtml(q, my, clickable) + expHtml(q) + '</div>';
  }
  function findInDay(day, qn) {
    var ex = EXAMS[day];
    if (!ex) return null;
    var idx = 0;
    for (var si = 0; si < ex.sections.length; si++) {
      var s = ex.sections[si];
      for (var k = 0; k < s.questions.length; k++) {
        idx++;
        if (idx === qn) return { q: s.questions[k], s: s };
      }
    }
    return null;
  }
  function bookmarkCardHtml(day, qn) {
    var found = findInDay(day, qn);
    if (!found) return "";
    var q = found.q, s = found.s, my;
    try {
      var raw = localStorage.getItem("vocab-exam-day" + day + "-v1");
      if (raw) { var d = JSON.parse(raw); my = d.answers ? d.answers[qn - 1] : undefined; }
    } catch (e) {}
    return '<div class="rv"><div class="h"><span>Day' + day + ' · ' + qn + '번 · ' + esc(s.id) + '. ' + esc(s.title) + '</span>' +
      '<span class="hactions">' + starBtnHtml(day, qn) + tagHtml(my, q.ans) + '</span></div>' +
      '<div class="inst">' + esc(q.inst || s.instruction) + '</div>' +
      '<div class="stem">' + stem(q.q) + '</div>' +
      optsHtml(q, my, false) + expHtml(q) + '</div>';
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
    var maxOpen = Math.max.apply(null, AVAILABLE);
    var last = lastDay(), lp = last ? dayProgress(last) : 0;
    var favN = Object.keys(getBookmarks()).length;
    var html = '<div class="hd hd-home"><span class="logo">Alpha Male VOCA</span><h2>Check your vocab</h2><p>How far will you go today?</p>' +
      '<div class="hd-art"><img class="hd-ill" src="assets/sticker.png" alt=""></div>' +
      '<div class="chips"><span class="chip">Day 1–' + maxOpen + ' open</span><span class="chip">' + favN + (favN === 1 ? ' favorite' : ' favorites') + '</span></div></div>' +
      '<div class="sheet">';
    if (lp) {
      html += '<button class="resume" id="resume"><small>이어서 풀기</small><h4>Day ' + last + ' · ' + lp + '/100</h4>' +
        '<span class="pb"><i style="width:' + lp + '%"></i></span><span class="go">→</span></button>';
    }
    html += '<div class="days">';
    for (var n = 1; n <= MAX_DAY; n++) {
      if (AVAILABLE.indexOf(n) >= 0) {
        var p = Math.min(100, dayProgress(n));
        html += '<button class="d' + (p >= 100 ? " done" : p ? " on" : "") + '" data-day="' + n + '"><b>Day ' + n + '</b>' +
          '<span class="pb"><i style="width:' + p + '%"></i></span>' + (p >= 100 ? "완료 ✓" : p + "%") + '</button>';
      } else {
        html += '<div class="d off"><img src="assets/icons/lock.png" alt=""><b>Day ' + n + '</b></div>';
      }
    }
    html += '</div><p class="note nw">진행 상황은 이 기기 브라우저에만 저장돼요.<br>학습용 자가 채점이며 점수는 서버에 저장되지 않습니다.</p></div>' + tabbar("home");
    app.innerHTML = html;
    Array.prototype.forEach.call(app.querySelectorAll("[data-day]"), function (b) {
      b.onclick = function () { openDay(+b.getAttribute("data-day")); };
    });
    var rs = document.getElementById("resume");
    if (rs) rs.onclick = function () { openDay(last, true); };
    wireTabs();
  }
  function openDay(n, toQuiz) {
    app.innerHTML = '<div class="top"><span class="spacer"></span><h1>Day ' + n + '</h1><span class="spacer"></span></div><div class="sheet"><p class="note">불러오는 중…</p></div>';
    loadDay(n, function (ok) {
      if (!ok) { alert("시험 데이터를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요."); return closeDay(); }
      selectDay(n);
      try { history.replaceState(null, "", "#day" + n); localStorage.setItem(LAST_KEY, n); } catch (e) {}
      go(toQuiz ? "quiz" : "home");
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
    if (state.view === "bookmarks") return bookmarksView();
  }
  function go(v) { state.view = v; window.scrollTo(0, 0); render(); }

  /* ---------- home ---------- */
  function home() {
    var n = answeredCount(), donePct = Math.round(n / total * 100);
    var html = '<div class="hd hd-sm"><div class="row"><button class="back" id="days" aria-label="Day 선택">←</button><span class="logo">DAY ' + state.day + '</span></div>' +
      '<div class="hd-main"><div><h2>' + esc(EXAM.title) + '</h2><p>6가지 유형 · 총 ' + total + '문항</p></div>' +
      '<div class="ring" style="--p:' + donePct + '"><i>' + donePct + '%</i></div></div>' +
      '<button class="pillbtn" id="start">' + (n ? '이어서 풀기 (' + n + '/' + total + ')' : '시작하기') + '</button></div>' +
      '<div class="sheet"><div class="tiles">';
    EXAM.sections.forEach(function (s, si) {
      var done = 0;
      flat.forEach(function (f, i) { if (f.si === si && state.answers[i] !== undefined) done++; });
      var pct = Math.round(done / s.questions.length * 100);
      html += '<button class="t c' + (si % 6) + '" data-sec="' + si + '"><span class="n">' + esc(s.id) + '</span>' +
        '<b>' + esc(s.title) + '</b><span class="cnt">' + s.questions.length + '문항 · ' + done + '/' + s.questions.length + '</span>' +
        '<span class="m"><i style="width:' + pct + '%"></i></span></button>';
    });
    html += '</div>' + (n ? '<button class="btn btn-ghost btn-block" id="reset" style="margin-top:16px">처음부터 다시 풀기</button>' : '') +
      '<p class="note nw">진행 상황은 이 기기 브라우저에만 저장돼요.<br>학습용 자가 채점이며 점수는 서버에 저장되지 않습니다.</p></div>' + tabbar("home");
    app.innerHTML = html;
    wireTabs();
    document.getElementById("days").onclick = closeDay;
    document.getElementById("start").onclick = function () {
      state.cur = n ? state.cur : 0; go("quiz");
    };
    var r = document.getElementById("reset");
    if (r) r.onclick = function () { if (confirm("지금까지의 답안을 모두 지우고 처음부터 시작할까요?")) { state.answers = {}; state.cur = 0; save(); render(); } };
    Array.prototype.forEach.call(app.querySelectorAll("[data-sec]"), function (b) {
      b.onclick = function () { state.cur = firstIndexOf(+b.getAttribute("data-sec")); save(); go("quiz"); };
    });
  }

  /* ---------- quiz ---------- */
  function quiz() {
    var f = flat[state.cur], q = f.q, sel = state.answers[state.cur];
    var revealed = sel !== undefined;
    var pct = Math.round((state.cur + 1) / total * 100);
    var html = '<div class="top"><button class="icon" id="back" aria-label="홈">←</button>' +
      '<h1>' + esc(f.s.id) + '. ' + esc(f.s.title) + '</h1><span class="spacer"></span></div>' +
      '<div class="progress"><div style="width:' + pct + '%"></div></div>' +
      '<div class="sheet">';
    if (revealed) {
      html += cardHtml(state.cur, true);
    } else {
      html += '<div class="qcard">' +
        '<div class="qmeta"><span class="n">Question: ' + q.n + '/' + total + '</span><span class="hactions">' + starBtnHtml(state.day, q.n) + '</span></div>' +
        '<div class="inst">' + esc(q.inst || f.s.instruction) + '</div>' +
        '<div class="stem">' + stem(q.q) + '</div>';
      q.opts.forEach(function (o, i) {
        var p = optParts(o), cls = "opt" + (sel === i + 1 ? " sel" : "");
        html += '<button class="' + cls + '" data-i="' + (i + 1) + '"><span class="no">' + (i + 1) + '</span><span>' + esc(p.text) + '</span></button>';
      });
      html += '</div>';
    }
    var last = state.cur === total - 1;
    html += '<div class="nav"><button class="prev" id="prev"' + (state.cur === 0 ? " disabled" : "") + '>← 이전 문제</button>' +
      (last ? '<button class="next" id="submit">제출</button>' : '<button class="next" id="next">다음 문제 →</button>') + '</div>' +
      '<button class="gridbtn" id="grid">문항 목록 · 제출하기</button></div>';
    app.innerHTML = html;
    document.getElementById("back").onclick = function () { save(); go("home"); };
    Array.prototype.forEach.call(app.querySelectorAll(".opt"), function (b) {
      b.onclick = function () {
        var v = +b.getAttribute("data-i");
        state.answers[state.cur] = v;
        if (v !== q.ans) bookmarkOnWrong(state.day, q.n);
        save(); quiz();
      };
    });
    var p = document.getElementById("prev"); if (p) p.onclick = function () { state.cur--; save(); go("quiz"); };
    var nx = document.getElementById("next"); if (nx) nx.onclick = function () { state.cur++; save(); go("quiz"); };
    var sb = document.getElementById("submit"); if (sb) sb.onclick = submit;
    document.getElementById("grid").onclick = openGrid;
    wireStars();
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
    var html = '<div class="top top-float"><button class="icon" id="home" aria-label="홈">←</button></div>' +
      '<div class="sheet sheet-result"><div class="scorewrap"><img class="trophy-ill" src="assets/icons/trophy.png" alt=""><div class="circle"><small>Your Score</small><b>' + r.total + '/' + total + '</b></div>' +
      '<h2>' + msg + '</h2><p>' + sub + ' · 정답률 ' + pct + '%</p></div>' +
      '<div class="barshead"><img src="assets/icons/chart.png" alt=""><b>유형별 결과</b></div><div class="bars">';
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
    wireStars();
  }

  /* ---------- bookmarks ---------- */
  function bookmarksView() {
    var keys = Object.keys(getBookmarks());
    var html = '<div class="top"><button class="icon" id="days" aria-label="Day 선택">←</button><h1>즐겨찾기</h1><span class="spacer"></span></div><div class="sheet">';
    if (!keys.length) {
      html += '<p class="note" style="margin-top:24px">아직 즐겨찾기한 문제가 없어요.<br>틀린 문제는 자동으로 여기에 모이고, 별표(☆)를 눌러 직접 담을 수도 있어요.</p></div>' + tabbar("bm");
      app.innerHTML = html;
      document.getElementById("days").onclick = closeDay;
      wireTabs();
      return;
    }
    html += '<p class="note" style="margin:4px 0 14px">Day와 상관없이 즐겨찾기한 문제만 모아 봤어요. 총 ' + keys.length + '문항.</p><div id="bmlist"><p class="note">불러오는 중…</p></div></div>' + tabbar("bm");
    app.innerHTML = html;
    document.getElementById("days").onclick = closeDay;
    wireTabs();
    var days = {};
    keys.forEach(function (k) { days[k.split(":")[0]] = 1; });
    var dayList = Object.keys(days).map(Number);
    var pending = dayList.length;
    function renderList() {
      var out = "";
      keys.sort(function (a, b) {
        var da = +a.split(":")[0], qa = +a.split(":")[1], db = +b.split(":")[0], qb = +b.split(":")[1];
        return da - db || qa - qb;
      }).forEach(function (k) {
        var parts = k.split(":"), d = +parts[0], qn = +parts[1];
        if (EXAMS[d]) out += bookmarkCardHtml(d, qn);
      });
      var list = document.getElementById("bmlist");
      if (!list) return;
      list.innerHTML = out || '<p class="note">불러오지 못한 문제가 있어요.</p>';
      Array.prototype.forEach.call(list.querySelectorAll(".star"), function (b) {
        b.onclick = function () {
          toggleBookmark(+b.getAttribute("data-bm-day"), +b.getAttribute("data-bm-q"));
          go("bookmarks");
        };
      });
    }
    if (!pending) return renderList();
    dayList.forEach(function (d) { loadDay(d, function () { pending--; if (pending <= 0) renderList(); }); });
  }

  var m = /^#day(\d+)$/.exec(location.hash);
  if (m && AVAILABLE.indexOf(+m[1]) >= 0) openDay(+m[1]); else render();
})();
