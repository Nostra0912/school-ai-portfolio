-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON user_profiles;

-- Create new policies that include super admin access
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    auth.jwt()->>'profile_type' = 'super_admin' OR
    auth.jwt()->>'profile_type' = 'staff'
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR
    auth.jwt()->>'profile_type' = 'super_admin'
  );

-- Add super_admin to valid profile types
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_profile_type_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_profile_type_check 
  CHECK (profile_type IN ('staff', 'board_member', 'school_leader', 'authorizer', 'external', 'super_admin'));
