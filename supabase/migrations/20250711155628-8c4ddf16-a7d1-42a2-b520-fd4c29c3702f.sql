-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('electronics', 'Electronic devices and gadgets'),
('accessories', 'Tech accessories and peripherals'),
('wearables', 'Smartwatches and fitness trackers'),
('home', 'Home and living items');

-- Create website_analytics table for real analytics data
CREATE TABLE public.website_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for analytics
ALTER TABLE public.website_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for analytics (admins only)
CREATE POLICY "Analytics viewable by admins" 
ON public.website_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Anyone can insert analytics" 
ON public.website_analytics 
FOR INSERT 
WITH CHECK (true);

-- Insert some sample analytics data based on existing orders
INSERT INTO public.website_analytics (visitor_id, page_url, referrer, city, country) 
SELECT 
  'visitor_' || generate_random_uuid()::text,
  '/products',
  CASE 
    WHEN random() < 0.3 THEN 'https://google.com'
    WHEN random() < 0.5 THEN 'https://facebook.com'
    WHEN random() < 0.7 THEN 'https://instagram.com'
    ELSE 'direct'
  END,
  shipping_city,
  COALESCE(shipping_country, 'Morocco')
FROM public.orders;