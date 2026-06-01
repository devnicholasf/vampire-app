-- ============================================
-- Friends + Direct Messages System
-- ============================================

-- 1) Public profile used by friend search
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Friend requests + friendship status
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT friend_requests_not_self CHECK (requester_id <> receiver_id)
);

-- One pending request per pair (direction-aware)
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_pending_unique
  ON friend_requests (requester_id, receiver_id)
  WHERE status = 'pending';

-- One accepted friendship per pair (direction-agnostic)
CREATE UNIQUE INDEX IF NOT EXISTS idx_friend_requests_accepted_pair_unique
  ON friend_requests (
    LEAST(requester_id, receiver_id),
    GREATEST(requester_id, receiver_id)
  )
  WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver  ON friend_requests(receiver_id, status, created_at DESC);

-- 3) Direct messages between friends
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT direct_messages_not_self CHECK (sender_id <> receiver_id),
  CONSTRAINT direct_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_created   ON direct_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_created ON direct_messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread_receiver  ON direct_messages(receiver_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
DROP POLICY IF EXISTS "Public can view user profiles" ON user_profiles;
CREATE POLICY "Public can view user profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- friend_requests policies
DROP POLICY IF EXISTS "Users can read own friend requests" ON friend_requests;
CREATE POLICY "Users can read own friend requests" ON friend_requests
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Receivers can respond to friend requests" ON friend_requests;
CREATE POLICY "Receivers can respond to friend requests" ON friend_requests
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- direct_messages policies
DROP POLICY IF EXISTS "Users can read own direct messages" ON direct_messages;
CREATE POLICY "Users can read own direct messages" ON direct_messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can send own direct messages" ON direct_messages;
CREATE POLICY "Users can send own direct messages" ON direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Receivers can mark messages as read" ON direct_messages;
CREATE POLICY "Receivers can mark messages as read" ON direct_messages
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- ============================================
-- updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
