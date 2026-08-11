# Blog publishing webhook

GRIMM PUMP has one CMS-backed Blog system at `/blog` with its management screen at
`/admin/news`. Published Blog entries are read from the `cms-news.json` store; the
frontend does not use plugin content as static placeholders.

## Endpoint contract

The endpoint accepts `POST` requests with `application/x-www-form-urlencoded` or
JSON data:

`POST https://www.grimmfirepump.com/api/webhook/send_article`

For a plugin that uses **Custom Framework Webhook**, `POST https://www.grimmfirepump.com/`
is also supported. Only a root `POST` is internally forwarded; normal homepage GET
requests are unchanged.

Fields:

- `sign` - matches `WEBHOOK_ARTICLE_SIGN`, or the legacy `BLOG_WEBHOOK_API_KEY`
- `class_id` - normally `blog` (or the provider's legacy `31`)
- `title`
- `content`
- `author_id`
- `image_url`

The API always returns HTTP 200 with the plugin contract:

```json
{"code":1,"msg":"发布成功"}
```

Invalid authentication, malformed data, or storage failures return `code: 0` with a
non-sensitive reason. A valid signed request without a substantial title and body is
treated as a verification request and returns `{"code":1,"msg":"验证成功"}` without
writing an article.

## Plugin fields

For **Custom Framework Webhook** use:

| Field | Value |
| --- | --- |
| Domain | `https://www.grimmfirepump.com` |
| API key | The production value of `WEBHOOK_ARTICLE_SIGN` (or the retained legacy key) |
| Admin account | The existing GRIMM administrator account |
| Note | `blog news generation` |
| Validation category ID | `blog` |

For **Generic Framework Webhook**, use the full endpoint URL:
`https://www.grimmfirepump.com/api/webhook/send_article`.

Never place the key in a browser variable, Git repository, screenshot, ticket, or
public documentation. Configure it in the Vercel Production environment, then redeploy.

## Delivery behaviour

The endpoint uses a deterministic article id based on class, title, and author. A
provider retry updates the existing record rather than creating a duplicate. Successful
writes record an admin audit event and invalidate the Blog and Sitemap caches. A failed
request records a failure audit without recording the article body or secret. The provider
remains responsible for its bounded retry schedule; the CMS does not create an unbounded
background retry loop.
