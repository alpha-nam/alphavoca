import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Tap } from "../components/Caption";
import { Pop } from "../components/Card";
import { FlashCaption } from "./FlashCaption";
import manifest from "../data/promo-manifest.json";

type TB = { w: number; h: number; mark?: { x: number; y: number; w: number; h: number } };
const tb = (manifest as unknown as Record<string, TB>).toolbar;

const TB_W = 900;
const TB_H = (TB_W * tb.h) / tb.w;
const TB_X = 90;
const TB_Y = 230;
const PG_W = 600;
const PG_H = (PG_W * 1123) / 794; // A4

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// 카드 상단의 "인쇄 / PDF" 버튼 → 눌러서 A4 인쇄용 PDF 미리보기가 펼쳐진다
export const PromoPrint: React.FC = () => {
  const f = useCurrentFrame();
  const m = tb.mark!;
  const bx = TB_X + m.x * TB_W, by = TB_Y + m.y * TB_H, bw = m.w * TB_W, bh = m.h * TB_H;
  const markP = clamp((f - 12) / 14, 0, 1);
  const pad = 10;
  const inPage = (start: number, from: number) =>
    interpolate(f, [start, start + 20], [from, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const op = (start: number) => clamp((f - start) / 10, 0, 1);

  return (
    <Frame>
      <Pop style={{ position: "absolute", left: TB_X - 20, top: TB_Y - 20, width: TB_W + 40, height: TB_H + 40 }}>
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 28, boxShadow: "0 16px 36px rgba(20,60,160,.16)" }} />
      </Pop>
      <Img src={staticFile("promo/toolbar.png")} style={{ position: "absolute", left: TB_X, top: TB_Y, width: TB_W }} />
      <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
        <rect x={bx - pad} y={by - pad} width={bw + pad * 2} height={bh + pad * 2} rx={22} fill="none" stroke="#E5484D" strokeWidth={9}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - markP} />
      </svg>
      <div style={{ position: "absolute", left: bx + bw / 2, top: by + bh / 2 }}>
        <Tap at={22} />
      </div>
      {/* 뒤쪽 2쪽 → 앞쪽 1쪽 순서로 펼쳐지는 A4 미리보기 */}
      <Img
        src={staticFile("promo/cardpdf_2.png")}
        style={{ position: "absolute", left: 400, top: 560 + inPage(46, 140), width: PG_W, height: PG_H, opacity: op(46), transform: "rotate(6deg)", borderRadius: 8, boxShadow: "0 24px 44px rgba(0,0,0,.28)", background: "#fff" }}
      />
      <Img
        src={staticFile("promo/cardpdf_1.png")}
        style={{ position: "absolute", left: 120, top: 600 + inPage(38, 160), width: PG_W, height: PG_H, opacity: op(38), transform: "rotate(-4deg)", borderRadius: 8, boxShadow: "0 24px 44px rgba(0,0,0,.3)", background: "#fff" }}
      />
      <FlashCaption lines={["인쇄용 [[PDF]]도", "[[버튼 한 번]]!"]} start={0} end={40} cy={1180} />
    </Frame>
  );
};
