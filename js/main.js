import { upscaleImage as upscaleImageByApi } from "./api.js";
import { upscaleImageLocal } from "./local-upscale.js";
import {
  buildDownloadName,
  clampInteger,
  formatFileSize,
  getImageDimensionsFromUrl,
  validateImageFile,
  validatePremiumConfig,
} from "./utils.js";
import { UIController } from "./ui.js";

const UPSCALE_MODE = Object.freeze({
  STANDARD: "standard",
  PREMIUM: "premium",
});

const CONFIG = Object.freeze({
  FILE_FIELD_NAME: "image",

  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "webp"],

  DEFAULT_MODE: UPSCALE_MODE.STANDARD,
  STANDARD_UPSCALE_FACTOR: 2,
  STANDARD_REPEAT_MIN: 1,
  STANDARD_REPEAT_MAX: 4,
  STANDARD_REPEAT_DEFAULT: 1,
  STANDARD_MAX_OUTPUT_DIMENSION: 8192,
  STANDARD_MAX_OUTPUT_PIXELS: 36 * 1024 * 1024,
  PREMIUM_UPSCALE_FACTOR: 4,

  PREMIUM_API_URL_DEFAULT: "",
  PREMIUM_API_KEY_DEFAULT: "",

  STANDARD_LOADING_TIPS: [
    "일반 모드: 브라우저 로컬 업스케일링을 수행하고 있습니다.",
    "팁: 연속 횟수를 늘리면 결과 해상도는 높아지지만 처리 시간도 증가합니다.",
    "팁: 반복 횟수가 높으면 메모리 사용량도 커집니다.",
  ],
  PREMIUM_LOADING_TIPS: [
    "프리미엄 모드: 외부 업스케일링 API를 호출하고 있습니다.",
    "팁: API Key는 브라우저가 아닌 백엔드 보관을 권장합니다.",
    "팁: 네트워크 상태에 따라 처리 시간이 달라질 수 있습니다.",
  ],

  LOADING_PROGRESS_MAX_DURING_PROCESS: 92,
  LOADING_PROGRESS_MIN_START: 8,
});

const elements = {
  app: document.getElementById("app"),
  fileInput: document.getElementById("file-input"),
  dropZone: document.getElementById("drop-zone"),
  compareSlider: document.getElementById("compare-slider"),
  proceedButton: document.getElementById("btn-proceed"),

  modeRadios: Array.from(document.querySelectorAll("input[name='upscale-mode']")),
  standardSettings: document.getElementById("standard-settings"),
  standardRepeatInput: document.getElementById("standard-repeat-count"),
  standardRepeatSummary: document.getElementById("standard-repeat-summary"),
  premiumSettings: document.getElementById("premium-settings"),
  premiumApiUrlInput: document.getElementById("premium-api-url"),
  premiumApiKeyInput: document.getElementById("premium-api-key"),
  modeDescription: document.getElementById("mode-description"),

  statusText: document.getElementById("status-text"),
  uploadGuide: document.getElementById("upload-guide"),
  uploadError: document.getElementById("upload-error"),

  previewImage: document.getElementById("preview-image"),
  previewPlaceholder: document.getElementById("preview-placeholder"),
  fileName: document.getElementById("file-name"),
  fileSize: document.getElementById("file-size"),
  fileResolution: document.getElementById("file-resolution"),
  confirmError: document.getElementById("confirm-error"),

  loadingProgress: document.getElementById("loading-progress"),
  loadingProgressBar: document.getElementById("loading-progress-bar"),
  loadingProgressText: document.getElementById("loading-progress-text"),
  loadingTip: document.getElementById("loading-tip"),

  compareWrapper: document.getElementById("compare-wrapper"),
  beforeLayer: document.getElementById("before-layer"),
  compareHandle: document.getElementById("compare-handle"),
  beforeImage: document.getElementById("before-image"),
  afterImage: document.getElementById("after-image"),
  resultNote: document.getElementById("result-note"),

  phases: {
    upload: document.getElementById("phase-upload"),
    confirm: document.getElementById("phase-confirm"),
    loading: document.getElementById("phase-loading"),
    result: document.getElementById("phase-result"),
  },
};

const ui = new UIController(elements);

const state = {
  selectedMode: CONFIG.DEFAULT_MODE,
  standardRepeatCount: CONFIG.STANDARD_REPEAT_DEFAULT,
  selectedFile: null,
  sourceImageUrl: "",
  sourceWidth: 0,
  sourceHeight: 0,
  resultImageUrl: "",
  resultCleanup: null,
  isProcessing: false,
  isCompareDragging: false,
  loadingProgressValue: 0,
  loadingProgressTimer: null,
};

