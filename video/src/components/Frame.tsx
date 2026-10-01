import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, useTheme } from "../theme";

export const Frame: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => {
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
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: SAFE.side,
            right: SAFE.side,
            bottom: SAFE.bottom,
            textAlign: "center",
            fontSize: 46,
            fontWeight: 800,
            color: theme.caption,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
