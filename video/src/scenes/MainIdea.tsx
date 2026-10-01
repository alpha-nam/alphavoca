import React from "react";
import { Frame } from "../components/Frame";
import { Card, Pop } from "../components/Card";
import { theme } from "../theme";
import data from "../data/passage.json";

export const MainIdea: React.FC = () => (
  <Frame caption="핵심 주제를 먼저 잡아줘요">
    <Pop>
      <div style={{ fontSize: 44, fontWeight: 700, color: theme.primary }}>TOPIC</div>
      <div style={{ fontSize: 88, fontWeight: 900 }}>{data.topic}</div>
    </Pop>
    <Pop delay={25}>
      <Card style={{ background: theme.soft, borderColor: theme.primary }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: theme.dark }}>MAIN IDEA</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.4, marginTop: 16 }}>{data.main_idea}</div>
      </Card>
    </Pop>
  </Frame>
);
