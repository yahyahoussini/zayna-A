import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../integrations/supabase/types';
import { toast } from '../components/ui/use-toast';

export const useProductSearch = (initialProducts: Product[], initialCategories: string[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  const filterAndSearchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data: products, error } = await query;

      if (error) {
        throw error;
      }

      setFilteredProducts(products || []);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      filterAndSearchProducts();
    }, 300); // Debounce to avoid excessive API calls

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, filterAndSearchProducts]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    loading,
    categories: ['all', ...initialCategories]
  };
};
