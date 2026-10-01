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
