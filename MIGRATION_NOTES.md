#  NOTAS DE MIGRAÇÃO - Vampire RPG

**Última Sessão:** Abril/Maio 2026
**Versão:** 5.0.0 - Sistema de Jogo ao Vivo com Mídia em Tempo Real

---

## ⚠️ AÇÃO PENDENTE — BANCO DE DADOS (CRÍTICO)

Antes de usar o sistema de mídia ao vivo, execute este SQL no Supabase SQL Editor:

```sql
-- Arquivo: database/add-live-media-columns.sql
ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '';
```

Sem isso, `updateSceneMedia()` vai falhar silenciosamente.

---

##  RESUMO DA ÚLTIMA SESSÃO (Abril/Maio 2026)

Sessão focada na **implementação completa do sistema de Jogo ao Vivo (live.vue)** com transmissão de mídia em tempo real para os jogadores via Supabase Realtime.

### O que foi feito nesta sessão:

**MediaTab.vue (app/components/campaign/master/MediaTab.vue):**
1. **Correção de cores** — player de áudio dourado (`#d4a647`), título "Mídia da Campanha" em prata (`#c0c0d0`)
2. **Fix de encoding de TXT** — fallback UTF-8 → Windows-1252 para caracteres acentuados
3. **Sub-tabs em dourado** (`#d4a647`)
4. **Sem flash branco** ao abrir visualizador de docs
5. **Texto mais claro** no visualizador e modal de upload
6. **Botão X visível** no visualizador de docs
7. **Filename sem prefixo de timestamp** — arquivo salvo com o nome original; `upsert: true` para re-uploads

**useLiveGame.ts (app/composables/useLiveGame.ts):**
8. **Adicionado `currentSceneMedia`** — `useState` com `imageUrl` e `audioUrl`
9. **Adicionado `updateSceneMedia(campaignId, imageUrl, audioUrl)`** — atualiza colunas `current_image_url` / `current_audio_url` na tabela `live_game_state`
10. **`fetchLiveGameState` e `subscribeToLiveGame`** sincronizam `currentSceneMedia` do banco

**live.vue (app/pages/campaign/[id]/live.vue):**
11. **Redesign completo de "Mídia da Cena"** — agora igual ao painel de NPCs (picker estilo NPC)
    - Dois blocos: **Imagens** e **Áudio** (sem documentos — docs são só na aba Mídia)
    - Botão "Adicionar Imagem/Áudio" expande picker com busca e lista de arquivos do Storage
    - Cada arquivo adicionado aparece na lista com thumbnail (imagem) ou ícone (áudio)
    - **Botão olho** alterna visibilidade para jogadores (verde = visível, cinza = oculto)
    - **Botão X** remove da cena; ao remover mídia visível, limpa transmissão
    - Somente 1 imagem e 1 áudio podem estar visíveis por vez
    - `toggleMediaVisibility` → chama `updateSceneMedia` → Supabase Realtime → jogadores veem
12. **Botão "Gerenciar na Aba Mídia" removido** (era inútil)
13. **Correções TypeScript:**
    - `EventTarget.style` → cast para `(e.currentTarget as HTMLElement).style`
    - `parts[last]` undefined → `?? ''`
    - `isGameLive.value = ...` (readonly) → removida atribuição direta
    - `currentNpcs.value = ...` (readonly) → removida; mantida apenas `applyLiveNpcState()`
    - `timelineEvents.value = ...` (readonly) → substituída por `sessionTimeline.value`

**live-player.vue (app/pages/campaign/[id]/live-player.vue):**
14. **Exibe imagem e áudio em tempo real** — `currentImageUrl` e `currentAudioUrl` via Supabase Realtime
15. **Autoplay de áudio** ao receber novo URL

**database/add-live-media-columns.sql (NOVO):**
16. Script SQL para adicionar `current_image_url` e `current_audio_url` na tabela `live_game_state`

---

##  ARQUIVOS MODIFICADOS NESTA SESSÃO

```
app/components/campaign/master/MediaTab.vue
   Correções visuais (cores, encoding TXT, botões)
   Fix de filename: sem Date.now() prefix, upsert: true

app/composables/useLiveGame.ts
   currentSceneMedia (useState)
   updateSceneMedia(campaignId, imageUrl, audioUrl)
   fetchLiveGameState + subscribeToLiveGame sincronizam currentSceneMedia

app/pages/campaign/[id]/live.vue
   Redesign completo de "Mídia da Cena" (NPC-style picker)
   Interface MediaItem { name, url, type: 'image'|'audio', visibleToPlayers }
   Funções: loadMediaFiles, addMediaToScene, removeMediaFromScene, toggleMediaVisibility
   Correções TypeScript (readonly refs, EventTarget cast)

app/pages/campaign/[id]/live-player.vue
   Exibe imagem + áudio transmitidos pelo mestre em tempo real

database/add-live-media-columns.sql  (NOVO — EXECUTAR NO SUPABASE)
   ALTER TABLE live_game_state ADD COLUMN current_image_url TEXT DEFAULT '';
   ALTER TABLE live_game_state ADD COLUMN current_audio_url  TEXT DEFAULT '';
```

---

##  ESTADO ATUAL DAS FEATURES PRINCIPAIS

