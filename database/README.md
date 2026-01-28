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