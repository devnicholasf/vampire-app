-- ============================================
-- Migration: adicionar colunas de mídia em live_game_state
-- Execute no Supabase SQL Editor se quiser persistir
-- imagem e música de cena na sessão ao vivo.
-- ============================================

ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT,
  ADD COLUMN IF NOT EXISTS current_music_url TEXT;
