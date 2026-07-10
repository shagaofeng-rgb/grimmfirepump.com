-- GRIMM Fire Pump admin backend schema reference
-- Current implementation stores CMS/admin records in lead_store JSONB so it can run on Vercel/Neon quickly.
-- These normalized tables are the recommended next migration path for a larger team or multi-admin workflow.

CREATE TABLE IF NOT EXISTS lead_store (
  store_name TEXT NOT NULL,
  id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  PRIMARY KEY (store_name, id)
);

CREATE INDEX IF NOT EXISTS idx_lead_store_name_created
  ON lead_store (store_name, created_at DESC);

CREATE TABLE IF NOT EXISTS task_locks (
  name TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  cover_image TEXT,
  summary TEXT,
  seo_title TEXT,
  seo_description TEXT,
  indexable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES product_categories(id),
  title TEXT NOT NULL,
  english_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  model TEXT,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  description TEXT,
  main_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]',
  parameters JSONB NOT NULL DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  canonical_url TEXT,
  og_image TEXT,
  indexable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  author TEXT,
  cover_image TEXT,
  excerpt TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  publish_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  indexable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'website_form',
  source_page TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  country TEXT,
  product TEXT,
  message TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  intent TEXT NOT NULL DEFAULT 'unrated',
  owner TEXT,
  notes TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip TEXT,
  user_agent TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source_type);

CREATE TABLE IF NOT EXISTS download_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  related_product TEXT,
  version TEXT,
  language TEXT,
  file_url TEXT NOT NULL,
  gated BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published',
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  folder TEXT,
  alt TEXT,
  description TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT 'success',
  ip TEXT,
  user_agent TEXT,
  before JSONB,
  after JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional normalized schema for News automation.
-- The running application currently stores these records in lead_store JSONB.
-- These tables are the recommended migration target for larger data volume.

CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'rss',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'en',
  last_fetched_at TIMESTAMPTZ,
  last_status TEXT,
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_canonical_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_published_at TIMESTAMPTZ NOT NULL,
  source_fetched_at TIMESTAMPTZ NOT NULL,
  source_facts JSONB NOT NULL DEFAULT '[]',
  source_fingerprint TEXT NOT NULL,
  event_fingerprint TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  related_products JSONB NOT NULL DEFAULT '[]',
  cover_image_url TEXT NOT NULL,
  cover_image_source_url TEXT NOT NULL,
  cover_image_page_url TEXT NOT NULL,
  cover_image_alt TEXT NOT NULL,
  cover_image_hash TEXT NOT NULL,
  cover_image_status TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  geo_summary TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  generated_model TEXT NOT NULL,
  publish_at TIMESTAMPTZ,
  failure_reason TEXT,
  retries INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_news_articles_status_publish ON news_articles (status, publish_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_fp ON news_articles (source_fingerprint);
CREATE INDEX IF NOT EXISTS idx_news_articles_event_fp ON news_articles (event_fingerprint);
CREATE INDEX IF NOT EXISTS idx_news_articles_content_hash ON news_articles (content_hash);

CREATE TABLE IF NOT EXISTS news_jobs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  message TEXT NOT NULL,
  stats JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS news_publication_audits (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date TEXT NOT NULL UNIQUE,
  target INTEGER NOT NULL,
  published INTEGER NOT NULL,
  generated INTEGER NOT NULL,
  duplicates INTEGER NOT NULL,
  rejected INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL
);
