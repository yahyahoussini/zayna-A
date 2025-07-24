import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../integrations/supabase/types';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className="w-full h-full overflow-hidden transition-all duration-300 ease-in-out border-transparent shadow-none hover:shadow-xl hover:border-gray-200">
        <Link to={`/product/${product.id}`} className="block">
          <div className="overflow-hidden aspect-square">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold tracking-tight text-gray-800">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{product.description?.substring(0, 50)}...</p>
            <p className="mt-2 text-lg font-bold text-gray-900">${product.price}</p>
          </CardContent>
        </Link>
        <div className="px-4 pb-4">
          <Button asChild className="w-full transition-colors duration-300 bg-gray-800 hover:bg-gray-900">
            <Link to={`/product/${product.id}`}>View Details</Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
