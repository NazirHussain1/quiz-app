"use client";

import { useRBAC } from '@/app/hooks/useRBAC';

/**
 * Component to conditionally render based on permission
 */
export function CanAccess({ permission, children, fallback = null }) {
  const { can, canAny } = useRBAC();
  
  const hasAccess = Array.isArray(permission)
    ? canAny(permission)
    : can(permission);
  
  if (!hasAccess) {
    return fallback;
  }
  
  return <>{children}</>;
}

/**
 * Component to conditionally render based on role
 */
export function HasRole({ role, children, fallback = null }) {
  const { hasRole } = useRBAC();
  
  const roles = Array.isArray(role) ? role : [role];
  
  if (!hasRole(roles)) {
    return fallback;
  }
  
  return <>{children}</>;
}

/**
 * Component to conditionally render based on minimum role level
 */
export function MinimumRole({ role, children, fallback = null }) {
  const { hasMinimumRole } = useRBAC();
  
  if (!hasMinimumRole(role)) {
    return fallback;
  }
  
  return <>{children}</>;
}

/**
 * Component to show content only to students
 */
export function StudentOnly({ children, fallback = null }) {
  const { isStudent } = useRBAC();
  return isStudent ? <>{children}</> : fallback;
}

/**
 * Component to show content only to moderators or higher
 */
export function ModeratorOnly({ children, fallback = null }) {
  const { hasMinimumRole, ROLES } = useRBAC();
  return hasMinimumRole(ROLES.MODERATOR) ? <>{children}</> : fallback;
}

/**
 * Component to show content only to admins or higher
 */
export function AdminOnly({ children, fallback = null }) {
  const { hasMinimumRole, ROLES } = useRBAC();
  return hasMinimumRole(ROLES.ADMIN) ? <>{children}</> : fallback;
}

/**
 * Component to show content only to superadmins
 */
export function SuperAdminOnly({ children, fallback = null }) {
  const { isSuperAdmin } = useRBAC();
  return isSuperAdmin ? <>{children}</> : fallback;
}

/**
 * Role badge component
 */
export function RoleBadge({ role, className = "" }) {
  const roleColors = {
    superadmin: "bg-purple-100 text-purple-800 border-purple-300",
    admin: "bg-blue-100 text-blue-800 border-blue-300",
    moderator: "bg-green-100 text-green-800 border-green-300",
    student: "bg-gray-100 text-gray-800 border-gray-300",
  };
  
  const roleIcons = {
    superadmin: "👑",
    admin: "🛡️",
    moderator: "⚡",
    student: "📚",
  };
  
  const colorClass = roleColors[role] || roleColors.student;
  const icon = roleIcons[role] || roleIcons.student;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border-2 ${colorClass} ${className}`}>
      <span>{icon}</span>
      <span className="capitalize">{role}</span>
    </span>
  );
}
