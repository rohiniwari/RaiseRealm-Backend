const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getProjectMilestones,
  completeMilestone
} = require('../controllers/milestoneController');

const router = express.Router();

// Validation rules
const milestoneValidation = [
  body('project_id').notEmpty().withMessage('Project ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('amount_required').isNumeric().withMessage('Amount required must be a number'),
  body('release_percentage').isNumeric().withMessage('Release percentage must be a number')
];

// Routes
router.get('/project/:project_id', getProjectMilestones);
router.post('/', authMiddleware, milestoneValidation, validate, createMilestone);
router.put('/:id', authMiddleware, updateMilestone);
router.delete('/:id', authMiddleware, deleteMilestone);
router.post('/:id/complete', authMiddleware, completeMilestone);

module.exports = router;
