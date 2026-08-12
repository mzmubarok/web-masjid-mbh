# Hijri Calendar Override Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Hijri Calendar Override Module manages Islamic calendar adjustments displayed throughout the website.

The website normally calculates Hijri dates automatically using an Islamic calendar calculation method.

When official announcements differ from the calculated date, administrators may override specific dates without changing the entire calendar.

---

# Objectives

The module should allow administrators to:

- Configure the default Hijri calculation method.
- Override specific Hijri dates.
- Add notes explaining overrides.
- Ensure all website modules display the corrected Hijri date.

---

# Database

## Tables

- HijriOverride

`HijriSettings` (a separate calculation-method/adjustment config table) is not
implemented — there is currently no dedicated Hijri calculation settings table.
`HijriOverride` stands alone; it does not belong to a `HijriSettings (1) → (Many)`
relationship.

---

# Hijri Settings Fields (Future — table not yet implemented)

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| calculationMethod | Enum | Yes | Hijri calculation method |
| adjustment | Integer | Yes | Day adjustment (-2 to +2) |
| timezone | String | Yes | Timezone |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

---

# Hijri Override Fields (HijriOverride table)

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| gregorianDate | Date | Yes | Gregorian date |
| hijriDay | Integer | Yes | Hijri day |
| hijriMonth | Integer | Yes | Hijri month |
| hijriYear | Integer | Yes | Hijri year |
| notes | String | No | Override reason |
| source | String | No | Source of announcement |
| createdBy | User | Yes | Administrator |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

---

# Calculation Methods

Supported methods should include:

- Umm al-Qura
- Islamic Civil
- Moon Sighting Committee
- Saudi Arabia
- Custom Adjustment

The default method should be configurable.

---

# Automatic Calendar

By default, the website generates Hijri dates automatically.

No manual editing is required during normal operation.

---

# Override Rules

Overrides always take precedence over automatic calculations.

Example:

Automatic Calculation

1 Ramadan 1448 H

Official Government Announcement

2 Ramadan 1448 H

Website displays:

2 Ramadan 1448 H

---

# Validation Rules

Gregorian Date

- Required
- Unique

Hijri Day

- Required
- Between 1–30

Hijri Month

- Required
- Between 1–12

Hijri Year

- Required

---

# CMS Features

Administrators can:

- Configure calculation method
- Configure adjustment
- Create override
- Edit override
- Delete override
- View yearly override history

---

# Website Usage

The Hijri calendar is used by:

- Homepage calendar
- Prayer schedule
- Event pages
- Ramadan programs
- Eid announcements
- Articles
- Donation campaigns

Every page should use the same Hijri date source.

---

# Admin Interface

## General Settings

- Calculation Method
- Adjustment
- Timezone

---

## Override Management

Display:

- Gregorian Date
- Hijri Date
- Reason
- Source

---

# Server Actions

Settings

- updateHijriSettings()

Overrides

- createHijriOverride()
- updateHijriOverride()
- deleteHijriOverride()

---

# Permissions

| Role | Settings | Override |
|------|----------|----------|
| Super Admin | Full | Full |
| Admin | Full | Full |
| Editor | View Only | View Only |

---

# Audit Log

Settings

- Updated calculation method
- Updated adjustment

Overrides

- Created
- Updated
- Deleted

---

# UI Components

- Date Picker
- Number Input
- Data Table
- Badge
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while calendar settings are loading.

---

# Empty State

"No Hijri overrides have been created."

Provide:

Create Override

---

# Error State

Display validation and configuration errors.

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

Only authenticated administrators may manage Hijri settings.

Hijri dates are publicly accessible.

---

# Performance

Automatically calculate Hijri dates.

Check overrides before displaying dates.

Cache calculated dates for improved performance.

---

# Future Improvements

Potential future enhancements include:

- Automatic official calendar synchronization
- Moon sighting announcements
- Ramadan countdown
- Eid countdown
- Islamic holiday management