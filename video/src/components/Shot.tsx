import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Pop } from "./Card";
import { useTheme } from "../theme";

// 스킬이 만든 실제 카드 캡처(public/card/<variant>/<name>.png)를 등장 + 느린 줌으로 보여준다
export const Shot: React.FC<{ name: string; delay?: number; zoom?: number }> = ({ name, delay = 0, zoom = 0.05 }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1 + zoom]);
  return (
    <Pop delay={delay}>
      <Img
        src={staticFile(`card/${theme.variant}/${name}.png`)}
        style={{ width: "100%", display: "block", transform: `scale(${scale})`, transformOrigin: "50% 40%", filter: `drop-shadow(0 14px 28px ${theme.variant === "dark" ? "rgba(0,0,0,.45)" : "rgba(20,60,160,.16)"})` }}
      />
    </Pop>
  );
};
