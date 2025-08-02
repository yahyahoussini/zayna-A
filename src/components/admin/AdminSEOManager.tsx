import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Save, Wand2, Package, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  price: number;
}

interface SEOData {
  seo_title?: string;
  meta_description?: string;
  keywords?: string[];
  slug?: string;
  alt_text?: string;
  focus_keyword?: string;
  structured_data?: Record<string, unknown>;
  seo_score?: number;
}


export const AdminSEOManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editedSEO, setEditedSEO] = useState<SEOData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
  ];
  
  const keywordSuggestions = [
    'cosmétiques bio maroc', 'clean beauty maroc', 'produits naturels maroc',
    'soins visage bio', 'argan bio maroc', 'ghassoul maroc', 'maquillage bio', 'beauté naturelle',
  ];

  const loadSeoDataForProduct = useCallback(async (productId: string, lang: string) => {
    if (!selectedProduct) return;
    setSaving(true); // Use saving state to show loading on editor
    try {
      const { data, error } = await supabase
        .from('product_seo')
        .select('*')
        .eq('product_id', productId)
        .eq('lang', lang)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: "object not found"
        throw error;
      }

      if (data) {
        setEditedSEO(data);
      } else {
        // No SEO data yet, initialize with defaults
        setEditedSEO({
          seo_title: `${selectedProduct.name} | ${lang.toUpperCase()}`,
          meta_description: selectedProduct.description.substring(0, 120) + '...',
          keywords: ['cosmétiques bio maroc', selectedProduct.category || ''],
          slug: selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          alt_text: `${selectedProduct.name} - cosmétique bio`,
        });
      }
    } catch (error) {
      console.error('Error loading SEO data:', error);
      toast({ title: 'Erreur', description: 'Chargement des données SEO impossible.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      loadSeoDataForProduct(selectedProduct.id, currentLang);
    }
  }, [selectedProduct, currentLang, loadSeoDataForProduct]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('id, name, description, image_url, category, price');
      if (error) throw error;

      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (error) {
      console.error('Error loading products for SEO:', error);
      toast({ title: 'Erreur', description: 'Chargement des produits impossible.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const generateStructuredData = (product: Product, seoData: SEOData) => ({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url,
    "description": product.description,
    "brand": { "@type": "Brand", "name": "Bio Cosmétiques Maroc" },
    "offers": {
      "@type": "Offer",
      "url": `https://zayna.vercel.app/product/${product.id}`,
      "priceCurrency": "MAD",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Bio Cosmétiques Maroc" }
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127" } // Mocked data
  });

  const calculateSEOScore = (seoData: SEOData) => {
    let score = 0;
    if (seoData.seo_title && seoData.seo_title.length >= 30 && seoData.seo_title.length <= 60) score += 25;
    if (seoData.meta_description && seoData.meta_description.length >= 120 && seoData.meta_description.length <= 160) score += 25;
    if (seoData.keywords && seoData.keywords.length >= 3) score += 20;
    if (seoData.focus_keyword) score += 15;
    if (seoData.alt_text) score += 10;
    if (seoData.slug) score += 5;
    return Math.min(score, 100);
  };

  const saveSEOData = async () => {
    if (!selectedProduct || !editedSEO) return;
    
    setSaving(true);
    try {
      const seoScore = calculateSEOScore(editedSEO);
      const structuredData = generateStructuredData(selectedProduct, editedSEO);

      const dataToSave = {
        product_id: selectedProduct.id,
        lang: currentLang,
        ...editedSEO,
        seo_score: seoScore,
        structured_data: structuredData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('product_seo').upsert(dataToSave, {
        onConflict: 'product_id, lang',
      });

      if (error) throw error;

      toast({
        title: 'SEO Data Saved!',
        description: `Successfully saved SEO data for "${selectedProduct.name}" in ${currentLang.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error saving SEO data:', error);
      toast({ title: 'Error Saving Data', description: 'Could not save SEO data to the database.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const applySEOSuggestions = () => {
    if (!selectedProduct) return;
    const suggestions = {
      seoTitle: `${selectedProduct.name} Bio Certifié | Livraison Maroc`,
      metaDescription: `${selectedProduct.description.substring(0, 100)}... ✅ 100% Bio & Naturel ⭐ Livraison Rapide Maroc 🚚`,
      keywords: [...keywordSuggestions.slice(0, 4), selectedProduct.category],
      focusKeyword: 'cosmétiques bio maroc',
      altText: `${selectedProduct.name} - Produit cosmétique bio ECOCERT au Maroc`
    };
    setEditedSEO(prev => ({ ...prev, ...suggestions }));
    toast({ title: 'Suggestions Appliquées', description: 'N\'oubliez pas de sauvegarder.' });
  };
  
    // Le reste du JSX reste identique, utilisant les états et fonctions mis à jour
    // ...

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Products List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Produits ({products.length})</CardTitle>
          <CardDescription>Sélectionnez un produit pour optimiser son SEO.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setSelectedProduct(product)}
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Editor */}
      <div className="lg:col-span-2">
        {selectedProduct ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProduct.name}</CardTitle>
                  <CardDescription>Edition pour: {supportedLanguages.find(l => l.code === currentLang)?.name}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={currentLang} onValueChange={setCurrentLang}>
                    <SelectTrigger className="w-[120px]">
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={applySEOSuggestions} variant="outline"><Wand2 className="h-4 w-4 mr-2" />Suggérer</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">Titre SEO ({editedSEO.seo_title?.length || 0} / 60)</Label>
                <Input id="seo_title" value={editedSEO.seo_title || ''} onChange={e => setEditedSEO({...editedSEO, seo_title: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description ({editedSEO.meta_description?.length || 0} / 160)</Label>
                <Textarea id="meta_description" value={editedSEO.meta_description || ''} onChange={e => setEditedSEO({...editedSEO, meta_description: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" value={editedSEO.slug || ''} onChange={e => setEditedSEO({...editedSEO, slug: e.target.value})} />
              </div>
              <div>
                <Label htmlFor="alt_text">Texte alternatif de l'image</Label>
                <Input id="alt_text" value={editedSEO.alt_text || ''} onChange={e => setEditedSEO({...editedSEO, alt_text: e.target.value})} />
              </div>
               <div>
                <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
                <Input id="keywords" value={editedSEO.keywords?.join(', ') || ''} onChange={e => setEditedSEO({...editedSEO, keywords: e.target.value.split(',').map(k => k.trim())})} />
              </div>
              <Button onClick={saveSEOData} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>Sélectionnez un produit pour commencer.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};