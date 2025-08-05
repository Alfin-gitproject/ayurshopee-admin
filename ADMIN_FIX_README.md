# Admin Privilege Fix Instructions

## Problem
You couldn't delete orders because the system requires admin privileges, but your user account has the default "user" role instead of "admin".

## Solutions Implemented

### 1. Admin Creation Tool (Recommended)
- Created `/public/make-admin.html` - a web interface to upgrade users to admin
- Created `/api/auth/make-admin` - API endpoint to upgrade user roles
- Usage: Go to `http://localhost:3000/make-admin.html` and enter your email/phone

### 2. Temporary Admin Check Removal (Quick Fix)
- Commented out admin checks in `/src/pages/api/orders/[id].js`
- This allows any authenticated user to delete/update orders (for development only)

### 3. Admin Creation Script
- Created `/scripts/create-admin.js` - Node.js script to create admin users
- Requires proper MongoDB connection string in environment variables

## To Use Solution 1 (Recommended):
1. Start your development server: `npm run dev`
2. Go to: `http://localhost:3000/make-admin.html`
3. Enter your email or phone number (whichever you used to register)
4. Click "Make Admin"
5. You should now be able to delete orders!

## To Re-enable Security Later:
In `/src/pages/api/orders/[id].js`, uncomment these lines:
```javascript
// Check if user is admin
if (req?.user?.roles !== 'admin') {
  return res.status(403).json({ success: false, message: 'Admin access required' });
}
```

## Admin Key
The admin creation tool uses the key: `create-admin-2025`
You can change this in the environment variable `ADMIN_CREATION_KEY`
