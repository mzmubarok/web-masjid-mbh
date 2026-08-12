# CMS Specification

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the overall Content Management System (CMS) architecture for the Masjid Baitul Hikmah website.

The CMS is designed to enable administrators to manage all website content without modifying source code.

Each CMS module follows a unified design system, permission model, validation strategy, and development standard.

Detailed specifications for individual modules are documented separately in the `/docs/modules` directory.

---

# Objectives

The CMS should:

- Be easy for non-technical administrators.
- Be modular and scalable.
- Maintain a consistent user experience.
- Provide secure content management.
- Support long-term maintenance.
- Minimize repetitive tasks.

---

# CMS Principles

The CMS follows these principles:

- Modular architecture
- Separation of concerns
- Reusable components
- Consistent user interface
- Role-based access control
- Auditability
- Security by default

---

# CMS Architecture

The CMS consists of multiple independent modules.

Each module manages a specific area of the website while sharing common infrastructure.

Example:

```text
CMS

├── Dashboard
├── Hero
├── About
├── Events
├── Gallery
├── Financial Reports
├── Donation Programs
├── Prayer Settings
├── Hijri Override
├── Media Library
├── Site Settings
├── Contact & Location
├── Social Media
├── Users
├── Roles & Permissions
└── Audit Log
```

---

# Module Standard

Every module should follow the same architecture.

Each module should define:

- Purpose
- Objectives
- Database
- Fields
- Validation
- CMS Features
- Permissions
- Server Actions
- UI Components
- Loading State
- Empty State
- Error State
- Security
- Performance
- Future Improvements

---

# CRUD Standard

Every content module should support:

- Create
- Read
- Update
- Delete

Modules that should preserve historical records should implement Soft Delete instead of permanent deletion.

---

# Draft & Publish Workflow

Content should not be published immediately.

Workflow:

```text
Draft

↓

Preview

↓

Publish
```

Published content becomes publicly visible.

Draft content remains accessible only within the CMS.

---

# Validation

All user input must be validated.

Validation occurs in two stages:

Frontend

- Immediate feedback

Backend

- Final validation before saving

Validation should be implemented using Zod.

---

# Authentication

Administrator authentication is managed by Auth.js.

Only authenticated users may access the CMS.

Unauthenticated users are redirected to the login page.

---

# Authorization

The CMS implements Role-Based Access Control (RBAC).

Every request must verify:

- Authentication
- User Role
- Permission

Permissions are enforced on the server.

---

# Audit Logging

Important administrator actions must be recorded automatically.

Examples:

- Create
- Update
- Delete
- Publish
- Restore
- Login
- Logout

Audit logs are immutable.

---

# Media Management

All uploaded assets should be managed through the Media Library.

Modules should reference media instead of uploading duplicate files.

---

# Tables

Every management table should support:

- Search
- Pagination
- Sorting
- Filtering
- Responsive layout

---

# Form Standard

All forms should provide:

- Client validation
- Server validation
- Loading state
- Success notification
- Error notification
- Confirmation for destructive actions

---

# Status Standard

Where applicable, content should support:

- Draft
- Published
- Archived

Status should be displayed consistently throughout the CMS.

---

# UI Standard

The CMS should use a consistent design system.

Common components include:

- Cards
- Tables
- Forms
- Dialogs
- Drawers
- Tabs
- Toast Notifications
- Skeleton Loaders

---

# Responsive Design

The CMS must function correctly on:

- Desktop
- Tablet
- Mobile

---

# Security

The CMS should follow these principles:

- Least privilege
- Server-side authorization
- Input validation
- Secure authentication
- Secure file handling

Sensitive information must never be exposed to the client.

---

# Performance

The CMS should prioritize:

- Optimized database queries
- Server Components where appropriate
- Lazy loading
- Efficient caching
- Code splitting

---

# Module Documentation

Detailed specifications for each module are maintained separately.

See:

```text
/docs/modules/
```

---

# Future Expansion

The CMS architecture should support future modules without major restructuring.

Potential future modules include:

- Visitor Analytics
- Volunteer Management
- Announcement Center
- Newsletter
- Payment Gateway
- Attendance System
- Inventory Management