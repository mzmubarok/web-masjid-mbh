"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export interface SocialMediaActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteSocialMediaState {
  status: "idle" | "error";
  message: string;
}

export interface SocialMediaPostActionState {
  status: "idle" | "success" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

interface ParsedSocialMediaInput {
  platform: string;
  url: string;
  iconId: string | null;
  displayOrder: number;
}

function parseSocialMediaForm(formData: FormData): ParsedSocialMediaInput | { error: string } {
  const platform = readOptionalString(formData, "platform");
  if (!platform) {
    return { error: "Please fill in the following required field: Platform." };
  }

  const url = readOptionalString(formData, "url");
  if (!url) {
    return { error: "Please fill in the following required field: URL." };
  }

  const displayOrderRaw = formData.get("displayOrder");
  const displayOrderText = typeof displayOrderRaw === "string" ? displayOrderRaw.trim() : "";
  if (!displayOrderText) {
    return { error: "Please fill in the following required field: Display Order." };
  }

  const displayOrder = Number(displayOrderText);
  if (!Number.isInteger(displayOrder)) {
    return { error: "Display Order must be a valid integer." };
  }

  return {
    platform,
    url,
    iconId: readOptionalString(formData, "iconId"),
    displayOrder,
  };
}

/** Confirms `iconId`, when provided, refers to a real Media record. */
async function validateIcon(iconId: string | null): Promise<string | null> {
  if (!iconId) {
    return null;
  }
  const media = await prisma.media.findUnique({ where: { id: iconId } });
  return media ? null : "Selected icon does not exist.";
}

/** Creates a new SocialMedia link. `isActive` always starts `true` — the schema has no default for it, so it's set explicitly. */
export async function createSocialMedia(
  _prevState: SocialMediaActionState,
  formData: FormData
): Promise<SocialMediaActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const parsed = parseSocialMediaForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const iconError = await validateIcon(parsed.iconId);
  if (iconError) {
    return { status: "error", message: iconError };
  }

  const platformTaken = await prisma.socialMedia.findUnique({ where: { platform: parsed.platform } });
  if (platformTaken) {
    return { status: "error", message: `A social media link for "${parsed.platform}" already exists.` };
  }

  try {
    await prisma.socialMedia.create({
      data: {
        platform: parsed.platform,
        url: parsed.url,
        iconId: parsed.iconId,
        displayOrder: parsed.displayOrder,
        isActive: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That platform is already in use by another social media link." };
    }
    console.error("Failed to create social media link:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/social-media");
  // The public homepage's Footer reads active social media links (see
  // app/page.tsx) — same convention as updateHero/updateAbout/createEvent.
  revalidatePath("/");
  redirect("/admin/social-media");
}

/** Updates an existing SocialMedia link's core fields. Active status is toggled separately. */
export async function updateSocialMedia(
  _prevState: SocialMediaActionState,
  formData: FormData
): Promise<SocialMediaActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing social media id." };
  }

  const existing = await prisma.socialMedia.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This social media link no longer exists. Please reload the page." };
  }

  const parsed = parseSocialMediaForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const iconError = await validateIcon(parsed.iconId);
  if (iconError) {
    return { status: "error", message: iconError };
  }

  const conflict = await prisma.socialMedia.findFirst({
    where: { id: { not: id }, platform: parsed.platform },
  });
  if (conflict) {
    return { status: "error", message: `Another social media link already uses the "${parsed.platform}" platform.` };
  }

