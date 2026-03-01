const supabase = require('../config/supabase');

class Comment {
  static tableName = 'comments';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, user:users(id, name, avatar_url)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByProjectId(projectId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async create(commentData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(commentData)
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async getCommentCount(projectId) {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    
    if (error) throw error;
    return count || 0;
  }
}

module.exports = Comment;
