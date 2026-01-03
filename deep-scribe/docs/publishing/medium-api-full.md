# Medium API Documentation

## 1. Overview

Base URL: `https://api.medium.com/v1`
All requests must use HTTPS.

## 2. Authentication

### 2.1. Self-issued access tokens

Recommended for desktop integrations.

- Get token from [Account Settings](https://medium.com/me/settings) > Integration Tokens.
- These tokens do not expire but can be revoked.

### 2.2. Browser-based authentication

(For reference: Legacy/Web integrations only)
OAuth2 flow involving `client_id`, `scope`, and `redirect_uri`.

## 3. Resources

### 3.1. Users

**Get User Details**
`GET https://api.medium.com/v1/me`
*Headers:* `Authorization: Bearer <token>`
*Response:*

```json
{
  "data": {
    "id": "5303d74c64f66366f00cb9b2a94f3251bf5",
    "username": "majelbstoat",
    "name": "Jamie Talbot",
    "url": "https://medium.com/@majelbstoat",
    "imageUrl": "..."
  }
}
```

### 3.2. Publications

**List User Publications**
`GET https://api.medium.com/v1/users/{{userId}}/publications`
Returns a list of publications the user is an editor or writer for.

**List Contributors**
`GET https://api.medium.com/v1/publications/{{publicationId}}/contributors`

### 3.3. Posts

**Create a Post**
`POST https://api.medium.com/v1/users/{{authorId}}/posts`

*Body Parameters:*

- `title` (string): required
- `contentFormat` (string): `html` or `markdown`
- `content` (string): The body
- `tags` (array): Max 5 tags
- `publishStatus` (string): `public`, `draft`, or `unlisted` (Default: `public`)
- `canonicalUrl` (string): Optional

*Example:*

```json
{
  "title": "Liverpool FC",
  "contentFormat": "html",
  "content": "<h1>Liverpool FC</h1><p>You’ll never walk alone.</p>",
  "tags": ["football", "sport", "Liverpool"],
  "publishStatus": "public"
}
```

**Create a Post under a Publication**
`POST https://api.medium.com/v1/publications/{{publicationId}}/posts`
*Note:* If user is 'writer' (not editor), status is forced to `draft`.

### 3.4. Images

**Upload Image**
`POST https://api.medium.com/v1/images`
*Content-Type:* `multipart/form-data`
*Response:* Returns URL and MD5.

## 4. Testing

No sandbox. Create a testing account using an email address.
