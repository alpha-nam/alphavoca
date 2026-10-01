// csat-passage-card 스킬 JSON 중 영상에 쓰는 필드만 추린 타입
export type Passage = {
  passage: string;
  topic: string;
  main_idea: string;
  sentences: { no: number; english: string; translation: string }[];
  sketch: { caption: string; left: string; right: string };
  choices: { label: string; text: string; correct: boolean }[];
};

export type ReelProps = {
  data: Passage;
  // public/ 기준 경로 (예: "audio/bgm.mp3"). 비우면 오디오 없음.
  bgm?: string;
};
