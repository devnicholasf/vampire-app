# 📁 Database Scripts

Esta pasta contém todos os scripts SQL para configuração e manutenção do banco de dados Supabase.

## 📋 Arquivos

### `supabase-schema.sql`
- **Propósito**: Schema completo do banco de dados
- **Conteúdo**: Tabelas, índices, triggers, RLS inicial
- **Status**: ✅ Executado com sucesso

### `supabase-clean-and-fix.sql` 
- **Propósito**: Limpeza e correção das políticas RLS
- **Conteúdo**: Remove políticas conflitantes, cria políticas simples
- **Status**: ✅ Executado com sucesso - **USAR ESTE**

### `supabase-fix-policies.sql` 
- **Propósito**: Tentativa de correção inicial (OBSOLETO)
- **Status**: ❌ Não funcionou - causava recursão infinita

### `supabase-disable-rls.sql`
- **Propósito**: Desabilitar RLS temporariamente 
- **Status**: 🚫 Para emergências apenas

## 🎯 Estado Atual

- ✅ RLS configurado corretamente com políticas simples
- ✅ Usuários só veem campanhas onde são mestres  
- ✅ Sistema funcionando sem recursão infinita

## 🔄 Para Novos Desenvolvedores

1. Execute apenas `supabase-schema.sql` (se começando do zero)
2. Execute `supabase-clean-and-fix.sql` (se houver problemas com RLS)
3. **Não execute os outros scripts** - são histórico de debug

## 📝 Organização de Scripts

### Migrations (Features)
Scripts que adicionam novas funcionalidades ao banco:
- `add-campaign-events.sql` - Sistema de eventos da crônica
- `add-campaign-media-storage.sql` - Storage de mídias
- `add-invite-code.sql` - Códigos de convite
- `add-live-media-columns.sql` - Colunas para sessão ao vivo
- `add-npc-fields.sql` - Campos extras de NPCs
- `add-player-sheet-column.sql` - Coluna da ficha do jogador
- `campaign-invites.sql` - Sistema de convites

### Fixes
Scripts que corrigem bugs ou problemas:
- `fix-invite-campaign-name.sql` - Correção do nome na tabela de convites
- `fix-invite-code-policy.sql` - Correção de política RLS de convites
- `fix-player-update-policy.sql` - Correção de política de update de jogadores

### Utilitários
- `supabase-disable-rls.sql` - ⚠️ **Emergências apenas** - Desabilita RLS
- `check-player-data.sql` - Queries de diagnóstico (não commitado)
- `add-test-player.sql` - Dados de teste (não commitado)

**Nota**: Scripts `*-local.sql` e `*-debug.sql` são ignorados pelo git.