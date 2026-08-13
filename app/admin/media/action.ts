"use server";

import { revalidatePath } from "next/cache";
import { del, head, BlobNotFoundError } from "@vercel/blob";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { getMediaUsage } from "@/lib/media/media";
import { MAX_MEDIA_FILE_SIZE_BYTES, EXTENSION_BY_MIME_TYPE, isAllowedMediaMimeType } from "@/lib/media/constraints";

export interface MediaActionState {
  status: "idle" | "success" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Pre-upload duplicate check, called client-side before spending a Blob write. Not a security boundary — `createMediaRecord` re-checks authoritatively. */
export async function checkMediaDuplicate(
  checksum: string
): Promise<{ duplicate: boolean; fileName?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { duplicate: false };
  }

  const existing = await prisma.media.findUnique({ where: { checksum } });
  return existing ? { duplicate: true, fileName: existing.fileName } : { duplicate: false };
}

export interface CreateMediaInput {
  /** The persistent Vercel Blob URL returned by `upload()`. */
  url: string;
  storedFileName: string;
  fileName: string;
  /** SHA-256 hex digest computed client-side from the actual file bytes. */
  checksum: string;
  width: number | null;
  height: number | null;
}

/**
 * Finalizes an upload the browser already sent directly to Vercel Blob.
 * Re-verifies the blob really exists and reads its authoritative
 * size/contentType via `head()` — the client's own claims about those two
 * fields are never trusted for the stored record.
 */
export async function createMediaRecord(input: CreateMediaInput): Promise<MediaActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to upload media." };
  }

  if (!input.storedFileName || !input.fileName || !input.checksum || !input.url) {
    return { status: "error", message: "Upload response was incomplete. Please try again." };
  }

  const existing = await prisma.media.findUnique({ where: { checksum: input.checksum } });
  if (existing) {
    return {
      status: "error",
      message: `This file already exists in the media library ("${existing.fileName}").`,
    };
  }

  let blobInfo: Awaited<ReturnType<typeof head>>;
  try {
    blobInfo = await head(input.url);
  } catch (error) {
    console.error("Failed to verify uploaded blob:", error);
    return { status: "error", message: "Could not verify the uploaded file. Please try uploading again." };
  }

  if (!isAllowedMediaMimeType(blobInfo.contentType)) {
    return { status: "error", message: "Unsupported file type." };
  }

  if (blobInfo.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    return { status: "error", message: "File is larger than the 10 MB limit." };
  }

  try {
    await prisma.media.create({
      data: {
        fileName: input.fileName,
        storedFileName: input.storedFileName,
        extension: EXTENSION_BY_MIME_TYPE[blobInfo.contentType],
        mimeType: blobInfo.contentType,
        fileSize: blobInfo.size,
        width: input.width,
        height: input.height,
        storagePath: blobInfo.url,
        checksum: input.checksum,
        uploadedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "This file already exists in the media library." };
    }
    console.error("Failed to create media record:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/media");

  return { status: "success", message: `"${input.fileName}" uploaded.` };
}

/** Updates only the editable metadata fields — never storage/identity information. */
export async function updateMediaMetadata(
  _prevState: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage media." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing media id." };
  }

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This media item no longer exists. Please reload the page." };
  }

  const title = readOptionalString(formData, "title");
  const altText = readOptionalString(formData, "altText");
  const description = readOptionalString(formData, "description");
  const folder = readOptionalString(formData, "folder");

  try {
    await prisma.media.update({
      where: { id },
      data: { title, altText, description, folder },
    });
  } catch (error) {
    console.error("Failed to update media metadata:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}/edit`);

  return { status: "success", message: "Media details updated." };
}

/**
 * Deletes a Media item only when nothing references it. Blob is deleted
 * first: if that fails, nothing is touched and the operation is safely
 * retryable. If the blob delete succeeds but the database delete then
 * fails, that split state is reported clearly rather than claimed as a
 * full success — retrying is still safe, since a blob that's already gone
 * is treated as already-deleted rather than an error.
 */
export async function deleteMedia(
  _prevState: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage media." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing media id." };
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return { status: "error", message: "This media item no longer exists. Please reload the page." };
  }

  const usages = await getMediaUsage(id);
  if (usages.length > 0) {
    return {
      status: "error",
      message: `This media item is currently used by ${usages.join(", ")} and can't be deleted.`,
    };
  }

  try {
    await del(media.storagePath);
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      console.error("Failed to delete blob:", error);
      return {
        status: "error",
        message: "Could not delete the file from storage. Nothing was changed — please try again.",
      };
    }
    // Already gone from storage — fine, proceed to remove the database record.
  }

  try {
    await prisma.media.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete media record after blob deletion:", error);
    return {
      status: "error",
      message:
        "The file was removed from storage, but its database record could not be deleted. Please try deleting it again.",
    };
  }

  revalidatePath("/admin/media");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}
