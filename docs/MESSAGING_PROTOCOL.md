# DN Cascade Platform Messaging Protocol

**Version:** 1.0
**Date:** April 22, 2025

## 1. Introduction

This document outlines the structure and usage of messages and headers within the DN Cascade platform ecosystem (including DN Cascade, DebRIEF, and Barca variants). The protocol defines how information is structured for display to users in the "Pre teba" (For you) feed section and the main header area on the Home view.

Messages can originate locally within the application code or be fetched dynamically from a cloud source (Firestore). Headers are always fetched from the cloud.

## 2. Message Object

Messages are used to display contextual information, prompts, or updates to the user in the feed section.

### 2.1. Structure

```typescript
interface Message {
  id: string; // Unique identifier for the message
  title: string; // The main heading/title of the message
  message: string; // The body text content of the message
  link: string | null; // URL the message links to, or null if not linkable
  local: boolean; // True if the link is internal (app route), false if external (web URL)
  filters?: MessageFilters; // Optional: Targeting filters (Cloud Messages only)
}

interface MessageFilters {
  member: boolean; // Targets based on SDA membership status
  role: string[] | null; // Targets specific user roles (e.g., 'admin', 'coach') or null for all
  club: string | object; // Targets a specific club (ID string or Firestore Ref) or "" for all
}
```

### 2.2. Field Descriptions

- **`id`** (`string`): A unique identifier for the message. For local messages, this is a predefined string (e.g., `"welcome"`, `"auth"`). For cloud messages, this is typically the Firestore document ID.
- **`title`** (`string`): The primary text displayed as the message's heading.
- **`message`** (`string`): The descriptive body text of the message.
- **`link`** (`string | null`): An optional URL associated with the message. If present, the message component will act as a link.
- **`local`** (`boolean`): Determines how the `link` is handled:
  - `true`: The `link` is treated as an internal application route (e.g., `/profile`, `/events/some-event-id`) and navigation is handled by the Vue router.
  - `false`: The `link` is treated as an external URL (e.g., `https://sda.sk`, `mailto:info@sda.sk`) and is opened in a new browser tab.
- **`filters`** (`MessageFilters`, Optional): An object defining targeting rules for cloud-based messages. This field is **not** present on locally defined messages.
  - **`filters.member`** (`boolean`): If `true`, the message targets users who _are_ SDA members. If `false`, it targets users who are _not_ members, or it can be interpreted as targeting _all_ users depending on the query logic (current logic uses `false` to mean "target non-members or everyone").
  - **`filters.role`** (`string[] | null`): An array of user roles (e.g., `["admin", "developer"]`, `["coach"]`). The message targets users whose role matches one in the array. If `null`, the message targets users of any role.
  - **`filters.club`** (`string | object`): Targets users associated with a specific club. This can be the club's ID (string) or a Firestore Document Reference object. An empty string (`""`) means the message targets users from any club (or no club).

### 2.3. Examples

**Local Message Example (from `messaging.js`):**

```javascript
// Example 1: Internal Link
{
  id: "join",
  title: "Don't forget to register",
  message: "If you want to participate in our events, become an SDA member.",
  link: "/join", // Navigates using Vue Router
  local: true
}

// Example 2: External Link
{
  id: "externalInfo",
  title: "Visit Our Main Site",
  message: "Find more information about the SDA on our official website.",
  link: "https://sda.sk", // Opens in a new browser tab
  local: false
}

// Example 3: No Link
{
  id: "welcome",
  title: "Welcome to the App!",
  message: "Explore the features and get started.",
  link: null, // This message is not clickable
  local: false // Value doesn't matter when link is null
}
```

**Cloud Message Example (Conceptual Firestore Data):**

```json
// Example 1: Targeting Specific Roles (Coaches)
// Firestore document in 'messages' collection (ID: msg123)
{
  "title": "Important Update for Coaches",
  "message": "Please review the new coaching guidelines before the next tournament.",
  "link": "/docs/coaching-guidelines",
  "local": true,
  "filters": {
    "member": true, // Must be a member
    "role": ["coach"], // Must be a coach
    "club": "" // Any club
  }
}

// Example 2: Targeting a Specific Club
// Firestore document in 'messages' collection (ID: msg456)
{
  "title": "Club Meeting Reminder",
  "message": "Don't forget our monthly club meeting next Tuesday!",
  "link": "/events/club-meeting-may",
  "local": true,
  "filters": {
    "member": true, // Must be a member
    "role": null, // Any role within the club
    "club": "clubs/someClubId123" // Targets members of this specific club (using Firestore path)
  }
}
```

## 3. Header Object

Headers are prominent messages displayed at the top of the Home view, often used for important announcements or calls to action. They support rich HTML content.

### 3.1. Structure

```typescript
interface Header {
  id: string; // Unique identifier (Firestore document ID)
  content: string; // HTML content for the header
  active: boolean; // Whether the header is currently active
  repeat: boolean; // If false, the header can be dismissed permanently by the user
}
```

### 3.2. Field Descriptions

- **`id`** (`string`): The unique identifier for the header, corresponding to its Firestore document ID. Used for dismissal tracking.
- **`content`** (`string`): A string containing the full HTML markup to be rendered within the header component. This allows for rich formatting, images, and embedded styles. Links within the content are handled dynamically to use the Vue router for internal links and `target="_blank"` for external ones.
- **`active`** (`boolean`): If `true`, this header is eligible for display. Only one active header is typically shown at a time.
- **`repeat`** (`boolean`): Controls the dismissal behavior:
  - `true`: The header will be shown every time the user visits the Home view as long as it remains `active`.
  - `false`: The header can be dismissed by the user via a "Dismiss" button. Dismissal is tracked using `localStorage` (key: `header-${id}`). Once dismissed, it will not reappear for that user even if it's still `active`.

### 3.3. Example

**Cloud Header Example (Conceptual Firestore Data):**

```json
// Firestore document in 'headers' collection (ID: headerABC)
{
  "content": "<a href=\"/release?version=25.1\" id=\"header-message\" style=\"...\"><img src=\"...\" alt=\"Megaphone\" style=\"...\"><div><h1>PRIVÍTAJ v25.1</h1><p>...</p></div></a><style>...</style>",
  "active": true,
  "repeat": false
}
```

_(Note: The `content` is a string containing the full HTML from files like `templates/version-message.html`)_

## 4. Message Filtering (Cloud)

Cloud messages fetched from Firestore use the `filters` object to target specific user segments. The `getCloudMessages` function in `src/firebase/messaging.js` constructs a query based on the current user's status (`isMember`, `role`, `club.id`) and the message's `filters`.

The query logic generally aims to include messages where:

- The message's `filters.member` matches the user's `isMember` status OR `filters.member` is `false` (acting as a wildcard/non-member target).
- The message's `filters.role` contains the user's `role` OR `filters.role` is `null`.
- The message's `filters.club` matches the user's `club` reference OR `filters.club` is `""`.

## 5. Header Display Logic

1.  The application fetches potential header messages from the `headers` collection in Firestore where `active` is `true`.
2.  If a header is found and its `repeat` value is `false`, the application checks `localStorage` for a key `header-${id}`.
3.  If the key exists with value `"true"`, the header is considered dismissed and is not displayed.
4.  Otherwise (header found, and either `repeat` is `true` or it hasn't been dismissed), the header's `content` is rendered.
5.  If the user clicks the dismiss button on a header where `repeat` is `false`, the `localStorage` key `header-${id}` is set to `"true"`, and the header is hidden for the current session.
