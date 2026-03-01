-- Fix remaining RLS policies - run this in Supabase SQL Editor
-- This handles the case where some policies already exist

-- Users policies (public profile viewing, authenticated user management)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view users' AND tablename = 'users') THEN
    CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create users' AND tablename = 'users') THEN
    CREATE POLICY "Anyone can create users" ON users FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'users') THEN
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Projects policies (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view projects' AND tablename = 'projects') THEN
    CREATE POLICY "Anyone can view projects" ON projects FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create projects' AND tablename = 'projects') THEN
    CREATE POLICY "Anyone can create projects" ON projects FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can update projects' AND tablename = 'projects') THEN
    CREATE POLICY "Anyone can update projects" ON projects FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete projects' AND tablename = 'projects') THEN
    CREATE POLICY "Anyone can delete projects" ON projects FOR DELETE USING (true);
  END IF;
END $$;

-- Milestones policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view milestones' AND tablename = 'milestones') THEN
    CREATE POLICY "Anyone can view milestones" ON milestones FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can manage milestones' AND tablename = 'milestones') THEN
    CREATE POLICY "Anyone can manage milestones" ON milestones FOR ALL USING (true);
  END IF;
END $$;

-- Rewards policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view rewards' AND tablename = 'rewards') THEN
    CREATE POLICY "Anyone can view rewards" ON rewards FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can manage rewards' AND tablename = 'rewards') THEN
    CREATE POLICY "Anyone can manage rewards" ON rewards FOR ALL USING (true);
  END IF;
END $$;

-- Contributions policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view contributions' AND tablename = 'contributions') THEN
    CREATE POLICY "Anyone can view contributions" ON contributions FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create contributions' AND tablename = 'contributions') THEN
    CREATE POLICY "Anyone can create contributions" ON contributions FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can manage contributions' AND tablename = 'contributions') THEN
    CREATE POLICY "Anyone can manage contributions" ON contributions FOR ALL USING (true);
  END IF;
END $$;

-- Comments policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view comments' AND tablename = 'comments') THEN
    CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create comments' AND tablename = 'comments') THEN
    CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can delete comments' AND tablename = 'comments') THEN
    CREATE POLICY "Anyone can delete comments" ON comments FOR DELETE USING (true);
  END IF;
END $$;

-- Impact reports policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view impact reports' AND tablename = 'impact_reports') THEN
    CREATE POLICY "Anyone can view impact reports" ON impact_reports FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can manage impact reports' AND tablename = 'impact_reports') THEN
    CREATE POLICY "Anyone can manage impact reports" ON impact_reports FOR ALL USING (true);
  END IF;
END $$;

SELECT 'RLS policies created successfully!' as result;
