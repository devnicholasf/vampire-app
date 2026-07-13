-- Hotfix robusto: criar campanha via RPC SECURITY DEFINER
-- Uso: execute este SQL no Supabase SQL Editor
-- Objetivo: evitar bloqueio por drift de policy RLS no INSERT direto em campaigns.

BEGIN;

CREATE OR REPLACE FUNCTION public.create_campaign_secure(
  campaign_name_param text,
  campaign_description_param text,
  invite_code_param text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_campaign_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  INSERT INTO public.campaigns (
    name,
    description,
    master_id,
    invite_code
  )
  VALUES (
    campaign_name_param,
    campaign_description_param,
    v_user_id,
    invite_code_param
  )
  RETURNING id INTO v_campaign_id;

  RETURN v_campaign_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_campaign_secure(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_campaign_secure(text, text, text) TO authenticated;

COMMIT;
