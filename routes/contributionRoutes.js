const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createContribution,
  getUserContributions,
  getProjectContributions
} = require('../controllers/contributionController');

const router = express.Router();

// Validation rules
const contributionValidation = [
  body('project_id').notEmpty().withMessage('Project ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('amount').custom(value => value > 0).withMessage('Amount must be greater than 0')
];

// Routes
router.post('/', authMiddleware, contributionValidation, validate, createContribution);
router.get('/my-contributions', authMiddleware, getUserContributions);
router.get('/project/:id', authMiddleware, getProjectContributions);

module.exports = router;
