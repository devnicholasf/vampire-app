-- ============================================
-- Allow users to remove accepted friends
-- ============================================

DROP POLICY IF EXISTS "Users can delete accepted friendships" ON friend_requests;

CREATE POLICY "Users can delete accepted friendships" ON friend_requests
  FOR DELETE TO authenticated
  USING (
    status = 'accepted'
    AND (
      requester_id = auth.uid()
      OR receiver_id = auth.uid()
    )
  );
