import React from "react";
import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { BG_THEMES, ThemeProvider, type BgVariant } from "../theme";
import { PromoHook } from "./PromoHook";
import { PromoScroll, SCROLL_FRAMES } from "./PromoScroll";
import { PromoCta } from "./PromoCta";
import { PromoRecap } from "./PromoRecap";

const TRANSITION = 10;
const SEQ = [
  { C: PromoHook, frames: 170 },
  { C: PromoScroll, frames: SCROLL_FRAMES },
  { C: PromoRecap, frames: 90 },
  { C: PromoCta, frames: 80 },
];
export const PROMO_TOTAL = SEQ.reduce((a, s) => a + s.frames, 0) - TRANSITION * (SEQ.length - 1);

export const PromoReel: React.FC<{ bgm?: string; bg?: BgVariant }> = ({ bgm, bg = "light" }) => (
  <ThemeProvider value={BG_THEMES[bg]}>
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
