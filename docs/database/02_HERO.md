# Hero Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the Hero section displayed on the homepage.

The Hero section introduces the mosque and provides key information to visitors.

Only one Hero record can be published at a time.

---

# Objectives

The Hero module should:

- Display the mosque name.
- Display the homepage heading.
- Display supporting text.
- Display an optional background image.
- Allow draft and publish workflow.
- Support future content expansion.

---

# Tables

This document defines:

- Hero

---

# Table: Hero

## Purpose

Stores the homepage Hero content.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| title | String | No | Main heading |
| subtitle | String | Yes | Supporting text |
| backgroundImageId | String | Yes | Hero background image |
| isPublished | Boolean | No | Published status |
| publishedAt | DateTime | Yes | Publish timestamp |
| createdById | String | No | Creator |
| updatedById | String | No | Last editor |
| createdAt | DateTime | No | Creation timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Relationships

Hero

↓

optional

↓

Media

(backgroundImageId)

Hero

↓

belongs to

↓

User

(createdById, updatedById)

---

## Constraints

- Only one Hero record may be published at any time.
- Title is required.
- Background image is optional.
- Every Hero record must reference a creator and a last editor.

---

## Indexes

- isPublished
- publishedAt

---

# Publishing Rules

Administrators may create multiple Hero drafts.

However:

Only one Hero can have:

isPublished = true

Publishing a new Hero automatically unpublishes the previous one.

---

# Notes

The Hero section does not store:

- Prayer Schedule
- Hijri Date
- Gregorian Date

These values are generated dynamically by the Prayer module.

---

# CMS Usage

Administrators should be able to:

- Create Hero
- Edit Hero
- Save Draft
- Preview
- Publish
- Archive

---

# Future Expansion

Potential future additions include:

- Hero video
- CTA button
- Multiple language support
- Seasonal banners