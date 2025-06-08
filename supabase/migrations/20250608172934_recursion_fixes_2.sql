drop policy "Allow club managers to read their clubs" on "public"."clubs";

drop policy "Allow authenticated users to read club managers for active club" on "public"."club_managers";

drop function if exists "public"."is_club_active"(p_club_id bigint);

create policy "Allow authenticated users to read club managers for active club"
on "public"."club_managers"
as permissive
for select
to authenticated;



