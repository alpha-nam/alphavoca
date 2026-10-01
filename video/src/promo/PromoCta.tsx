import React from "react";
import { Img, staticFile } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";

export const PromoCta: React.FC = () => (
  <Frame>
    <Pop style={{ alignSelf: "center" }}>
      <Img src={staticFile("sticker.png")} style={{ width: 340, display: "block", borderRadius: 40 }} />
    </Pop>
    <Pop delay={8}>
      <OutlinedText lines={["교재 문제 던져 넣고", "[[수업 준비 10분 컷]]"]} size={84} />
    </Pop>
    <Pop delay={22}>
      <OutlinedText lines={["분석 방법이 궁금하면 [[댓글]]로!"]} size={50} />
    </Pop>
  </Frame>
);
