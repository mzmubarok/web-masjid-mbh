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

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Confirms an optional embed URL is a well-formed URL whose host is (or is a subdomain of) `expectedHost`. `null` is always valid — the field is optional. */
function validateEmbedUrlHost(value: string | null, expectedHost: string, label: string): string | { error: string } | null {
  if (!value) {
    return null;
  }

  let hostname: string;
  try {
    hostname = new URL(value).hostname;
  } catch {
    return { error: `${label} must be a valid URL.` };
  }

  if (hostname !== expectedHost && !hostname.endsWith(`.${expectedHost}`)) {
    return { error: `${label} must be a valid ${expectedHost} URL.` };
  }

  return value;
}

interface ParsedSocialMediaInput {
  platform: string;
  url: string;
  iconId: string | null;
  displayOrder: number;
  instagramEmbedUrl: string | null;
  tiktokEmbedUrl: string | null;
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

  const instagramEmbedUrl = validateEmbedUrlHost(
    readOptionalString(formData, "instagramEmbedUrl"),
    "instagram.com",
    "Instagram Embed URL"
  );
  if (instagramEmbedUrl !== null && typeof instagramEmbedUrl !== "string") {
    return instagramEmbedUrl;
  }

  const tiktokEmbedUrl = validateEmbedUrlHost(
    readOptionalString(formData, "tiktokEmbedUrl"),
    "tiktok.com",
    "TikTok Embed URL"
  );
  if (tiktokEmbedUrl !== null && typeof tiktokEmbedUrl !== "string") {
    return tiktokEmbedUrl;
  }

  return {
    platform,
    url,
    iconId: readOptionalString(formData, "iconId"),
    displayOrder,
    instagramEmbedUrl,
    tiktokEmbedUrl,
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
        instagramEmbedUrl: parsed.instagramEmbedUrl,
        tiktokEmbedUrl: parsed.tiktokEmbedUrl,
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
        instagramEmbedUrl: parsed.instagramEmbedUrl,
        tiktokEmbedUrl: parsed.tiktokEmbedUrl,
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
