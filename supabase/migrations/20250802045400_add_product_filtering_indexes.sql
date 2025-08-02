-- This migration enhances product filtering performance by adding crucial indexes.

-- Enable the pg_trgm extension to support GIN indexes for faster text search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Add a GIN index on the product 'name' for efficient text search using ILIKE.
--    This is much faster than a standard B-tree index for pattern matching.
DROP INDEX IF EXISTS idx_products_name; -- Drop the old index if it exists
CREATE INDEX idx_products_name_gin ON public.products USING gin (name gin_trgm_ops);

-- 2. Add a standard B-tree index on the 'price' column for fast range filtering.
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- 3. Add a standard B-tree index on the 'category' text column.
--    The previous migration attempted to index `category_id`, which does not exist.
--    This corrects that by indexing the actual `category` column.
DROP INDEX IF EXISTS idx_products_category_id; -- Drop the old incorrect index
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
