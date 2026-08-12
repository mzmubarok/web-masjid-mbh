# Financial Reports Module

**Version:** 1.1
**Status:** Planning

---

# Purpose

The Financial Reports Module manages all financial transparency information displayed on the website.

It allows administrators to manage donation programs, publish financial reports, and provide detailed financial documents for public access.

The CMS does **not** calculate financial values. All figures originate from the mosque's official bookkeeping (spreadsheet or accounting records).

---

# Objectives

The module should allow administrators to:

- Create and manage donation programs.
- Publish monthly financial reports.
- Upload supporting financial documents.
- Link external spreadsheets.
- Choose how report data is sourced.
- Control which donation programs appear on the homepage.
- Maintain financial transparency.

---

# Donation Programs

The system supports an unlimited number of donation programs.

Examples:

- Operational Donation
- Mosque Development Donation
- S3 (Sehari Seribu Saja)
- Wakaf Al-Qur'an
- Ramadan Program
- Qurban
- Scholarship Program

Administrators can:

- Create
- Edit
- Activate
- Deactivate
- Reorder
- Show or hide programs on the homepage

---

# Database

## Tables

- FinancialProgram
- FinancialReport

`FinancialAttachment` is not yet implemented in the schema. Uploaded PDF/Excel report
files described below are forward-looking design intent — for now, `spreadsheetUrl` and
`viewerUrl` on FinancialReport are the only supported ways to link out to a report.

---

## Relationships

FinancialProgram (1)

↓

FinancialReport (Many)

---

# Financial Program Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| name | String | Yes | Program name |
| slug | String | Yes | URL slug |
| description | Text | No | Short description |
| iconId | Media | No | Optional icon |
| color | String | No | Card accent color |
| showOnHomepage | Boolean | Yes | Display on homepage |
| displayOrder | Integer | Yes | Display order |
| isActive | Boolean | Yes | Active status |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

---

# Financial Report Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| programId | Relation | Yes | Donation program |
| reportMonth | Integer | Yes | Reporting month |
| reportYear | Integer | Yes | Reporting year |
| dataSource | Enum | Yes | Source of financial data (default: Manual Entry) |
| totalFund | Decimal | No | Total fund (defaults to 0, filled in after creation) |
| monthlyIncome | Decimal | No | Income this month (defaults to 0, filled in after creation) |
| monthlyExpense | Decimal | No | Expense this month (defaults to 0, filled in after creation) |
| currentBalance | Decimal | No | Current balance (defaults to 0, filled in after creation) |
| spreadsheetUrl | URL | No | Spreadsheet link |
| viewerUrl | URL | No | Internal report page |
| notes | Text | No | Internal notes |
| isPublished | Boolean | Yes | Published status |
| publishedAt | DateTime | No | Publish timestamp |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |
| createdBy | User | Yes | Creator |
| updatedBy | User | Yes | Last editor |

---

# Data Sources

Every report must define its data source.

Supported sources:

- Manual Entry
- Google Sheets
- Microsoft Excel Online
- Uploaded PDF
- Uploaded Excel

Behavior:

## Manual Entry

Administrator manually enters:

- Total Fund
- Monthly Income
- Monthly Expense
- Current Balance

---

## Google Sheets

Administrator provides a Google Sheets URL.

The public report button opens the spreadsheet.

---

## Microsoft Excel Online

Administrator provides an Excel Online URL.

The public report button opens the spreadsheet.

---

## Uploaded PDF

Administrator uploads the official PDF report.

Visitors can view or download it.

---

## Uploaded Excel

Administrator uploads the Excel file.

Visitors may download it.

---

# Validation Rules

Program Name

- Required
- Unique

Reporting Month

- Required

Reporting Year

- Required

Spreadsheet URL

- Required only when Spreadsheet data source is selected

Financial Values

- Required only for Manual Entry

Attachments

Allowed:

- PDF
- XLS
- XLSX

Maximum:

25 MB

---

# Important Rules

The CMS never calculates financial values.

The CMS never edits spreadsheet contents.

The CMS only publishes information approved by administrators.

---

# CMS Features

## Donation Programs

- Create
- Edit
- Delete
- Activate
- Deactivate
- Reorder
- Homepage visibility

---

## Financial Reports

- Create
- Edit
- Save Draft
- Preview
- Publish
- Archive

---

## Attachments

- Upload PDF
- Upload Excel
- Replace attachment
- Delete attachment

---

# Homepage

Display only:

- Active donation programs
- Homepage-enabled programs
- Latest published report

Each card displays:

- Program Name
- Total Fund
- Income This Month
- Expense This Month
- Current Balance
- Last Updated
- View Full Report

Programs are sorted using:

displayOrder

---

# Financial Reports Page

Display all active donation programs.

Visitors can:

- Browse reports
- Open spreadsheets
- View PDFs
- Download Excel files

---

# Admin Interface

## Donation Programs

Manage:

- Name
- Description
- Icon
- Color
- Display Order
- Homepage Visibility
- Active Status

---

## Financial Reports

Manage:

- Program
- Month
- Year
- Data Source
- Financial Values
- Publish Status

The form dynamically changes based on the selected Data Source.

---

## Attachments

Manage uploaded files.

---

# Server Actions

Donation Programs

- createFinancialProgram()
- updateFinancialProgram()
- deleteFinancialProgram()
- reorderFinancialPrograms()

Financial Reports

- createFinancialReport()
- updateFinancialReport()
- publishFinancialReport()
- archiveFinancialReport()
- deleteFinancialReport()

Attachments

- uploadFinancialAttachment()
- deleteFinancialAttachment()

---

# Permissions

| Role | Programs | Reports |
|------|----------|---------|
| Super Admin | Full | Full |
| Admin | Full | Full |
| Editor | View Only | View Only |

---

# Audit Log

Programs

- Created
- Updated
- Deleted
- Activated
- Deactivated
- Reordered

Reports

- Created
- Updated
- Published
- Archived
- Deleted

Attachments

- Uploaded
- Deleted

---

# UI Components

- Data Table
- Card
- Number Input
- URL Input
- File Upload
- Badge
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders.

---

# Empty State

Donation Programs

"No donation programs have been created."

Financial Reports

"No financial reports available."

---

# Error State

Display clear validation messages.

Provide retry actions when possible.

---

# Responsive Behavior

Desktop

Table layout.

Tablet

Compact table.

Mobile

Card layout.

---

# Security

Only authenticated administrators may manage financial reports.

Only published reports are visible to the public.

Inactive programs are hidden from the website.

---

# Performance

Homepage loads only:

- Active programs
- Homepage-enabled programs
- Latest published report

Large attachments should be lazy-loaded.

Recommended database indexes:

- programId (covered by the (programId, reportMonth, reportYear) composite unique constraint)
- reportYear
- reportMonth
- isPublished
- showOnHomepage
- displayOrder

---

# Future Improvements

Potential future enhancements include:

- Spreadsheet API synchronization
- Financial analytics dashboard
- Yearly reports
- Interactive charts
- Export to PDF
- Export to Excel
- Public transparency dashboard