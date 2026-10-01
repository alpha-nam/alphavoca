import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Frame } from "../components/Frame";
import { OutlinedText } from "../components/Caption";
import { SAFE } from "../theme";
import manifest from "../data/promo-manifest.json";

type M = { w: number; h: number; mark?: { x: number; y: number; w: number; h: number } };
const M_ = manifest as unknown as Record<string, M>;

const ORDER = ["header", "sketch", "vocab", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "logic", "analogy", "answer", "tips"];
const W = 960; // 화면에 표시하는 폭
const GAP = 26;
const VIEW_TOP = 170;
const BAR = 56;
const VIEW_H = 1330; // 창 전체 높이
const AREA_H = VIEW_H - BAR;

const heights = ORDER.map((n) => (W * M_[n].h) / M_[n].w);
const tops = heights.reduce<number[]>((acc, h, i) => [...acc, i === 0 ? 0 : acc[i - 1] + heights[i - 1] + GAP], []);
const TOTAL_H = tops[tops.length - 1] + heights[heights.length - 1];

type Stop = { name: string; hold: number; speed: number; lines: string[]; mark?: boolean };
// 쭉쭉 내리다가 핵심에서 멈춘다 (speed: px/frame)
const STOPS: Stop[] = [
  { name: "header", hold: 36, speed: 0, lines: ["주제 · 요지 · 쉬운 설명"] },
  { name: "sketch", hold: 36, speed: 34, lines: ["개념 스케치까지 [[자동]]"] },
  { name: "vocab", hold: 22, speed: 34, lines: ["핵심 어휘 정리"] },
  { name: "s1", hold: 8, speed: 40, lines: ["문장마다 [[해석 · 문법]]"] },
  { name: "s4", hold: 0, speed: 78, lines: ["문장마다 [[해석 · 문법]]"] },
  { name: "s6", hold: 52, speed: 62, lines: ["무관한 문장, [[왜]] 아닌지까지"], mark: true },
  { name: "logic", hold: 28, speed: 50, lines: ["논리 흐름 한눈에"] },
  { name: "analogy", hold: 28, speed: 40, lines: ["설명용 [[비유]]까지"] },
  { name: "answer", hold: 54, speed: 40, lines: ["정답 근거 · 오답 [[분석]]"], mark: true },
  { name: "tips", hold: 24, speed: 40, lines: ["수업 [[팁]]은 덤"] },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const targetY = (name: string) => {
  const i = ORDER.indexOf(name);
  return clamp(tops[i] - 16, 0, Math.max(0, TOTAL_H - AREA_H));
};

// 타임라인: [arrive, leave] 프레임과 목표 y
const timeline = (() => {
  let t = 0;
  let y = 0;
  return STOPS.map((s, i) => {
    const ty = targetY(s.name);
    const travel = i === 0 ? 0 : clamp(Math.ceil(Math.abs(ty - y) / s.speed), 10, 90);
    const startMove = t;
    const arrive = t + travel;
    const leave = arrive + s.hold;
    const seg = { ...s, fromY: y, toY: ty, startMove, arrive, leave };
    t = leave;
    y = ty;
    return seg;
  });
})();
export const SCROLL_FRAMES = timeline[timeline.length - 1].leave + 14;

const scrollAt = (f: number) => {
  for (const s of timeline) {
    if (f < s.arrive) {
      const p = clamp((f - s.startMove) / Math.max(1, s.arrive - s.startMove), 0, 1);
      return s.fromY + (s.toY - s.fromY) * Easing.inOut(Easing.cubic)(p);
    }
    if (f < s.leave) return s.toY;
  }
  return timeline[timeline.length - 1].toY;
};

const Mark: React.FC<{ name: string; start: number }> = ({ name, start }) => {
  const f = useCurrentFrame();
  const m = M_[name].mark;
  if (!m) return null;
  const i = ORDER.indexOf(name);
  const h = heights[i];
  const p = clamp((f - start) / 18, 0, 1);
  const pad = 10;
  const x = m.x * W - pad, y = tops[i] + m.y * h - pad, w = m.w * W + pad * 2, hh = m.h * h + pad * 2;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: W, height: TOTAL_H, overflow: "visible", pointerEvents: "none" }}>
      <rect x={x} y={y} width={w} height={hh} rx={22} fill="none" stroke="#E5484D" strokeWidth={9} pathLength={1}
        strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};

export const PromoScroll: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = scrollAt(f);
  const cur = [...timeline].reverse().find((s) => f >= s.arrive - 10) ?? timeline[0];
  const capStart = cur.arrive - 10;
  const pop = spring({ frame: f - capStart, fps, config: { damping: 12, stiffness: 180 } });
  const thumbH = (AREA_H * AREA_H) / TOTAL_H;
  const thumbY = (y / Math.max(1, TOTAL_H - AREA_H)) * (AREA_H - thumbH);

  return (
    <Frame>
      <div style={{ position: "absolute", left: SAFE.side, top: VIEW_TOP, width: W, height: VIEW_H, borderRadius: 28, overflow: "hidden", background: "#F4F7FC", boxShadow: "0 18px 40px rgba(20,60,160,.18)" }}>
        <div style={{ height: BAR, background: "#EEF1F6", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: "2px solid #DDE3EC" }}>
          {["#FF6B6B", "#FFC53D", "#3DD68C"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
          ))}
          <div style={{ marginLeft: 14, fontSize: 24, fontWeight: 700, color: "#5B6678" }}>지문 분석 결과</div>
        </div>
        <div style={{ position: "absolute", top: BAR, left: 0, width: W, height: AREA_H, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: TOTAL_H, transform: `translateY(${-y}px)` }}>
            {ORDER.map((n, i) => (
              <Img key={n} src={staticFile(`promo/${n}.png`)} style={{ position: "absolute", left: 0, top: tops[i], width: W }} />
            ))}
            {timeline.filter((s) => s.mark).map((s) => (
              <Mark key={s.name} name={s.name} start={s.arrive + 8} />
            ))}
          </div>
          {/* 스크롤바 */}
          <div style={{ position: "absolute", right: 8, top: 8, width: 8, height: AREA_H - 16, borderRadius: 4, background: "rgba(0,0,0,.06)" }}>
            <div style={{ position: "absolute", top: (thumbY * (AREA_H - 16)) / AREA_H, width: 8, height: Math.max(60, (thumbH * (AREA_H - 16)) / AREA_H), borderRadius: 4, background: "rgba(0,0,0,.25)" }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, transform: `scale(${0.7 + 0.3 * pop})`, opacity: clamp(pop * 1.4, 0, 1) }}>
        <OutlinedText lines={cur.lines} size={62} />
      </div>
    </Frame>
  );
};
