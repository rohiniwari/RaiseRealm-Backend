const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const {
  getProjectComments,
  createComment,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();

// Validation rules
const commentValidation = [
  body('project_id').notEmpty().withMessage('Project ID is required'),
  body('content').notEmpty().withMessage('Content is required')
];

// Routes
router.get('/project/:project_id', optionalAuth, getProjectComments);
router.post('/', authMiddleware, commentValidation, validate, createComment);
router.delete('/:id', authMiddleware, deleteComment);

module.exports = router;
