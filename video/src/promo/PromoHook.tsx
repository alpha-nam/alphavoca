import React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { useTheme } from "../theme";
import manifest from "../data/promo-manifest.json";

// 일반적인 "AI 채팅 화면" 모형 (특정 서비스 UI를 그대로 따라 그리지 않음)
// 0~48f   : 문제집(PDF) 화면에서 문제 영역을 드래그로 캡처
// 48~96f  : 캡처한 이미지를 채팅 입력창으로 끌어다 놓기
// 96~150f : 메시지 전송 → "분석 중..."
const ease = Easing.inOut(Easing.cubic);
const clampI = (f: number, a: number[], b: number[], e: (t: number) => number = ease) =>
  interpolate(f, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

const Cursor: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <svg
    width="46"
    height="46"
    viewBox="0 0 24 24"
    style={{ position: "absolute", left: x, top: y, opacity, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.35))", zIndex: 30 }}
  >
    <path d="M3 2 L3 19 L8 14.5 L11.5 21 L14 19.8 L10.6 13.4 L17 13 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const WindowBar: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ height: 56, background: "#EEF1F6", display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: "2px solid #DDE3EC" }}>
    {["#FF6B6B", "#FFC53D", "#3DD68C"].map((c) => (
      <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
    ))}
    <div style={{ marginLeft: 14, fontSize: 24, fontWeight: 700, color: "#5B6678" }}>{title}</div>
  </div>
);

