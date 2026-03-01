/**
 * Response utility functions
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
const errorResponse = (res, message = 'Error', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation errors
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

/**
 * Send server error response
 * @param {Object} res - Express response object
 * @param {string} message - Server error message
 */
const serverErrorResponse = (res, message = 'Internal server error') => {
  console.error(message);
  return res.status(500).json({
    success: false,
    error: message
  });
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {string} message - Created message
 * @param {any} data - Response data
 */
const createdResponse = (res, message = 'Created successfully', data = null) => {
  return successResponse(res, message, data, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
  createdResponse,
  noContentResponse
};
