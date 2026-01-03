# Medium’s API documentation

## 1. Overview

Medium’s API is a JSON-based OAuth2 API. All requests are made to endpoints beginning: `https://api.medium.com/v1`

All requests must be secure, i.e. `https`, not `http`.

#### Developer agreement

By using Medium’s API, you agree to our [terms of service](https://medium.com/@feerst/2b405a832a2f).

## 2. Authentication

In order to publish on behalf of a Medium account, you will need an access token. An access token grants limited access to a user’s account. We offer two ways to acquire an access token: browser-based OAuth authentication, and self-issued access tokens.
We recommend using self-issued access tokens. Browser-based authentication is supported for existing integrations only.

### 2.1. Self-issued access tokens

Self-issued access tokens (described in user-facing copy as integration tokens) are explicitly designed for desktop integrations where implementing browser-based authentication is non-trivial, or software like plugins where it is impossible to secure a client secret. You should not request that a user give you an integration token if you don’t meet these criteria. Users will be cautioned within Medium to treat integration tokens like passwords, and dissuaded from making them generally available.
You can find your access token on your [account settings page](https://medium.com/me/settings).
You should instruct your user to visit this URL and generate an integration token from the Integration Tokens section. You should suggest a description for this token - typically the name of your product or feature - and use it consistently for all users.

Self-issued access tokens do not expire, though they may be revoked by the user at any time.

## 3. Resources

The API is RESTful and arranged around resources. All requests must be made with an integration token. All requests must be made using `https`.

Typically, the first request you make should be to acquire user details. This will confirm that your access token is valid, and give you a user id that you will need for subsequent requests.

### 3.1. Users

#### Getting the authenticated user’s details

Returns details of the user who has granted permission to the application.

```
GET https://api.medium.com/v1/me
```

Example request:

```
GET /v1/me HTTP/1.1
Host: api.medium.com
Authorization: Bearer 181d415f34379af07b2c11d144dfbe35d
Content-Type: application/json
Accept: application/json
Accept-Charset: utf-8
```

The response is a User object within a data envelope.
Example response:

```json
{
  "data": {
    "id": "5303d74c64f66366f00cb9b2a94f3251bf5",
    "username": "majelbstoat",
    "name": "Jamie Talbot",
    "url": "https://medium.com/@majelbstoat",
    "imageUrl": "https://images.medium.com/0*fkfQiTzT7TlUGGyI.png"
  }
}
```

### 3.2. Publications

#### Listing the user’s publications

Returns a full list of publications that the user is related to in some way: This includes all publications the user is subscribed to, writes to, or edits. This endpoint offers a set of data similar to what you’ll see at [https://medium.com/me/publications](https://medium.com/me/publications) when logged in.
The REST API endpoint exposes this list of publications as a collection of resources under the user. A request to fetch a list of publications for a user looks like this:

```
GET https://api.medium.com/v1/users/{{userId}}/publications
```

The response is a list of publication objects. An empty array is returned if user doesn’t have relations to any publications. The response array is wrapped in a data envelope. This endpoint will return all publications in which a user has a role of "editor" or "writer" along with a maximum of 200 other publications the user follows or has other relationships with.

### 3.3. Posts

#### Creating a post

Creates a post on the authenticated user’s profile.

```
POST https://api.medium.com/v1/users/{{authorId}}/posts
```

Where authorId is the user id of the authenticated user.

Example request:

```
POST /v1/users/5303d74c64f66366f00cb9b2a94f3251bf5/posts HTTP/1.1
Host: api.medium.com
Authorization: Bearer 181d415f34379af07b2c11d144dfbe35d
Content-Type: application/json
Accept: application/json
Accept-Charset: utf-8

{
  "title": "Liverpool FC",
  "contentFormat": "html",
  "content": "<h1>Liverpool FC</h1><p>You’ll never walk alone.</p>",
  "canonicalUrl": "http://jamietalbot.com/posts/liverpool-fc",
  "tags": ["football", "sport", "Liverpool"],
  "publishStatus": "public"
}
```

#### Creating a post under a publication

This API allows creating a post and associating it with a publication on Medium. The request also shows this association, considering posts a collection of resources under a publication:

```
POST https://api.medium.com/v1/publications/{{publicationId}}/posts
```

Here publicationId is the id of the publication the post is being created under. The publicationId can be acquired from the API for listing user’s publications.

There are additional rules around publishing that each request to this API must respect:

- If the authenticated user is an 'editor' for the publication, they can create posts with any publish status. Posts published as 'public' or 'unlisted' will appear in collection immediately, while posts created as 'draft' will remain in pending state under publication.
- If the authenticated user is a 'writer' for the chosen publication, they can only create a post as a 'draft'. That post will remain in pending state under publication until an editor for the publication approves it.
