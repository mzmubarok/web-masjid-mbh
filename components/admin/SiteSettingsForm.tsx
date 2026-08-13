"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { updateSiteSettings } from "@/app/admin/settings/action";
import type { SiteSettingsActionState } from "@/app/admin/settings/action";
import type { SiteSetting } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface SiteSettingsFormProps {
  settings: SiteSetting;
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

const initialState: SiteSettingsActionState = { status: "idle", message: "" };

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Website identity shown across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Site Name" htmlFor="siteName" required>
            <Input
              id="siteName"
              name="siteName"
              required
              maxLength={100}
              defaultValue={settings.siteName}
              autoComplete="off"
            />
          </Field>

          <Field label="Site Tagline" htmlFor="siteTagline">
            <Input id="siteTagline" name="siteTagline" defaultValue={settings.siteTagline ?? ""} />
          </Field>

          <Field label="Site Description" htmlFor="siteDescription">
            <Textarea
              id="siteDescription"
              name="siteDescription"
              defaultValue={settings.siteDescription ?? ""}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Language" htmlFor="language" required hint="e.g. id, en">
              <Input id="language" name="language" required defaultValue={settings.language} />
            </Field>

            <Field label="Timezone" htmlFor="timezone" required hint="e.g. Asia/Jakarta">
              <Input id="timezone" name="timezone" required defaultValue={settings.timezone} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>Default metadata for pages without custom SEO.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Meta Title" htmlFor="metaTitle" required hint="Recommended: up to 60 characters">
            <Input
              id="metaTitle"
              name="metaTitle"
              required
              maxLength={60}
              defaultValue={settings.metaTitle}
            />
          </Field>

          <Field
            label="Meta Description"
            htmlFor="metaDescription"
            required
            hint="Recommended: up to 160 characters"
          >
            <Textarea
              id="metaDescription"
              name="metaDescription"
              required
              maxLength={160}
              defaultValue={settings.metaDescription}
            />
          </Field>

          <Field label="Meta Keywords" htmlFor="metaKeywords" hint="Comma-separated">
            <Input id="metaKeywords" name="metaKeywords" defaultValue={settings.metaKeywords ?? ""} />
          </Field>

          <Field label="Canonical URL" htmlFor="canonicalUrl">
            <Input
              id="canonicalUrl"
              name="canonicalUrl"
              type="url"
              defaultValue={settings.canonicalUrl ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Preview</CardTitle>
          <CardDescription>How links to this site look when shared.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="OG Title" htmlFor="ogTitle">
            <Input id="ogTitle" name="ogTitle" defaultValue={settings.ogTitle ?? ""} />
          </Field>

          <Field label="OG Description" htmlFor="ogDescription">
            <Textarea id="ogDescription" name="ogDescription" defaultValue={settings.ogDescription ?? ""} />
          </Field>

          <Field label="Twitter Card" htmlFor="twitterCard" hint="e.g. summary, summary_large_image">
            <Input id="twitterCard" name="twitterCard" defaultValue={settings.twitterCard ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Status</CardTitle>
          <CardDescription>Take the public site into maintenance mode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              defaultChecked={settings.maintenanceMode}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="maintenanceMode" className="text-label text-foreground">
              Enable maintenance mode
            </label>
          </div>

          <Field label="Maintenance Message" htmlFor="maintenanceMessage">
            <Textarea
              id="maintenanceMessage"
              name="maintenanceMessage"
              defaultValue={settings.maintenanceMessage ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <CardDescription>Content shown in the site-wide footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Copyright Text" htmlFor="copyrightText" required>
            <Input
              id="copyrightText"
              name="copyrightText"
              required
              defaultValue={settings.copyrightText}
            />
          </Field>

          <Field label="Footer Description" htmlFor="footerDescription">
            <Textarea
              id="footerDescription"
              name="footerDescription"
              defaultValue={settings.footerDescription ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation / Banking</CardTitle>
          <CardDescription>The mosque&apos;s shared bank account, used across every donation program.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Bank Name" htmlFor="bankName">
              <Input id="bankName" name="bankName" defaultValue={settings.bankName ?? ""} />
            </Field>

            <Field label="Bank Account Name" htmlFor="bankAccountName">
              <Input
                id="bankAccountName"
                name="bankAccountName"
                defaultValue={settings.bankAccountName ?? ""}
              />
            </Field>

            <Field label="Bank Account Number" htmlFor="bankAccountNumber">
              <Input
                id="bankAccountNumber"
                name="bankAccountNumber"
                autoComplete="off"
                defaultValue={settings.bankAccountNumber ?? ""}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
