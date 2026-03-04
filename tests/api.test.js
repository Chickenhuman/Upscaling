import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { upscaleImage } from "../js/api.js";

const baseConfig = {
  API_URL: "https://example.com/upscale",
  API_KEY: "sk-test",
  FILE_FIELD_NAME: "image",
  UPSCALE_FACTOR: 4,
};

const originalFetch = global.fetch;

describe("upscaleImage", () => {
  beforeEach(() => {
    global.fetch = undefined;
  });

  afterEach(() => {
    global.fetch = undefined;
  });

  it("returns remote image url when API response is valid", async () => {
    const responseBody = { resultUrl: "https://cdn.example.com/out.png" };

    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => responseBody,
    });

    const result = await upscaleImage(new Blob(["test"], { type: "image/png" }), baseConfig);

    assert.equal(result.imageUrl, responseBody.resultUrl);
    assert.equal(result.source, "premium-api");
    assert.equal(result.cleanup, null);
  });

  it("throws when API key is missing", async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ resultUrl: "https://cdn.example.com/out.png" }),
    });

    await assert.rejects(
      () => upscaleImage(new Blob(["test"], { type: "image/png" }), { ...baseConfig, API_KEY: "" }),
      /API Key/,
    );
  });

  it("throws when API returns non-ok response", async () => {
    global.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({}),
    });

    await assert.rejects(
      () => upscaleImage(new Blob(["test"], { type: "image/png" }), baseConfig),
      /업스케일 API 요청 실패 \(503\)/,
    );
  });

  it("throws when response does not include result URL", async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ output: [] }),
    });

    await assert.rejects(
      () => upscaleImage(new Blob(["test"], { type: "image/png" }), baseConfig),
      /결과 이미지 URL/,
    );
  });
});

afterEach(() => {
  global.fetch = originalFetch;
});
