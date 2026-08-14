"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createSocialMedia, updateSocialMedia } from "@/app/admin/social-media/action";
import type { Media, SocialMedia } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { cn } from "@/lib/utils";

export interface SocialMediaFormProps {
  /** Omit (or pass null) to render a "create new" form; pass a link to edit it in place. */
  social?: SocialMedia | null;
  media: Media[];
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/** Labeled form row — every input in this form goes through this so the label/id pairing is never missed. */
function Field({ label, htmlFor, required, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-label text-foreground">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const initialState = { status: "idle", message: "" } as const;

/** One form, reused for both creating and editing a SocialMedia link. */
export function SocialMediaForm({ social = null, media }: SocialMediaFormProps) {
  const action = social ? updateSocialMedia : createSocialMedia;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>{social ? "Edit Social Media Link" : "Create Social Media Link"}</CardTitle>
          <CardDescription>
            {social
              ? "Update this social media link's details."
              : "Add a new platform link shown in the site's social links."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {social ? <input type="hidden" name="id" value={social.id} /> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Platform" htmlFor="platform" required hint="e.g. Instagram, Facebook, YouTube">
              <Input id="platform" name="platform" required defaultValue={social?.platform ?? ""} />
            </Field>

            <Field label="Display Order" htmlFor="displayOrder" required>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                step={1}
                required
                defaultValue={social?.displayOrder ?? 0}
              />
            </Field>
          </div>

          <Field label="URL" htmlFor="url" required>
            <Input id="url" name="url" type="url" required autoComplete="off" defaultValue={social?.url ?? ""} />
          </Field>

          <Field label="Icon" htmlFor="iconId" hint="Optional — pick an existing Media item.">
            <MediaPicker name="iconId" media={media} defaultValue={social?.iconId ?? null} />
          </Field>

          <Field
            label="Instagram Embed URL"
            htmlFor="instagramEmbedUrl"
            hint="Optional — only used when Platform is Instagram. Paste a Post/Reel embed link (instagram.com)."
          >
            <Input
              id="instagramEmbedUrl"
              name="instagramEmbedUrl"
              type="url"
              autoComplete="off"
              defaultValue={social?.instagramEmbedUrl ?? ""}
            />
          </Field>

          <Field
            label="TikTok Embed URL"
            htmlFor="tiktokEmbedUrl"
            hint="Optional — only used when Platform is TikTok. Paste a Post embed link (tiktok.com)."
          >
            <Input
              id="tiktokEmbedUrl"
              name="tiktokEmbedUrl"
              type="url"
              autoComplete="off"
              defaultValue={social?.tiktokEmbedUrl ?? ""}
            />
          </Field>

          <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              role={state.status === "error" ? "alert" : "status"}
              aria-live="polite"
              className={cn(
                "text-small",
                state.status === "success" && "text-success",
                state.status === "error" && "text-destructive",
                state.status === "idle" && "sr-only"
              )}
            >
              {state.message}
            </div>

            <Button type="submit" loading={isPending} className="sm:ml-auto">
              {social ? "Save Changes" : "Create Link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
