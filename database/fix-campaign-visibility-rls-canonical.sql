-- Canonical RLS fix for campaigns and campaign_players
-- Purpose: restore dashboard visibility after policy drift/duplication.

BEGIN;

-- 1) Ensure RLS is enabled
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaign_players ENABLE ROW LEVEL SECURITY;

-- 2) Helper functions (SECURITY DEFINER) to avoid policy recursion
CREATE OR REPLACE FUNCTION public.is_campaign_master(campaign_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    WHERE c.id = campaign_id_param
      AND c.master_id = user_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_member(campaign_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaign_players cp
    WHERE cp.campaign_id = campaign_id_param
      AND cp.user_id = user_id_param
  );
$$;

REVOKE ALL ON FUNCTION public.is_campaign_master(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_campaign_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_campaign_master(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_campaign_member(uuid, uuid) TO authenticated;

-- 3) Drop all existing policies for both tables (duplicates/conflicts)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('campaigns', 'campaign_players')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 4) Recreate canonical policies for campaigns
CREATE POLICY campaigns_select_policy ON public.campaigns
FOR SELECT TO authenticated
USING (
  public.is_campaign_master(id, auth.uid())
  OR public.is_campaign_member(id, auth.uid())
);

CREATE POLICY campaigns_insert_policy ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (master_id = auth.uid());

CREATE POLICY campaigns_update_policy ON public.campaigns
FOR UPDATE TO authenticated
USING (public.is_campaign_master(id, auth.uid()))
WITH CHECK (public.is_campaign_master(id, auth.uid()));

CREATE POLICY campaigns_delete_policy ON public.campaigns
FOR DELETE TO authenticated
USING (public.is_campaign_master(id, auth.uid()));

-- 5) Recreate canonical policies for campaign_players
CREATE POLICY campaign_players_select_policy ON public.campaign_players
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_master(campaign_id, auth.uid())
);

CREATE POLICY campaign_players_insert_policy ON public.campaign_players
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.is_campaign_master(campaign_id, auth.uid())
);

CREATE POLICY campaign_players_update_policy ON public.campaign_players
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_master(campaign_id, auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  OR public.is_campaign_master(campaign_id, auth.uid())
);

CREATE POLICY campaign_players_delete_policy ON public.campaign_players
FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_campaign_master(campaign_id, auth.uid())
);

COMMIT;
