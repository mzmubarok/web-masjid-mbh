# Events Module

**Version:** 1.0  
**Status:** Planning

---

# Purpose

The Events Module manages all mosque activities displayed on the homepage and the dedicated Events page.

Administrators can create, update, publish, archive, and organize mosque events without modifying the source code.

---

# Objectives

The module should allow administrators to:

- Create new events.
- Edit existing events.
- Publish events.
- Archive completed events.
- Feature selected events on the homepage.
- Organize events using customizable categories.
- Display event details on a dedicated page.

---

# Database

## Tables

- Event
- EventCategory

---

## Relationships

```text
EventCategory (1)
      │
      └───────────────< Event (Many)
```

Each event belongs to one category.

A category may contain many events.

---

# Event Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| title | String | Yes | Event title |
| slug | String | Yes | SEO-friendly URL |
| excerpt | Text | Yes | Short description shown on homepage |
| description | Rich Text | Yes | Full event description |
| featuredImageId | Media | No | Cover image |
| categoryId | EventCategory | Yes | Event category |
| location | String | Yes | Event location |
| startDate | Date | Yes | Event date |
| endDate | Date | No | End date for multi-day events |
| startTime | Time | Yes | Start time |
| endTime | Time | No | End time |
| isFeatured | Boolean | Yes | Display on homepage |
| isPublished | Boolean | Yes | Published status |
| publishedAt | DateTime | No | Publish timestamp |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |
| createdBy | User | Yes | Creator |
| updatedBy | User | Yes | Last editor |

---

# Event Category Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| name | String | Yes | Category name |
| slug | String | Yes | URL slug |
| color | String | No | Badge color |
| iconId | Media | No | Optional category icon |
| sortOrder | Integer | Yes | Display order |
| isActive | Boolean | Yes | Enable or disable category |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

---

# Validation Rules

## Event

Title

- Required
- Maximum 120 characters

Slug

- Required
- Unique
- Auto-generated
- Editable

Excerpt

- Required
- Maximum 250 characters

Description

- Required

Location

- Required

Start Date

- Required

Start Time

- Required

Featured Image

Allowed:

- JPG
- PNG
- WEBP

Maximum size:

10 MB

---

## Category

Name

- Required
- Unique

Slug

- Unique

Color

- Optional

Sort Order

- Integer

---

# CMS Features

## Event Management

Administrators can:

- Create event
- Edit event
- Delete event
- Archive event
- Save draft
- Preview
- Publish
- Feature event

---

## Category Management

Administrators can:

- Create category
- Edit category
- Delete category
- Reorder categories
- Enable or disable category

---

# Homepage Display

Display a maximum of **three featured events**.

Each event card contains:

- Featured image
- Title
- Date
- Time
- Location
- Category badge

The "View All Events" button opens the Events page.

---

# Events Page

Display all published events.

Support:

- Search
- Category filter
- Pagination
- Sort by newest
- Sort by upcoming
- Sort alphabetically

Each event links to its detail page.

---

# Event Detail Page

Display:

- Cover image
- Title
- Category
- Date
- Time
- Location
- Full description
- Related events

---

# Admin Interface

The module should contain two management pages.

## Events

Display:

- Data table
- Search
- Filter
- Pagination
- Create Event button

---

## Categories

Display:

- Category list
- Color badge
- Sort order
- Enable / Disable toggle

---

# Event Editor

Sections:

## General

- Title
- Slug
- Category

---

## Schedule

- Date
- Time

---

## Location

- Location

---

## Content

- Rich Text Editor

---

## Media

- Featured Image Picker

---

## Publishing

- Save Draft
- Preview
- Publish

---

# Server Actions

## Events

- createEvent()
- updateEvent()
- deleteEvent()
- archiveEvent()
- publishEvent()

---

## Categories

- createEventCategory()
- updateEventCategory()
- deleteEventCategory()
- reorderEventCategories()

---

# Permissions

| Role | Events | Categories |
|------|--------|------------|
| Super Admin | Full | Full |
| Admin | Full | Full |
| Editor | Create / Update / Publish | View Only |

---

# Audit Log

Log the following actions:

## Events

- Event created
- Event updated
- Event published
- Event archived
- Event deleted

## Categories

- Category created
- Category updated
- Category deleted
- Category reordered

---

# UI Components

- Data Table
- Card
- Rich Text Editor
- Media Picker
- Calendar Picker
- Time Picker
- Badge
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while loading events and categories.

---

# Empty State

Events

"No events have been created."

Button:

Create Event

Categories

"No categories available."

Button:

Create Category

---

# Error State

Display clear validation and upload errors.

Provide retry actions where appropriate.

---

# Responsive Behavior

Desktop

- Table layout

Tablet

- Compact table

Mobile

- Card layout

---

# Security

Only authenticated users with appropriate permissions may manage events.

Only published events are visible on the public website.

Inactive categories should not appear in category selection for new events.

---

# Performance

Homepage should query only featured published events.

Implement pagination for large datasets.

Optimize event images.

Use indexed fields for:

- slug
- startDate
- categoryId
- isPublished
- isFeatured

---

# Future Improvements

Potential future enhancements include:

- Recurring events
- RSVP registration
- Event reminders
- Google Calendar integration
- QR Code check-in
- Attendance tracking
- Speaker management
- Registration limits
- Live streaming links
- Event attachments