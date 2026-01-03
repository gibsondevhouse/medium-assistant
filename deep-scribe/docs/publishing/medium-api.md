# Medium API Documentation

## Overview

Base URL: `https://api.medium.com/v1`

## Authentication

We use **Self-issued access tokens** (Integration tokens).
Users generate these in their [Settings](https://medium.com/me/settings).
They do not expire but can be revoked.

## Resources

### Creating a Post

`POST https://api.medium.com/v1/users/{{authorId}}/posts`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**

```json
{
  "title": "Liverpool FC",
  "contentFormat": "html",
  "content": "<h1>Liverpool FC</h1><p>You’ll never walk alone.</p>",
  "tags": ["football", "sport", "Liverpool"],
  "publishStatus": "public"
}
```

**Fields:**

- `title`: Title of the post.
- `contentFormat`: `html` or `markdown`.
- `content`: The body.
- `tags`: Array of strings (max 5).
- `publishStatus`: `public`, `draft`, or `unlisted`.
