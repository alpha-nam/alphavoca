import React from "react";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";

export const Cta: React.FC = () => (
  <Frame>
    <Pop>
      <OutlinedText lines={["이제 수업 준비는"]} size={74} />
    </Pop>
    <Pop delay={10}>
      <OutlinedText lines={["[[이렇게]] 해요!"]} size={150} />
    </Pop>
    <Pop delay={28}>
      <OutlinedText lines={["지문 분석부터 [[변형문제]]까지"]} size={56} />
    </Pop>
  </Frame>
);
