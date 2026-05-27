-- Adicionar campo show_territory_map à tabela live_game_state
ALTER TABLE live_game_state 
ADD COLUMN IF NOT EXISTS show_territory_map boolean DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN live_game_state.show_territory_map IS 'Se true, o mapa de territórios é exibido para os jogadores';
