const supabase = require('../config/supabase');

class User {
  static tableName = 'users';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return data;
  }

  static async create(userData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, userData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getUserContributions(userId) {
    const { data, error } = await supabase
      .from('contributions')
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
}

module.exports = User;
