import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { BG_THEMES, ThemeProvider } from "../theme";
import { Uninstall, UNINSTALL_FRAMES } from "./Uninstall";
import { Install, INSTALL_FRAMES } from "./Install";
import { PlainCtx } from "./Desk";
import { Timetable, TIMETABLE_FRAMES, Swap, SWAP_FRAMES, Today, TODAY_FRAMES } from "./Scenes1";
import { Connect, CONNECT_FRAMES, ClassAtt, CLASSATT_FRAMES, PhoneSync, PHONESYNC_FRAMES, Memo, MEMO_FRAMES, Calendar, CALENDAR_FRAMES, Outro, OUTRO_FRAMES } from "./Scenes2";

const T = 10;
const SEQ = [
  { C: Uninstall, frames: UNINSTALL_FRAMES }, { C: Install, frames: INSTALL_FRAMES }, { C: Connect, frames: CONNECT_FRAMES },
  { C: Timetable, frames: TIMETABLE_FRAMES }, { C: Swap, frames: SWAP_FRAMES }, { C: Today, frames: TODAY_FRAMES },
  { C: ClassAtt, frames: CLASSATT_FRAMES }, { C: PhoneSync, frames: PHONESYNC_FRAMES }, { C: Memo, frames: MEMO_FRAMES },
  { C: Calendar, frames: CALENDAR_FRAMES }, { C: Outro, frames: OUTRO_FRAMES },
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
