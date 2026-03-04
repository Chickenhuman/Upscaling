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
  const apiUrl = String(config.API_URL || "").trim();
  const apiKey = String(config.API_KEY || "").trim();

  if (!apiUrl) {
    throw new Error("프리미엄 모드 API URL이 비어 있습니다.");
  }

  if (!apiKey) {
    throw new Error("프리미엄 모드 API Key가 필요합니다.");
  }

  const formData = new FormData();
  formData.append(config.FILE_FIELD_NAME, file);
  formData.append("scale", String(config.UPSCALE_FACTOR));

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
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
    source: "premium-api",
  };
}
