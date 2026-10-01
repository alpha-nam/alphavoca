import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div style={{ transform: `scale(${0.8 + 0.2 * s}) translateY(${(1 - s) * 40}px)`, opacity: s, ...style }}>
      {children}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "#fff",
      border: `3px solid ${theme.line}`,
      borderRadius: theme.radius,
      padding: 48,
      boxShadow: "0 12px 40px rgba(11,93,70,0.10)",
      ...style,
    }}
  >
    {children}
  </div>
);

// **bold** 구간을 형광펜 하이라이트로 렌더링
export const Highlighted: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            style={{
              fontWeight: 900,
              backgroundImage: `linear-gradient(${theme.accent}55, ${theme.accent}55)`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${progress * 100}% 40%`,
              backgroundPosition: "0 90%",
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
};
