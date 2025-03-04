/*
  # Fix Workflow RLS Policies

  1. Changes
    - Drop existing RLS policies for workflows table
    - Create new RLS policies with proper authentication checks
    - Add policies for authenticated users to manage their own workflows

  2. Security
    - Enable RLS on workflows table
    - Add policies for CRUD operations
    - Ensure users can only access their own workflows
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their workflows" ON workflows;

-- Create new policies with proper auth checks
CREATE POLICY "Users can read their workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
