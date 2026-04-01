// Role-Based Access Control (RBAC) Configuration

// Define all available roles
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  STUDENT: 'student',
};

// Define all available permissions
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  DELETE_USERS: 'delete_users',
  MAKE_ADMIN: 'make_admin',
  
  // Question Management
  MANAGE_QUESTIONS: 'manage_questions',
  CREATE_QUESTIONS: 'create_questions',
  EDIT_QUESTIONS: 'edit_questions',
  DELETE_QUESTIONS: 'delete_questions',
  VIEW_QUESTIONS: 'view_questions',
  
  // Quiz Management
  TAKE_QUIZ: 'take_quiz',
  CREATE_CUSTOM_QUIZ: 'create_custom_quiz',
  VIEW_RESULTS: 'view_results',
  VIEW_ALL_RESULTS: 'view_all_results',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_ADMIN_ANALYTICS: 'view_admin_analytics',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
};

// Permission Matrix: Define what each role can do
export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    // Full access to everything
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MAKE_ADMIN,
    PERMISSIONS.MANAGE_QUESTIONS,
    PERMISSIONS.CREATE_QUESTIONS,
    PERMISSIONS.EDIT_QUESTIONS,
    PERMISSIONS.DELETE_QUESTIONS,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.CREATE_CUSTOM_QUIZ,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_ALL_RESULTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ADMIN_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_SETTINGS,
  ],
  
  [ROLES.ADMIN]: [
    // Manage users and questions
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.MANAGE_QUESTIONS,
    PERMISSIONS.CREATE_QUESTIONS,
    PERMISSIONS.EDIT_QUESTIONS,
    PERMISSIONS.DELETE_QUESTIONS,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.CREATE_CUSTOM_QUIZ,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_ALL_RESULTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ADMIN_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
  ],
  
  [ROLES.MODERATOR]: [
    // Only manage questions
    PERMISSIONS.MANAGE_QUESTIONS,
    PERMISSIONS.CREATE_QUESTIONS,
    PERMISSIONS.EDIT_QUESTIONS,
    PERMISSIONS.DELETE_QUESTIONS,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.CREATE_CUSTOM_QUIZ,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  
  [ROLES.STUDENT]: [
    // Only take quizzes
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.CREATE_CUSTOM_QUIZ,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

// Role hierarchy (higher number = more power)
export const ROLE_HIERARCHY = {
  [ROLES.SUPERADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.MODERATOR]: 2,
  [ROLES.STUDENT]: 1,
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  if (!role || !permissions || permissions.length === 0) return false;
  
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if user role is in allowed roles list
 * @param {string} userRole - User's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export function hasRole(userRole, allowedRoles) {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if user role is higher or equal in hierarchy
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean}
 */
export function hasMinimumRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is valid
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Get default role for new users
 * @returns {string}
 */
export function getDefaultRole() {
  return ROLES.STUDENT;
}
