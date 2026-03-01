const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Create milestone for a project
const createMilestone = async (req, res) => {
  try {
    const { project_id, title, description, target_date, amount_required, release_percentage } = req.body;

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

    // Get current max order_index
    const { data: lastMilestone } = await supabase
      .from('milestones')
      .select('order_index')
      .eq('project_id', project_id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const orderIndex = lastMilestone ? lastMilestone.order_index + 1 : 0;

    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert({
        id: uuidv4(),
        project_id,
        title,
        description,
        target_date,
        amount_required,
        release_percentage,
        order_index: orderIndex,
        is_completed: false
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(milestone);
  } catch (error) {
    console.error('CreateMilestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update milestone
const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_date, amount_required, release_percentage, is_completed } = req.body;

    // Get milestone with project info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*, project:projects(user_id)')
      .eq('id', id)
      .single();

    if (milestoneError || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (milestone.project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { data: updatedMilestone, error } = await supabase
      .from('milestones')
      .update({
        title,
        description,
        target_date,
        amount_required,
        release_percentage,
        is_completed
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(updatedMilestone);
  } catch (error) {
    console.error('UpdateMilestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete milestone
const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;

    // Get milestone with project info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*, project:projects(user_id)')
      .eq('id', id)
      .single();

    if (milestoneError || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (milestone.project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await supabase.from('milestones').delete().eq('id', id);

    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('DeleteMilestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get milestones for a project
const getProjectMilestones = async (req, res) => {
  try {
    const { project_id } = req.params;

    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', project_id)
      .order('order_index', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(milestones || []);
  } catch (error) {
    console.error('GetProjectMilestones error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark milestone as completed (with evidence)
const completeMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { evidence_description, evidence_url } = req.body;

    // Get milestone with project info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*, project:projects(user_id, current_amount, goal_amount)')
      .eq('id', id)
      .single();

    if (milestoneError || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (milestone.project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if funding progress meets milestone requirement
    const progressPercentage = (milestone.project.current_amount / milestone.project.goal_amount) * 100;
    
    if (progressPercentage < milestone.release_percentage) {
      return res.status(400).json({ 
        error: 'Funding progress does not meet milestone requirement',
        current_progress: progressPercentage,
        required: milestone.release_percentage
      });
    }

    const { data: updatedMilestone, error } = await supabase
      .from('milestones')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        evidence_description,
        evidence_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: 'Milestone completed successfully',
      milestone: updatedMilestone
    });
  } catch (error) {
    console.error('CompleteMilestone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getProjectMilestones,
  completeMilestone
};
