import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingCart, Star, SlidersHorizontal, Grid, List, Search, Loader2, XCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';

// --- Animation Variants ---
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  in_stock: boolean;
  created_at?: string;
  thumbnail_image?: string;
  images?: string[];
  rating?: number;
}

interface PriceRange {
  min: string;
  max: string;
}

// --- Custom Hook for Debouncing ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- REFACTORED: Custom Hook with Client-Side Caching & Filtering ---
const useProductFilters = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['all']);
    const [page, setPage] = useState(1);

    // Filter states
    const [sortBy, setSortBy] = useState('created_at');
    const [filterCategory, setFilterCategory] = useState('all');
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const PRODUCTS_PER_PAGE = 12;
    const hasMore = paginatedProducts.length < filteredProducts.length;

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const { data: productsData, error: productsError } = await supabase.from('products').select('*');
                if (productsError) throw productsError;
                setAllProducts(productsData || []);

                const { data: categoriesData } = await supabase.from('categories').select('name').order('name');
                if (categoriesData) setCategories(['all', ...categoriesData.map((c: { name: string }) => c.name)]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast({ title: "Erreur", description: "Impossible de charger les données initiales.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    useEffect(() => {
        let tempProducts = [...allProducts];

        if (debouncedSearchQuery) {
            tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
        }
        if (filterCategory !== 'all') {
            tempProducts = tempProducts.filter(p => p.category === filterCategory);
        }
        const minPrice = parseFloat(priceRange.min);
        const maxPrice = parseFloat(priceRange.max);
        if (!isNaN(minPrice)) tempProducts = tempProducts.filter(p => p.price >= minPrice);
        if (!isNaN(maxPrice)) tempProducts = tempProducts.filter(p => p.price <= maxPrice);

        const [sortField, sortOrder] = sortBy.split('-');
        tempProducts.sort((a, b) => {
            if (sortField === 'price') return sortOrder === 'low' ? a.price - b.price : b.price - a.price;
            if (sortField === 'name') return a.name.localeCompare(b.name);
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        setFilteredProducts(tempProducts);
        setPage(1);
    }, [debouncedSearchQuery, filterCategory, priceRange, sortBy, allProducts]);

    useEffect(() => {
        setPaginatedProducts(filteredProducts.slice(0, page * PRODUCTS_PER_PAGE));
    }, [page, filteredProducts]);

    const loadMore = () => {
        if (hasMore) setPage(prev => prev + 1);
    };
    
    // --- NEW: Filter clearing functions ---
    const clearSearch = () => setSearchQuery('');
    const clearCategory = () => setFilterCategory('all');
    const clearPriceRange = () => setPriceRange({ min: '', max: '' });
    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterCategory('all');
        setPriceRange({ min: '', max: '' });
        setSortBy('created_at');
    };

    return {
        products: paginatedProducts,
        totalProducts: filteredProducts.length,
        loading,
        hasMore,
        loadMore,
        filters: { sortBy, setSortBy, filterCategory, setFilterCategory, priceRange, setPriceRange, searchQuery, setSearchQuery, categories },
        clearFns: { clearSearch, clearCategory, clearPriceRange, clearAllFilters }
    };
};

// --- Composant ProductCard Amélioré ---
const ProductCard = memo(({ product, viewMode }: { product: Product, viewMode: 'grid' | 'list' }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const displayImage = product.thumbnail_image || product.images?.[0] || 'https://placehold.co/400x400/f5f5f0/36454F?text=Zayna';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ id: product.id, name: product.name, price: product.price, image: displayImage });
        toast({ title: "Produit Ajouté", description: `${product.name} est dans votre panier.` });
    };

    if (viewMode === 'list') {
        return (
            <motion.div variants={itemVariants}>
                <Card onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col sm:flex-row border-neutral-200/80 bg-white">
                    <div className="sm:w-1/3 md:w-1/4 relative bg-gray-100">
                        <img src={displayImage} alt={product.name} className="w-full h-48 sm:h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <CardContent className="p-6 flex flex-col justify-between sm:w-2/3 md:w-3/4">
                        <div>
                            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                            <CardTitle className="text-xl font-semibold mb-2 text-gray-800">{product.name}</CardTitle>
                            <p className="text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                            <span className="text-2xl font-bold text-primary mb-4 sm:mb-0">{product.price.toFixed(2)} DH</span>
                            <Button onClick={handleAddToCart} disabled={!product.in_stock} className="w-full sm:w-auto">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {product.in_stock ? 'Ajouter au Panier' : 'Épuisé'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div variants={itemVariants}>
            <Card onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer group overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl border-neutral-200/80 bg-white">
                <CardHeader className="p-0 relative">
                    <div className="absolute top-3 right-3 z-10 flex items-center bg-white/70 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-gray-700">{product.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <div className="relative w-full h-64 bg-gray-100">
                        <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button onClick={handleAddToCart} disabled={!product.in_stock} className="w-full">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.in_stock ? 'Ajouter au Panier' : 'Épuisé'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                        <CardTitle className="text-base font-semibold mb-2 h-12 line-clamp-2 text-gray-800">{product.name}</CardTitle>
                    </div>
                    <div className="mt-auto pt-2">
                        <span className="text-xl font-bold text-primary">{product.price.toFixed(2)} DH</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});

// --- Composant pour les filtres ---
const FilterControls = ({ categories, filters }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Catégorie</label>
            <Select value={filters.filterCategory} onValueChange={filters.setFilterCategory}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Toutes" /></SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category === 'all' ? 'Toutes les catégories' : category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Gamme de Prix</label>
            <div className="flex items-center gap-2">
                <Input type="number" placeholder="Min" value={filters.priceRange.min} onChange={(e) => filters.setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="bg-white" />
                <span className="text-gray-500">-</span>
                <Input type="number" placeholder="Max" value={filters.priceRange.max} onChange={(e) => filters.setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="bg-white" />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Trier par</label>
            <Select value={filters.sortBy} onValueChange={filters.setSortBy}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="created_at">Nouveautés</SelectItem>
                    <SelectItem value="price-low">Prix: Croissant</SelectItem>
                    <SelectItem value="price-high">Prix: Décroissant</SelectItem>
                    <SelectItem value="name">Nom: A-Z</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);

// --- NEW: Component to display active filters ---
const ActiveFiltersDisplay = ({ filters, clearFns }) => {
    const activeFilters = [];
    if (filters.searchQuery) {
        activeFilters.push({ label: `Recherche: "${filters.searchQuery}"`, clear: clearFns.clearSearch });
    }
    if (filters.filterCategory !== 'all') {
        activeFilters.push({ label: `Catégorie: ${filters.filterCategory}`, clear: clearFns.clearCategory });
    }
    if (filters.priceRange.min || filters.priceRange.max) {
        const label = `Prix: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`;
        activeFilters.push({ label, clear: clearFns.clearPriceRange });
    }

    if (activeFilters.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="flex items-center flex-wrap gap-2 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <span className="text-sm font-semibold text-gray-700">Filtres actifs:</span>
                {activeFilters.map(filter => (
                    <Badge key={filter.label} variant="secondary" className="flex items-center gap-1.5 py-1 px-2">
                        {filter.label}
                        <button onClick={filter.clear} className="hover:bg-gray-400/20 rounded-full p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFns.clearAllFilters} className="text-primary hover:text-primary">
                    Tout effacer
                </Button>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Composant Principal ---
const Products = () => {
    const { products, totalProducts, loading, hasMore, loadMore, filters, clearFns } = useProductFilters();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) loadMore();
            },
            { threshold: 1.0 }
        );
        const currentLoader = loaderRef.current;
        if (currentLoader) observer.observe(currentLoader);
        return () => { if (currentLoader) observer.unobserve(currentLoader); };
    }, [hasMore, loading, loadMore]);

    const generateTitle = () => {
        if (filters.filterCategory !== 'all') return `${filters.filterCategory} | Zayna`;
        if (filters.searchQuery) return `Recherche: "${filters.searchQuery}" | Zayna`;
        return 'Notre Collection | Zayna Cosmétiques Bio Maroc';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-12 w-1/2 mb-4 mx-auto" />
                    <Skeleton className="h-8 w-3/4 mb-12 mx-auto" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Helmet>
                <title>{generateTitle()}</title>
                <meta name="description" content="Explorez la collection complète de cosmétiques Zayna. Des soins bio d'exception, nés de la nature marocaine et sublimés par la science." />
            </Helmet>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Notre Collection</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explorez des soins d'exception, nés de la nature marocaine et sublimés par la science.</p>
                </div>

                <Card className="bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-md mb-8 sticky top-20 z-20">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-grow hidden md:block">
                           <FilterControls categories={filters.categories} filters={filters} />
                        </div>
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-2"><SlidersHorizontal className="h-4 w-4" /> Filtres</Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader><SheetTitle className="text-xl">Filtres & Tri</SheetTitle></SheetHeader>
                                    <div className="py-6 space-y-6">
                                        <FilterControls categories={filters.categories} filters={filters} />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><Grid className="h-5 w-5" /></Button>
                            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List className="h-5 w-5" /></Button>
                        </div>
                    </div>
                     <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="w-full relative">
                            <Input type="text" placeholder="Rechercher par nom, ingrédient..." value={filters.searchQuery} onChange={(e) => filters.setSearchQuery(e.target.value)} className="pl-10 bg-white"/>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </Card>

                <ActiveFiltersDisplay filters={filters} clearFns={clearFns} />

                <div className="mb-6">
                    <p className="text-gray-600">Affichage de <span className="font-semibold">{products.length}</span> sur <span className="font-semibold">{totalProducts}</span> produits</p>
                </div>

                <div className="relative">
                    <AnimatePresence>
                        {products.length === 0 && !loading ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-lg shadow-sm">
                                <XCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-2xl font-semibold mb-2 text-gray-700">Aucun produit trouvé</h3>
                                <p className="text-gray-500">Essayez d'ajuster vos filtres ou votre recherche.</p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div ref={loaderRef} className="h-20 flex justify-center items-center">
                    {hasMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Products;
