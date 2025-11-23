# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

All endpoints (except `/healthz` and `/v1/auth/google`) require Bearer token authentication:
```
Authorization: Bearer <accessToken>
```

### POST /v1/auth/google
Login with Google ID Token.

**Request:**
```json
{
  "idToken": "google-id-token-from-client"
}
```

**Response:**
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token-string",
  "refreshExpiresAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### POST /v1/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "current-refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-refresh-token",
  "refreshExpiresAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /v1/auth/logout
Revoke refresh token (logout).

**Request:**
```json
{
  "refreshToken": "current-refresh-token"
}
```

**Response:**
```json
{
  "revoked": true
}
```

---

## Artists

### GET /v1/artists
Get all artists for the authenticated user.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Artist Name",
      "website": "https://artist.com",
      "socialMedia": "@artisthandle",
      "photoUrl": "https://example.com/photo.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /v1/artists
Create a new artist.

**Request:**
```json
{
  "name": "Artist Name",
  "website": "https://artist.com",
  "socialMedia": "@artisthandle",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**Response:** Artist object

### PATCH /v1/artists/:id
Update an artist.

**Request:**
```json
{
  "name": "Updated Name",
  "website": "https://new-website.com"
}
```

**Response:** Updated artist object

### DELETE /v1/artists/:id
Delete an artist.

**Response:**
```json
{
  "ok": true
}
```

---

## Live Events

### GET /v1/live-events
Get all live events for the authenticated user.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Concert Title",
      "artistId": "artist-uuid",
      "artist": {
        "id": "uuid",
        "name": "Artist Name"
      },
      "date": "2024-12-31T19:00:00.000Z",
      "venue": "Concert Hall",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /v1/live-events/:id
Get a specific live event with memories.

**Response:**
```json
{
  "id": "uuid",
  "title": "Concert Title",
  "artistId": "artist-uuid",
  "artist": { /* artist object */ },
  "date": "2024-12-31T19:00:00.000Z",
  "venue": "Concert Hall",
  "memories": [ /* memory objects */ ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /v1/live-events
Create a new live event.

**Request:**
```json
{
  "title": "Concert Title",
  "artistId": "artist-uuid",
  "date": "2024-12-31T19:00:00.000Z",
  "venue": "Concert Hall"
}
```

**Response:** LiveEvent object

### PATCH /v1/live-events/:id
Update a live event.

**Request:** Partial LiveEvent fields

**Response:** Updated LiveEvent object

### DELETE /v1/live-events/:id
Delete a live event.

**Response:**
```json
{
  "ok": true
}
```

---

## Memories

### GET /v1/memories
Get all memories for the authenticated user.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "eventId": "event-uuid",
      "event": {
        "id": "uuid",
        "title": "Concert Title",
        "artist": { /* artist object */ }
      },
      "review": "Amazing show!",
      "setlist": "Song 1\nSong 2\nSong 3",
      "photos": ["https://example.com/photo1.jpg"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /v1/memories/:id
Get a specific memory.

**Response:** Memory object with event details

### POST /v1/memories
Create a new memory.

**Request:**
```json
{
  "eventId": "event-uuid",
  "review": "Amazing show!",
  "setlist": "Song 1\nSong 2\nSong 3",
  "photos": ["https://example.com/photo1.jpg"]
}
```

**Response:** Memory object

### PATCH /v1/memories/:id
Update a memory.

**Request:** Partial Memory fields (excluding eventId)

**Response:** Updated Memory object

### DELETE /v1/memories/:id
Delete a memory.

**Response:**
```json
{
  "ok": true
}
```

### GET /v1/live-events/:eventId/memories
Get all memories for a specific event.

**Response:**
```json
{
  "items": [ /* memory objects */ ]
}
```

---

## Storage

### POST /v1/storage/presign
Generate a presigned URL for uploading an image.

**Request:**
```json
{
  "filename": "photo.jpg",
  "contentType": "image/jpeg",
  "size": 1048576
}
```

**Response:**
```json
{
  "uploadUrl": "https://...",
  "publicUrl": "https://...",
  "key": "users/user-id/file-key.jpg",
  "expiresIn": 3600,
  "method": "PUT",
  "headers": {
    "Content-Type": "image/jpeg"
  }
}
```

**Usage:**
1. Call this endpoint to get presigned URL
2. Use `uploadUrl` to upload file directly with PUT request
3. Include the `Content-Type` header
4. After successful upload, use `publicUrl` in your app

**Constraints:**
- Only image/* content types allowed
- Max file size: 10MB

### DELETE /v1/storage/:key
Delete an uploaded image.

**Response:**
```json
{
  "ok": true,
  "key": "users/user-id/file-key.jpg"
}
```

---

## Sync

### POST /v1/sync
Synchronize data between client and server.

**Request:**
```json
{
  "lastSyncAt": "2024-01-01T00:00:00.000Z",
  "clientChanges": {
    "artists": [],
    "liveEvents": [],
    "memories": []
  }
}
```

**Response:**
```json
{
  "serverChanges": {
    "artists": [ /* updated artists since lastSyncAt */ ],
    "liveEvents": [ /* updated events since lastSyncAt */ ],
    "memories": [ /* updated memories since lastSyncAt */ ]
  },
  "syncedAt": "2024-01-01T12:00:00.000Z",
  "conflicts": []
}
```

### GET /v1/sync/status
Get sync status and data counts.

**Response:**
```json
{
  "lastSyncAt": "2024-01-01T12:00:00.000Z",
  "counts": {
    "artists": 5,
    "liveEvents": 20,
    "memories": 15
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "errors": [ /* validation errors if applicable */ ]
}
```

Common error codes:
- `UNAUTHORIZED` (401) - Missing or invalid auth token
- `VALIDATION_ERROR` (400) - Invalid request body
- `NOT_FOUND` (404) - Resource not found
- `FORBIDDEN` (403) - Access denied
- `INTERNAL_ERROR` (500) - Server error

---

## Development Flags

### MOCK_GOOGLE=true
Skip Google ID token verification. Any string with 10+ characters works as idToken.

### SKIP_DB=true
Skip database operations and return mock data. Useful for frontend development without DB setup.

**Example:**
```bash
MOCK_GOOGLE=true SKIP_DB=true npm run dev
```
