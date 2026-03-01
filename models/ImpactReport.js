const supabase = require('../config/supabase');

class ImpactReport {
  static tableName = 'impact_reports';

  static async findById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
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
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(reportData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(reportData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, reportData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(reportData)
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

  static async getByCreator(creatorId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        project:projects(id, title, current_amount, goal_amount, status)
      `)
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async aggregateMetrics(projectIds) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('metrics')
      .in('project_id', projectIds);
    
    if (error) throw error;

    const aggregatedMetrics = {};
    data.forEach(report => {
      if (report.metrics) {
        Object.entries(report.metrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            aggregatedMetrics[key] = (aggregatedMetrics[key] || 0) + value;
          }
        });
      }
    });

    return aggregatedMetrics;
  }
}

module.exports = ImpactReport;
