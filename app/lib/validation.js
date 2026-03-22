// Input validation and sanitization utilities

const VALID_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science"
];

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

/**
 * Sanitize string input by removing dangerous characters
 */
export function sanitizeString(input) {
  if (typeof input !== "string") return "";
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove MongoDB operators and dangerous characters
  sanitized = sanitized.replace(/[${}]/g, "");
  
  // Remove HTML tags for basic XSS prevention
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  return sanitized;
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }
  
  const sanitized = sanitizeString(email);
  
  if (!sanitized) {
    return { valid: false, error: "Email cannot be empty" };
  }
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true, value: sanitized.toLowerCase() };
}

/**
 * Validate password
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }
  
  return { valid: true, value: password };
}

/**
 * Validate subject against whitelist
 */
export function validateSubject(subject) {
  if (!subject || typeof subject !== "string") {
    return { valid: false, error: "Subject is required" };
  }
  
  const sanitized = sanitizeString(subject);
  
  if (!VALID_SUBJECTS.includes(sanitized)) {
    return { 
      valid: false, 
      error: `Invalid subject. Allowed: ${VALID_SUBJECTS.join(", ")}` 
    };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate difficulty against whitelist
 */
export function validateDifficulty(difficulty) {
  if (!difficulty || typeof difficulty !== "string") {
    return { valid: false, error: "Difficulty is required" };
  }
  
  const sanitized = sanitizeString(difficulty).toLowerCase();
  
  if (!VALID_DIFFICULTIES.includes(sanitized)) {
    return { 
      valid: false, 
      error: `Invalid difficulty. Allowed: ${VALID_DIFFICULTIES.join(", ")}` 
    };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate question options
 */
export function validateOptions(options) {
  if (!Array.isArray(options)) {
    return { valid: false, error: "Options must be an array" };
  }
  
  if (options.length !== 4) {
    return { valid: false, error: "Exactly 4 options are required" };
  }
  
  const sanitized = options.map(opt => {
    if (typeof opt !== "string") {
      throw new Error("All options must be strings");
    }
    return sanitizeString(opt);
  });
  
  // Check for empty options
  if (sanitized.some(opt => !opt)) {
    return { valid: false, error: "All options must be non-empty" };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate correct answer
 */
export function validateCorrectAnswer(correctAnswer, options) {
  if (!correctAnswer || typeof correctAnswer !== "string") {
    return { valid: false, error: "Correct answer is required" };
  }
  
  const sanitized = sanitizeString(correctAnswer);
  
  if (!sanitized) {
    return { valid: false, error: "Correct answer cannot be empty" };
  }
  
  if (!options.includes(sanitized)) {
    return { valid: false, error: "Correct answer must match one of the options" };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(id) {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "ID is required" };
  }
  
  // MongoDB ObjectId is 24 hex characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    return { valid: false, error: "Invalid ID format" };
  }
  
  return { valid: true, value: id };
}

/**
 * Validate question text
 */
export function validateQuestion(question) {
  if (!question || typeof question !== "string") {
    return { valid: false, error: "Question is required" };
  }
  
  const sanitized = sanitizeString(question);
  
  if (!sanitized || sanitized.length < 10) {
    return { valid: false, error: "Question must be at least 10 characters" };
  }
  
  if (sanitized.length > 500) {
    return { valid: false, error: "Question must not exceed 500 characters" };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate category
 */
export function validateCategory(category) {
  if (!category || typeof category !== "string") {
    return { valid: false, error: "Category is required" };
  }
  
  const sanitized = sanitizeString(category);
  
  if (!sanitized) {
    return { valid: false, error: "Category cannot be empty" };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: "Category must not exceed 100 characters" };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate username
 */
export function validateUsername(userName) {
  if (!userName || typeof userName !== "string") {
    return { valid: false, error: "Username is required" };
  }
  
  const sanitized = sanitizeString(userName);
  
  if (!sanitized || sanitized.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, error: "Username must not exceed 50 characters" };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate score
 */
export function validateScore(score, totalQuestions) {
  if (typeof score !== "number" || score < 0) {
    return { valid: false, error: "Score must be a non-negative number" };
  }
  
  if (typeof totalQuestions !== "number" || totalQuestions <= 0) {
    return { valid: false, error: "Total questions must be a positive number" };
  }
  
  if (score > totalQuestions) {
    return { valid: false, error: "Score cannot exceed total questions" };
  }
  
  return { valid: true, value: score };
}

/**
 * Prevent MongoDB injection by ensuring query values are safe
 */
export function sanitizeMongoQuery(query) {
  if (typeof query !== "object" || query === null) {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Skip MongoDB operators
    if (key.startsWith("$")) {
      continue;
    }
    
    // Only allow string, number, boolean values
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export { VALID_SUBJECTS, VALID_DIFFICULTIES };
