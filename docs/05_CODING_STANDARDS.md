# Coding Standards

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the coding standards for the Masjid Baitul Hikmah website.

The purpose of these standards is to ensure that the codebase remains clean, consistent, maintainable, and scalable as the project grows.

All contributors should follow these conventions.

---

# Development Principles

The project follows these principles:

- Readability over cleverness
- Simplicity over complexity
- Reusability over duplication
- Composition over inheritance
- Consistency over personal preference

Code should be easy to understand by future developers.

---

# Technology Stack

Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Server Actions
- Prisma ORM

Validation

- Zod

---

# Folder Structure

The project should maintain a consistent folder structure.

Example:

```text
app/
components/
features/
lib/
prisma/
public/
types/
utils/
docs/
```

Feature-specific logic should remain inside its respective feature folder.

---

# Naming Conventions

## Files

Use kebab-case.

Examples:

hero-form.tsx

event-card.tsx

financial-report-table.tsx

---

## Components

Use PascalCase.

Examples:

HeroCard

EventForm

GalleryGrid

---

## Functions

Use camelCase.

Examples:

createEvent()

updateHero()

publishReport()

---

## Variables

Use descriptive camelCase.

Avoid abbreviations whenever possible.

Good:

currentBalance

eventCategory

Bad:

cb

ev

---

## Constants

Use UPPER_SNAKE_CASE.

Examples:

MAX_FILE_SIZE

DEFAULT_PAGE_SIZE

SUPPORTED_IMAGE_TYPES

---

## Types & Interfaces

Use PascalCase.

Examples:

User

Event

FinancialReport

HeroFormData

---

# Component Standards

Components should have a single responsibility.

Avoid components that manage unrelated functionality.

Prefer composition over large monolithic components.

---

# Server Actions

Each Server Action should:

- Perform one responsibility.
- Validate input first.
- Handle authorization.
- Return consistent responses.
- Avoid UI logic.

Business logic should remain independent of presentation.

---

# Database Access

Database queries should be performed through Prisma.

Avoid raw SQL unless absolutely necessary.

Keep queries efficient and readable.

---

# Validation

Use Zod for all validation.

Validation should occur before:

- Database access
- File upload
- Business logic

---

# Error Handling

Handle errors consistently.

Avoid exposing internal implementation details.

Provide meaningful messages for users.

Log unexpected errors appropriately.

---

# Comments

Write self-explanatory code.

Use comments only when necessary to explain complex business logic.

Avoid redundant comments.

Bad:

// Increment count

count++

Good:

// Recalculate donation balance after importing monthly spreadsheet.

---

# Imports

Organize imports consistently.

Recommended order:

1. External libraries
2. Internal modules
3. Components
4. Types
5. Utilities
6. Styles

Avoid unused imports.

---

# Reusability

Before creating a new component, utility, or helper function:

- Search for an existing implementation.
- Extend reusable code whenever appropriate.

Avoid code duplication.

---

# Performance

Prefer:

- Server Components
- Lazy loading
- Memoization only when necessary
- Efficient Prisma queries

Avoid premature optimization.

---

# Security

Never trust client input.

Always:

- Validate requests.
- Check permissions.
- Sanitize uploaded files.
- Protect sensitive data.

---

# Git Workflow

Recommended branch naming:

feature/

fix/

refactor/

docs/

Example:

feature/events-module

fix/login-validation

docs/database-spec

---

# Commit Messages

Use clear and descriptive commit messages.

Examples:

feat: add event management module

fix: correct prayer schedule calculation

docs: update CMS specification

refactor: simplify financial report service

---

# Code Reviews

During code review, verify:

- Readability
- Naming consistency
- Validation
- Authorization
- Error handling
- Performance impact
- Security considerations

---

# Documentation

Every significant feature should include:

- Updated documentation
- Relevant module specification
- Database changes (if applicable)

Documentation should evolve alongside the codebase.

---

# Future Improvements

Potential future enhancements include:

- ESLint custom rules
- Prettier configuration
- Husky pre-commit hooks
- Commitlint
- Automated code formatting
- CI/CD quality checks