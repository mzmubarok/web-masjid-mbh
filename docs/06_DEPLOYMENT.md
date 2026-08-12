# Deployment Guide

**Version:** 1.0  
**Status:** Planning

---

# Overview

This document defines the deployment and operational procedures for the Masjid Baitul Hikmah website.

The application consists of:

- Public Website
- CMS
- Application Backend
- Database
- Media Storage

The deployment process must be predictable, secure, and repeatable.

---

# Environments

The project should use separate environments.

## Development

Used for:

- Local development
- Feature development
- Database experimentation

Database:

- SQLite

---

## Preview

Used for:

- Testing features
- Pull requests
- UI review
- Integration testing

---

## Production

Used for:

- Public website
- CMS
- Official mosque data

Database:

- PostgreSQL

---

# Environment Variables

Environment variables must never be committed to Git.

Example:

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=
```

Additional variables may be required for:

- Storage
- Authentication providers
- External APIs
- Google Maps
- Social media integrations

---

# Environment Files

Local development:

```text
.env.local
```

Production environment variables should be configured through the deployment platform.

Never commit:

```text
.env
.env.local
.env.production
```

when they contain secrets.

---

# Prerequisites

Before deployment, ensure:

- Dependencies are installed.
- Environment variables are configured.
- Database is accessible.
- Prisma schema is valid.
- Database migrations are ready.
- Build succeeds locally.

---

# Installation

Install dependencies:

```bash
npm install
```

---

# Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Apply migrations in development:

```bash
npx prisma migrate dev
```

Apply migrations in production:

```bash
npx prisma migrate deploy
```

---

# Database Migration Rules

Production databases must use:

```bash
npx prisma migrate deploy
```

Do not use:

```bash
npx prisma migrate dev
```

against production databases.

Database migrations should be committed to Git.

---

# Seed Data

Seed data may be used for:

- Default roles
- Permissions
- Initial settings
- Initial donation programs

Seed scripts must be safe to run in development.

Production seed operations must be performed carefully and explicitly.

---

# Build

Before deployment, run:

```bash
npm run build
```

The build must complete successfully before production deployment.

---

# Deployment

The initial production deployment target is:

- Vercel

The deployment process should:

1. Install dependencies.
2. Generate Prisma Client.
3. Apply production migrations.
4. Build the application.
5. Deploy the application.
6. Verify the production environment.

---

# Post-Deployment Verification

After deployment, verify:

## Public Website

- Homepage loads.
- Navigation works.
- Images load correctly.
- Prayer schedule works.
- Hijri date works.
- Events load.
- Financial reports load.
- Donation information loads.
- Gallery loads.
- Social media links work.
- Location and map work.

---

## CMS

- Login works.
- Authentication works.
- Dashboard loads.
- Permissions work.
- CRUD operations work.
- Media uploads work.
- Publishing works.
- Audit logs are created.

---

# Database Backup

Production database backups should be performed regularly.

Backup strategy should include:

- Scheduled backups
- Manual backups before major migrations
- Backup retention policy

Backups must be stored separately from the production database.

---

# Restore Procedure

A restore procedure should be documented before production launch.

General process:

```text
Identify Backup

↓

Verify Backup

↓

Prepare Database

↓

Restore Backup

↓

Run Required Migrations

↓

Verify Data

↓

Verify Application
```

---

# Rollback Strategy

If a deployment causes a critical issue:

1. Identify the failing deployment.
2. Roll back the application deployment.
3. Verify database compatibility.
4. Restore the database only when necessary.
5. Verify the public website.
6. Verify the CMS.

Database migrations must be designed carefully because application rollback does not automatically roll back database changes.

---

# Media Storage

Media files should be stored separately from the application deployment.

Development may use:

- Local storage

Production should use persistent storage such as:

- Object storage
- Cloud storage

The database stores media metadata and references.

---

# Security

Production must:

- Use HTTPS.
- Protect environment variables.
- Restrict database access.
- Use secure authentication secrets.
- Validate uploaded files.
- Disable unnecessary debug output.

Never expose:

- Database credentials
- Authentication secrets
- API keys
- Session secrets

---

# Monitoring

Production should monitor:

- Application errors
- Database availability
- Storage availability
- Authentication failures
- Failed deployments

Monitoring tools may be introduced as the project grows.

---

# Logging

Application logs should help diagnose:

- Server errors
- Database errors
- Authentication failures
- External API failures
- File upload failures

Do not log sensitive information.

---

# Deployment Workflow

Recommended workflow:

```text
Local Development

↓

Feature Branch

↓

Development Testing

↓

Pull Request

↓

Preview Deployment

↓

Review

↓

Merge

↓

Production Deployment

↓

Post-Deployment Verification
```

---

# Version Control

Production deployments should be associated with a Git commit or release.

Avoid deploying uncommitted changes.

---

# Maintenance Mode

Maintenance mode may be enabled through the CMS when major maintenance is required.

When enabled:

Public visitors:

→ Maintenance Page

Administrators:

→ CMS remains accessible

---

# Disaster Recovery

The project should maintain recovery procedures for:

- Database failure
- Storage failure
- Application failure
- Failed deployment
- Accidental data deletion

Recovery procedures should be tested periodically.

---

# Production Checklist

Before production release:

- [ ] Environment variables configured
- [ ] Database configured
- [ ] Prisma Client generated
- [ ] Migrations applied
- [ ] Seed data verified
- [ ] Build successful
- [ ] Authentication tested
- [ ] Permissions tested
- [ ] Media upload tested
- [ ] Public website tested
- [ ] CMS tested
- [ ] Backup verified
- [ ] Rollback procedure available

---

# Future Improvements

Potential future improvements include:

- Automated CI/CD
- Automated database backups
- Error monitoring
- Uptime monitoring
- CDN
- Automated deployment verification
- Staging environment
- Infrastructure as Code