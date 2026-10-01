import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, theme } from "../theme";

export const Frame: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => {
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, color: theme.text }}>
      <AbsoluteFill
        style={{
          padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`,
          justifyContent: "center",
          gap: 40,
        }}
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
            fontSize: 44,
            fontWeight: 700,
            color: theme.dark,
          }}
        >
          {caption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
