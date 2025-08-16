-- Drop the existing SELECT policy on the orders table
DROP POLICY IF EXISTS "Orders are viewable by admins" ON public.orders;

-- Create a new policy to allow anyone to view a recently created order
CREATE POLICY "Anyone can view a recently created order"
ON public.orders
FOR SELECT
USING (created_at > (now() - interval '1 minute'));

-- Create a new policy to allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
