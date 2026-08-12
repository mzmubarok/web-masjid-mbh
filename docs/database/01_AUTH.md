# Authentication Database

**Version:** 1.1  
**Status:** Planning

---

# Overview

This document defines the authentication and authorization database structure for the Masjid Baitul Hikmah CMS.

The authentication system is responsible for:

- Administrator login
- Role management
- Access control

Only administrators can access the CMS.

Public visitors do not require authentication.

---

# Objectives

The authentication system should:

- Secure administrator access.
- Support Role-Based Access Control (RBAC).
- Be scalable for future roles.
- Maintain auditability.
- Integrate with Auth.js.

---

# Tables

This document defines the following tables:

- User
- Role

---

# Table: User

## Purpose

Stores administrator accounts that can access the CMS.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| name | String | No | Administrator full name |
| email | String | No | Login email |
| passwordHash | String | No | Encrypted password |
| roleId | String | No | Assigned role |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

User

↓

belongs to

↓

Role

User

↓

referenced by

↓

Media, AuditLog, Hero, About, Event, GalleryAlbum, HijriOverride, FinancialReport, DonationProgram

(as uploader, actor, or creator/editor — see each domain's own database document)

---

## Constraints

- Email must be unique.
- Every user must have exactly one role.
- Password must always be hashed.
- Users cannot exist without a role.

---

## Indexes

- email (covered by the unique constraint)
- roleId

---

## Notes

`avatarId`, `isActive`, and `lastLoginAt` are not currently implemented — the User table
stores only the fields listed above.

---

# Table: Role

## Purpose

Stores administrator roles.

---

## Default Roles

- Super Admin
- Admin
- Treasurer
- Editor

Future roles may be added without database changes.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| name | String | No | Role name |
| description | String | Yes | Role description |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

Role

↓

has many

↓

Users

---

## Constraints

Role name must be unique.

---

## Indexes

- name (covered by the unique constraint)

---

# Authentication Flow

```text
Administrator

↓

Login

↓

Auth.js

↓

Session Created

↓

Load User

↓

Load Role

↓

Access CMS
```

---

# Authorization Strategy

Every protected request must verify:

1. User exists.
2. User has a role.

Authorization must always occur on the server.

---

# Future Expansion

Potential future additions include:

- Permission / RolePermission tables for granular, per-action access control
  (the current implementation authorizes by Role only, with no Permission table yet)
- `isSystem` / `isActive` flags on Role
- `isActive`, `avatarId`, and `lastLoginAt` on User
- Two-Factor Authentication (2FA)
- Password Reset
- Login History
- Email Verification
- OAuth Providers
- Session Management
- API Tokens

---

# Notes

The schema also defines a separate `Admin` table (`id`, `name`, `email`, `passwordHash`,
`createdAt`, `updatedAt`) that predates the Role-based `User` model above. `Admin` has no
role relation and is not part of the RBAC design described in this document.
