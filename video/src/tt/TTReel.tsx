import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { BG_THEMES, ThemeProvider } from "../theme";
import { Uninstall, UNINSTALL_FRAMES } from "./Uninstall";
import { Install, INSTALL_FRAMES } from "./Install";
import { PlainCtx } from "./Desk";

const T = 10;
const SEQ = [{ C: Uninstall, frames: UNINSTALL_FRAMES }, { C: Install, frames: INSTALL_FRAMES }];
export const TT_TOTAL = SEQ.reduce((a, s) => a + s.frames, 0) - T * (SEQ.length - 1);

export const TTReel: React.FC<{ plain?: boolean }> = ({ plain = false }) => (
  <PlainCtx.Provider value={plain}>
  <ThemeProvider value={BG_THEMES.light}>
    <TransitionSeries>
      {SEQ.flatMap(({ C, frames }, i) => {
        const seq = (
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
            <C />
          </TransitionSeries.Sequence>
        );
        return i === SEQ.length - 1 ? [seq] : [seq, <TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />];
      })}
    </TransitionSeries>
  </ThemeProvider>
  </PlainCtx.Provider>
);
