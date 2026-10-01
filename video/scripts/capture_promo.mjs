// data/sample-card.html(분석 카드)와 data/question.html(문제 페이지)을 PNG로 캡처한다.
// 분석 카드는 섹션/문장 카드 단위로 잘라 public/promo/<name>.png 로 저장하고,
// 크기와 강조 위치(mark)를 src/data/promo-manifest.json 에 기록한다.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const fontUrl = pathToFileURL(resolve("public/fonts/NotoSansKR.ttf")).href;
const FONT_CSS = `@font-face{font-family:"NotoLocal";src:url("${fontUrl}");font-weight:100 900}
body,*{font-family:"NotoLocal","Noto Sans KR",sans-serif}
code{font-family:"NotoLocal",sans-serif}`;
mkdirSync("public/promo", { recursive: true });

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const manifest = {};

// 1) 문제 페이지
{
  const page = await browser.newPage({ viewport: { width: 620, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve("data/question.html")).href, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: `@font-face{font-family:"NotoLocal";src:url("${fontUrl}");font-weight:100 900}` });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const el = page.locator("#page");
  const b = await el.boundingBox();
  await el.screenshot({ path: "public/promo/question.png", omitBackground: true });
  manifest.question = { w: Math.round(b.width), h: Math.round(b.height) };
  await page.close();
}

// 2) 분석 카드
{
  const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve("data/sample-card.html")).href, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `${FONT_CSS}html,body{background:transparent!important}body{padding:14px!important}`,
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const segs = await page.evaluate(() => {
    const kids = [...document.querySelector(".container").children];
    const names = { "개념 스케치": "sketch", "어휘": "vocab", "문장별 분석": "sentHead", "논리 흐름": "logic",
      "티칭 포인트: 비유": "analogy", "정답 근거": "answer", "수업 팁": "tips" };
    const groups = { header: [] };
    let cur = "header", n = 0, pendingHead = null;
    for (const k of kids) {
      if (k.classList.contains("section-title")) {
        cur = names[k.textContent.trim()] || cur;
        if (cur === "sentHead") { pendingHead = k; continue; }
        groups[cur] = [k];
      } else if (cur === "sentHead" || cur.startsWith("s") && /^s\d+$/.test(cur) && k.classList.contains("sent-card")) {
        n += 1; cur = "s" + n; groups[cur] = pendingHead && n === 1 ? [pendingHead, k] : [k];
        if (n === 1) pendingHead = null;
        if (!k.classList.contains("sent-card")) { /* 안전장치 */ }
        // 다음 sent-card도 같은 규칙을 타도록 cur 유지
      } else {
        groups[cur].push(k);
      }
    }
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; };
    const out = {};
    for (const [name, els] of Object.entries(groups)) {
      const rs = els.map(r);
      const x = Math.min(...rs.map((a) => a.x)), y = Math.min(...rs.map((a) => a.y));
      const x2 = Math.max(...rs.map((a) => a.x + a.w)), y2 = Math.max(...rs.map((a) => a.y + a.h));
      out[name] = { x, y, w: x2 - x, h: y2 - y, els };
    }
    // 강조 위치
    const marks = {};
    const s6 = groups.s6 && groups.s6[groups.s6.length - 1];
    if (s6) marks.s6 = r(s6.querySelectorAll(".field-row")[2]);
    const cb = document.querySelector(".correct-box");
    if (cb) marks.answer = r(cb);
    const clean = {};
    for (const [k, v] of Object.entries(out)) clean[k] = { x: v.x, y: v.y, w: v.w, h: v.h };
    return { boxes: clean, marks };
  });

  const PAD = 8;
  for (const [name, b] of Object.entries(segs.boxes)) {
    // 문장 카드의 sent-card 사이 여백 때문에 y를 살짝 넓혀 잘림 방지
    const clip = { x: Math.max(0, b.x - PAD), y: Math.max(0, b.y - PAD), width: b.w + PAD * 2, height: b.h + PAD * 2 };
    await page.screenshot({ path: `public/promo/${name}.png`, fullPage: true, clip, omitBackground: true });
    manifest[name] = { w: Math.round(clip.width), h: Math.round(clip.height) };
    const m = segs.marks[name];
    if (m) manifest[name].mark = { x: (m.x - clip.x) / clip.width, y: (m.y - clip.y) / clip.height, w: m.w / clip.width, h: m.h / clip.height };
  }
  await page.close();
}
await browser.close();
writeFileSync("src/data/promo-manifest.json", JSON.stringify(manifest, null, 2));
console.log(Object.entries(manifest).map(([k, v]) => `${k}:${v.w}x${v.h}`).join("  "));
