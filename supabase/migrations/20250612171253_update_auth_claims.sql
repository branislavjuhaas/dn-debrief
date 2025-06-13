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

revoke delete on table "public"."role_permissions" from "anon";

revoke insert on table "public"."role_permissions" from "anon";

revoke references on table "public"."role_permissions" from "anon";

revoke select on table "public"."role_permissions" from "anon";

revoke trigger on table "public"."role_permissions" from "anon";

revoke truncate on table "public"."role_permissions" from "anon";

revoke update on table "public"."role_permissions" from "anon";

revoke delete on table "public"."role_permissions" from "authenticated";

revoke insert on table "public"."role_permissions" from "authenticated";

revoke references on table "public"."role_permissions" from "authenticated";

revoke select on table "public"."role_permissions" from "authenticated";

revoke trigger on table "public"."role_permissions" from "authenticated";

revoke truncate on table "public"."role_permissions" from "authenticated";

revoke update on table "public"."role_permissions" from "authenticated";

alter table "public"."claims" add column "additional" jsonb not null default '{}'::jsonb;

alter table "public"."users" alter column "name" set not null;

alter table "public"."users" alter column "surname" set not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  declare
    claims_from_event jsonb;
    user_role public.app_role;
    user_credential smallint;
    user_additional jsonb;
    db_user_id bigint;
  begin
    -- Fetches the user's information from the 'claims' table.
    select c.role, c.credential, c.additional, u.id
    into user_role, user_credential, user_additional, db_user_id
    from public.claims as c
    join public.users as u on c.user_id = u.id
    where u.auth_id = (event->>'user_id')::uuid;

    claims_from_event := event->'claims';

    if user_role is not null then
      -- Sets the claims in the JWT.
      claims_from_event := jsonb_set(claims_from_event, '{user_role}', to_jsonb(user_role));
      claims_from_event := jsonb_set(claims_from_event, '{user_credential}', to_jsonb(user_credential));
      claims_from_event := jsonb_set(claims_from_event, '{user_additional}', user_additional);
      claims_from_event := jsonb_set(claims_from_event, '{user_id}', to_jsonb(db_user_id));
    else
      -- Sets the claims to JSON null if not found.
      claims_from_event := jsonb_set(claims_from_event, '{user_role}', to_jsonb(null::public.app_role));
      claims_from_event := jsonb_set(claims_from_event, '{user_credential}', to_jsonb(null::smallint));
      claims_from_event := jsonb_set(claims_from_event, '{user_additional}', to_jsonb(null::jsonb));
      claims_from_event := jsonb_set(claims_from_event, '{user_id}', to_jsonb(null::bigint));
    end if;

    -- Updates the 'claims' object within the original event JSON.
    event := jsonb_set(event, '{claims}', claims_from_event);

    -- Returns the modified event with the new claims.
    return event;
  end;
$function$
;

create policy "Allow users to read their own awards"
on "public"."awards"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Club managers can add managers to their own clubs"
on "public"."club_managers"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM club_managers club_managers_1
  WHERE ((club_managers_1.club_id = club_managers_1.club_id) AND (club_managers_1.user_id = ((auth.jwt() ->> 'user_id'::text))::bigint)))));


create policy "Allow users to read their own details"
on "public"."details"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to update their own details"
on "public"."details"
as permissive
for update
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id))
with check ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow authenticated users to read their own invoices"
on "public"."invoices"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to create their own memberships"
on "public"."memberships"
as permissive
for insert
to authenticated
with check ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to read their own memberships"
on "public"."memberships"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow authenticated users to read their own payment_items"
on "public"."payment_items"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to create their own supervisor information"
on "public"."supervisors"
as permissive
for insert
to authenticated
with check ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to read their own supervisor information"
on "public"."supervisors"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to update their own supervisor information"
on "public"."supervisors"
as permissive
for update
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id))
with check ((((auth.jwt() ->> 'user_id'::text))::bigint = user_id));


create policy "Allow users to read their own data"
on "public"."users"
as permissive
for select
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = id));


create policy "Allow users to update their own data"
on "public"."users"
as permissive
for update
to authenticated
using ((((auth.jwt() ->> 'user_id'::text))::bigint = id))
with check ((( SELECT auth.uid() AS uid) = auth_id));



