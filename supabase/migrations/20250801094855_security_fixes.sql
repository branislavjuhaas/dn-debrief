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

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_search(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  set search_path = '';
  select regexp_replace(unaccent($1), '[^a-zA-Z0-9]', '', 'g')
$function$
;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  claims jsonb;
  user_role public.app_role;
  user_credential smallint;
  user_additional jsonb;
  db_user_id bigint;
begin
  -- Initialize claims to the existing claims object from the event
  claims := event->'claims';

  -- Fetch the user's role, credentials, additional data, and db user id
  select c.role, c.credential, c.additional, u.id
    into user_role, user_credential, user_additional, db_user_id
    from public.claims as c
    join public.users as u on c.user_id = u.id
    where u.auth_id = (event->>'user_id')::uuid;

  -- Check if user data was found
  if db_user_id is null then
    raise notice 'User not found for auth_id: %', event->>'user_id';
    -- Return the original event instead of an error
    return event;
  end if;

  -- Append the user-specific claims to the existing claims object
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  claims := jsonb_set(claims, '{user_credential}', to_jsonb(coalesce(user_credential, null)));
  claims := jsonb_set(claims, '{user_additional}', coalesce(user_additional, '{}'::jsonb));
  claims := jsonb_set(claims, '{user_id}', to_jsonb(db_user_id));

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$function$
;


