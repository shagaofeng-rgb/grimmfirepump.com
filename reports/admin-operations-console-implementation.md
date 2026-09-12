# Admin operations console implementation

## Delivered
- Unified timezone-aware reporting ranges: Today, This week, This month, Last 30 days, Custom, and All time.
- Fixed-size pagination controls for analytics events, visitor profiles, inquiry leads, download leads, assets, login logs, and audit logs.
- Visitor profile aggregation and a protected visitor-journey detail page. The view shows sessions, page paths, channel, country, masked IP when captured, conversions, and linked inquiry or download records.
- Real, test, and bot traffic segmentation. Existing collector and automated test signatures remain excluded from the real-traffic default.
- Dashboard range awareness and range-preserving links into analytics and lead detail workflows.
- Build-time checks for reporting date-range behavior.

## Privacy and data integrity
- No new personal data is fabricated or silently enriched. IP display remains masked and is shown only when the existing collector captured it.
- Visitor grouping is based on the site visitor identifier and session identifier already created by the first-party analytics listener.
- A visit made with a different browser or after clearing site storage is correctly represented as a separate visitor until the visitor identifies themselves through an inquiry or download form.

## Operations
- All reporting dates are evaluated with the configured site timezone.
- Existing database persistence is retained; no production data has been reset or deleted.
