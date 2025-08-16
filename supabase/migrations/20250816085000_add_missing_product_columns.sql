ALTER TABLE public.products
ADD COLUMN thumbnail_image TEXT,
ADD COLUMN images TEXT[],
ADD COLUMN badge_text TEXT,
ADD COLUMN badge_color TEXT;
