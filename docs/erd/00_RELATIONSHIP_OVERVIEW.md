# Database Relationship Overview

---

# Overview

This document describes the relationships between all database tables.

It serves as the reference before implementing the Prisma schema.

---

# Authentication

Role

1

↓

Many

↓

User

Each user is assigned exactly one role.

System roles are predefined and seeded during application setup.

Roles are not managed through the CMS.

---

# Hero

Hero

Optional

↓

Media

(backgroundImage)

Hero

↓

User

(createdBy, updatedBy)

---

# About

About

1

↓

Many

↓

Tagline

Tagline

Optional

↓

Media

(icon)

About

↓

User

(createdBy, updatedBy)

---

# Events

EventCategory

1

↓

Many

↓

Event

EventCategory

Optional

↓

Media

(icon)

Event

Optional

↓

Media

(featuredImage)

Event

↓

User

(createdBy, updatedBy)

---

# Gallery

GalleryAlbum

1

↓

Many

↓

GalleryPhoto

GalleryAlbum

Optional

↓

Event

GalleryAlbum

Optional

↓

Media

(coverImage)

GalleryAlbum

↓

User

(createdBy, updatedBy)

GalleryPhoto

↓

Media

---

# Financial

FinancialProgram

1

↓

Many

↓

FinancialReport

FinancialProgram

Optional

↓

Media

(icon)

FinancialReport

↓

User

(createdBy, updatedBy)

---

# Donation

DonationProgram

↓

Media

(optional, coverImage)

DonationProgram

↓

User

(createdBy, updatedBy)

Bank account and QRIS payment details live on SiteSetting, not on DonationProgram.

---

# Prayer

PrayerSetting

Singleton

No relations.

HijriOverride

↓

User

(createdBy)

---

# System

SiteSetting

↓

Media

Logo

Dark Logo

QRIS

Favicon

OG Image

ContactLocation

Singleton

No relations.

SocialMedia

↓

Media

Icon

AuditLog

↓

User

---

# Media

Media

Referenced by:

Hero

Tagline

Event

EventCategory

GalleryAlbum

GalleryPhoto

FinancialProgram

DonationProgram

SiteSetting

SocialMedia

User does not reference Media — there is no avatar/profile-image field on User.

---

# Shared Tables

Media

↓

Referenced by many modules

User

↓

Referenced by

Media (uploadedBy)

AuditLog (user)

Hero, About, Event, GalleryAlbum, DonationProgram (createdBy, updatedBy)

FinancialReport (createdBy, updatedBy)

HijriOverride (createdBy)

---

# Singleton Tables

PrayerSetting

SiteSetting

ContactLocation

---

# Draft & Publish

Hero

About

Event

GalleryAlbum

FinancialReport

DonationProgram