initialize();

function initialize() {
  const extensionText = CONFIG.ALLOWED_EXTENSIONS.map((ext) => ext.toUpperCase()).join(", ");
  ui.setUploadGuide(`지원 형식: ${extensionText} / 최대 ${CONFIG.MAX_FILE_SIZE_MB}MB`);

  elements.premiumApiUrlInput.value = CONFIG.PREMIUM_API_URL_DEFAULT;
  elements.premiumApiKeyInput.value = CONFIG.PREMIUM_API_KEY_DEFAULT;

  elements.standardRepeatInput.min = String(CONFIG.STANDARD_REPEAT_MIN);
  elements.standardRepeatInput.max = String(CONFIG.STANDARD_REPEAT_MAX);
  elements.standardRepeatInput.value = String(CONFIG.STANDARD_REPEAT_DEFAULT);

  ui.resetForUpload();
  syncModeFromSelection();
  syncStandardRepeatInput();

  elements.fileInput.addEventListener("change", onFileInputChange);

  elements.dropZone.addEventListener("keydown", onDropZoneKeydown);
  elements.dropZone.addEventListener("dragenter", onDragEnterOrOver);
  elements.dropZone.addEventListener("dragover", onDragEnterOrOver);
  elements.dropZone.addEventListener("dragleave", onDragLeaveOrDrop);
  elements.dropZone.addEventListener("drop", onDrop);

  elements.modeRadios.forEach((radio) => {
    radio.addEventListener("change", onModeChange);
  });

  elements.standardRepeatInput.addEventListener("input", onStandardRepeatInputChange);
  elements.standardRepeatInput.addEventListener("change", onStandardRepeatInputChange);

  elements.app.addEventListener("click", onAppClick);
  elements.compareSlider.addEventListener("input", onCompareInput);
  elements.compareWrapper.addEventListener("pointerdown", onComparePointerDown);
  elements.compareWrapper.addEventListener("pointermove", onComparePointerMove);
  elements.compareWrapper.addEventListener("pointerup", onComparePointerEnd);
  elements.compareWrapper.addEventListener("pointercancel", onComparePointerEnd);
  elements.compareWrapper.addEventListener("keydown", onCompareWrapperKeydown);

  window.addEventListener("beforeunload", () => {
    stopLoadingProgress(0);
    clearSourceImage();
    clearResultImage();
  });
}

async function onFileInputChange(event) {
  const [file] = event.target.files;
  await handleSelectedFile(file);
}

function onDropZoneKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    elements.fileInput.click();
  }
}

function onDragEnterOrOver(event) {
  event.preventDefault();
  event.stopPropagation();
  ui.setDropZoneActive(true);
}

function onDragLeaveOrDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  if (event.type === "dragleave" && event.currentTarget.contains(event.relatedTarget)) {
    return;
  }

  ui.setDropZoneActive(false);
}

async function onDrop(event) {
  onDragLeaveOrDrop(event);
  const file = event.dataTransfer?.files?.[0] || null;
  await handleSelectedFile(file);
}

function onModeChange() {
  syncModeFromSelection();
  ui.hideConfirmError();
}

function onStandardRepeatInputChange() {
  syncStandardRepeatInput();
  ui.hideConfirmError();
}

function syncModeFromSelection() {
  const selected = elements.modeRadios.find((radio) => radio.checked)?.value;
  state.selectedMode =
    selected === UPSCALE_MODE.PREMIUM ? UPSCALE_MODE.PREMIUM : UPSCALE_MODE.STANDARD;

  ui.updateModeUI(state.selectedMode);
}

function syncStandardRepeatInput() {
  state.standardRepeatCount = clampInteger(
    elements.standardRepeatInput.value,
    CONFIG.STANDARD_REPEAT_MIN,
    CONFIG.STANDARD_REPEAT_MAX,
    CONFIG.STANDARD_REPEAT_DEFAULT,
  );

  elements.standardRepeatInput.value = String(state.standardRepeatCount);
  ui.setStandardSummary(buildStandardRepeatSummary());
}

function buildStandardRepeatSummary() {
  const totalScale = Math.pow(CONFIG.STANDARD_UPSCALE_FACTOR, state.standardRepeatCount);
  const scaleLabel = formatScaleLabel(totalScale);

  let summary = `현재 설정: ${state.standardRepeatCount}회 처리 (총 약 ${scaleLabel}x)`;

  if (state.sourceWidth > 0 && state.sourceHeight > 0) {
    const estimatedWidth = Math.round(state.sourceWidth * totalScale);
    const estimatedHeight = Math.round(state.sourceHeight * totalScale);
    summary += ` · 예상 결과 ${estimatedWidth} x ${estimatedHeight}`;
  }

  return summary;
}

