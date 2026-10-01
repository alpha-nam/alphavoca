import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Card, Pop } from "../components/Card";
import { theme } from "../theme";
import { useData } from "../data/context";

export const Answer: React.FC = () => {
  const data = useData();
  const frame = useCurrentFrame();
  return (
    <Frame caption="오답 소거까지 자동으로">
      {data.choices.map((c, i) => {
        const reveal = frame > 50 + i * 8;
        const fade = reveal && !c.correct ? interpolate(frame, [50 + i * 8, 62 + i * 8], [1, 0.3], { extrapolateRight: "clamp" }) : 1;
        return (
          <Pop key={c.label} delay={i * 8}>
            <Card
              style={{
                padding: 32,
                opacity: fade,
                borderColor: reveal && c.correct ? theme.ok : theme.line,
                background: reveal && c.correct ? theme.soft : "#fff",
              }}
            >
              <div style={{ fontSize: 46, fontWeight: 700, textDecoration: reveal && !c.correct ? "line-through" : "none" }}>
                {c.label} {c.text} {reveal && c.correct ? "✔" : ""}
              </div>
            </Card>
          </Pop>
        );
      })}
    </Frame>
  );
};
