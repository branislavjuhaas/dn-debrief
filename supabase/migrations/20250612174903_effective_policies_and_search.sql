create extension if not exists "unaccent" with schema "public" version '1.1';

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select unaccent('unaccent', $1)
$function$
;

drop policy "Allow users to read their own awards" on "public"."awards";

drop policy "Club managers can add managers to their own clubs" on "public"."club_managers";

drop policy "Allow users to read their own details" on "public"."details";

drop policy "Allow users to update their own details" on "public"."details";

drop policy "Allow authenticated users to read their own invoices" on "public"."invoices";

drop policy "Allow users to create their own memberships" on "public"."memberships";

drop policy "Allow users to read their own memberships" on "public"."memberships";

drop policy "Allow authenticated users to read their own payment_items" on "public"."payment_items";

drop policy "Allow users to create their own supervisor information" on "public"."supervisors";

drop policy "Allow users to read their own supervisor information" on "public"."supervisors";

drop policy "Allow users to update their own supervisor information" on "public"."supervisors";

drop policy "Allow users to read their own data" on "public"."users";

drop policy "Allow users to update their own data" on "public"."users";

alter table "public"."clubs" add column "search_index" text generated always as (immutable_unaccent(lower(name))) stored;

alter table "public"."users" add column "search_index" text generated always as (immutable_unaccent(lower((name || surname || name)))) stored;

CREATE INDEX ix_clubs_search_index ON public.clubs USING btree (search_index);

CREATE INDEX ix_users_auth_id ON public.users USING btree (auth_id);

CREATE INDEX ix_users_public ON public.users USING btree (public);

CREATE INDEX ix_users_search_index ON public.users USING btree (search_index);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.authorize(requested_permission app_permission)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  bind_permissions int;
  current_user_role public.app_role;
begin
  -- Retrieves the 'user_role' claim from the current user's JWT.
  -- This will be NULL if the claim is not set or is JSON null.
  select ((select auth.jwt()) ->> 'user_role')::public.app_role into current_user_role;

  -- If current_user_role is NULL (e.g., claim missing, or was explicitly set to null),
  -- then the user has no specific role for permission checking.
  if current_user_role is null then
    return false;
  end if;

  -- Checks if the user's role has the requested permission in the 'role_permissions' table.
  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = current_user_role;
  return bind_permissions > 0;
end;
$function$
;

create policy "Allow users to read their own awards"
on "public"."awards"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Club managers can add managers to their own clubs"
on "public"."club_managers"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM club_managers club_managers_1
  WHERE ((club_managers_1.club_id = club_managers_1.club_id) AND (club_managers_1.user_id = (( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint)))));


create policy "Allow users to read their own details"
on "public"."details"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to update their own details"
on "public"."details"
as permissive
for update
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id))
with check (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow authenticated users to read their own invoices"
on "public"."invoices"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to create their own memberships"
on "public"."memberships"
as permissive
for insert
to authenticated
with check (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to read their own memberships"
on "public"."memberships"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow authenticated users to read their own payment_items"
on "public"."payment_items"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to create their own supervisor information"
on "public"."supervisors"
as permissive
for insert
to authenticated
with check (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to read their own supervisor information"
on "public"."supervisors"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to update their own supervisor information"
on "public"."supervisors"
as permissive
for update
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id))
with check (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = user_id));


create policy "Allow users to read their own data"
on "public"."users"
as permissive
for select
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = id));


create policy "Allow users to update their own data"
on "public"."users"
as permissive
for update
to authenticated
using (((( SELECT (auth.jwt() ->> 'user_id'::text)))::bigint = id))
with check ((( SELECT auth.uid() AS uid) = auth_id));



