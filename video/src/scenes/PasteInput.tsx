import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Card, Pop } from "../components/Card";
import { useTheme } from "../theme";
import { useData } from "../data/context";

export const PasteInput: React.FC = () => {
  const data = useData();
  const theme = useTheme();
  const frame = useCurrentFrame();
  const chars = Math.floor(interpolate(frame, [10, 100], [0, data.passage.length], { extrapolateRight: "clamp" }));
  const analyzing = frame > 105;
  return (
    <Frame caption="지문을 붙여넣기만 하세요">
      <Card>
        <div style={{ fontSize: 40, lineHeight: 1.6, minHeight: 520 }}>
          {data.passage.slice(0, chars)}
          <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>|</span>
        </div>
      </Card>
      {analyzing ? (
        <Pop style={{ alignSelf: "center" }}>
          <div
            style={{
              background: theme.primary,
              color: "#fff",
              fontSize: 48,
              fontWeight: 700,
              padding: "20px 48px",
              borderRadius: 999,
            }}
          >
            분석 중{".".repeat((Math.floor(frame / 8) % 3) + 1)}
          </div>
        </Pop>
      ) : null}
    </Frame>
  );
};
