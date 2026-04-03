# Comprehensive Codebase Refactoring Plan

## Critical Issues Identified

### 1. DUPLICATE DATABASE CONNECTIONS
- **app/lib/mongodb.js** - Simple connection (older)
- **app/lib/database/connection.js** - Enhanced connection with retry logic (newer)
- **Action**: Delete mongodb.js, use connection.js everywhere

### 2. DUPLICATE AUTH MIDDLEWARE
- **app/lib/authMiddleware.js** - Has verifyAuth, requireAuth, requireAdmin
- **app/lib/rbacMiddleware.js** - Has checkRole, checkPermission, requireAuth
- **Action**: Merge into single middleware file

### 3. DUPLICATE VALIDATION SYSTEMS
- **app/lib/validation.js** - Manual validation functions
- **app/lib/zodSchemas.js** - Zod schema validation
- **Action**: Use Zod exclusively, remove manual validation

### 4. UNUSED DEPENDENCIES
- **cors** - Not used in Next.js API routes
- **helmet** - Not properly integrated
- **dotenv** - Not needed (Next.js handles .env)
- **Action**: Remove from package.json

### 5. INCONSISTENT ERROR HANDLING
- Some routes use try-catch manually
- Some use errorHandler wrapper
- **Action**: Standardize on withErrorHandling wrapper

## Refactoring Steps

### Phase 1: Database Layer Consolidation
1. ✅ Keep: app/lib/database/connection.js (enhanced version)
2. ❌ Delete: app/lib/mongodb.js
3. Update all imports to use connection.js

### Phase 2: Middleware Consolidation
1. Merge authMiddleware.js + rbacMiddleware.js → middleware.js
2. Single source of truth for auth/RBAC
3. Update all API routes

### Phase 3: Validation Consolidation
1. ✅ Keep: app/lib/zodSchemas.js
2. ❌ Delete: app/lib/validation.js (migrate to Zod)
3. Update all validation calls

### Phase 4: Dependency Cleanup
1. Remove unused packages
2. Update package.json
3. Run npm install

### Phase 5: Code Organization
1. Consolidate utilities
2. Remove dead code
3. Standardize imports

## Files to Delete
- app/lib/mongodb.js
- app/lib/validation.js (after migration)

## Files to Create
- app/lib/middleware.js (merged auth + RBAC)

## Files to Update
- All API routes (update imports)
- package.json (remove unused deps)
- All files importing mongodb.js
