-- Install unaccent for diacritic-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Install pg_trgm for substring/fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;