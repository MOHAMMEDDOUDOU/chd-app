-- Add push notification support
-- Add pushToken column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS push_token text;

-- Create index for push token lookups
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users (push_token);

-- Update existing notifications to support push
-- (Optional: Add any additional notification-related columns if needed)
