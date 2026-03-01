const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
  getBackedProjects
} = require('../controllers/projectController');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('goal_amount').isNumeric().withMessage('Goal amount must be a number'),
  body('end_date').notEmpty().withMessage('End date is required')
];

// Routes
router.get('/', optionalAuth, getProjects);
router.get('/my-projects', authMiddleware, getUserProjects);
router.get('/backed', authMiddleware, getBackedProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', authMiddleware, projectValidation, validate, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);

module.exports = router;
