# Media Library Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Media Library Module serves as the central repository for all media assets used throughout the website.

Instead of uploading files repeatedly, administrators upload media once and reuse it across multiple modules.

The Media Library should support images, documents, and future media types while maintaining consistency, organization, and storage efficiency.

---

# Objectives

The module should allow administrators to:

- Upload media.
- Organize media.
- Search media.
- Reuse existing files.
- Replace files.
- View file usage.
- Delete unused media safely.

---

# Supported Media Types

Images

- JPG
- JPEG
- PNG
- WEBP
- SVG

Documents

- PDF
- XLS
- XLSX

Future

- DOCX
- PPTX
- MP4
- MP3

---

# Database

## Tables

- Media

---

# Media Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| fileName | String | Yes | Original filename |
| storedFileName | String | Yes | Internal filename |
| mimeType | String | Yes | MIME type |
| extension | String | Yes | File extension |
| fileSize | Integer | Yes | Size in bytes |
| width | Integer | No | Image width |
| height | Integer | No | Image height |
| altText | String | No | Accessibility text |
| title | String | No | Media title |
| description | Text | No | Description |
| folder | String | No | Virtual folder |
| storagePath | String | Yes | Storage location |
| checksum | String | Yes | Duplicate detection |
| uploadedBy | User | Yes | Uploader |
| createdAt | DateTime | Yes | Upload timestamp |
| updatedAt | DateTime | Yes | Last update |

---

# Storage

Media files should be stored outside the database.

Recommended structure:

uploads/

images/

documents/

temporary/

Future storage providers:

- Local Storage
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces

---

# Validation Rules

Images

Maximum:

10 MB

Documents

Maximum:

25 MB

Allowed MIME types only.

Reject executable files.

---

# Duplicate Detection

Before storing a file:

- Calculate checksum.
- Compare with existing files.

If an identical file already exists:

Offer:

Use Existing File

instead of uploading again.

---

# CMS Features

Administrators can:

- Upload files
- Replace files
- Rename media title
- Edit alt text
- Move folders
- Delete files
- Download files
- Copy public URL

---

# Folder Organization

Support virtual folders.

Example:

Hero

Events

Gallery

QRIS

Financial Reports

Documents

Logos

Icons

---

# Search

Support searching by:

- Title
- Filename
- Folder
- Type
- Upload date

---

# Filtering

Filter by:

- Images
- Documents
- Upload date
- Folder

---

# Sorting

Sort by:

- Newest
- Oldest
- Name
- Size

---

# Media Picker

Every CMS module should use the same Media Picker.

Example:

Hero Image

↓

Choose Existing Media

or

Upload New Media

---

# Usage Tracking

Each media item should display where it is currently used.

Example:

Used In

- Hero
- About
- Gallery Album
- Event
- Donation Program

This helps administrators avoid deleting files that are still in use.

---

# Safe Delete

Before deleting media:

Check usage.

If media is still referenced:

Prevent deletion.

Display:

"This file is currently used by 3 modules."

---

# Image Optimization

Automatically generate:

Thumbnail

Medium

Large

Original

Use responsive images on the frontend.

---

# Metadata

Automatically detect:

- Width
- Height
- File size
- MIME type
- Upload date

---

# Admin Interface

Library

- Grid View
- List View

Upload

- Drag & Drop
- Multi Upload

Media Detail

- Preview
- Metadata
- Usage
- Replace File

---

# Server Actions

- uploadMedia()
- updateMedia()
- replaceMedia()
- deleteMedia()
- searchMedia()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | Upload / Edit |

---

# Audit Log

- Uploaded Media
- Updated Media
- Replaced Media
- Deleted Media

---

# UI Components

- Media Grid
- List View
- Upload Area
- Drag & Drop
- Preview Modal
- Search
- Filter
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton thumbnails while loading.

---

# Empty State

"No media files available."

Button:

Upload Media

---

# Error State

Display upload and validation errors.

---

# Responsive Behavior

Desktop

Grid and List View.

Tablet

Compact grid.

Mobile

Single-column grid.

---

# Security

Only authenticated administrators may upload media.

Prevent execution of uploaded files.

Validate MIME type.

Generate randomized stored filenames.

---

# Performance

Lazy-load thumbnails.

Optimize uploaded images.

Generate thumbnails asynchronously.

Cache frequently accessed media.

Database indexes:

- uploadedById
- mimeType
- folder
- createdAt

---

# Future Improvements

Potential future enhancements include:

- Cloud Storage
- AI-generated alt text
- AI image tagging
- Bulk image optimization
- Version history
- Media expiration
- CDN integration