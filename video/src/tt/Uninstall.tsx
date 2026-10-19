import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { StyledCaption } from "../promo/FlashCaption";
import { Bar, Btn, Checklist, PlainSteps, usePlain, Monitor, Txt, VH, VW, Wallpaper, Win } from "./Desk";

export const UNINSTALL_FRAMES = 345;

const CAM = [[0, 800, 500, 1], [22, 560, 860, 1.6], [60, 560, 780, 1.6], [90, 800, 470, 1.2], [158, 800, 450, 1.3], [200, 800, 450, 1.3], [210, 800, 470, 1.6], [238, 800, 470, 1.3], [300, 800, 500, 1], [345, 800, 500, 1]];
const CURSOR = [[0, 800, 520], [30, 560, 972], [64, 560, 972], [84, 610, 695], [100, 700, 430], [124, 480, 435], [146, 520, 520], [170, 460, 495], [188, 455, 278], [212, 885, 520], [236, 885, 520], [300, 800, 520]];
const CLICKS = [32, 88, 130, 172, 204, 230];

const PROGRAMS = ["Sample Viewer 3.2", "화면 녹화 도구", "Lively Wallpaper", "문서 편집기", "음악 재생기"];

const Row: React.FC<{ i: number; name: string; sel: boolean; gone: number }> = ({ i, name, sel, gone }) => (
  <div style={{ position: "absolute", left: 20, top: 250 + i * 54 - gone * 54 * 0, width: 1040, height: 52, borderRadius: 8, background: sel ? "#D7E6FF" : "transparent", border: sel ? "1px solid #8DB4FF" : "1px solid transparent", opacity: 1 - gone, transform: `translateY(${gone * -8}px)`, display: "flex", alignItems: "center", fontSize: 22 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: ["#7BD38E", "#FF8F6B", "#9B8CFF", "#FFD866", "#6BB6FF"][i], margin: "0 14px 0 14px" }} />
    <div style={{ width: 480, fontWeight: sel ? 800 : 600 }}>{name}</div>
    <div style={{ width: 240, color: "#6B778F" }}>{name.startsWith("Lively") ? "" : "Example Corp"}</div>
    <div style={{ width: 180, color: "#6B778F" }}>2026-0{(i % 8) + 1}-1{i}</div>
    <div style={{ color: "#6B778F" }}>{[84, 212, 96, 41, 130][i]} MB</div>
  </div>
);

