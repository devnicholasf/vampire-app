-- ============================================================
-- Migration: Atualizar volume padrão de áudio para 20%
-- Execute no Supabase SQL Editor após add-audio-sync-controls.sql
-- ============================================================

-- Atualizar todas as linhas existentes para volume 20% se estiverem em 50%
UPDATE live_game_state
SET current_audio_volume = 20
WHERE current_audio_volume = 50 OR current_audio_volume IS NULL;

-- Alterar o default da coluna para novas linhas
ALTER TABLE live_game_state 
  ALTER COLUMN current_audio_volume SET DEFAULT 20;
