// 스킬이 만든 HTML 카드를 섹션별 PNG로 캡처한다.
// Usage: node scripts/capture_card.mjs <card.html> <outDir> <blue|dark|green>
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [, , htmlPath, outDir, variant = "blue"] = process.argv;
if (!htmlPath || !outDir) throw new Error("Usage: capture_card.mjs <card.html> <outDir> <blue|dark|green>");
mkdirSync(outDir, { recursive: true });

const EXE =
  process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const fontUrl = pathToFileURL(resolve("public/fonts/NotoSansKR.ttf")).href;

const GREEN = `:root,:root[data-theme="light"]{
  --bg:#F3F7F5;--bg-glow:#CFEBDD;--sheet:#FFFFFF;--sheet-2:#F6FBF8;--fg:#1D2B26;--muted:#6E8079;--line:#E3ECE7;
  --accent:#34A877;--accent-soft:#E4F5EC;--accent-ink:#0B5D46;--amber:#F5703F;--amber-soft:#FFEDE5;
  --code-bg:#E4F5EC;--code-fg:#0B5D46;--shadow:0 1px 2px rgba(11,93,70,.06),0 8px 24px rgba(11,93,70,.08)}`;

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 600, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: "domcontentloaded" });
// 샌드박스에서는 구글 폰트를 못 받으므로 로컬 폰트로 대체
await page.addStyleTag({
  content: `@font-face{font-family:"NotoLocal";src:url("${fontUrl}");font-weight:100 900}
:root{--font-body:"NotoLocal",system-ui,sans-serif;--font-display:"NotoLocal",system-ui,sans-serif}`,
});
if (variant === "dark") await page.click("#t-dark");
if (variant === "green") await page.addStyleTag({ content: GREEN });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
// 테마 토글 바는 영상에서 가린다
await page.addStyleTag({ content: ".bar{display:none!important}html,body{background:transparent!important}section.card{box-shadow:none!important}" });

// h2 텍스트로 섹션 카드를 찾는다
const byH2 = (t) => `section.card:has(h2:has-text("${t}"))`;
const groups = {
  hero: [".head", ".two", "section.mini.wide"],
  sketch: [byH2("개념 스케치")],
  vocab: [byH2("핵심 어휘")],
  logic: [byH2("논리 흐름")],
  answer: [byH2("정답과 오답")],
  variant: [byH2("변형문제")],
};
for (let i = 0; i < 4; i++) groups[`sent${i + 1}`] = [`main > section.card:has(.sent) >> nth=${i}`];

for (const [name, sels] of Object.entries(groups)) {
  const boxes = [];
  for (const s of sels) {
    const el = page.locator(s).first();
    if ((await el.count()) === 0) continue;
    await el.scrollIntoViewIfNeeded();
    boxes.push(await el.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    }));
  }
  if (!boxes.length) { console.warn("skip", name); continue; }
  const x = Math.min(...boxes.map((b) => b.x)) - 12;
  const y = Math.min(...boxes.map((b) => b.y)) - 12;
  const x2 = Math.max(...boxes.map((b) => b.x + b.w)) + 12;
  const y2 = Math.max(...boxes.map((b) => b.y + b.h)) + 12;
  await page.screenshot({
    path: `${outDir}/${name}.png`,
    fullPage: true,
    clip: { x: Math.max(0, x), y: Math.max(0, y), width: x2 - Math.max(0, x), height: y2 - Math.max(0, y) },
    omitBackground: true,
  });
  console.log("wrote", name, Math.round(x2 - x), "x", Math.round(y2 - y));
}
await browser.close();
