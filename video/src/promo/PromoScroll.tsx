import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Frame } from "../components/Frame";
import { StyledCaption } from "./FlashCaption";
import type { FxName } from "./CaptionLab";
import { SAFE, useTheme } from "../theme";
import manifest from "../data/promo-manifest.json";

type M = { w: number; h: number; mark?: { x: number; y: number; w: number; h: number } };
const M_ = manifest as unknown as Record<string, M>;

const ORDER = ["header", "blueprint", "sketch", "vocab", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "logic", "analogy", "answer", "tips", "variants"];
const W = 960; // 화면에 표시하는 폭
const GAP = 26;
const VIEW_TOP = 140; // 기능 화면을 위아래로 늘렸다 (인스타 UI 안전 영역 안쪽)
const BAR = 56;
const VIEW_H = 1540;
const AREA_H = VIEW_H - BAR;
const CENTER_Y = VIEW_TOP + VIEW_H / 2;

const heights = ORDER.map((n) => (W * M_[n].h) / M_[n].w);
const tops = heights.reduce<number[]>((acc, h, i) => [...acc, i === 0 ? 0 : acc[i - 1] + heights[i - 1] + GAP], []);
const TOTAL_H = tops[tops.length - 1] + heights[heights.length - 1];

type Stop = { name: string; hold: number; speed: number; lines: string[]; mark?: boolean; fx: FxName; cy?: number; size?: number };
const BANDS = ["#1F6BFF", "#12A150", "#7C5CFC", "#E5484D"];
// 쭉쭉 내리다가 핵심에서 멈춘다 (speed: px/frame). 자막은 [[강조]]에 형광 띠가 깔린다.
const SENT: string[] = ["문장마다", "[[해석 · 문법]]"];
const STOPS: Stop[] = [
  { name: "header", hold: 26, speed: 0, lines: ["주제 · 요지", "[[쉬운 설명]]까지"] , fx: "drop", cy: 910, size: 108 },
  { name: "blueprint", hold: 46, speed: 53, lines: ["글의 설계도", "[[한눈에]]"], mark: true , fx: "wipe", cy: 760, size: 112 },
  { name: "sketch", hold: 30, speed: 56, lines: ["개념 스케치도", "[[자동]]으로!"] , fx: "stack", cy: 980, size: 104 },
  { name: "vocab", hold: 20, speed: 56, lines: ["핵심 어휘", "[[정리]]까지"] , fx: "marker", cy: 910, size: 112 },
  { name: "s1", hold: 40, speed: 62, lines: ["★ 핵심 문장", "[[! 해석 주의]] 표시"], mark: true , fx: "shine", cy: 780, size: 108 },
  { name: "s3", hold: 4, speed: 64, lines: SENT , fx: "underline", cy: 910, size: 108 },
  { name: "s5", hold: 0, speed: 115, lines: SENT , fx: "underline", cy: 910, size: 108 },
  { name: "s6", hold: 48, speed: 92, lines: ["무관한 문장,", "[[왜]] 아닌지까지"], mark: true , fx: "stamp", cy: 960, size: 116 },
  { name: "logic", hold: 28, speed: 78, lines: ["논리 흐름", "[[한눈에]]"] , fx: "type", cy: 820, size: 108 },
  { name: "analogy", hold: 28, speed: 64, lines: ["설명용", "[[비유]]까지"] , fx: "stack", cy: 1010, size: 104 },
  { name: "answer", hold: 48, speed: 64, lines: ["정답 근거와", "[[오답 분석]]"], mark: true , fx: "stamp", cy: 900, size: 116 },
  { name: "tips", hold: 20, speed: 64, lines: ["수업 [[팁]]도", "[[덤]]!"] , fx: "marker", cy: 1000, size: 112 },
  { name: "variants", hold: 44, speed: 64, lines: ["변형문제까지", "[[자동 추천]]"] , fx: "type", cy: 880, size: 108 },
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

// 같은 문구가 이어지는 정거장은 자막 하나로 묶는다
const CAP_LIFE = 30; // 도착 후 자막이 화면 중앙에 머무는 프레임
const captions = (() => {
  const out: { lines: string[]; start: number; end: number; fx: FxName; cy?: number; size?: number; band: string }[] = [];
  for (const s of timeline) {
    const key = s.lines.join("|");
    const last = out[out.length - 1];
    if (last && last.lines.join("|") === key) {
      last.end = s.arrive + CAP_LIFE;
    } else {
      out.push({ lines: s.lines, start: Math.max(0, s.arrive - 8), end: s.arrive + CAP_LIFE, fx: s.fx, cy: s.cy, size: s.size, band: BANDS[out.length % BANDS.length] });
    }
  }
  for (let i = 0; i < out.length - 1; i++) out[i].end = Math.min(out[i].end, out[i + 1].start - 2);
  return out;
})();

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
  const theme = useTheme();
  const f = useCurrentFrame();
  const y = scrollAt(f);
  const fb = !!theme.fullBleed;
  const dir = theme.promoDir ?? "promo";
  const areaH = fb ? 1920 : AREA_H;
  const thumbH = (areaH * areaH) / TOTAL_H;
  const thumbY = (y / Math.max(1, TOTAL_H - areaH)) * (areaH - thumbH);
  const winStyle: React.CSSProperties = fb
    ? { left: 0, top: 0, width: 1080, height: 1920, borderRadius: 0, boxShadow: "none" }
    : { left: SAFE.side, top: VIEW_TOP, width: W, height: VIEW_H, borderRadius: 28, boxShadow: theme.winShadow ?? "0 18px 40px rgba(20,60,160,.18)" };

  return (
    <Frame>
      <div style={{ position: "absolute", overflow: "hidden", background: theme.winBg ?? "#F4F7FC", ...winStyle }}>
        {!fb ? (
          <div style={{ height: BAR, background: theme.bar ?? "#EEF1F6", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: `2px solid ${theme.barLine ?? "#DDE3EC"}` }}>
            {["#FF6B6B", "#FFC53D", "#3DD68C"].map((c) => (
              <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            ))}
            <div style={{ marginLeft: 14, fontSize: 24, fontWeight: 700, color: theme.barText ?? "#5B6678" }}>지문 분석 결과</div>
          </div>
        ) : null}
        <div style={fb ? { position: "absolute", top: 0, left: 0, width: 1080, height: 1920, overflow: "hidden" } : { position: "absolute", top: BAR, left: 0, width: W, height: AREA_H, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: fb ? 60 : 0, top: 0, width: W, height: TOTAL_H, transform: `translateY(${-y}px)` }}>
            {ORDER.map((n, i) => (
              <Img key={n} src={staticFile(`${dir}/${n}.png`)} style={{ position: "absolute", left: 0, top: tops[i], width: W }} />
            ))}
            {timeline.filter((s) => s.mark).map((s) => (
              <Mark key={s.name} name={s.name} start={s.arrive + 8} />
            ))}
          </div>
          {!fb ? (
            <div style={{ position: "absolute", right: 8, top: 8, width: 8, height: areaH - 16, borderRadius: 4, background: "rgba(0,0,0,.06)" }}>
              <div style={{ position: "absolute", top: (thumbY * (areaH - 16)) / areaH, width: 8, height: Math.max(60, (thumbH * (areaH - 16)) / areaH), borderRadius: 4, background: "rgba(0,0,0,.25)" }} />
            </div>
          ) : null}
        </div>
      </div>
      {theme.decor === "notebook" ? (
        <>
          <div style={{ position: "absolute", left: 20, top: 118, width: 200, height: 56, background: "rgba(255,212,59,.82)", transform: "rotate(-9deg)", boxShadow: "0 4px 10px rgba(0,0,0,.25)" }} />
          <div style={{ position: "absolute", left: 860, top: 1650, width: 200, height: 56, background: "rgba(255,212,59,.82)", transform: "rotate(-9deg)", boxShadow: "0 4px 10px rgba(0,0,0,.25)" }} />
        </>
      ) : null}
      {captions.map((c, i) => (
        <StyledCaption key={i} lines={c.lines} start={c.start} end={c.end} fx={c.fx} band={c.band} cy={fb ? 960 : c.cy} size={c.size} />
      ))}
    </Frame>
  );
};
