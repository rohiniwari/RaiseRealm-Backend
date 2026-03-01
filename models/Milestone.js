const supabase = require('../config/supabase');

class Milestone {
  static tableName = 'milestones';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, project:projects(user_id)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByProjectId(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async create(milestoneData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(milestoneData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, milestoneData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(milestoneData)
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

  static async complete(id, evidenceData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        ...evidenceData
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getLastOrderIndex(projectId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('order_index')
      .eq('project_id', projectId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    if (error) return null;
    return data?.order_index || 0;
  }
}

module.exports = Milestone;
