import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { PlainSteps } from "./Desk";
import { AppFrame, AppScene, C, Card, Chip, SUBJ, SUBJ_BG, T, AH } from "./AppKit";

const ck = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ─────────── 시간표 ───────────
export const TIMETABLE_FRAMES = 200;
export const Timetable: React.FC = () => {
  const f = useCurrentFrame();
  const view = f >= 84 ? "학급" : "교사";
  const open = f >= 34 && f < 80;
  return (
    <AppScene title="시간표 확인" active="시간표" total={TIMETABLE_FRAMES}
      items={[{ from: 0, text: "교사 · 학급 · 학생 보기 고르기" }, { from: 90, text: "지금 교시는 파란 테두리로" }]}
      cursor={[[0, 330, 300], [26, 150, 62], [58, 70, 126], [84, 70, 126], [130, 330, 330], [200, 330, 330]]} clicks={[30, 66]}>
      <div style={{ position: "absolute", left: 16, top: 48, display: "flex", fontSize: 13, fontWeight: 800 }}>
        <div style={{ padding: "6px 12px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: "14px 0 0 14px" }}>{view} ▾</div>
        <div style={{ padding: "6px 12px", background: "#fff", border: `1px solid ${C.line}`, borderLeft: "none", borderRadius: "0 14px 14px 0", color: C.blue }}>{view === "교사" ? "교사 A" : "2-3"} ▾</div>
      </div>
      {open ? (
        <Card x={16} y={84} w={110} h={104} style={{ zIndex: 20, padding: 6, boxSizing: "border-box" }}>
          {["교사", "학급", "학생"].map((t, i) => (
            <div key={t} style={{ height: 30, display: "flex", alignItems: "center", padding: "0 10px", borderRadius: 8, fontSize: 13, fontWeight: 800, background: t === "학급" && f >= 62 ? "#E4EEFF" : "transparent" }}>{t}</div>
          ))}
        </Card>
      ) : null}
      <div style={{ position: "absolute", left: 16, top: 92, width: 590 }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", gap: 4, fontSize: 12, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>
          <div />
          {["월", "화", "수", "목", "금"].map((d) => (
            <div key={d} style={{ color: d === "월" ? C.blue : C.mute }}>{d}</div>
          ))}
        </div>
        {Array.from({ length: 7 }, (_, p) => (
          <div key={p} style={{ display: "grid", gridTemplateColumns: "60px repeat(5, 1fr)", gap: 4, marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.mute, textAlign: "center", lineHeight: 1.1, paddingTop: 5 }}>{p + 1}교시<br /><span style={{ fontWeight: 600 }}>{["08:40", "09:40", "10:40", "11:40", "13:30", "14:30", "15:30"][p]}</span></div>
            {Array.from({ length: 5 }, (_, d) => {
              const i = (d * 2 + p + (view === "학급" ? 3 : 0)) % 7;
              const now = p === 2 && d === 0;
              return (
                <div key={d} style={{ height: 40, borderRadius: 8, background: SUBJ_BG[i], display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, outline: now ? `3px solid ${C.blue}` : "none", outlineOffset: -1 }}>{SUBJ[i]}</div>
              );
            })}
          </div>
        ))}
      </div>
    </AppScene>
  );
};

// ─────────── 결보강 ───────────
export const SWAP_FRAMES = 190;
export const Swap: React.FC = () => {
  const f = useCurrentFrame();
  const sel = f >= 44;
  const list = ck(f, 50, 64);
  return (
    <AppScene title="결보강 · 바꿀 수 있는 선생님" active="결보강" total={SWAP_FRAMES}
      items={[{ from: 0, text: "교체할 수업 칸 누르기" }, { from: 52, text: "대체 가능 · 1:1 교체 가능 선생님이 나와요" }]}
      cursor={[[0, 300, 360], [36, 150, 190], [150, 480, 300], [190, 480, 300]]} clicks={[42]}>
      <T x={16} y={50} s={13} b c={C.mute}>교체대상 | 교사 A ▾</T>
      <div style={{ position: "absolute", left: 14, top: 78, width: 330 }}>
        {Array.from({ length: 7 }, (_, p) => (
          <div key={p} style={{ display: "grid", gridTemplateColumns: "34px repeat(5, 1fr)", gap: 3, marginBottom: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.mute, textAlign: "center", paddingTop: 6 }}>{p + 1}</div>
            {Array.from({ length: 5 }, (_, d) => {
              const i = (d * 2 + p) % 7;
              const on = sel && p === 2 && d === 2;
              return (
                <div key={d} style={{ height: 38, borderRadius: 6, background: SUBJ_BG[i], display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, outline: on ? `3px solid ${C.blue}` : "none", outlineOffset: -1 }}>{SUBJ[i]}</div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 360, top: 52, width: 246, opacity: list, transform: `translateX(${(1 - list) * 24}px)` }}>
        <Card x={0} y={0} w={246} h={178} style={{ padding: 12, boxSizing: "border-box" }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>대체 가능 선생님</div>
          {[["선생님 A", "같은 교과"], ["선생님 B", "공강"], ["선생님 C", "공강"]].map(([n, k], i) => (
            <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, padding: "6px 8px", background: i === 0 ? "#E8F8EE" : "#F6F8FC", borderRadius: 8, marginBottom: 5 }}><span>{n}</span><span style={{ color: i === 0 ? C.memo : C.mute }}>{k}</span></div>
          ))}
        </Card>
        <Card x={0} y={190} w={246} h={150} style={{ padding: 12, boxSizing: "border-box" }}>
          <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 8 }}>1:1 교체 가능 선생님</div>
          {[["선생님 D", "목 4교시 ↔ 수 3교시"], ["선생님 E", "금 2교시 ↔ 수 3교시"]].map(([n, k]) => (
            <div key={n} style={{ fontSize: 12.5, fontWeight: 700, padding: "6px 8px", background: "#F6F8FC", borderRadius: 8, marginBottom: 5 }}>{n}<div style={{ color: C.mute, fontWeight: 600, fontSize: 11.5 }}>{k}</div></div>
          ))}
        </Card>
      </div>
    </AppScene>
  );
};

// ─────────── 오늘 ───────────
export const TODAY_FRAMES = 160;
export const Today: React.FC = () => {
  const f = useCurrentFrame();
  const dinner = f >= 68;
  return (
    <AppScene title="오늘 한눈에" active="오늘" total={TODAY_FRAMES}
      items={[{ from: 0, text: "시계 · 날씨 · 급식 · 학사일정" }, { from: 62, text: "급식은 중식 / 석식 전환" }]}
      cursor={[[0, 300, 400], [50, 466, 160], [160, 466, 160]]} clicks={[66]}>
      <Card x={14} y={48} w={292} h={196} style={{ background: "#F1EEFF" }}>
        <T x={16} y={14} s={15} b>⏰ 시계</T>
        <T x={16} y={60} s={46} b>09:12</T>
        <T x={16} y={128} s={15} b c={C.mute}>10월 19일 (월)</T>
        <T x={16} y={154} s={13} c={C.blue} b>3교시 진행 중</T>
      </Card>
      <Card x={314} y={48} w={292} h={196} style={{ background: "#E8F4FF" }}>
        <T x={16} y={14} s={15} b>☀ 날씨</T>
        <T x={16} y={44} s={30} b>맑음 18°</T>
        {["월", "화", "수", "목", "금"].map((d, i) => (
          <div key={d} style={{ position: "absolute", left: 16 + i * 53, top: 108, width: 50, textAlign: "center", fontSize: 12, fontWeight: 800 }}>
            {d}
            <div style={{ color: C.acad, marginTop: 6 }}>{9 + i}°</div>
            <div style={{ color: C.cls }}>{19 + (i % 3)}°</div>
          </div>
        ))}
      </Card>
      <Card x={14} y={254} w={292} h={202} style={{ background: "#FFF1E8" }}>
        <T x={16} y={14} s={15} b>🍽 급식</T>
        <Chip x={150} y={10} w={60} label="중식" on={!dinner} color={C.blue} />
        <Chip x={216} y={10} w={60} label="석식" on={dinner} color={C.blue} />
        {(dinner ? ["잡곡밥", "닭갈비", "콩나물국", "배추김치"] : ["쌀밥", "된장찌개", "제육볶음", "깍두기"]).map((m, i) => (
          <T key={m} x={20} y={56 + i * 30} s={15} b>{m}</T>
        ))}
      </Card>
      <Card x={314} y={254} w={292} h={202} style={{ background: "#EAF8EE" }}>
        <T x={16} y={14} s={15} b>🚩 학사일정</T>
        {[["D-4", "중간고사"], ["D-12", "현장체험학습"], ["D-34", "학부모 상담 주간"]].map(([d, n], i) => (
          <div key={d} style={{ position: "absolute", left: 16, top: 54 + i * 42, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800 }}>
            <div style={{ width: 54, textAlign: "center", padding: "4px 0", borderRadius: 10, background: "#fff", color: C.blue }}>{d}</div>{n}
          </div>
        ))}
      </Card>
    </AppScene>
  );
};