function formatScaleLabel(scaleValue) {
  if (Number.isInteger(scaleValue)) {
    return String(scaleValue);
  }

  return scaleValue.toFixed(2).replace(/\.00$/, "");
}

async function handleSelectedFile(file) {
  if (state.isProcessing) {
    return;
  }

  ui.hideUploadError();
  ui.hideConfirmError();

  const validation = validateImageFile(file, CONFIG);
  if (!validation.valid) {
    ui.showUploadError(validation.message);
    return;
  }

  clearResultImage();
  clearSourceImage();

  state.selectedFile = file;
  state.sourceImageUrl = URL.createObjectURL(file);

  try {
    const { width, height } = await getImageDimensionsFromUrl(state.sourceImageUrl);
    state.sourceWidth = width;
    state.sourceHeight = height;

    ui.renderConfirmPreview({
      imageUrl: state.sourceImageUrl,
      name: file.name,
      size: formatFileSize(file.size),
      resolution: `${width} x ${height}`,
    });

    syncStandardRepeatInput();
    ui.showPhase("confirm");
  } catch (error) {
    console.error(error);
    clearSourceImage();
    state.selectedFile = null;
    state.sourceWidth = 0;
    state.sourceHeight = 0;
    syncStandardRepeatInput();
    ui.showUploadError("이미지를 읽는 중 문제가 발생했습니다. 다른 파일로 다시 시도해 주세요.");
    ui.showPhase("upload");
  }
}

function onAppClick(event) {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const { action } = actionTarget.dataset;

  if (action === "cancel") {
    resetToUpload();
    return;
  }

  if (action === "proceed") {
    void startUpscaling();
    return;
  }

  if (action === "restart") {
    resetToUpload();
    return;
  }

  if (action === "download") {
    downloadResult();
  }
}

async function startUpscaling() {
  if (!state.selectedFile || state.isProcessing) {
    return;
  }

  if (state.selectedMode === UPSCALE_MODE.PREMIUM) {
    const premiumValidation = validatePremiumConfig({
      apiUrl: elements.premiumApiUrlInput.value,
      apiKey: elements.premiumApiKeyInput.value,
    });

    if (!premiumValidation.valid) {
      ui.showConfirmError(premiumValidation.message);
      return;
    }
  }

  state.isProcessing = true;
  ui.setProcessingState(true);
  ui.hideConfirmError();
  ui.showPhase("loading");
  startLoadingProgress();
  ui.startLoadingTips(getLoadingTipsByMode(state.selectedMode));

  try {
    clearResultImage();

    const result = state.selectedMode === UPSCALE_MODE.PREMIUM
      ? await upscaleImageByApi(state.selectedFile, {
        API_URL: elements.premiumApiUrlInput.value.trim(),
        API_KEY: elements.premiumApiKeyInput.value.trim(),
        FILE_FIELD_NAME: CONFIG.FILE_FIELD_NAME,
        UPSCALE_FACTOR: CONFIG.PREMIUM_UPSCALE_FACTOR,
      })
      : await upscaleImageLocal(state.selectedFile, {
        upscaleFactor: CONFIG.STANDARD_UPSCALE_FACTOR,
        repeatCount: state.standardRepeatCount,
        maxCanvasDimension: CONFIG.STANDARD_MAX_OUTPUT_DIMENSION,
        maxOutputPixels: CONFIG.STANDARD_MAX_OUTPUT_PIXELS,
      });

    stopLoadingProgress(100);

    state.resultImageUrl = result.imageUrl;
    state.resultCleanup = typeof result.cleanup === "function" ? result.cleanup : null;

    ui.renderResult({
      beforeUrl: state.sourceImageUrl,
      afterUrl: state.resultImageUrl,
      message: buildResultMessage(state.selectedMode),
    });

    ui.showPhase("result");
  } catch (error) {
    console.error(error);
    stopLoadingProgress(0);
    ui.showConfirmError(buildModeErrorMessage(error, state.selectedMode));
    ui.showPhase("confirm");
  } finally {
    state.isProcessing = false;
    ui.setProcessingState(false);
    ui.stopLoadingTips();
  }
}

function buildResultMessage(mode) {
  if (mode === UPSCALE_MODE.PREMIUM) {
    return "프리미엄 업스케일링이 완료되었습니다. 슬라이더로 결과를 비교해 보세요.";
  }

  const totalScale = Math.pow(CONFIG.STANDARD_UPSCALE_FACTOR, state.standardRepeatCount);
  return `일반 업스케일링 ${state.standardRepeatCount}회(약 ${formatScaleLabel(totalScale)}x)가 완료되었습니다.`;
}

