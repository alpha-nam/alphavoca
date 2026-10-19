import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { OutlinedText } from "../components/Caption";
import { Pop } from "../components/Card";
import { PlainSteps } from "./Desk";
import { AppFrame, AppScene, Badge, CalGrid, C, Card, Chip, FONT, T } from "./AppKit";
import { useTheme } from "../theme";

const ck = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ─────────── 구글 · 휴대폰 연동 ───────────
export const CONNECT_FRAMES = 340;
const QR = Array.from({ length: 81 }, (_, i) => ((i * 7 + Math.floor(i / 9) * 5) % 3 === 0 ? 1 : 0));

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 340, top: 430, width: 400, height: 800, borderRadius: 52, background: "#0F1624", padding: 14, boxShadow: "0 28px 60px rgba(10,26,63,.35)" }}>
    <div style={{ position: "relative", width: 372, height: 772, borderRadius: 40, background: C.bg, overflow: "hidden", fontFamily: FONT, color: C.ink }}>{children}</div>
  </div>
);

export const Connect: React.FC = () => {
  const f = useCurrentFrame();
  const panel = ck(f, 26, 38);
  const login = f >= 66 && f < 106;
  const done = f >= 108;
  const qr = f >= 146 && f < 222;
  const phone = f >= 224;
  return (
    <Frame>
      {!phone ? (
        <AppFrame active="시간표" cursor={[[0, 330, 300], [20, 592, 19], [56, 540, 223], [84, 350, 317], [120, 400, 300], [132, 470, 346], [222, 470, 346]]} clicks={[24, 64, 104, 144]}>
          <div style={{ position: "absolute", left: 16, top: 52, fontSize: 13, color: C.mute, fontWeight: 700 }}>시간표 · 설정을 열어요</div>
          {panel > 0 ? (
            <Card x={326} y={46} w={284} h={410} style={{ opacity: panel, transform: `translateX(${(1 - panel) * 30}px)`, padding: 12, boxSizing: "border-box" }}>
              <T x={14} y={12} s={14} b>설정</T>
              <T x={14} y={42} s={12} c={C.mute}>항상 맨 위에 표시 · 윈도우 시작 시 자동 실행</T>
              <Card x={12} y={78} w={260} h={150} style={{ border: `2px solid ${done ? C.memo : "#F59E0B"}`, background: done ? "#F0FAF4" : "#FFF7EC" }}>
                <T x={12} y={10} s={13} b c={done ? C.memo : "#D97706"}>{done ? "1단계 · 완료 ✓" : "1단계 · 먼저 여기!"}</T>
                <T x={12} y={36} s={14} b>PC를 구글 드라이브에 연결</T>
                {done ? <T x={12} y={66} s={12} c={C.mute} b>연동 중 · 방금 동기화됨</T> : null}
                {!done ? <div style={{ position: "absolute", left: 130, top: 100, width: 104, height: 32, borderRadius: 16, background: "#F59E0B", color: "#fff", fontSize: 14, fontWeight: 900, display: "grid", placeItems: "center" }}>연결하기</div> : null}
              </Card>
              <Card x={12} y={240} w={260} h={150} style={{ opacity: done ? 1 : 0.5, border: `2px solid ${done ? "#F59E0B" : C.line}`, background: done ? "#FFF7EC" : "#fff" }}>
                <T x={12} y={10} s={13} b c={done ? "#D97706" : C.mute}>{done ? "2단계 · 다음!" : "2단계"}</T>
                <T x={12} y={36} s={14} b>휴대폰에서 열기</T>
                <div style={{ position: "absolute", left: 52, top: 94, width: 156, height: 32, borderRadius: 16, background: done ? "#F59E0B" : "#CBD5E6", color: "#fff", fontSize: 13, fontWeight: 900, display: "grid", placeItems: "center" }}>휴대폰에서 열기 (QR)</div>
              </Card>
            </Card>
          ) : null}
          {login ? (
            <Card x={150} y={120} w={320} h={230} style={{ zIndex: 40, boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
              <T x={20} y={16} s={16} b>구글 계정으로 로그인</T>
              <div style={{ position: "absolute", left: 20, top: 62, width: 280, height: 52, borderRadius: 10, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 12px", fontSize: 13, fontWeight: 700 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: "#8B7CF6" }} />teacher@example.com
              </div>
              <T x={20} y={128} s={11.5} c={C.mute} w={280}>앱은 드라이브의 TimeTablePlus 폴더만 사용해요</T>
              <div style={{ position: "absolute", left: 200, top: 170, width: 100, height: 34, borderRadius: 8, background: C.blue, color: "#fff", fontSize: 14, fontWeight: 900, display: "grid", placeItems: "center" }}>허용</div>
            </Card>
          ) : null}
          {qr ? (
            <Card x={150} y={92} w={320} h={300} style={{ zIndex: 40, boxShadow: "0 20px 50px rgba(0,0,0,.3)" }}>
              <T x={16} y={12} s={15} b>휴대폰 · 태블릿에서 열기</T>
              <div style={{ position: "absolute", left: 20, top: 50, width: 96, height: 96, display: "grid", gridTemplateColumns: "repeat(9,1fr)", gap: 1, padding: 4, border: `1px solid ${C.line}`, borderRadius: 8 }}>
                {QR.map((v, i) => (
                  <div key={i} style={{ background: v ? "#0F1624" : "#fff" }} />
                ))}
              </div>
              {["① 크롬 / 사파리로 주소 열기", "② 같은 구글 계정으로 로그인", "③ 홈 화면에 추가"].map((t, i) => (
                <T key={t} x={128} y={58 + i * 30} s={12.5} b>{t}</T>
              ))}
              <T x={20} y={170} s={11.5} c="#B45309" b w={280}>카톡·네이버 앱 안에서는 로그인이 안 돼요</T>
            </Card>
          ) : null}
        </AppFrame>
      ) : (
        <PhoneFrame>
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 44, background: "#fff", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 10px", gap: 6, fontSize: 14, fontWeight: 800, color: C.mute }}>
            {["시간표", "결보강", "캘린더", "오늘"].map((t, i) => (
              <span key={t} style={{ color: i === 2 ? "#fff" : C.mute, background: i === 2 ? C.blue : "transparent", padding: "5px 10px", borderRadius: 14 }}>{t}</span>
            ))}
          </div>
          <CalGrid x={16} y={70} cw={48} ch={52} sel={21} today={19} badges={{ 6: ["acad"], 13: ["cls", "memo"], 16: ["subj"], 21: ["acad", "memo", "cls", "subj"], 23: ["memo"] }} />
          <Pop delay={4} style={{ position: "absolute", right: 14, bottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 22, background: "#fff", border: `1px solid ${C.line}`, fontSize: 16, fontWeight: 800, boxShadow: "0 6px 16px rgba(20,60,140,.15)" }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: C.memo }} />동기화됨
            </div>
          </Pop>
        </PhoneFrame>
      )}
      <PlainSteps title="구글 · 휴대폰 연동" total={CONNECT_FRAMES}
        items={[{ from: 0, text: "1단계  PC를 구글 드라이브에 연결" }, { from: 108, text: "2단계  QR로 휴대폰에서 열기" }, { from: 224, text: "PC와 휴대폰이 같은 화면 · 동기화" }]}
        note={{ from: 232, text: "각자 자기 구글 계정에 저장돼요 · 교사끼리 데이터는 공유되지 않아요" }} />
    </Frame>
  );
};

// ─────────── 학급출결 ───────────
export const CLASSATT_FRAMES = 230;
export const ClassAtt: React.FC = () => {
  const f = useCurrentFrame();
  const kind = f >= 40, why = f >= 70;
  const memo = f >= 100 ? "병원" : "";
  const added = f >= 150;
  return (
    <AppScene title="학급출결" active="학급출결" total={CLASSATT_FRAMES}
      items={[{ from: 0, text: "종류와 구분을 눌러 입력" }, { from: 100, text: "비고를 적고 추가" }, { from: 150, text: "기록은 바로 목록에" }]}
      cursor={[[0, 330, 380], [30, 360, 196], [66, 130, 233], [90, 110, 296], [140, 575, 296], [175, 330, 400], [230, 330, 400]]} clicks={[38, 68, 148]}>
      <div style={{ position: "absolute", left: 16, top: 50, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800 }}>
        <span style={{ color: C.mute }}>‹</span><span style={{ background: "#fff", border: `1px solid ${C.line}`, padding: "5px 12px", borderRadius: 12 }}>10월 19일 (월) ▾</span><span style={{ color: C.mute }}>›</span>
        <span style={{ color: C.blue }}>오늘</span>
      </div>
      <div style={{ position: "absolute", right: 16, top: 50, padding: "6px 14px", borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 800 }}>출결 종합</div>
      <div style={{ position: "absolute", left: 16, top: 98, display: "flex", gap: 8, fontSize: 13, fontWeight: 700 }}>
        {["학년 3 ▾", "반 2 ▾", "번호 12 ▾"].map((t) => (
          <div key={t} style={{ padding: "6px 14px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10 }}>{t}</div>
        ))}
      </div>
      <T x={16} y={146} s={12} b c={C.mute}>종류</T>
      {["결석", "조퇴", "지각", "결과"].map((t, i) => (
        <Chip key={t} x={60 + i * 84} y={140} w={76} h={30} label={t} on={kind && t === "조퇴"} color={C.cls} />
      ))}
      <T x={16} y={190} s={12} b c={C.mute}>구분</T>
      {["질병", "미인정", "기타", "출석인정"].map((t, i) => (
        <Chip key={t} x={60 + i * 84} y={184} w={76} h={30} label={t} on={why && t === "질병"} color="#F08A24" />
      ))}
      <T x={16} y={236} s={12} b c={C.mute}>비고</T>
      <div style={{ position: "absolute", left: 60, top: 228, width: 430, height: 32, borderRadius: 10, border: `1px solid #CBD5E6`, background: "#fff", padding: "6px 12px", fontSize: 13, fontWeight: 600, boxSizing: "border-box" }}>{memo || <span style={{ color: "#A7B0C0" }}>교시, 사유 등 입력</span>}</div>
      <div style={{ position: "absolute", left: 500, top: 228, width: 100, height: 32, borderRadius: 16, background: C.blue, color: "#fff", fontSize: 14, fontWeight: 900, display: "grid", placeItems: "center" }}>+ 추가</div>
      <T x={16} y={284} s={14} b>이 날짜 출결 기록 (총 <span style={{ color: C.blue }}>{added ? 1 : 0}건</span>)</T>
      {added ? (
        <Pop style={{ position: "absolute", left: 16, top: 316, width: 588 }}>
          <div style={{ height: 40, borderRadius: 10, background: "#fff", border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.cls}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 14, fontSize: 14, fontWeight: 800 }}>
            <span>3-2 12번 학생 A</span><span style={{ color: C.cls }}>질병조퇴</span><span style={{ color: C.mute, fontWeight: 600 }}>병원</span>
          </div>
        </Pop>
      ) : null}
    </AppScene>
  );
};

// ─────────── 폰에서 교과출결 → PC 반영 ───────────
export const PHONESYNC_FRAMES = 240;
export const PhoneSync: React.FC = () => {
  const f = useCurrentFrame();
  const pc = f >= 130;
  const checked = f >= 54;
  const synced = f >= 96;
  const rows = ["학생 A", "학생 B", "학생 C", "학생 D"];
  return (
    <Frame>
      {!pc ? (
        <>
          <PhoneFrame>
            <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 44, background: "#fff", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 15, fontWeight: 800 }}>교과출결</div>
            <div style={{ position: "absolute", left: 14, top: 58, display: "flex", gap: 8 }}>
              {["3교시 영어", "5교시 영어"].map((t, i) => (
                <div key={t} style={{ padding: "6px 12px", borderRadius: 14, fontSize: 14, fontWeight: 800, background: i === 0 ? "#E8F8EE" : "#fff", border: `1px solid ${i === 0 ? C.memo : C.line}` }}>{t}</div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 14, top: 108, fontSize: 13, color: C.mute, fontWeight: 700 }}>4명 · 이름 옆 버튼을 눌러 체크해요</div>
            {rows.map((n, i) => (
              <div key={n} style={{ position: "absolute", left: 14, right: 14, top: 140 + i * 74, height: 64, borderRadius: 14, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 12px", gap: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.mute, width: 54 }}>2-3-{i + 1}</div>
                <div style={{ fontSize: 16, fontWeight: 800, width: 62 }}>{n}</div>
                {["결석", "지각", "조퇴"].map((t) => (
                  <div key={t} style={{ padding: "6px 8px", borderRadius: 10, fontSize: 13, fontWeight: 800, background: checked && i === 2 && t === "결석" ? C.subj : "#F4F7FC", color: checked && i === 2 && t === "결석" ? "#fff" : C.mute }}>{t}</div>
                ))}
              </div>
            ))}
            <Pop delay={synced ? 0 : 999} style={{ position: "absolute", right: 14, bottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 22, background: "#fff", border: `1px solid ${C.line}`, fontSize: 16, fontWeight: 800 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: synced ? C.memo : "#F5B800" }} />{synced ? "동기화됨" : "동기화 중"}
              </div>
            </Pop>
            {/* 손가락 탭 */}
            {f >= 40 && f < 70 ? <div style={{ position: "absolute", left: 244, top: 140 + 2 * 74 + 14, width: 38, height: 38, borderRadius: 19, background: "rgba(139,124,246,.35)", border: `3px solid ${C.subj}`, transform: `scale(${1 + ck(f, 50, 66) * 0.6})`, opacity: 1 - ck(f, 56, 70) * 0.7 }} /> : null}
          </PhoneFrame>
        </>
      ) : (
        <AppFrame active="교과출결" cursor={[[0, 330, 380], [240, 330, 380]]} clicks={[]}>
          <div style={{ position: "absolute", left: 16, top: 50, display: "flex", gap: 8 }}>
            {["3교시 영어 2-3", "5교시 영어 2-4"].map((t, i) => (
              <div key={t} style={{ padding: "6px 12px", borderRadius: 14, fontSize: 13, fontWeight: 800, background: i === 0 ? "#E8F8EE" : "#fff", border: `1px solid ${i === 0 ? C.memo : C.line}` }}>{t}</div>
            ))}
          </div>
          {rows.map((n, i) => (
            <div key={n} style={{ position: "absolute", left: 16, width: 588, top: 100 + i * 52, height: 44, borderRadius: 12, background: "#fff", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 14, fontSize: 14, fontWeight: 800 }}>
              <span style={{ color: C.mute, width: 56 }}>2-3-{i + 1}</span><span style={{ width: 70 }}>{n}</span>
              {["결석", "지각", "조퇴", "결과"].map((t) => {
                const on = i === 2 && t === "결석";
                return <span key={t} style={{ padding: "4px 12px", borderRadius: 10, background: on ? C.subj : "#F4F7FC", color: on ? "#fff" : C.mute }}>{t}</span>;
              })}
              {i === 2 ? <Pop style={{ marginLeft: "auto", fontSize: 12, color: C.memo }}>방금 반영됨 ✓</Pop> : null}
            </div>
          ))}
        </AppFrame>
      )}
      <PlainSteps title="폰에서 체크하면 PC에도" total={PHONESYNC_FRAMES}
        items={[{ from: 0, text: "폰에서 교과출결 체크" }, { from: 96, text: "동기화됨" }, { from: 134, text: "PC 교과출결에 바로 반영" }]} />
    </Frame>
  );
};

// ─────────── 메모 ───────────
export const MEMO_FRAMES = 230;
export const Memo: React.FC = () => {
  const f = useCurrentFrame();
  const pickerOpen = f >= 40 && f < 112;
  const start = f >= 68, end = f >= 92;
  const done3 = f >= 150;
  return (
    <AppScene title="메모" active="메모" total={MEMO_FRAMES}
      items={[{ from: 0, text: "메모에 날짜를 붙여요" }, { from: 68, text: "시작일 ~ 종료일, 기간도 돼요" }, { from: 150, text: "체크하면 완료로 정리" }]}
      cursor={[[0, 330, 400], [34, 130, 166], [64, 372, 218], [90, 408, 218], [140, 40, 322], [230, 330, 400]]} clicks={[38, 66, 90, 148]}>
      <T x={16} y={50} s={13} b c={C.mute}>남은 일 {done3 ? 2 : 3}</T>
      <div style={{ position: "absolute", right: 16, top: 46, display: "flex", gap: 8, fontSize: 12, fontWeight: 800 }}>
        {["가로", "+ 섹션", "휴지통 · 백업"].map((t) => (
          <div key={t} style={{ padding: "5px 12px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12 }}>{t}</div>
        ))}
      </div>
      <Card x={16} y={86} w={588} h={64} style={{ borderLeft: `5px solid ${C.memo}` }}>
        <T x={16} y={10} s={14} b>학부모 상담 자료 준비</T>
        <div style={{ position: "absolute", left: 16, top: 34, padding: "3px 10px", borderRadius: 12, background: "#E3F6EA", color: C.memo, fontSize: 12, fontWeight: 800 }}>10/21 (수)</div>
      </Card>
      <Card x={16} y={160} w={588} h={64}>
        <T x={16} y={10} s={14} b>수행평가 채점</T>
        <div style={{ position: "absolute", left: 16, top: 34, padding: "3px 10px", borderRadius: 12, background: start ? "#E3F6EA" : "#fff", border: start ? "none" : "1.5px dashed #B8C3D6", color: start ? C.memo : C.mute, fontSize: 12, fontWeight: 800 }}>{end ? "10/21 (수) ~ 10/23 (금)" : start ? "10/21 (수) ~ …" : "+ 날짜"}</div>
      </Card>
      {pickerOpen ? (
        <Card x={150} y={190} w={300} h={176} style={{ zIndex: 30, padding: 10, boxSizing: "border-box", boxShadow: "0 14px 36px rgba(0,0,0,.25)" }}>
          <T x={12} y={8} s={12} b c={C.mute}>{start && !end ? "끝나는 날 선택 (하루면 한 번 더)" : "10월"}</T>
          <div style={{ position: "absolute", left: 12, top: 30, display: "grid", gridTemplateColumns: "repeat(7, 38px)", gap: 3 }}>
            {Array.from({ length: 21 }, (_, i) => {
              const d = 14 + i;
              const inRange = start && d >= 21 && d <= (end ? 23 : 21);
              return <div key={d} style={{ height: 26, borderRadius: 8, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, background: inRange ? C.memo : "#F4F7FC", color: inRange ? "#fff" : C.ink }}>{d}</div>;
            })}
          </div>
        </Card>
      ) : null}
      <Card x={16} y={234} w={588} h={64} style={{ opacity: done3 ? 0.55 : 1 }}>
        <div style={{ position: "absolute", left: 14, top: 20, width: 22, height: 22, borderRadius: 6, border: `2px solid ${done3 ? C.memo : "#B8C3D6"}`, background: done3 ? C.memo : "#fff", color: "#fff", fontSize: 14, fontWeight: 900, display: "grid", placeItems: "center" }}>{done3 ? "✓" : ""}</div>
        <T x={48} y={20} s={14} b c={done3 ? C.mute : C.ink}><span style={{ textDecoration: done3 ? "line-through" : "none" }}>시험지 인쇄 후 회의</span></T>
      </Card>
    </AppScene>
  );
};

// ─────────── 캘린더 ───────────
export const CALENDAR_FRAMES = 250;
export const Calendar: React.FC = () => {
  const f = useCurrentFrame();
  const sel = f >= 40 ? 21 : 19;
  const sched = f >= 132 && f < 196;
  return (
    <AppScene title="캘린더에서 한눈에" active="캘린더" total={CALENDAR_FRAMES}
      items={[{ from: 0, text: "학사일정 · 메모 · 학급출결 · 교과출결 배지" }, { from: 44, text: "날짜를 누르면 그날 목록" }, { from: 130, text: "N월 학사일정 버튼으로 한 번에" }]}
      cursor={[[0, 330, 420], [34, 176, 164], [100, 176, 164], [126, 120, 262], [200, 330, 420], [250, 330, 420]]} clicks={[38, 130]}>
      <div style={{ position: "absolute", left: 16, top: 48, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 900 }}>
        <span style={{ color: C.mute }}>‹</span><span style={{ padding: "4px 12px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12 }}>10월</span><span style={{ color: C.mute }}>›</span>
      </div>
      {!sched ? (
        <CalGrid x={14} y={84} cw={46} ch={54} sel={sel} today={19} badges={{ 6: ["acad"], 7: ["acad"], 8: ["acad"], 13: ["cls", "memo"], 16: ["subj"], 21: ["acad", "memo", "cls", "subj"], 23: ["memo"], 27: ["acad"] }} />
      ) : (
        <Card x={14} y={84} w={322} h={330} style={{ padding: 12, boxSizing: "border-box" }}>
          {[["10/6(화) ~ 10/8(목)", "1차 정기시험"], ["10/9(금)", "한글날"], ["10/21(수)", "진로 특강"], ["10/27(화)", "학부모 상담 주간"]].map(([d, n], i) => (
            <div key={d} style={{ display: "flex", gap: 10, fontSize: 13, fontWeight: 800, padding: "8px 4px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ width: 132, color: C.acad }}>{d}</span><span>{n}</span>
            </div>
          ))}
        </Card>
      )}
      <div style={{ position: "absolute", left: 14, top: 424, width: 322, height: 36, borderRadius: 12, background: sched ? "#8BC34A" : "#E6F4C9", color: sched ? "#fff" : "#4D6B1A", fontSize: 15, fontWeight: 900, display: "grid", placeItems: "center" }}>10월 학사일정 (4)</div>
      <div style={{ position: "absolute", left: 348, top: 46, right: 14 }}>
        <div style={{ textAlign: "right", fontSize: 12, fontWeight: 800 }}><span style={{ padding: "5px 12px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12 }}>출결 종합</span></div>
        <div style={{ marginTop: 10, fontSize: 14, fontWeight: 900 }}>10월 {sel}일 ({sel === 21 ? "수" : "월"})</div>
        {sel === 21 ? (
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {([["acad", "진로 특강"], ["memo", "학부모 상담 자료 준비"], ["cls", "3-2 12번 · 질병조퇴"], ["subj", "3교시 영어 · 질병결석"]] as const).map(([k, t], i) => (
              <Pop key={k} delay={42 + i * 5}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", background: "#fff", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12.5, fontWeight: 800 }}>
                  <Badge k={k} size={16} />{t}
                </div>
              </Pop>
            ))}
          </div>
        ) : null}
      </div>
    </AppScene>
  );
};

// ─────────── 마무리 (임시 문구) ───────────
export const OUTRO_FRAMES = 110;
export const Outro: React.FC = () => {
  const theme = useTheme();
  return (
    <Frame>
      <Pop style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center" }}>
        <div style={{ fontSize: 76, fontWeight: 900, color: "#14203A", lineHeight: 1.4, fontFamily: theme.font }}>시간표부터 출결, 메모까지<br /><span style={{ color: theme.primary }}>한 화면에서</span></div>
      </Pop>
      <Pop delay={16} style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center" }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: theme.muted, fontFamily: theme.font }}>TimeTable+</div>
      </Pop>
    </Frame>
  );
};
