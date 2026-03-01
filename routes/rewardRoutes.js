const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createReward,
  updateReward,
  deleteReward,
  getProjectRewards
} = require('../controllers/rewardController');

const router = express.Router();

// Validation rules
const rewardValidation = [
  body('project_id').notEmpty().withMessage('Project ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('min_amount').isNumeric().withMessage('Minimum amount must be a number')
];

// Routes
router.get('/project/:project_id', getProjectRewards);
router.post('/', authMiddleware, rewardValidation, validate, createReward);
router.put('/:id', authMiddleware, updateReward);
router.delete('/:id', authMiddleware, deleteReward);

module.exports = router;
