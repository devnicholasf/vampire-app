<!-- 
  Página de teste para debug das funcionalidades Supabase 
  Acesse: /debug
-->
<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <h1 class="text-3xl font-bold mb-8">Debug Supabase</h1>
      
      <!-- Status da conexão -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Status da Conexão</h2>
        <div class="space-y-2">
          <p><strong>URL:</strong> {{ config.public.supabaseUrl }}</p>
          <p><strong>Key (primeiros 20 chars):</strong> {{ config.public.supabaseKey?.substring(0, 20) }}...</p>
          <p><strong>Usuário logado:</strong> {{ user?.email || 'Não logado' }}</p>
        </div>
      </div>

      <!-- Teste de conexão -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Teste de Conexão</h2>
        <button 
          @click="testConnection"
          :disabled="testing"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ testing ? 'Testando...' : 'Testar Conexão' }}
        </button>
        
        <div v-if="connectionResult" class="mt-4 p-4 rounded" :class="connectionResult.success ? 'bg-green-100' : 'bg-red-100'">
          <pre>{{ JSON.stringify(connectionResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Teste de criação de campanha -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Teste de Criação de Campanha</h2>
        
        <div class="space-y-4">
          <input 
            v-model="testCampaign.name"
            placeholder="Nome da campanha"
            class="w-full p-2 border rounded"
          />
          <textarea 
            v-model="testCampaign.description"
            placeholder="Descrição da campanha"
            class="w-full p-2 border rounded"
            rows="3"
          ></textarea>
          
          <button 
            @click="testCreateCampaign"
            :disabled="creatingCampaign || !testCampaign.name"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ creatingCampaign ? 'Criando...' : 'Testar Criação' }}
          </button>
        </div>
        
        <div v-if="createResult" class="mt-4 p-4 rounded" :class="createResult.success ? 'bg-green-100' : 'bg-red-100'">
          <pre>{{ JSON.stringify(createResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- Lista de campanhas existentes -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Campanhas Existentes</h2>
        <button 
          @click="loadCampaigns"
          :disabled="loading"
          class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 mb-4"
        >
          {{ loading ? 'Carregando...' : 'Carregar Campanhas' }}
        </button>
        
        <div v-if="campaigns.length > 0" class="space-y-2">
          <div 
            v-for="campaign in campaigns" 
            :key="campaign.id"
            class="p-3 border rounded"
          >
            <h3 class="font-semibold">{{ campaign.name }}</h3>
            <p class="text-gray-600">{{ campaign.description }}</p>
            <p class="text-sm text-gray-500">ID: {{ campaign.id }}</p>
          </div>
        </div>
        
        <div v-else-if="!loading" class="text-gray-500">
          Nenhuma campanha encontrada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const { user } = useAuth()

// Estados
const testing = ref(false)
const connectionResult = ref(null)
const creatingCampaign = ref(false)
const createResult = ref(null)
const loading = ref(false)
const campaigns = ref([])

const testCampaign = ref({
  name: 'Campanha de Teste',
  description: 'Esta é uma campanha de teste para debug'
})

// Cliente Supabase
const supabase = createClient(
  config.public.supabaseUrl,
  config.public.supabaseKey
)

// Testar conexão básica
const testConnection = async () => {
  testing.value = true
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('count(*)')
      .limit(1)
    
    connectionResult.value = {
      success: !error,
      data,
      error: error?.message,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    connectionResult.value = {
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    }
  } finally {
    testing.value = false
  }
}

// Testar criação de campanha
const testCreateCampaign = async () => {
  if (!user.value) {
    createResult.value = {
      success: false,
      error: 'Usuário não autenticado'
    }
    return
  }

  creatingCampaign.value = true
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: testCampaign.value.name,
        description: testCampaign.value.description,
        master_id: user.value.id
      })
      .select()
      .single()
    
    createResult.value = {
      success: !error,
      data,
      error: error?.message,
      fullError: error,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    createResult.value = {
      success: false,
      error: err.message,
      fullError: err,
      timestamp: new Date().toISOString()
    }
  } finally {
    creatingCampaign.value = false
  }
}

// Carregar campanhas
const loadCampaigns = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    campaigns.value = data || []
  } catch (err) {
    console.error('Erro ao carregar campanhas:', err)
  } finally {
    loading.value = false
  }
}
</script>