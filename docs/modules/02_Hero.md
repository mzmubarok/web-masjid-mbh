# Hero Module

**Version:** 1.0  
**Status:** Planning

---

# Purpose

The Hero Module manages the homepage hero section displayed to website visitors.

It allows administrators to update the main title, subtitle, background image, and supporting content without modifying the source code.

Only one Hero section is active at any time.

---

# Objectives

The Hero module should allow administrators to:

- Update the main title.
- Update the subtitle.
- Change the hero background image.
- Preview changes before publishing.
- Save drafts.
- Publish updates.

---

# Database

## Table

Hero

---

## Relationships

Background image references the Media table.

---

# Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| title | String | Yes | Main heading shown on homepage |
| subtitle | String | Yes | Supporting text below title |
| backgroundImageId | String | Yes | Reference to Media |
| isPublished | Boolean | Yes | Published status |
| publishedAt | DateTime | No | Publish timestamp |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |
| createdBy | User | Yes | Creator |
| updatedBy | User | Yes | Last editor |

---

# Validation Rules

Title

- Required
- Maximum 120 characters

Subtitle

- Required
- Maximum 250 characters

Background Image

- JPG
- PNG
- WEBP

Maximum size:

10 MB

---

# CMS Features

- Edit Hero
- Replace Background Image
- Save Draft
- Publish
- Preview

Only one published Hero is allowed.

---

# Public Website

The Hero section displays:

- Mosque title
- Background image
- Prayer schedule widget
- Hijri calendar widget

The prayer schedule and Hijri calendar are automatically loaded from their respective modules.

---

# Admin Interface

The CMS page should include:

- Hero preview
- Title input
- Subtitle input
- Image picker
- Draft button
- Publish button

---

# Server Actions

- updateHero()
- publishHero()
- uploadHeroImage()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | Update only |

---

# Audit Log

Log the following actions:

- Hero updated
- Hero published
- Background image replaced

---

# UI Components

- Card
- Form
- Media Picker
- Image Preview
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while loading hero data.

---

# Empty State

If no Hero exists, display:

"No Hero content has been created."

Provide a button:

Create Hero

---

# Error State

Display user-friendly validation and upload errors.

---

# Responsive Behavior

Desktop

Two-column layout.

Mobile

Single-column layout.

---

# Security

Only authenticated users with appropriate permissions may modify Hero content.

Image uploads must be validated.

---

# Performance

Optimize hero images before displaying them on the public website.

Use lazy loading where appropriate.

---

# Future Improvements

Potential future enhancements include:

- Video background
- Hero carousel
- Scheduled publishing
- Animated hero content