# CMS And Database Plan

## Recommended CMS

Phase 1 can run from TypeScript data files in `src/data/site.ts`.

Phase 2 should move content into one of these:

- Sanity: best editorial interface and multilingual content workflow.
- Payload CMS: best if the site needs a fully owned Next.js-native admin panel.
- Strapi: acceptable if the team prefers a conventional hosted headless CMS.

Recommended choice for this project: Payload CMS or Sanity.

## Content Collections

- ProductCategory
- Product
- Application
- ProjectCase
- BlogPost
- DownloadFile
- Certificate
- Video
- FAQ
- Inquiry
- DownloadLead

## Product Fields

- title
- slug
- category
- heroImage
- gallery
- summary
- description
- specifications
- modelTable
- structureDiagram
- performanceCurves
- advantages
- certifications
- relatedApplications
- relatedProjects
- faq
- seoTitle
- seoDescription

## Inquiry Fields

- name
- email
- company
- country
- phone
- whatsapp
- productInterest
- flow
- pressure
- application
- requirement
- sourcePage
- createdAt

## Database

Recommended database: PostgreSQL.

Recommended ORM: Prisma.

Use PostgreSQL for inquiry storage, download leads, CMS relational content and future CRM integration.

## Multilingual Plan

Default language: English.

Reserved languages:

- Spanish
- Russian
- Arabic
- French
- Portuguese

Recommended URL pattern:

- `/`
- `/es`
- `/ru`
- `/ar`
- `/fr`
- `/pt`

Add `hreflang` through Next.js metadata after translated content is ready.
