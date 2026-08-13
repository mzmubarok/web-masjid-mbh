/** Images only for this first version — matches what the public site actually needs. */
export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

export function isAllowedMediaMimeType(value: string): value is AllowedMediaMimeType {
  return (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(value);
}

/** No documented media limit exists elsewhere in the project — 10 MB is a reasonable default for a mosque website. */
export const MAX_MEDIA_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Extension derived from the validated MIME type rather than trusted from the
 * original filename, which could be spoofed or simply wrong.
 */
export const EXTENSION_BY_MIME_TYPE: Record<AllowedMediaMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
