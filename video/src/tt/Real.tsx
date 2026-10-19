import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Tap } from "../components/Caption";
import { Frame } from "../components/Frame";
import manifest from "../data/ui-manifest.json";
import { Arrow, PlainSteps, track } from "./Desk";
import { FONT } from "./AppKit";

type St = { img: string; label: string; target: { x: number; y: number } | null };
const M = manifest as unknown as Record<string, St[]>;

export type Plan = {
  hold?: number; // 클릭 후 화면을 보여주는 시간
  move?: number; // 마우스 이동 시간
  holds?: Record<number, number>; // 상태별 보여주는 시간
  first?: number; // 첫 화면을 보여주는 시간
};

// 캡처한 실제 화면 상태들을 순서대로 재생: 마우스가 실제 버튼 위치로 이동 → 클릭 → 다음 상태
export const buildTimeline = (key: string, plan: Plan = {}) => {
  const states = M[key];
  const hold = plan.hold ?? 30, move = plan.move ?? 22;
  const segs: { i: number; start: number; click: number; show: number; end: number }[] = [];
  const cursor: number[][] = [];
  const clicks: number[] = [];
  let t = 0;
  let pos = states[0].target ?? { x: 310, y: 300 };
  cursor.push([0, pos.x, pos.y]);
  states.forEach((s, i) => {
    const h = plan.holds?.[i] ?? hold;
    if (i === 0) {
      const end = t + (plan.first ?? 30);
      segs.push({ i, start: 0, click: 0, show: 0, end });
      t = end;
      return;
    }
    if (s.target) {
      const arrive = t + move;
      cursor.push([t, pos.x, pos.y], [arrive, s.target.x, s.target.y]);
      pos = s.target;
      clicks.push(arrive);
      segs.push({ i, start: t, click: arrive, show: arrive + 2, end: arrive + 2 + h });
      t = arrive + 2 + h;
    } else {
      segs.push({ i, start: t, click: t, show: t, end: t + h });
      cursor.push([t, pos.x, pos.y]);
      t += h;
    }
  });
  cursor.push([t, pos.x, pos.y]);
  return { states, segs, cursor, clicks, total: t + 20 };
};

export const RealScene: React.FC<{
  keyName: string; plan?: Plan; title: string; steps: Record<number, string>; hint?: boolean;
  phone?: { w: number; h: number }; notes?: { from: number; text: string };
}> = ({ keyName, plan, title, steps, phone }) => {
  const f = useCurrentFrame();
  const { states, segs, cursor, clicks, total } = React.useMemo(() => buildTimeline(keyName, plan), [keyName]);
  const cur = segs.reduce((a, s) => (f >= s.show ? s.i : a), 0);
  const prev = Math.max(0, cur - 1);
  const showAt = segs.find((s) => s.i === cur)!.show;
  const mix = cur === 0 ? 1 : interpolate(f, [showAt, showAt + 5], [0, 1], { extrapolateRight: "clamp" });
  const [mx, my] = track(f, cursor);
  const press = clicks.some((c) => f >= c && f < c + 5);
  const W = phone ? phone.w : 620, H = phone ? phone.h : 470;
  const K = phone ? 1.5 : 1.5;
  const left = (1080 - W * K) / 2, top = phone ? 390 : 470;
  const items = Object.keys(steps).map((k) => ({ from: segs.find((s) => s.i === +k)!.start, text: steps[+k] }));
  return (
    <Frame>
      <div style={{ position: "absolute", left, top, width: W * K, height: H * K, borderRadius: phone ? 34 : 28, overflow: "hidden", boxShadow: "0 24px 50px rgba(20,40,100,.28)", background: "#fff", border: phone ? "10px solid #0F1624" : "none", boxSizing: "content-box", fontFamily: FONT }}>
        <div style={{ position: "relative", width: W * K, height: H * K }}>
          <Img src={staticFile(`ui/${states[prev].img}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          <Img src={staticFile(`ui/${states[cur].img}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: mix }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${K})`, transformOrigin: "0 0" }}>
            {clicks.map((c) => {
              const [px, py] = track(c, cursor);
              return (
                <div key={c} style={{ position: "absolute", left: px, top: py, transform: "scale(.28)", transformOrigin: "0 0" }}>
                  <Tap at={c} />
                </div>
              );
            })}
            <div style={{ position: "absolute", left: mx - 2, top: my - 1, pointerEvents: "none" }}>
              <Arrow press={press} size={24} />
            </div>
          </div>
        </div>
      </div>
      <PlainSteps title={title} items={items} total={total} titleTop={phone ? 250 : 330} lineTop={phone ? 1340 : 1210} />
    </Frame>
  );
};

export const realFrames = (key: string, plan?: Plan) => buildTimeline(key, plan).total;
