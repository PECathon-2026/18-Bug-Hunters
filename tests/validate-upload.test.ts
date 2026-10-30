import { describe, expect, it } from "vitest";
import { sniffImageMime, validateImageFile } from "../lib/spirit-lens/validate";

function fakeFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "test.bin", { type });
}

describe("validateImageFile", () => {
  it("accepts png under limit", () => {
    expect(validateImageFile(fakeFile("image/png", 1024)).ok).toBe(true);
  });

  it("rejects oversized files", () => {
    const result = validateImageFile(fakeFile("image/jpeg", 9 * 1024 * 1024));
    expect(result.ok).toBe(false);
  });

  it("rejects unsupported mime", () => {
    const result = validateImageFile(fakeFile("image/gif", 100));
    expect(result.ok).toBe(false);
  });
});

describe("sniffImageMime", () => {
  it("detects jpeg magic", () => {
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0x00]))).toBe(
      "image/jpeg",
    );
  });

  it("detects png magic", () => {
    expect(
      sniffImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])),
    ).toBe("image/png");
  });
});