  try {
    await prisma.socialMedia.update({
      where: { id },
      data: {
        platform: parsed.platform,
        url: parsed.url,
        iconId: parsed.iconId,
        displayOrder: parsed.displayOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That platform is already in use by another social media link." };
    }
    console.error("Failed to update social media link:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/social-media");
  revalidatePath(`/admin/social-media/${id}/edit`);
  revalidatePath("/");
  redirect("/admin/social-media");
}

/**
 * Flips `isActive`. Bound with `.bind(null, id, nextIsActive)` from a plain
 * Server Component form — deactivating never deletes the link.
 */
export async function toggleSocialMediaActive(id: string, nextIsActive: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.socialMedia.update({
    where: { id },
    data: { isActive: nextIsActive },
  });

  revalidatePath("/admin/social-media");
  revalidatePath("/");
}

/**
 * Deletes a SocialMedia link. No other model references SocialMedia (only
 * Media's reverse `socialMediaIconFor` relation, which is the icon side,
 * not a dependency on this row), so no deletion protection is needed. The
 * icon Media record itself is never deleted.
 */
export async function deleteSocialMedia(
  _prevState: DeleteSocialMediaState,
  formData: FormData
): Promise<DeleteSocialMediaState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing social media id." };
  }

  const existing = await prisma.socialMedia.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This social media link no longer exists. Please reload the page." };
  }

  try {
    await prisma.socialMedia.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete social media link:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/social-media");
  revalidatePath("/");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}

// ---------------------------------------------------------------------------
// SocialMediaPost — individual embedded posts/videos belonging to a platform.
// Only Instagram post/reel URLs and TikTok video URLs are accepted; neither
// platform allows embedding an arbitrary post URL in an <iframe>, so only the
// URL itself is ever stored (no HTML, no script tags) and rendered later via
// each platform's own official embed script (see components/features/social).
// ---------------------------------------------------------------------------

const INSTAGRAM_POST_URL = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?(\?.*)?$/;
const TIKTOK_POST_URL = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+\/?(\?.*)?$/;

/** Confirms `postUrl` matches the official post-URL shape for `platform` ("Instagram"/"TikTok", matched loosely like Footer's socialPlatformIcon). */
function validatePostUrl(platform: string, postUrl: string): string | { error: string } {
  const normalized = platform.toLowerCase();

  if (normalized.includes("instagram")) {
    return INSTAGRAM_POST_URL.test(postUrl)
      ? postUrl
      : { error: "Post URL must be an Instagram post or reel link, e.g. https://www.instagram.com/p/...." };
  }

  if (normalized.includes("tiktok")) {
    return TIKTOK_POST_URL.test(postUrl)
      ? postUrl
      : { error: "Video URL must be a TikTok video link, e.g. https://www.tiktok.com/@account/video/1234567890." };
  }

  return { error: `Embedded posts are only supported for Instagram and TikTok, not "${platform}".` };
}

/** The next free displayOrder for a platform's posts — existing highest plus one, or 1 for the first post. */
async function nextPostSortOrder(socialMediaId: string): Promise<number> {
  const last = await prisma.socialMediaPost.findFirst({
    where: { socialMediaId },
    orderBy: { displayOrder: "desc" },
  });
  return (last?.displayOrder ?? 0) + 1;
}

/** Creates a SocialMediaPost under an existing SocialMedia platform. Starts unpublished. */
export async function createSocialMediaPost(
  _prevState: SocialMediaPostActionState,
  formData: FormData
): Promise<SocialMediaPostActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const socialMediaId = readOptionalString(formData, "socialMediaId");
  if (!socialMediaId) {
    return { status: "error", message: "Missing social media id." };
  }

  const socialMedia = await prisma.socialMedia.findUnique({ where: { id: socialMediaId } });
  if (!socialMedia) {
    return { status: "error", message: "This social media link no longer exists. Please reload the page." };
  }

  const postUrl = readOptionalString(formData, "postUrl");
  if (!postUrl) {
    return { status: "error", message: "Please fill in the following required field: Post URL." };
  }

  const validatedUrl = validatePostUrl(socialMedia.platform, postUrl);
  if (typeof validatedUrl !== "string") {
    return { status: "error", message: validatedUrl.error };
  }

  const displayOrderRaw = readOptionalString(formData, "displayOrder");
  let displayOrder: number;
  if (displayOrderRaw) {
    displayOrder = Number(displayOrderRaw);
    if (!Number.isInteger(displayOrder)) {
      return { status: "error", message: "Display Order must be a valid integer." };
    }
  } else {
    displayOrder = await nextPostSortOrder(socialMediaId);
  }

