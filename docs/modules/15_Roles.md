# Roles

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Roles & Permissions Module manages access control across the CMS.

It determines what each user is allowed to view, create, update, publish, or delete.

The module uses a Role-Based Access Control (RBAC) architecture, allowing permissions to be managed centrally.

---

# Objectives

The module should allow administrators to:

- Create roles.
- Assign permissions.
- Edit permissions.
- Activate or deactivate roles.
- Assign roles to users.
- Prevent unauthorized access.

---

# Database

## Tables

- Role

`Permission` and `RolePermission` are not yet implemented in the schema — the current
system authorizes by Role only. The Permission Matrix / per-action permission features
described below are forward-looking design intent, not current behavior.

---

## Relationships

Role

↓

has many

↓

User

---

# Role Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| name | String | Yes | Role name |
| description | Text | No | Role description |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

`isSystem` and `isActive` are not yet implemented on Role — see `01_AUTH.md` → Future Expansion.

---

# Permission Fields (Future — table not yet implemented)

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| module | String | Yes | CMS module |
| action | Enum | Yes | Permission action |
| description | Text | No | Description |

---

# Supported Actions

Each module supports:

- View
- Create
- Update
- Delete
- Publish

Example:

Event

↓

View

Create

Update

Delete

Publish

---

# Validation Rules

Role Name

- Required
- Unique

Permission

- Required

---

# System Roles

The CMS includes three default roles.

## Super Admin

Full access to every module.

Cannot be restricted.

---

## Admin

Can manage website content.

Cannot manage:

- Users
- Roles
- System Configuration

---

## Editor

Content only.

Cannot:

- Publish
- Delete
- Access Settings

---

# CMS Features

Administrators can:

- Create custom roles
- Edit permissions
- Activate roles
- Deactivate roles
- View assigned users

System roles cannot be deleted.

---

# Permission Matrix

Permissions are displayed in a matrix.

Example:

| Module | View | Create | Update | Delete | Publish |
|--------|------|--------|--------|--------|---------|
| Hero | ✓ | ✓ | ✓ | ✓ | ✓ |
| Event | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gallery | ✓ | ✓ | ✓ | ✓ | ✓ |
| Financial | ✓ | ✓ | ✓ | ✓ | ✓ |

Checkboxes determine access.

---

# Permission Groups

Modules include:

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
- Audit Logs

---

# Admin Interface

Display:

- Role Name
- Assigned Users
- Status
- Created Date

Support:

- Search
- Filter
- Pagination

---

# Role Editor

General

- Name
- Description

Permissions

- Permission Matrix

Publishing

- Active
- Inactive

---

# Server Actions

- createRole()
- updateRole()
- activateRole()
- deactivateRole()

Permissions

- updateRolePermissions()

---

# Permissions

| Role | Manage Roles |
|------|---------------|
| Super Admin | Full |
| Admin | No Access |
| Editor | No Access |

---

# Audit Log

Log:

- Role Created
- Role Updated
- Permission Updated
- Role Activated
- Role Deactivated

---

# UI Components

- Permission Matrix
- Checkbox
- Badge
- Data Table
- Search
- Filter
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton tables while permissions are loading.

---

# Empty State

"No roles available."

Button:

Create Role

---

# Error State

Display validation and permission errors.

---

# Responsive Behavior

Desktop

Permission matrix.

Tablet

Scrollable matrix.

Mobile

Accordion layout.

---

# Security

Every CMS page must verify permissions before rendering.

Hidden menus are not sufficient.

Permissions must also be validated on the server.

---

# Performance

Cache permissions after login.

Invalidate cache when role permissions change.

Database indexes:

- roleName
- module
- action

---

# Future Improvements

Potential future enhancements include:

- Temporary roles
- Time-based permissions
- Department-based permissions
- Multi-site permissions
- Permission templates
- Role cloning