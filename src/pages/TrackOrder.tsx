import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Textarea } from '../components/ui/textarea';

interface OrderStatus {
  id: string; // ID UUID de la commande
  orderId: string;
  trackingCode: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'returned';
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: Array<{
    id: string; // ID du produit
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  pricing?: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  createdAt: string;
  estimatedDelivery?: string;
  trackingHistory: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

const TrackOrder = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [orderData, setOrderData] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Nouveaux états pour le formulaire d'avis
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleTrackOrder = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: 'Missing Tracking Code',
        description: 'Please enter your tracking code to search for your order.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setNotFound(false);
    setHasReviewed(false); // Réinitialiser l'état de l'avis à chaque recherche

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`*, order_items ( id, product_id, product_name, quantity, product_price )`)
        .eq('tracking_code', trackingCode.toUpperCase())
        .single();

      if (error || !order) {
        setOrderData(null);
        setNotFound(true);
        return;
      }

      // Vérifier si un avis existe déjà pour cette commande
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', order.id)
        .limit(1);

      if (existingReview && existingReview.length > 0) {
        setHasReviewed(true);
      }

      const trackingHistory = [
          { status: 'Order Placed', date: order.created_at, description: 'Your order has been received.' },
          ...(order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? [{ status: 'Order Confirmed', date: new Date(new Date(order.created_at).getTime() + 1*60*60*1000).toISOString(), description: 'Your order is being prepared.' }] : []),
          ...(order.status === 'shipped' || order.status === 'delivered' ? [{ status: 'Shipped', date: new Date(new Date(order.created_at).getTime() + 24*60*60*1000).toISOString(), description: 'Your order is on its way.' }] : []),
          ...(order.status === 'delivered' ? [{ status: 'Delivered', date: new Date(new Date(order.created_at).getTime() + 3*24*60*60*1000).toISOString(), description: 'Your order has been delivered.' }] : []),
      ];

      setOrderData({
        id: order.id,
        orderId: order.order_id,
        trackingCode: order.tracking_code,
        status: order.status as any,
        customer: { firstName: order.customer_first_name, lastName: order.customer_last_name, phone: order.customer_phone },
        items: order.order_items.map((item: any) => ({ id: item.product_id, name: item.product_name, quantity: item.quantity, price: item.product_price })),
        total: order.total,
        createdAt: order.created_at,
        trackingHistory,
      });

    } catch (error) {
      console.error('Error tracking order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
        toast({ title: "Please select a rating.", variant: "destructive" });
        return;
    }
    if (!orderData || !orderData.items.length) return;

    setIsSubmittingReview(true);
    try {
        const productToReview = orderData.items[0];

        await supabase.from('reviews').insert({
            product_id: productToReview.id,
            order_id: orderData.id,
            rating: reviewRating,
            comment: reviewComment,
            customer_name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
        });

        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('rating, num_reviews')
            .eq('id', productToReview.id)
            .single();

        if (productError) throw productError;

        const currentRating = productData.rating || 0;
        const currentReviews = productData.num_reviews || 0;
        const newNumReviews = currentReviews + 1;
        const newRating = ((currentRating * currentReviews) + reviewRating) / newNumReviews;

        await supabase
            .from('products')
            .update({ rating: newRating.toFixed(1), num_reviews: newNumReviews })
            .eq('id', productToReview.id);

        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        setHasReviewed(true);

    } catch (error) {
        console.error("Error submitting review:", error);
        toast({ title: "Submission Failed", description: "Could not submit your review.", variant: "destructive" });
    } finally {
        setIsSubmittingReview(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'confirmed': case 'processing': return <Package className="h-5 w-5 text-blue-600" />;
      case 'shipped': return <Truck className="h-5 w-5 text-orange-600" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">
            Enter your tracking code to see the status of your order
          </p>
        </div>

        <Card className="max-w-md mx-auto mb-8">
          <CardHeader><CardTitle className="flex items-center"><Search className="h-5 w-5 mr-2" />Order Tracking</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="trackingCode">Tracking Code</Label>
              <Input id="trackingCode" placeholder="Enter your tracking code" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()} />
            </div>
            <Button onClick={handleTrackOrder} className="w-full" disabled={loading}>{loading ? 'Searching...' : 'Track Order'}</Button>
          </CardContent>
        </Card>

        {notFound && (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-gray-600">Please check your code and try again.</p>
            </CardContent>
          </Card>
        )}

        {orderData && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge className={getStatusColor(orderData.status)}>{orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-sm text-gray-600">Order ID</p><p className="font-semibold">{orderData.orderId}</p></div>
                  <div><p className="text-sm text-gray-600">Tracking Code</p><p className="font-semibold">{orderData.trackingCode}</p></div>
                  <div><p className="text-sm text-gray-600">Customer</p><p className="font-semibold">{orderData.customer.firstName} {orderData.customer.lastName}</p></div>
                  <div><p className="text-sm text-gray-600">Total</p><p className="font-semibold">{(orderData.pricing?.total || orderData.total || 0).toFixed(2)} DH</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-600">Quantity: {item.quantity}</p></div>
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} DH</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Tracking History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.trackingHistory.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">{getStatusIcon(event.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.status}</h4>
                          <span className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {orderData.status === 'delivered' && !hasReviewed && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                  <CardDescription>Share your feedback on the products you received.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Your Rating *</Label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-8 w-8 cursor-pointer transition-colors ${reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => setReviewRating(star)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comment">Your Comment</Label>
                    <Textarea id="comment" placeholder="Tell us what you think..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                  </div>
                  <Button onClick={handleReviewSubmit} disabled={isSubmittingReview}>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</Button>
                </CardContent>
              </Card>
            )}

            {orderData.status === 'delivered' && hasReviewed && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Thank you for your review!</h3>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;
