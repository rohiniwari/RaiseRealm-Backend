const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Get all projects with filters
const getProjects = async (req, res) => {
  try {
    const { category, search, sort, limit = 20, offset = 0 } = req.query;

    // Simple query first
    let query = supabase
      .from('projects')
      .select('*')
      .eq('status', 'active');

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Search by title or description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort options
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('current_amount', { ascending: false });
        break;
      case 'ending':
        query = query.order('end_date', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: projects, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get creator info for each project
    const formattedProjects = await Promise.all(projects.map(async (project) => {
      // Get creator info
      const { data: user } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', project.user_id)
        .single();

      // Get backer count
      const { count: backerCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      return {
        ...project,
        backer_count: backerCount || 0,
        creator: user || null
      };
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('GetProjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        user:users(id, name, avatar_url),
        milestones(*),
        rewards(*)
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get contributions for this project
    const { data: contributions } = await supabase
      .from('contributions')
      .select(`
        *,
        user:users(id, name, avatar_url),
        reward:rewards(title)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get backer count
    const { count } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    // Get comment count
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    res.json({
      ...project,
      backer_count: count || 0,
      comment_count: commentCount || 0,
      recent_contributions: contributions || [],
      creator: project.user
    });
  } catch (error) {
    console.error('GetProjectById error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { title, description, category, goal_amount, image_url, end_date, rewards, milestones } = req.body;

    const projectId = uuidv4();

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        user_id: req.user.id,
        title,
        description,
        category,
        goal_amount,
        current_amount: 0,
        image_url,
        end_date,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Add rewards if provided
    if (rewards && rewards.length > 0) {
      const rewardsData = rewards.map(reward => ({
        id: uuidv4(),
        project_id: projectId,
        title: reward.title,
        description: reward.description,
        min_amount: reward.min_amount,
        max_backers: reward.max_backers || null,
        current_backers: 0
      }));

      await supabase.from('rewards').insert(rewardsData);
    }

    // Add milestones if provided
    if (milestones && milestones.length > 0) {
      const milestonesData = milestones.map((milestone, index) => ({
        id: uuidv4(),
        project_id: projectId,
        title: milestone.title,
        description: milestone.description,
        target_date: milestone.target_date,
        amount_required: milestone.amount_required,
        release_percentage: milestone.release_percentage || Math.floor(100 / milestones.length),
        order_index: index,
        is_completed: false
      }));

      await supabase.from('milestones').insert(milestonesData);
    }

    // Fetch the created project with all relations
    const { data: fullProject } = await supabase
      .from('projects')
      .select(`
        *,
        user:users(id, name, avatar_url),
        milestones(*),
        rewards(*)
      `)
      .eq('id', projectId)
      .single();

    res.status(201).json(fullProject);
  } catch (error) {
    console.error('CreateProject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, goal_amount, image_url, end_date, status } = req.body;

    // Check ownership
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        category,
        goal_amount,
        image_url,
        end_date,
        status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(project);
  } catch (error) {
    console.error('UpdateProject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const { data: existingProject } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete related records first
    await supabase.from('contributions').delete().eq('project_id', id);
    await supabase.from('comments').delete().eq('project_id', id);
    await supabase.from('milestones').delete().eq('project_id', id);
    await supabase.from('rewards').delete().eq('project_id', id);
    await supabase.from('projects').delete().eq('id', id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('DeleteProject error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's projects
const getUserProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get backer count and total raised for each project
    const formattedProjects = await Promise.all(projects.map(async (project) => {
      const { count: backerCount } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount')
        .eq('project_id', project.id);

      const totalRaised = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;

      // Get milestones and rewards
      const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index');

      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('project_id', project.id);

      return {
        ...project,
        milestones: milestones || [],
        rewards: rewards || [],
        backer_count: backerCount || 0,
        total_raised: totalRaised
      };
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('GetUserProjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get projects user has backed
const getBackedProjects = async (req, res) => {
  try {
    const { data: contributions } = await supabase
      .from('contributions')
      .select(`
        *,
        project:projects(*, user:users(name, avatar_url))
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    const projectsMap = new Map();
    contributions.forEach(contribution => {
      if (!projectsMap.has(contribution.project_id)) {
        projectsMap.set(contribution.project_id, {
          ...contribution.project,
          contributed_amount: 0,
          contribution_date: contribution.created_at
        });
      }
      projectsMap.get(contribution.project_id).contributed_amount += contribution.amount;
    });

    res.json(Array.from(projectsMap.values()));
  } catch (error) {
    console.error('GetBackedProjects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
  getBackedProjects
};
