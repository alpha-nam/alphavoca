import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE, theme } from "../theme";

export const Frame: React.FC<{ children: React.ReactNode; caption?: string }> = ({ children, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, color: theme.text, opacity: fade }}>
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
