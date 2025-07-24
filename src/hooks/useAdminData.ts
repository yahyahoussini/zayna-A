import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, Order, Category, ProductForm } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

export const useAdminData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items ( * )')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: 'Failed to load data from the server.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

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
          // --- DEBUT DE LA MODIFICATION ---
          thumbnail_image: productForm.images?.[0] || null, // Utilise le nouveau nom de colonne
          images: productForm.images,
          // --- FIN DE LA MODIFICATION ---
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
          image: editProductForm.image,
          in_stock: editProductForm.in_stock,
          rating: editProductForm.rating,
          num_reviews: editProductForm.num_reviews,
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

  useEffect(() => {
    loadData();
  }, []);

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