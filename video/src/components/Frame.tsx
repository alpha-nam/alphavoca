import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, useTheme } from "../theme";
import { CenterCaption } from "./Caption";

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
        fontFamily: theme.font,
        color: theme.text,
      }}
    >
      <AbsoluteFill
        style={{ padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`, justifyContent: "center", gap: 36 }}
      >
        {children}
      </AbsoluteFill>
      {lines ? <CenterCaption lines={lines} burst={burst} hold={hold} /> : null}
    </AbsoluteFill>
  );
};
