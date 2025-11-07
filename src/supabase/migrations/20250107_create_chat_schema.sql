/*
  # Create Chat Application Schema

  1. New Tables
    - `demo_users`
      - `id` (uuid, primary key, auto-generated)
      - `demo_id` (text, unique, not null) - Demo user identifier
      - `password` (text, not null) - Demo password (plain text for demo purposes)
      - `username` (text, not null) - Display name
      - `avatar_url` (text, nullable) - User avatar URL
      - `created_at` (timestamptz, default now())

    - `chats`
      - `id` (uuid, primary key, auto-generated)
      - `demo_user_id` (uuid, foreign key to demo_users)
      - `title` (text, not null) - Auto-generated or first message preview
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `messages`
      - `id` (uuid, primary key, auto-generated)
      - `chat_id` (uuid, foreign key to chats)
      - `role` (text, not null) - 'user' or 'assistant'
      - `content` (text, not null) - Message content
      - `created_at` (timestamptz, default now())

  2. Security
    - Tables are public for demo purposes (no RLS)
    - In production, you would enable RLS and proper authentication

  3. Sample Data
    - Insert a demo user for testing
*/

CREATE TABLE IF NOT EXISTS demo_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id text UNIQUE NOT NULL,
  password text NOT NULL,
  username text NOT NULL,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_user_id uuid REFERENCES demo_users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chats_demo_user_id ON chats(demo_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

INSERT INTO demo_users (demo_id, password, username, avatar_url)
VALUES ('demo', 'demo123', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo')
ON CONFLICT (demo_id) DO NOTHING;
