import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminSEOManager } from '@/components/admin/AdminSEOManager';
import { useAdminData } from '@/hooks/useAdminData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    products,
    orders,
    categories,
    loading,
    updateOrderStatus,
    addProduct,
    deleteProduct,
    updateProduct,
    addCategory,
    deleteCategory
  } = useAdminData();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Check localStorage admin auth first (for demo purposes)
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        navigate('/admin/login');
        return;
      }

      // Also check if user is authenticated with Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No Supabase user found. Using localStorage auth for demo.');
        // For demo purposes, we'll continue with localStorage auth
        // In production, you should require Supabase authentication
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <AdminStats products={products} orders={orders} />

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="seo">SEO Manager</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts
              products={products}
              categories={categories}
              addProduct={addProduct}
              deleteProduct={deleteProduct}
              updateProduct={updateProduct}
            />
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategories
              categories={categories}
              addCategory={addCategory}
              deleteCategory={deleteCategory}
            />
          </TabsContent>

          <TabsContent value="seo">
            <AdminSEOManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;