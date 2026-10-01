import React from "react";
import { Frame } from "../components/Frame";
import { Shot } from "../components/Shot";

// 아래 장면은 모두 csat-passage-card 스킬이 만든 실제 HTML 카드의 캡처를 보여준다.
// (scripts/capture_card.mjs가 만든 public/card/<variant>/<name>.png)
type Opts = {
  zoom?: number;
  burst?: boolean;
  tap?: { x: number; y: number; at: number };
  sparks?: { x: number; y: number; at: number };
};
const scene = (lines: string[], name: string, o: Opts = {}): React.FC => {
  const S: React.FC = () => (
    <Frame lines={lines} burst={o.burst}>
      <Shot name={name} zoom={o.zoom} tap={o.tap} sparks={o.sparks} />
    </Frame>
  );
  return S;
};

export const CardHero = scene(["주제 · 요지까지", "[[자동]]으로!"], "hero", { burst: true });
export const CardSketch = scene(["개념 스케치도", "[[그려줘요]]"], "sketch", {
  zoom: 0.07,
  sparks: { x: 0.5, y: 0.55, at: 50 },
});
export const CardSent2 = scene(["문장마다 해석 · 문법", "[[착착]]"], "sent2", { tap: { x: 0.35, y: 0.86, at: 46 } });
export const CardSent4 = scene(["결론 문장까지", "[[한눈에]]"], "sent4");
export const CardLogic = scene(["논리 흐름", "[[한 번에]] 정리"], "logic");
export const CardAnswer = scene(["오답 소거까지", "[[끝]]!"], "answer", {
  sparks: { x: 0.5, y: 0.86, at: 46 },
});
export const CardVocab = scene(["핵심 어휘는", "[[덤]]!"], "vocab");
export const CardVariant = scene(["변형문제까지", "[[추천]]해줘요"], "variant", { burst: true });
