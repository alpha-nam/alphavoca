import React from "react";
import { Composition } from "remotion";
import { Reel, TOTAL_FRAMES } from "./Reel";
import { FPS } from "./theme";
import passage from "./data/passage.json";
import type { ReelProps } from "./types";
import { PromoReel, PROMO_TOTAL } from "./promo/PromoReel";
import type { Variant } from "./theme";

const make = (variant: Variant): ReelProps => ({ data: passage, variant, bgm: "" });

// 디자인 시안 3종: 스킬 카드(파랑) / 다크 / alphavoca(초록)
export const Root: React.FC = () => (
  <>
    <Composition id="PromoBlue" component={PromoReel} durationInFrames={PROMO_TOTAL} fps={FPS} width={1080} height={1920} defaultProps={{ bgm: "" }} />
    {(
      [
        ["ReelBlue", "blue"],
        ["ReelDark", "dark"],
        ["ReelGreen", "green"],
      ] as const
    ).map(([id, v]) => (
      <Composition
        key={id}
        id={id}
        component={Reel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={make(v)}
      />
    ))}
  </>
);
