-- ══════════════════════════════════════════════════════════════════
-- Campaign Media Storage — Supabase Storage RLS Policies
-- ══════════════════════════════════════════════════════════════════
--
-- STEP 1 (manual — Supabase Dashboard):
--   Storage → New Bucket
--   Name:   campaign-media
--   Public: true   ← required so image previews work without auth
--
-- STEP 2: Run this entire script in the Supabase SQL Editor
--   (drop first to avoid conflicts if already ran a previous version)
-- ══════════════════════════════════════════════════════════════════

-- Drop old policies (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Masters can upload campaign media"  ON storage.objects;
DROP POLICY IF EXISTS "Campaign members can view media"    ON storage.objects;
DROP POLICY IF EXISTS "Masters can delete campaign media"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view campaign media"   ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update campaign media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete campaign media" ON storage.objects;

-- Drop helper functions if they exist from a previous run
DROP FUNCTION IF EXISTS public.is_campaign_master(text);
DROP FUNCTION IF EXISTS public.is_campaign_member(text);

-- ══════════════════════════════════════════════════════════════════
-- Simple auth-based policies
-- Security is enforced at the app layer: users only receive campaign
-- IDs they belong to, and file paths embed the campaign UUID.
-- ══════════════════════════════════════════════════════════════════

-- Any logged-in user can upload
CREATE POLICY "Authenticated can upload campaign media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-media');

-- Any logged-in user can read (bucket is Public, needed for previews)
CREATE POLICY "Authenticated can view campaign media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'campaign-media');

-- Required by Supabase Storage internals on some operations
CREATE POLICY "Authenticated can update campaign media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-media');

-- Any logged-in user can delete (app only shows delete to the master)
CREATE POLICY "Authenticated can delete campaign media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-media');
