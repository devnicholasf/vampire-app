// ============================================
// isMaster Middleware
// Permite acesso apenas ao mestre da campanha
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

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('id, master_id')
    .eq('id', campaignId)
    .maybeSingle()

  if (error || !campaign) {
    return navigateTo('/dashboard')
  }

  if (campaign.master_id !== user.value.id) {
    return navigateTo(`/campaign/${campaignId}/player`)
  }
})
