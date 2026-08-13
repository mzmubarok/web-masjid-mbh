import { slugify } from "@/lib/slug";
import { EXTENSION_BY_MIME_TYPE, type AllowedMediaMimeType } from "@/lib/media/constraints";

/**
 * Builds a collision-safe stored filename from the original name, e.g.
 * `masjid-front.jpg` -> `masjid-front-a8f32c1e.jpg`. Never used as-is for
 * storage — the extension always comes from the validated MIME type, not
 * whatever the original filename happened to end in.
 */
export function buildStoredFileName(originalFileName: string, mimeType: AllowedMediaMimeType): string {
  const lastDot = originalFileName.lastIndexOf(".");
  const base = lastDot > 0 ? originalFileName.slice(0, lastDot) : originalFileName;
  const slug = slugify(base) || "file";
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const extension = EXTENSION_BY_MIME_TYPE[mimeType];

  return `${slug}-${suffix}.${extension}`;
}
