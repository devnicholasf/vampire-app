-- ============================================
-- Add new NPC fields: sect, status, role, motivation, secret, main_pool
-- Run this in your Supabase SQL Editor
-- ============================================

ALTER TABLE npcs ADD COLUMN IF NOT EXISTS sect VARCHAR(100);
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS threat VARCHAR(50) DEFAULT 'moderado';
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS role VARCHAR(255);
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS secret TEXT;
ALTER TABLE npcs ADD COLUMN IF NOT EXISTS main_pool VARCHAR(255);
