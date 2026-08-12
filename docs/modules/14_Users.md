# Users Module

**Version:** 1.0  
**Status:** Planning

---

# Purpose

The Users module manages administrator accounts for the Masjid Baitul Hikmah CMS.

It allows authorized administrators to create, update, and manage CMS users and assign predefined system roles.

---

# Objectives

The module should allow administrators to:

- View all administrator accounts.
- Create new administrator accounts.
- Edit administrator information.
- Reset user passwords.
- Activate or deactivate user accounts.
- Assign predefined roles.
- Prevent unauthorized access.

---

# System Roles

The CMS provides predefined roles.

Available roles:

- Super Admin
- Admin
- Editor
- Treasurer

Roles are seeded during application setup and cannot be created, edited, or deleted through the CMS.

---

# User Information

Each user contains:

- Name
- Email
- Password
- Role
- Status

---

# Validation

Name

- Required
- Maximum 100 characters

Email

- Required
- Must be unique
- Must be a valid email address

Password

- Required when creating a user
- Minimum 8 characters

Role

- Required
- Must reference an existing system role

Status

- Boolean

---

# User List

Display:

- Name
- Email
- Role
- Status
- Created Date
- Actions

Actions:

- Edit
- Reset Password
- Activate / Deactivate

Super Admin cannot delete themselves.

---

# Create User

Administrators can:

- Enter user information.
- Assign a role.
- Set account status.

Password is securely hashed before being stored.

---

# Edit User

Editable fields:

- Name
- Email
- Role
- Status

Password is edited separately.

---

# Reset Password

Administrators may reset another user's password.

Users cannot view existing passwords.

---

# Permissions

Super Admin

- Full access

Admin

- Manage users except Super Admin

Editor

- Read-only

Treasurer

- No access

---

# Database

Tables:

- User
- Role

User Fields:

- id
- name
- email
- passwordHash
- roleId
- createdAt
- updatedAt

Role Fields:

- id
- name
- description
- createdAt
- updatedAt

Relationship:

Role

↓

User

(One Role → Many Users)

---

# Server Actions

Supported operations:

- Create User
- Update User
- Reset Password
- List Users

User deletion is not supported.

---

# UI Components

The module should use:

- Data Table
- Modal Form
- Select
- Password Input
- Switch
- Badge
- Buttons
- Confirmation Dialog

---

# Empty States

Display:

"No users found."

Provide a shortcut to create the first user.

---

# Loading States

Display skeleton loaders while fetching data.

---

# Error States

Display user-friendly validation and server error messages.

Provide retry actions whenever appropriate.

---

# Security

Passwords must:

- Be hashed before storage.
- Never be displayed.
- Never be logged.
- Never be returned by APIs.

Authentication must use secure session management.

---

# Future Improvements

Potential future enhancements include:

- Last login history
- Two-factor authentication (2FA)
- Avatar support
- Password expiration policy
- Login activity history
- Account lockout after repeated failed logins