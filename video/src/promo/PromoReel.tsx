import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { THEMES, ThemeProvider } from "../theme";
import { PromoHook } from "./PromoHook";
import { PromoScroll, SCROLL_FRAMES } from "./PromoScroll";
import { PromoCta } from "./PromoCta";

const TRANSITION = 10;
const SEQ = [
  { C: PromoHook, frames: 150 },
  { C: PromoScroll, frames: SCROLL_FRAMES },
  { C: PromoCta, frames: 90 },
];
export const PROMO_TOTAL = SEQ.reduce((a, s) => a + s.frames, 0) - TRANSITION * (SEQ.length - 1);

export const PromoReel: React.FC<{ bgm?: string }> = ({ bgm }) => (
  <ThemeProvider value={THEMES.blue}>
    {bgm ? <Audio src={staticFile(bgm)} volume={0.35} /> : null}
    <TransitionSeries>
      {SEQ.flatMap(({ C, frames }, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
            <C />
          </TransitionSeries.Sequence>
        );
        if (i === SEQ.length - 1) return [seq];
        return [
          seq,
          <TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: TRANSITION })} />,
        ];
      })}
    </TransitionSeries>
  </ThemeProvider>
);
