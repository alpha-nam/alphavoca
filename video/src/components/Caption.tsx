import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";

// "[[강조]]" 구간은 강조색으로 칠한다
// marker: 강조 구간 뒤에 띠(형광 하이라이트)를 깐다. markerProgress(0~1)로 띠가 쓱 그려진다.
const renderLine = (line: string, hi: string, band?: string, progress = 1) =>
  line.split(/\[\[(.+?)\]\]/g).map((p, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        style={{
          color: hi,
          ...(band
            ? {
                padding: "0 0.1em",
                borderRadius: "0.14em",
                backgroundImage: `linear-gradient(${band}, ${band})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${progress * 100}% 78%`,
                backgroundPosition: "0 62%",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
              }
            : {}),
        }}
      >
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );

export const OutlinedText: React.FC<{
  lines: string[];
  size: number;
  style?: React.CSSProperties;
  marker?: boolean;
  markerProgress?: number;
}> = ({ lines, size, style, marker, markerProgress = 1 }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.18,
        textAlign: "center",
        color: theme.fill,
        WebkitTextStroke: `${size * 0.17}px ${theme.stroke}`,
        paintOrder: "stroke fill",
        filter: `drop-shadow(0 ${size * 0.06}px 0 ${theme.stroke})`,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{renderLine(l, theme.hi, marker ? theme.primary : undefined, markerProgress)}</div>
      ))}
    </div>
  );
};

// 터지는 모양의 별 그래픽 (자막 뒤)
export const Starburst: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const spikes = 18;
  const pts = Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (Math.PI * i) / spikes;
    const r = i % 2 === 0 ? 1 : 0.7;
    return `${50 + 50 * r * Math.cos(a)},${50 + 50 * r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
      <polygon points={pts} fill={color} />
    </svg>
  );
};

// 처음엔 화면 한가운데에서 크게 튀어나왔다가, 아래 자막 위치로 내려간다
export const CenterCaption: React.FC<{ lines: string[]; burst?: boolean; hold?: number }> = ({
  lines,
  burst,
  hold = 34,
}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame, [hold, hold + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 180 } });
  const top = 880 + (1560 - 880) * t;
  const size = 104 - 44 * t;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, transform: "translateY(-50%)", pointerEvents: "none" }}>
      {burst ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%,-50%) scale(${0.3 + 0.7 * pop}) rotate(${frame * 1.2}deg)`,
            opacity: (1 - t) * 0.95,
          }}
        >
          <Starburst color={theme.primary} size={760} />
        </div>
      ) : null}
      <div style={{ position: "relative", transform: `scale(${0.6 + 0.4 * pop})`, opacity: Math.min(1, pop * 1.4) }}>
        <OutlinedText lines={lines} size={size} />
      </div>
    </div>
  );
};

// 한 점에서 퍼지는 파티클
export const Sparks: React.FC<{ at: number; count?: number }> = ({ at, count = 22 }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const p = (frame - at) / 30;
  if (p < 0 || p > 1) return null;
  const e = Easing.out(Easing.cubic)(p);
  const colors = [theme.hi, theme.primary, "#FFFFFF", theme.accent];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, overflow: "visible" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const d = (130 + random(`d${i}`) * 260) * e;
        const s = 10 + random(`s${i}`) * 16;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.cos(a) * d - s / 2,
              top: Math.sin(a) * d - s / 2,
              width: s,
              height: s,
              borderRadius: i % 3 === 0 ? "50%" : 4,
              background: colors[i % colors.length],
              opacity: 1 - p,
              transform: `rotate(${p * 360 * (i % 2 ? 1 : -1)}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

// 손가락으로 누르는 느낌: 손가락 원이 이동한 뒤 물결 링이 퍼진다
export const Tap: React.FC<{ at: number }> = ({ at }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const move = interpolate(frame, [at, at + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ring = interpolate(frame, [at + 14, at + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fingerOpacity = interpolate(frame, [at, at + 6, at + 44, at + 54], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (frame < at || frame > at + 54) return null;
  const press = frame >= at + 14 && frame < at + 22 ? 0.86 : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, overflow: "visible" }}>
      <div
        style={{
          position: "absolute",
          left: -150 * ring,
          top: -150 * ring,
          width: 300 * ring,
          height: 300 * ring,
          borderRadius: "50%",
          border: `8px solid ${theme.primary}`,
          opacity: ring > 0 ? 0.7 * (1 - ring) : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -38 + (1 - move) * 90,
          top: -38 + (1 - move) * 130,
          width: 76,
          height: 76,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          border: `5px solid ${theme.stroke}`,
          boxShadow: "0 10px 24px rgba(0,0,0,.35)",
          opacity: fingerOpacity,
          transform: `scale(${press})`,
        }}
      />
    </div>
  );
};
