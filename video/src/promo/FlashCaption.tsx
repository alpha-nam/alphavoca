import React from "react";
import { Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { OutlinedText, Sparks, Starburst } from "../components/Caption";
import { ThemeProvider, useTheme } from "../theme";
import { FX, type FxName } from "./CaptionLab";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// 화면 한가운데에 크게 튀어나오는 자막: 별 폭발 + 파티클 + 오버슈트 팝 + 형광 띠 + 반짝이는 글로우
export const FlashCaption: React.FC<{ lines: string[]; start: number; end: number; cy?: number }> = ({ lines, start, end, cy: cyProp }) => {
  const theme = useTheme();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < start || f > end) return null;
  const cy = cyProp ?? (theme.fullBleed ? 960 : 910);
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


// 장면마다 다른 모션 스타일 + 띠 색 + 위치/크기 변화를 주는 자막
export const StyledCaption: React.FC<{
  lines: string[];
  start: number;
  end: number;
  fx: FxName;
  band: string;
  cy?: number;
  size?: number;
}> = ({ lines, start, end, fx, band, cy = 910, size = 108 }) => {
  const theme = useTheme();
  const f = useCurrentFrame();
  if (f < start || f > end) return null;
  const out = interpolate(f, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const C = FX[fx];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: cy, transform: `translateY(-50%) scale(${1 + (1 - out) * 0.08})`, opacity: out, display: "grid", placeItems: "center", pointerEvents: "none", filter: "drop-shadow(0 12px 16px rgba(0,0,0,.28))" }}>
      <Sequence from={start} layout="none">
        <ThemeProvider value={{ ...theme, primary: band, accent: band }}>
          <C lines={lines} size={size} />
        </ThemeProvider>
      </Sequence>
    </div>
  );
};
