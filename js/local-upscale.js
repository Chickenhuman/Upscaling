function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
    image.src = url;
  });
}

function getPicaFactoryOrNull() {
  if (typeof window.pica === "function") {
    return window.pica;
  }

  return null;
}

function canvasToBlob(canvas, outputType, outputQuality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("업스케일 결과 Blob 생성에 실패했습니다."));
        return;
      }
      resolve(blob);
    }, outputType, outputQuality);
  });
}

function drawWithSmoothing(sourceCanvas, targetCanvas) {
  const targetContext = targetCanvas.getContext("2d");
  if (!targetContext) {
    throw new Error("캔버스 컨텍스트를 생성할 수 없습니다.");
  }

  targetContext.imageSmoothingEnabled = true;
  targetContext.imageSmoothingQuality = "high";
  targetContext.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
}

function validateNextResolution(width, height, maxCanvasDimension, maxOutputPixels) {
  if (width > maxCanvasDimension || height > maxCanvasDimension) {
    throw new Error(
      `결과 해상도가 너무 큽니다. 최대 ${maxCanvasDimension}px 이내로 횟수를 줄여 주세요.`,
    );
  }

  if (width * height > maxOutputPixels) {
    throw new Error("결과 픽셀 수가 너무 큽니다. 일반 모드 연속 횟수를 낮춰 주세요.");
  }
}

export async function upscaleImageLocal(file, options = {}) {
  const {
    upscaleFactor = 2,
    repeatCount = 1,
    outputType = "image/png",
    outputQuality = 0.96,
    maxCanvasDimension = 8192,
    maxOutputPixels = 36 * 1024 * 1024,
  } = options;

  const picaFactory = getPicaFactoryOrNull();
  const pica = picaFactory ? picaFactory() : null;

  const sourceUrl = URL.createObjectURL(file);
  let resultUrl = "";

  try {
    const image = await loadImageFromUrl(sourceUrl);

    let currentCanvas = document.createElement("canvas");
    currentCanvas.width = image.naturalWidth;
    currentCanvas.height = image.naturalHeight;

    const initialContext = currentCanvas.getContext("2d");
    if (!initialContext) {
      throw new Error("캔버스 컨텍스트를 생성할 수 없습니다.");
    }
    initialContext.drawImage(image, 0, 0);

    for (let pass = 0; pass < repeatCount; pass += 1) {
      const nextWidth = Math.max(1, Math.round(currentCanvas.width * upscaleFactor));
      const nextHeight = Math.max(1, Math.round(currentCanvas.height * upscaleFactor));

      validateNextResolution(nextWidth, nextHeight, maxCanvasDimension, maxOutputPixels);

      const nextCanvas = document.createElement("canvas");
      nextCanvas.width = nextWidth;
      nextCanvas.height = nextHeight;

      if (pica) {
        await pica.resize(currentCanvas, nextCanvas, {
          quality: 3,
          alpha: true,
          unsharpAmount: 120,
          unsharpThreshold: 2,
        });
      } else {
        drawWithSmoothing(currentCanvas, nextCanvas);
      }

      currentCanvas.width = 0;
      currentCanvas.height = 0;
      currentCanvas = nextCanvas;
    }

    const blob = pica
      ? await pica.toBlob(currentCanvas, outputType, outputQuality)
      : await canvasToBlob(currentCanvas, outputType, outputQuality);

    resultUrl = URL.createObjectURL(blob);

    currentCanvas.width = 0;
    currentCanvas.height = 0;

    return {
      imageUrl: resultUrl,
      cleanup: () => URL.revokeObjectURL(resultUrl),
      source: "local-js",
      meta: {
        repeatCount,
        upscaleFactor,
      },
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
