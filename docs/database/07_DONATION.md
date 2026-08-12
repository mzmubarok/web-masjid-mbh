# Donation Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the Donation Programs module.

The module provides information about donation programs and instructions for donors.

The website does not process payments.

All donations are transferred directly to the mosque's official bank account or QRIS.

---

# Objectives

The Donation module should:

- Display active donation programs.
- Display donation instructions.
- Display bank account information.
- Display QRIS information.
- Allow administrators to manage program descriptions.
- Support homepage and dedicated donation pages.

---

# Tables

This document defines:

- DonationProgram

---

# Table: DonationProgram

## Purpose

Stores information about donation programs available to the public.

Examples:

- Infaq Operasional
- Infaq Pembangunan
- S3 (Sehari Seribu Saja)

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| name | String | No | Program name |
| slug | String | No | URL slug |
| shortDescription | Text | Yes | Short description |
| content | Text | Yes | Full program description |
| donationInstructions | Text | Yes | Transfer instructions specific to this program |
| coverImageId | String | Yes | Program image |
| displayOrder | Int | No | Display order |
| isFeatured | Boolean | No | Homepage visibility |
| isPublished | Boolean | No | Publish status |
| publishedAt | DateTime | Yes | Publish timestamp |
| createdById | String | No | Creator |
| updatedById | String | No | Last editor |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

DonationProgram

↓

optional

↓

Media

(coverImageId)

DonationProgram

↓

belongs to

↓

User

(createdById, updatedById)

---

## Constraints

- Program name must be unique.
- Slug must be unique.
- Every program must reference a creator and a last editor.
- Bank account and QRIS payment details are not stored on this table — they live on
  SiteSetting, since the mosque uses one shared account for every program.

---

## Indexes

- slug (covered by the unique constraint)
- displayOrder
- isPublished
- isFeatured

---

# Publishing Rules

Only published donation programs appear on the website.

Draft programs remain visible only within the CMS.

---

# CMS Usage

Administrators should be able to:

- Create donation program
- Edit donation program
- Save draft
- Publish
- Archive
- Upload cover image
- Change display order

---

# Donation Information

The donation page displays:

- Official mosque bank account
- QRIS image
- Transfer instructions
- Available donation programs

These settings are managed through the Site Settings module.

Donation programs only describe the purpose of each donation.

---

# Homepage Rules

The homepage displays:

- Donation section title
- Short introduction
- "Salurkan Infaq" button
- "Pelajari Program Infaq" button

Detailed information is available on the Donation page.

---

# Notes

The website does not:

- Process payments
- Store payment transactions
- Generate invoices
- Verify transfers

Donors transfer funds directly to the mosque.

When making a transfer, donors are instructed to include the intended donation purpose (e.g., Operational, Development, or S3) in the transfer description or confirmation, following the mosque's instructions.

---

# Future Expansion

Potential future enhancements include:

- Payment gateway integration
- Donation history
- Recurring donations
- Donation campaigns
- Online payment confirmation
- Donor acknowledgements