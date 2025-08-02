import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOData {
  seo_title?: string;
  meta_description?: string;
  keywords?: string[];
  slug?: string;
  alt_text?: string;
  structured_data?: Record<string, unknown>;
}

export const useProductSeo = (productId: string | undefined, lang: string | undefined) => {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeoData = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_seo')
          .select('seo_title, meta_description, keywords, slug, alt_text, structured_data')
          .eq('product_id', productId)
          .eq('lang', lang)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setSeoData(data);
      } catch (error) {
        console.error('Error fetching product SEO data:', error);
        setSeoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSeoData();
  }, [productId, lang]);

  return { seoData, loading };
};
