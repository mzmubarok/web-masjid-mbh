# Dashboard Module

**Version:** 1.0  
**Status:** Planning

---

# Purpose

The Dashboard is the main landing page after an administrator logs into the CMS.

Its primary purpose is to provide a quick overview of the website status and shortcuts to frequently used modules.

The dashboard should prioritize clarity, simplicity, and actionable information.

---

# Objectives

The dashboard should allow administrators to:

- View important website statistics.
- Quickly access common management tasks.
- Monitor recent activities.
- Identify pending actions.
- Navigate efficiently to other CMS modules.

---

# Dashboard Widgets

The dashboard consists of several widgets.

---

## Welcome Card

Displays:

- Welcome message
- Administrator name
- Current date
- Current Hijri date

---

## Quick Statistics

Display summary cards for:

- Total Events
- Total Gallery Albums
- Total Media Files
- Total Financial Reports
- Published Pages
- Draft Content

Each card should display:

- Icon
- Title
- Count

---

## Recent Activities

Display the latest audit log entries.

Information:

- User
- Action
- Module
- Date & Time

Example

Admin updated Hero section.

Editor published Event.

---

## Upcoming Events

Display upcoming mosque events.

Information:

- Event title
- Date
- Time
- Category

Maximum:

5 items

---

## Financial Summary

Display latest financial summaries.

For each donation category:

- Operational Donation
- Mosque Development Donation
- S3 (Sehari Seribu Saja)

Display:

- Current Balance
- Last Updated

This section is read-only.

---

## Prayer Information

Display today's prayer schedule.

Display:

- Fajr
- Dhuhr
- Asr
- Maghrib
- Isha

Display current Hijri date.

---

## Quick Actions

Provide shortcuts to common actions.

Examples:

- Create Event
- Upload Gallery
- Update Hero
- Add Financial Report
- Upload Media

---

# Permissions

Accessible by:

- Super Admin
- Admin
- Editor

Displayed widgets may vary depending on user permissions.

---

# Dashboard Personalization

The dashboard should adapt based on the authenticated user's role.

Examples:

Super Admin

- Full dashboard

Admin

- Content management dashboard

Treasurer

- Financial dashboard

Editor

- Content editing dashboard

Only relevant widgets and quick actions should be displayed.
---

# Database

The dashboard does not require its own table.

It aggregates information from:

- Event
- Gallery
- FinancialReport
- AuditLog
- Media
- PrayerSetting

---

# Server Actions

No CRUD operations.

Only read operations.

---

# Performance

Dashboard data should load efficiently.

Heavy queries should be optimized.

Future versions may introduce caching.

---

# Widget Independence

Each dashboard widget should load independently.

If one widget fails, the remaining widgets should continue functioning normally.

Example:

✓ Upcoming Events

✓ Prayer Information

✗ Financial Summary

✓ Recent Activities

The failure of one widget must not prevent the dashboard from rendering.

---

# UI Components

Dashboard should use:

- Cards
- Statistics Cards
- Tables
- Badges
- Buttons
- Skeleton Loaders
- Empty States

---

# Responsive Behavior

Desktop

Two or three-column layout.

Tablet

Two-column layout.

Mobile

Single-column layout.

---

# Empty States

Display friendly messages when no data is available.

Examples:

No upcoming events.

No recent activities.

No financial reports.

---

# Loading States

Display skeleton components while loading.

Avoid layout shifts.

---

# Error States

Display friendly messages.

Provide retry actions whenever possible.

---

# Security

Dashboard widgets must respect user permissions.

Users must never see:

- Restricted statistics
- Unauthorized quick actions
- Data from modules they cannot access

---

# Future Improvements

Potential future enhancements include:

- Monthly analytics
- Visitor statistics
- Google Analytics integration
- Financial charts
- Attendance charts
- Recent login history
- System health monitoring