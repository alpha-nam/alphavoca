import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { useTheme } from "../theme";
import { FlashCaption } from "./FlashCaption";

const IMG_W = 900;
const IMG_H = (IMG_W * 2164) / 1560; // 학습지 1쪽 캡처 비율 (A4 + 여백)
const LEFT = 90;
const TOP = 360;

// 학생용 학습지 1쪽 → 2쪽 → 교사용 정답지(빨간 답)
const PAGES = [
  { src: "promo/ws_s1.png", start: 0, end: 50, tag: "학생용 학습지 · A4 2쪽" },
  { src: "promo/ws_s2.png", start: 50, end: 96, tag: "학생용 학습지 · A4 2쪽" },
  { src: "promo/ws_k1.png", start: 96, end: 136, tag: "교사용 정답지 · 답은 빨간색" },
  { src: "promo/ws_k2.png", start: 136, end: 180, tag: "교사용 정답지 · 답은 빨간색" },
];
export const WS_FRAMES = 182;

const ease = Easing.out(Easing.cubic);

export const PromoWorksheet: React.FC = () => {
  const theme = useTheme();
  const f = useCurrentFrame();
  return (
    <Frame>
      {PAGES.map((p, i) => {
        if (f < p.start - 1 || f > p.end + 16) return null;
        const enter = interpolate(f, [p.start, p.start + 16], [1100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const exit = interpolate(f, [p.end, p.end + 14], [0, -1100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
        const x = i === 0 ? exit : enter + exit;
        return (
          <div key={p.src} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${x}px)` }}>
            <div style={{ position: "absolute", left: LEFT, top: TOP - 112, background: p.tag.startsWith("교사용") ? "#E5484D" : theme.primary, color: "#fff", fontSize: 40, fontWeight: 900, padding: "12px 30px", borderRadius: 999, boxShadow: "0 8px 20px rgba(0,0,0,.22)" }}>
              {p.tag}
            </div>
            <Img src={staticFile(p.src)} style={{ position: "absolute", left: LEFT, top: TOP, width: IMG_W, height: IMG_H, borderRadius: 14, boxShadow: "0 26px 50px rgba(20,40,100,.35)", background: "#fff" }} />
          </div>
        );
      })}
      <FlashCaption lines={["학습지도 [[자동]]으로", "A4 [[2쪽]] 한 장!"]} start={0} end={44} cy={1000} />
      <FlashCaption lines={["교사용 [[정답지]]까지", "[[따로]] 만들어요"]} start={96} end={138} cy={1000} />
    </Frame>
  );
};
