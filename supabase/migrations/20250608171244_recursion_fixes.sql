drop policy "Allow authenticated users to read club managers for active club" on "public"."club_managers";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_club_active(p_club_id bigint)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select active from public.clubs where id = p_club_id;
$function$
;

create policy "Allow authenticated users to read club managers for active club"
on "public"."club_managers"
as permissive
for select
to authenticated
using ((is_club_active(club_id) AND (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.id = club_managers.user_id) AND (users.public = true))))));



