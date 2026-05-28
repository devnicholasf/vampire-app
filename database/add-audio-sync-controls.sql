-- ============================================================
-- Migration: Adicionar controle de reprodução de áudio
-- Permite sincronizar play/pause/volume/tempo entre mestre e jogadores
-- Execute no Supabase SQL Editor.
-- ============================================================

ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_audio_playing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_audio_time FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_audio_volume INTEGER DEFAULT 20;

-- Comentários explicativos
COMMENT ON COLUMN live_game_state.current_audio_playing IS 'Se true, a música está tocando para todos';
COMMENT ON COLUMN live_game_state.current_audio_time IS 'Tempo atual da reprodução em segundos';
COMMENT ON COLUMN live_game_state.current_audio_volume IS 'Volume do áudio (0-100)';

-- Atualizar linhas existentes
UPDATE live_game_state
SET
  current_audio_playing = COALESCE(current_audio_playing, false),
  current_audio_time = COALESCE(current_audio_time, 0),
  current_audio_volume = COALESCE(current_audio_volume, 20)
WHERE 
  current_audio_playing IS NULL 
  OR current_audio_time IS NULL 
  OR current_audio_volume IS NULL;
