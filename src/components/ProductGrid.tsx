import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  categoryName?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading, 
  onProductClick, 
  categoryName 
}) => {
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 rounded-full p-6 mb-6">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 max-w-md">
            {categoryName 
              ? `No products available in the ${categoryName} category at the moment.`
              : 'Try adjusting your search terms or browse all categories.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      {categoryName && (
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            Discover our premium collection of {categoryName.toLowerCase()} products
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{products.length} product{products.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {products.length >= 12 && (
        <div className="text-center pt-8">
          <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
};