# Upscaling UI (Vanilla JS)

단일 페이지에서 이미지 업스케일링 흐름을 처리하는 프론트엔드입니다.

## 모드

- 일반 업스케일링 모드: 브라우저 JS 라이브러리 `pica` 기반 로컬 업스케일링 (API Key 불필요)
- 일반 모드에서 연속 업스케일링 횟수(1~4회)를 사용자가 직접 입력 가능
- 프리미엄 업스케일링 모드: 외부 업스케일링 API 호출 (API URL + API Key 필수)

## 실행

ES Module을 사용하므로 정적 서버로 실행하세요.

```bash
cd /workspaces/Upscaling
npm install
python3 -m http.server 4173
# 브라우저에서 http://localhost:4173 접속
```

## 테스트

```bash
npm run check
npm test
```

## 프리미엄 모드 설정

화면의 `프리미엄 모드`를 선택한 뒤 아래 값을 입력하면 됩니다.

- `Premium API URL`: 업스케일링 엔드포인트 URL
- `Premium API Key`: API 인증 키

요청은 `POST` `multipart/form-data`로 전송되며 파일 필드명은 `image`입니다.

응답 JSON에서 결과 URL은 아래 키 중 하나로 인식합니다.

- `imageUrl`
- `resultUrl`
- `url`
- `output[0]`

## 보안 주의

현재 구현은 프론트에서 API Key를 직접 입력받아 요청합니다. 실제 서비스에서는 API Key를 브라우저에 노출하지 말고 백엔드 프록시를 통해 처리하는 구성이 안전합니다.
