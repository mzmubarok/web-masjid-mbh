# Prayer Settings Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Prayer Settings Module manages all prayer time configurations displayed on the website.

Prayer times are automatically generated using a calculation method or external API, while administrators can override individual prayer times whenever official announcements require adjustments.

This module ensures prayer schedules remain accurate while minimizing manual work.

---

# Objectives

The module should allow administrators to:

- Configure prayer time calculation.
- Select calculation method.
- Configure mosque location.
- Preview calculated prayer times.
- Override prayer times for specific dates.
- Display prayer times on the homepage.

---

# Database

## Tables

- PrayerSetting

`PrayerTimeOverride` is not implemented — per-date, per-prayer time overrides (Fajr,
Dhuhr, Asr, Maghrib, Isha overridden individually for one date) described below are
forward-looking design intent, not current behavior. The only override table that
exists is `HijriOverride` (calendar date only — see `09_HijriOverride.md`), which is
independent of PrayerSetting.

---

# Prayer Settings Fields (PrayerSetting table)

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| mosqueName | String | Yes | Mosque name |
| latitude | Decimal | Yes | Latitude |
| longitude | Decimal | Yes | Longitude |
| timezone | String | Yes | Timezone |
| calculationMethod | Enum | Yes | Prayer calculation method |
| madhab | Enum | Yes | Shafi / Hanafi |
| isAutomatic | Boolean | Yes | Automatic calculation |
| fajrAngle | Decimal | No | Custom Fajr angle |
| ishaAngle | Decimal | No | Custom Isha angle |
| createdAt | DateTime | Yes | Created timestamp |
| updatedAt | DateTime | Yes | Updated timestamp |

---

# Prayer Time Override Fields (Future — table not yet implemented)

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| date | Date | Yes | Override date |
| fajr | Time | No | Fajr |
| sunrise | Time | No | Sunrise |
| dhuhr | Time | No | Dhuhr |
| asr | Time | No | Asr |
| maghrib | Time | No | Maghrib |
| isha | Time | No | Isha |
| reason | String | No | Override reason |
| createdBy | User | Yes | Creator |
| createdAt | DateTime | Yes | Created timestamp |

---

# Calculation Methods

Supported methods should include:

- Ministry of Religious Affairs Indonesia
- Muslim World League
- Umm Al-Qura
- Egyptian General Authority
- University of Islamic Sciences Karachi
- ISNA

The default calculation method should be configurable.

---

# Automatic Prayer Times

The website should automatically generate daily prayer times using:

- Mosque coordinates
- Timezone
- Calculation method

No manual input is required during normal operation.

---

# Override Rules

Overrides always take priority over automatic calculations.

Example:

Official announcement changes Maghrib from:

18:01

to

18:03

Administrator creates an override.

The website displays:

18:03

---

# Validation Rules

Latitude

- Required

Longitude

- Required

Timezone

- Required

Override Date

- Required
- Unique

---

# CMS Features

Administrators can:

- Configure mosque coordinates
- Configure calculation method
- Change madhab
- Preview today's schedule
- Create override
- Edit override
- Delete override

---

# Homepage

Display today's prayer times.

Display:

- Fajr
- Sunrise
- Dhuhr
- Asr
- Maghrib
- Isha

Highlight the next upcoming prayer.

---

# Prayer Schedule Page

Display:

- Today's schedule
- Monthly schedule
- Override indicator

Visitors may browse schedules by month.

---

# Admin Interface

## General Settings

- Mosque Name
- Coordinates
- Timezone
- Calculation Method
- Madhab

---

## Override Management

Display:

- Date
- Prayer Times
- Reason

---

# Server Actions

Settings

- updatePrayerSettings()

Overrides

- createPrayerOverride()
- updatePrayerOverride()
- deletePrayerOverride()

---

# Permissions

| Role | Settings | Override |
|------|----------|----------|
| Super Admin | Full | Full |
| Admin | Full | Full |
| Editor | View Only | View Only |

---

# Audit Log

Log:

Settings

- Updated calculation method
- Updated coordinates
- Updated timezone

Overrides

- Created
- Updated
- Deleted

---

# UI Components

- Map Coordinate Input
- Date Picker
- Time Picker
- Data Table
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while prayer settings are loading.

---

# Empty State

"No prayer settings configured."

Provide:

Configure Prayer Settings

---

# Error State

Display validation errors and configuration errors.

---

# Responsive Behavior

Desktop

Settings panel with two-column layout.

Mobile

Single-column layout.

---

# Security

Only authenticated administrators may modify prayer settings.

Prayer schedules are publicly accessible.

---

# Performance

Cache calculated prayer times.

Apply overrides after automatic calculation.

Refresh cached schedules when settings change.

---

# Future Improvements

Potential future enhancements include:

- Prayer time notifications
- Countdown to next prayer
- Iqamah schedule management
- Friday prayer schedule
- Multiple mosque locations