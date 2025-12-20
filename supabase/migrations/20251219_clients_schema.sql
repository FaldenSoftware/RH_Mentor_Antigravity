-- Add status and phone columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
ADD COLUMN IF NOT EXISTS phone text;

-- Create index for status for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Update existing profiles to have a random status for demo purposes (optional, but good for dev)
-- We'll keep them active by default as per the column default, but let's ensure it.
UPDATE profiles SET status = 'active' WHERE status IS NULL;
