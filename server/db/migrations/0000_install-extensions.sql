-- Install pg_trgm for substring/fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Install unaccent for diacritic-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
SELECT public.unaccent('public.unaccent', $1);
$$;

