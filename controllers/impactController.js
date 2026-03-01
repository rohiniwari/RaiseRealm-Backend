const supabase = require('../config/supabase');

// Create impact report
const createImpactReport = async (req, res) => {
  try {
    const { project_id, title, description, metrics, media_urls } = req.body;
    const userId = req.user.id;

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id, status')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== userId) {
      return res.status(403).json({ error: 'Only project creator can add impact reports' });
    }

    if (project.status !== 'funded' && project.status !== 'completed') {
      return res.status(400).json({ error: 'Impact reports can only be added to funded or completed projects' });
    }

    const { data: report, error } = await supabase
      .from('impact_reports')
      .insert({
        project_id,
        title,
        description,
        metrics: metrics || {},
        media_urls: media_urls || [],
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Impact report created successfully',
      report
    });
  } catch (error) {
    console.error('Create impact report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get impact reports for a project
const getProjectImpactReports = async (req, res) => {
  try {
    const { project_id } = req.params;

    const { data: reports, error } = await supabase
      .from('impact_reports')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(reports);
  } catch (error) {
    console.error('Get impact reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single impact report
const getImpactReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: report, error } = await supabase
      .from('impact_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      return res.status(404).json({ error: 'Impact report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get impact report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update impact report
const updateImpactReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, metrics, media_urls } = req.body;
    const userId = req.user.id;

    // Verify user owns the report
    const { data: existingReport, error: fetchError } = await supabase
      .from('impact_reports')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return res.status(404).json({ error: 'Impact report not found' });
    }

    if (existingReport.created_by !== userId) {
      return res.status(403).json({ error: 'Only the creator can update this report' });
    }

    const { data: report, error } = await supabase
      .from('impact_reports')
      .update({
        title,
        description,
        metrics,
        media_urls,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: 'Impact report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update impact report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete impact report
const deleteImpactReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user owns the report
    const { data: existingReport, error: fetchError } = await supabase
      .from('impact_reports')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingReport) {
      return res.status(404).json({ error: 'Impact report not found' });
    }

    if (existingReport.created_by !== userId) {
      return res.status(403).json({ error: 'Only the creator can delete this report' });
    }

    const { error } = await supabase
      .from('impact_reports')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Impact report deleted successfully' });
  } catch (error) {
    console.error('Delete impact report error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get impact dashboard stats for creator
const getCreatorImpactStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all projects by creator
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, current_amount, goal_amount, status')
      .eq('user_id', userId);

    if (projectsError) {
      return res.status(500).json({ error: projectsError.message });
    }

    // Get impact reports for all projects
    const projectIds = projects.map(p => p.id);
    const { data: reports, error: reportsError } = await supabase
      .from('impact_reports')
      .select('*')
      .in('project_id', projectIds);

    if (reportsError) {
      return res.status(500).json({ error: reportsError.message });
    }

    // Calculate stats
    const totalProjects = projects.length;
    const fundedProjects = projects.filter(p => p.status === 'funded' || p.status === 'completed').length;
    const totalRaised = projects.reduce((sum, p) => sum + (p.current_amount || 0), 0);
    const totalReports = reports.length;

    // Aggregate metrics across all reports
    const aggregatedMetrics = {};
    reports.forEach(report => {
      if (report.metrics) {
        Object.entries(report.metrics).forEach(([key, value]) => {
          if (typeof value === 'number') {
            aggregatedMetrics[key] = (aggregatedMetrics[key] || 0) + value;
          }
        });
      }
    });

    res.json({
      overview: {
        totalProjects,
        fundedProjects,
        totalRaised,
        totalReports
      },
      projects: projects.map(project => ({
        ...project,
        reports: reports.filter(r => r.project_id === project.id)
      })),
      aggregatedMetrics
    });
  } catch (error) {
    console.error('Get creator impact stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createImpactReport,
  getProjectImpactReports,
  getImpactReportById,
  updateImpactReport,
  deleteImpactReport,
  getCreatorImpactStats
};
