const PHASE_STATUS_TEXT = {
  upload: "대기",
  confirm: "업로드 완료 · 확인 대기",
  loading: "처리 중",
  result: "완료",
};

export class UIController {
  constructor(elements) {
    this.phases = elements.phases;
    this.statusText = elements.statusText;

    this.dropZone = elements.dropZone;
    this.uploadGuide = elements.uploadGuide;
    this.uploadError = elements.uploadError;

    this.previewImage = elements.previewImage;
    this.previewPlaceholder = elements.previewPlaceholder;
    this.fileName = elements.fileName;
    this.fileSize = elements.fileSize;
    this.fileResolution = elements.fileResolution;
    this.confirmError = elements.confirmError;
    this.proceedButton = elements.proceedButton;
    this.standardSettings = elements.standardSettings;
    this.premiumSettings = elements.premiumSettings;
    this.standardRepeatSummary = elements.standardRepeatSummary;
    this.modeDescription = elements.modeDescription;

    this.loadingProgress = elements.loadingProgress;
    this.loadingProgressBar = elements.loadingProgressBar;
    this.loadingProgressText = elements.loadingProgressText;
    this.loadingTip = elements.loadingTip;
    this.loadingTipsTimer = null;

    this.compareWrapper = elements.compareWrapper;
    this.beforeLayer = elements.beforeLayer;
    this.compareHandle = elements.compareHandle;
    this.beforeImage = elements.beforeImage;
    this.afterImage = elements.afterImage;
    this.compareSlider = elements.compareSlider;
    this.resultNote = elements.resultNote;
  }

  showPhase(phaseName) {
    Object.entries(this.phases).forEach(([name, section]) => {
      section.classList.toggle("active", name === phaseName);
    });

    this.updateStatus(phaseName);
  }

  updateStatus(phaseName) {
    this.statusText.textContent = PHASE_STATUS_TEXT[phaseName] || "";
  }

  setUploadGuide(message) {
    this.uploadGuide.textContent = message;
  }

  setDropZoneActive(isActive) {
    this.dropZone.classList.toggle("dragover", isActive);
  }

  showUploadError(message) {
    this.uploadError.textContent = message;
    this.uploadError.classList.remove("hidden");
  }

  hideUploadError() {
    this.uploadError.textContent = "";
    this.uploadError.classList.add("hidden");
  }

  showConfirmError(message) {
    this.confirmError.textContent = message;
    this.confirmError.classList.remove("hidden");
  }

  hideConfirmError() {
    this.confirmError.textContent = "";
    this.confirmError.classList.add("hidden");
  }

  setProcessingState(isProcessing) {
    this.proceedButton.disabled = isProcessing;
  }

  updateModeUI(mode) {
    const isPremium = mode === "premium";
    this.standardSettings.classList.toggle("hidden", isPremium);
    this.premiumSettings.classList.toggle("hidden", !isPremium);
    this.modeDescription.textContent = isPremium
      ? "프리미엄 모드: API URL과 API Key를 사용해 고급 업스케일링 엔진 호출"
      : "일반 모드: API 키 없이 브라우저 JS 라이브러리로 로컬 업스케일링 (반복 횟수 설정 가능)";
  }

  setStandardSummary(summaryText) {
    this.standardRepeatSummary.textContent = summaryText;
  }

  renderConfirmPreview({ imageUrl, name, size, resolution }) {
    this.previewImage.src = imageUrl;
    this.previewImage.classList.remove("hidden");
    this.previewPlaceholder.classList.add("hidden");

    this.fileName.textContent = name;
    this.fileSize.textContent = size;
    this.fileResolution.textContent = resolution;
  }

  startLoadingTips(tips) {
    this.stopLoadingTips();

    if (!Array.isArray(tips) || tips.length === 0) {
      this.loadingTip.textContent = "";
      return;
    }

    let index = 0;
    this.loadingTip.textContent = tips[index];

    this.loadingTipsTimer = window.setInterval(() => {
      index = (index + 1) % tips.length;
      this.loadingTip.textContent = tips[index];
    }, 1800);
  }

  stopLoadingTips() {
    if (this.loadingTipsTimer) {
      window.clearInterval(this.loadingTipsTimer);
      this.loadingTipsTimer = null;
    }

    this.loadingTip.textContent = "";
  }

  setLoadingProgress(value) {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
    this.loadingProgressBar.style.width = `${safeValue}%`;
    this.loadingProgress.setAttribute("aria-valuenow", String(Math.round(safeValue)));
    this.loadingProgressText.textContent = `진행률 ${Math.round(safeValue)}%`;
  }

  resetLoadingProgress() {
    this.setLoadingProgress(0);
  }

  renderResult({ beforeUrl, afterUrl, message }) {
    this.compareWrapper.classList.remove("hidden");
    this.beforeImage.src = beforeUrl;
    this.afterImage.src = afterUrl;

    this.updateCompare(50);

    this.resultNote.textContent = message;
    this.resultNote.classList.remove("hidden");
  }

  updateCompare(value) {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 50));
    const rightInset = 100 - safeValue;
    const clipValue = `inset(0 ${rightInset}% 0 0)`;
    this.beforeLayer.style.clipPath = clipValue;
    this.beforeLayer.style.webkitClipPath = clipValue;
    this.compareHandle.style.left = `${safeValue}%`;
    this.compareSlider.value = String(safeValue);
  }

  resetForUpload() {
    this.hideUploadError();
    this.hideConfirmError();

    this.previewImage.removeAttribute("src");
    this.previewImage.classList.add("hidden");
    this.previewPlaceholder.classList.remove("hidden");

    this.fileName.textContent = "-";
    this.fileSize.textContent = "-";
    this.fileResolution.textContent = "-";

    this.compareWrapper.classList.add("hidden");
    this.beforeImage.removeAttribute("src");
    this.afterImage.removeAttribute("src");
    this.updateCompare(50);

    this.resetLoadingProgress();
    this.setProcessingState(false);

    this.resultNote.textContent = "";
    this.resultNote.classList.add("hidden");

    this.showPhase("upload");
  }
}
