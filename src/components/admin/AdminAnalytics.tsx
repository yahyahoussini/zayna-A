import { useState, useEffect } from 'react';
import { MapPin, Globe, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const AdminAnalytics = () => {
  const [realAnalytics, setRealAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topProducts: [] as any[],
    avgOrderValue: 0,
    cityAnalytics: [] as any[],
    trafficSources: [] as any[]
  });

  useEffect(() => {
    loadRealAnalytics();
  }, []);

  const loadRealAnalytics = async () => {
    try {
      // Récupérer les données réelles des commandes
      const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, shipping_city, shipping_country');
      
      // Récupérer les produits des commandes
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, quantity, product_price');

      // Récupérer les données d'analyse du site web
      const { data: analytics } = await supabase
        .from('website_analytics')
        .select('city, country, referrer');

      if (orders) {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Regrouper les produits par ventes
        const productSales: { [key: string]: { quantity: number, revenue: number } } = {};
        orderItems?.forEach(item => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { quantity: 0, revenue: 0 };
          }
          productSales[item.product_name].quantity += item.quantity;
          productSales[item.product_name].revenue += item.quantity * item.product_price;
        });

        const topProducts = Object.entries(productSales)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 6);

        // Analyser les données par ville à partir des commandes réelles
        const cityData: { [key: string]: { orders: number, revenue: number, country: string } } = {};
        orders.forEach(order => {
          const city = order.shipping_city || 'Unknown';
          const country = order.shipping_country || 'Morocco';
          if (!cityData[city]) {
            cityData[city] = { orders: 0, revenue: 0, country };
          }
          cityData[city].orders += 1;
          cityData[city].revenue += order.total || 0;
        });

        const cityAnalytics = Object.entries(cityData)
          .map(([city, data]) => ({
            city,
            country: data.country,
            visitors: Math.floor(data.orders * 1.5), // Estimer les visiteurs à partir des commandes
            orders: data.orders,
            revenue: data.revenue
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 8);

        // Analyser les sources de trafic
        const referrerData: { [key: string]: number } = {};
        analytics?.forEach(entry => {
          const source = entry.referrer || 'direct';
          referrerData[source] = (referrerData[source] || 0) + 1;
        });

        const totalVisitors = analytics?.length || 1;
        const trafficSources = Object.entries(referrerData)
          .map(([source, visitors]) => ({
            source: source.includes('google') ? 'Google Search' :
                   source.includes('facebook') ? 'Facebook' :
                   source.includes('instagram') ? 'Instagram' :
                   source === 'direct' ? 'Direct Link' : 'Other',
            visitors,
            percentage: (visitors / totalVisitors) * 100
          }))
          .sort((a, b) => b.visitors - a.visitors);

        setRealAnalytics({
          totalRevenue,
          totalOrders,
          topProducts,
          avgOrderValue,
          cityAnalytics,
          trafficSources
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Analytics Summary
          </CardTitle>
          <CardDescription>
            Live data from your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">${realAnalytics.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{realAnalytics.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">${realAnalytics.avgOrderValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{realAnalytics.topProducts.length}</div>
              <div className="text-sm text-gray-600">Product Types</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Top Selling Products</h4>
            {realAnalytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
            {realAnalytics.topProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Geographic Analytics
          </CardTitle>
          <CardDescription>
            Customer distribution by city from real orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realAnalytics.cityAnalytics.length > 0 ? (
              realAnalytics.cityAnalytics.map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{city.city}, {city.country}</p>
                      <p className="text-sm text-gray-600">{city.visitors} estimated visitors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${city.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{city.orders} orders</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No geographic data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Product Performance
          </CardTitle>
          <CardDescription>
            Best selling products from real sales data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realAnalytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
            {realAnalytics.topProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No product sales data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Traffic Sources
          </CardTitle>
          <CardDescription>
            Real visitor sources from analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realAnalytics.trafficSources.length > 0 ? (
              realAnalytics.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {source.source === 'Google Search' ? '' :
                       source.source === 'Facebook' ? '' :
                       source.source === 'Instagram' ? '' :
                       source.source === 'Direct Link' ? '' : ''}
                    </span>
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(source.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{source.visitors}</p>
                    <p className="text-sm text-gray-600">{source.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No traffic data available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};