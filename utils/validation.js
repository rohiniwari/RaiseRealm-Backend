/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with message
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with missing fields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @returns {boolean} True if positive number
 */
const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0;
};

/**
 * Validate date is in the future
 * @param {string} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
const isFutureDate = (date) => {
  const dateObj = new Date(date);
  return dateObj > new Date();
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUuid = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate amount for payment
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum amount
 * @returns {Object} Validation result
 */
const validateAmount = (amount, min = 1) => {
  if (amount === undefined || amount === null) {
    return { valid: false, message: 'Amount is required' };
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, message: 'Amount must be a valid number' };
  }
  
  if (amount < min) {
    return { valid: false, message: `Amount must be at least ${min}` };
  }
  
  return { valid: true };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateRequiredFields,
  isValidUrl,
  isPositiveNumber,
  isFutureDate,
  isValidUuid,
  validateAmount
};
