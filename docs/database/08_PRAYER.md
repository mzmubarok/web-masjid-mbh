# Prayer Database

**Version:** 1.0
**Status:** Planning

---

# Overview

This document defines the database structure for prayer schedules and Hijri date settings.

Prayer schedules displayed on the website are generated automatically based on configurable calculation settings.

The Hijri calendar may be manually overridden when required by the mosque administration.

---

# Objectives

The Prayer module should:

- Configure prayer schedule calculation.
- Configure mosque location.
- Configure timezone.
- Configure calculation method.
- Support manual Hijri date override.
- Display today's prayer schedule on the website.

---

# Tables

This document defines:

- PrayerSetting
- HijriOverride

---

# Table: PrayerSetting

## Purpose

Stores the global configuration used to calculate prayer schedules.

Only one active configuration should exist.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| mosqueName | String | No | Mosque name |
| latitude | Decimal | No | Latitude |
| longitude | Decimal | No | Longitude |
| timezone | String | No | Timezone |
| calculationMethod | String | No | Prayer calculation method |
| madhab | String | No | Asr calculation method |
| isAutomatic | Boolean | No | Automatic calculation (default: true) |
| fajrAngle | Decimal | Yes | Custom Fajr angle |
| ishaAngle | Decimal | Yes | Custom Isha angle |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Constraints

- Only one PrayerSetting record should exist.
- Latitude and longitude are required.
- Timezone is required.

---

## Indexes

No additional indexes required.

---

## Notes

This table stores only calculation settings.

Daily prayer schedules are generated dynamically and are **not stored** in the database.

---

# Table: HijriOverride

## Purpose

Allows administrators to manually override the Hijri date for a specific Gregorian date.

This is useful when the mosque follows an official announcement that differs from the calculated Hijri calendar.

---

## Fields

| Field | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | String (CUID) | No | Primary Key |
| gregorianDate | Date | No | Gregorian date |
| hijriDay | Int | No | Hijri day |
| hijriMonth | Int | No | Hijri month |
| hijriYear | Int | No | Hijri year |
| notes | Text | Yes | Reason for override |
| source | String | Yes | Source of the announcement |
| createdById | String | No | Administrator who created the override |
| createdAt | DateTime | No | Created timestamp |
| updatedAt | DateTime | No | Updated timestamp |

---

## Relationships

HijriOverride

↓

belongs to

↓

User

(createdById)

---

## Constraints

- One override per Gregorian date.
- Gregorian date must be unique.
- Every override must reference the administrator who created it.

---

## Indexes

- gregorianDate (covered by the unique constraint)

---

# Prayer Schedule Generation

The website generates prayer schedules dynamically using:

- PrayerSetting
- Current Date
- Calculation Method

No daily schedule is stored in the database.

---

# Hijri Override Logic

When rendering today's Hijri date:

1. Check for an override.
2. If an override exists, display the overridden date.
3. Otherwise, calculate the Hijri date automatically.

---

# CMS Usage

Administrators should be able to:

- Update prayer calculation settings.
- Update mosque coordinates.
- Change calculation method.
- Change madhab.
- Create Hijri overrides.
- Edit Hijri overrides.
- Delete Hijri overrides.

---

# Homepage Rules

The Hero section displays:

- Today's prayer schedule.
- Current Hijri date.
- Current Gregorian date.

All values are generated automatically.

---

# Notes

The database does not store:

- Daily prayer schedules
- Monthly prayer schedules
- Yearly prayer schedules

These values are calculated in real time.

---

# Future Expansion

Potential future enhancements include:

- Monthly prayer timetable generation
- Prayer time notifications
- Ramadan timetable
- Imsak schedule
- Sunrise time
- Qibla direction
- Multiple mosque locations