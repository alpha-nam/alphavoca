// 학습지/정답지/카드 HTML → PDF(A4) + 영상용 페이지 PNG (print 미디어 에뮬레이션)
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const fontUrl = pathToFileURL(resolve("public/fonts/NotoSansKR.ttf")).href;
mkdirSync("out/pdf", { recursive: true });
const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });

async function open(file, vw = 780) {
  const page = await browser.newPage({ viewport: { width: vw, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: `@font-face{font-family:"NotoLocal";src:url("${fontUrl}");font-weight:100 900}:root{--font-body:"NotoLocal",sans-serif!important;--font-display:"NotoLocal",sans-serif!important}` });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.emulateMedia({ media: "print" });
  return page;
}

// 1) 학습지 / 정답지: 페이지(.pg)별 PNG + PDF
for (const [file, tag, pdf] of [["data/worksheet-student.html", "ws_s", "out/pdf/학습지_샘플.pdf"], ["data/worksheet-key.html", "ws_k", "out/pdf/학습지_정답지_샘플.pdf"]]) {
  const page = await open(file);
  const n = await page.locator(".pg").count();
  for (let i = 0; i < n; i++) await page.locator(".pg").nth(i).screenshot({ path: `public/promo/${tag}${i + 1}.png`, omitBackground: false });
  await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(file, "pages:", n);
  await page.close();
}

// 2) 카드 인쇄용 PDF 미리보기 (A4 한 장 크기로 잘라서 앞 2쪽)
{
  const page = await open("data/skill-card2.html", 794);
  await page.pdf({ path: "out/pdf/분석카드_샘플.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
  const h = 1123; // A4 @96dpi
  for (let i = 0; i < 2; i++)
    await page.screenshot({ path: `public/promo/cardpdf_${i + 1}.png`, fullPage: true, clip: { x: 0, y: i * h, width: 794, height: h } });
  await page.close();
}
await browser.close();
