import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Card, Highlighted, Pop } from "../components/Card";
import { theme } from "../theme";
import data from "../data/passage.json";

export const Sentences: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Frame caption="문장별 해석과 핵심 구문까지">
      {data.sentences.map((s, i) => {
        const start = i * 45;
        const progress = interpolate(frame, [start + 20, start + 40], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <Pop key={s.no} delay={start}>
            <Card style={{ padding: 36 }}>
              <div style={{ fontSize: 42, fontWeight: 400, lineHeight: 1.45 }}>
                <span style={{ color: theme.primary, fontWeight: 900 }}>{s.no}. </span>
                <Highlighted text={s.english} progress={progress} />
              </div>
              <div style={{ fontSize: 36, color: theme.muted, marginTop: 14 }}>{s.translation}</div>
            </Card>
          </Pop>
        );
      })}
    </Frame>
  );
};
