const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');

// Get comments for a project
const getProjectComments = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(comments || []);
  } catch (error) {
    console.error('GetProjectComments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a comment
const createComment = async (req, res) => {
  try {
    const { project_id, content, parent_id } = req.body;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        id: uuidv4(),
        user_id: req.user.id,
        project_id,
        content,
        parent_id: parent_id || null,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('CreateComment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (commentError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only the comment author can delete
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await supabase.from('comments').delete().eq('id', id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('DeleteComment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getProjectComments,
  createComment,
  deleteComment
};
