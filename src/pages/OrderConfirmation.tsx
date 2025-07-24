import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, MessageCircle, Package, Truck, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client'; // Import du client Supabase

interface OrderData {
  orderId: string;
  trackingCode: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  paymentMethod: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
}

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tente d'abord de récupérer les données de la commande depuis l'état de navigation (passé depuis la page de paiement)
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setLoading(false);
      return;
    }

    // Sinon, récupère les données depuis Supabase
    const fetchOrderData = async () => {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('order_id', orderId)
          .single();
          
        if (error) throw error;

        if (order) {
          const deliveryDate = new Date();
          deliveryDate.setDate(new Date(order.created_at).getDate() + 5);
          
          const formattedOrderData: OrderData = {
            orderId: order.order_id,
            trackingCode: order.tracking_code,
            customer: {
              firstName: order.customer_first_name,
              lastName: order.customer_last_name,
              email: order.customer_email || 'Non fourni',
              phone: order.customer_phone,
            },
            shippingAddress: {
              address: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state || '',
              zipCode: order.shipping_zip_code || '',
              country: order.shipping_country || 'Maroc',
            },
            items: order.order_items.map((item: any) => ({
              id: item.product_id || item.id,
              name: item.product_name,
              price: item.product_price,
              quantity: item.quantity,
              image: item.product_image || '/placeholder.svg',
            })),
            pricing: {
              subtotal: order.subtotal,
              shipping: order.shipping_cost,
              total: order.total,
            },
            paymentMethod: 'Cash on Delivery',
            status: order.status,
            createdAt: order.created_at,
            estimatedDelivery: deliveryDate.toLocaleDateString(),
          };
          setOrderData(formattedOrderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    } else {
      setLoading(false);
    }
  }, [orderId, location.state]);

  const handleWhatsAppOrder = () => {
    if (!orderData) return;

    const phoneNumber = '+1234567890'; // Remplacez par votre numéro WhatsApp Business
    
    const orderDetails = `
🛍️ *New Order Confirmation*

📋 *Order ID:* ${orderData.orderId}
🔍 *Tracking Code:* ${orderData.trackingCode}
👤 *Customer:* ${orderData.customer.firstName} ${orderData.customer.lastName}
📧 *Email:* ${orderData.customer.email}
📱 *Phone:* ${orderData.customer.phone}

📦 *Items:*
${orderData.items.map(item => 
  `• ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

📍 *Shipping Address:*
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}
${orderData.shippingAddress.country}

💰 *Order Total:* $${orderData.pricing.total.toFixed(2)}
💳 *Payment:* Cash on Delivery

📅 *Order Date:* ${new Date(orderData.createdAt).toLocaleDateString()}

Thank you for your order! 🎉
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const downloadOrderReceipt = () => {
    if (!orderData) return;

    const receiptContent = `
ORDER RECEIPT
=============

Order ID: ${orderData.orderId}
Tracking Code: ${orderData.trackingCode}
Date: ${new Date(orderData.createdAt).toLocaleDateString()}

CUSTOMER INFORMATION
-------------------
Name: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.email}
Phone: ${orderData.customer.phone}

SHIPPING ADDRESS
---------------
${orderData.shippingAddress.address}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}
${orderData.shippingAddress.country}

ORDER ITEMS
-----------
${orderData.items.map(item => 
  `${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

ORDER SUMMARY
------------
Subtotal: $${orderData.pricing.subtotal.toFixed(2)}
Shipping: $${orderData.pricing.shipping.toFixed(2)}
Total: $${orderData.pricing.total.toFixed(2)}

Payment Method: Cash on Delivery

Track your order at: /track-order using code: ${orderData.trackingCode}

Thank you for shopping with MyCODStore!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${orderData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-8">
              The order you're looking for could not be found.
            </p>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Thank you for your order. We'll process it shortly.
          </p>
          {orderData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-lg font-semibold text-blue-800">Your Tracking Code:</p>
              <p className="text-2xl font-bold text-blue-900">{orderData.trackingCode}</p>
              <p className="text-sm text-blue-600 mt-2">
                Save this code to track your order anytime
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge variant="secondary">
                    {orderData?.status.charAt(0).toUpperCase() + orderData?.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">{orderData?.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tracking Code</p>
                    <p className="font-semibold">{orderData?.trackingCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">
                      {orderData && new Date(orderData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold">Cash on Delivery</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold">{orderData?.estimatedDelivery}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData?.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">${item.price} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">
                    {orderData?.customer?.firstName} {orderData?.customer?.lastName}
                  </p>
                  <p>{orderData?.shippingAddress?.address || 'Address not provided'}</p>
                  <p>
                    {orderData?.shippingAddress?.city || ''}{orderData?.shippingAddress?.city && orderData?.shippingAddress?.state ? ', ' : ''}{orderData?.shippingAddress?.state || ''} {orderData?.shippingAddress?.zipCode || ''}
                  </p>
                  <p>{orderData?.shippingAddress?.country || ''}</p>
                  <p className="text-gray-600 mt-2">
                    Phone: {orderData?.customer?.phone || 'Not provided'}
                  </p>
                  <p className="text-gray-600">
                    Email: {orderData?.customer?.email || 'Not provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${orderData?.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {orderData?.pricing.shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${orderData?.pricing.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${orderData?.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Track Order Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Track Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use your tracking code to check the status of your order anytime.
                </p>
                <Link to="/track-order">
                  <Button variant="outline" className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* WhatsApp Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Order to WhatsApp
                </Button>
                
                <Button
                  onClick={downloadOrderReceipt}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>
                    Questions about your order? Contact us on WhatsApp for instant support.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-gray-600">
                        Your order has been received and is being processed.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-600">Processing</p>
                      <p className="text-sm text-gray-600">
                        We're preparing your items for shipment.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-600">Shipped</p>
                      <p className="text-sm text-gray-600">
                        Your order is on its way to you.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-600">Delivered</p>
                      <p className="text-sm text-gray-600">
                        Pay on delivery and enjoy your purchase!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Card>
              <CardContent className="pt-6">
                <Link to="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;