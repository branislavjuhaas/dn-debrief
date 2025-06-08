create type "public"."club_league" as enum ('junior', 'senior', 'university');

alter table "public"."clubs" add column "description" text;

alter table "public"."clubs" alter column "league" set default 'senior'::club_league;

alter table "public"."clubs" alter column "league" set data type club_league using "league"::club_league;

CREATE UNIQUE INDEX clubs_name_league_key ON public.clubs USING btree (name, league);

alter table "public"."clubs" add constraint "clubs_name_league_key" UNIQUE using index "clubs_name_league_key";

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
  begin
    -- Fetches the user's application role from the 'claims' table.
    select c.role
    into user_role
    from public.claims as c
    join public.users as u on c.user_id = u.id
    where u.auth_id = (event->>'user_id')::uuid;

    claims_from_event := event->'claims';

    if user_role is not null then
      -- Sets the 'user_role' claim in the JWT.
      claims_from_event := jsonb_set(claims_from_event, '{user_role}', to_jsonb(user_role));
    else
      -- Sets the 'user_role' claim to JSON null if the user_role is not found.
      claims_from_event := jsonb_set(claims_from_event, '{user_role}', to_jsonb(null::public.app_role));
    end if;

    -- Updates the 'claims' object within the original event JSON.
    event := jsonb_set(event, '{claims}', claims_from_event);

    -- Returns the modified event with the new claim.
    return event;
  end;
$function$
;


