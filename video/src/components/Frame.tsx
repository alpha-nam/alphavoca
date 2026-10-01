import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, useTheme } from "../theme";
import { CenterCaption } from "./Caption";

// 배경 장식: 칠판 아래 분필 받침대 / 노트 링 구멍
const Decor: React.FC = () => {
  const theme = useTheme();
  if (theme.decor === "chalk") {
    return (
      <div style={{ position: "absolute", left: 31, right: 31, bottom: 31, height: 44, background: "linear-gradient(#9B6A3A,#7C522B)", boxShadow: "0 -4px 10px rgba(0,0,0,.35)" }}>
        {[{ x: 120, w: 70, r: -4, c: "#F7F7F2" }, { x: 230, w: 46, r: 8, c: "#FFE08A" }, { x: 760, w: 64, r: 3, c: "#F7F7F2" }].map((p) => (
          <div key={p.x} style={{ position: "absolute", left: p.x, top: -14, width: p.w, height: 16, borderRadius: 8, background: p.c, transform: `rotate(${p.r}deg)` }} />
        ))}
      </div>
    );
  }
  if (theme.decor === "notebook") {
    return (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 38, top: 140 + i * 224, width: 38, height: 38, borderRadius: 19, background: "#E9EEF7", boxShadow: "inset 0 3px 6px rgba(0,0,0,.28)" }} />
        ))}
      </>
    );
  }
  return null;
};

export const Frame: React.FC<{
  children: React.ReactNode;
  lines?: string[]; // 중앙→하단 외곽선 자막 (줄 단위, [[강조]] 지원)
  burst?: boolean;
  hold?: number;
}> = ({ children, lines, burst, hold }) => {
  const theme = useTheme();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 700px at 15% -5%, ${theme.glow}, transparent 70%), ${theme.bg}`,
        ...(theme.pattern
          ? {
              backgroundImage: `radial-gradient(${theme.pattern} 3px, transparent 3.5px), radial-gradient(1200px 700px at 15% -5%, ${theme.glow}, transparent 70%)`,
              backgroundSize: "44px 44px, 100% 100%",
            }
          : {}),
        fontFamily: theme.font,
        color: theme.text,
        ...(theme.bgStyle ?? {}),
      }}
    >
      <Decor />
      <AbsoluteFill
        style={{ padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`, justifyContent: "center", gap: 36 }}
      >
        {children}
      </AbsoluteFill>
      {lines ? <CenterCaption lines={lines} burst={burst} hold={hold} /> : null}
    </AbsoluteFill>
  );
};
