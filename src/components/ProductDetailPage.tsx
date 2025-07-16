import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, Star, ChevronLeft, ChevronRight, ZoomIn, Minus, Plus, ShoppingCart, Check, ArrowRight, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartPage } from './CartPage';
import ReactDOM from 'react-dom';
import { supabase } from '../lib/supabase';
import { ProductCard } from './ProductCard';

interface ProductDetailPageProps {
  product: Product | null;
  onClose?: () => void;
  announcementBarVisible?: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onClose, announcementBarVisible }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart, getCartItem, updateQuantity, totalItems, addToWishlist, removeFromWishlist, isInWishlist } = useCartStore();
  const isLiked = product ? isInWishlist(product.id) : false;
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Fetch all products for recommendations
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('id', product?.id)
          .order('created_at', { ascending: false });
        if (!error && data) setAllProducts(data);
      } catch (e) { /* ignore */ }
    };
    if (product) fetchAllProducts();
  }, [product]);

  const fetchRelatedProducts = async () => {
    if (!product) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', product.id)
        .eq('category_id', product.category_id)
        .limit(4);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.image_url) return;
    
    setIsSliding(true);
    
    // Create array of images (product images)
    const images = product.images && product.images.length > 0 
      ? product.images 
      : (product.image_url ? [product.image_url] : []);
    
    setTimeout(() => {
      if (direction === 'prev') {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
      setIsSliding(false);
    }, 150);
  };

  const handleLike = () => {
    if (!product) return;
    if (isLiked) {
      removeFromWishlist(product.id);
      toast.success('Retiré de la wishlist');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
      toast.success('Ajouté à la wishlist');
    }
  };

  const maxQuantity = product?.stock_quantity || 1;

  const handleAddToCart = () => {
    if (!product) return;
    if (!product.in_stock || product.stock_quantity <= 0) {
      toast.error('Produit out of stock');
      return;
    }
    const cartItem = getCartItem(product.id);
    const newQuantity = (cartItem?.quantity || 0) + quantity;
    if (newQuantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} in stock!`);
      return;
    }
    if (cartItem) {
      updateQuantity(product.id, newQuantity);
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: maxQuantity,
      });
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
    }
    setIsAddedToCart(true);
    toast.success(`Added ${quantity} item(s) to cart`);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!product.in_stock || product.stock_quantity <= 0) {
      toast.error('Produit out of stock');
      return;
    }
    // Navigate to order form with single product data
    navigate('/order', {
      state: {
        singleProduct: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity,
        }
      }
    });
  };
  const handleShare = async (platform: string) => {
    if (!product) return;
    
    const url = window.location.href;
    const text = `Check out this amazing product: ${product.name} - ${product.price.toFixed(2)} DA`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        break;
    }
  };

  if (!product) return null;

  // Create array of images for the gallery
  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [product.image_url] : []);

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => {
                  if (onClose) {
                    onClose();
                  } else {
                    navigate(-1);
                  }
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="h-6 w-6" />
                <span>Close</span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative group">
                  <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50">
                    <Share2 className="h-6 w-6" />
                  </button>
                  {/* Share dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Share on Facebook
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
                {/* Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${typeof announcementBarVisible !== 'undefined' ? (announcementBarVisible ? 'mt-20 sm:mt-24' : 'mt-8 sm:mt-12') : 'mt-20 sm:mt-24'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <div className={`w-full h-full transition-all duration-300 ${isSliding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 cursor-zoom-in"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                    onClick={() => setIsZoomed(true)}
                  />
                </div>
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 sm:p-3 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 sm:p-3 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Info */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 break-words">{product.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <button 
                    onClick={handleLike}
                    className={`p-2 sm:p-2.5 transition-all duration-200 rounded-full border flex items-center justify-center group ${
                      isLiked 
                        ? 'text-red-500 bg-red-100 border-red-300 scale-110' 
                        : 'text-gray-600 hover:text-red-500 hover:bg-red-100 border-gray-200'
                    }`}
                    aria-label={isLiked ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
                  >
                    <Heart className={`h-7 w-7 sm:h-6 sm:w-6 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="ml-2 text-xs font-medium text-gray-700 sm:hidden">
                      {isLiked ? 'Retirer' : 'Ajouter'}
                    </span>
                  </button>
                  {/* Ajout de l'icône MessageCircle */}
                  <button
                    onClick={() => navigate(`/inquiry?productId=${product.id}`)}
                    className="p-2 sm:p-2.5 transition-all duration-200 rounded-full border flex items-center justify-center group text-green-600 hover:text-green-700 hover:bg-green-100 border-green-300 ml-1"
                    aria-label="Demander ou signaler un problème sur ce produit"
                  >
                    <MessageCircle className="h-7 w-7 sm:h-6 sm:w-6" />
                  </button>
                  <div className="flex items-center ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">(4.8) 124 reviews</span>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{product.price.toFixed(2)} DA</p>
                <p className="text-green-600 font-medium mt-2">In Stock</p>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
                <div className="flex flex-nowrap items-center border border-gray-300 rounded-lg w-full max-w-[120px] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-2 py-3 font-medium text-lg w-10 min-w-[2.5rem] text-center select-none overflow-hidden">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddedToCart}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    isAddedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base sm:text-lg"
                >
                  Buy Now
                </button>
              </div>

              {/* Product Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 font-sans text-base sm:text-lg leading-relaxed mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-gray-600">Matériau</span>
                    <span className="font-medium">{product.material || '100% vrai'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-gray-600">Genre</span>
                    <span className="font-medium">{product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 gap-1 sm:gap-0">
                    <span className="text-gray-600">Origin</span>
                    <span className="font-medium">Made in USA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {(relatedProducts.length > 0 || allProducts.length > 0) && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(relatedProducts.length > 0 ? relatedProducts : allProducts.slice(0, 4)).map((relatedProduct) => (
                  <button
                    key={relatedProduct.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-black transform hover:scale-105"
                    onClick={() => {
                      window.location.href = `/product/${relatedProduct.id}`;
                    }}
                    tabIndex={0}
                    aria-label={`View details for ${relatedProduct.name}`}
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={relatedProduct.image_url || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-600">{relatedProduct.price.toLocaleString('en-US', { maximumFractionDigits: 0 })} DA</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      {relatedProduct.category && (
                        <span className="inline-block mt-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {relatedProduct.category.name}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {relatedProducts.length === 0 && allProducts.length > 4 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-full bg-black text-white font-semibold text-base hover:bg-gray-800 transition-all shadow-lg flex items-center space-x-2"
                  >
                    <span>View All Products</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 5 premiers produits du store */}
          {allProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Nos 5 premiers produits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {allProducts.slice(0, 5).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onProductClick={() => navigate(`/product/${prod.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <CartPage
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onProductClick={(product) => {
            setIsCartOpen(false);
            if (product && product.id) {
              navigate(`/product/${product.id}`);
            }
          }}
        />
      )}

      {/* Zoom overlay rendered in portal */}
      {isZoomed ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90" onClick={() => setIsZoomed(false)}>
          <img
            src={currentImage}
            alt={product.name}
            className="max-w-full max-h-full object-contain cursor-zoom-out"
          />
          {/* Navigation arrows in zoom mode */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleImageNavigation('prev'); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
              >
                <ChevronLeft className="h-8 w-8 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleImageNavigation('next'); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
              >
                <ChevronRight className="h-8 w-8 text-gray-800" />
              </button>
            </>
          )}
          {/* Image counter in zoom mode */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
          <button
            className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 hover:bg-gray-200"
            onClick={e => { e.stopPropagation(); setIsZoomed(false); }}
            aria-label="Close zoom"
          >
            <X className="h-6 w-6 text-gray-800" />
          </button>
        </div>,
        document.body
      ) : null}
    </div>
  );
};