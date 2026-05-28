// ============================================
// isPlayer Middleware
// Permite acesso ao mestre e aos jogadores da campanha
// ============================================

import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to) => {
  const campaignId = to.params.id as string

  if (!campaignId) {
    return navigateTo('/dashboard')
  }

  const { user, restoreSession } = useAuth()
  await restoreSession()

  if (!user.value) {
    return navigateTo('/login')
  }

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, master_id')
    .eq('id', campaignId)
    .maybeSingle()

  if (campaignError || !campaign) {
    return navigateTo('/dashboard')
  }

  if (campaign.master_id === user.value.id) {
    return
  }

  const { data: player, error: playerError } = await supabase
    .from('campaign_players')
    .select('campaign_id')
    .eq('campaign_id', campaignId)
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (playerError || !player) {
    return navigateTo('/dashboard')
  }
})
