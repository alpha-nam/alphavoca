// data/skill-card2.html(최신 스킬 카드)을 섹션/문장 카드 단위로 캡처한다.
// → public/promo/<name>.png, src/data/promo-manifest.json (question 항목은 유지)
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const fontUrl = pathToFileURL(resolve("public/fonts/NotoSansKR.ttf")).href;
const DARK = process.argv.includes("--dark"); // 다크 테마 카드는 public/promo-dark 에 저장(매니페스트는 그대로)
const OUT = DARK ? "public/promo-dark" : "public/promo";
mkdirSync(OUT, { recursive: true });
const manifestPath = "src/data/promo-manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
for (const k of Object.keys(manifest)) if (k !== "question") delete manifest[k];

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(resolve("data/skill-card2.html")).href, { waitUntil: "domcontentloaded" });
await page.addStyleTag({
  content: `@font-face{font-family:"NotoLocal";src:url("${fontUrl}");font-weight:100 900}
:root{--font-body:"NotoLocal",system-ui,sans-serif;--font-display:"NotoLocal",system-ui,sans-serif}
html,body{background:transparent!important}section.card{box-shadow:none!important}`,
});
await page.evaluate(() => document.fonts.ready);
if (DARK) await page.evaluate(() => document.getElementById("t-dark").click());
await page.waitForTimeout(500);

// 툴바: 인쇄 / PDF 버튼이 보이도록 먼저 캡처한 뒤 숨긴다
{
  const bar = page.locator(".bar").first();
  const bb = await bar.boundingBox();
  if (bb && !DARK) {
    const pad = 8;
    await page.screenshot({ path: `${OUT}/toolbar.png`, fullPage: true, omitBackground: true,
      clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + pad * 2, height: bb.height + pad * 2 } });
    const btn = await page.locator("#t-print").boundingBox();
    manifest.toolbar = { w: Math.round(bb.width + pad * 2), h: Math.round(bb.height + pad * 2),
      mark: btn ? { x: (btn.x - (bb.x - pad)) / (bb.width + pad * 2), y: (btn.y - (bb.y - pad)) / (bb.height + pad * 2), w: btn.width / (bb.width + pad * 2), h: btn.height / (bb.height + pad * 2) } : undefined };
  }
  await page.addStyleTag({ content: ".bar{display:none!important}" });
}
const res = await page.evaluate(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; };
  const byH2 = (t) => [...document.querySelectorAll("section.card")].find((s) => s.querySelector("h2")?.textContent.includes(t));
  const sents = [...document.querySelectorAll("main > section.card")].filter((s) => s.querySelector(".sent"));
  const groups = {
    header: [document.querySelector(".head"), document.querySelector(".two"), document.querySelector("section.mini.wide")],
    blueprint: [byH2("글의 설계도")],
    sketch: [byH2("개념 스케치")],
    vocab: [byH2("핵심 어휘")],
    logic: [byH2("논리 흐름")],
    analogy: [document.querySelector(".vs")?.closest("section.card")],
    answer: [byH2("정답과 오답")],
    tips: [byH2("수업 팁")],
    variants: [byH2("변형문제")],
  };
  sents.forEach((s, i) => (groups["s" + (i + 1)] = [s]));
  const boxes = {};
  for (const [name, els] of Object.entries(groups)) {
    const rs = els.filter(Boolean).map(r);
    if (!rs.length) continue;
    const x = Math.min(...rs.map((a) => a.x)), y = Math.min(...rs.map((a) => a.y));
    boxes[name] = { x, y, w: Math.max(...rs.map((a) => a.x + a.w)) - x, h: Math.max(...rs.map((a) => a.y + a.h)) - y };
  }
  const marks = {};
  // 정답 문장(④ = 여섯 번째 카드)의 '내용 해설' 칸
  const s6 = sents[5];
  const note = s6 && [...s6.querySelectorAll(".field")].find((f) => f.querySelector(".label")?.textContent.includes("내용 해설"));
  if (note) marks.s6 = r(note);
  const bp = document.querySelector(".bp-bar");
  if (bp) marks.blueprint = r(bp);
  const tag = sents[0] && sents[0].querySelector(".stag.key");
  if (tag) marks.s1 = r(tag);
  const ok = document.querySelector(".opt.ok");
  if (ok) marks.answer = r(ok);
  return { boxes, marks };
});

const PAD = 8;
for (const [name, b] of Object.entries(res.boxes)) {
  const clip = { x: Math.max(0, b.x - PAD), y: Math.max(0, b.y - PAD), width: b.w + PAD * 2, height: b.h + PAD * 2 };
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true, clip, omitBackground: true });
  manifest[name] = { w: Math.round(clip.width), h: Math.round(clip.height) };
  const m = res.marks[name];
  if (m) manifest[name].mark = { x: (m.x - clip.x) / clip.width, y: (m.y - clip.y) / clip.height, w: m.w / clip.width, h: m.h / clip.height };
}
await browser.close();
if (!DARK) writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(Object.entries(manifest).map(([k, v]) => `${k}:${v.w}x${v.h}`).join("  "));
