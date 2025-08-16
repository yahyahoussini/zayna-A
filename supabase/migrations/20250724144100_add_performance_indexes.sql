-- This migration adds indexes to columns that are frequently queried,
-- which will significantly improve the performance of data fetching.

-- Index on the 'products' table for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

-- Index on the 'products' table for faster searching by name
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- Index on the 'orders' table for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Index on the 'reviews' table for faster retrieval of a product's reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
