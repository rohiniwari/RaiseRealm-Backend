const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Create reward for a project
const createReward = async (req, res) => {
  try {
    const { project_id, title, description, min_amount, max_backers } = req.body;

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: reward, error } = await supabase
      .from('rewards')
      .insert({
        id: uuidv4(),
        project_id,
        title,
        description,
        min_amount,
        max_backers: max_backers || null,
        current_backers: 0
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(reward);
  } catch (error) {
    console.error('CreateReward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update reward
const updateReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, min_amount, max_backers } = req.body;

    // Get reward with project info
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*, project:projects(user_id)')
      .eq('id', id)
      .single();

    if (rewardError || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: updatedReward, error } = await supabase
      .from('rewards')
      .update({
        title,
        description,
        min_amount,
        max_backers
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(updatedReward);
  } catch (error) {
    console.error('UpdateReward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete reward
const deleteReward = async (req, res) => {
  try {
    const { id } = req.params;

    // Get reward with project info
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*, project:projects(user_id)')
      .eq('id', id)
      .single();

    if (rewardError || !reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if anyone has claimed this reward
    const { count } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('reward_id', id);

    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete reward with existing backers' });
    }

    await supabase.from('rewards').delete().eq('id', id);

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('DeleteReward error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get rewards for a project
const getProjectRewards = async (req, res) => {
  try {
    const { project_id } = req.params;

    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('project_id', project_id)
      .order('min_amount', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(rewards || []);
  } catch (error) {
    console.error('GetProjectRewards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createReward,
  updateReward,
  deleteReward,
  getProjectRewards
};
