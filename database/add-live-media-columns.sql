-- ============================================================
-- Migration: Adicionar colunas de mídia ao live_game_state
-- Permite ao mestre transmitir imagem e áudio para os jogadores
-- durante a sessão ao vivo.
-- Execute no Supabase SQL Editor.
-- ============================================================

ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '';

-- Limpar valores nulos em linhas existentes
UPDATE live_game_state
SET
  current_image_url = COALESCE(current_image_url, ''),
  current_audio_url  = COALESCE(current_audio_url, '')
WHERE current_image_url IS NULL OR current_audio_url IS NULL;
