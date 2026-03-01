const supabase = require('../config/supabase');

class Reward {
  static tableName = 'rewards';

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
      .order('min_amount', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async create(rewardData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(rewardData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, rewardData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(rewardData)
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

  static async incrementBackers(id) {
    const { data, error } = await supabase.rpc('increment_reward_backers', {
      reward_id: id
    });
    
    if (error) throw error;
    return data;
  }

  static async hasBackers(id) {
    const { count, error } = await supabase
      .from('contributions')
      .select('*', { count: 'exact', head: true })
      .eq('reward_id', id);
    
    if (error) throw error;
    return count > 0;
  }
}

module.exports = Reward;
