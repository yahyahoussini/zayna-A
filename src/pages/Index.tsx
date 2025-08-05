import { useState, useEffect, memo, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Star, Truck, Shield, MessageCircle, ArrowRight, Sparkles, Bot, ShoppingBasket, ClipboardCheck, HandCoins, Quote } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ThreeDShowcase } from '../components/ThreeDShowcase';
import Autoplay from "embla-carousel-autoplay";


// --- Animation Variants for Framer Motion ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};


// --- Interface Produit ---
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  in_stock: boolean;
  thumbnail_image?: string;
  images?: string[];
  badge_text?: string;
  badge_color?: string;
  rating?: number;
  discount_percentage?: number;
}

// --- Composant ProductCard avec effet 3D amélioré ---
const HomePageProductCard = memo(({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const displayImage = product.thumbnail_image || product.images?.[0] || 'https://placehold.co/400x400/F0FFF4/228B22?text=Zayna';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: displayImage
    });
    toast({
      title: "Ajouté au Panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };
  
  const calculatedOriginalPrice = product.price / (1 - (product.discount_percentage || 0) / 100);

  return (
    <motion.div variants={itemVariants} className="h-full">
        <Link to={`/product/${product.id}`} className="block h-full group [perspective:1000px]">
        <Card className="transition-all duration-500 h-full flex flex-col border-transparent group-hover:shadow-2xl group-hover:[transform:rotateY(5deg)_rotateX(5deg)] relative">
            <CardHeader className="p-0">
            <div className="relative w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg">
                <img
                src={displayImage}
                alt={`Photo de ${product.name} - Cosmétique bio Maroc`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.discount_percentage && product.discount_percentage > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white border-red-500">
                    -{product.discount_percentage}%
                </Badge>
                )}
            </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow transition-all duration-500 group-hover:[transform:translateZ(20px)]">
            <div className="flex-grow">
                <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                <CardTitle className="text-base font-semibold mb-2 h-12 line-clamp-2">{product.name}</CardTitle>
                <div className="flex items-center mb-3">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm text-gray-600">{product.rating?.toFixed(1) || '4.5'}</span>
                </div>
            </div>
            <div className="mt-auto">
                <div className="flex items-baseline justify-start mb-4">
                <span className="text-xl font-bold text-primary mr-2">{product.price.toFixed(2)} DH</span>
                {product.discount_percentage && product.discount_percentage > 0 && (
                    <span className="text-gray-500 line-through">{calculatedOriginalPrice.toFixed(2)} DH</span>
                )}
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    disabled={!product.in_stock}
                    variant="outline"
                    >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.in_stock ? 'Ajouter au Panier' : 'Épuisé'}
                    </Button>
                </motion.div>
            </div>
            </CardContent>
        </Card>
        </Link>
    </motion.div>
  );
});

const ProductSkeletonCard = () => (
    <Card className="h-full flex flex-col">
        <Skeleton className="h-56 w-full rounded-t-lg" />
        <CardContent className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-full mb-3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="mt-auto">
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
        </CardContent>
    </Card>
);

const ParallaxImage = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    return (
        <div ref={ref} className="w-full max-w-sm h-96 overflow-hidden rounded-lg shadow-lg">
             <motion.img
                src="https://placehold.co/500x600/a3e635/4d7c0f?text=Coopérative"
                alt="Femmes travaillant dans une coopérative d'huile d'argan au Maroc"
                className="w-full h-[140%] object-cover"
                style={{ y }}
             />
        </div>
    )
}

