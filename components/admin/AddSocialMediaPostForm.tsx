"use client";

import { useActionState } from "react";

import { createSocialMediaPost } from "@/app/admin/social-media/action";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface AddSocialMediaPostFormProps {
  socialMediaId: string;
  /** "Post" for Instagram, "Video" for TikTok — drives labels/copy only. */
  itemLabel: string;
  urlHint: string;
}

const initialState = { status: "idle", message: "" } as const;

/** Adds a new embedded post/video to a platform. Only accepts the platform's official post URL — validated server-side. */
export function AddSocialMediaPostForm({ socialMediaId, itemLabel, urlHint }: AddSocialMediaPostFormProps) {
  const [state, formAction, isPending] = useActionState(createSocialMediaPost, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Add {itemLabel}</CardTitle>
          <CardDescription>{urlHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="socialMediaId" value={socialMediaId} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="postUrl" className="text-label text-foreground">
                {itemLabel} URL <span className="text-destructive" aria-hidden> *</span>
              </label>
              <Input id="postUrl" name="postUrl" type="url" required autoComplete="off" placeholder={urlHint} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayOrder" className="text-label text-foreground">Display Order</label>
              <Input id="displayOrder" name="displayOrder" type="number" step={1} placeholder="Auto" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-small text-foreground">
            <input type="checkbox" name="isPublished" className="size-4" />
            Published
          </label>

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
              Add {itemLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
