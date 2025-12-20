-- Migration: Gamification Schema
-- Description: Adds columns to profiles and creates tables for achievements and goals.

-- 1. Add columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_level_xp integer DEFAULT 1000;

-- 2. Create Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text, -- Lucide icon name
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. Create User Achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- 4. Create Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  deadline timestamptz,
  status text DEFAULT 'active', -- active, completed, expired
  created_at timestamptz DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Achievements: Everyone can view
CREATE POLICY "Authenticated users can view achievements" ON achievements
  FOR SELECT TO authenticated USING (true);

-- User Achievements: Users view their own
CREATE POLICY "Users view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Goals: Users view/edit their own
CREATE POLICY "Users view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
