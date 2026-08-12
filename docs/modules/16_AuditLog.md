# Audit Logs Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Audit Logs Module records all significant activities performed within the CMS.

Its primary purpose is to improve accountability, security, and traceability by providing a complete history of administrator actions.

Audit logs cannot be edited or deleted through the CMS.

---

# Objectives

The module should allow administrators to:

- View activity history.
- Search logs.
- Filter logs.
- Investigate changes.
- Export activity reports.

The module is intended for monitoring only.

---

# Database

## Tables

- AuditLog

---

# Audit Log Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| userId | Relation | Yes | User performing the action |
| module | String | Yes | CMS module |
| action | Enum | Yes | Action performed |
| entityType | String | Yes | Affected resource |
| entityId | String | Yes | Resource identifier |
| description | Text | No | Human-readable summary |
| oldValue | JSON | No | Previous values |
| newValue | JSON | No | Updated values |
| ipAddress | String | No | Client IP |
| userAgent | String | No | Browser information |
| createdAt | DateTime | Yes | Timestamp |

---

# Supported Actions

Examples:

- Login
- Logout
- Create
- Update
- Delete
- Publish
- Unpublish
- Restore
- Activate
- Deactivate

---

# Logged Modules

The system should log activity from all CMS modules, including:

- Dashboard
- Hero
- About
- Events
- Gallery
- Financial Reports
- Donation Programs
- Prayer Settings
- Hijri Override
- Media Library
- Site Settings
- Contact & Location
- Social Media
- Users
- Roles

---

# Validation Rules

User

- Required

Module

- Required

Action

- Required

Description

- Optional at the database level; the system should always populate one in practice

Timestamp

Automatically generated.

---

# CMS Features

Administrators can:

- View logs
- Search logs
- Filter logs
- Sort logs
- Export logs

Logs cannot be modified.

Logs cannot be deleted through the CMS.

---

# Search

Support searching by:

- User
- Module
- Description

---

# Filters

Support filtering by:

- Module
- User
- Action
- Date Range

---

# Sorting

Sort by:

- Newest
- Oldest

Default:

Newest First

---

# Export

Support exporting:

- CSV
- Excel
- PDF

Export respects active filters.

---

# Detail View

Each log entry displays:

- User
- Action
- Module
- Timestamp
- Description
- Before Changes
- After Changes
- IP Address
- Browser Information

---

# Admin Interface

Display:

- User
- Module
- Action
- Description
- Date

Support:

- Search
- Filter
- Pagination
- Export

---

# Server Actions

- getAuditLogs()
- exportAuditLogs()

Audit logs are generated automatically.

There are no:

- createAuditLog()
- updateAuditLog()
- deleteAuditLog()

These actions are handled internally by the application.

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | View Only |
| Editor | No Access |
| Treasurer | View Own Activities Only |

---

# Audit Log

The Audit Logs Module does not generate logs about itself to avoid recursive logging.

---

# UI Components

- Data Table
- Badge
- Date Range Picker
- Search
- Filter
- Export Button
- Detail Drawer

---

# Loading State

Display skeleton rows while logs are loading.

---

# Empty State

"No audit logs found."

---

# Error State

Display loading and export errors.

---

# Responsive Behavior

Desktop

Table layout.

Tablet

Compact table.

Mobile

Card layout.

---

# Security

Audit logs are immutable.

Only the application may create log entries.

Logs cannot be edited or deleted through the CMS.

Sensitive data such as passwords and authentication tokens must never be stored in audit logs.

---

# Performance

Use database indexes:

- createdAt
- userId
- module
- action

Support server-side pagination.

Archive old logs if necessary.

---

# Future Improvements

Potential future enhancements include:

- Login history dashboard
- Security alerts
- Suspicious activity detection
- Email notifications
- Real-time activity stream
- SIEM integration