export const PromoHook: React.FC = () => {
  const theme = useTheme();
  const f = useCurrentFrame();
  const q = manifest.question;

  // --- PDF 창 (top 170, left 60, 960x620)
  const PX = 60, PY = 170, PW = 960, PH = 620;
  const imgW = 800; // 창 안에서 문제 이미지 표시 폭
  const imgH = (imgW * q.h) / q.w;
  const imgX = PX + (PW - imgW) / 2;
  const imgY = PY + 56 + 34;
  // 캡처 선택 영역 (이미지 위)
  const sx0 = imgX + 10, sy0 = imgY + 6, sx1 = imgX + imgW - 10, sy1 = imgY + Math.min(imgH, PH - 56 - 40) - 6;
  const sel = clampI(f, [14, 44], [0, 1]);
  const selW = (sx1 - sx0) * sel, selH = (sy1 - sy0) * sel;
  const flash = clampI(f, [44, 48, 56], [0, 0.85, 0], (t) => t);

  // --- 드래그 이동 (캡처본 → 입력창)
  const thumbW = 400;
  const thumbH = (thumbW * q.h) / q.w;
  const startX = sx0 + (sx1 - sx0) / 2, startY = sy0 + (sy1 - sy0) / 2;
  const endX = 540, endY = 1405;
  const t = clampI(f, [54, 92], [0, 1]);
  const tx = startX + (endX - startX) * t;
  const ty = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 60;
  const thumbShow = f >= 48 && f < 100;
  const thumbScale = clampI(f, [48, 56, 92, 100], [1.0, 0.62, 0.62, 0.3]);
  const thumbRot = clampI(f, [54, 70, 92], [0, -4, 0]);
  const dropActive = f >= 74 && f < 100;

  // --- 채팅 창 (top 840, height 640)
  const CX = 60, CW = 960;
  const grow = clampI(f, [100, 122], [0, 1]);
  const CY = 840 + (170 - 840) * grow;
  const CH = 640 + (1290 - 640) * grow;
  const pdfOut = clampI(f, [98, 114], [1, 0]);
  const sent = f >= 118;
  const attached = f >= 100 && f < 118;
  const typing = f >= 142;
  const dots = ".".repeat((Math.floor(f / 6) % 3) + 1);

  const cursorX = f < 46 ? sx0 + (sx1 - sx0) * sel : tx + 120;
  const cursorY = f < 46 ? sy0 + (sy1 - sy0) * sel : ty + 90;
  const cursorOpacity = f < 100 ? 1 : clampI(f, [100, 108], [1, 0]);

  return (
    <Frame lines={["교재 문제, 캡처해서", "[[끌어다 놓기만]] 하세요"]} hold={44}>
      {/* PDF 창 */}
      <div style={{ opacity: pdfOut, display: pdfOut <= 0 ? "none" : "block" }}>
      <Pop style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 28, overflow: "hidden", background: "#E7EBF2", boxShadow: "0 18px 40px rgba(20,60,160,.18)" }}>
          <WindowBar title="문제집.pdf" />
        </div>
      </Pop>
      <Img src={staticFile("promo/question.png")} style={{ position: "absolute", left: imgX, top: imgY, width: imgW, clipPath: `inset(0 0 ${Math.max(0, imgH - (PH - 56 - 40))}px 0)` }} />
      {f >= 14 && f < 50 ? (
        <div style={{ position: "absolute", left: sx0, top: sy0, width: selW, height: selH, border: `5px dashed ${theme.primary}`, background: "rgba(31,107,255,.12)", borderRadius: 10 }} />
      ) : null}
      {flash > 0 ? <div style={{ position: "absolute", left: sx0, top: sy0, width: sx1 - sx0, height: sy1 - sy0, background: `rgba(255,255,255,${flash})` }} /> : null}
      </div>

      {/* 채팅 창 */}
      <Pop delay={6} style={{ position: "absolute", left: CX, top: CY, width: CW, height: CH }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 28, overflow: "hidden", background: "#fff", boxShadow: "0 18px 40px rgba(20,60,160,.18)" }}>
          <WindowBar title="새 대화" />
          {!sent ? (
            <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center" }}>
              <Img src={staticFile("sticker.png")} style={{ width: 110, borderRadius: 24, display: "inline-block" }} />
              <div style={{ fontSize: 44, fontWeight: 800, color: "#1F2937", marginTop: 18 }}>무엇을 도와드릴까요?</div>
            </div>
          ) : null}
          {sent ? (
            <div style={{ position: "absolute", top: 80, left: 40, right: 40 }}>
              <div style={{ width: "100%", background: "#EAF1FF", borderRadius: 26, padding: 18, boxSizing: "border-box" }}>
                <Img src={staticFile("promo/question.png")} style={{ width: "100%", borderRadius: 14, display: "block" }} />
                <div style={{ fontSize: 38, fontWeight: 700, color: "#1F2937", marginTop: 14 }}>이 문제 분석해줘</div>
              </div>
              {typing ? (
                <div style={{ marginTop: 20, fontSize: 38, fontWeight: 800, color: theme.primary }}>
                  분석 중{dots}
                </div>
              ) : null}
            </div>
          ) : null}
          {/* 입력창 */}
          {true ? (
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                bottom: 36,
                height: 120,
                borderRadius: 30,
                border: dropActive ? `5px dashed ${theme.primary}` : "3px solid #D5DBE6",
                background: dropActive ? "rgba(31,107,255,.10)" : "#F7F9FC",
                display: "flex",
                alignItems: "center",
                padding: "0 30px",
                gap: 18,
                fontSize: 34,
                color: dropActive ? theme.primary : "#9AA5B6",
                fontWeight: dropActive ? 800 : 500,
              }}
            >
              {attached ? <Img src={staticFile("promo/question.png")} style={{ height: 78, borderRadius: 8 }} /> : null}
              {sent ? "메시지를 입력하세요…" : dropActive ? "여기에 놓으세요" : attached ? "이 문제 분석해줘" : "메시지를 입력하세요…"}
            </div>
          ) : null}
        </div>
      </Pop>

      {/* 끌려가는 캡처본 */}
      {thumbShow ? (
        <Img
          src={staticFile("promo/question.png")}
          style={{
            position: "absolute",
            left: tx - (thumbW * thumbScale) / 2,
            top: ty - (thumbH * thumbScale) / 2,
            width: thumbW * thumbScale,
            transform: `rotate(${thumbRot}deg)`,
            borderRadius: 12,
            boxShadow: "0 22px 40px rgba(0,0,0,.35)",
            zIndex: 20,
          }}
        />
      ) : null}
      {f >= 10 ? <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} /> : null}
    </Frame>
  );
};
