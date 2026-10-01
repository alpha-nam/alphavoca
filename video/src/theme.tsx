import React, { createContext, useContext } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// 로컬 번들 폰트 (네트워크 없이도 렌더되도록 public/fonts에 포함)
const fontFamily = "NotoSansKRLocal";
const face = new FontFace(fontFamily, `url(${staticFile("fonts/NotoSansKR.ttf")})`, { weight: "100 900" });
const handle = delayRender("load NotoSansKR");
face
  .load()
  .then((f) => document.fonts.add(f))
  .finally(() => continueRender(handle));

export type Variant = "blue" | "dark" | "green";
export type BgVariant = "light" | "navy" | "royal" | "sun" | "violet" | "chalk" | "notebook" | "bleed" | "dark";

export type Theme = {
  variant: Variant;
  bg: string;
  glow: string;
  text: string;
  muted: string;
  primary: string; // 강조색 (버튼/알약)
  accent: string; // 포인트색 (CTA 문구)
  soft: string;
  line: string;
  surface: string; // 타이핑 카드 배경
  caption: string;
  fill: string; // 외곽선 자막 글자색
  stroke: string; // 외곽선 색
  hi: string; // 자막 강조색
  radius: number;
  font: string;
  pattern?: string; // 배경 점 패턴 색 (없으면 패턴 없음)
  bgStyle?: React.CSSProperties; // 배경 전체를 덮어쓰는 스타일 (칠판/노트 등)
  decor?: "chalk" | "notebook"; // 배경 장식 요소
  fullBleed?: boolean; // 기능 화면이 프레임 전체를 채움 (창 테두리 없음)
  winBg?: string; // 기능 화면 안쪽 바탕색 (카드가 도드라지도록 흰색보다 진하게)
  bar?: string; // 창 상단 바 배경
  barLine?: string;
  barText?: string;
  winShadow?: string;
  promoDir?: string; // 카드 캡처 폴더 (다크 테마는 promo-dark)
};

const font = `Pretendard, ${fontFamily}, "Apple SD Gothic Neo", sans-serif`;

// blue/dark: 스킬 카드 원본 팔레트, green: alphavoca 앱 팔레트
export const THEMES: Record<Variant, Theme> = {
  blue: {
    variant: "blue", bg: "#F2F6FD", glow: "#D9E6FF", text: "#131A2B", muted: "#5F6B85",
    primary: "#1F6BFF", accent: "#F59E0B", soft: "#E6EFFF", line: "#E1E8F5", surface: "#FFFFFF",
    caption: "#0B4FCC", fill: "#FFFFFF", stroke: "#0A1A3F", hi: "#FFD43B", radius: 32, font,
  },
  dark: {
    variant: "dark", bg: "#0B1222", glow: "#14336E", text: "#EEF3FF", muted: "#9AA8C7",
    primary: "#6FA2FF", accent: "#FBBF24", soft: "#182E5C", line: "#25325A", surface: "#131B33",
    caption: "#B8D0FF", fill: "#FFFFFF", stroke: "#050A18", hi: "#FBBF24", radius: 32, font,
  },
  green: {
    variant: "green", bg: "#F3F7F5", glow: "#CFEBDD", text: "#1D2B26", muted: "#6E8079",
    primary: "#34A877", accent: "#F5703F", soft: "#E4F5EC", line: "#E3ECE7", surface: "#FFFFFF",
    caption: "#0B5D46", fill: "#FFFFFF", stroke: "#0B3D2E", hi: "#FFE066", radius: 32, font,
  },
};

// 배경 시안: 흰색 기능 화면이 도드라지도록 배경색을 바꾼다 (blue 테마 기반)
const B = THEMES.blue;
export const BG_THEMES = {
  light: B,
  navy: { ...B, bg: "#0B1B4D", glow: "#24459F", text: "#EEF3FF", pattern: "rgba(255,255,255,0.08)" },
  royal: { ...B, bg: "#1F6BFF", glow: "#79A8FF", text: "#FFFFFF", pattern: "rgba(255,255,255,0.14)" },
  sun: { ...B, bg: "#FFD43B", glow: "#FFF0A6", text: "#0A1A3F", pattern: "rgba(10,26,63,0.08)" },
  violet: { ...B, bg: "#5B3DF5", glow: "#9A86FF", text: "#FFFFFF", pattern: "rgba(255,255,255,0.12)" },
} as Record<BgVariant, Theme>;

const chalkBg: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 700px 300px at 22% 26%, rgba(255,255,255,.07), transparent 70%), radial-gradient(ellipse 800px 340px at 82% 72%, rgba(255,255,255,.06), transparent 70%), #1F4D3F",
  boxShadow: "inset 0 0 0 26px #B07A45, inset 0 0 0 31px #7C522B, inset 0 0 110px 36px rgba(0,0,0,.45)",
};
const GRID = "rgba(70,120,200,0.20)";
const notebookBg: React.CSSProperties = {
  background: "#FFF6DD",
  backgroundImage: `linear-gradient(90deg, transparent 126px, rgba(235,87,87,.5) 126px, rgba(235,87,87,.5) 130px, transparent 130px), linear-gradient(${GRID} 2px, transparent 2px), linear-gradient(90deg, ${GRID} 2px, transparent 2px)`,
  backgroundSize: "100% 100%, 52px 52px, 52px 52px",
};
const SAFE_WIN = "#DCE6F6"; // 흰 카드가 도드라지는 바탕

BG_THEMES.chalk = { ...B, bg: "#1F4D3F", glow: "#1F4D3F", text: "#F3F7F2", bgStyle: chalkBg, decor: "chalk", winBg: "#D5E4DC", winShadow: "0 22px 50px rgba(0,0,0,.5)" };
BG_THEMES.notebook = { ...B, bg: "#FFF6DD", glow: "#FFF6DD", text: "#0A1A3F", bgStyle: notebookBg, decor: "notebook", winBg: SAFE_WIN, winShadow: "0 24px 46px rgba(80,60,20,.38)" };
BG_THEMES.bleed = { ...B, fullBleed: true, winBg: "#CBDAF2", bg: "#CBDAF2", glow: "#E6EEFB" };
BG_THEMES.dark = {
  ...THEMES.dark, fill: "#FFFFFF", stroke: "#050A18", hi: "#FFD43B", primary: "#4C8DFF", pattern: "rgba(255,255,255,0.05)",
  winBg: "#0E1730", bar: "#141D3A", barLine: "#25325A", barText: "#9AA8C7", promoDir: "promo-dark",
  winShadow: "0 22px 50px rgba(0,0,0,.6)",
};

const Ctx = createContext<Theme>(THEMES.blue);
export const ThemeProvider = Ctx.Provider;
export const useTheme = (): Theme => useContext(Ctx);

// 인스타그램 UI에 가려지는 영역
export const SAFE = { top: 150, bottom: 250, side: 60 };
export const FPS = 30;