export const Uninstall: React.FC = () => {
  const f = useCurrentFrame();
  const plain = usePlain();
  const typed = Math.floor(interpolate(f, [46, 62], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const stage2 = f >= 131;
  const selected = f >= 172 && f < 282;
  const gone = interpolate(f, [282, 298], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const prog = interpolate(f, [234, 278], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const searchOn = f >= 36 && f < 90;
  return (
    <Frame>
      <Monitor cam={CAM} cursor={CURSOR} clicks={CLICKS}>
        <Wallpaper clock="오전 9:12">
          {searchOn ? (
            <Win x={330} y={500} w={560} h={420} title="검색" from={36} to={86} z={20}>
              <Txt x={30} y={70} size={26}>{"제어판".slice(0, typed) || "검색어를 입력하세요"}<span style={{ opacity: f % 10 < 6 ? 1 : 0 }}>|</span></Txt>
              {f >= 64 ? (
                <div style={{ position: "absolute", left: 30, top: 160, width: 500, height: 70, borderRadius: 12, background: "#E4EEFF", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, fontSize: 26, fontWeight: 800 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#4D8DF5" }} />제어판 <span style={{ fontSize: 20, color: "#6B778F", fontWeight: 500 }}>앱</span>
                </div>
              ) : null}
            </Win>
          ) : null}
          <Win x={260} y={110} w={1080} h={720} title="제어판" from={90}>
            <Txt x={30} y={56} size={20} color="#6B778F">{stage2 ? "제어판  ›  프로그램  ›  프로그램 및 기능" : "제어판"}</Txt>
            {!stage2 ? (
              <>
                <Txt x={40} y={120} size={34} bold>컴퓨터 설정 변경</Txt>
                {["시스템 및 보안", "네트워크 및 인터넷", "하드웨어 및 소리", "프로그램", "사용자 계정", "접근성"].map((t, i) => (
                  <div key={t} style={{ position: "absolute", left: 40 + (i % 3) * 340, top: 190 + Math.floor(i / 3) * 170, width: 310, height: 140, borderRadius: 14, background: "#F2F6FD", border: "1px solid #D8DFEA", padding: 18, fontSize: 24, fontWeight: 800 }}>
                    {t}
                    {t === "프로그램" ? <div style={{ marginTop: 14, fontSize: 22, color: "#1F6BFF", textDecoration: "underline", fontWeight: 600 }}>프로그램 제거</div> : null}
                  </div>
                ))}
              </>
            ) : (
              <>
                <Txt x={40} y={104} size={30} bold>프로그램 제거 또는 변경</Txt>
                <Btn x={40} y={150} w={90} h={38} label="구성 ▾" />
                <Btn x={140} y={150} w={110} h={38} label="제거/변경" off={!selected} />
                <div style={{ position: "absolute", left: 20, top: 205, width: 1040, height: 40, background: "#F3F6FB", borderBottom: "1px solid #D8DFEA", display: "flex", alignItems: "center", fontSize: 20, fontWeight: 800, color: "#44506A" }}>
                  <div style={{ width: 522, paddingLeft: 56 }}>이름</div><div style={{ width: 240 }}>게시자</div><div style={{ width: 180 }}>설치 날짜</div><div>크기</div>
                </div>
                {PROGRAMS.map((n, i) => (i === 2 ? <Row key={n} i={i} name={n} sel={selected && gone < 0.2} gone={gone} /> : <Row key={n} i={i + (i > 2 ? -gone : 0)} name={n} sel={false} gone={0} />))}
                {f >= 284 ? <div style={{ position: "absolute", left: 340, top: 620, width: 400, height: 56, borderRadius: 28, background: "#16A058", color: "#fff", fontSize: 26, fontWeight: 800, display: "grid", placeItems: "center" }}>제거되었습니다 ✓</div> : null}
              </>
            )}
          </Win>
          <Win x={540} y={330} w={520} h={240} title="프로그램 제거" from={206} to={230} z={30}>
            <Txt x={30} y={70} size={24} bold>Lively Wallpaper을(를) 제거하시겠습니까?</Txt>
            <Btn x={290} y={170} w={90} h={44} label="예" primary />
            <Btn x={395} y={170} w={100} h={44} label="아니요" />
          </Win>
          <Win x={540} y={350} w={520} h={170} title="제거하는 중" from={232} to={278} z={30}>
            <Txt x={30} y={64} size={24} bold>제거하는 중…</Txt>
            <Bar x={30} y={112} w={460} p={prog} />
          </Win>
        </Wallpaper>
      </Monitor>
      {plain ? <PlainSteps title="기존 Lively 삭제" items={[{ from: 24, text: "제어판 열기" }, { from: 100, text: "프로그램 제거 선택" }, { from: 160, text: "Lively Wallpaper → 제거/변경" }, { from: 232, text: "삭제 완료!" }]} total={345} /> : (
        <>
        <Checklist title="기존 Lively 삭제하기" items={[{ from: 24, text: "제어판 열기" }, { from: 100, text: "프로그램 제거 선택" }, { from: 160, text: "Lively Wallpaper → 제거/변경" }, { from: 232, text: "삭제 완료!" }]} top={960} />
        <StyledCaption lines={["예전 Lively는", "[[먼저 삭제]]하세요"]} start={0} end={42} fx="stamp" band="#E5484D" cy={560} size={92} />
        </>
      )}
    </Frame>
  );
};
