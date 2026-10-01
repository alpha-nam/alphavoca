# alphavoca Reel (Remotion)

지문 분석 스킬(`csat-passage-card`)로 수업을 준비하는 과정을 보여주는 30초 릴스 (1080×1920, 30fps).

```bash
npm install
npm run studio     # 미리보기
npm run render     # out/reel.mp4
```

## 스킬 결과 → 영상 (파이프라인)
1. `csat-passage-card` 스킬로 지문을 분석한 JSON을 `data/skill-output.json`에 저장한다. (영상용 짧은 스케치 라벨은 `reel_sketch: {left, right}`로 추가)
2. 릴스용 데이터로 변환한다.
   ```bash
   python3 scripts/from_skill.py data/skill-output.json src/data/passage.json "<원문 지문>"
   ```
3. `npm run render`

## 다른 지문으로 만들기
`src/data/passage.json`과 같은 형태(`src/types.ts`의 `Passage`)의 JSON을 `{ "data": {...}, "bgm": "" }`로 감싸 넘긴다.

```bash
npx remotion render Reel out/reel.mp4 --props=my-props.json
```

## BGM
`public/audio/bgm.mp3` 같은 파일을 넣고 props의 `"bgm": "audio/bgm.mp3"`로 지정한다. 비우면 무음.

## 참고
- 한글 폰트는 `public/fonts/NotoSansKR.ttf`를 로컬로 로드한다 (오프라인 렌더용).
- 장면 길이는 `src/Reel.tsx`의 `SCENES`, 색상은 `src/theme.ts`에서 바꾼다.
