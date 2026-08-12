# About Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the About section of the Masjid Baitul Hikmah website.

The About section introduces the mosque, its history, vision, mission, and organizational values.

The Tagline section is managed as part of the About module.

---

# Objectives

The About module should allow administrators to manage:

- Introduction
- History
- Vision
- Mission
- About Page
- Tagline Cards

---

# Tables

This document defines:

- About
- Tagline

---

# Table: About

## Purpose

Stores the primary informational content about the mosque.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| title | String | No | Section title |
| introduction | Text | No | Short introduction |
| history | Text | No | Mosque history |
| vision | Text | No | Vision statement |
| mission | Text | No | Mission statement |
| aboutPageContent | Text | Yes | Full content for About page |
| isPublished | Boolean | No | Published status |
| publishedAt | DateTime | Yes | Publish timestamp |
| createdById | String | No | Creator |
| updatedById | String | No | Last editor |
| createdAt | DateTime | No | Creation timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Relationships

About

↓

belongs to

↓

User

(createdById, updatedById)

About

↓

has many

↓

Tagline

---

## Constraints

- Only one About record may be published.
- Title is required.
- Introduction is required.
- Every About record must reference a creator and a last editor.

---

## Indexes

- isPublished
- publishedAt

---

## Notes

The homepage displays only a summary.

The full About content is displayed on the dedicated About page.

---

# Table: Tagline

## Purpose

Stores the value cards displayed below the About section.

Example:

- Mengaji
- Mengabdi
- Menghidupi

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| aboutId | String | No | Reference to About |
| title | String | No | Tagline title |
| description | Text | No | Tagline description |
| iconId | String | Yes | Media reference |
| sortOrder | Int | No | Display order |
| createdAt | DateTime | No | Creation timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Relationships

Tagline

↓

belongs to

↓

About

Tagline

↓

optional

↓

Media

(iconId)

---

## Constraints

- Every Tagline belongs to one About record.
- Sort order must be unique within the same About record (composite unique on `aboutId` + `sortOrder`).

---

## Indexes

- (aboutId, sortOrder) — composite unique, also covers lookups by aboutId
- sortOrder

---

# Publishing Rules

Only one About record may be published.

Taglines automatically follow the published About record.

Separate publishing for individual Taglines is not required.

---

# CMS Usage

Administrators should be able to:

- Update About information
- Edit History
- Edit Vision
- Edit Mission
- Manage Taglines
- Reorder Taglines
- Upload Tagline Icons
- Preview
- Publish

---

# Notes

The homepage displays only a condensed version of the About content.

Detailed information is available on the dedicated About page.

---

# Future Expansion

Potential future enhancements include:

- Additional tagline cards
- Rich text editor
- Timeline history
- Organizational structure
- Mosque management profiles
- Multi-language support