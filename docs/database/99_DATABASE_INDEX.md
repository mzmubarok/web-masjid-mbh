# Database Index

**Version:** 1.0
**Status:** Planning

---

# Overview

This document provides an overview of the database architecture for the Masjid Baitul Hikmah website.

It serves as the primary reference for all database domains and tables.

Each database document describes a specific functional area of the system.

---

# Database Domains

| No | Document | Tables |
|----|----------|--------|
| 01 | Authentication | User, Role |
| 02 | Hero | Hero |
| 03 | About | About, Tagline |
| 04 | Events | Event, EventCategory |
| 05 | Gallery | GalleryAlbum, GalleryPhoto |
| 06 | Financial | FinancialProgram, FinancialReport |
| 07 | Donation | DonationProgram |
| 08 | Prayer | PrayerSetting, HijriOverride |
| 09 | Media | Media |
| 10 | System | SiteSetting, ContactLocation, SocialMedia, AuditLog |

Permission and RolePermission are not yet implemented — the current schema authorizes by
Role only. See `01_AUTH.md` → Future Expansion.

The schema also defines a legacy `Admin` table (predates the Role-based `User` model, no
role relation) that does not belong to any of the domains above.

---

# Database Statistics

Current implemented database includes:

| Category | Count |
|----------|------:|
| Domains | 10 |
| Tables (within the 10 domains) | 19 |
| Tables (including the legacy Admin table) | 20 |

---

# Cross-Module Relationships

The following tables are shared across multiple modules.

## User

Referenced by:

- Media (uploadedBy)
- AuditLog (user)
- Hero (createdBy, updatedBy)
- About (createdBy, updatedBy)
- Event (createdBy, updatedBy)
- GalleryAlbum (createdBy, updatedBy)
- HijriOverride (createdBy)
- FinancialReport (createdBy, updatedBy)
- DonationProgram (createdBy, updatedBy)

---

## Media

Referenced by:

- SiteSetting (logo, logoDark, favicon, defaultSeoImage, qrisImage)
- SocialMedia (icon)
- Hero (backgroundImage)
- Tagline (icon)
- Event (featuredImage)
- EventCategory (icon)
- GalleryAlbum (coverImage)
- GalleryPhoto (media)
- FinancialProgram (icon)
- DonationProgram (coverImage)

---

## Role

Referenced by:

- User

---

## FinancialProgram

Referenced by:

- FinancialReport

---

## Event

Referenced by:

- GalleryAlbum

---

## EventCategory

Referenced by:

- Event

---

## About

Referenced by:

- Tagline

---

## GalleryAlbum

Referenced by:

- GalleryPhoto

---

# Singleton Tables

The following tables are designed as singleton tables.

Only one record should exist.

- PrayerSetting
- SiteSetting
- ContactLocation

---

# Draft & Publish Tables

The following tables support Draft → Publish workflow.

- Hero
- About
- Event
- GalleryAlbum
- FinancialReport
- DonationProgram

---

# Soft Delete Strategy

The following entities should use soft delete where appropriate.

- User
- Event
- GalleryAlbum
- FinancialReport
- DonationProgram

This is a forward-looking recommendation, not yet implemented — none of these tables
currently have an `isActive` or `deletedAt` column in the schema.

Media deletion should be prevented while the file is still referenced.

AuditLog should never be deleted.

---

# Future Database Expansion

Potential future additions include:

Authentication

- Session
- LoginHistory
- PasswordReset

Events

- EventRegistration
- Speaker
- EventTag

Gallery

- AlbumCategory
- Video

Financial

- Google Sheets Sync
- FinancialSummary
- FinancialImport

Donation

- Campaign
- PaymentGateway
- Donor

Media

- Folder
- Tag
- ImageVersion

System

- Notification
- EmailTemplate
- SMTPSetting
- BackupHistory
- FeatureFlag

---

# Implementation Order

Recommended implementation sequence:

1. Authentication
2. Media
3. Site Settings
4. Hero
5. About
6. Events
7. Gallery
8. Prayer
9. Financial
10. Donation
11. Audit Log Integration

---

# Notes

This document serves as the master index for all database specifications.

Detailed table definitions are maintained in their respective database documents.

Database schema changes should always be reflected in this index.