-- This migration adds an index to the `created_at` column of the `orders` table.
-- This will significantly improve the performance of sorting and fetching recent orders
-- in the admin dashboard.

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
