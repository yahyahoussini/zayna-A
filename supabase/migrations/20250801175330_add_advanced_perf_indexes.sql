-- This migration adds advanced indexes to drastically improve the performance
-- of complex product filtering and full-text search.

-- Step 1: Enable the pg_trgm extension for trigram text matching.
-- This is necessary for creating a GIN index that can accelerate ILIKE searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 2: Create a GIN index on the 'name' column for fast text search.
-- This index allows the database to efficiently use the '%' wildcard at the
-- beginning of a search term in an ILIKE query.
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin (name gin_trgm_ops);

-- Step 3: Create a composite index on category and price.
-- This index optimizes queries that filter by category and sort by price,
-- which is a very common operation on the products page.
CREATE INDEX IF NOT EXISTS idx_products_category_price ON public.products (category, price);
