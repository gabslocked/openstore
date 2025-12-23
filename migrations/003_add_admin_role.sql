-- ============================================
-- MIGRATION 003: ADD ADMIN ROLE TO USERS
-- ============================================

-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Update existing admin users (if any)
-- You can manually set specific users as admin after running this migration
-- Example: UPDATE users SET is_admin = TRUE WHERE email = 'admin@ezpods.com';

COMMENT ON COLUMN users.is_admin IS 'Indicates if user has admin privileges';
