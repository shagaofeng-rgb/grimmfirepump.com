# External Blog Publishing Webhook

Use this endpoint for the external content plugin. It publishes or updates a Blog article in the existing CMS and immediately refreshes the public Blog and Sitemap caches.

- Request URL: `https://www.grimmfirepump.com/api/webhook/send_article`
- Method: `POST`
- Content type: `application/x-www-form-urlencoded`
- Authentication: send the long-lived production `BLOG_WEBHOOK_API_KEY` value as `sign`.

## Parameters

| Field | Required | Notes |
| --- | --- | --- |
| `sign` | Yes | Long-lived API key. Keep it private. |
| `class_id` | Yes | Use `blog` or `31` for **Industry News**. Other values create an External Blog category label. |
| `title` | Yes | Article title, maximum 180 characters. |
| `content` | Yes | Article content. Plain text, Markdown-like line breaks and basic HTML are accepted; HTML is safely converted to readable article paragraphs. |
| `author_id` | No | Displayed as the article author. Use `admin` if the plugin has no separate author. |
| `image_url` | No | Public `https://` cover image URL. A GRIMM fallback image is used if omitted or invalid. |

## Responses

```json
{"code":1,"msg":"Article published successfully."}
```

```json
{"code":0,"msg":"Invalid API key."}
```

Retries are idempotent for the same `class_id`, `title` and `author_id`: the existing webhook article is updated instead of creating a duplicate.
