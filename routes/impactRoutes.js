const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createImpactReport,
  getProjectImpactReports,
  getImpactReportById,
  updateImpactReport,
  deleteImpactReport,
  getCreatorImpactStats
} = require('../controllers/impactController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Impact report routes
router.post('/', createImpactReport);
router.get('/dashboard', getCreatorImpactStats);
router.get('/project/:project_id', getProjectImpactReports);
router.get('/:id', getImpactReportById);
router.put('/:id', updateImpactReport);
router.delete('/:id', deleteImpactReport);

module.exports = router;
