# Site Settings Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Site Settings Module manages all global website configurations.

These settings are shared across the entire website and can be updated without modifying source code.

This module acts as the central configuration hub for branding, SEO, localization, and website behavior.

---

# Objectives

The module should allow administrators to:

- Manage website identity.
- Configure branding assets.
- Configure SEO.
- Configure localization.
- Configure homepage defaults.
- Configure maintenance mode.
- Manage contact information used globally.

---

# Database

## Tables

- SiteSettings

---

# Site Settings Fields

## General

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| siteName | String | Yes | Website name |
| siteTagline | String | No | Website tagline |
| siteDescription | Text | Yes | Website description |
| language | String | Yes | Default language |
| timezone | String | Yes | Website timezone |

---

## Branding

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| logoId | Media | Yes | Primary logo |
| logoDarkId | Media | No | Dark mode logo |
| faviconId | Media | Yes | Website favicon |
| defaultSeoImageId | Media | No | Default Open Graph image |

---

## SEO

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| metaTitle | String | Yes | Default meta title |
| metaDescription | Text | Yes | Default meta description |
| metaKeywords | Text | No | SEO keywords |
| canonicalUrl | URL | No | Canonical URL |

---

## Social Preview

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| ogTitle | String | No | Open Graph title |
| ogDescription | Text | No | Open Graph description |
| twitterCard | Enum | No | Twitter Card type |

---

## Website Status

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| maintenanceMode | Boolean | Yes | Enable maintenance mode |
| maintenanceMessage | Text | No | Maintenance message |

---

## Footer

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| copyrightText | String | Yes | Footer copyright |
| footerDescription | Text | No | Footer description |

---

## Donation / Banking

The mosque uses one shared bank account and QRIS code for every donation program (see
`07_DonationPrograms.md`).

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| bankName | String | No | Official bank name |
| bankAccountName | String | No | Account holder |
| bankAccountNumber | String | No | Bank account number |
| qrisImageId | Media | No | QRIS image |

---

# Validation Rules

Site Name

- Required
- Maximum 100 characters

Meta Title

- Maximum 60 characters

Meta Description

- Maximum 160 characters

Logo

- Required

Favicon

- Required

---

# CMS Features

Administrators can:

- Update website identity
- Replace logo
- Replace favicon
- Configure SEO
- Configure Open Graph
- Enable maintenance mode
- Update footer information

---

# Branding

All branding assets should be selected from the Media Library.

Supported assets:

- Logo
- Dark Logo
- Favicon
- Open Graph Image

---

# SEO

Provide default SEO metadata for pages without custom SEO.

Support:

- Meta Title
- Meta Description
- Canonical URL
- Open Graph
- Twitter Card

---

# Maintenance Mode

When enabled:

Visitors should see:

- Maintenance page
- Maintenance message

Administrators remain able to access the CMS.

---

# Admin Interface

## General

- Site Name
- Tagline
- Description

---

## Branding

- Logo
- Dark Logo
- Favicon
- Open Graph Image

---

## SEO

- Meta Title
- Meta Description
- Keywords
- Canonical URL

---

## Website Status

- Maintenance Toggle
- Maintenance Message

---

## Footer

- Copyright
- Footer Description

---

# Server Actions

- updateSiteSettings()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | View Only |

---

# Audit Log

- Site Settings Updated
- Branding Updated
- SEO Updated
- Maintenance Mode Changed

---

# UI Components

- Form
- Media Picker
- Textarea
- Toggle
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while settings are loading.

---

# Empty State

Initialize with default website settings during installation.

---

# Error State

Display validation errors.

---

# Responsive Behavior

Desktop

Two-column settings layout.

Tablet

Compact layout.

Mobile

Single-column layout.

---

# Security

Only authenticated administrators may modify site settings.

Maintenance mode must never block CMS access.

---

# Performance

Cache global settings.

Invalidate cache after updates.

---

# Future Improvements

Potential future enhancements include:

- Multi-language support
- Theme customization
- Custom CSS
- Analytics integration
- Cookie consent configuration
- Sitemap configuration
- Robots.txt editor