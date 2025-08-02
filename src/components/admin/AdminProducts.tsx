import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product, Category, ProductForm } from '@/types/admin';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  addProduct: (productForm: ProductForm) => void;
  deleteProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  page: number;
  setPage: (page: number) => void;
  total: number;
  itemsPerPage: number;
}

export const AdminProducts = ({
  products,
  categories,
  page,
  setPage,
  total,
  itemsPerPage,
  addProduct,
  deleteProduct,
  updateProduct
}: AdminProductsProps) => {
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    price: '',
    category: '',
    description: '',
    images: [],
    discount_percentage: '0',
    badge_text: '',
    badge_color: '#000000',
  });
  const [editProductForm, setEditProductForm] = useState<Product | null>(null);
  const totalPages = Math.ceil(total / itemsPerPage);

  const handleAddProduct = () => {
    addProduct(productForm);
    setProductForm({
      name: '',
      price: '',
      category: '',
      description: '',
      images: [],
      discount_percentage: '0',
      badge_text: '',
      badge_color: '#000000',
    });
  };

  const openEditProduct = (product: Product) => {
    setEditProductForm({ ...product });
  };

  const handleUpdateProduct = () => {
    if (!editProductForm) return;
    updateProduct(editProductForm);
    setEditProductForm(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = event.target.files;
    if (files) {
      const filePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(base64Files => {
        if (isEdit && editProductForm) {
          setEditProductForm({ ...editProductForm, images: base64Files });
        } else {
          setProductForm(prev => ({ ...prev, images: base64Files }));
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product catalog
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product for your store
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={productForm.discount_percentage}
                        onChange={(e) => setProductForm(prev => ({ ...prev, discount_percentage: e.target.value }))}
                        placeholder="e.g., 10 for 10%"
                    />
                </div>

                <div>
                  <Label htmlFor="badge-text">Badge Text</Label>
                  <Input
                    id="badge-text"
                    value={productForm.badge_text}
                    onChange={(e) => setProductForm(prev => ({...prev, badge_text: e.target.value}))}
                    placeholder="e.g., PROMO, NOUVEAU"
                  />
                </div>

                <div>
                  <Label htmlFor="badge-color">Badge Color</Label>
                  <Input
                    id="badge-color"
                    type="color"
                    value={productForm.badge_color}
                    onChange={(e) => setProductForm(prev => ({...prev, badge_color: e.target.value}))}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={productForm.category} 
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Product Images/Videos</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, false)}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(productForm.images || []).map((file, index) => (
                        <img key={index} src={file} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={product.thumbnail_image || product.images?.[0]}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.price.toFixed(2)} DH</p>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {editProductForm && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Product Name</Label>
                          <Input
                            id="edit-name"
                            value={editProductForm.name}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-price">Price</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={editProductForm.price}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null)}
                          />
                        </div>
                        
                        <div>
                            <Label htmlFor="edit-discount">Discount Percentage</Label>
                            <Input
                                id="edit-discount"
                                type="number"
                                step="0.01"
                                value={editProductForm.discount_percentage}
                                onChange={(e) => setEditProductForm(prev => prev ? { ...prev, discount_percentage: parseFloat(e.target.value) || 0 } : null)}
                            />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-badge-text">Badge Text</Label>
                          <Input
                            id="edit-badge-text"
                            value={editProductForm.badge_text || ''}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, badge_text: e.target.value } : null)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-badge-color">Badge Color</Label>
                          <Input
                            id="edit-badge-color"
                            type="color"
                            value={editProductForm.badge_color || '#000000'}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, badge_color: e.target.value } : null)}
                          />
                        </div>

                        <div>
                            <Label htmlFor="edit-rating">Rating (0-5)</Label>
                            <Input
                                id="edit-rating"
                                type="number"
                                step="0.1"
                                max="5"
                                min="0"
                                value={editProductForm.rating}
                                onChange={(e) => setEditProductForm(prev => prev ? { ...prev, rating: parseFloat(e.target.value) || 0 } : null)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-num_reviews">Number of Reviews</Label>
                            <Input
                                id="edit-num_reviews"
                                type="number"
                                value={editProductForm.num_reviews}
                                onChange={(e) => setEditProductForm(prev => prev ? { ...prev, num_reviews: parseInt(e.target.value) || 0 } : null)}
                            />
                        </div>

                        <div>
                          <Label htmlFor="edit-category">Category</Label>
                          <Select 
                            value={editProductForm.category} 
                            onValueChange={(value) => setEditProductForm(prev => prev ? { ...prev, category: value } : null)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editProductForm.description || ''}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-image">Product Images/Videos</Label>
                          <Input
                            id="edit-image"
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, true)}
                          />
                           <div className="mt-2 flex flex-wrap gap-2">
                            {(editProductForm.images || []).map((file, index) => (
                                <img key={index} src={file} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-stock"
                            checked={!!editProductForm.in_stock}
                            onChange={(e) => setEditProductForm(prev => prev ? { ...prev, in_stock: e.target.checked } : null)}
                          />
                          <Label htmlFor="edit-stock">In Stock</Label>
                        </div>

                        <Button onClick={handleUpdateProduct} className="w-full">
                          Update Product
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 border-t flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </Card>
  );
};