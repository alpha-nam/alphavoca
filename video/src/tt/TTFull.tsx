import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { BG_THEMES, ThemeProvider } from "../theme";
import { Uninstall, UNINSTALL_FRAMES } from "./Uninstall";
import { Install, INSTALL_FRAMES } from "./Install";
import { PlainCtx } from "./Desk";
import { RTimetable, RSwap, RToday, RAtt, RPhone, RSubj, RMemo, RCal } from "./RealScenes";
import { Connect, CONNECT_FRAMES, Outro, OUTRO_FRAMES } from "./Scenes2";

const T = 10;
const SEQ = [
  { C: Uninstall, frames: UNINSTALL_FRAMES }, { C: Install, frames: INSTALL_FRAMES }, { C: Connect, frames: CONNECT_FRAMES },
  RTimetable, RSwap, RToday, RAtt, RPhone, RSubj, RMemo, RCal,
  { C: Outro, frames: OUTRO_FRAMES },
];
export const FULL_TOTAL = SEQ.reduce((a, s) => a + s.frames, 0) - T * (SEQ.length - 1);

export const TTFull: React.FC = () => (
  <PlainCtx.Provider value={true}>
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
