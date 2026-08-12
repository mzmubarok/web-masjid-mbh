# Event Database Specification

---

# Table

EventCategory

---

# Fields

id

CUID

Primary Key

---

name

String

Required

Unique

---

slug

String

Required

Unique

---

color

String

Nullable: Yes

---

iconId

Relation → Media

Nullable: Yes

---

sortOrder

Integer

Required

---

isActive

Boolean

Default:

true

---

createdAt

DateTime

---

updatedAt

DateTime

---

# Relationships

EventCategory

1

↓

Many

↓

Event

---

# Table

Event

---

# Fields

id

CUID

Primary Key

---

title

String

Required

---

slug

String

Required

Unique

---

excerpt

String

Required

---

description

String

Required

---

featuredImageId

Relation → Media

Nullable: Yes

---

categoryId

Relation → EventCategory

Required

---

location

String

Required

---

startDate

DateTime

Required

---

endDate

DateTime

Nullable: Yes

---

startTime

String

Required

Format:

HH:mm

---

endTime

String

Nullable: Yes

Format:

HH:mm

---

isFeatured

Boolean

Default:

false

---

isPublished

Boolean

Default:

false

---

publishedAt

DateTime

Nullable: Yes

---

createdById

Relation → User

Required

---

updatedById

Relation → User

Required

---

createdAt

DateTime

---

updatedAt

DateTime

---

# Relationships

Event

↓

Media

(featuredImage)

---

Event

↓

EventCategory

(category)

---

Event

↓

User

(createdBy)

---

Event

↓

User

(updatedBy)

---

# Notes

Featured image is optional.

Each Event belongs to exactly one EventCategory.

One EventCategory may contain many Events.

Publishing is controlled using:

- isPublished
- publishedAt

Draft Events are not visible on the public website.

Deleting an Event must not automatically delete the associated Media.