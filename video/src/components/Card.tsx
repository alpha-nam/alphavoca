import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";

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

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.surface,
        border: `3px solid ${theme.line}`,
        borderRadius: theme.radius,
        padding: 48,
        boxShadow: "0 12px 40px rgba(20,60,160,0.10)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
