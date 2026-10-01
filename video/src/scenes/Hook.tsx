import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { useTheme } from "../theme";

export const Hook: React.FC = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 1.2) * interpolate(frame, [30, 90], [0, 10], { extrapolateRight: "clamp" });
  const secs = Math.min(3 * 3600, Math.floor(frame * 120));
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  return (
    <Frame>
      <Pop>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.3, textAlign: "center" }}>
          지문 분석,
          <br />
          아직도 <span style={{ color: theme.accent }}>3시간</span> 걸려요?
        </div>
      </Pop>
      <Pop delay={20}>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            textAlign: "center",
            color: theme.primary,
            transform: `translateX(${shake}px)`,
          }}
        >
          {h}:{m}:00
        </div>
      </Pop>
    </Frame>
  );
};
