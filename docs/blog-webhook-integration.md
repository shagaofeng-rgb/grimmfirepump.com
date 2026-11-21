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
non-sensitive reason. A signed verification probe without full article fields returns
`{"code":1,"msg":"验证成功"}` without writing an article. Full submissions must also
contain a usable title and readable body after sanitization.

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

New, valid submissions are published immediately at `/blog` and `/blog/<slug>`. They
are indexable by default and appear in the Blog sitemap. An editor can uncheck the
article's **允许收录** checkbox in `/admin/news` to opt out without unpublishing it.
The Monday Search Console sitemap submission schedule is unchanged.

The endpoint uses a stable article ID based on class, title and author. A repeat
delivery acknowledges the existing record without overwriting it, including any draft,
archived post, or editorial indexing decision. First deliveries record a
`publish_webhook_blog` audit and invalidate Blog and sitemap cache entries. The endpoint
does not log article bodies or secrets and does not run a background retry loop.
