import { upscaleImage } from "./api.js";
import {
  buildDownloadName,
  formatFileSize,
  getImageDimensionsFromUrl,
  validateImageFile,
} from "./utils.js";
import { UIController } from "./ui.js";

const CONFIG = Object.freeze({
  API_URL: "/api/upscale",
  API_KEY: "",
  FILE_FIELD_NAME: "image",
  UPSCALE_FACTOR: 2,

  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "webp"],

  USE_MOCK_API: true,
  MOCK_DELAY_MS: 2200,

  LOADING_TIPS: [
    "팁: 고해상도 원본일수록 결과 디테일이 더 잘 살아납니다.",
    "팁: 처리 중에는 브라우저 탭을 닫지 않는 것이 좋습니다.",
    "팁: 결과 화면에서 슬라이더로 전후 차이를 빠르게 확인할 수 있습니다.",
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
  selectedFile: null,
  sourceImageUrl: "",
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
  ui.resetForUpload();

  elements.fileInput.addEventListener("change", onFileInputChange);

  elements.dropZone.addEventListener("keydown", onDropZoneKeydown);
  elements.dropZone.addEventListener("dragenter", onDragEnterOrOver);
  elements.dropZone.addEventListener("dragover", onDragEnterOrOver);
  elements.dropZone.addEventListener("dragleave", onDragLeaveOrDrop);
  elements.dropZone.addEventListener("drop", onDrop);

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

    ui.renderConfirmPreview({
      imageUrl: state.sourceImageUrl,
      name: file.name,
      size: formatFileSize(file.size),
      resolution: `${width} x ${height}`,
    });

    ui.showPhase("confirm");
  } catch (error) {
    console.error(error);
    clearSourceImage();
    state.selectedFile = null;
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

  state.isProcessing = true;
  ui.setProcessingState(true);
  ui.hideConfirmError();
  ui.showPhase("loading");
  startLoadingProgress();
  ui.startLoadingTips(CONFIG.LOADING_TIPS);

  try {
    clearResultImage();
    const result = await upscaleImage(state.selectedFile, CONFIG);
    stopLoadingProgress(100);

    state.resultImageUrl = result.imageUrl;
    state.resultCleanup = typeof result.cleanup === "function" ? result.cleanup : null;

    ui.renderResult({
      beforeUrl: state.sourceImageUrl,
      afterUrl: state.resultImageUrl,
      message: "업스케일링이 완료되었습니다. 슬라이더로 결과를 비교해 보세요.",
    });

    ui.showPhase("result");
  } catch (error) {
    console.error(error);
    stopLoadingProgress(0);
    ui.showConfirmError("처리에 실패했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.");
    ui.showPhase("confirm");
  } finally {
    state.isProcessing = false;
    ui.setProcessingState(false);
    ui.stopLoadingTips();
  }
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
  state.isProcessing = false;
  state.isCompareDragging = false;

  stopLoadingProgress(0);
  clearResultImage();
  clearSourceImage();

  ui.stopLoadingTips();
  ui.resetForUpload();
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
