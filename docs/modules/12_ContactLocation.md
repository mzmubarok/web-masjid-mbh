# Contact & Location Module

**Version:** 1.0
**Status:** Planning

---

# Purpose

The Contact & Location Module manages all mosque contact information, location details, maps, operating hours, and visitor information displayed throughout the website.

This module acts as the single source of truth for all public contact information.

---

# Objectives

The module should allow administrators to:

- Manage mosque address.
- Configure map location.
- Update contact information.
- Manage operating hours.
- Display visitor facilities.
- Configure navigation links.
- Provide accessibility information.

---

# Database

## Tables

- ContactLocation

---

# Contact & Location Fields

## Basic Information

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| mosqueName | String | Yes | Mosque name |
| shortDescription | Text | No | Short description |
| address | Text | Yes | Full address |
| district | String | No | District |
| city | String | Yes | City |
| province | String | Yes | Province |
| postalCode | String | No | Postal code |

---

## Coordinates

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| latitude | Decimal | Yes | Latitude |
| longitude | Decimal | Yes | Longitude |
| googleMapsUrl | URL | Yes | Google Maps link |

---

## Contact Information

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| phone | String | No | Contact phone |
| whatsapp | String | No | WhatsApp number |
| email | String | No | Public email |

---

## Operating Hours

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| openingTime | Time | Yes | Opening time |
| closingTime | Time | Yes | Closing time |
| operatingNotes | Text | No | Additional notes |

---

## Facilities

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| parking | Boolean | Yes | Parking available |
| accessibility | Boolean | Yes | Wheelchair accessible |
| ablutionArea | Boolean | Yes | Wudhu area available |
| restroom | Boolean | Yes | Restroom available |

---

## Visitor Information

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| navigationTitle | String | No | Navigation button label |
| directionNotes | Text | No | Visitor guidance |

---

# Validation Rules

Mosque Name

- Required
- Maximum 120 characters

Address

- Required

Latitude

- Required

Longitude

- Required

Google Maps URL

- Required
- Must be a valid URL

Opening Time

- Required

Closing Time

- Required

Email

- Must be valid if provided

Phone Numbers

- International format recommended

---

# CMS Features

Administrators can:

- Update mosque information
- Change address
- Update coordinates
- Update Google Maps link
- Change contact information
- Modify operating hours
- Manage facilities
- Update visitor notes

---

# Homepage

Display:

- Mosque name
- Address
- Operating hours
- Parking availability
- Accessibility information
- Google Maps preview
- Open in Google Maps button
- Get Directions button

---

# Google Maps

The homepage should embed Google Maps using the configured coordinates.

Buttons:

- Open Google Maps
- Get Directions

Both buttons should open Google Maps in a new tab.

---

# Admin Interface

## Basic Information

- Mosque Name
- Description
- Address

---

## Location

- Latitude
- Longitude
- Google Maps URL

---

## Contact

- Phone
- WhatsApp
- Email

---

## Operating Hours

- Opening Time
- Closing Time
- Notes

---

## Facilities

Checkboxes:

- Parking
- Accessibility
- Ablution Area
- Restroom

---

## Visitor Notes

- Navigation Label
- Direction Notes

---

# Server Actions

- updateContactLocation()

---

# Permissions

| Role | Access |
|------|--------|
| Super Admin | Full |
| Admin | Full |
| Editor | View Only |

---

# Audit Log

Log:

- Contact Updated
- Address Updated
- Coordinates Updated
- Operating Hours Updated
- Facilities Updated

---

# UI Components

- Form
- Map Preview
- Time Picker
- Checkbox
- Textarea
- Toast
- Confirmation Dialog

---

# Loading State

Display skeleton loaders while location data is loading.

---

# Empty State

Initialize with default mosque information during installation.

---

# Error State

Display validation and map configuration errors.

---

# Responsive Behavior

Desktop

Two-column layout.

Tablet

Single-column layout.

Mobile

Single-column layout.

---

# Security

Only authenticated administrators may modify contact information.

All contact information is publicly accessible.

---

# Performance

Cache location settings.

Lazy-load embedded Google Maps.

No dedicated indexes — ContactLocation is a singleton table (a single row is always
fetched directly by id), so a `mosqueName` index would add overhead without benefit.

---

# Future Improvements

Potential future enhancements include:

- Multiple mosque branches
- Interactive map markers
- Nearby public transportation
- Live traffic integration
- Parking capacity indicator
- Emergency contact information