import { continueRender, delayRender, staticFile } from "remotion";

// 로컬 번들 폰트 (네트워크 없이도 렌더되도록 public/fonts에 포함)
const fontFamily = "NotoSansKRLocal";
const face = new FontFace(fontFamily, `url(${staticFile("fonts/NotoSansKR.ttf")})`, { weight: "100 900" });
const handle = delayRender("load NotoSansKR");
face
  .load()
  .then((f) => document.fonts.add(f))
  .finally(() => continueRender(handle));

export const theme = {
  primary: "#34A877",
  dark: "#0B5D46",
  soft: "#E4F5EC",
  accent: "#F5703F",
  bg: "#F3F7F5",
  line: "#E3ECE7",
  ok: "#1F9D63",
  bad: "#D64545",
  text: "#1D2B26",
  muted: "#6E8079",
  radius: 32,
  font: `Pretendard, ${fontFamily}, "Apple SD Gothic Neo", sans-serif`,
};

// 인스타그램 UI에 가려지는 영역
export const SAFE = { top: 150, bottom: 250, side: 60 };
export const FPS = 30;
