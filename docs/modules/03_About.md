# About Module

**Version:** 1.0  
**Status:** Planning

---

# Purpose

The About Module manages all content displayed in the "About" section of the homepage as well as the dedicated About page.

This module centralizes the mosque introduction, history, vision, mission, and the mosque's three core values (Taglines).

Administrators should be able to update all About-related content without modifying the source code.

---

# Objectives

The module should allow administrators to:

- Update the mosque introduction.
- Update the mosque history.
- Update the vision.
- Update the mission.
- Manage the three core values (Taglines).
- Update the dedicated About page content.
- Preview changes.
- Save drafts.
- Publish updates.

---

# Database

## Tables

- About
- Tagline

Taglines are stored in their own table, one row per core value, each pointing back to its
About record via `aboutId` — not as flattened `taglineOne`/`Two`/`Three` columns on About.
The number of taglines is not hard-limited to three at the database level, though the CMS
currently only surfaces three core-value cards.

---

# Fields

## General Information

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| introduction | Text | Yes | Homepage introduction |
| history | Text | Yes | Mosque history |
| vision | Text | Yes | Vision statement |
| mission | Text | Yes | Mission statement |
| aboutPageContent | Text | No | Full About page content |

---

## Taglines (Tagline table)

One row per core value.

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| aboutId | Relation | Yes | Parent About record |
| title | String | Yes | Tagline title |
| description | Text | Yes | Tagline description |
| iconId | Media | No | Tagline icon |
| sortOrder | Integer | Yes | Display order (unique within the same About record) |

---

## System Fields

| Field | Type |
|--------|------|
| isPublished | Boolean |
| publishedAt | DateTime |
| createdAt | DateTime |
| updatedAt | DateTime |
| createdBy | User |
| updatedBy | User |

---

# Validation Rules

## Introduction

- Required
- Maximum 500 characters

---

## History

- Required

---

## Vision

- Required

---

## Mission

- Required

---

## Taglines

Each tagline must contain:

- Title (Required)
- Description (Required)

Icons are optional.

---

# CMS Features

Administrators can:

- Edit introduction
- Edit history
- Edit vision
- Edit mission
- Edit three taglines
- Save Draft
- Preview
- Publish

Only one About page may be published.

---

# Public Website

The homepage displays:

- Introduction
- History (summary)
- Vision
- Mission

Three Core Values:

- Mengaji
- Mengabdi
- Menghidupi

The "Tentang Masjid" button opens the dedicated About page containing the complete content.

---

# Admin Interface

The CMS should be divided into logical sections.

## General

- Introduction
- History

---

## Vision & Mission

- Vision
- Mission

---

## Core Values

Three editable cards.

Each card contains:

- Icon Picker
- Title
- Description

---

## About Page

Rich Text Editor

---

## Publish

- Save Draft
- Preview
- Publish

---

# Server Actions

- updateAbout()
- publishAbout()

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

- About updated
- Tagline updated
- About published

---

# UI Components

- Cards
- Rich Text Editor
- Media Picker
- Preview Panel
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while loading content.

---

# Empty State

Display:

"No About content has been created."

Provide a button:

Create About Content

---

# Error State

Display user-friendly validation errors.

---

# Responsive Behavior

Desktop

Two-column layout.

Mobile

Single-column layout.

---

# Security

Only authenticated users with appropriate permissions may edit About content.

---

# Performance

Optimize images before rendering.

Lazy-load icons when appropriate.

---

# Future Improvements

Potential future enhancements include:

- Multiple language support
- Timeline layout
- Video introduction
- Rich media content
- Expandable core values