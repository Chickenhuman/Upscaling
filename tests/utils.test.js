import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  buildDownloadName,
  clampInteger,
  formatFileSize,
  validateImageFile,
  validatePremiumConfig,
} from "../js/utils.js";

const baseConfig = {
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "webp"],
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_FILE_SIZE_MB: 10,
};

describe("formatFileSize", () => {
  it("returns 0 B for invalid values", () => {
    assert.equal(formatFileSize(0), "0 B");
    assert.equal(formatFileSize(-1), "0 B");
  });

  it("formats KB and MB with expected precision", () => {
    assert.equal(formatFileSize(1536), "1.5 KB");
    assert.equal(formatFileSize(5 * 1024 * 1024), "5.00 MB");
  });
});

describe("clampInteger", () => {
  it("returns fallback when value is not a valid number", () => {
    assert.equal(clampInteger("invalid", 1, 5, 2), 2);
  });

  it("clamps below and above bounds", () => {
    assert.equal(clampInteger(0, 1, 5), 1);
    assert.equal(clampInteger(9, 1, 5), 5);
  });

  it("accepts values in bounds", () => {
    assert.equal(clampInteger(3, 1, 5), 3);
  });
});

describe("buildDownloadName", () => {
  it("adds suffix before extension", () => {
    assert.equal(buildDownloadName("photo.png", "upscaled"), "photo-upscaled.png");
  });

  it("falls back to png when no extension exists", () => {
    assert.equal(buildDownloadName("photo", "upscaled"), "photo-upscaled.png");
  });
});

describe("validateImageFile", () => {
  it("accepts a valid image", () => {
    const file = { name: "sample.jpg", type: "image/jpeg", size: 1024 };
    const result = validateImageFile(file, baseConfig);

    assert.equal(result.valid, true);
    assert.equal(result.message, "");
  });

  it("rejects unsupported formats", () => {
    const file = { name: "sample.gif", type: "image/gif", size: 1024 };
    const result = validateImageFile(file, baseConfig);

    assert.equal(result.valid, false);
    assert.match(result.message, /지원하지 않는 형식/);
  });

  it("rejects files exceeding size limit", () => {
    const file = {
      name: "big.png",
      type: "image/png",
      size: 11 * 1024 * 1024,
    };
    const result = validateImageFile(file, baseConfig);

    assert.equal(result.valid, false);
    assert.match(result.message, /최대 10MB/);
  });
});

describe("validatePremiumConfig", () => {
  it("accepts valid api url and key", () => {
    const result = validatePremiumConfig({
      apiUrl: "https://api.example.com/upscale",
      apiKey: "sk-test",
    });

    assert.equal(result.valid, true);
  });

  it("rejects missing api url", () => {
    const result = validatePremiumConfig({
      apiUrl: "",
      apiKey: "sk-test",
    });

    assert.equal(result.valid, false);
    assert.match(result.message, /API URL/);
  });

  it("rejects invalid api url format", () => {
    const result = validatePremiumConfig({
      apiUrl: "not-a-url",
      apiKey: "sk-test",
    });

    assert.equal(result.valid, false);
    assert.match(result.message, /형식/);
  });

  it("rejects missing api key", () => {
    const result = validatePremiumConfig({
      apiUrl: "https://api.example.com/upscale",
      apiKey: "",
    });

    assert.equal(result.valid, false);
    assert.match(result.message, /API Key/);
  });
});
