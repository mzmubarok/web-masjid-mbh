# Donation Programs Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Donation Programs Module manages all donation and fundraising programs displayed on the website.

Its purpose is to educate visitors about each donation program, explain its objectives, provide payment information, and encourage donations.

This module focuses on communication and fundraising rather than financial reporting.

---

# Objectives

The module should allow administrators to:

- Create donation programs.
- Explain the purpose of each program.
- Display payment information.
- Manage QRIS images.
- Publish donation campaigns.
- Feature selected programs on the homepage.

---

# Database

## Tables

- DonationProgram

---

# Donation Program Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| name | String | Yes | Program name |
| slug | String | Yes | URL slug |
| shortDescription | Text | Yes | Homepage description |
| content | Rich Text | Yes | Full program explanation |
| coverImageId | Media | No | Cover image |
| donationInstructions | Rich Text | No | Transfer instructions |
| displayOrder | Integer | Yes | Display order |
| isFeatured | Boolean | Yes | Homepage visibility |
| isPublished | Boolean | Yes | Published status |
| publishedAt | DateTime | No | Publish timestamp |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |
| createdBy | User | Yes | Creator |
| updatedBy | User | Yes | Last editor |

`qrisImageId`, `bankName`, `accountNumber`, and `accountHolder` are not fields on this
table — the mosque uses one shared bank account/QRIS for every program, so that
information lives on SiteSetting instead (see `11_SiteSettings.md`).

---

# Validation Rules

Title

- Required
- Maximum 100 characters

Slug

- Required
- Unique

Short Description

- Required
- Maximum 250 characters

Full Description

- Required

QRIS

Optional

Bank Information

Optional

At least one payment method must exist.

---

# Important Rules

The mosque currently uses **one shared bank account** for all donation programs.

Visitors must specify the intended donation purpose when making a transfer.

Example transfer note:

- Operational Donation
- Mosque Development
- S3
- Ramadan Program

Future versions may support multiple bank accounts.

---

# Payment Methods

Supported payment methods:

- QRIS
- Bank Transfer

Future support:

- E-Wallet
- Payment Gateway

---

# CMS Features

Administrators can:

- Create program
- Edit program
- Delete program
- Save Draft
- Publish
- Feature on homepage
- Upload QRIS image
- Update bank information

---

# Homepage

Display featured donation programs.

Each card contains:

- Cover image
- Program title
- Short description
- Donate button
- Learn More button

---

# Donation Detail Page

Display:

- Cover image
- Full description
- QRIS
- Bank account
- Transfer instructions
- Donation reminder

---

# Transfer Instructions

The page should clearly inform visitors that all donations are transferred to one mosque account.

Visitors are requested to include the donation purpose in the transfer description.

Example:

Transfer Description:

Operational Donation

or

Mosque Development

or

S3

This helps administrators correctly allocate incoming donations.

---

# Admin Interface

Program Information

- Name
- Description
- Cover Image
- Donation Instructions

Payment (read-only preview — edited in Site Settings, shared across all programs)

- QRIS
- Bank Name
- Account Number
- Account Holder

Publishing

- Draft
- Publish
- Homepage Feature

---

# Server Actions

- createDonationProgram()
- updateDonationProgram()
- deleteDonationProgram()
- publishDonationProgram()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | Create / Update |

---

# Audit Log

- Program Created
- Program Updated
- Program Published
- QRIS Updated
- Bank Information Updated

---

# UI Components

- Cards
- Rich Text Editor
- Media Picker
- QR Preview
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while loading donation programs.

---

# Empty State

"No donation programs available."

Button:

Create Donation Program

---

# Error State

Display validation errors and upload errors.

---

# Responsive Behavior

Desktop

Multi-column layout.

Tablet

Two-column layout.

Mobile

Single-column cards.

---

# Security

Only authenticated administrators may manage donation programs.

Only published programs are visible to visitors.

---

# Performance

Optimize QRIS images.

Lazy-load media.

Use database indexes for:

- slug
- isPublished
- isFeatured
- displayOrder

---

# Future Improvements

Potential future enhancements include:

- Payment Gateway integration
- Donation progress bars
- Campaign target amounts
- Automatic receipt generation
- Multi-bank support
- Donation analytics