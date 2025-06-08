insert into role_permissions (role, permission)
values
  -- Developer: All permissions
  ('developer', 'awards.read'),
  ('developer', 'awards.write'),
  ('developer', 'clubs.read'),
  ('developer', 'clubs.write'),
  ('developer', 'club_managers.read'),
  ('developer', 'club_managers.write'),
  ('developer', 'claims.read'),
  ('developer', 'claims.write'),
  ('developer', 'details.read'),
  ('developer', 'details.write'),
  ('developer', 'memberships.read'),
  ('developer', 'memberships.write'),
  ('developer', 'users.read'),
  ('developer', 'users.write'),

  -- Admin: All permissions
  ('admin', 'awards.read'),
  ('admin', 'awards.write'),
  ('admin', 'clubs.read'),
  ('admin', 'clubs.write'),
  ('admin', 'club_managers.read'),
  ('admin', 'club_managers.write'),
  ('admin', 'claims.read'),
  ('admin', 'claims.write'),
  ('admin', 'details.read'),
  ('admin', 'details.write'),
  ('admin', 'memberships.read'),
  ('admin', 'memberships.write'),
  ('admin', 'users.read'),
  ('admin', 'users.write'),

  -- Cap: Specific read/write permissions
  ('cap', 'awards.read'),
  ('cap', 'awards.write'),
  ('cap', 'claims.write'),
  ('cap', 'details.read'),
  ('cap', 'memberships.read'),
  ('cap', 'users.read'),

  -- Junior Organizer: Specific read permissions
  ('junior_organizer', 'users.read'),
  ('junior_organizer', 'details.read'),
  ('junior_organizer', 'memberships.read'),
  ('junior_organizer', 'awards.read'),

  -- Senior Organizer: Specific read permissions
  ('senior_organizer', 'users.read'),
  ('senior_organizer', 'details.read'),
  ('senior_organizer', 'memberships.read'),
  ('senior_organizer', 'awards.read');