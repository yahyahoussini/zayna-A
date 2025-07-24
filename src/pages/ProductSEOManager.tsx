import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Save, Wand2, Copy, Check, Package, Search, TrendingUp, Globe, Target, AlertCircle, FileText, Hash, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface ProductSEO {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  
  // SEO Fields
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  structuredData: any;
  
  // Additional SEO
  altText: string;
  focusKeyword: string;
  readabilityScore: number;
  seoScore: number;
  lastUpdated: string;
}

const ProductSEOManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSEO[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSEO | null>(null);
  const [editedSEO, setEditedSEO] = useState<Partial<ProductSEO>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [keywordSuggestions] = useState([
    'cosmétiques bio maroc',
    'clean beauty maroc', 
    'produits naturels maroc',
    'soins visage bio',
    'argan bio maroc',
    'ghassoul maroc',
    'maquillage bio',
    'beauté naturelle',
    'crème hydratante bio',
    'sérum anti-âge',
    'huile d\'argan',
    'rose de damas maroc'
  ]);

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/login');
      return;
    }

    loadProducts();
  }, [navigate]);

  const generateStructuredData = (product: any) => ({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Bio Cosmétiques Maroc"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://biocosmetics-maroc.com/product/${product.id}`,
      "priceCurrency": "MAD",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Bio Cosmétiques Maroc"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  });

  const loadProducts = async () => {
    try {
      // Load existing SEO data from localStorage
      const savedSEOData = JSON.parse(localStorage.getItem('productSEOData') || '{}');
      
      // Load existing products and merge with SEO data
      const existingProducts = [
        {
          id: '1',
          name: 'Sérum Vitamine C Bio - Anti-Âge',
          price: 2800,
          category: 'Soins Visage',
          description: 'Sérum anti-âge bio à la vitamine C pure, certifié ECOCERT. Illumine et raffermit la peau naturellement.',
          image: '/placeholder.svg'
        },
        {
          id: '2', 
          name: 'Crème Hydratante Argan Bio Maroc',
          price: 1800,
          category: 'Soins Corps',
          description: 'Crème hydratante à l\'huile d\'argan bio du Maroc. Nourrissante et réparatrice pour tous types de peau.',
          image: '/placeholder.svg'
        },
        {
          id: '3',
          name: 'Masque Ghassoul Rose de Damas',
          price: 1200,
          category: 'Soins Visage',
          description: 'Masque purifiant au ghassoul et rose de damas. Nettoie en profondeur et illumine le teint.',
          image: '/placeholder.svg'
        },
        {
          id: '4',
          name: 'Huile Précieuse Multi-Usage Bio',
          price: 2200,
          category: 'Soins Corps',
          description: 'Huile précieuse bio multi-usage pour visage, corps et cheveux. Formule 100% naturelle.',
          image: '/placeholder.svg'
        }
      ];

      const seoProducts: ProductSEO[] = existingProducts.map(product => {
        const savedSEO = savedSEOData[product.id];
        return {
          ...product,
          seoTitle: savedSEO?.seoTitle || `${product.name} | Bio Cosmétiques Maroc #1`,
          metaDescription: savedSEO?.metaDescription || `${product.description} ✅ Livraison Cash on Delivery partout au Maroc ⭐ N°1 des cosmétiques bio`,
          keywords: savedSEO?.keywords || ['cosmétiques bio maroc', product.category.toLowerCase(), 'clean beauty'],
          slug: savedSEO?.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          altText: savedSEO?.altText || `${product.name} - Cosmétique bio certifié ECOCERT Maroc`,
          focusKeyword: savedSEO?.focusKeyword || 'cosmétiques bio maroc',
          readabilityScore: savedSEO?.readabilityScore || 85,
          seoScore: savedSEO?.seoScore || calculateSEOScore(savedSEO || {}),
          lastUpdated: savedSEO?.lastUpdated || new Date().toISOString(),
          structuredData: generateStructuredData(product)
        };
      });

      setProducts(seoProducts);
      if (seoProducts.length > 0) {
        setSelectedProduct(seoProducts[0]);
        setEditedSEO(seoProducts[0]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSEOScore = (seoData: any) => {
    let score = 0;
    
    // Title optimization (25 points)
    if (seoData.seoTitle && seoData.seoTitle.length >= 30 && seoData.seoTitle.length <= 60) score += 25;
    else if (seoData.seoTitle && seoData.seoTitle.length > 0) score += 15;
    
    // Meta description (25 points)
    if (seoData.metaDescription && seoData.metaDescription.length >= 120 && seoData.metaDescription.length <= 160) score += 25;
    else if (seoData.metaDescription && seoData.metaDescription.length > 0) score += 15;
    
    // Keywords (20 points)
    if (seoData.keywords && seoData.keywords.length >= 3) score += 20;
    else if (seoData.keywords && seoData.keywords.length > 0) score += 10;
    
    // Focus keyword (15 points)
    if (seoData.focusKeyword) score += 15;
    
    // Alt text (10 points)
    if (seoData.altText) score += 10;
    
    // Slug (5 points)
    if (seoData.slug && seoData.slug.length > 0) score += 5;
    
    return Math.min(score, 100);
  };

  const saveSEOData = async () => {
    if (!selectedProduct || !editedSEO) return;
    
    setSaving(true);
    try {
      // Calculate new SEO score
      const newSEOScore = calculateSEOScore(editedSEO);
      
      // Update the selected product
      const updatedProduct = {
        ...selectedProduct,
        ...editedSEO,
        seoScore: newSEOScore,
        lastUpdated: new Date().toISOString()
      };

      // Update products array
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      );
      setProducts(updatedProducts);
      setSelectedProduct(updatedProduct);

      // Save to localStorage
      const savedSEOData = JSON.parse(localStorage.getItem('productSEOData') || '{}');
      savedSEOData[selectedProduct.id] = updatedProduct;
      localStorage.setItem('productSEOData', JSON.stringify(savedSEOData));

      // Update document meta tags for preview
      updateDocumentMeta(updatedProduct);

      toast({
        title: 'SEO Sauvegardé',
        description: `Les données SEO pour "${selectedProduct.name}" ont été sauvegardées avec succès.`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateDocumentMeta = (product: ProductSEO) => {
    // Update document title and meta tags for preview
    document.title = product.seoTitle;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', product.metaDescription);
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', product.seoTitle);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', product.metaDescription);
    }
  };

  const applySEOSuggestions = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const suggestions = {
      seoTitle: `${product.name} Bio Certifié | Livraison Maroc | N°1 Clean Beauty`,
      metaDescription: `${product.description} ✅ 100% Bio & Naturel ⭐ Livraison Rapide Maroc 🚚 Cash on Delivery | N°1 Cosmétiques Bio`,
      keywords: [...keywordSuggestions.slice(0, 5), product.category.toLowerCase()],
      focusKeyword: 'cosmétiques bio maroc',
      altText: `${product.name} - Produit cosmétique bio certifié ECOCERT disponible au Maroc`
    };

    setEditedSEO(prev => ({
      ...prev,
      ...suggestions
    }));

    toast({
      title: 'Suggestions Appliquées',
      description: 'Les suggestions SEO ont été appliquées. N\'oubliez pas de sauvegarder.',
    });
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const addKeyword = (keyword: string) => {
    const currentKeywords = editedSEO.keywords || [];
    if (!currentKeywords.includes(keyword)) {
      setEditedSEO(prev => ({
        ...prev,
        keywords: [...currentKeywords, keyword]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = editedSEO.keywords || [];
    setEditedSEO(prev => ({
      ...prev,
      keywords: currentKeywords.filter(k => k !== keyword)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Gestionnaire SEO Produits</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={saveSEOData}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button
                variant={previewMode ? "default" : "outline"}
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu SEO
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Produits ({products.length})</CardTitle>
              <CardDescription>
                Sélectionnez un produit pour optimiser son SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedProduct?.id === product.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedProduct(product);
                      setEditedSEO(product);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.category}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Mis à jour: {new Date(product.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getSEOScoreColor(product.seoScore)}`}>
                          {product.seoScore}%
                        </div>
                        <div className="text-xs text-gray-500">SEO Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Editor */}
          <div className="lg:col-span-2">
            {selectedProduct ? (
              <Tabs defaultValue="seo" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="seo">SEO Basique</TabsTrigger>
                  <TabsTrigger value="advanced">Avancé</TabsTrigger>
                  <TabsTrigger value="preview">Aperçu Google</TabsTrigger>
                </TabsList>

                {/* Basic SEO Tab */}
                <TabsContent value="seo">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            {selectedProduct.name}
                          </CardTitle>
                          <CardDescription>
                            Score SEO: <span className={`font-bold ${getSEOScoreColor(editedSEO.seoScore || 0)}`}>
                              {calculateSEOScore(editedSEO)}%
                            </span>
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => applySEOSuggestions(selectedProduct.id)}
                          variant="outline"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Auto-optimiser
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* SEO Title */}
                      <div>
                        <Label htmlFor="seoTitle">Titre SEO</Label>
                        <Input
                          id="seoTitle"
                          value={editedSEO.seoTitle || ''}
                          onChange={(e) => setEditedSEO(prev => ({ ...prev, seoTitle: e.target.value }))}
                          placeholder="Titre optimisé pour les moteurs de recherche"
                          className="mt-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Recommandé: 30-60 caractères</span>
                          <span className={`${(editedSEO.seoTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                            {editedSEO.seoTitle?.length || 0}/60
                          </span>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                          id="metaDescription"
                          value={editedSEO.metaDescription || ''}
                          onChange={(e) => setEditedSEO(prev => ({ ...prev, metaDescription: e.target.value }))}
                          placeholder="Description qui apparaîtra dans les résultats de recherche"
                          className="mt-1"
                          rows={3}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Recommandé: 120-160 caractères</span>
                          <span className={`${(editedSEO.metaDescription?.length || 0) > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                            {editedSEO.metaDescription?.length || 0}/160
                          </span>
                        </div>
                      </div>

                      {/* Focus Keyword */}
                      <div>
                        <Label htmlFor="focusKeyword">Mot-clé Principal</Label>
                        <Input
                          id="focusKeyword"
                          value={editedSEO.focusKeyword || ''}
                          onChange={(e) => setEditedSEO(prev => ({ ...prev, focusKeyword: e.target.value }))}
                          placeholder="cosmétiques bio maroc"
                          className="mt-1"
                        />
                      </div>

                      {/* Keywords */}
                      <div>
                        <Label>Mots-clés SEO</Label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {(editedSEO.keywords || []).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                              {keyword} ✕
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {keywordSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => addKeyword(suggestion)}
                              disabled={(editedSEO.keywords || []).includes(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Alt Text */}
                      <div>
                        <Label htmlFor="altText">Texte Alternatif Image</Label>
                        <Input
                          id="altText"
                          value={editedSEO.altText || ''}
                          onChange={(e) => setEditedSEO(prev => ({ ...prev, altText: e.target.value }))}
                          placeholder="Description de l'image pour l'accessibilité"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres Avancés</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* URL Slug */}
                      <div>
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                          id="slug"
                          value={editedSEO.slug || ''}
                          onChange={(e) => setEditedSEO(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="url-du-produit"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          URL finale: /product/{editedSEO.slug || 'slug-produit'}
                        </p>
                      </div>

                      {/* Structured Data Preview */}
                      <div>
                        <Label>Données Structurées (JSON-LD)</Label>
                        <Textarea
                          value={JSON.stringify(selectedProduct.structuredData, null, 2)}
                          readOnly
                          className="mt-1 font-mono text-xs"
                          rows={8}
                        />
                      </div>

                      {/* SEO Checklist */}
                      <div>
                        <Label>Checklist SEO</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={(editedSEO.seoTitle?.length || 0) >= 30 && (editedSEO.seoTitle?.length || 0) <= 60} />
                            <span className="text-sm">Titre optimisé (30-60 caractères)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={(editedSEO.metaDescription?.length || 0) >= 120 && (editedSEO.metaDescription?.length || 0) <= 160} />
                            <span className="text-sm">Meta description optimisée (120-160 caractères)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={(editedSEO.keywords?.length || 0) >= 3} />
                            <span className="text-sm">Au moins 3 mots-clés</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={!!editedSEO.focusKeyword} />
                            <span className="text-sm">Mot-clé principal défini</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={!!editedSEO.altText} />
                            <span className="text-sm">Texte alternatif image</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Search className="h-5 w-5 mr-2" />
                        Aperçu Google
                      </CardTitle>
                      <CardDescription>
                        Voici comment votre produit apparaîtra dans les résultats de recherche Google
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Google Search Preview */}
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="text-xs text-green-700 mb-1">
                          https://biocosmetics-maroc.com/product/{editedSEO.slug || 'product-slug'}
                        </div>
                        <h3 className="text-lg text-blue-600 hover:underline cursor-pointer mb-1">
                          {editedSEO.seoTitle || selectedProduct.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {editedSEO.metaDescription || selectedProduct.description}
                        </p>
                        
                        {/* Rich Snippet Preview */}
                        <div className="mt-4 p-3 border-l-4 border-blue-500 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">{selectedProduct.name}</div>
                              <div className="text-lg font-bold text-green-600">{selectedProduct.price} MAD</div>
                              <div className="text-xs text-gray-500">⭐⭐⭐⭐⭐ (127 avis)</div>
                            </div>
                            <div className="w-16 h-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>

                      {/* Social Media Preview */}
                      <Separator className="my-6" />
                      <div>
                        <h4 className="font-medium mb-3">Aperçu Réseaux Sociaux</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="h-32 bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="p-3">
                            <h5 className="font-medium">{editedSEO.seoTitle}</h5>
                            <p className="text-sm text-gray-600 mt-1">{editedSEO.metaDescription}</p>
                            <p className="text-xs text-gray-400 mt-1">biocosmetics-maroc.com</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun produit sélectionné</h3>
                    <p className="text-gray-500">Choisissez un produit dans la liste pour commencer l'optimisation SEO</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSEOManager;