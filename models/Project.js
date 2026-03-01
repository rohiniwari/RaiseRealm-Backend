const supabase = require('../config/supabase');

class Project {
  static tableName = 'projects';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, name, avatar_url),
        milestones(*),
        rewards(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findAll(filters = {}) {
    let query = supabase
      .from(this.tableName)
      .select('*');

    // Filter by status
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Search by title or description
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Sort options
    switch (filters.sort) {
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

    // Pagination
    if (filters.limit) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async create(projectData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(projectData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, projectData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(projectData)
      .eq('id', id)
      .select()
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

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getBackerCount(projectId) {
    const { count, error } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    
    if (error) throw error;
    return count || 0;
  }

  static async getCommentCount(projectId) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    
    if (error) throw error;
    return count || 0;
  }

  static async updateAmount(id, amount) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ current_amount: amount })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async incrementAmount(id, amount) {
    const { data, error } = await supabase.rpc('increment_project_amount', {
      project_id: id,
      amount
    });
    
    if (error) throw error;
    return data;
  }
}

module.exports = Project;
