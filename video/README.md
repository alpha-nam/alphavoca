# alphavoca Reel (Remotion)

`csat-passage-card` 스킬이 만든 **실제 HTML 카드**를 캡처해 연출하는 약 32초 릴스 (1080×1920, 30fps).
디자인 시안 3종: `ReelBlue`(스킬 카드 원본) / `ReelDark`(스킬 카드 다크) / `ReelGreen`(alphavoca 팔레트).

```bash
npm install
npm run capture    # 카드 HTML → public/card/<시안>/*.png
npm run studio     # 미리보기
npm run render     # out/reel-{blue,dark,green}.mp4
```

## 스킬 결과 → 영상
1. 스킬이 만든 카드 HTML을 `data/skill-card.html`로 저장하고 `npm run capture`로 섹션별 PNG를 만든다.
2. 지문 붙여넣기 장면용 원문은 `src/data/passage.json`의 `passage`를 쓴다.
   (스킬 JSON → `python3 scripts/from_skill.py data/skill-output.json src/data/passage.json "<원문>"`)
3. `npm run render`

## BGM
`public/audio/bgm.mp3`를 넣고 `Root.tsx`의 props에서 `bgm: "audio/bgm.mp3"`로 지정. 비우면 무음.

## 참고
- 한글 폰트는 `public/fonts/NotoSansKR.ttf`를 로컬로 로드한다 (오프라인 렌더용).
- 카드 캡처 폭은 600px(모바일 카드 크기)로 맞춰 글자가 크게 보이게 했다. `scripts/capture_card.mjs`에서 조정.
- 장면 길이는 `src/Reel.tsx`의 `SCENES`, 시안 색상은 `src/theme.tsx`에서 바꾼다.

## 교사 대상 홍보 영상 (PromoBlue, 약 39초)
교재 문제를 캡처해 채팅창에 끌어다 놓는 훅 → 최신 스킬 카드 스크롤(설계도·★/! 표시 포함) → 인쇄/PDF → 학습지·정답지 → 기능 요약 → CTA.
```bash
python3 scripts/make_sample_card.py    # 샘플 → data/question.html (문제 페이지)
node scripts/capture_promo.mjs         # 문제 이미지 캡처 (public/promo/question.png)
python3 scripts/to_skill_payload.py    # 샘플 → 최신 csat-passage-card payload → data/skill-card2.html
node scripts/capture_promo2.mjs        # 카드 섹션 PNG + toolbar + src/data/promo-manifest.json
node scripts/capture_promo2.mjs --dark # (선택) 다크 카드 캡처
python3 scripts/make_worksheet.py      # data/worksheet-student.html / worksheet-key.html
node scripts/print_ws.mjs              # 학습지·정답지·카드 PDF(out/pdf) + 영상용 페이지 PNG
npx remotion render PromoBlue out/promo-blue.mp4
```
- 렌더러(`scripts/skill_card/generate_html.py`)는 스킬 최신 버전의 사본이다. 스킬이 바뀌면 다시 복사한다.
- 학습지는 passage-worksheet-builder 스킬의 CSS/규칙을 따른다 (학생용·정답지 모두 정확히 A4 2쪽 확인).
- 샘플 지문은 직접 쓴 오리지널 지문이다. 교재(EBS 등) 지문은 저작권이 있으므로 공개 영상에 쓰지 않는다.
- 훅의 채팅 화면은 특정 서비스 UI를 따라 그리지 않은 일반 모형이다. 실제 화면 녹화가 있으면 `PromoHook` 장면을 영상으로 교체한다.
- 스크롤 구간/자막은 `src/promo/PromoScroll.tsx`의 `STOPS`에서 조정한다. 배경은 `bg` 옵션(기본 light).
