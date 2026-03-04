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

export async function upscaleImageLocal(file, options = {}) {
  const {
    upscaleFactor = 2,
    outputType = "image/png",
    outputQuality = 0.96,
  } = options;

  const picaFactory = getPicaFactoryOrNull();
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

    let blob;
    if (picaFactory) {
      const pica = picaFactory();
      await pica.resize(sourceCanvas, targetCanvas, {
        quality: 3,
        alpha: true,
        unsharpAmount: 120,
        unsharpThreshold: 2,
      });
      blob = await pica.toBlob(targetCanvas, outputType, outputQuality);
    } else {
      const targetContext = targetCanvas.getContext("2d");
      if (!targetContext) {
        throw new Error("캔버스 컨텍스트를 생성할 수 없습니다.");
      }

      targetContext.imageSmoothingEnabled = true;
      targetContext.imageSmoothingQuality = "high";
      targetContext.drawImage(image, 0, 0, width, height);
      blob = await canvasToBlob(targetCanvas, outputType, outputQuality);
    }

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
