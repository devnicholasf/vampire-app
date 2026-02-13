#  NOTAS DE MIGRAÇÃO - Vampire RPG

**Última Sessão:** Fevereiro 12, 2026
**Versão:** 4.0.0 - Ficha V5 Completa

---

##  RESUMO DA ÚLTIMA SESSÃO

Sessão focada na **reformulação completa da ficha de personagem (PlayerSheet.vue)** para seguir o padrão oficial do Vampire: The Masquerade 5ª Edição (V5).

### O que foi feito nesta sessão:

1. **Reordenar habilidades** para ordem oficial V5 em PT-BR
2. **Adicionar Vitalidade** (vitality) com 10 bolinhas verdes
3. **Disciplinas como dropdown** (15 opções V5)
4. **Substituir emoji lixeira** por botão X com SVG
5. **Remover campo "Jogador"** do cabeçalho
6. **Alinhar cabeçalho** em grid 3+3 (Nome/Conceito/Clã | Geração/Seita/Refúgio)
7. **Remover "Notas Gerais"** do final da ficha
8. **Adicionar Fome** com 5 bolinhas vermelhas (padrão 1)
9. **Adicionar Condições Narrativas** com add/remove e sync com dashboard
10. **Remover "Níveis de Saúde"** (não é V5)
11. **Mover Experiência** para coluna da Potência (preencher espaço)
12. **Redesign do cabeçalho** com avatar circular + nome vermelho grande
13. **Adicionar borda vampírica** com ornamentos nos cantos e sombra vermelha
14. **Corrigir clipping da borda** movendo ornamentos para fora do scroll
15. **Substituir "Idade e Datas"** por dropdown "Geração do Abraço" (Cria/Neófito/Ancião)

---

##  ARQUIVOS MODIFICADOS NESTA SESSÃO

### Arquivos Principais:

```
app/components/campaign/PlayerSheet.vue  (~1206 linhas)
   Reformulação completa da ficha V5
   Todas as mudanças de layout, campos e visual

app/types/index.ts
   Interface CharacterSheet atualizada
   Campos removidos: healthLevels, trueAge, apparentAge, dateOfBirth, dateOfDeath
   Campos adicionados: embraceGeneration, hunger, conditions, vitality

app/pages/campaign/[id]/player.vue  (~851 linhas, NÃO modificado nesta sessão)
   Dashboard do jogador - já suportava fome, condições, humanidade, vontade
```

### Campos da Interface CharacterSheet (estado final):
```typescript
export interface CharacterSheet {
  // Cabeçalho
  name: string; concept: string; clan: string
  generation: number; sect: string; haven: string; player: string
  avatar?: string

  // Campos V5
  resonance?: string; chronicleTenets?: string
  touchstonesConvictions?: string; clanBane?: string
  advantages?: Array<{ name: string; level: number }>
  bloodPotency?: number; bloodSurge?: string
  powerBonus?: string; feedingPenalty?: string; baneSeverity?: string

  // Informações pessoais
  embraceGeneration?: string  // "Cria (Childer)", "Neófito (Neonate)", "Ancião (Ancilla)"
  appearance?: string; distinguishingFeatures?: string; history?: string

  // Mecânicas
  attributes: { physical, social, mental }
  skills: { talents, skills, knowledges }
  disciplines: Array<{ name: string; level: number }>
  virtues: { conscience: number; selfControl: number; courage: number }
  humanity: number; willpower: number
  vitality?: number   // 0-10
  hunger?: number     // 0-5, padrão 1
  conditions?: string[]

  // Experiência
  xpTotal?: number; xpAvailable?: number; xpSpent?: number
  notes?: string
}
```

---

##  PONTOS IMPORTANTES PARA CONTINUAÇÃO

### 1. NPCSheet.vue ainda usa modelo antigo
O arquivo `app/components/campaign/master/NPCSheet.vue` **NÃO foi atualizado** nesta sessão. Ele ainda pode ter campos `healthLevels` e layout antigo. Se precisar atualizar a ficha de NPC para V5, usar PlayerSheet.vue como referência.

### 2. Fluxo de dados do Dashboard do Jogador
O `player.vue` lê os dados da ficha assim:
```typescript
// player.vue - leitura de dados
const hunger = computed(() => playerData.value?.sheet?.hunger ?? 1)
const humanity = computed(() => playerData.value?.sheet?.humanity ?? 7)
const willpower = computed(() => playerData.value?.sheet?.willpower ?? 3)
const conditions = computed(() => playerData.value?.sheet?.conditions ?? [])
```

O salvamento funciona assim:
```typescript
// player.vue - salvamento
const saveCharacterSheet = async (updatedPlayer) => {
  await savePlayerSheet(campaignId, playerId, updatedPlayer.sheet)
  await loadCampaignData() // recarrega tudo do banco
}
```

### 3. Padrões de desenvolvimento a seguir
- **Imports**: Sempre explícitos, não confiar no auto-import do Nuxt 4
- **Navegação**: Usar `navigateTo()` e nunca `$router.push()`
- **Botões**: Sempre usar `<BaseButton>` com variantes
- **Modais**: Sem `<Teleport>`, usar z-index adequado
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
