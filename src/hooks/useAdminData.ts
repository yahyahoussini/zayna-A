import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Order, Category, ProductForm } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

export const useAdminData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // --- MODIFIED: loadData now fetches everything in parallel ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      // --- All requests are sent at the same time ---
      const [productsResponse, ordersResponse, categoriesResponse] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items ( * )').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ]);
      
      // --- Handle all potential errors after requests complete ---
      if (productsResponse.error) throw productsResponse.error;
      if (ordersResponse.error) throw ordersResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      // --- Set all state at once ---
      setProducts(productsResponse.data || []);
      setOrders(ordersResponse.data || []);
      setCategories(categoriesResponse.data || []);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({ title: 'Error', description: 'Failed to load data from the server.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []); // Use useCallback to memoize this function

  useEffect(() => {
    loadData();
  }, [loadData]);


  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('order_id', orderId);

      if (error) throw error;

      const updatedOrders = orders.map(order =>
        order.order_id === orderId ? { ...order, status: newStatus as any } : order
      );
      setOrders(updatedOrders);
      toast({ title: 'Status Updated', description: `Order ${orderId} status updated.` });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    }
  };

  const addProduct = async (productForm: ProductForm) => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    const price = parseFloat(productForm.price);
    const discount = parseFloat(productForm.discount_percentage) || 0;

    if (isNaN(price) || isNaN(discount)) {
      toast({ title: 'Invalid Number', description: 'Please enter a valid number for price and discount.', variant: 'destructive' });
      return;
    }

        try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productForm.name,
          price: price,
          category: productForm.category,
          description: productForm.description,
          thumbnail_image: productForm.images?.[0] || null,
          images: productForm.images,
          in_stock: true,
          discount_percentage: discount,
          badge_text: productForm.badge_text,
          badge_color: productForm.badge_color,
        })
        .select()
        .single();


        

      if (error) throw error;

      setProducts([data, ...products]);
      toast({ title: 'Product Added', description: `${data.name} has been added successfully.` });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: 'Error', description: `Failed to add product. Details: ${error.message}`, variant: 'destructive' });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== productId));
      toast({ title: 'Product Deleted', description: 'Product has been removed successfully.' });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Error', description: 'Failed to delete product.', variant: 'destructive' });
    }
  };

  const updateProduct = async (editProductForm: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editProductForm.name,
          price: editProductForm.price,
          category: editProductForm.category,
          description: editProductForm.description,
          in_stock: editProductForm.in_stock,
          rating: editProductForm.rating,
          discount_percentage: editProductForm.discount_percentage,
          badge_text: editProductForm.badge_text,
          badge_color: editProductForm.badge_color,
           images: editProductForm.images,
          thumbnail_image: editProductForm.images?.[0] || null,
        })
        .eq('id', editProductForm.id);

      if (error) throw error;

      setProducts(products.map(p => p.id === editProductForm.id ? editProductForm : p));
      toast({ title: 'Product Updated', description: 'Product has been updated successfully.' });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({ title: 'Error', description: 'Failed to update product.', variant: 'destructive' });
    }
  };

  const addCategory = async (categoryForm: Omit<Category, 'id'>) => {
    if (!categoryForm.name) {
      toast({ title: 'Missing Information', description: 'Please enter a category name.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryForm.name, description: categoryForm.description })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      toast({ title: 'Category Added', description: `${data.name} category has been created.` });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ title: 'Error', description: 'Failed to add category.', variant: 'destructive' });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({ title: 'Category Deleted', description: 'Category has been removed successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'Error', description: 'Failed to delete category.', variant: 'destructive' });
    }
  };

  return {
    products,
    orders,
    categories,
    loading,
    updateOrderStatus,
    addProduct,
    deleteProduct,
    updateProduct,
    addCategory,
    deleteCategory,
    loadData
  };
};