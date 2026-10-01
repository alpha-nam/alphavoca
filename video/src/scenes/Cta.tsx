import React from "react";
import { Img, staticFile } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { theme } from "../theme";

export const Cta: React.FC = () => (
  <Frame>
    <Pop style={{ alignSelf: "center" }}>
      <Img src={staticFile("sticker.png")} style={{ width: 360, display: "block" }} />
    </Pop>
    <Pop delay={10}>
      <div style={{ fontSize: 64, fontWeight: 900, textAlign: "center", lineHeight: 1.35 }}>
        변형문제까지 자동!
        <br />
        <span style={{ color: theme.accent }}>수업 준비 10분 컷</span>
      </div>
    </Pop>
  </Frame>
);
