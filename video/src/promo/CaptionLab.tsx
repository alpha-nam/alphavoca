import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { OutlinedText, Sparks } from "../components/Caption";
import { BG_THEMES, ThemeProvider, useTheme } from "../theme";

// "[[강조]]" 파서 → 글자 단위 [{ch, em}]
const parse = (line: string) => {
  const out: { ch: string; em: boolean }[] = [];
  line.split(/\[\[(.+?)\]\]/g).forEach((p, i) => [...p].forEach((ch) => out.push({ ch, em: i % 2 === 1 })));
  return out;
};
const stroke = (theme: ReturnType<typeof useTheme>, size: number): React.CSSProperties => ({
  fontWeight: 900, fontSize: size, color: theme.fill, WebkitTextStroke: `${size * 0.17}px ${theme.stroke}`, paintOrder: "stroke fill" as never,
});
type P = { lines: string[]; size: number };
const ease = Easing.out(Easing.cubic);

// 1) 글자 쪼개 튀기기
const Drop: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const theme = useTheme();
  let n = 0;
  return (
    <div style={{ textAlign: "center", lineHeight: 1.4 }}>
      {lines.map((l, i) => (
        <div key={i}>
          {parse(l).map((c, j) => {
            const k = n++;
            const s = spring({ frame: f - k * 1.6, fps, config: { damping: 9, stiffness: 220 } });
            return <span key={j} style={{ ...stroke(theme, size), display: "inline-block", whiteSpace: "pre", color: c.em ? theme.hi : theme.fill, transform: `translateY(${(1 - s) * -90}px) rotate(${(1 - s) * -14}deg)`, opacity: Math.min(1, s * 2) }}>{c.ch}</span>;
          })}
        </div>
      ))}
    </div>
  );
};
// 2) 형광펜 긋기 (별/파티클 없이 띠만)
const Marker: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame();
  return <OutlinedText lines={lines} size={size} marker markerProgress={Easing.out(Easing.quad)(Math.min(1, f / 18))} />;
};
// 3) 와이프 공개
const Wipe: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 16], [100, 0], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return <div style={{ clipPath: `inset(0 ${p}% 0 0)` }}><OutlinedText lines={lines} size={size} /></div>;
};
// 4) 스탬프 쾅
const Stamp: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame(); const theme = useTheme();
  const s = interpolate(f, [0, 7, 11], [2.6, 0.92, 1], { extrapolateRight: "clamp" });
  const shake = f >= 7 && f < 17 ? Math.sin(f * 4) * (17 - f) * 0.7 : 0;
  const ring = interpolate(f, [7, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", transform: `translate(${shake}px,${-shake}px)` }}>
      {f >= 7 ? <div style={{ position: "absolute", left: "50%", top: "50%", width: 360 * ring, height: 360 * ring * 0.55, transform: "translate(-50%,-50%)", border: `5px solid ${theme.hi}`, borderRadius: "50%", opacity: 1 - ring }} /> : null}
      <div style={{ transform: `scale(${s}) rotate(${(s - 1) * -4}deg)`, opacity: interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" }) }}>
        <OutlinedText lines={lines} size={size} />
      </div>
    </div>
  );
};
// 5) 타자기
const Type: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame(); const theme = useTheme();
  const total = lines.join("").replace(/\[\[|\]\]/g, "").length;
  const shown = Math.floor(interpolate(f, [0, 22], [0, total], { extrapolateRight: "clamp" }));
  let n = 0;
  return (
    <div style={{ textAlign: "center", lineHeight: 1.4 }}>
      {lines.map((l, i) => (
        <div key={i}>
          {parse(l).map((c, j) => { const k = n++; return <span key={j} style={{ ...stroke(theme, size), whiteSpace: "pre", color: c.em ? theme.hi : theme.fill, opacity: k < shown ? 1 : 0 }}>{c.ch}</span>; })}
          {shown >= n - parse(l).length && shown <= n ? <span style={{ display: "inline-block", width: size * 0.12, height: size * 0.85, background: theme.hi, marginLeft: 4, verticalAlign: "middle", opacity: f % 10 < 6 ? 1 : 0 }} /> : null}
        </div>
      ))}
    </div>
  );
};
// 6) 밑줄 그리기 + 동그라미
const Underline: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame(); const theme = useTheme();
  const a = interpolate(f, [6, 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <OutlinedText lines={lines} size={size} />
      <svg viewBox="0 0 300 40" style={{ position: "absolute", left: -6, right: -6, bottom: -size * 0.28, width: "108%", height: size * 0.5, overflow: "visible" }}>
        <path d="M6 24 C 60 4, 110 36, 160 18 S 250 8, 294 22" fill="none" stroke={theme.accent} strokeWidth={size * 0.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={a} />
      </svg>
    </div>
  );
};
// 7) 슬라이드 스택 (두 줄이 반대 방향에서 맞물림)
const Stack: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame();
  const x = (d: number) => interpolate(f, [d, d + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i} style={{ transform: `translateX(${(i % 2 ? 1 : -1) * x(i * 3) * 420}px)`, opacity: 1 - x(i * 3) * 0.6 }}>
          <OutlinedText lines={[l]} size={size} />
        </div>
      ))}
    </div>
  );
};
// 8) 반짝 하이라이트 (빛이 한 번 지나가고 별이 붙음)
const Shine: React.FC<P> = ({ lines, size }) => {
  const f = useCurrentFrame(); const theme = useTheme();
  const x = interpolate(f, [8, 30], [-30, 130], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tw = interpolate(f, [14, 22, 30], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", display: "inline-block", opacity: interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" }) }}>
      <OutlinedText lines={lines} size={size} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${x - 14}%, rgba(255,255,255,.95) ${x}%, transparent ${x + 14}%)`, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <svg viewBox="-20 -20 40 40" style={{ position: "absolute", right: -size * 0.3, top: -size * 0.35, width: size * 0.9, height: size * 0.9, transform: `scale(${tw}) rotate(${f * 6}deg)` }}>
        <polygon points="0,-18 4,-4 18,0 4,4 0,18 -4,4 -18,0 -4,-4" fill={theme.hi} stroke={theme.stroke} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const FX = { drop: Drop, marker: Marker, wipe: Wipe, stamp: Stamp, type: Type, underline: Underline, stack: Stack, shine: Shine };
export type FxName = keyof typeof FX;

const STYLES: { name: string; use: string; C: React.FC<P> }[] = [
  { name: "① 글자 쪼개 튀기기", use: "주제·요지, 해석", C: Drop },
  { name: "② 형광펜 긋기", use: "어휘, 핵심 문장", C: Marker },
  { name: "③ 와이프 공개", use: "논리 흐름, 설계도", C: Wipe },
  { name: "④ 스탬프 쾅", use: "정답, 오답 분석", C: Stamp },
  { name: "⑤ 타자기", use: "변형문제, 영작", C: Type },
  { name: "⑥ 밑줄 그리기", use: "해석 주의, 팁", C: Underline },
  { name: "⑦ 슬라이드 스택", use: "스케치, 비유", C: Stack },
  { name: "⑧ 반짝 하이라이트", use: "마무리, 요약", C: Shine },
];
const TIMES = [4, 11, 28];
const LINES = ["문장마다", "[[해석 · 문법]]"];

export const CaptionLab: React.FC = () => (
  <ThemeProvider value={BG_THEMES.light}>
    <AbsoluteFill style={{ background: "#EEF3FC", fontFamily: BG_THEMES.light.font, padding: "16px 12px" }}>
      <div style={{ display: "grid", gridTemplateRows: "repeat(8, 1fr)", gap: 10, height: "100%" }}>
        {STYLES.map(({ name, use, C }) => (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "230px 1fr 1fr 1fr", gap: 10, alignItems: "stretch" }}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 14px rgba(20,60,160,.1)" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0A1A3F", lineHeight: 1.25, whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 20, color: "#5F6B85", marginTop: 6 }}>{use}</div>
            </div>
            {TIMES.map((t) => (
              <div key={t} style={{ background: "#fff", borderRadius: 18, display: "grid", placeItems: "center", overflow: "hidden", boxShadow: "0 4px 14px rgba(20,60,160,.1)", position: "relative" }}>
                <Sequence from={-t} layout="none">
                  <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%" }}>
                    <C lines={LINES} size={44} />
                  </div>
                </Sequence>
                <div style={{ position: "absolute", right: 10, bottom: 6, fontSize: 18, color: "#9AA5B6", fontWeight: 700 }}>{t === 4 ? "시작" : t === 11 ? "중간" : "완료"}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  </ThemeProvider>
);
