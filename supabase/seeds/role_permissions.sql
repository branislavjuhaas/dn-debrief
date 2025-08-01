insert into role_permissions (role, permission)
values
  -- Developer: All permissions
  ('developer', 'awards.write'),
  ('developer', 'clubs.read'),
  ('developer', 'clubs.write'),
  ('developer', 'club_managers.read'),
  ('developer', 'club_managers.write'),
  ('developer', 'details.read'),
  ('developer', 'details.write'),
  ('developer', 'memberships.read'),
  ('developer', 'memberships.write'),
  ('developer', 'users.write'),
  ('developer', 'messages.read'),
  ('developer', 'messages.write'),
  ('developer', 'invoices.read'),
  ('developer', 'invoices.write'),
  ('developer', 'payments.read'),
  ('developer', 'payments.write'),
  ('developer', 'supervisors.read'),
  ('developer', 'supervisors.write'),

  -- Admin: All permissions
  ('admin', 'awards.write'),
  ('admin', 'clubs.read'),
  ('admin', 'clubs.write'),
  ('admin', 'club_managers.read'),
  ('admin', 'club_managers.write'),
  ('admin', 'details.read'),
  ('admin', 'details.write'),
  ('admin', 'memberships.read'),
  ('admin', 'memberships.write'),
  ('admin', 'users.write'),
  ('admin', 'messages.read'),
  ('admin', 'messages.write'),
  ('admin', 'invoices.read'),
  ('admin', 'invoices.write'),
  ('admin', 'payments.read'),
  ('admin', 'payments.write'),
  ('admin', 'supervisors.read'),
  ('admin', 'supervisors.write'),

  -- Cap: Specific read/write permissions
  ('cap', 'awards.write'),
  ('cap', 'details.read'),
  ('cap', 'memberships.read'),
  ('cap', 'messages.read'),
  ('cap', 'messages.write'),


  -- Junior Organizer: Specific read permissions
  ('junior_organizer', 'details.read'),
  ('junior_organizer', 'memberships.read'),

  -- Senior Organizer: Specific read permissions
  ('senior_organizer', 'details.read'),
  ('senior_organizer', 'memberships.read')