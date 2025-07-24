-- supabase/migrations/20250713_add_reviews_and_discounts.sql

-- AJOUTER DES COLONNES À LA TABLE DES PRODUITS
ALTER TABLE public.products
ADD COLUMN rating NUMERIC(2, 1) DEFAULT 4.5,
ADD COLUMN num_reviews INTEGER DEFAULT 0,
ADD COLUMN discount_percentage NUMERIC(5, 2) DEFAULT 0.00;


-- CRÉER LA TABLE POUR LES AVIS (REVIEWS)
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_approved BOOLEAN DEFAULT true
);

-- ACTIVER LA SÉCURITÉ AU NIVEAU DES LIGNES (RLS) POUR LA TABLE REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- DÉFINIR LES POLITIQUES D'ACCÈS POUR LA TABLE REVIEWS
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews
FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can insert their own reviews"
ON public.reviews
FOR INSERT WITH CHECK (true); -- En production, vous pourriez vouloir une vérification plus stricte

CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));