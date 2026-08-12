# Gallery Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for the Gallery module.

The Gallery module stores photos of mosque activities and organizes them into albums.

Albums are displayed on the homepage and on the dedicated Gallery page.

---

# Objectives

The Gallery module should allow administrators to:

- Create gallery albums
- Upload multiple photos
- Edit album information
- Publish albums
- Feature albums on the homepage
- Reorder photos within an album

---

# Tables

This document defines:

- GalleryAlbum
- GalleryPhoto

---

# Table: GalleryAlbum

## Purpose

Stores gallery album information.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| title | String | No | Album title |
| slug | String | No | URL slug |
| description | Text | Yes | Album description |
| coverImageId | String | Yes | Album cover image |
| eventId | String | Yes | Related event |
| eventDate | Date | Yes | Activity date |
| isFeatured | Boolean | No | Featured on homepage |
| isPublished | Boolean | No | Published status |
| publishedAt | DateTime | Yes | Publish timestamp |
| sortOrder | Int | No | Display order |
| createdById | String | No | Creator |
| updatedById | String | No | Last editor |
| createdAt | DateTime | No | Creation timestamp |
| updatedAt | DateTime | No | Last update timestamp |

---

## Relationships

GalleryAlbum

↓

has many

↓

GalleryPhoto

GalleryAlbum

↓

optional

↓

Event

GalleryAlbum

↓

optional

↓

Media

(coverImageId)

GalleryAlbum

↓

belongs to

↓

User

(createdById, updatedById)

---

## Constraints

- Title is required.
- Slug must be unique.
- Featured albums must also be published.
- Every album must reference a creator and a last editor.

---

## Indexes

- slug (covered by the unique constraint)
- eventId
- isFeatured
- isPublished
- eventDate
- sortOrder

---

# Table: GalleryPhoto

## Purpose

Stores photos inside a gallery album.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| albumId | String | No | Related album |
| mediaId | String | No | Reference to Media |
| caption | String | Yes | Photo caption |
| altText | String | Yes | Accessibility text |
| sortOrder | Int | No | Display order |
| createdAt | DateTime | No | Creation timestamp |

---

## Relationships

GalleryPhoto

↓

belongs to

↓

GalleryAlbum

GalleryPhoto

↓

belongs to

↓

Media

---

## Constraints

- Every photo belongs to one album.
- Every photo references one media file.

---

## Indexes

- albumId
- mediaId
- sortOrder

---

# Publishing Rules

Only published albums appear on the public website.

Photos inherit the publication status of their album.

Individual photos do not require separate publishing.

---

# CMS Usage

Administrators should be able to:

- Create albums
- Edit albums
- Delete albums
- Upload multiple photos
- Reorder photos
- Set cover image
- Link album to an event
- Save draft
- Publish

---

# Homepage Rules

The homepage displays a maximum of **3 featured albums**.

If more than three albums are marked as featured, the system displays the three most recently published featured albums.

---

# Notes

Deleting an album should not automatically delete its media files.

Media remains available in the Media Library and can be reused elsewhere.

---

# Future Expansion

Potential future enhancements include:

- Video support
- Album categories
- Photo tags
- Photographer information
- Image watermark
- EXIF metadata
- Download restrictions