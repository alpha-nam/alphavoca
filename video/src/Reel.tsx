import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { DataProvider } from "./data/context";
import { THEMES, ThemeProvider } from "./theme";
import type { ReelProps } from "./types";
import { Hook } from "./scenes/Hook";
import { PasteInput } from "./scenes/PasteInput";
import {
  CardAnswer, CardHero, CardLogic, CardSent2, CardSent4, CardSketch, CardVariant, CardVocab,
} from "./scenes/CardScenes";
import { Cta } from "./scenes/Cta";

const TRANSITION = 10;

export const SCENES = [
  { C: Hook, frames: 130 },
  { C: PasteInput, frames: 110 },
  { C: CardHero, frames: 90 },
  { C: CardSketch, frames: 100 },
  { C: CardSent2, frames: 100 },
  { C: CardSent4, frames: 90 },
  { C: CardLogic, frames: 90 },
  { C: CardAnswer, frames: 100 },
  { C: CardVocab, frames: 80 },
  { C: CardVariant, frames: 100 },
  { C: Cta, frames: 80 },
];
// 전환 구간은 앞뒤 장면이 겹치므로 총 길이에서 뺀다
export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0) - TRANSITION * (SCENES.length - 1);

export const Reel: React.FC<ReelProps> = ({ data, variant, bgm }) => (
  <ThemeProvider value={THEMES[variant]}>
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
          return [
            seq,
            <TransitionSeries.Transition
              key={`t${i}`}
              presentation={slide({ direction: "from-right" })}
              timing={linearTiming({ durationInFrames: TRANSITION })}
            />,
          ];
        })}
      </TransitionSeries>
    </DataProvider>
  </ThemeProvider>
);
