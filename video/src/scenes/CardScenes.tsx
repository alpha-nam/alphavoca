import React from "react";
import { Frame } from "../components/Frame";
import { Shot } from "../components/Shot";

// 아래 장면은 모두 csat-passage-card 스킬이 만든 실제 HTML 카드의 캡처를 보여준다.
// (scripts/capture_card.mjs가 만든 public/card/<variant>/<name>.png)
const scene = (caption: string, name: string, zoom?: number): React.FC => {
  const S: React.FC = () => (
    <Frame caption={caption}>
      <Shot name={name} zoom={zoom} />
    </Frame>
  );
  return S;
};

export const CardHero = scene("주제 · 요지 · 쉬운 설명부터", "hero");
export const CardSketch = scene("개념 스케치까지 자동", "sketch", 0.07);
export const CardSent2 = scene("문장마다 해석 · 설명 · 문법", "sent2");
export const CardSent4 = scene("결론 문장까지 한눈에", "sent4");
export const CardLogic = scene("논리 흐름 정리", "logic");
export const CardAnswer = scene("정답 · 오답 분석", "answer");
export const CardVocab = scene("핵심 어휘", "vocab");
export const CardVariant = scene("변형문제 추천까지", "variant");