// --- Composant Principal de la page d'accueil ---
const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newestProducts, setNewestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quelle est la différence entre un produit 'bio' et 'naturel' chez Zayna ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Chez Zayna, 'naturel' signifie que l'ingrédient provient de la nature. 'Bio' (biologique) va plus loin : c'est un label qui garantit que l'ingrédient a été cultivé sans pesticides ni produits chimiques de synthèse, et que sa transformation respecte des normes écologiques strictes. La plupart de nos produits phares, comme l'huile d'Argan, sont certifiés bio."
        }
      },
      {
        "@type": "Question",
        "name": "Les produits Zayna sont-ils testés sur les animaux ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolument jamais. Nous sommes une marque 100% sans cruauté. Nous testons nos produits via des méthodes alternatives et sur des volontaires humains pour garantir leur sécurité et leur efficacité, dans le respect total de la vie animale."
        }
      },
      {
        "@type": "Question",
        "name": "Comment puis-je savoir quel produit est adapté à mon type de peau ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "C'est une excellente question ! Chaque page de produit contient une section \"Pour quel type de peau ?\". Pour un conseil plus personnalisé, n'hésitez pas à contacter notre assistante beauté via WhatsApp. Elle se fera un plaisir de vous guider vers la routine de soins parfaite pour vous."
        }
      },
      {
        "@type": "Question",
        "name": "Proposez-vous le paiement par carte bancaire ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Actuellement, pour simplifier et sécuriser le processus pour tous nos clients au Maroc, nous proposons exclusivement le paiement à la livraison. Vous ne payez votre commande qu'au moment où vous la recevez."
        }
      }
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://www.zayna.ma/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.zayna.ma/products?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, description, category, in_stock, thumbnail_image, images, badge_text, badge_color, rating, discount_percentage')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        if (data) {
          setFeaturedProducts(data.slice(0, 4));
          setNewestProducts(data.slice(4, 8).length ? data.slice(4, 8) : data.slice(0, 4));
        }
      } catch (e) {
        const error = e as Error;
        console.error('Error fetching products:', error);
        toast({
            title: 'Erreur de chargement des produits',
            description: "Impossible de récupérer les produits. Veuillez réessayer plus tard.",
            variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const { top, height } = container.getBoundingClientRect();
        const scrollableHeight = height - window.innerHeight;

        if (scrollableHeight <= 0) {
          setScrollProgress(0);
          return;
        }
        
        const currentScroll = -top;
        const progress = Math.min(Math.max(currentScroll / scrollableHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- NEW: Dummy data for testimonials ---
  const testimonials = [
    {
      name: 'Fatima Z.',
      location: 'Casablanca',
      avatar: 'https://i.pravatar.cc/150?u=fatima',
      rating: 5,
      text: "L'huile d'argan est d'une pureté incroyable. Ma peau n'a jamais été aussi douce. Service client au top et livraison rapide !"
    },
    {
      name: 'Youssef A.',
      location: 'Marrakech',
      avatar: 'https://i.pravatar.cc/150?u=youssef',
      rating: 5,
      text: "J'utilise le savon noir avant chaque hammam, c'est devenu un indispensable. La qualité est incomparable. Je recommande vivement."
    },
    {
      name: 'Amina K.',
      location: 'Rabat',
      avatar: 'https://i.pravatar.cc/150?u=amina',
      rating: 4,
      text: "Très satisfaite de ma commande. Les produits sentent divinement bon et les textures sont très agréables. Un vrai plaisir à utiliser."
    },
    {
      name: 'Mehdi B.',
      location: 'Tanger',
      avatar: 'https://i.pravatar.cc/150?u=mehdi',
      rating: 5,
      text: "Enfin des produits bio marocains de haute qualité, bien présentés et livrés rapidement. Bravo à toute l'équipe de Zayna !"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Zayna - Cosmétiques Bio et Naturels du Maroc</title>
        <meta name="description" content="Découvrez Zayna, la marque de cosmétiques bio et naturels inspirée des rituels de beauté marocains. Soins à l'huile d'argan, savon noir et plus encore. Livraison partout au Maroc." />
        <meta property="og:title" content="Zayna - Cosmétiques Bio et Naturels du Maroc" />
        <meta property="og:description" content="Soins authentiques pour une beauté naturelle. Découvrez nos produits à base d'ingrédients marocains d'exception." />
        <meta property="og:image" content="https://placehold.co/1200x630/7a956b/f5f5f0?text=Zayna" />
        <meta property="og:url" content="https://www.zayna.ma" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify([websiteSchema, faqSchema])}</script>
      </Helmet>
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.1) translate(-1%, 1%); }
        }
        .ken-burns-effect {
          animation: kenburns 20s ease-out infinite alternate;
        }
      `}</style>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[80vh] lg:h-[85vh] w-full overflow-hidden flex items-center justify-center">
            <video 
                src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4" 
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="relative z-20 text-center text-white p-4">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={listVariants}
                >
                    <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4">Pureté. Nature. Maroc.</motion.h1>
                    <motion.p variants={itemVariants} className="text-md sm:text-lg lg:text-xl max-w-2xl mx-auto mb-8">L'essence de la beauté marocaine dans des soins bio d'exception.</motion.p>
                    <motion.div variants={itemVariants}>
                        <Button asChild size="lg"><Link to="/products">Découvrir</Link></Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>

        {/* Features/Trust Section */}
        <motion.section 
            className="relative z-10 -mt-16 sm:-mt-20 bg-white py-12 md:py-16 rounded-t-2xl lg:rounded-t-3xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <motion.div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left" variants={listVariants}>
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Livraison Rapide & Sûre</h3>
                    <p className="text-gray-600">Partout au Maroc. Payez à la livraison.</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Qualité Certifiée Bio</h3>
                    <p className="text-gray-600">Nos produits sont élaborés avec les standards les plus stricts.</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Support Client 7/7</h3>
                    <p className="text-gray-600">Notre équipe est à votre écoute pour vous conseiller.</p>
                  </div>
                </motion.div>
            </motion.div>
        </motion.section>
        
        {/* About the Brand Section */}
        <motion.section 
            className="py-16 md:py-20 bg-gray-50 overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <Badge variant="secondary" className="mb-4">Le Cœur de Zayna</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Née au Maroc. Inspirée par l'héritage. Sublimée par la science.</h2>
                <p className="text-gray-600 mb-6">
                  Zayna est plus qu'une marque, c'est une promesse. La promesse d'une beauté authentique, puisée dans les ingrédients nobles de notre terroir et issue du savoir-faire de coopératives féminines locales.
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-primary">
                  <Link to="/about">
                    Notre histoire <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center">
                <ParallaxImage />
              </div>
            </div>
        </motion.section>

        {/* Featured Products Section */}
        <section className="py-12 md:py-16 bg-white">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
              >
                <h2 className="text-3xl font-bold">Notre Sélection</h2>
                <p className="text-gray-600 mt-2">Découvrez les soins préférés de nos clients et nos dernières créations.</p>
              </motion.div>
              <Tabs defaultValue="featured" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto mb-8">
                  <TabsTrigger value="featured">Les Mieux Notés</TabsTrigger>
                  <TabsTrigger value="newest">Nouveautés</TabsTrigger>
                </TabsList>
                <TabsContent value="featured">
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
                    variants={listVariants}
                    initial="hidden"
                    animate={!loading ? "visible" : "hidden"}
                  >
                    {loading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeletonCard key={i} />) 
                             : featuredProducts.map((product) => <HomePageProductCard key={product.id} product={product} />)
                    }
                  </motion.div>
                </TabsContent>
                <TabsContent value="newest">
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
                    variants={listVariants}
                    initial="hidden"
                    animate={!loading ? "visible" : "hidden"}
                  >
                    {loading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeletonCard key={i} />) 
                             : newestProducts.map((product) => <HomePageProductCard key={product.id} product={product} />)
                    }
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
        </section>

        {/* 3D Showcase Section */}
        <div ref={scrollContainerRef} className="h-[300vh] relative z-0">
          <div className="sticky top-0 h-screen w-full">
            <Suspense fallback={<div className="h-full w-full bg-gray-200 flex items-center justify-center"><p>Chargement de l'expérience 3D...</p></div>}>
              <ThreeDShowcase scrollProgress={scrollProgress} />
            </Suspense>
          </div>
        </div>

        <div className="relative z-10 bg-white">
            {/* "Commandez en Toute Simplicité" Section */}
            <motion.section 
                className="py-16 md:py-20 bg-gray-50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold">Commandez en Toute Simplicité</h2>
                        <p className="text-gray-600 mt-2">Recevez vos soins Zayna chez vous en 3 étapes faciles.</p>
                    </div>
                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-repeat-x bg-center" style={{ backgroundImage: 'linear-gradient(to right, #a8a29e 50%, transparent 50%)', backgroundSize: '16px 2px' }}></div>
                        <motion.div 
                            className="relative grid md:grid-cols-3 gap-y-12 md:gap-x-8" 
                            variants={listVariants}
                        >
                            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                <motion.div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg border-2 border-primary mb-4" whileHover={{ scale: 1.1, rotate: 5 }}>
                                    <ShoppingBasket className="h-10 w-10 text-primary" />
                                </motion.div>
                                <h3 className="text-lg font-semibold mb-2">1. Choisissez vos produits</h3>
                                <p className="text-gray-600 px-4">Naviguez et ajoutez vos coups de cœur au panier.</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                <motion.div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg border-2 border-primary mb-4" whileHover={{ scale: 1.1, rotate: 5 }}>
                                    <ClipboardCheck className="h-10 w-10 text-primary" />
                                </motion.div>
                                <h3 className="text-lg font-semibold mb-2">2. Confirmez la commande</h3>
                                <p className="text-gray-600 px-4">Remplissez vos informations. Aucune carte requise.</p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
                                <motion.div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg border-2 border-primary mb-4" whileHover={{ scale: 1.1, rotate: 5 }}>
                                    <HandCoins className="h-10 w-10 text-primary" />
                                </motion.div>
                                <h3 className="text-lg font-semibold mb-2">3. Payez à la livraison</h3>
                                <p className="text-gray-600 px-4">Votre commande arrive. Payez en espèces au livreur.</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* === NEW: Testimonials Section === */}
            <motion.section
              className="py-16 md:py-20 bg-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariants}
            >
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold">Ce que nos client(e)s disent</h2>
                  <p className="text-gray-600 mt-2">La confiance et la satisfaction de nos clients sont notre plus grande fierté.</p>
                </div>
                <Carousel
                  opts={{ align: "start", loop: true }}
                  plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                  className="w-full max-w-4xl mx-auto"
                >
                  <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-2 h-full">
                          <Card className="h-full flex flex-col justify-between p-6 bg-gray-50 border-gray-200 shadow-sm">
                            <CardContent className="p-0">
                              <Quote className="w-8 h-8 text-primary/30 mb-4" />
                              <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                            </CardContent>
                            <div className="flex items-center mt-auto">
                              <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                              <div>
                                <p className="font-semibold">{testimonial.name}</p>
                                <p className="text-sm text-gray-500">{testimonial.location}</p>
                                <div className="flex mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              </div>
            </motion.section>
            {/* === END OF NEW SECTION === */}

            {/* WhatsApp Assistant CTA */}
            <motion.section 
                className="py-16 bg-emerald-50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4">
                  <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <Bot className="h-12 w-12 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold">Besoin d'un conseil personnalisé?</h3>
                        <p className="text-gray-600">Notre assistante beauté est là pour vous guider sur WhatsApp.</p>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" onClick={() => window.open('https://wa.me/212600000000', '_blank')} className="w-full md:w-auto">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Démarrer la discussion
                        </Button>
                    </motion.div>
                  </div>
                </div>
            </motion.section>

            {/* Enhanced FAQ Section */}
            <motion.section 
                className="py-16 md:py-20 bg-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4 max-w-3xl">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Vos Questions, Nos Réponses</h2>
                    <p className="text-gray-600 mt-2">Tout ce que vous devez savoir sur nos cosmétiques bio et nos services.</p>
                  </div>
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg">Quelle est la différence entre un produit 'bio' et 'naturel' chez Zayna ?</AccordionTrigger>
                      <AccordionContent className="text-base">
                        Chez Zayna, 'naturel' signifie que l'ingrédient provient de la nature. 'Bio' (biologique) va plus loin : c'est un label qui garantit que l'ingrédient a été cultivé sans pesticides ni produits chimiques de synthèse, et que sa transformation respecte des normes écologiques strictes. La plupart de nos produits phares, comme l'huile d'Argan, sont certifiés bio.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg">Les produits Zayna sont-ils testés sur les animaux ?</AccordionTrigger>
                      <AccordionContent className="text-base">
                        Absolument jamais. Nous sommes une marque 100% sans cruauté. Nous testons nos produits via des méthodes alternatives et sur des volontaires humains pour garantir leur sécurité et leur efficacité, dans le respect total de la vie animale.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-lg">Comment puis-je savoir quel produit est adapté à mon type de peau ?</AccordionTrigger>
                      <AccordionContent className="text-base">
                        C'est une excellente question ! Chaque page de produit contient une section "Pour quel type de peau ?". Pour un conseil plus personnalisé, n'hésitez pas à contacter notre assistante beauté via WhatsApp. Elle se fera un plaisir de vous guider vers la routine de soins parfaite pour vous.
                      </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                      <AccordionTrigger className="text-lg">Proposez-vous le paiement par carte bancaire ?</AccordionTrigger>
                      <AccordionContent className="text-base">
                        Actuellement, pour simplifier et sécuriser le processus pour tous nos clients au Maroc, nous proposons exclusivement le paiement à la livraison. Vous ne payez votre commande qu'au moment où vous la recevez.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <div className="text-center mt-12">
                    <Button asChild variant="outline">
                      <Link to="/contact">
                        Vous avez d'autres questions ? Contactez-nous <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
            </motion.section>

            {/* Final CTA Section */}
            <motion.section 
                className="py-16 md:py-20 bg-primary/90 text-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
            >
                <div className="container mx-auto px-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ rotate: 360, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}>
                    <Sparkles className="h-12 w-12 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">Prête à Révéler Votre Beauté Naturelle?</h2>
                  <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                    Explorez notre collection complète et trouvez les soins bio qui vous correspondent.
                  </p>
                  <Link to="/products">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button size="lg" variant="secondary" className="text-primary hover:bg-white/90">
                        Voir tous les produits
                        </Button>
                    </motion.div>
                  </Link>
                </div>
            </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
