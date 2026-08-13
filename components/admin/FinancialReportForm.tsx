"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";

import { createFinancialReport, updateFinancialReport } from "@/app/admin/finance/reports/action";
import type { FinancialProgram, FinancialReport } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export interface FinancialReportFormProps {
  /** Omit (or pass null) to render a "create new" form; pass a report to edit it in place. */
  report?: FinancialReport | null;
  /** Selectable programs — active ones, plus the report's own program if it's since been deactivated. */
  programs: FinancialProgram[];
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

// Matches Input's own styling — no Select component exists in components/ui,
// and a native <select> doesn't warrant adding one.
const selectClassName = cn(
  "h-11 w-full rounded-md border border-input bg-surface px-4 text-body text-foreground",
  "transition-colors duration-150",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive"
);

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const initialState = { status: "idle", message: "" } as const;

/** One form, reused for both creating and editing a FinancialReport. */
export function FinancialReportForm({ report = null, programs }: FinancialReportFormProps) {
  const action = report ? updateFinancialReport : createFinancialReport;
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Programs</CardTitle>
          <CardDescription>Financial reports need a program before one can be created.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-small text-muted-foreground">
            There are no active financial programs yet.{" "}
            <a href="/admin/finance" className="text-primary underline underline-offset-4">
              Create one in Financial Programs
            </a>{" "}
            first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {report ? <input type="hidden" name="id" value={report.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
          <CardDescription>Which program and month/year this report covers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Program" htmlFor="programId" required>
            <select
              id="programId"
              name="programId"
              required
              defaultValue={report?.programId ?? ""}
              className={selectClassName}
            >
              <option value="" disabled>
                Select a program
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                  {!program.isActive ? " (inactive)" : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Month" htmlFor="reportMonth" required>
              <select
                id="reportMonth"
                name="reportMonth"
                required
                defaultValue={report?.reportMonth ?? ""}
                className={selectClassName}
              >
                <option value="" disabled>
                  Select a month
                </option>
                {MONTHS.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Year" htmlFor="reportYear" required>
              <Input
                id="reportYear"
                name="reportYear"
                type="number"
                step={1}
                required
                defaultValue={report?.reportYear ?? new Date().getFullYear()}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Amounts</CardTitle>
          <CardDescription>The spreadsheet remains the source of truth for accounting — these are the published summary figures.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Total Fund" htmlFor="totalFund" required>
              <Input
                id="totalFund"
                name="totalFund"
                type="number"
                step="any"
                required
                defaultValue={report?.totalFund.toString() ?? "0"}
              />
            </Field>

            <Field label="Current Balance" htmlFor="currentBalance" required>
              <Input
                id="currentBalance"
                name="currentBalance"
                type="number"
                step="any"
                required
                defaultValue={report?.currentBalance.toString() ?? "0"}
              />
            </Field>

            <Field label="Monthly Income" htmlFor="monthlyIncome" required>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                step="any"
                required
                defaultValue={report?.monthlyIncome.toString() ?? "0"}
              />
            </Field>

            <Field label="Monthly Expense" htmlFor="monthlyExpense" required>
              <Input
                id="monthlyExpense"
                name="monthlyExpense"
                type="number"
                step="any"
                required
                defaultValue={report?.monthlyExpense.toString() ?? "0"}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links & Notes</CardTitle>
          <CardDescription>Optional references to the underlying spreadsheet and any context for this report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Spreadsheet URL" htmlFor="spreadsheetUrl" hint="Optional — link to the source spreadsheet.">
            <Input id="spreadsheetUrl" name="spreadsheetUrl" type="url" autoComplete="off" defaultValue={report?.spreadsheetUrl ?? ""} />
          </Field>

          <Field label="Viewer URL" htmlFor="viewerUrl" hint="Optional — a read-only/embeddable view of the report.">
            <Input id="viewerUrl" name="viewerUrl" type="url" autoComplete="off" defaultValue={report?.viewerUrl ?? ""} />
          </Field>

          <Field label="Notes" htmlFor="notes" hint="Optional.">
            <Textarea id="notes" name="notes" defaultValue={report?.notes ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Only published reports are shown on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={report?.isPublished ?? false}
              className="size-5 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="isPublished" className="text-label text-foreground">
              Publish this report
            </label>
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
          {report ? "Save Changes" : "Create Report"}
        </Button>
      </div>
    </form>
  );
}
