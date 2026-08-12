# System Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for system-wide configurations and global settings.

These tables support the entire application rather than a specific CMS module.

---

# Objectives

The System module should:

- Store website settings.
- Store contact information.
- Store social media links.
- Record administrator activities.
- Support future global configurations.

---

# Tables

This document defines:

- SiteSetting
- ContactLocation
- SocialMedia
- AuditLog

---

# Table: SiteSetting

## Purpose

Stores global website configuration.

Only one SiteSetting record should exist.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| siteName | String | No | Website name |
| siteTagline | String | Yes | Website tagline |
| siteDescription | Text | Yes | Website description |
| language | String | No | Default language |
| timezone | String | No | Website timezone |
| logoId | String | Yes | Website logo |
| logoDarkId | String | Yes | Dark mode logo |
| faviconId | String | Yes | Website favicon |
| defaultSeoImageId | String | Yes | Default Open Graph image |
| metaTitle | String | No | Default meta title |
| metaDescription | Text | No | Default meta description |
| metaKeywords | Text | Yes | SEO keywords |
| canonicalUrl | String | Yes | Canonical URL |
| ogTitle | String | Yes | Open Graph title |
| ogDescription | Text | Yes | Open Graph description |
| twitterCard | String | Yes | Twitter Card type |
| maintenanceMode | Boolean | No | Maintenance status |
| maintenanceMessage | Text | Yes | Maintenance message |
| copyrightText | String | No | Footer copyright |
| footerDescription | Text | Yes | Footer description |
| bankName | String | Yes | Official bank name |
| bankAccountName | String | Yes | Account holder |
| bankAccountNumber | String | Yes | Bank account number |
| qrisImageId | String | Yes | QRIS image |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

SiteSetting

↓

optional

↓

Media

- logoId
- logoDarkId
- faviconId
- defaultSeoImageId
- qrisImageId

---

## Constraints

- Only one SiteSetting record should exist.

---

## Notes

This table is implemented as a singleton.

`twitterCard` is stored as a plain `String`, not a database enum — the provider (SQLite)
has no native enum support; valid values are enforced by application-level validation.

---

# Table: ContactLocation

## Purpose

Stores the mosque's official contact information.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| mosqueName | String | No | Mosque name |
| shortDescription | Text | Yes | Short description |
| address | Text | No | Mosque address |
| district | String | Yes | District |
| city | String | No | City |
| province | String | No | Province |
| postalCode | String | Yes | Postal code |
| latitude | Decimal | Yes | Latitude |
| longitude | Decimal | Yes | Longitude |
| googleMapsUrl | String | Yes | Google Maps link |
| phone | String | Yes | Contact number |
| whatsapp | String | Yes | WhatsApp number |
| email | String | Yes | Official email |
| openingTime | String | No | Opening time (HH:mm) |
| closingTime | String | No | Closing time (HH:mm) |
| operatingNotes | Text | Yes | Additional operating-hours notes |
| parking | Boolean | No | Parking available |
| accessibility | Boolean | No | Wheelchair accessible |
| ablutionArea | Boolean | No | Wudhu area available |
| restroom | Boolean | No | Restroom available |
| navigationTitle | String | Yes | Navigation button label |
| directionNotes | Text | Yes | Visitor guidance |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Constraints

Only one ContactLocation record should exist.

---

## Notes

This table is implemented as a singleton.

This table has no relation to Media — the mosque has no dedicated ContactLocation image
field. `openingTime`/`closingTime` replace the earlier flat `officeHours` field with a
structured pair (matching the CMS's Opening Time / Closing Time / Notes admin form), stored
as `String` (e.g. `"04:00"`) rather than `DateTime` since only the time-of-day is relevant.

---

# Table: SocialMedia

## Purpose

Stores official social media accounts.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| platform | String | No | Platform name |
| url | String | No | Profile URL |
| iconId | String | Yes | Custom icon |
| displayOrder | Int | No | Display order |
| isActive | Boolean | No | Active status |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

SocialMedia

↓

optional

↓

Media

(iconId)

---

## Constraints

Platform names should be unique.

---

## Indexes

- platform (covered by the unique constraint)
- displayOrder
- isActive

---

# Table: AuditLog

## Purpose

Stores important administrator activities.

Audit logs help administrators review changes made within the CMS.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| userId | String | No | Administrator |
| module | String | No | Related module |
| action | String | No | Performed action |
| entityType | String | No | Entity type |
| entityId | String | No | Related entity ID |
| description | Text | Yes | Human-readable description |
| oldValue | JSON | Yes | Previous values |
| newValue | JSON | Yes | Updated values |
| ipAddress | String | Yes | Client IP |
| userAgent | Text | Yes | Browser information |
| createdAt | DateTime | No | Action timestamp |

---

## Relationships

AuditLog

↓

belongs to

↓

User

---

## Constraints

Audit logs cannot be edited.

Audit logs cannot be deleted through the CMS.

---

## Indexes

- userId
- module
- action
- createdAt

---

# Audit Events

Examples:

- Login
- Logout
- Create Event
- Update Hero
- Publish Gallery
- Delete Financial Report
- Upload Media
- Update Site Settings

---

# CMS Usage

Administrators should be able to:

- View audit logs
- Search logs
- Filter logs
- Sort logs

Administrators cannot modify audit records.

---

# Notes

AuditLog is append-only.

Once created, records remain immutable.

---

# Future Expansion

Potential future enhancements include:

- System notifications
- Email settings
- SMTP configuration
- Backup history
- API keys
- Webhooks
- Feature flags
- Multi-language settings