# API Specification

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the API architecture and communication standards for the Masjid Baitul Hikmah website.

The project primarily uses **Next.js Server Actions** for server-side operations instead of traditional REST APIs.

The goal is to provide a secure, maintainable, and consistent data flow between the frontend, backend, and database.

---

# Objectives

The API layer should:

- Handle business logic securely.
- Validate all incoming data.
- Protect sensitive operations.
- Maintain consistent response structures.
- Be reusable across CMS modules.
- Support future API integrations if needed.

---

# API Architecture

The application uses Server Actions as the primary backend interface.

Typical request flow:

```text
User

↓

Frontend Component

↓

Server Action

↓

Validation (Zod)

↓

Business Logic

↓

Prisma ORM

↓

Database

↓

Response

↓

UI Update
```

---

# Server Actions

Every CMS module should expose dedicated Server Actions.

Examples:

Hero

- createHero
- updateHero

Events

- createEvent
- updateEvent
- publishEvent
- deleteEvent

Gallery

- createAlbum
- uploadPhotos

Financial Reports

- createReport
- updateReport
- publishReport

---

# Request Validation

Every request must be validated before processing.

Validation is performed using:

- Zod

Validation occurs before:

- Database queries
- File uploads
- Authentication checks

---

# Authentication

Protected Server Actions require authentication.

Unauthenticated requests must be rejected.

Authentication is handled by:

- Auth.js

---

# Authorization

Protected actions must verify user permissions.

Examples:

Editor

✓ Update Hero

✗ Delete Users

Treasurer

✓ Update Financial Reports

✗ Manage Roles

Authorization must always occur on the server.

---

# Response Standard

Server Actions should return consistent responses.

Success

- success
- message
- data

Failure

- success
- message
- errors (optional)

Avoid exposing internal server details.

---

# Error Handling

Errors should be categorized.

Examples:

Validation Error

Authentication Error

Authorization Error

Database Error

Unexpected Error

User-facing messages should remain simple and understandable.

---

# File Upload

File uploads should:

- Validate file type.
- Validate file size.
- Store metadata in the Media Library.
- Prevent duplicate uploads where possible.

---

# Transactions

Operations affecting multiple tables should use database transactions.

Examples:

- Publishing financial reports.
- Uploading gallery photos.
- Assigning user roles.

---

# Logging

Important API operations should be recorded by the Audit Log module.

Examples:

- Create
- Update
- Delete
- Publish
- Restore

Read operations should generally not be logged.

---

# Security

The API layer must follow these principles:

- Server-side authorization
- Input validation
- Principle of least privilege
- Secure error handling
- Secure file uploads

Sensitive information must never be returned to the client.

---

# Performance

The API layer should prioritize:

- Efficient database queries
- Minimal payload size
- Reusable Server Actions
- Optimized file handling

---

# Future Expansion

Although the current project relies on Server Actions, the architecture should allow future integrations with:

- REST API
- External services
- Mobile applications
- Payment gateways
- Notification services

without major restructuring.