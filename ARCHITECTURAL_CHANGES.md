#  RELATÓRIO DE MUDANÇAS ARQUITETURAIS

**Data:** Fevereiro 12, 2026
**Versão:** 4.0.0 - Ficha V5 Completa

---

##  MUDANÇAS DA SESSÃO ATUAL (Fevereiro 2026)

### 1. Reformulação Completa da Ficha de Personagem V5

#### Componente: `PlayerSheet.vue` (~1206 linhas)

**ANTES (v3.0):**
- Ficha genérica com campos misturados (V20 + V5)
- Campo "Jogador" no cabeçalho
- Seção "Notas Gerais" no final
- Seção "Níveis de Saúde" (estilo V20)
- 4 campos de Idade e Datas
- Habilidades em ordem alfabética inglesa
- Disciplinas como campo de texto livre
- Sem Fome, Condições, Vitalidade
- Sem design visual vampírico

**DEPOIS (v4.0):**
- Ficha 100% V5 com layout oficial
- Campo "Jogador" removido
- "Notas Gerais" e "Níveis de Saúde" removidos
- "Geração do Abraço" (dropdown Cria/Neófito/Ancião) substituiu 4 campos
- Habilidades na ordem oficial V5 em PT-BR
- Disciplinas como dropdown (15 opções V5)
- Fome (5 bolinhas vermelhas, padrão 1)
- Condições Narrativas (lista dinâmica)
- Vitalidade (10 bolinhas verdes)
- Potência de Sangue (10 círculos + campos de modificadores)
- Vantagens & Defeitos (lista dinâmica com níveis)
- Avatar circular + nome vermelho grande no cabeçalho
- Borda vampírica vermelha com ornamentos nos cantos
- Sombra vermelha (glow) com box-shadow

### 2. Atualização da Interface TypeScript

#### Arquivo: `app/types/index.ts`

**Campos removidos:**
- `healthLevels` (não existe no V5)
- `trueAge` (substituído por embraceGeneration)
- `apparentAge` (substituído)
- `dateOfBirth` (substituído)
- `dateOfDeath` (substituído)

**Campos adicionados:**
- `embraceGeneration?: string`
- `hunger?: number`
- `conditions?: string[]`
- `vitality?: number`
- `bloodPotency?: number`
- `advantages?: Array<{ name: string; level: number }>`
- `bloodSurge?: string`
- `powerBonus?: string`
- `feedingPenalty?: string`
- `baneSeverity?: string`
- `resonance?: string`
- `chronicleTenets?: string`
- `touchstonesConvictions?: string`
- `clanBane?: string`
- `appearance?: string`
- `distinguishingFeatures?: string`

### 3. Layout Responsivo Reorganizado

**Grid do cabeçalho:**
```
ANTES: grid-cols-2 sm:grid-cols-4 (4 campos por linha)
DEPOIS: sm:grid-cols-3 (3 campos por linha, 2 linhas)
  Linha 1: Nome / Conceito / Clã
  Linha 2: Geração / Seita / Refúgio
```

**Grid principal (2 colunas):**
```
Grid 1:
  Esquerda: Disciplinas + Vantagens & Defeitos + Fome
  Direita:  Potência de Sangue + Experiência

Grid 2:
  Esquerda: Virtudes (3  5 amarelas)
  Direita:  Humanidade (10 vermelhas) + Vontade (10 azuis) + Vitalidade (10 verdes)
```

### 4. Design Visual Vampírico

```css
/* Borda principal */
border-4 border-red-900
box-shadow: 0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1)

/* Ornamentos nos cantos (fora do scroll) */
border-t-4 border-l-4 border-red-600 opacity-60

/* Nome do personagem */
text-xl sm:text-2xl md:text-4xl font-bold text-red-400 tracking-wider uppercase
```

---

##  MUDANÇAS DA SESSÃO ANTERIOR (Janeiro 2026)

### Integração Supabase
- Autenticação real com Supabase Auth
- Tabelas campaigns + campaign_players
- RLS policies implementadas
- 100% dos mocks removidos

### Sistema de Convites
- Códigos únicos de 6 caracteres
- Página /join-campaign
- Constraint UNIQUE anti-duplicata

### Otimizações Técnicas
- Imports explícitos em todos os componentes
- BaseButton reutilizado consistentemente
- vue-router substituído por navigateTo do Nuxt

---

##  BANCO DE DADOS

### Tabelas Supabase:

```sql
campaigns (
  id uuid PK, name text, description text,
  master_id uuid FK, invite_code text UNIQUE,
  is_active boolean, created_at timestamp, updated_at timestamp
)

campaign_players (
  user_id uuid FK, campaign_id uuid FK,
  character_name text, role text DEFAULT 'player',
  sheet jsonb,        -- Ficha V5 completa como JSON
  joined_at timestamp,
  UNIQUE(campaign_id, user_id)
)
```

### RLS Policies:
- campaigns: usuários veem apenas suas campanhas
- campaign_players: permissões por papel (mestre/jogador)

---

##  ESTADO VALIDADO

- Build sem erros (exit code 0)
- Nenhum campo antigo (trueAge, healthLevels etc.) restante nos arquivos
- TypeScript sem erros de tipo
- Ficha V5 funcional com salvamento e sync para dashboard
- Borda vampírica sem clipping no scroll
- Condições filtradas (vazias removidas) no salvamento
