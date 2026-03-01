/**
 * Utility functions for the application
 */

/**
 * Generate a unique ID
 * @returns {string} UUID v4
 */
const { v4: uuidv4 } = require('uuid');

const generateId = () => uuidv4();

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Calculate percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
const calculatePercentage = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
};

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isDatePassed = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get days remaining until a date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days remaining
 */
const getDaysRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Paginate results
 * @param {Array} data - Array of data
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result with metadata
 */
const paginate = (data, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      total: data.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(data.length / limit),
      hasMore: endIndex < data.length
    }
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Build filter query object from request query
 * @param {Object} query - Express query object
 * @param {Array} allowedFilters - Array of allowed filter keys
 * @returns {Object} Filter object
 */
const buildFilters = (query, allowedFilters = []) => {
  const filters = {};
  
  allowedFilters.forEach(key => {
    if (query[key] !== undefined && query[key] !== '') {
      filters[key] = query[key];
    }
  });
  
  return filters;
};

/**
 * Build pagination object from request query
 * @param {Object} query - Express query object
 * @returns {Object} Pagination object
 */
const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

module.exports = {
  generateId,
  formatCurrency,
  calculatePercentage,
  formatDate,
  isDatePassed,
  getDaysRemaining,
  paginate,
  sanitizeInput,
  buildFilters,
  buildPagination
};
