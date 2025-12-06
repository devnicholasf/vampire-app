<template>
  <div class="min-h-screen bg-gradient-atmospheric flex items-center justify-center p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-surface-card/80 backdrop-blur-xl border border-border-primary rounded-2xl p-8 shadow-card-vampire">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-red-500 mb-4">
            📜 Termos de Uso
          </h1>
          <p class="text-text-secondary text-lg">
            Regras e condições para usar nosso sistema vampírico
          </p>
        </div>

        <!-- Conteúdo Temporário -->
        <div class="space-y-6 text-center">
          <div class="text-6xl">🧛‍♂️</div>
          
          <h2 class="text-2xl font-semibold text-text-primary">
            FUNCIONOU! 🎉
          </h2>
          
          <p class="text-text-secondary text-lg">
            Esta é a página de <strong>Termos de Uso</strong>
          </p>
          
          <div class="bg-red-900/20 border border-red-400 rounded-lg p-4">
            <p class="text-red-300">
              ⚠️ Conteúdo temporário - será substituído em breve
            </p>
          </div>
          
          <div class="text-text-muted">
            <p>Por enquanto, apenas aceite que você concorda com tudo 😄</p>
            <p class="mt-2">🩸 Que a sede eterna te guie nas trevas... 🌙</p>
          </div>
        </div>

        <!-- Botão Voltar -->
        <div class="text-center mt-8">
          <button
            @click="$router.back()"
            class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            ← Voltar para as trevas
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Termos de Uso - Teste'
})
</script>