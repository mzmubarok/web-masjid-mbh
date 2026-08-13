"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SITE_SETTINGS_ID = "site-settings";

export interface SiteSettingsActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const REQUIRED_FIELDS = [
  ["siteName", "Site Name"],
  ["language", "Language"],
  ["timezone", "Timezone"],
  ["metaTitle", "Meta Title"],
  ["metaDescription", "Meta Description"],
  ["copyrightText", "Copyright Text"],
] as const;

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/**
 * Updates the singleton SiteSetting record. Media fields (logoId, logoDarkId,
 * faviconId, defaultSeoImageId, qrisImageId) are managed separately and are
 * never touched here.
 *
 * Takes `(prevState, formData)` so it can be driven by `useActionState` on
 * the client — the extra leading argument is ignored, the rest of the
 * contract (FormData in, singleton updated, `/admin/settings` revalidated)
 * is unchanged.
 */
export async function updateSiteSettings(
  _prevState: SiteSettingsActionState,
  formData: FormData
): Promise<SiteSettingsActionState> {
  const session = await auth();

  if (!session?.user) {
    return { status: "error", message: "You must be signed in to update settings." };
  }

  const missing: string[] = [];
  const required: Record<string, string> = {};

  for (const [key, label] of REQUIRED_FIELDS) {
    const value = readOptionalString(formData, key);
    if (!value) {
      missing.push(label);
    } else {
      required[key] = value;
    }
  }

  if (missing.length > 0) {
    return {
      status: "error",
      message: `Please fill in the following required fields: ${missing.join(", ")}.`,
    };
  }

  // General
  const siteTagline = readOptionalString(formData, "siteTagline");
  const siteDescription = readOptionalString(formData, "siteDescription");

  // SEO
  const metaKeywords = readOptionalString(formData, "metaKeywords");
  const canonicalUrl = readOptionalString(formData, "canonicalUrl");

  // Social Preview
  const ogTitle = readOptionalString(formData, "ogTitle");
  const ogDescription = readOptionalString(formData, "ogDescription");
  const twitterCard = readOptionalString(formData, "twitterCard");

  // Website Status
  // Unchecked checkboxes are omitted from FormData entirely, so presence
  // (not the value) is what tells us whether the box was checked.
  const maintenanceMode = formData.get("maintenanceMode") !== null;
  const maintenanceMessage = readOptionalString(formData, "maintenanceMessage");

  // Footer
  const footerDescription = readOptionalString(formData, "footerDescription");

  // Donation / Banking
  const bankName = readOptionalString(formData, "bankName");
  const bankAccountName = readOptionalString(formData, "bankAccountName");
  const bankAccountNumber = readOptionalString(formData, "bankAccountNumber");

  try {
    await prisma.siteSetting.update({
      where: { id: SITE_SETTINGS_ID },
      data: {
        siteName: required.siteName,
        siteTagline,
        siteDescription,
        language: required.language,
        timezone: required.timezone,

        metaTitle: required.metaTitle,
        metaDescription: required.metaDescription,
        metaKeywords,
        canonicalUrl,

        ogTitle,
        ogDescription,
        twitterCard,

        maintenanceMode,
        maintenanceMessage,

        copyrightText: required.copyrightText,
        footerDescription,

        bankName,
        bankAccountName,
        bankAccountNumber,
      },
    });
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/settings");

  return { status: "success", message: "Site settings updated successfully." };
}
