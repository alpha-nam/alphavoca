import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Frame } from "../components/Frame";
import { StyledCaption } from "../promo/FlashCaption";
import { Bar, Btn, Checklist, PlainSteps, usePlain, Monitor, Txt, Wallpaper, Win } from "./Desk";

export const INSTALL_FRAMES = 470;

const CAM = [[0, 800, 500, 1], [30, 1300, 120, 1.5], [60, 800, 490, 1.15], [110, 800, 470, 1.2], [116, 800, 450, 1.55], [150, 800, 450, 1.55], [200, 800, 490, 1.15], [268, 800, 450, 1.55], [352, 800, 450, 1.55], [388, 1000, 520, 1.25], [470, 1000, 520, 1.2]];
const CURSOR = [[0, 800, 520], [40, 1380, 135], [60, 1380, 135], [88, 520, 298], [112, 690, 409], [140, 950, 548], [196, 950, 548], [215, 520, 298], [250, 520, 410], [292, 700, 500], [316, 800, 542], [345, 680, 532], [372, 700, 542], [400, 1000, 500]];
const CLICKS = [58, 92, 114, 142, 218, 222, 262, 266, 318, 348, 378];

const Item: React.FC<{ y: number; name: string; kind: string; size?: string; color: string; hi?: boolean; folder?: boolean }> = ({ y, name, kind, size, color, hi, folder }) => (
  <div style={{ position: "absolute", left: 270, top: y, width: 900, height: 52, borderRadius: 8, background: hi ? "#D7E6FF" : "transparent", border: hi ? "1px solid #8DB4FF" : "1px solid transparent", display: "flex", alignItems: "center", fontSize: 22 }}>
    <div style={{ width: 34, height: folder ? 26 : 32, borderRadius: folder ? "4px 4px 6px 6px" : 6, background: color, margin: "0 16px" }} />
    <div style={{ width: 460, fontWeight: 700 }}>{name}</div>
    <div style={{ width: 240, color: "#6B778F" }}>{kind}</div>
    <div style={{ color: "#6B778F" }}>{size}</div>
  </div>
);

export const Install: React.FC = () => {
  const f = useCurrentFrame();
  const plain = usePlain();
  const dl = interpolate(f, [4, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ext = interpolate(f, [144, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dots = Math.floor(interpolate(f, [276, 300], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const inside = f >= 226;
  const extracted = f >= 192;
  const menu = f >= 92 && f < 115;
  const exeSel = f >= 252;
  const exp = interpolate(f, [380, 396], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const widget = interpolate(f, [384, 402], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Frame>
      <Monitor cam={CAM} cursor={CURSOR} clicks={CLICKS}>
        <Wallpaper clock="오전 9:30">
          {f >= 0 && f < 70 ? (
            <Win x={1130} y={60} w={400} h={130} title="다운로드" from={2} to={60} z={20}>
              <Txt x={20} y={58} size={21} bold>TimeTable-portable.zip</Txt>
              <Txt x={20} y={88} size={17} color="#6B778F">133 MB</Txt>
              <Bar x={150} y={96} w={230} p={dl} />
              {dl >= 1 ? <Txt x={250} y={66} size={20} color="#1F6BFF">폴더에서 보기</Txt> : null}
            </Win>
          ) : null}
          <div style={{ opacity: exp }}>
            <Win x={200} y={120} w={1200} h={760} title={inside ? "다운로드 › TimeTable-portable" : "다운로드"} from={60} z={10}>
              <div style={{ position: "absolute", left: 0, top: 44, width: 240, bottom: 0, background: "#F5F8FC", borderRight: "1px solid #E1E7F0", padding: "30px 24px", fontSize: 22, color: "#44506A", lineHeight: 2.1 }}>바탕 화면<br /><b style={{ color: "#1F6BFF" }}>다운로드</b><br />문서<br />사진</div>
              <Txt x={270} y={106} size={19} color="#6B778F">이름</Txt>
              {!inside ? (
                <>
                  {extracted ? <Item y={150} name="TimeTable-portable" kind="파일 폴더" color="#FFC94D" folder hi={f >= 216} /> : null}
                  <Item y={extracted ? 206 : 150} name="TimeTable-portable.zip" kind="압축(ZIP) 폴더" size="133 MB" color="#8FA9D8" hi={!extracted && f >= 88} />
                  <Item y={extracted ? 262 : 206} name="안내문.pdf" kind="PDF 문서" size="214 KB" color="#FF8F6B" />
                  <Item y={extracted ? 318 : 262} name="사진 01.jpg" kind="이미지" size="2.1 MB" color="#7BD38E" />
                </>
              ) : (
                <>
                  <Item y={150} name="locales" kind="파일 폴더" color="#FFC94D" folder />
                  <Item y={206} name="resources" kind="파일 폴더" color="#FFC94D" folder />
                  <Item y={262} name="TimeTable.exe" kind="응용 프로그램" size="168 MB" color="#2E86F0" hi={exeSel} />
                  <Item y={318} name="LICENSE" kind="파일" size="1 KB" color="#B9C3D6" />
                </>
              )}
            </Win>
          </div>
          {menu ? (
            <div style={{ position: "absolute", left: 540, top: 320, width: 300, height: 232, borderRadius: 12, background: "#fff", boxShadow: "0 18px 40px rgba(0,0,0,.4)", zIndex: 25, padding: 8, fontFamily: "NotoSansKRLocal, sans-serif", fontSize: 23 }}>
              {["열기", "모두 압축 풀기…", "복사", "삭제"].map((t, i) => (
                <div key={t} style={{ height: 54, display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 8, fontWeight: 700, background: i === 1 && f >= 104 ? "#D7E6FF" : "transparent" }}>{t}</div>
              ))}
            </div>
          ) : null}
          <Win x={540} y={300} w={520} h={300} title="압축(ZIP) 폴더 풀기" from={116} to={190} z={30}>
            <Txt x={30} y={66} size={22} bold>압축을 풀 대상 폴더</Txt>
            <div style={{ position: "absolute", left: 30, top: 108, width: 460, height: 44, borderRadius: 8, border: "1px solid #C9D2E2", background: "#F8FAFD", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 19, color: "#44506A" }}>다운로드\TimeTable-portable</div>
            {f < 144 ? <Btn x={330} y={226} w={160} h={44} label="압축 풀기" primary /> : <Bar x={30} y={196} w={460} p={ext} />}
            {f >= 144 ? <Txt x={30} y={160} size={20} color="#6B778F">파일을 푸는 중…</Txt> : null}
          </Win>
          <Win x={590} y={330} w={420} h={270} title="TimeTable+" from={270} to={318} z={30}>
            <Txt x={30} y={64} size={23} bold>비밀번호를 입력하세요</Txt>
            <div style={{ position: "absolute", left: 30, top: 118, width: 360, height: 44, borderRadius: 8, border: "1px solid #C9D2E2", background: "#F8FAFD", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 30, letterSpacing: 6 }}>{"●".repeat(dots)}</div>
            <Btn x={150} y={190} w={120} h={44} label="확인" primary />
          </Win>
          <Win x={540} y={320} w={520} h={260} title="TimeTable+" from={322} to={348} z={30}>
            <Txt x={30} y={64} size={23} bold>바탕화면에 바로가기를 만들까요?</Txt>
            <Txt x={30} y={116} size={19} color="#6B778F">☐ 다시 묻지 않기</Txt>
            <Btn x={60} y={190} w={160} h={44} label="만들기" primary />
            <Btn x={240} y={190} w={160} h={44} label="나중에" />
          </Win>
          <Win x={540} y={320} w={520} h={280} title="TimeTable+" from={352} to={378} z={30}>
            <Txt x={30} y={64} size={23} bold>구글 드라이브 연동을 켤까요?</Txt>
            <Txt x={30} y={112} size={19} color="#6B778F" w={460}>켜면 휴대폰과 PC가 서로 동기화돼요.</Txt>
            <Btn x={60} y={200} w={200} h={44} label="지금 켜기" primary />
            <Btn x={280} y={200} w={180} h={44} label="다시 묻지 않기" />
          </Win>
          {widget > 0 ? (
            <div style={{ position: "absolute", left: 1060, top: 540, width: 480, height: 370, borderRadius: 20, background: "rgba(255,255,255,.96)", boxShadow: "0 18px 40px rgba(0,0,0,.35)", padding: 18, opacity: widget, transform: `translateY(${(1 - widget) * 30}px)`, fontFamily: "NotoSansKRLocal, sans-serif" }}>
              <div style={{ display: "flex", gap: 8, fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 14 }}>
                {["시간표", "결보강", "캘린더", "오늘"].map((t, i) => (
                  <div key={t} style={{ padding: "5px 12px", borderRadius: 14, background: i === 0 ? "#1F6BFF" : "#B9C7E0" }}>{t}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                {Array.from({ length: 25 }, (_, i) => (
                  <div key={i} style={{ height: 44, borderRadius: 8, background: ["#E8E3FF", "#DDF1FF", "#FFE9DC", "#E2F5E6", "#FFF3CC"][(i * 3 + Math.floor(i / 5)) % 5] }} />
                ))}
              </div>
            </div>
          ) : null}
        </Wallpaper>
      </Monitor>
      {plain ? <PlainSteps title="TimeTable+ 설치" items={[{ from: 0, text: "zip 파일 받기" }, { from: 92, text: "우클릭 → 모두 압축 풀기" }, { from: 216, text: "폴더 열고 TimeTable.exe 실행" }, { from: 276, text: "비밀번호 입력" }, { from: 322, text: "바로가기 · 구글 연동 켜기" }]} total={470} /> : (
        <>
        <Checklist title="TimeTable+ 설치 방법" items={[{ from: 0, text: "zip 파일 받기" }, { from: 92, text: "우클릭 → 모두 압축 풀기" }, { from: 216, text: "폴더 열고 TimeTable.exe 실행" }, { from: 276, text: "비밀번호 입력" }, { from: 322, text: "바로가기 · 구글 연동 켜기" }]} top={930} />
        <StyledCaption lines={["설치는", "[[이렇게]] 해요"]} start={0} end={40} fx="drop" band="#1F6BFF" cy={560} size={96} />
        </>
      )}
    </Frame>
  );
};
