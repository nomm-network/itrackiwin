# Admin Feature

Administrative interface for managing exercises, categories, translations, and system configuration.

## Structure

- **pages/**: Admin management pages
- **components/**: Admin-specific UI components
- **services/**: Admin API calls and operations

## Access Control

All admin routes are protected by `AdminGuard` which checks for superadmin privileges.

## Adding Admin Pages

1. Create page in `pages/`
2. Add route to admin section in `AppRoutes.tsx`
3. Ensure proper access control is maintained