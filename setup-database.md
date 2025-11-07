# Database Setup Instructions

To set up the database for this chat application, you need to run the following SQL in your Supabase SQL Editor:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the SQL Editor
4. Create a new query and paste the following SQL:

```sql
-- Create demo_users table
CREATE TABLE IF NOT EXISTS demo_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id text UNIQUE NOT NULL,
  password text NOT NULL,
  username text NOT NULL,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_user_id uuid REFERENCES demo_users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chats_demo_user_id ON chats(demo_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

-- Insert demo user
INSERT INTO demo_users (demo_id, password, username, avatar_url)
VALUES ('demo', 'demo123', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo')
ON CONFLICT (demo_id) DO NOTHING;
```

5. Click "Run" to execute the SQL

## Demo Login Credentials

After running the SQL above, you can log in with:
- Demo ID: `demo`
- Password: `demo123`

## Guest Mode

You can also use the app in guest mode (without login) which allows chatting but doesn't save history.
