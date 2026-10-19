import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Tap } from "../components/Caption";
import { Pop } from "../components/Card";
import { useTheme } from "../theme";

export const PlainCtx = React.createContext(false);
export const usePlain = () => React.useContext(PlainCtx);

export const VW = 1600;
export const VH = 1000;
const E = Easing.inOut(Easing.cubic);

// keys: [frame, v1, v2, ...] → 키프레임 사이를 부드럽게 보간
export const track = (f: number, keys: number[][]): number[] => {
  if (f <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b[0]) {
      const t = E((f - a[0]) / Math.max(1, b[0] - a[0]));
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * t);
    }
  }
  return keys[keys.length - 1].slice(1);
};

const MON_W = 1000, MON_H = 625, K0 = MON_W / VW;

export const Arrow: React.FC<{ press: boolean; size?: number }> = ({ press, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,.4))", transform: press ? "scale(.82)" : "none", transformOrigin: "3px 2px" }}>
    <path d="M3 2 L3 19 L8 14.5 L11.5 21 L14 19.8 L10.6 13.4 L17 13 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

// 가상 데스크톱(1600x1000)을 카메라로 확대·이동하며 보여주는 모니터 + 마우스 커서
export const Monitor: React.FC<{ cam: number[][]; cursor: number[][]; clicks: number[]; children: React.ReactNode }> = ({ cam, cursor, clicks, children }) => {
  const f = useCurrentFrame();
  const plain = usePlain();
  const [cx0, cy0, s0] = track(f, cam);
  const s = plain ? 1 + (s0 - 1) * 0.5 : s0;
  // 카메라가 가상 데스크톱 밖(검은 영역)을 비추지 않도록 중심을 제한
  const hw = VW / (2 * s), hh = VH / (2 * s);
  const cx = Math.min(VW - hw, Math.max(hw, cx0));
  const cy = Math.min(VH - hh, Math.max(hh, cy0));
  const k = K0 * s;
  const [mx, my] = track(f, cursor);
  const press = clicks.some((c) => f >= c && f < c + 5);
  return (
    <div style={{ position: "absolute", left: 26, top: plain ? 470 : 250, width: MON_W + 28, height: MON_H + 28, borderRadius: 30, background: "#0F1624", padding: 14, boxShadow: "0 28px 60px rgba(10,26,63,.35)" }}>
      <div style={{ position: "relative", width: MON_W, height: MON_H, borderRadius: 14, overflow: "hidden", background: "#000" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, transformOrigin: "0 0", transform: `translate(${MON_W / 2 - cx * k}px, ${MON_H / 2 - cy * k}px) scale(${k})` }}>
          {children}
          {clicks.map((c) => {
            const [px, py] = track(c, cursor);
            return (
              <div key={c} style={{ position: "absolute", left: px, top: py }}>
                <Tap at={c} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: mx - 3, top: my - 2, zIndex: 100, pointerEvents: "none" }}>
            <Arrow press={press} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Wallpaper: React.FC<{ clock?: string; children?: React.ReactNode }> = ({ clock = "오전 9:12", children }) => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 800px at 25% 15%, #78B4FF, transparent 70%), linear-gradient(135deg,#1558C9,#2E86F0 55%,#8EC3FF)", fontFamily: "NotoSansKRLocal, sans-serif" }}>
    {[["휴지통", "#E8EDF7"], ["문서", "#FFD866"], ["사진", "#7BD38E"]].map(([name, c], i) => (
      <div key={name} style={{ position: "absolute", left: 40, top: 40 + i * 130, width: 100, textAlign: "center", color: "#fff", fontSize: 22, textShadow: "0 2px 4px rgba(0,0,0,.5)" }}>
        <div style={{ width: 62, height: 52, borderRadius: 10, background: c, margin: "0 auto 8px", boxShadow: "0 4px 8px rgba(0,0,0,.25)" }} />
        {name}
      </div>
    ))}
    {children}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: "rgba(24,32,52,.88)", display: "flex", alignItems: "center", padding: "0 24px", gap: 18 }}>
      <div style={{ width: 30, height: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ background: "#7DB8FF", borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ width: 260, height: 36, borderRadius: 18, background: "rgba(255,255,255,.14)", color: "#cfd8ea", fontSize: 20, display: "flex", alignItems: "center", paddingLeft: 16 }}>🔍 검색</div>
      {["#FF8F6B", "#6BD3A5", "#9B8CFF"].map((c) => (
        <div key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c }} />
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ color: "#dfe6f5", fontSize: 20 }}>{clock}</div>
    </div>
  </div>
);

