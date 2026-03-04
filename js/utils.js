const BYTES_PER_MB = 1024 * 1024;

export function clampInteger(value, min, max, fallback = min) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < BYTES_PER_MB) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
}

export function buildDownloadName(originalName, suffix = "upscaled") {
  const fallback = "image";
  const safeName = typeof originalName === "string" && originalName.trim() ? originalName.trim() : fallback;

  const lastDot = safeName.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === safeName.length - 1) {
    return `${safeName}-${suffix}.png`;
  }

  const base = safeName.slice(0, lastDot);
  const ext = safeName.slice(lastDot + 1);
  return `${base}-${suffix}.${ext}`;
}

export function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function validateImageFile(file, config) {
  if (!file) {
    return { valid: false, message: "이미지 파일을 선택해 주세요." };
  }

  const {
    ALLOWED_MIME_TYPES = [],
    ALLOWED_EXTENSIONS = [],
    MAX_FILE_SIZE_BYTES = 0,
    MAX_FILE_SIZE_MB = 0,
  } = config;

  const extension = file.name.includes(".")
    ? file.name.split(".").pop().toLowerCase()
    : "";

  const mimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);
  const extAllowed = ALLOWED_EXTENSIONS.includes(extension);

  if (!mimeAllowed && !extAllowed) {
    return {
      valid: false,
      message: `지원하지 않는 형식입니다. (${ALLOWED_EXTENSIONS.join(", ").toUpperCase()})`,
    };
  }

  if (MAX_FILE_SIZE_BYTES > 0 && file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `파일 용량은 최대 ${MAX_FILE_SIZE_MB}MB까지 허용됩니다.`,
    };
  }

  return { valid: true, message: "" };
}

export function validatePremiumConfig({ apiUrl, apiKey }) {
  const normalizedUrl = String(apiUrl || "").trim();
  const normalizedKey = String(apiKey || "").trim();

  if (!normalizedUrl) {
    return { valid: false, message: "프리미엄 모드에서는 API URL을 입력해야 합니다." };
  }

  try {
    // URL 형식 검증
    new URL(normalizedUrl);
  } catch {
    return { valid: false, message: "API URL 형식이 올바르지 않습니다." };
  }

  if (!normalizedKey) {
    return { valid: false, message: "프리미엄 모드에서는 API Key를 입력해야 합니다." };
  }

  return { valid: true, message: "" };
}

export function getImageDimensionsFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      reject(new Error("이미지 해상도를 읽을 수 없습니다."));
    };

    image.src = url;
  });
}
