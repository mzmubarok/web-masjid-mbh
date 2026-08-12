# Media Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the Media Library.

The Media Library serves as the central repository for all uploaded media used throughout the website and CMS.

Media files are uploaded once and can be reused across multiple modules.

---

# Objectives

The Media Library should:

- Store uploaded files.
- Support image reuse.
- Prevent duplicate uploads.
- Organize media efficiently.
- Support future file types.

---

# Tables

This document defines:

- Media

---

# Table: Media

## Purpose

Stores uploaded media metadata.

Actual files are stored in external storage or the local filesystem.

The database stores only metadata and references.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| fileName | String | No | Original file name |
| storedFileName | String | No | Stored file name |
| extension | String | No | File extension |
| mimeType | String | No | File MIME type |
| fileSize | Int | No | File size (bytes) |
| width | Int | Yes | Image width |
| height | Int | Yes | Image height |
| altText | String | Yes | Accessibility text |
| title | String | Yes | Media title |
| description | String | Yes | Description |
| folder | String | Yes | Virtual folder |
| storagePath | String | No | Storage location (canonical file location) |
| checksum | String | No | Duplicate detection |
| uploadedById | String | No | User who uploaded |
| createdAt | DateTime | No | Upload timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Relationships

Media

↓

belongs to

↓

User

(uploadedById)

Media may be referenced by:

- SiteSetting (logo, dark logo, favicon, default SEO image, QRIS image)
- SocialMedia (icon)
- Hero (background image)
- Tagline (icon)
- Event (featured image)
- EventCategory (icon)
- GalleryAlbum (cover image)
- GalleryPhoto (the photo itself)
- FinancialProgram (icon)
- DonationProgram (cover image)

---

## Constraints

- Stored file name must be unique.
- Checksum must be unique.

---

## Indexes

- uploadedById
- mimeType
- createdAt
- folder

---

# Upload Rules

Supported file types:

Images

- JPG
- JPEG
- PNG
- WEBP
- SVG

Future:

- PDF
- MP4
- DOCX

---

# File Naming

Stored file names should use generated unique names.

Example:

```
hero-homepage-8fa2b9.webp
```

Never rely on the original uploaded filename.

---

# CMS Usage

Administrators should be able to:

- Upload media
- Replace media
- Edit alt text
- Search media
- Filter by file type
- Delete unused media
- Copy media URL

---

# Reuse Policy

Media should be uploaded once.

The same media file may be reused by multiple modules.

Deleting a media file that is still referenced should be prevented.

---

# Homepage Rules

Homepage modules reference Media records instead of uploading separate files.

---

# Notes

The database stores metadata only.

Actual files are stored separately.

Development may use local storage.

Production should use persistent object storage.

---

# Future Expansion

Potential future enhancements include:

- Folder support
- Tags
- Bulk upload
- Drag-and-drop upload
- Image optimization
- Automatic WebP conversion
- Image cropping
- File versioning
- CDN integration