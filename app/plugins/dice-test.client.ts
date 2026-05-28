// ============================================
// Plugin para expor função de teste no console
// ============================================
// Uso no console do navegador:
// testeEstatistico()
// testeEstatistico({ pool: 7, hunger: 3, iterations: 50000 })
// ============================================

import { testeEstatistico } from '~/components/live/dice/DiceEngine'

export default defineNuxtPlugin(() => {
  // Expor função globalmente apenas no client-side
  if (process.client) {
    // @ts-ignore
    window.testeEstatistico = testeEstatistico
    
    console.log('\n🎲 Sistema de Rolagem V5 carregado!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Execute: testeEstatistico()')
    console.log('📊 Teste customizado: testeEstatistico({ pool: 7, hunger: 3 })')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
})
