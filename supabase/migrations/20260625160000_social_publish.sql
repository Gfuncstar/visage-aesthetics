-- Instagram publishing for approved social drafts.
--
-- 1. Persist the staff-chosen preview image on a draft, so the same branded
--    image (a /og composite) can be published to Instagram after approval.
ALTER TABLE social_drafts ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. Let the marketing activity log record social posts as 'approved' (signed
--    off, awaiting publish) and 'posted' (published live). The original CHECK
--    only allowed done/draft/failed/logged, so the approve→Marketing mirror was
--    silently failing on the constraint. Widening is safe: every existing row
--    already satisfies the narrower set.
ALTER TABLE marketing_activity DROP CONSTRAINT IF EXISTS marketing_activity_status_check;
ALTER TABLE marketing_activity ADD CONSTRAINT marketing_activity_status_check
  CHECK (status IN ('done', 'draft', 'failed', 'logged', 'approved', 'posted'));
