import React from "react";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";

export const PromoCta: React.FC = () => (
  <Frame>
    <Pop>
      <OutlinedText lines={["이제 수업 준비는"]} size={84} />
    </Pop>
    <Pop delay={10}>
      <OutlinedText lines={["[[이렇게]] 해요!"]} size={170} marker />
    </Pop>
  </Frame>
);
