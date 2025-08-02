// src/pages/ProductDetail.tsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Zap, MessageCircle, X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { useProductSeo } from '@/hooks/useProductSeo';
import { useLanguage } from '@/context/LanguageContext';

const ProductSEOWrapper = ({ productId, children }) => {
  const { lang } = useLanguage();
  const { seoData, loading } = useProductSeo(productId, lang);

  if (loading) {
    return null; // Or a loading spinner for the helmet content
  }

  return (
    <>
      <Helmet>
        {seoData?.seo_title && <title>{seoData.seo_title}</title>}
        {seoData?.meta_description && <meta name="description" content={seoData.meta_description} />}
        {seoData?.keywords && <meta name="keywords" content={seoData.keywords.join(', ')} />}
        {seoData?.slug && <link rel="canonical" href={`https://zayna.vercel.app/product/${seoData.slug}`} />}
        {seoData?.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(seoData.structured_data)}
          </script>
        )}
      </Helmet>
      {children}
    </>
  );
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  thumbnail_image: string;
  rating: number;
  num_reviews: number;
  discount_percentage: number;
  in_stock: boolean;
  brand: string;
  category: string;
  freeShipping: boolean;
}

interface BuyNowForm {
  name: string;
  phone: string;
  city: string;
  location: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showBuyNowForm, setShowBuyNowForm] = useState(false);
  const { addToCart } = useCart();

  const form = useForm({
    defaultValues: {
      name: '',
      phone: '',
      city: '',
      location: '',
    }
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProduct({
            ...data,
            stock: data.in_stock ? 50 : 0, // Mocked stock
            brand: 'Bio Cosmétiques Maroc',
            freeShipping: data.price > 500,
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.thumbnail_image || product.images[0]
        });
      }
      toast({
        title: 'Item added to cart',
        description: 'Check your cart to complete your order.',
      });
    }
  };

  const generateOrderId = () => {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const generateTrackingCode = () => {
    return 'TRACK-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleBuyNow = async (data: BuyNowForm) => {
    if (!product) return;

    try {
      const orderId = generateOrderId();
      const trackingCode = generateTrackingCode();
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const subtotal = product.price * quantity;
      const shipping = subtotal >= 50 ? 0 : 9.99;
      const total = subtotal + shipping;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          tracking_code: trackingCode,
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_phone: data.phone,
          shipping_address: data.location,
          shipping_city: data.city,
          subtotal: subtotal,
          shipping_cost: shipping,
          total: total,
        })
        .select()
        .single();

      if (orderError) throw orderError;
        
      const { error: itemsError } = await supabase.from('order_items').insert({
        order_id: orderData.id,
        product_name: product.name,
        product_price: product.price,
        quantity: quantity,
        product_image: product.thumbnail_image || product.images[0]
      });

      if (itemsError) throw itemsError;

      const fullOrderData = {
        orderId,
        trackingCode,
        customer: { firstName, lastName, email: '', phone: data.phone },
        shippingAddress: { address: data.location, city: data.city, state: '', zipCode: '', country: 'Morocco' },
        items: [{ id: product.id, name: product.name, price: product.price, quantity: quantity, image: product.thumbnail_image || product.images[0] }],
        pricing: { subtotal, shipping, total },
        paymentMethod: 'Cash on Delivery',
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: ''
      };

      navigate(`/order-confirmation/${orderId}`, {
        state: { orderData: fullOrderData }
      });

      toast({
        title: 'Order Placed Successfully!',
        description: `Your order ${orderId} has been placed successfully.`,
      });

      form.reset();
      setShowBuyNowForm(false);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'There was an error placing your order. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.error('Error sharing', error));
    } else {
      toast({
        title: 'Web Share API not supported',
        description: 'Please use another method to share this product.',
      });
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const whatsappMessage = encodeURIComponent(
      `Check out this product: ${product.name} - ${product.description} at ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  const isVideo = (url: string) => url?.toLowerCase().endsWith('.mp4') || url?.toLowerCase().endsWith('.webm');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for could not be found.
            </p>
            <Link to="/products">
              <Button>Return to Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProductSEOWrapper productId={id}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            {isVideo(product.images?.[selectedImage]) ? (
              <video
                src={product.images[selectedImage]}
                controls
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
            ) : (
              <img
                src={product.images?.[selectedImage] || product.thumbnail_image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex space-x-2">
              {product.images?.map((media, index) => (
                <div
                  key={index}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer ${
                    index === selectedImage ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  {isVideo(media) ? (
                    <video src={media} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <img src={media} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < product.rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                {product.rating.toFixed(1)} ({product.num_reviews} reviews)
              </span>
            </div>

            <div className="mb-4">
              {product.discount_percentage > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {product.discount_percentage}% off
                </Badge>
              )}
              {product.freeShipping && (
                <Badge variant="secondary">Free Shipping</Badge>
              )}
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
                {product.discount_percentage > 0 && (
                  <span className="text-gray-500 line-through ml-2">
                    ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              <div>
                {product.in_stock ? (
                  <Badge variant="outline">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            <div className="flex items-center space-x-4 mb-6">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity:
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button onClick={handleAddToCart} disabled={!product.in_stock}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="secondary" onClick={() => setShowBuyNowForm(true)} disabled={!product.in_stock}>
                <Zap className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                const whatsappMessage = encodeURIComponent(
                  `Hi, I want to ask about ${product.name} - ${product.description}`
                );
                window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
              }}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Continue to WhatsApp
            </Button>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-green-500" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-yellow-500" />
                <span>30-Day Returns</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-around">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>

        {showBuyNowForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Complete Your Order</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBuyNowForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <form onSubmit={form.handleSubmit(handleBuyNow)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...form.register('name', { required: true })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone', { required: true })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...form.register('city', { required: true })}
                      placeholder="Enter your city"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location/Address *</Label>
                    <Textarea
                      id="location"
                      {...form.register('location', { required: true })}
                      placeholder="Enter your detailed address"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Product:</span>
                      <span>{product?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span>{product?.price} DH </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{product ? (product.price * quantity).toFixed(2) : '0.00'} DH </span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Place Order (Cash on Delivery)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
        </div>

        <Footer />
      </div>
    </ProductSEOWrapper>
  );
};

export default ProductDetail;