  try {
    await prisma.socialMediaPost.create({
      data: {
        socialMediaId,
        postUrl: validatedUrl,
        displayOrder,
        isPublished: formData.get("isPublished") === "on",
      },
    });
  } catch (error) {
    console.error("Failed to add social media post:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath(`/admin/social-media/${socialMediaId}/edit`);
  revalidatePath("/");

  return { status: "success", message: "Post added." };
}

/** Updates a SocialMediaPost's URL, display order, and published state. `socialMediaId` is never editable here. */
export async function updateSocialMediaPost(
  _prevState: SocialMediaPostActionState,
  formData: FormData
): Promise<SocialMediaPostActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing post id." };
  }

  const existing = await prisma.socialMediaPost.findUnique({
    where: { id },
    include: { socialMedia: true },
  });
  if (!existing) {
    return { status: "error", message: "This post no longer exists. Please reload the page." };
  }

  const postUrl = readOptionalString(formData, "postUrl");
  if (!postUrl) {
    return { status: "error", message: "Please fill in the following required field: Post URL." };
  }

  const validatedUrl = validatePostUrl(existing.socialMedia.platform, postUrl);
  if (typeof validatedUrl !== "string") {
    return { status: "error", message: validatedUrl.error };
  }

  const displayOrderRaw = formData.get("displayOrder");
  const displayOrderText = typeof displayOrderRaw === "string" ? displayOrderRaw.trim() : "";
  if (!displayOrderText) {
    return { status: "error", message: "Please fill in the following required field: Display Order." };
  }

  const displayOrder = Number(displayOrderText);
  if (!Number.isInteger(displayOrder)) {
    return { status: "error", message: "Display Order must be a valid integer." };
  }

  try {
    await prisma.socialMediaPost.update({
      where: { id },
      data: {
        postUrl: validatedUrl,
        displayOrder,
        isPublished: formData.get("isPublished") === "on",
      },
    });
  } catch (error) {
    console.error("Failed to update social media post:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath(`/admin/social-media/${existing.socialMediaId}/edit`);
  revalidatePath("/");

  return { status: "success", message: "Post updated." };
}

/** Deletes a SocialMediaPost. */
export async function removeSocialMediaPost(
  _prevState: SocialMediaPostActionState,
  formData: FormData
): Promise<SocialMediaPostActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage social media links." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing post id." };
  }

  const existing = await prisma.socialMediaPost.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This post no longer exists. Please reload the page." };
  }

  try {
    await prisma.socialMediaPost.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to remove social media post:", error);
    return { status: "error", message: "Something went wrong while removing. Please try again." };
  }

  revalidatePath(`/admin/social-media/${existing.socialMediaId}/edit`);
  revalidatePath("/");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}

/**
 * Swaps displayOrder with the adjacent post under the same platform. Bound
 * with `.bind(null, id, "up" | "down")` from a plain Server Component form.
 * A no-op at either edge of the list (no neighbor to swap with).
 */
export async function reorderSocialMediaPost(id: string, direction: "up" | "down"): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const post = await prisma.socialMediaPost.findUnique({ where: { id } });
  if (!post) {
    return;
  }

  const neighbor = await prisma.socialMediaPost.findFirst({
    where: {
      socialMediaId: post.socialMediaId,
      displayOrder: direction === "up" ? { lt: post.displayOrder } : { gt: post.displayOrder },
    },
    orderBy: { displayOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    return;
  }

  await prisma.$transaction([
    prisma.socialMediaPost.update({ where: { id: post.id }, data: { displayOrder: neighbor.displayOrder } }),
    prisma.socialMediaPost.update({ where: { id: neighbor.id }, data: { displayOrder: post.displayOrder } }),
  ]);

  revalidatePath(`/admin/social-media/${post.socialMediaId}/edit`);
  revalidatePath("/");
}

/**
 * Flips `isPublished`. Bound with `.bind(null, id, nextIsPublished)` from a
 * plain Server Component form — unpublishing never deletes the post.
 */
export async function toggleSocialMediaPostPublished(id: string, nextIsPublished: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const post = await prisma.socialMediaPost.update({
    where: { id },
    data: { isPublished: nextIsPublished },
  });

  revalidatePath(`/admin/social-media/${post.socialMediaId}/edit`);
  revalidatePath("/");
}
