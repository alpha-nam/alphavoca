import React from "react";
import { Composition } from "remotion";
import { Reel, TOTAL_FRAMES } from "./Reel";
import { FPS } from "./theme";
import passage from "./data/passage.json";
import type { ReelProps } from "./types";

const defaultProps: ReelProps = { data: passage, bgm: "" };

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultProps}
  />
);
