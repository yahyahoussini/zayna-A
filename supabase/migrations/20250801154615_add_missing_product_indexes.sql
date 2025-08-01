-- This migration adds the missing indexes that are critical for product filtering and sorting performance.

-- Add index on the 'price' column for faster sorting and price-range filtering.
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);

-- Add index on the 'created_at' column for faster sorting by "newest".
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Add index on the 'category' text column, as it's used directly in filtering queries.
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
