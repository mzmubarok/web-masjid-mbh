# Financial Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the Financial Reports module.

The Financial module displays financial summaries on the website while allowing administrators to manage report sources through the CMS.

Financial data is primarily maintained in spreadsheets.

The CMS stores metadata and presentation settings rather than duplicating accounting records.

---

# Objectives

The Financial module should:

- Manage financial programs.
- Store spreadsheet references.
- Display financial summaries.
- Allow publication control.
- Support homepage financial cards.
- Keep accounting data centralized in spreadsheets.

---

# Tables

This document defines:

- FinancialProgram
- FinancialReport

---

# Table: FinancialProgram

## Purpose

Stores the financial categories displayed on the homepage.

Examples:

- Operational Donation
- Mosque Development
- S3 (Sehari Seribu Saja)

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| name | String | No | Program name |
| slug | String | No | URL slug |
| description | Text | Yes | Program description |
| iconId | String | Yes | Optional icon |
| color | String | Yes | Card accent color |
| showOnHomepage | Boolean | No | Display on homepage |
| displayOrder | Int | No | Homepage order |
| isActive | Boolean | No | Active status |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

FinancialProgram

↓

optional

↓

Media

(iconId)

FinancialProgram

↓

has many

↓

FinancialReport

---

## Constraints

- Name must be unique.
- Slug must be unique.

---

## Indexes

- slug (covered by the unique constraint)
- displayOrder
- isActive
- showOnHomepage

---

# Table: FinancialReport

## Purpose

Stores the public financial report information displayed on the website.

The accounting process remains inside the spreadsheet.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| programId | String | No | Financial Program |
| reportMonth | Int | No | Month |
| reportYear | Int | No | Year |
| dataSource | String | No | Source of financial data (default: manual) |
| totalFund | Decimal | No | Total Fund (default: 0, filled in after creation) |
| monthlyIncome | Decimal | No | Income This Month (default: 0, filled in after creation) |
| monthlyExpense | Decimal | No | Expense This Month (default: 0, filled in after creation) |
| currentBalance | Decimal | No | Current Balance (default: 0, filled in after creation) |
| spreadsheetUrl | String | Yes | Public spreadsheet link |
| viewerUrl | String | Yes | Internal report page |
| notes | Text | Yes | Internal notes |
| isPublished | Boolean | No | Publish status |
| publishedAt | DateTime | Yes | Publish timestamp |
| createdById | String | No | Creator |
| updatedById | String | No | Last editor |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

FinancialReport

↓

belongs to

↓

FinancialProgram

FinancialReport

↓

belongs to

↓

User

(createdById, updatedById)

---

## Constraints

- One report per program per month.
- `totalFund`, `monthlyIncome`, `monthlyExpense`, and `currentBalance` default to 0 at the
  database level; the CMS is responsible for keeping them non-negative and populated.
- Only published reports appear publicly.
- Every report must reference a creator and a last editor.

---

## Composite Unique Constraint

(programId, reportMonth, reportYear)

---

## Indexes

- programId
- reportYear
- reportMonth
- isPublished

---

# Publishing Rules

Only published reports are visible on the website.

Draft reports remain accessible only within the CMS.

Each program should only have one published report for a specific month.

---

# Spreadsheet Integration

The spreadsheet remains the primary accounting source.

The CMS stores:

- Spreadsheet URL
- Summary values
- Publication status

Website visitors can:

- View the summary
- Open the full spreadsheet (view only)

Only administrators may edit the spreadsheet.

---

# CMS Usage

Administrators should be able to:

- Create report
- Update report
- Save draft
- Publish report
- Archive report
- Update spreadsheet link

---

# Homepage Rules

Each financial card displays:

- Total Fund
- Income This Month
- Expense This Month
- Current Balance

A "View Full Report" button opens:

- Spreadsheet
- Internal Viewer

depending on the configured link.

---

# Notes

The website should never edit spreadsheet contents.

The spreadsheet remains the single source of truth.

---

# Future Expansion

Potential future enhancements include:

- Google Sheets API
- Automatic synchronization
- Monthly comparison charts
- Annual summaries
- Export to PDF
- Export to Excel
- Financial dashboard