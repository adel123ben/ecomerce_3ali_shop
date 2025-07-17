import React, { useRef, useEffect } from 'react';
import { X, Heart, Trash2, ShoppingBag, Eye } from 'lucide-react';
import { useCartStore, WishlistItem } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';
import gsap from 'gsap';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  onProductClick,
}) => {
  const { wishlist, removeFromWishlist, addToCart } = useCartStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    toast.success('Removed from favorites');
  };

  const handleAddToCart = (product: WishlistItem) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: 999, // Default stock for wishlist items
    });
    toast.success('Added to cart');
  };

  const handleViewProduct = (product: WishlistItem) => {
    if (onProductClick) {
      // Convert WishlistItem to Product format
      const productData: Product = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        description: '',
        category_id: '',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        in_stock: true,
        stock_quantity: 999,
      };
      onProductClick(productData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 rounded-full">
              <Heart className="h-6 w-6 text-red-500 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Favorites</h2>
              <p className="text-sm text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content (scrollable area) */}
        <div className="overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(90vh - 140px - 72px)' }}>
          {wishlist.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your favorites list is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Start adding products to your favorites to see them here
              </p>
              <button
                onClick={onClose}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {item.price.toFixed(2)} DA
                    </p>
                    {item.created_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewProduct(item)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="View product"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-gray-100 p-6 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in favorites
              </div>
              <button
                onClick={onClose}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 