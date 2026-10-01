import React from "react";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";

export const PromoCta: React.FC = () => (
  <Frame>
    <Pop>
      <OutlinedText lines={["이제 수업 준비는"]} size={74} />
    </Pop>
    <Pop delay={10}>
      <OutlinedText lines={["[[이렇게]] 해요!"]} size={150} />
    </Pop>
    <Pop delay={28}>
      <OutlinedText lines={["교재 문제 던져 넣고 [[10분 컷]]"]} size={56} />
    </Pop>
    <Pop delay={44}>
      <OutlinedText lines={["분석 방법이 궁금하면 [[댓글]]로!"]} size={46} />
    </Pop>
  </Frame>
);