### Jogo ao Vivo — live.vue (Mestre)
| Feature | Status |
|---------|--------|
| Iniciar/Encerrar sessão | ✅ Funcional |
| Nome da cena | ✅ Funcional |
| NPCs (picker + olho + spotlight) | ✅ Funcional |
| Mídia da Cena — Imagens | ✅ Funcional |
| Mídia da Cena — Áudio | ✅ Funcional |
| Transmissão ao vivo (Realtime) | ✅ Funcional (requer SQL migration) |
| Eventos narrativos | ✅ Funcional |

### Jogo ao Vivo — live-player.vue (Jogador)
| Feature | Status |
|---------|--------|
| Receber imagem em tempo real | ✅ Funcional |
| Receber áudio em tempo real | ✅ Funcional (autoplay tenta iniciar) |
| Ver NPCs visíveis | ✅ Funcional |
| Ver cena atual | ✅ Funcional |

---

##  PONTOS IMPORTANTES PARA CONTINUAÇÃO

### 1. SQL migration obrigatória
Execute `database/add-live-media-columns.sql` no Supabase SQL Editor antes de testar o sistema de mídia ao vivo.

### 2. Bucket de Storage
O bucket `campaign-media` deve estar configurado como **público** no Supabase Storage. Os arquivos são organizados por `campaignId/filename`.

### 3. Regra de CSS crítica
**NUNCA usar classes Tailwind arbitrárias em arrays computed** (ex: `` `text-[${cor}]` ``). Valores dinâmicos de cor devem sempre usar `:style` inline ou `<style scoped>`. Classes Tailwind estáticas são OK.

### 4. Imports sempre explícitos
```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, definePageMeta, useRuntimeConfig } from '#imports'
</script>
```

### 5. Padrões de navegação
```typescript
router.push(...)    // OK — live.vue usa useRouter() explícito
navigateTo(...)     // OK — Nuxt helper
// NUNCA: $router.push(...)
```

### 6. NPCSheet.vue ainda usa modelo antigo
`app/components/campaign/master/NPCSheet.vue` não foi atualizado para V5. Ainda pode ter campos `healthLevels`. Usar `PlayerSheet.vue` como referência se precisar atualizar.

---

##  SESSÃO ANTERIOR (Fevereiro 2026 — v4.0.0)

Sessão focada na **reformulação completa da ficha de personagem (PlayerSheet.vue)** para V5. Veja CHANGELOG.md para detalhes completos.

Arquivos modificados naquela sessão:
- `app/components/campaign/PlayerSheet.vue` (~1206 linhas) — Ficha V5 completa
- `app/types/index.ts` — Interface CharacterSheet atualizada

---

##  COMANDOS PARA CONTINUAR

```bash
# Iniciar em desenvolvimento
npm run dev

# Build de verificação (deve ser exit code 0)
npx nuxi build

# Limpar cache se necessário
rm -rf .nuxt ; npm run postinstall
```

URLs de teste:
- `http://localhost:3000/campaign/[id]/live` — Tela do mestre ao vivo
- `http://localhost:3000/campaign/[id]/player` — Dashboard do jogador
- `http://localhost:3000/campaign/[id]/master` — Dashboard do mestre (aba Mídia)
- **Salvamento**: Sempre filtrar dados vazios antes de salvar

### 4. Build verificado
O projeto compilou sem erros após todas as mudanças. Último build bem-sucedido (exit code 0).

---

##  ESTRUTURA DA FICHA V5 (PlayerSheet.vue)

### Organização das seções no template:

```

 [Avatar] NOME DO PERSONAGEM    [ Salvar] []     Header sticky

 Nome     Conceito  Clã                            Grid 3 colunas
 Geração  Seita     Refúgio                        Grid 3 colunas

 Atributos Físicos    Sociais     Mentais       
 (3  5 bolinhas)                               

 Talentos (9)   Perícias (9)  Conhecimentos (9) 
 ( 5 bolinhas cada)                              

 Disciplinas           Potência de Sangue        
 (dropdown + nível)    (10 círculos + campos)    
                                                 
 Vantagens & Defeitos  Experiência               
 (nome + 5 círculos)   (Total/Gasto/Disponível)  
                                                 
  Fome (5 bolinhas)                            

 Virtudes              Humanidade (10 vermelhas)  
 (3  5 amarelas)     Vontade (10 azuis)         
                       Vitalidade (10 verdes)     

 Ressonância           Princípios da Crônica      
 Pilares & Convicções  Perdição do Clã            

 Geração do Abraço [Cria ]                       

 Aparência        Traços Distintivos              
 Condições Narrativas (add/remove)                 
 História (textarea)                               

```

---

##  COMANDOS PARA CONTINUAR

```bash
# Iniciar o projeto
npm run dev

# Acessar o dashboard de jogador (testar ficha)
http://localhost:3000/campaign/[id]/player

# Build de verificação
npm run build

# Limpar cache se necessário
rm -rf .nuxt ; npm run postinstall
```

---

##  DICAS PARA O PRÓXIMO CHAT

1. **PlayerSheet.vue** tem ~1206 linhas - leia por seções, não tudo de uma vez
2. **player.vue** tem ~851 linhas - é o dashboard que consome os dados da ficha
3. **types/index.ts** tem a interface `CharacterSheet` na linha ~170
4. O projeto usa **Nuxt 4** (não Nuxt 3) com **Vue 3 Composition API**
5. Todas as cores e estilos são **Tailwind CSS** com tema vampire customizado
6. O banco é **Supabase** com a ficha salva como JSONB na coluna `sheet`
7. **Não existe backend próprio** - tudo via Supabase direto dos composables
