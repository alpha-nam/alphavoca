import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";
import { useTheme } from "../theme";

export const Hook: React.FC = () => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - 50);
  const shake = Math.sin(frame * 1.2) * interpolate(frame, [70, 130], [0, 10], { extrapolateRight: "clamp" });
  const secs = Math.min(3 * 3600, Math.floor(local * 140));
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  return (
    <Frame>
      <Pop>
        <OutlinedText lines={["지문 하나 분석하는데"]} size={84} />
      </Pop>
      <Pop delay={50}>
        <OutlinedText lines={["아직도 [[3시간]]?"]} size={116} />
      </Pop>
      <Pop delay={50}>
        <div
          style={{
            fontSize: 170,
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
