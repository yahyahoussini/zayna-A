-- This migration enhances product filtering performance by adding crucial indexes.

-- 1. Add a standard B-tree index on the product 'name' for text search.
--    Note: For optimal performance with `ilike`, a GIN index with pg_trgm is preferred,
--    but this requires the extension to be enabled on the database.
--    This B-tree index provides a good baseline performance improvement.
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- 2. Add a standard B-tree index on the 'price' column for fast range filtering.
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- 3. Add a standard B-tree index on the 'category' text column.
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- 4. Add an index on `created_at` for faster sorting of new products.
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
