"use client";

import { useActionState } from "react";
import type { FormEvent } from "react";

import {
  updateSocialMediaPost,
  removeSocialMediaPost,
  reorderSocialMediaPost,
  toggleSocialMediaPostPublished,
} from "@/app/admin/social-media/action";
import type { SocialMediaPost } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface SocialMediaPostRowProps {
  post: SocialMediaPost;
  isFirst: boolean;
  isLast: boolean;
}

const initialState = { status: "idle", message: "" } as const;

/** One embedded post/video in a platform's list: edit URL/display order, publish/unpublish, reorder, or remove. */
export function SocialMediaPostRow({ post, isFirst, isLast }: SocialMediaPostRowProps) {
  const [updateState, updateAction, isUpdating] = useActionState(updateSocialMediaPost, initialState);
  const [removeState, removeAction, isRemoving] = useActionState(removeSocialMediaPost, initialState);

  function handleRemoveSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Remove this post?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <a
          href={post.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-small text-primary underline underline-offset-2"
          title={post.postUrl}
        >
          {post.postUrl}
        </a>
        <Badge tone={post.isPublished ? "success" : "outline"}>
          {post.isPublished ? "Published" : "Unpublished"}
        </Badge>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="id" value={post.id} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor={`postUrl-${post.id}`} className="text-label text-foreground">
              URL
            </label>
            <Input id={`postUrl-${post.id}`} name="postUrl" type="url" required defaultValue={post.postUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={`displayOrder-${post.id}`} className="text-label text-foreground">
              Display Order
            </label>
            <Input
              id={`displayOrder-${post.id}`}
              name="displayOrder"
              type="number"
              step={1}
              required
              defaultValue={post.displayOrder}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-small text-foreground">
          <input type="checkbox" name="isPublished" defaultChecked={post.isPublished} className="size-4" />
          Published
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="outline" size="sm" loading={isUpdating}>
            Save
          </Button>
          {updateState.status === "error" ? (
            <p role="alert" className="text-caption text-destructive">
              {updateState.message}
            </p>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <form action={reorderSocialMediaPost.bind(null, post.id, "up")}>
          <Button type="submit" variant="outline" size="sm" disabled={isFirst}>
            Move Up
          </Button>
        </form>

        <form action={reorderSocialMediaPost.bind(null, post.id, "down")}>
          <Button type="submit" variant="outline" size="sm" disabled={isLast}>
            Move Down
          </Button>
        </form>

        <form action={toggleSocialMediaPostPublished.bind(null, post.id, !post.isPublished)}>
          <Button type="submit" variant="outline" size="sm">
            {post.isPublished ? "Unpublish" : "Publish"}
          </Button>
        </form>

        <form action={removeAction} onSubmit={handleRemoveSubmit}>
          <input type="hidden" name="id" value={post.id} />
          <Button type="submit" variant="outline" size="sm" loading={isRemoving} className="text-destructive">
            Remove
          </Button>
        </form>
      </div>

      {removeState.status === "error" ? (
        <p role="alert" className="text-caption text-destructive">
          {removeState.message}
        </p>
      ) : null}
    </div>
  );
}
