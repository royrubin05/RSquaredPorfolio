-- Add password column to team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS password TEXT;

-- Seed the requested admin user
-- Using ON CONFLICT to update if exists (assuming email is unique constraint, otherwise we delete/insert)
-- Since email might not be unique constraint in original schema (just TEXT), we'll do a DELETE/INSERT to be safe and clean.

DELETE FROM team_members WHERE email = 'roy.rubin@r2vc.com';

INSERT INTO team_members (name, email, role, status, password)
VALUES ('Roy Rubin', 'roy.rubin@r2vc.com', 'Admin', 'Active', 'Chesebro99');
