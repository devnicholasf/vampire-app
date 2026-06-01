-- ============================================
-- User Friend Code (unique invite code)
-- ============================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS friend_code VARCHAR(12);

CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE OR REPLACE FUNCTION set_user_friend_code()
RETURNS TRIGGER AS $$
DECLARE
  candidate TEXT;
  tries INTEGER := 0;
BEGIN
  IF NEW.friend_code IS NOT NULL AND length(trim(NEW.friend_code)) > 0 THEN
    NEW.friend_code := upper(trim(NEW.friend_code));
    RETURN NEW;
  END IF;

  LOOP
    candidate := generate_friend_code();
    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE friend_code = candidate
    );

    tries := tries + 1;
    IF tries > 20 THEN
      RAISE EXCEPTION 'Could not generate unique friend_code after % tries', tries;
    END IF;
  END LOOP;

  NEW.friend_code := candidate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_friend_code_trigger ON user_profiles;
CREATE TRIGGER set_user_friend_code_trigger
  BEFORE INSERT OR UPDATE OF friend_code ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_friend_code();

-- Backfill existing users without code
DO $$
DECLARE
  r RECORD;
  candidate TEXT;
  tries INTEGER;
BEGIN
  FOR r IN
    SELECT user_id
    FROM user_profiles
    WHERE friend_code IS NULL OR length(trim(friend_code)) = 0
  LOOP
    tries := 0;
    LOOP
      candidate := generate_friend_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE friend_code = candidate
      );

      tries := tries + 1;
      IF tries > 20 THEN
        RAISE EXCEPTION 'Could not backfill unique friend_code for user %', r.user_id;
      END IF;
    END LOOP;

    UPDATE user_profiles
    SET friend_code = candidate
    WHERE user_id = r.user_id;
  END LOOP;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_friend_code_unique
  ON user_profiles (friend_code)
  WHERE friend_code IS NOT NULL;
