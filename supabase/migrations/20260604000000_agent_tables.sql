-- Agent tables migration — apply via Supabase dashboard SQL editor or CLI
-- These tables support the automation agents added in June 2026.

-- Contact form logging (feeds the FAQ Updater agent monthly analysis)
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  treatment TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Social media caption drafts (feeds the Social Content agent — reviewed in staff dashboard)
CREATE TABLE IF NOT EXISTS social_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT,
  source_slug TEXT,
  source_title TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE social_drafts ENABLE ROW LEVEL SECURITY;

-- Weekly review sentiment analysis log
CREATE TABLE IF NOT EXISTS review_sentiment_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  total_reviews INTEGER,
  themes_positive TEXT,
  themes_concern TEXT,
  summary TEXT,
  action_needed BOOLEAN DEFAULT false
);
ALTER TABLE review_sentiment_log ENABLE ROW LEVEL SECURITY;
