# Gallery Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Gallery Module manages all photo galleries displayed on the website.

Photos are organized into albums, allowing visitors to browse mosque activities in a structured and visually appealing way.

Administrators can create albums, upload photos, organize media, and publish galleries without modifying the source code.

---

# Objectives

The module should allow administrators to:

- Create gallery albums.
- Upload multiple images.
- Organize photos within albums.
- Select cover images.
- Feature albums on the homepage.
- Publish or archive albums.

---

# Database

## Tables

- GalleryAlbum
- GalleryPhoto

---

## Relationships

GalleryAlbum (1)

↓

GalleryPhoto (Many)

---

# Gallery Album Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| title | String | Yes | Album title |
| slug | String | Yes | URL slug |
| description | Text | No | Album description |
| coverImageId | Media | No | Album cover |
| eventId | Event | No | Related event |
| eventDate | Date | No | Gallery date |
| isFeatured | Boolean | Yes | Display on homepage |
| sortOrder | Integer | Yes | Display order |
| isPublished | Boolean | Yes | Published status |
| publishedAt | DateTime | No | Publish timestamp |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |
| createdBy | User | Yes | Creator |
| updatedBy | User | Yes | Last editor |

---

# Gallery Photo Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| albumId | Relation | Yes | Parent album |
| mediaId | Media | Yes | Uploaded image |
| caption | String | No | Optional caption |
| altText | String | No | Accessibility text |
| sortOrder | Integer | Yes | Display order |
| createdAt | DateTime | Yes | Created timestamp |

---

# Validation Rules

Album Title

- Required
- Maximum 120 characters

Slug

- Required
- Unique

Gallery Date

- Required

Photos

Allowed formats:

- JPG
- JPEG
- PNG
- WEBP

Maximum size:

10 MB per image

---

# CMS Features

## Album Management

Administrators can:

- Create album
- Edit album
- Delete album
- Save draft
- Publish
- Archive
- Reorder albums
- Mark album as featured

---

## Photo Management

Administrators can:

- Upload multiple photos
- Drag and drop reorder
- Replace photo
- Delete photo
- Edit caption
- Edit alt text
- Select album cover

---

# Homepage

Display only featured albums.

Each gallery card contains:

- Cover photo
- Album title
- Gallery date
- Total photos

Display a maximum of three featured albums.

The "View All Galleries" button opens the complete gallery page.

---

# Gallery Page

Display all published albums.

Support:

- Search
- Pagination
- Sort by newest
- Sort alphabetically
- Filter by year

---

# Album Detail Page

Display:

- Album title
- Gallery date
- Description
- Image grid
- Lightbox viewer
- Previous / Next navigation

---

# Admin Interface

## Albums

Display:

- Data Table
- Search
- Filters
- Pagination

---

## Album Editor

General

- Title
- Slug
- Description
- Date

Media

- Cover Photo
- Photo Upload

Publishing

- Featured
- Draft
- Publish

---

# Server Actions

Albums

- createGalleryAlbum()
- updateGalleryAlbum()
- publishGalleryAlbum()
- archiveGalleryAlbum()
- deleteGalleryAlbum()

Photos

- uploadGalleryPhotos()
- reorderGalleryPhotos()
- updateGalleryPhoto()
- deleteGalleryPhoto()

---

# Permissions

| Role | Albums | Photos |
|------|---------|---------|
| Super Admin | Full | Full |
| Admin | Full | Full |
| Editor | Create / Update | Create / Update |

---

# Audit Log

Albums

- Created
- Updated
- Published
- Archived
- Deleted

Photos

- Uploaded
- Deleted
- Reordered
- Updated

---

# UI Components

- Data Table
- Card
- Media Picker
- Drag & Drop Grid
- Lightbox Preview
- Badge
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while gallery data is loading.

---

# Empty State

Albums

"No gallery albums have been created."

Button:

Create Album

---

# Error State

Display clear validation and upload errors.

---

# Responsive Behavior

Desktop

Grid layout.

Tablet

Two-column grid.

Mobile

Single-column cards.

---

# Security

Only authenticated administrators may manage gallery content.

Only published albums are visible on the public website.

---

# Performance

Generate optimized image thumbnails.

Lazy-load gallery images.

Serve responsive image sizes.

Use database indexes for:

- slug
- eventDate
- isPublished
- isFeatured
- sortOrder

---

# Future Improvements

Potential future enhancements include:

- Video gallery
- Panorama support
- Album sharing
- Download album
- Image watermark
- EXIF metadata viewer
- AI-generated image descriptions