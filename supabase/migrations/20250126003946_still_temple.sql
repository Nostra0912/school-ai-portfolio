/*
  # Allow public access to workflow steps

  1. Changes
    - Drop existing RLS policies that require authentication
    - Create new policies that allow public access to workflow_steps table
    - Keep RLS enabled but make it permissive
  
  2. Security Note
    - This is a temporary configuration for development
    - Should be replaced with proper authentication in production
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read workflow steps" ON workflow_steps;
DROP POLICY IF EXISTS "Users can create workflow steps" ON workflow_steps;
DROP POLICY IF EXISTS "Users can update workflow steps" ON workflow_steps;
DROP POLICY IF EXISTS "Users can delete workflow steps" ON workflow_steps;

-- Create new permissive policies
CREATE POLICY "Allow public read access"
  ON workflow_steps FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON workflow_steps FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON workflow_steps FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON workflow_steps FOR DELETE
  TO public
  USING (true);
