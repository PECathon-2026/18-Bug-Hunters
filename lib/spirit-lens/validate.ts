import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

export type UploadValidation =
  | { ok: true }
  | { ok: false; error: string };

export function validateImageFile(file: File): UploadValidation {
  if (!file) return { ok: false, error: "No file selected." };
  if (file.size <= 0) return { ok: false, error: "File is empty." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File exceeds ${(MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0)} MB limit.`,
    };
  }
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      error: `Unsupported type “${file.type || "unknown"}”. Use JPEG, PNG, or WebP.`,
    };
  }
  return { ok: true };
}

/** Magic-byte sniffing helpers for server-side checks (browser File still needs MIME). */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}
