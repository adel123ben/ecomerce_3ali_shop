import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Product } from '../types';

interface RecentlyViewedProps {
  onProductClick: (product: Product) => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ onProductClick }) => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentProducts(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing recently viewed products:', error);
      }
    }
  }, []);

  const addToRecentlyViewed = (product: Product) => {
    const existing = recentProducts.filter(p => p.id !== product.id);
    const updated = [product, ...existing].slice(0, 5); // Keep only 5 recent items
    setRecentProducts(updated);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  // Expose the function to parent components
  React.useImperativeHandle(React.createRef(), () => ({
    addProduct: addToRecentlyViewed,
  }));

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {recentProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="cursor-pointer group"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              <img
                src={product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600">
              {product.name}
            </h3>
            <p className="text-sm font-bold text-blue-600">{product.price.toFixed(2)} DA</p>
          </div>
        ))}
      </div>
    </div>
  );
};