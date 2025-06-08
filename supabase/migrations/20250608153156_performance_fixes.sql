drop policy "Allow users to read their own awards" on "public"."awards";

drop policy "Allow club managers to read their clubs" on "public"."clubs";

drop policy "Allow club managers to update their clubs" on "public"."clubs";

drop policy "Allow users to read their own details" on "public"."details";

drop policy "Allow users to update their own details" on "public"."details";

drop policy "Allow users to create their own memberships" on "public"."memberships";

drop policy "Allow users to read their own memberships" on "public"."memberships";

drop policy "Allow users to update their own memberships" on "public"."memberships";

drop policy "Allow users to create their own data" on "public"."users";

drop policy "Allow users to read their own data" on "public"."users";

drop policy "Allow users to update their own data" on "public"."users";

CREATE INDEX ix_awards_user_id ON public.awards USING btree (user_id);

CREATE INDEX ix_club_managers_club_id ON public.club_managers USING btree (club_id);

CREATE INDEX ix_club_managers_user_id ON public.club_managers USING btree (user_id);

CREATE INDEX ix_memberships_club_id ON public.memberships USING btree (club_id);

CREATE INDEX ix_memberships_user_id ON public.memberships USING btree (user_id);

create policy "Allow users to read their own awards"
on "public"."awards"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = awards.user_id))));


create policy "Allow club managers to read their clubs"
on "public"."clubs"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM club_managers
  WHERE ((club_managers.club_id = clubs.id) AND (club_managers.user_id = ( SELECT users.id
           FROM users
          WHERE (users.auth_id = ( SELECT auth.uid() AS uid))))))));


create policy "Allow club managers to update their clubs"
on "public"."clubs"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM club_managers
  WHERE ((club_managers.club_id = clubs.id) AND (club_managers.user_id = ( SELECT users.id
           FROM users
          WHERE (users.auth_id = ( SELECT auth.uid() AS uid))))))));


create policy "Allow users to read their own details"
on "public"."details"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = details.user_id))));


create policy "Allow users to update their own details"
on "public"."details"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = details.user_id))))
with check ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = details.user_id))));


create policy "Allow users to create their own memberships"
on "public"."memberships"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = memberships.user_id))));


create policy "Allow users to read their own memberships"
on "public"."memberships"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = memberships.user_id))));


create policy "Allow users to update their own memberships"
on "public"."memberships"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = memberships.user_id))))
with check ((( SELECT auth.uid() AS uid) = ( SELECT users.auth_id
   FROM users
  WHERE (users.id = memberships.user_id))));


create policy "Allow users to create their own data"
on "public"."users"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = auth_id));


create policy "Allow users to read their own data"
on "public"."users"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = auth_id));


create policy "Allow users to update their own data"
on "public"."users"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = auth_id))
with check ((( SELECT auth.uid() AS uid) = auth_id));



