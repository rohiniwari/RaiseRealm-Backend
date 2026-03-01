const supabase = require('../config/supabase');

class Contribution {
  static tableName = 'contributions';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, name, avatar_url),
        project:projects(id, title, image_url),
        reward:rewards(title)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project:projects(id, title, image_url, current_amount, goal_amount),
        reward:rewards(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findByProjectId(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        user:users(id, name, avatar_url),
        reward:rewards(title)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(contributionData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(contributionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getProjectStats(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('amount, user_id')
      .eq('project_id', projectId);
    
    if (error) throw error;

    const totalAmount = data.reduce((sum, c) => sum + c.amount, 0);
    const uniqueBackers = new Set(data.map(c => c.user_id)).size;

    return {
      total_amount: totalAmount,
      backer_count: uniqueBackers,
      contribution_count: data.length
    };
  }

  static async getBackedProjects(userId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project:projects(*, user:users(name, avatar_url))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

module.exports = Contribution;
