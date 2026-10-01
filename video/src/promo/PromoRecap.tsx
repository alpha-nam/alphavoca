import React from "react";
import { Frame } from "../components/Frame";
import { Pop } from "../components/Card";
import { OutlinedText } from "../components/Caption";
import { useTheme } from "../theme";

const ITEMS = [
  "주제 · 요지", "쉬운 설명", "개념 스케치", "핵심 어휘",
  "문장별 해석 · 문법", "논리 흐름", "비유 티칭 포인트", "정답 · 오답 분석",
  "수업 팁", "변형문제 추천",
];

export const PromoRecap: React.FC = () => {
  const theme = useTheme();
  return (
    <Frame>
      <Pop style={{ marginBottom: 6 }}>
        <OutlinedText lines={["[[이 모든 게]]", "한 번에!"]} size={92} />
      </Pop>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, padding: "0 6px" }}>
        {ITEMS.map((t, i) => (
          <Pop key={t} delay={10 + i * 5}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: theme.surface,
                border: `3px solid ${theme.line}`,
                borderRadius: 24,
                padding: "22px 24px",
                boxShadow: "0 8px 22px rgba(20,60,160,.10)",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 22, background: theme.primary, color: "#fff", fontSize: 30, fontWeight: 900, display: "grid", placeItems: "center", flex: "none" }}>
                ✓
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: theme.text, lineHeight: 1.25 }}>{t}</div>
            </div>
          </Pop>
        ))}
      </div>
    </Frame>
  );
};