export const Win: React.FC<{ x: number; y: number; w: number; h: number; title: string; from: number; to?: number; children?: React.ReactNode; z?: number }> = ({ x, y, w, h, title, from, to, children, z = 10 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < from || (to !== undefined && f > to + 12)) return null;
  const s = spring({ frame: f - from, fps, config: { damping: 15, stiffness: 200 } });
  const out = to === undefined ? 1 : interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14, background: "#fff", boxShadow: "0 24px 50px rgba(0,0,0,.4)", overflow: "hidden", transform: `scale(${0.92 + 0.08 * s})`, opacity: Math.min(1, s * 1.6) * out, zIndex: z, fontFamily: "NotoSansKRLocal, sans-serif", color: "#1D2433" }}>
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 44, background: "#EDF1F7", borderBottom: "1px solid #D8DFEA", display: "flex", alignItems: "center", padding: "0 16px", fontSize: 20, fontWeight: 700, color: "#44506A" }}>
        {title}
        <div style={{ flex: 1 }} />
        <span style={{ letterSpacing: 18 }}>— ▢ ✕</span>
      </div>
      {children}
    </div>
  );
};

export const Btn: React.FC<{ x: number; y: number; w: number; h: number; label: string; primary?: boolean; off?: boolean }> = ({ x, y, w, h, label, primary, off }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 21, fontWeight: 700, background: primary ? "#1F6BFF" : "#F3F6FB", color: primary ? "#fff" : off ? "#A7B0C0" : "#2B3548", border: primary ? "none" : "1px solid #C9D2E2", opacity: off ? 0.7 : 1 }}>{label}</div>
);

export const Txt: React.FC<{ x: number; y: number; size?: number; bold?: boolean; color?: string; w?: number; children: React.ReactNode }> = ({ x, y, size = 22, bold, color, w, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontSize: size, fontWeight: bold ? 800 : 500, color: color ?? "#1D2433", lineHeight: 1.4 }}>{children}</div>
);

export const Bar: React.FC<{ x: number; y: number; w: number; p: number }> = ({ x, y, w, p }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 18, borderRadius: 9, background: "#E3E9F3", overflow: "hidden" }}>
    <div style={{ width: `${Math.max(0, Math.min(1, p)) * 100}%`, height: "100%", background: "linear-gradient(90deg,#3AA675,#5AD19A)" }} />
  </div>
);

// 설치 방법 체크리스트: 단계가 끝날 때마다 체크가 채워진다
export const Checklist: React.FC<{ title: string; items: { from: number; text: string }[]; top?: number }> = ({ title, items, top = 940 }) => {
  const f = useCurrentFrame();
  const theme = useTheme();
  const cur = items.reduce((a, it, i) => (f >= it.from ? i : a), -1);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, fontFamily: theme.font }}>
      <div style={{ fontSize: 46, fontWeight: 900, color: theme.caption, marginBottom: 14 }}>{title}</div>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((it, i) => {
          const on = f >= it.from;
          const done = i < cur || f >= it.from + 36;
          return (
            <Pop key={i} delay={Math.max(0, it.from - 6)} style={{ opacity: on ? 1 : 0.35 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, background: i === cur ? theme.soft : "#fff", border: `3px solid ${i === cur ? theme.primary : theme.line}`, borderRadius: 22, padding: "14px 22px", boxShadow: "0 6px 16px rgba(20,60,160,.08)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: done ? theme.primary : "#fff", border: `3px solid ${theme.primary}`, color: "#fff", fontSize: 28, fontWeight: 900, display: "grid", placeItems: "center", flex: "none" }}>{done ? "✓" : i + 1}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#14203A" }}>{it.text}</div>
              </div>
            </Pop>
          );
        })}
      </div>
    </div>
  );
};

// 담백한 시안: 단계 제목 + 현재 단계 한 줄 + 얇은 진행 막대
export const PlainSteps: React.FC<{ title: string; items: { from: number; text: string }[]; total: number; note?: { from: number; text: string } }> = ({ title, items, total, note }) => {
  const f = useCurrentFrame();
  const theme = useTheme();
  const cur = Math.max(0, items.reduce((a, it, i) => (f >= it.from ? i : a), 0));
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center", fontSize: 58, fontWeight: 900, color: "#14203A", fontFamily: theme.font }}>{title}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1210, textAlign: "center", fontFamily: theme.font }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.muted, marginBottom: 10 }}>{cur + 1} / {items.length}</div>
        <div style={{ fontSize: 50, fontWeight: 800, color: "#14203A" }}>{items[cur].text}</div>
        <div style={{ margin: "34px auto 0", width: 640, height: 8, borderRadius: 4, background: "#DCE5F4", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(1, f / total) * 100}%`, height: "100%", background: theme.primary }} />
        </div>
      </div>
      {note && f >= note.from ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1420, textAlign: "center", fontSize: 30, fontWeight: 700, color: theme.muted, fontFamily: theme.font, opacity: Math.min(1, (f - note.from) / 12) }}>{note.text}</div>
      ) : null}
    </>
  );
};
