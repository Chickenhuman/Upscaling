import { delay } from "./utils.js";

function extractResultUrl(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  return (
    payload.imageUrl ||
    payload.resultUrl ||
    payload.url ||
    payload.output?.[0] ||
    ""
  );
}

export async function upscaleImage(file, config) {
  if (config.USE_MOCK_API) {
    await delay(config.MOCK_DELAY_MS);

    const mockUrl = URL.createObjectURL(file);
    return {
      imageUrl: mockUrl,
      cleanup: () => URL.revokeObjectURL(mockUrl),
      source: "mock",
    };
  }

  const formData = new FormData();
  formData.append(config.FILE_FIELD_NAME, file);
  formData.append("scale", String(config.UPSCALE_FACTOR));

  const headers = {};
  if (config.API_KEY) {
    headers.Authorization = `Bearer ${config.API_KEY}`;
  }

  const response = await fetch(config.API_URL, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`업스케일 API 요청 실패 (${response.status})`);
  }

  const data = await response.json();
  const resultUrl = extractResultUrl(data);

  if (!resultUrl) {
    throw new Error("API 응답에서 결과 이미지 URL을 찾지 못했습니다.");
  }

  return {
    imageUrl: resultUrl,
    cleanup: null,
    source: "remote",
  };
}
