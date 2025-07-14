import React from 'react';
import { Heart, ShoppingCart, Eye, Package, Star } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartItem } = useCartStore();
  
  const isLiked = isInWishlist(product.id);
  const cartItem = getCartItem(product.id);
  const isOutOfStock = !product.in_stock || product.stock_quantity === 0;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiked) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error('Product is out of stock');
      return;
    }
    
    if (cartItem && cartItem.quantity >= product.stock_quantity) {
      toast.error('Maximum stock reached');
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
    });
    
    toast.success('Added to cart');
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border border-gray-100 hover:border-gray-200"
      onClick={() => onProductClick(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Stock Status Badge */}
        <div className="absolute top-4 left-4">
          {isOutOfStock ? (
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              Low Stock
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              In Stock
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white bg-opacity-90 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white bg-opacity-90 text-gray-700 hover:bg-black hover:text-white'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              className="p-3 bg-white bg-opacity-90 text-gray-700 rounded-full backdrop-blur-sm hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-lg"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Like Button */}
        <button
          onClick={handleLike}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 shadow-lg ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white bg-opacity-80 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Cart Quantity Badge */}
        {cartItem && cartItem.quantity > 0 && (
          <div className="absolute bottom-4 right-4 bg-black text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
            {cartItem.quantity}
          </div>
        )}
      </div>
      
      {/* Product Information */}
      <div className="p-6 sm:p-4 md:p-6">
        {/* Category Badge */}
        {product.category && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Product Title */}
        <h3
          className="text-lg sm:text-base font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors line-clamp-2 leading-tight md:line-clamp-2 sm:line-clamp-1"
          title={product.name && product.name.length > 40 ? product.name : undefined}
        >
          {product.name && product.name.length > 40
            ? product.name.slice(0, 40) + '...'
            : product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">(4.8)</span>
        </div>
        
        {/* Description */}
        <p
          className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed md:line-clamp-2 sm:line-clamp-1"
          title={product.description && product.description.length > 80 ? product.description : undefined}
        >
          {product.description && product.description.length > 80
            ? product.description.slice(0, 80) + '...'
            : product.description || 'Premium quality sportswear designed for performance and comfort.'}
        </p>
        
        {/* Stock Information */}
        <div className="flex items-center space-x-2 mb-4">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {isOutOfStock ? 'Out of stock' : `${product.stock_quantity} in stock`}
          </span>
        </div>
        
        {/* Price and Action */}
        <div className="flex items-center justify-between flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex flex-col items-start w-full sm:w-auto">
            <span className="text-2xl sm:text-xl font-bold text-gray-900 group-hover:text-black transition-colors mr-2">
              {Number(product.price).toLocaleString('en-US', { maximumFractionDigits: 0 })} DA
            </span>
            <span className="text-xs text-green-600 font-medium">Free shipping</span>
          </div>
          {/* <button 
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
            disabled={isOutOfStock}
            className={`w-full sm:w-auto px-6 py-2.5 sm:px-4 sm:py-2 rounded-xl font-semibold text-sm transition-all duration-200 mt-2 sm:mt-0 ml-0 sm:ml-2
              ${isOutOfStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:scale-105'
              }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'More'}
          </button> */}
        </div>
      </div>
    </div>
  );
};





// import React from 'react';
// import { Heart, ShoppingCart, Eye, Package, Star } from 'lucide-react';
// import { Product } from '../types';
// import { useCartStore } from '../store/cartStore';
// import toast from 'react-hot-toast';

// interface ProductCardProps {
//   product: Product;
//   onProductClick: (product: Product) => void;
// }

// export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick }) => {
//   const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartItem } = useCartStore();
  
//   const isLiked = isInWishlist(product.id);
//   const cartItem = getCartItem(product.id);
//   const isOutOfStock = !product.in_stock || product.stock_quantity === 0;
//   const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

//   const handleLike = (e: React.MouseEvent) => {
//     e.stopPropagation();
    
//     if (isLiked) {
//       removeFromWishlist(product.id);
//       toast.success('Removed from wishlist');
//     } else {
//       addToWishlist({
//         id: product.id,
//         name: product.name,
//         price: product.price,
//         image_url: product.image_url,
//       });
//       toast.success('Added to wishlist');
//     }
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.stopPropagation();
    
//     if (isOutOfStock) {
//       toast.error('Product is out of stock');
//       return;
//     }
    
//     if (cartItem && cartItem.quantity >= product.stock_quantity) {
//       toast.error('Maximum stock reached');
//       return;
//     }
    
//     addToCart({
//       id: product.id,
//       name: product.name,
//       price: product.price,
//       image_url: product.image_url,
//       stock_quantity: product.stock_quantity,
//     });
    
//     toast.success('Added to cart');
//   };

//   return (
//     <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
//       {/* Image Container */}
//       <div className="h-56 w-full">
//         <a href="#" onClick={() => onProductClick(product)}>
//           <img
//             src={product.image_url}
//             alt={product.name}
//             className="mx-auto h-full object-contain dark:hidden"
//             loading="lazy"
//           />
//           <img
//             src={product.image_url}
//             alt={product.name}
//             className="mx-auto hidden h-full object-contain dark:block"
//             loading="lazy"
//           />
//         </a>
//       </div>

//       <div className="pt-6">
//         {/* Stock Status and Action Buttons */}
//         <div className="mb-4 flex items-center justify-between gap-4">
//           <span className={`me-2 rounded px-2.5 py-0.5 text-xs font-medium
//             ${isOutOfStock ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
//               isLowStock ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
//               'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
//             {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
//           </span>

//           <div className="flex items-center justify-end gap-1">
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onProductClick(product);
//               }}
//               className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
//               title="Quick look"
//             >
//               <Eye className="h-5 w-5" />
//             </button>

//             <button
//               type="button"
//               onClick={handleLike}
//               className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
//                 ${isLiked ? 'text-red-500 dark:text-red-400' : ''}`}
//               title="Add to favorites"
//             >
//               <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
//             </button>
//           </div>
//         </div>

//         {/* Product Title */}
//         <a
//           href="#"
//           onClick={() => onProductClick(product)}
//           className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white line-clamp-2"
//         >
//           {product.name}
//         </a>

//         {/* Rating */}
//         <div className="mt-2 flex items-center gap-2">
//           <div className="flex items-center">
//             {[...Array(5)].map((_, i) => (
//               <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
//             ))}
//           </div>
//           <p className="text-sm font-medium text-gray-900 dark:text-white">4.8</p>
//           <p className="text-sm font-medium text-gray-500 dark:text-gray-400">(455)</p>
//         </div>

//         {/* Stock and Features */}
//         <ul className="mt-2 flex items-center gap-4">
//           <li className="flex items-center gap-2">
//             <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//               {isOutOfStock ? 'Out of stock' : `${product.stock_quantity} in stock`}
//             </p>
//           </li>
//           <li className="flex items-center gap-2">
//             <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
//             </svg>
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fast Delivery</p>
//           </li>
//         </ul>

//         {/* Price and Add to Cart */}
//         <div className="mt-4 flex items-center justify-between gap-4">
//           <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
//             ${product.price.toFixed(2)}
//           </p>

//           <button
//             type="button"
//             onClick={handleAddToCart}
//             disabled={isOutOfStock}
//             className={`inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-white
//               ${isOutOfStock
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
//               }`}
//           >
//             <ShoppingCart className="-ms-2 me-2 h-5 w-5" />
//             {cartItem && cartItem.quantity > 0 ? `In Cart (${cartItem.quantity})` : 'Add to cart'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };