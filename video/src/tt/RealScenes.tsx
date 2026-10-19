import React from "react";
import { RealScene, realFrames } from "./Real";

const mk = (keyName: string, title: string, steps: Record<number, string>, phone?: { w: number; h: number }) => {
  const C: React.FC = () => <RealScene keyName={keyName} title={title} steps={steps} phone={phone} />;
  return { C, frames: realFrames(keyName) };
};

export const RTimetable = mk("tt", "시간표 확인", { 0: "내 시간표가 한눈에", 1: "보기 종류 고르기", 2: "학급 선택", 4: "다른 반 시간표도 바로" });
export const RSwap = mk("swap", "결보강", { 0: "결보강 탭", 1: "바꿀 칸 누르기", 2: "바꿀 수 있는 선생님 찾기" });
export const RToday = mk("today", "오늘 탭", { 0: "시간 · 날씨 · 급식", 1: "석식도 확인", 2: "학사일정까지" });
export const RAtt = mk("att", "학급 출결", { 0: "출결 탭", 1: "학년 · 반 선택", 3: "번호 고르기", 4: "조퇴 누르기", 5: "구분 · 사유", 7: "추가" });
export const RPhone = mk("phone", "휴대폰 연동", { 0: "휴대폰에서도 캘린더", 1: "교과 출결 입력", 2: "체크하면 바로 동기화", 3: "동기화됨" }, { w: 390, h: 660 });
export const RSubj = mk("subj", "교과 출결", { 0: "교과 출결 탭", 1: "학생 체크", 2: "사유 입력" });
export const RMemo = mk("memo", "메모", { 0: "메모 탭", 1: "메모 추가", 3: "추가", 4: "날짜 지정", 8: "완료 체크" });
export const RCal = mk("cal", "캘린더", { 0: "캘린더 탭", 1: "날짜 누르기", 4: "학사일정 · 메모 · 출결 한곳에" });
