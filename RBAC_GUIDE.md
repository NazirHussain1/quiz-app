# Role-Based Access Control (RBAC) System

## Overview

This application implements a secure role-based access control system with two roles:
- **Student** (default): Regular users who can take quizzes and view their analytics
- **Admin**: Users with full access to manage questions and view all system features

## User Roles

### Student Role
- Take quizzes (regular and exam mode)
- Create custom quizzes
- View personal analytics
- View leaderboard
- Access all quiz-related features

### Admin Role
- All student permissions
- Access admin panel (`/admin`)
- Add, edit, and delete questions
- Manage question database
- Full system access

## Implementation Details

### Backend (API)

#### Protected Routes
All admin routes require authentication and admin role:

- `GET /api/admin/questions` - List all questions (Admin only)
- `POST /api/admin/questions` - Add new question (Admin only)
- `PUT /api/admin/questions` - Update question (Admin only)
- `DELETE /api/admin/questions` - Delete question (Admin only)

#### Middleware Functions

**`verifyAuth(request)`**
- Extracts and verifies JWT token
- Returns user object with role
- Returns null if invalid

**`requireAuth(handler)`**
- Ensures user is authenticated
- Returns 401 if not authenticated
- Passes user to handler

**`requireAdmin(handler)`**
- Ensures user is authenticated AND has admin role
- Returns 401 if not authenticated
- Returns 403 if not admin
- Passes user to handler

### Frontend (UI)

#### Protected Pages
- `/admin` - Admin panel (redirects non-admins to home)
- `/analytics` - User analytics (requires authentication)
- `/my-quizzes` - User's custom quizzes (requires authentication)
- `/create-quiz` - Quiz creation (requires authentication)

#### Navigation
- Admin menu item only visible to users with admin role
- User dropdown shows role-appropriate options

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed with bcryptjs),
  userName: String,
  role: String, // "student" or "admin" (default: "student")
  createdAt: Date,
  updatedAt: Date
}
```

### JWT Payload
```javascript
{
  userId: String,
  email: String,
  userName: String,
  role: String // "student" or "admin"
}
```

## Making a User Admin

### Method 1: Using the Script (Recommended)

```bash
# Make a user admin by email
npm run make-admin user@example.com

# List all users with their roles
npm run list-users
```

### Method 2: Direct MongoDB Update

Connect to your MongoDB database and run:

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      role: "admin",
      updatedAt: new Date()
    } 
  }
)
```

### Method 3: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `quizapp` database → `users` collection
4. Find the user by email
5. Edit the document and set `role: "admin"`
6. Save changes

## Testing the RBAC System

### Test as Student
1. Create a new account (default role: student)
2. Login
3. Verify you can:
   - Take quizzes
   - View analytics
   - Create custom quizzes
4. Verify you CANNOT:
   - Access `/admin` page
   - See "Admin" link in navigation
   - Call admin API endpoints

### Test as Admin
1. Make a user admin using one of the methods above
2. Login with that account
3. Verify you can:
   - Access `/admin` page
   - See "Admin" link in navigation
   - Add/edit/delete questions
   - Access all student features

### API Testing

**Test Admin Endpoint (Should Fail for Students)**
```bash
# Login as student first, then:
curl -X GET http://localhost:3000/api/admin/questions \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Expected: 403 Forbidden
```

**Test Admin Endpoint (Should Succeed for Admins)**
```bash
# Login as admin first, then:
curl -X GET http://localhost:3000/api/admin/questions \
  -H "Cookie: auth-token=YOUR_TOKEN"

# Expected: 200 OK with questions list
```

## Security Features

1. **JWT-based Authentication**
   - Secure token generation with jose
   - HttpOnly cookies prevent XSS attacks
   - 7-day token expiration

2. **Password Security**
   - Passwords hashed with bcryptjs
   - Salt rounds: 10
   - Never stored in plain text

3. **Role Verification**
   - Role checked on every admin API call
   - Frontend guards prevent unauthorized access
   - Backend middleware enforces permissions

4. **Backward Compatibility**
   - Existing users without role field default to "student"
   - No data migration required
   - Graceful handling of legacy data

## Troubleshooting

### User Can't Access Admin Panel
1. Verify user has admin role:
   ```bash
   npm run list-users
   ```
2. If not admin, make them admin:
   ```bash
   npm run make-admin user@example.com
   ```
3. User must logout and login again for role to update

### Admin API Returns 403
- Ensure user is logged in
- Verify user has admin role in database
- Check JWT token includes role field
- Clear cookies and login again

### Role Not Showing in Frontend
- Check Redux state includes user.role
- Verify /api/auth/me returns role
- Check browser console for errors
- Clear localStorage and cookies

## Best Practices

1. **Never expose admin credentials**
   - Use strong passwords for admin accounts
   - Don't share admin accounts
   - Rotate admin passwords regularly

2. **Audit admin actions**
   - Log all admin operations
   - Monitor question changes
   - Track admin access

3. **Principle of least privilege**
   - Only grant admin role when necessary
   - Review admin users periodically
   - Remove admin access when no longer needed

4. **Secure environment variables**
   - Keep JWT_SECRET secure
   - Use different secrets for dev/prod
   - Never commit .env.local to Git

## Future Enhancements

Potential improvements to the RBAC system:

1. **Additional Roles**
   - Moderator: Can review but not delete
   - Teacher: Can create quizzes but not manage all questions
   - Super Admin: Full system access

2. **Permissions System**
   - Granular permissions per action
   - Role-based permission matrix
   - Custom permission sets

3. **Audit Logging**
   - Track all admin actions
   - Log question modifications
   - User activity monitoring

4. **Admin Dashboard**
   - User management interface
   - Role assignment UI
   - System statistics

5. **Two-Factor Authentication**
   - Extra security for admin accounts
   - SMS or authenticator app
   - Backup codes

## Support

For issues or questions about the RBAC system:
1. Check this guide first
2. Review the code in `app/lib/authMiddleware.js`
3. Test with the provided scripts
4. Check MongoDB for role data

---

**Last Updated:** 2025
**Version:** 1.0.0
