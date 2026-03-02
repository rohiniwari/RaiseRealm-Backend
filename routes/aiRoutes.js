const express = require('express');
const { getImageSuggestion } = require('../controllers/aiController');

const router = express.Router();

// Get image suggestion based on query
// GET /api/ai/image?query=solar+energy
router.get('/image', getImageSuggestion);

module.exports = router;
