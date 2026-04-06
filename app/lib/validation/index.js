/**
 * Validation Utilities
 * Zod-based validation helpers
 */

import { z } from 'zod';
import { ValidationError } from '../errorHandler';

/**
 * Validate data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {any} Validated and transformed data
 * @throws {ValidationError} If validation fails
 */
export function validate(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      const message = firstError.message;
      throw new ValidationError(field ? `${field}: ${message}` : message);
    }
    throw new ValidationError('Validation failed');
  }
}

/**
 * Validate data and return result object
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {Object} { success: boolean, data?: any, error?: string }
 */
export function validateSafe(schema, data) {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      const message = firstError.message;
      return {
        success: false,
        error: field ? `${field}: ${message}` : message
      };
    }
    return {
      success: false,
      error: 'Validation failed'
    };
  }
}

/**
 * Validate request body
 * @param {Request} request - Request object
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {Promise<any>} Validated data
 * @throws {ValidationError} If validation fails
 */
export async function validateRequestBody(request, schema) {
  try {
    const body = await request.json();
    return validate(schema, body);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid JSON in request body');
  }
}

/**
 * Validate query parameters
 * @param {URL} url - URL object
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {any} Validated data
 * @throws {ValidationError} If validation fails
 */
export function validateQueryParams(url, schema) {
  const params = Object.fromEntries(url.searchParams.entries());
  return validate(schema, params);
}

/**
 * Sanitize string (remove dangerous characters)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>${}]/g, '');
}

/**
 * Validate ObjectId
 * @param {string} id - ID to validate
 * @returns {string} Validated ID
 * @throws {ValidationError} If validation fails
 */
export function validateObjectId(id) {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('ID is required');
  }
  
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError('Invalid ID format');
  }
  
  return id;
}

// Re-export all schemas
export * from './schemas';
