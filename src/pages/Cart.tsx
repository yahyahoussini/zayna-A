import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock, Loader2, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types'; // Assurez-vous d'avoir un type Product défini

// --- Schéma de validation du formulaire ---
const shippingSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet doit contenir au moins 3 caractères." }),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{10,}$/, { message: "Veuillez entrer un numéro de téléphone valide." }),
  city: z.string().min(2, { message: "La ville est requise." }),
  location: z.string().min(5, { message: "Une adresse détaillée est requise." }),
  notes: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, { message: "Vous devez accepter les conditions." }),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// --- Composant pour le panier vide ---
const EmptyCart = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Fetch the 3 most recent products. You can customize this query.
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        
        // Assurez-vous que les images sont des URL valides
        const productsWithImages = data.map(p => ({ ...p, image: p.images[0] || 'https://via.placeholder.com/300x300.png/F2EFEB/3D2C21?text=Zayna' }));
        setFeaturedProducts(productsWithImages);

      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Nous n'avons pas pu charger les produits en vedette. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image, // Utilisez l'image principale
      quantity: 1,
    });
    toast({ title: `${product.name} a été ajouté au panier!` });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ShoppingBag className="h-24 w-24 text-primary/50 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide pour le moment</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          On dirait que vous n'avez encore rien ajouté. Parcourez nos collections pour trouver quelque chose qui vous plaira !
        </p>
        <Button asChild size="lg">
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuer les achats
          </Link>
        </Button>
      </motion.div>

      <Separator className="my-12 bg-gray-200" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Découvrez nos Nouveautés</h2>
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
            <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
            </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105" />
                  </Link>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate" title={product.name}>{product.name}</h3>
                    <p className="text-primary font-bold mt-1">{product.price.toFixed(2)} DH</p>
                    <Button className="w-full mt-4" onClick={() => handleAddToCart(product)}>
                      Ajouter au panier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};


const Cart = () => {
  const navigate = useNavigate();
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { fullName: '', phone: '', city: '', location: '', notes: '', agreeToTerms: true },
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) removeFromCart(id);
    else updateQuantity(id, newQuantity);
  };

  const handleSubmitOrder = async (data: ShippingFormData) => {
    setLoading(true);
    try {
      const orderId = 'ZNA-' + Date.now();
      const trackingCode = 'TRK-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders').insert({
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
          notes: data.notes
        }).select().single();

      if (orderError) throw orderError;

      const orderItems = state.items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        product_price: item.price,
        product_image: item.image,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      const orderResponse = {
        orderId, trackingCode,
        customer: { firstName, lastName, phone: data.phone },
        shippingAddress: { address: data.location, city: data.city },
        items: state.items,
        pricing: { subtotal, shipping, total },
        createdAt: new Date().toISOString(),
      };

      clearCart();
      navigate(`/order-confirmation/${orderId}`, { state: { orderData: orderResponse } });
      toast({ title: 'Commande passée avec succès !', description: `Votre commande ${orderId} a été enregistrée.` });

    } catch (error) {
      console.error('Error placing order:', error);
      toast({ title: 'Échec de la commande', description: 'Une erreur est survenue lors de la validation de votre commande.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = state.total;
  const shipping = subtotal >= 250 ? 0 : 25;
  const total = subtotal + shipping;

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Helmet><title>Panier Vide | Zayna</title></Helmet>
        <Header />
        <EmptyCart />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Panier & Commande | Zayna</title></Helmet>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">Panier & Commande</h1>
          <p className="text-lg text-gray-600 mt-2">Vérifiez vos articles et finalisez votre commande.</p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmitOrder)}>
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                <Card className="bg-white shadow-lg">
                  <CardHeader><CardTitle>Résumé de votre panier ({state.items.length})</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {state.items.map(item => (
                        <div key={item.id} className="p-4 flex items-center space-x-4">
                          <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-gray-600">{item.price.toFixed(2)} DH</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <span className="w-10 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                          </div>
                          <p className="font-semibold w-24 text-right">{(item.price * item.quantity).toFixed(2)} DH</p>
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Shipping Information */}
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <Card className="bg-white shadow-lg">
                  <CardHeader><CardTitle className="flex items-center"><Truck className="h-5 w-5 mr-2" />Informations de livraison</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><Label htmlFor="fullName">Nom complet *</Label><Input id="fullName" {...form.register('fullName')} />{form.formState.errors.fullName && <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>}</div>
                      <div><Label htmlFor="phone">Numéro de téléphone *</Label><Input id="phone" type="tel" {...form.register('phone')} />{form.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>}</div>
                    </div>
                    <div><Label htmlFor="city">Ville *</Label><Input id="city" {...form.register('city')} />{form.formState.errors.city && <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>}</div>
                    <div><Label htmlFor="location">Adresse *</Label><Textarea id="location" {...form.register('location')} />{form.formState.errors.location && <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>}</div>
                    <div><Label htmlFor="notes">Notes de commande (Optionnel)</Label><Textarea id="notes" {...form.register('notes')} /></div>
                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox id="terms" checked={form.watch('agreeToTerms')} onCheckedChange={(checked) => form.setValue('agreeToTerms', checked as boolean)} />
                      <Label htmlFor="terms" className="text-sm">J'accepte les <Link to="/terms" className="text-primary hover:underline">Termes et Conditions</Link></Label>
                    </div>
                    {form.formState.errors.agreeToTerms && <p className="text-red-500 text-sm">{form.formState.errors.agreeToTerms.message}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky top-24">
              <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Card className="bg-white shadow-lg">
                  <CardHeader><CardTitle>Résumé de la commande</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Sous-total:</span><span>{subtotal.toFixed(2)} DH</span></div>
                      <div className="flex justify-between"><span>Livraison:</span><span>{shipping === 0 ? <span className="text-green-600">Gratuite</span> : `${shipping.toFixed(2)} DH`}</span></div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{total.toFixed(2)} DH</span></div>
                    <Separator />
                    <Button size="lg" className="w-full" type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? 'Validation en cours...' : 'Valider la commande (Paiement à la livraison)'}
                    </Button>
                    <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 pt-2">
                      <Lock className="h-4 w-4" /> Commande sécurisée
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;