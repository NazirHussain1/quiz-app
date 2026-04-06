import { useSelector } from 'react-redux';
import { 
  hasPermission, 
  hasRole, 
  hasMinimumRole, 
  getRolePermissions,
  ROLES,
  PERMISSIONS 
} from '@/app/lib/rbac';

/**
 * Custom hook for Role-Based Access Control
 * @returns {Object} RBAC utilities
 */
export function useRBAC() {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || ROLES.STUDENT;

  return {
    // User info
    user,
    userRole,
    
    // Role checks
    isStudent: userRole === ROLES.STUDENT,
    isModerator: userRole === ROLES.MODERATOR,
    isAdmin: userRole === ROLES.ADMIN,
    isSuperAdmin: userRole === ROLES.SUPERADMIN,
    
    // Permission checks
    can: (permission) => hasPermission(userRole, permission),
    canAny: (permissions) => permissions.some(p => hasPermission(userRole, p)),
    canAll: (permissions) => permissions.every(p => hasPermission(userRole, p)),
    
    // Role checks
    hasRole: (roles) => hasRole(userRole, Array.isArray(roles) ? roles : [roles]),
    hasMinimumRole: (role) => hasMinimumRole(userRole, role),
    
    // Get permissions
    permissions: getRolePermissions(userRole),
    
    // Specific permission checks (shortcuts)
    canManageUsers: hasPermission(userRole, PERMISSIONS.MANAGE_USERS),
    canManageQuestions: hasPermission(userRole, PERMISSIONS.MANAGE_QUESTIONS),
    canViewAnalytics: hasPermission(userRole, PERMISSIONS.VIEW_ANALYTICS),
    canViewAdminAnalytics: hasPermission(userRole, PERMISSIONS.VIEW_ADMIN_ANALYTICS),
    canManageSettings: hasPermission(userRole, PERMISSIONS.MANAGE_SETTINGS),
    canDeleteUsers: hasPermission(userRole, PERMISSIONS.DELETE_USERS),
    canMakeAdmin: hasPermission(userRole, PERMISSIONS.MAKE_ADMIN),
    
    // Role constants (for convenience)
    ROLES,
    PERMISSIONS,
  };
}

/**
 * HOC to protect components based on permission
 * @param {React.Component} Component - Component to protect
 * @param {string|string[]} requiredPermission - Required permission(s)
 * @param {React.Component} Fallback - Component to show if no permission
 * @returns {React.Component}
 */
export function withPermission(Component, requiredPermission, Fallback = null) {
  return function ProtectedComponent(props) {
    const { can, canAny } = useRBAC();
    
    const hasAccess = Array.isArray(requiredPermission)
      ? canAny(requiredPermission)
      : can(requiredPermission);
    
    if (!hasAccess) {
      return Fallback ? <Fallback /> : null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * HOC to protect components based on role
 * @param {React.Component} Component - Component to protect
 * @param {string|string[]} requiredRole - Required role(s)
 * @param {React.Component} Fallback - Component to show if no role
 * @returns {React.Component}
 */
export function withRole(Component, requiredRole, Fallback = null) {
  return function ProtectedComponent(props) {
    const { hasRole } = useRBAC();
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!hasRole(roles)) {
      return Fallback ? <Fallback /> : null;
    }
    
    return <Component {...props} />;
  };
}
