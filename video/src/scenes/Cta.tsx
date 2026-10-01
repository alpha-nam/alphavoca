import React from "react";
import { Img, staticFile } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";

export const Cta: React.FC = () => (
  <Frame>
    <Pop style={{ alignSelf: "center" }}>
      <Img src={staticFile("sticker.png")} style={{ width: 360, display: "block", borderRadius: 40 }} />
    </Pop>
    <Pop delay={10}>
      <OutlinedText lines={["변형문제까지 자동!", "[[수업 준비 10분 컷]]"]} size={80} />
    </Pop>
  </Frame>
);
