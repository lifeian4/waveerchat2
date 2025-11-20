-- NOTE: This assumes you already have a profiles table in Supabase
-- If not, create it with these fields:
-- id (UUID, Primary Key)
-- email (VARCHAR, Unique)
-- password_hash (VARCHAR)
-- full_name (VARCHAR) - or use 'name' field
-- avatar_url (TEXT)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)

-- Create refresh tokens table for token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Create OAuth sessions table for state management
CREATE TABLE IF NOT EXISTS oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  redirect_uri TEXT NOT NULL,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create index on state
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_state ON oauth_sessions(state);

-- NOTE: Add sample test user to your profiles table if needed
-- INSERT INTO profiles (email, password_hash, full_name, avatar_url)
-- VALUES (
--   'test@waveerchat.com',
--   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1Fm',
--   'Test User',
--   'https://ui-avatars.com/api/?name=Test+User&background=random'
-- )
-- ON CONFLICT (email) DO NOTHING;
