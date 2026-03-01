-- RaiseRealm Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  goal_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'funded', 'failed', 'cancelled')),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  amount_required DECIMAL(12, 2),
  release_percentage INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  evidence_description TEXT,
  evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  min_amount DECIMAL(12, 2) NOT NULL,
  max_backers INTEGER,
  current_backers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method TEXT DEFAULT 'card',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Impact Reports table (for post-funding reporting)
CREATE TABLE IF NOT EXISTS impact_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_rewards_project_id ON rewards(project_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_project_id ON contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_reports_project_id ON impact_reports(project_id);

-- Row Level Security (RLS) - Enable security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all, update their own
CREATE POLICY "Users can read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects: Everyone can read, only owners can create/update/delete
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Milestones: Everyone can read, only project owners can manage
CREATE POLICY "Milestones are viewable by everyone" ON milestones FOR SELECT USING (true);
CREATE POLICY "Project owners can manage milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = milestones.project_id AND user_id = auth.uid())
);

-- Rewards: Everyone can read, only project owners can manage
CREATE POLICY "Rewards are viewable by everyone" ON rewards FOR SELECT USING (true);
CREATE POLICY "Project owners can manage rewards" ON rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = rewards.project_id AND user_id = auth.uid())
);

-- Contributions: Users can read own, create, only project owners can read all
CREATE POLICY "Users can view own contributions" ON contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contributions" ON contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owners can view contributions" ON contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = contributions.project_id AND user_id = auth.uid())
);

-- Comments: Everyone can read, authenticated users can create, only own can delete
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Impact Reports: Everyone can read, only project owners can manage
CREATE POLICY "Impact reports are viewable by everyone" ON impact_reports FOR SELECT USING (true);
CREATE POLICY "Project owners can manage impact reports" ON impact_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = impact_reports.project_id AND user_id = auth.uid())
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'technology') THEN
    -- Categories are stored as text, no enum needed
  END IF;
END
$$;

-- Note: The application uses text field for categories
-- Valid categories: technology, art, film, music, games, design, food, fashion, photography, publishing, community

-- ============================================
-- RPC Functions for Payment System
-- ============================================

-- Function to increment project current_amount
CREATE OR REPLACE FUNCTION increment_project_amount(project_id UUID, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE projects
  SET current_amount = current_amount + amount
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment reward backers count
CREATE OR REPLACE FUNCTION increment_reward_backers(reward_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rewards
  SET current_backers = current_backers + 1
  WHERE id = reward_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
