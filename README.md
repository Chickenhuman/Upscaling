# Upscaling UI (Vanilla JS)

단일 페이지에서 이미지 업스케일링 흐름을 처리하는 프론트엔드입니다.

## 현재 상태

- `Step 1~5` 구현 완료
- 기본 모드: `Mock API` (`USE_MOCK_API: true`)
- 실제 API 전환 가능 (`js/main.js`의 `CONFIG` 수정)

## 실행

ES Module을 사용하므로 정적 서버로 실행하세요.

```bash
cd /workspaces/Upscaling
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173 접속
```

## 테스트

```bash
npm test
npm run check
```

## API 연결 전환

`js/main.js`에서 아래 항목을 설정하세요.

- `USE_MOCK_API: false`
- `API_URL: "https://your-api-endpoint"`
- 필요 시 `API_KEY`
- 필요 시 `FILE_FIELD_NAME`, `UPSCALE_FACTOR`

API 응답은 아래 키 중 하나에 결과 URL을 포함하면 동작합니다.

- `imageUrl`
- `resultUrl`
- `url`
- `output[0]`
