/*
  # User and Entity Management Schema

  1. New Tables
    - user_profiles (extends auth.users)
    - user_roles
    - permissions
    - role_permissions
    - user_email_addresses
    - training_records
    - profile_history
    - calendar_events
    - event_attendees
    - notifications
    - document_submissions
    - document_collaborators
    - document_comments
    - document_categories
    - document_templates

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Add audit logging

  3. Changes
    - Add new fields to existing tables
    - Add relationships between tables
*/

-- User Profiles table to extend auth.users
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  title text,
  organization text,
  phone text,
  is_active boolean DEFAULT true,
  profile_type text NOT NULL CHECK (profile_type IN ('staff', 'board_member', 'school_leader', 'authorizer', 'external')),
  required_fields jsonb DEFAULT '{}'::jsonb,
  custom_fields jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Permissions table
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
  role_id uuid REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- User Email Addresses table (for multiple emails per profile)
CREATE TABLE user_email_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  notification_types text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Training Records table
CREATE TABLE training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  completion_date timestamptz NOT NULL,
  certificate_url text,
  status text NOT NULL CHECK (status IN ('completed', 'in_progress', 'expired')),
  expiration_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profile History table for tracking changes
CREATE TABLE profile_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  profile_type text NOT NULL,
  changes jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Calendar Events table
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  event_type text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('public', 'private', 'role_based')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event Attendees junction table
CREATE TABLE event_attendees (
  event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Document Categories table
CREATE TABLE document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES document_categories(id),
  created_at timestamptz DEFAULT now()
);

-- Document Templates table
CREATE TABLE document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES document_categories(id),
  template_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Submissions table
CREATE TABLE document_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES document_templates(id),
  category_id uuid REFERENCES document_categories(id),
  submitted_by uuid REFERENCES user_profiles(id),
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  due_date timestamptz,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Collaborators junction table
CREATE TABLE document_collaborators (
  document_id uuid REFERENCES document_submissions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('viewer', 'editor', 'reviewer')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (document_id, user_id)
);

-- Document Comments table
CREATE TABLE document_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES document_submissions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_email_addresses_updated_at
  BEFORE UPDATE ON user_email_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at
  BEFORE UPDATE ON training_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_submissions_updated_at
  BEFORE UPDATE ON document_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON document_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create basic RLS policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Insert default roles
INSERT INTO user_roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('staff', 'SCSC staff member'),
  ('board_member', 'Charter school board member'),
  ('school_leader', 'Charter school leader'),
  ('authorizer', 'Local charter school authorizer');

-- Insert basic permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('manage_users', 'Can manage user accounts', 'users', 'manage'),
  ('view_users', 'Can view user profiles', 'users', 'view'),
  ('manage_documents', 'Can manage documents', 'documents', 'manage'),
  ('view_documents', 'Can view documents', 'documents', 'view'),
  ('manage_calendar', 'Can manage calendar events', 'calendar', 'manage'),
  ('view_calendar', 'Can view calendar events', 'calendar', 'view');

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'admin'),
  id
FROM permissions;
