import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { theme } from "../theme";
import data from "../data/passage.json";

// 개념 스케치: 선이 그려지듯 등장하는 통념 vs 진실 다이어그램
export const Sketch: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = (from: number, len: number) =>
    interpolate(frame, [from, from + 30], [len, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame caption={data.sketch.caption}>
      <svg viewBox="0 0 960 760" width="100%">
        <rect x="20" y="20" width="420" height="140" rx="24" fill="#fff" stroke={theme.bad} strokeWidth="5"
          strokeDasharray="1100" strokeDashoffset={draw(0, 1100)} />
        <text x="230" y="105" textAnchor="middle" fontSize="36" fontWeight="700" fill={theme.bad}
          opacity={interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" })}>
          {data.sketch.left}
        </text>
        <rect x="20" y="300" width="920" height="140" rx="24" fill={theme.soft} stroke={theme.primary} strokeWidth="5"
          strokeDasharray="2100" strokeDashoffset={draw(35, 2100)} />
        <text x="480" y="385" textAnchor="middle" fontSize="40" fontWeight="900" fill={theme.dark}
          opacity={interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" })}>
          {data.sketch.right}
        </text>
        <path d="M 480 440 L 480 600" stroke={theme.accent} strokeWidth="8" fill="none"
          strokeDasharray="160" strokeDashoffset={draw(70, 160)} />
        <path d="M 440 570 L 480 620 L 520 570" stroke={theme.accent} strokeWidth="8" fill="none"
          opacity={interpolate(frame, [90, 100], [0, 1], { extrapolateRight: "clamp" })} />
        <text x="480" y="700" textAnchor="middle" fontSize="44" fontWeight="900" fill={theme.accent}
          opacity={interpolate(frame, [90, 105], [0, 1], { extrapolateRight: "clamp" })}>
          성장
        </text>
      </svg>
    </Frame>
  );
};
