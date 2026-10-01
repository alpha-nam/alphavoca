import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { DataProvider } from "./data/context";
import type { ReelProps } from "./types";
import { Hook } from "./scenes/Hook";
import { PasteInput } from "./scenes/PasteInput";
import { MainIdea } from "./scenes/MainIdea";
import { Sentences } from "./scenes/Sentences";
import { Sketch } from "./scenes/Sketch";
import { Answer } from "./scenes/Answer";
import { Cta } from "./scenes/Cta";

const TRANSITION = 10;

export const SCENES = [
  { C: Hook, frames: 90 },
  { C: PasteInput, frames: 150 },
  { C: MainIdea, frames: 150 },
  { C: Sentences, frames: 210 },
  { C: Sketch, frames: 120 },
  { C: Answer, frames: 150 },
  { C: Cta, frames: 90 },
];
// 전환 구간은 앞뒤 장면이 겹치므로 총 길이에서 뺀다
export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0) - TRANSITION * (SCENES.length - 1);

export const Reel: React.FC<ReelProps> = ({ data, bgm }) => (
  <DataProvider data={data}>
    {bgm ? <Audio src={staticFile(bgm)} volume={0.35} /> : null}
    <TransitionSeries>
      {SCENES.flatMap(({ C, frames }, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
            <C />
          </TransitionSeries.Sequence>
        );
        if (i === SCENES.length - 1) return [seq];
        // 글자가 많은 장면이라 크로스페이드는 겹쳐 보인다 → 슬라이드로 통일
        const presentation = slide({ direction: "from-right" });
        return [
          seq,
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={presentation}
            timing={linearTiming({ durationInFrames: TRANSITION })}
          />,
        ];
      })}
    </TransitionSeries>
  </DataProvider>
);
