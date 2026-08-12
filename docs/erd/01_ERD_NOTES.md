# ERD Design Notes

---

# Primary Keys

All tables use:

CUID

---

# Foreign Keys

Use Prisma relations.

---

# Soft Delete

User

Event

GalleryAlbum

FinancialReport

DonationProgram

Recommended, not yet implemented — no `isActive`/`deletedAt` column exists on these tables yet.

---

# Singleton Tables

PrayerSetting

SiteSetting

ContactLocation

---

# Shared Media

Media is a reusable resource.

Never duplicate uploaded files.

---

# Audit Log

Append-only.

Never update.

Never delete.

---

# Authentication

Role-Based Access Control (RBAC)

The system uses predefined system roles.

Each user is assigned one role.

Authorization is determined by the assigned role.

The available system roles are:

- Super Admin
- Admin
- Editor
- Treasurer

Roles are seeded during application setup and are not managed through the CMS.

---

# Draft & Publish

Supported by:

Hero

About

Event

GalleryAlbum

FinancialReport

DonationProgram

---

# Future Expansion

The database should support future modules without major schema redesign.