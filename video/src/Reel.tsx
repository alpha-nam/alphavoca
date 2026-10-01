import React from "react";
import { Series } from "remotion";
import { Hook } from "./scenes/Hook";
import { PasteInput } from "./scenes/PasteInput";
import { MainIdea } from "./scenes/MainIdea";
import { Sentences } from "./scenes/Sentences";
import { Sketch } from "./scenes/Sketch";
import { Answer } from "./scenes/Answer";
import { Cta } from "./scenes/Cta";

export const SCENES = [
  { C: Hook, frames: 90 },
  { C: PasteInput, frames: 150 },
  { C: MainIdea, frames: 150 },
  { C: Sentences, frames: 180 },
  { C: Sketch, frames: 120 },
  { C: Answer, frames: 120 },
  { C: Cta, frames: 90 },
];
export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0);

export const Reel: React.FC = () => (
  <Series>
    {SCENES.map(({ C, frames }, i) => (
      <Series.Sequence key={i} durationInFrames={frames}>
        <C />
      </Series.Sequence>
    ))}
  </Series>
);
