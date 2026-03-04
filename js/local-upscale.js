function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = url;
  });
}

function ensurePicaAvailable() {
  if (typeof window.pica !== "function") {
    throw new Error("일반 모드 업스케일링 라이브러리(pica)를 찾을 수 없습니다.");
  }

  return window.pica;
}

export async function upscaleImageLocal(file, options = {}) {
  const {
    upscaleFactor = 2,
    outputType = "image/png",
    outputQuality = 0.96,
  } = options;

  const picaFactory = ensurePicaAvailable();
  const sourceUrl = URL.createObjectURL(file);
  let resultUrl = "";

  try {
    const image = await loadImageFromUrl(sourceUrl);
    const width = Math.max(1, Math.round(image.naturalWidth * upscaleFactor));
    const height = Math.max(1, Math.round(image.naturalHeight * upscaleFactor));

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;

    const sourceContext = sourceCanvas.getContext("2d");
    if (!sourceContext) {
      throw new Error("캔버스 컨텍스트를 생성할 수 없습니다.");
    }

    sourceContext.drawImage(image, 0, 0);

    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = width;
    targetCanvas.height = height;

    const pica = picaFactory();
    await pica.resize(sourceCanvas, targetCanvas, {
      quality: 3,
      alpha: true,
      unsharpAmount: 120,
      unsharpThreshold: 2,
    });

    const blob = await pica.toBlob(targetCanvas, outputType, outputQuality);
    resultUrl = URL.createObjectURL(blob);

    sourceCanvas.width = 0;
    sourceCanvas.height = 0;
    targetCanvas.width = 0;
    targetCanvas.height = 0;

    return {
      imageUrl: resultUrl,
      cleanup: () => URL.revokeObjectURL(resultUrl),
      source: "local-js",
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
