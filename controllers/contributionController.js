const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Make a contribution to a project
const createContribution = async (req, res) => {
  try {
    const { project_id, reward_id, amount, payment_method } = req.body;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if project is still active
    if (project.status !== 'active') {
      return res.status(400).json({ error: 'Project is not accepting contributions' });
    }

    // Check if project has ended
    if (new Date(project.end_date) < new Date()) {
      return res.status(400).json({ error: 'Project funding period has ended' });
    }

    // If reward is selected, verify it
    if (reward_id) {
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', reward_id)
        .eq('project_id', project_id)
        .single();

      if (rewardError || !reward) {
        return res.status(404).json({ error: 'Reward not found' });
      }

      // Check if reward is available
      if (reward.max_backers && reward.current_backers >= reward.max_backers) {
        return res.status(400).json({ error: 'Reward tier is fully backed' });
      }

      // Check minimum amount
      if (amount < reward.min_amount) {
        return res.status(400).json({ error: `Minimum contribution for this reward is $${reward.min_amount}` });
      }

      // Update reward backer count
      await supabase
        .from('rewards')
        .update({ current_backers: reward.current_backers + 1 })
        .eq('id', reward_id);
    }

    // Create contribution record
    const contributionId = uuidv4();
    const { data: contribution, error } = await supabase
      .from('contributions')
      .insert({
        id: contributionId,
        user_id: req.user.id,
        project_id,
        reward_id: reward_id || null,
        amount,
        payment_method: payment_method || 'card',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Update project current amount
    const newAmount = project.current_amount + amount;
    await supabase
      .from('projects')
      .update({ current_amount: newAmount })
      .eq('id', project_id);

    // Check if milestone should be triggered
    const progressPercentage = (newAmount / project.goal_amount) * 100;
    
    // Get milestones and check for release
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', project_id)
      .order('order_index', { ascending: true });

    for (const milestone of milestones) {
      if (!milestone.is_completed && progressPercentage >= milestone.release_percentage) {
        await supabase
          .from('milestones')
          .update({ is_completed: true })
          .eq('id', milestone.id);
      }
    }

    res.status(201).json({
      message: 'Contribution successful',
      contribution,
      project: {
        ...project,
        current_amount: newAmount
      }
    });
  } catch (error) {
    console.error('CreateContribution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's contributions
const getUserContributions = async (req, res) => {
  try {
    const { data: contributions, error } = await supabase
      .from('contributions')
      .select(`
        *,
        project:projects(id, title, image_url, current_amount, goal_amount),
        reward:rewards(title)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(contributions || []);
  } catch (error) {
    console.error('GetUserContributions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get contributions for a project (for project owner)
const getProjectContributions = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: contributions, error } = await supabase
      .from('contributions')
      .select(`
        *,
        user:users(id, name, email, avatar_url),
        reward:rewards(title)
      `)
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Calculate stats
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const uniqueBackers = new Set(contributions.map(c => c.user_id)).size;

    res.json({
      contributions: contributions || [],
      stats: {
        total_amount: totalAmount,
        backer_count: uniqueBackers,
        contribution_count: contributions.length
      }
    });
  } catch (error) {
    console.error('GetProjectContributions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createContribution,
  getUserContributions,
  getProjectContributions
};
