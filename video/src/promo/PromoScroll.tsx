import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Frame } from "../components/Frame";
import { OutlinedText, Sparks, Starburst } from "../components/Caption";
import { SAFE, useTheme } from "../theme";
import manifest from "../data/promo-manifest.json";

type M = { w: number; h: number; mark?: { x: number; y: number; w: number; h: number } };
const M_ = manifest as unknown as Record<string, M>;

const ORDER = ["header", "sketch", "vocab", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "logic", "analogy", "answer", "tips", "variants"];
const W = 960; // 화면에 표시하는 폭
const GAP = 26;
const VIEW_TOP = 140; // 기능 화면을 위아래로 늘렸다 (인스타 UI 안전 영역 안쪽)
const BAR = 56;
const VIEW_H = 1540;
const AREA_H = VIEW_H - BAR;
const CENTER_Y = VIEW_TOP + VIEW_H / 2;
const CENTER_Y_FULL = 960;

const heights = ORDER.map((n) => (W * M_[n].h) / M_[n].w);
const tops = heights.reduce<number[]>((acc, h, i) => [...acc, i === 0 ? 0 : acc[i - 1] + heights[i - 1] + GAP], []);
const TOTAL_H = tops[tops.length - 1] + heights[heights.length - 1];

type Stop = { name: string; hold: number; speed: number; lines: string[]; mark?: boolean };
// 쭉쭉 내리다가 핵심에서 멈춘다 (speed: px/frame). 자막은 [[강조]]에 형광 띠가 깔린다.
const SENT: string[] = ["문장마다", "[[해석 · 문법]]"];
const STOPS: Stop[] = [
  { name: "header", hold: 46, speed: 0, lines: ["주제 · 요지", "[[쉬운 설명]]까지"] },
  { name: "sketch", hold: 46, speed: 34, lines: ["개념 스케치도", "[[자동]]으로!"] },
  { name: "vocab", hold: 34, speed: 34, lines: ["핵심 어휘", "[[정리]]까지"] },
  { name: "s1", hold: 8, speed: 40, lines: SENT },
  { name: "s4", hold: 0, speed: 78, lines: SENT },
  { name: "s6", hold: 64, speed: 62, lines: ["무관한 문장,", "[[왜]] 아닌지까지"], mark: true },
  { name: "logic", hold: 40, speed: 50, lines: ["논리 흐름", "[[한눈에]]"] },
  { name: "analogy", hold: 40, speed: 40, lines: ["설명용", "[[비유]]까지"] },
  { name: "answer", hold: 66, speed: 40, lines: ["정답 근거와", "[[오답 분석]]"], mark: true },
  { name: "tips", hold: 34, speed: 40, lines: ["수업 [[팁]]도", "[[덤]]!"] },
  { name: "variants", hold: 64, speed: 40, lines: ["변형문제까지", "[[자동 추천]]"] },
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
const CAP_LIFE = 34; // 도착 후 자막이 화면 중앙에 머무는 프레임
const captions = (() => {
  const out: { lines: string[]; start: number; end: number }[] = [];
  for (const s of timeline) {
    const key = s.lines.join("|");
    const last = out[out.length - 1];
    if (last && last.lines.join("|") === key) {
      last.end = s.arrive + CAP_LIFE;
    } else {
      out.push({ lines: s.lines, start: Math.max(0, s.arrive - 8), end: s.arrive + CAP_LIFE });
    }
  }
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

// 화면 한가운데에 크게 튀어나오는 자막: 별 폭발 + 파티클 + 오버슈트 팝 + 형광 띠 + 반짝이는 글로우
const FlashCaption: React.FC<{ lines: string[]; start: number; end: number }> = ({ lines, start, end }) => {
  const theme = useTheme();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start || f > end) return null;
  const cy = theme.fullBleed ? CENTER_Y_FULL : CENTER_Y;
  const t = f - start;
  const pop = spring({ frame: t, fps, config: { damping: 8, stiffness: 230, mass: 0.8 } });
  const band = spring({ frame: t - 6, fps, config: { damping: 18, stiffness: 140 } });
  const out = interpolate(f, [end - 9, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outScale = interpolate(f, [end - 9, end], [1, 1.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wobble = Math.sin(t * 0.55) * 0.012;
  const rot = (1 - pop) * -9 + Math.sin(t * 0.35) * 0.8;
  const glow = 22 + Math.sin(t * 0.45) * 10;
  const burstP = clamp(t / 20, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: cy, transform: "translateY(-50%)", pointerEvents: "none", opacity: out }}>
      {/* 뒤에서 터지는 별 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%,-50%) scale(${0.3 + 0.9 * pop}) rotate(${t * 1.8}deg)`,
          opacity: (1 - burstP) * 0.9,
        }}
      >
        <Starburst color={theme.hi} size={860} />
      </div>
      {/* 좌우로 튀는 파티클 */}
      <div style={{ position: "absolute", left: 250, top: "50%" }}>
        <Sparks at={start + 3} count={20} />
      </div>
      <div style={{ position: "absolute", left: 830, top: "50%" }}>
        <Sparks at={start + 6} count={20} />
      </div>
      {/* 글자 */}
      <div
        style={{
          position: "relative",
          transform: `scale(${(0.35 + 0.65 * pop + wobble) * outScale}) rotate(${rot}deg)`,
          filter: `drop-shadow(0 0 ${glow}px ${theme.hi}) drop-shadow(0 14px 18px rgba(0,0,0,.35))`,
        }}
      >
        <OutlinedText lines={lines} size={108} marker markerProgress={clamp(band, 0, 1)} />
      </div>
    </div>
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
        <FlashCaption key={i} lines={c.lines} start={c.start} end={c.end} />
      ))}
    </Frame>
  );
};
