# External Blog Publishing Webhook

Use this endpoint for the external content plugin. It publishes or updates a Blog article in the existing CMS and immediately refreshes the public Blog and Sitemap caches.

- Request URL: `https://www.grimmfirepump.com/api/webhook/send_article`
- Method: `POST`
- Content type: `application/x-www-form-urlencoded`
- Authentication: send the long-lived production `WEBHOOK_ARTICLE_SIGN` value as `sign`. Store this secret only in Vercel and the plugin; do not commit or publish it.

For the plugin option **Custom Development Framework Webhook**, enter `https://www.grimmfirepump.com` as the domain. A signed `POST /` is internally forwarded to this endpoint, while the public homepage `GET /` is unchanged. A signed validation request without a complete title and body returns `{"code":1,"msg":"验证成功"}` without writing a record.

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
{"code":1,"msg":"发布成功"}
```

```json
{"code":0,"msg":"秘钥错误"}
```

Retries are idempotent for the same `class_id`, `title` and `author_id`: the existing webhook article is updated instead of creating a duplicate.

## Plugin configuration

Use the following values in the plugin. Retrieve the API key from the protected `WEBHOOK_ARTICLE_SIGN` environment variable; its value is intentionally not stored in this repository or this document.

| Plugin field | Custom Development Framework Webhook | Generic Framework Webhook |
| --- | --- | --- |
| Website framework | `Custom Development Framework Webhook` | `Generic Framework Webhook` |
| Domain | `https://www.grimmfirepump.com` | `https://www.grimmfirepump.com/api/webhook/send_article` |
| API_KEY | Exact value of `WEBHOOK_ARTICLE_SIGN` | Exact value of `WEBHOOK_ARTICLE_SIGN` |
| Admin login account | `admin` | `admin` |
| Note | `blog news generation` | `blog news generation` |
| Validation category ID | `blog` | `blog` |

The custom framework uses the root-domain verification request. The generic framework posts directly to the API route. Both accept `application/x-www-form-urlencoded` fields: `sign`, `class_id`, `title`, `content`, `author_id`, and `image_url`.
