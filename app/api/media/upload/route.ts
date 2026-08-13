import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";
import { ALLOWED_MEDIA_MIME_TYPES, MAX_MEDIA_FILE_SIZE_BYTES } from "@/lib/media/constraints";

/**
 * Issues short-lived, scoped client tokens for direct browser -> Vercel Blob
 * uploads (the client-upload pattern, required here since a 10 MB image can
 * exceed the ~4.5 MB request body limit of a Vercel serverless function —
 * the server upload pattern isn't viable for this file size).
 *
 * The actual Media record is NOT created from `onUploadCompleted` here —
 * that webhook only fires when Vercel Blob can reach a public deployment
 * URL, which local development can't provide. Instead the client calls the
 * `createMediaRecord` Server Action directly once `upload()` resolves; see
 * app/admin/media/action.ts.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();

        if (!session?.user?.id) {
          throw new Error("Unauthorized");
        }

        return {
          allowedContentTypes: [...ALLOWED_MEDIA_MIME_TYPES],
          maximumSizeInBytes: MAX_MEDIA_FILE_SIZE_BYTES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Failed to issue media upload token:", error);
    return NextResponse.json({ error: "Unable to start upload." }, { status: 400 });
  }
}
