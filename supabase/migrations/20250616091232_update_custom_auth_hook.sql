create extension if not exists "pgjwt" with schema "extensions";


drop index if exists "public"."ix_users_search_index";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$select replace(unaccent('unaccent', $1), ' ', '')$function$
;


