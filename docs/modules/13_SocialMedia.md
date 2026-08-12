# Social Media Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Social Media Module manages all official social media accounts displayed throughout the website.

It allows administrators to configure social media platforms, manage profile links, and display recent content previews on the homepage.

This module centralizes all social media information without requiring source code modifications.

---

# Objectives

The module should allow administrators to:

- Manage official social media accounts.
- Enable or disable social platforms.
- Configure homepage visibility.
- Display social media previews.
- Update account links.
- Manage display order.

---

# Database

## Tables

- SocialMedia

`displayName`, `username`, `embedUrl`, and `showOnHomepage` described in earlier drafts
of this module are not implemented — the current table stores only the fields below.
Homepage visibility is currently controlled by `isActive` alone (there is no separate
homepage toggle).

---

# Social Media Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| platform | String | Yes | Platform name (must be unique) |
| url | URL | Yes | Profile URL |
| iconId | Media | No | Optional custom icon |
| isActive | Boolean | Yes | Active / homepage status |
| displayOrder | Integer | Yes | Display order |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

---

# Supported Platforms

Initial platforms:

- Instagram
- TikTok
- YouTube
- Facebook
- X (Twitter)

Future platforms:

- Telegram
- WhatsApp Channel
- Threads
- LinkedIn

---

# Validation Rules

Platform

- Required
- Must be unique

Profile URL

- Required
- Must be a valid URL

Display Order

- Required

---

# CMS Features

Administrators can:

- Add platform
- Edit platform
- Delete platform
- Activate / Deactivate platform
- Reorder platforms
- Toggle homepage visibility

---

# Homepage Display

Display only active platforms.

Each social media card displays:

- Platform icon
- Platform name
- Latest content preview (when available)
- Follow button

---

# Content Preview

When supported by the platform, display:

Instagram

- Latest posts

TikTok

- Latest videos

YouTube

- Latest uploads

If previews cannot be loaded, display:

- Platform icon
- Platform name
- Follow button

The website should continue functioning normally even if previews are unavailable.

---

# Admin Interface

Display:

- Platform
- Profile URL
- Active Status
- Display Order

---

# Server Actions

- createSocialMedia()
- updateSocialMedia()
- deleteSocialMedia()
- reorderSocialMedia()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | View Only |

---

# Audit Log

Log:

- Platform Created
- Platform Updated
- Platform Deleted
- Platform Activated
- Platform Deactivated
- Platform Reordered

---

# UI Components

- Data Table
- Card Preview
- URL Input
- Toggle
- Badge
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton cards while loading previews.

---

# Empty State

"No social media accounts configured."

Button:

Add Social Platform

---

# Error State

Display URL validation errors.

If preview loading fails, continue displaying account information.

---

# Responsive Behavior

Desktop

Two-column cards.

Tablet

Two-column grid.

Mobile

Single-column cards.

---

# Security

Only authenticated administrators may modify social media settings.

Profile URLs should be validated before saving.

---

# Performance

Lazy-load embedded previews.

Cache preview metadata.

Database indexes:

- platform (covered by the unique constraint)
- isActive
- displayOrder

---

# Future Improvements

Potential future enhancements include:

- Automatic follower counts
- Automatic latest post synchronization
- Social media analytics
- Multi-account support
- Live streaming integration
- YouTube playlist support