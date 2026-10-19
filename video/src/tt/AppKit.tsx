import React from "react";
import { useCurrentFrame } from "remotion";
import { Tap } from "../components/Caption";
import { Frame } from "../components/Frame";
import { Arrow, PlainSteps, track } from "./Desk";

export const AW = 620, AH = 470, AK = 1.5;
export const C = { blue: "#1F6BFF", acad: "#3B82F6", memo: "#2FA866", cls: "#D6483F", subj: "#8B7CF6", ink: "#1D2433", mute: "#6B778F", line: "#E3EAF5", bg: "#F4F7FC" };
export const TABS = ["시간표", "결보강", "캘린더", "오늘", "학급출결", "교과출결", "메모"];
export const FONT = "NotoSansKRLocal, sans-serif";

// 앱 위젯(620x470)을 1.5배로 보여주고, 마우스 커서/클릭 효과를 그린다
export const AppFrame: React.FC<{ active: string; cursor: number[][]; clicks: number[]; hideTabs?: boolean; children: React.ReactNode }> = ({ active, cursor, clicks, hideTabs, children }) => {
  const f = useCurrentFrame();
  const [mx, my] = track(f, cursor);
  const press = clicks.some((c) => f >= c && f < c + 5);
  return (
    <div style={{ position: "absolute", left: 75, top: 470, width: AW * AK, height: AH * AK, borderRadius: 28, background: C.bg, boxShadow: "0 24px 50px rgba(20,40,100,.28)", overflow: "hidden", fontFamily: FONT, color: C.ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: AW, height: AH, transformOrigin: "0 0", transform: `scale(${AK})` }}>
        {!hideTabs ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: AW, height: 38, background: "#fff", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 8px", gap: 4 }}>
            {TABS.map((t) => (
              <div key={t} style={{ padding: "5px 10px", borderRadius: 14, fontSize: 13, fontWeight: 800, background: t === active ? C.blue : "transparent", color: t === active ? "#fff" : C.mute }}>{t}</div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ width: 18, height: 18, borderRadius: 9, border: `3px solid ${C.mute}`, boxSizing: "border-box" }} />
          </div>
        ) : null}
        {children}
        {clicks.map((c) => {
          const [px, py] = track(c, cursor);
          return (
            <div key={c} style={{ position: "absolute", left: px, top: py, transform: "scale(.28)", transformOrigin: "0 0" }}>
              <Tap at={c} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: mx - 2, top: my - 1, zIndex: 90, pointerEvents: "none" }}>
          <Arrow press={press} size={24} />
        </div>
      </div>
    </div>
  );
};

type StepItem = { from: number; text: string };
export const AppScene: React.FC<{ title: string; items: StepItem[]; total: number; active: string; cursor: number[][]; clicks: number[]; note?: { from: number; text: string }; children: React.ReactNode }> = ({ title, items, total, active, cursor, clicks, note, children }) => (
  <Frame>
    <AppFrame active={active} cursor={cursor} clicks={clicks}>{children}</AppFrame>
    <PlainSteps title={title} items={items} total={total} note={note} />
  </Frame>
);

export const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 2px 8px rgba(30,60,140,.06)", ...style }}>{children}</div>
);

export const T: React.FC<{ x: number; y: number; s?: number; b?: boolean; c?: string; w?: number; a?: "center" | "left" | "right"; children: React.ReactNode }> = ({ x, y, s = 13, b, c, w, a, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: a, fontSize: s, fontWeight: b ? 800 : 600, color: c ?? C.ink, whiteSpace: "nowrap", lineHeight: 1.25 }}>{children}</div>
);

export const Chip: React.FC<{ x: number; y: number; w: number; h?: number; label: string; on?: boolean; color?: string }> = ({ x, y, w, h = 26, label, on, color = C.cls }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, background: on ? color : "#fff", color: on ? "#fff" : C.mute, border: `1.5px solid ${on ? color : "#CBD5E6"}` }}>{label}</div>
);

export const SUBJ = ["국어", "수학", "영어", "과학", "사회", "체육", "음악"];
export const SUBJ_BG = ["#E8E3FF", "#DDF1FF", "#FFE9DC", "#E2F5E6", "#FFF3CC", "#FFE0E6", "#E3F7F4"];

export const BADGE: Record<string, { c: string; g: string }> = { acad: { c: C.acad, g: "▤" }, memo: { c: C.memo, g: "≡" }, cls: { c: C.cls, g: "✓" }, subj: { c: C.subj, g: "☰" } };
export const Badge: React.FC<{ k: keyof typeof BADGE; size?: number }> = ({ k, size = 14 }) => (
  <div style={{ width: size, height: size, borderRadius: 4, background: BADGE[k].c, color: "#fff", fontSize: size * 0.7, fontWeight: 900, display: "grid", placeItems: "center", lineHeight: 1 }}>{BADGE[k].g}</div>
);

// 2026년 10월: 10/1은 목요일
export const OCT_OFFSET = 4;
export const CalGrid: React.FC<{ x: number; y: number; cw: number; ch: number; sel?: number; today?: number; badges: Record<number, (keyof typeof BADGE)[]> }> = ({ x, y, cw, ch, sel, today, badges }) => (
  <div style={{ position: "absolute", left: x, top: y, width: cw * 7 }}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cw}px)`, fontSize: 12, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>
      {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
        <div key={d} style={{ color: i === 0 ? C.cls : i === 6 ? C.acad : C.mute }}>{d}</div>
      ))}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cw}px)`, gridAutoRows: `${ch}px` }}>
      {Array.from({ length: 35 }, (_, i) => {
        const d = i - OCT_OFFSET + 1;
        const valid = d >= 1 && d <= 31;
        const col = i % 7;
        const b = valid ? badges[d] ?? [] : [];
        return (
          <div key={i} style={{ boxSizing: "border-box", border: valid && d === sel ? `2px solid ${C.blue}` : "1px solid #E6ECF6", background: valid && d === today ? "#EAF1FF" : "#fff", padding: 3, fontSize: 12, fontWeight: 800, color: !valid ? "transparent" : col === 0 || d === 9 ? C.cls : col === 6 ? C.acad : C.ink }}>
            {valid ? d : ""}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
              {b.map((k) => (
                <Badge key={k} k={k} size={13} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
