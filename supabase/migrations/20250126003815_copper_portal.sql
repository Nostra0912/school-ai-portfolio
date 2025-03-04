/*
  # Allow public access to workflows

  1. Changes
    - Drop existing RLS policies that require authentication
    - Create new policies that allow public access to workflows table
    - Keep RLS enabled but make it permissive
  
  2. Security Note
    - This is a temporary configuration for development
    - Should be replaced with proper authentication in production
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;

-- Create new permissive policies
CREATE POLICY "Allow public read access"
  ON workflows FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON workflows FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON workflows FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON workflows FOR DELETE
  TO public
  USING (true);

-- Make created_by field optional
ALTER TABLE workflows ALTER COLUMN created_by DROP NOT NULL;
