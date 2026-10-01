import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Pop } from "./Card";
import { Sparks, Tap } from "./Caption";
import { useTheme } from "../theme";

type Point = { x: number; y: number; at: number }; // x,y: 이미지 기준 0~1

// 스킬이 만든 실제 카드 캡처(public/card/<variant>/<name>.png)를 등장 + 스와이프 + 느린 줌으로 보여준다
export const Shot: React.FC<{ name: string; zoom?: number; tap?: Point; sparks?: Point }> = ({
  name,
  zoom = 0.05,
  tap,
  sparks,
}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1 + zoom]);
  // 아래에서 쓸어 올라오듯 들어오는 스와이프
  const swipe = interpolate(frame, [0, 24], [70, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const shadow = theme.variant === "dark" ? "rgba(0,0,0,.45)" : "rgba(20,60,160,.16)";
  return (
    <Pop>
      <div
        style={{
          position: "relative",
          transform: `translateY(${swipe}px) scale(${scale})`,
          transformOrigin: "50% 40%",
          filter: `drop-shadow(0 14px 28px ${shadow})`,
        }}
      >
        <Img src={staticFile(`card/${theme.variant}/${name}.png`)} style={{ width: "100%", display: "block" }} />
        {sparks ? (
          <div style={{ position: "absolute", left: `${sparks.x * 100}%`, top: `${sparks.y * 100}%` }}>
            <Sparks at={sparks.at} />
          </div>
        ) : null}
        {tap ? (
          <div style={{ position: "absolute", left: `${tap.x * 100}%`, top: `${tap.y * 100}%` }}>
            <Tap at={tap.at} />
          </div>
        ) : null}
      </div>
    </Pop>
  );
};