function buildModeErrorMessage(error, mode) {
  const text = error instanceof Error ? error.message : "";

  if (mode === UPSCALE_MODE.PREMIUM) {
    if (text) {
      return `프리미엄 모드 실패: ${text}`;
    }
    return "프리미엄 모드 처리에 실패했습니다. API 설정과 네트워크 상태를 확인해 주세요.";
  }

  if (text) {
    return `일반 모드 실패: ${text}`;
  }

  return "일반 모드 처리에 실패했습니다. 브라우저 환경을 확인해 주세요.";
}

function getLoadingTipsByMode(mode) {
  if (mode === UPSCALE_MODE.PREMIUM) {
    return CONFIG.PREMIUM_LOADING_TIPS;
  }

  const tips = [...CONFIG.STANDARD_LOADING_TIPS];
  tips[0] = `일반 모드: ${state.standardRepeatCount}회 연속 업스케일링을 처리하고 있습니다.`;
  return tips;
}

function downloadResult() {
  if (!state.resultImageUrl) {
    return;
  }

  const link = document.createElement("a");
  link.href = state.resultImageUrl;
  link.download = buildDownloadName(state.selectedFile?.name || "image", "upscaled");
  link.rel = "noopener";

  document.body.append(link);
  link.click();
  link.remove();
}

function onCompareInput(event) {
  ui.updateCompare(event.target.value);
}

function onComparePointerDown(event) {
  if (elements.compareWrapper.classList.contains("hidden")) {
    return;
  }

  state.isCompareDragging = true;
  elements.compareWrapper.setPointerCapture(event.pointerId);
  updateCompareByClientX(event.clientX);
}

function onComparePointerMove(event) {
  if (!state.isCompareDragging) {
    return;
  }

  updateCompareByClientX(event.clientX);
}

function onComparePointerEnd(event) {
  if (!state.isCompareDragging) {
    return;
  }

  state.isCompareDragging = false;
  if (elements.compareWrapper.hasPointerCapture(event.pointerId)) {
    elements.compareWrapper.releasePointerCapture(event.pointerId);
  }
}

function onCompareWrapperKeydown(event) {
  if (elements.compareWrapper.classList.contains("hidden")) {
    return;
  }

  const current = Number(elements.compareSlider.value);
  const bigStep = 10;
  const smallStep = 2;
  const step = event.shiftKey ? bigStep : smallStep;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    ui.updateCompare(current - step);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    ui.updateCompare(current + step);
  }
}

function resetToUpload() {
  elements.fileInput.value = "";

  state.selectedFile = null;
  state.sourceWidth = 0;
  state.sourceHeight = 0;
  state.isProcessing = false;
  state.isCompareDragging = false;

  stopLoadingProgress(0);
  clearResultImage();
  clearSourceImage();

  ui.stopLoadingTips();
  ui.resetForUpload();
  syncModeFromSelection();
  syncStandardRepeatInput();
}

function updateCompareByClientX(clientX) {
  const rect = elements.compareWrapper.getBoundingClientRect();
  if (!rect.width) {
    return;
  }

  const ratio = ((clientX - rect.left) / rect.width) * 100;
  ui.updateCompare(ratio);
}

function startLoadingProgress() {
  stopLoadingProgress(0);
  state.loadingProgressValue = CONFIG.LOADING_PROGRESS_MIN_START;
  ui.setLoadingProgress(state.loadingProgressValue);

  state.loadingProgressTimer = window.setInterval(() => {
    if (state.loadingProgressValue >= CONFIG.LOADING_PROGRESS_MAX_DURING_PROCESS) {
      return;
    }

    const delta = 4 + Math.random() * 9;
    state.loadingProgressValue = Math.min(
      CONFIG.LOADING_PROGRESS_MAX_DURING_PROCESS,
      state.loadingProgressValue + delta,
    );
    ui.setLoadingProgress(state.loadingProgressValue);
  }, 260);
}

function stopLoadingProgress(finalValue) {
  if (state.loadingProgressTimer) {
    window.clearInterval(state.loadingProgressTimer);
    state.loadingProgressTimer = null;
  }

  state.loadingProgressValue = finalValue;
  ui.setLoadingProgress(finalValue);
}

function clearSourceImage() {
  if (state.sourceImageUrl) {
    URL.revokeObjectURL(state.sourceImageUrl);
    state.sourceImageUrl = "";
  }
}

function clearResultImage() {
  if (state.resultCleanup) {
    state.resultCleanup();
    state.resultCleanup = null;
    state.resultImageUrl = "";
    return;
  }

  if (state.resultImageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(state.resultImageUrl);
  }

  state.resultImageUrl = "";
}
