import React, { useState } from 'react';
import { Search, Menu, X, ShoppingBag, Filter, ChevronDown, Heart, User, MoreHorizontal } from 'lucide-react';
import { Category } from '../types';
import { useCartStore } from '../store/cartStore';
import { WishlistModal } from './WishlistModal';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProductClick?: (product: any) => void;
  onCartClick?: () => void;
  announcementBarVisible?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onProductClick,
  onCartClick,
  announcementBarVisible = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreCategoriesOpen, setIsMoreCategoriesOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { totalItems, wishlist } = useCartStore();
  const navigate = useNavigate();

  // Main categories that will be visible in the header
  const mainCategories = ['Men', 'Women', 'Kids'];
  
  // Other categories that will be in the dropdown
  const otherCategories = categories.filter(cat => !mainCategories.includes(cat.name));
  
  const navigationItems = [
    { id: '', label: 'All Products', isNew: true, isSpecial: false },
    ...categories
      .filter(cat => mainCategories.includes(cat.name))
      .map(category => ({
        id: category.id,
        label: category.name,
        isNew: false,
        isSpecial: false,
      })),
  ];

  return (
    <header className={`bg-white shadow-sm sticky z-[200] border-b border-gray-100 ${announcementBarVisible ? 'top-9 sm:top-11' : 'top-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            className="flex items-center focus:outline-none"
            onClick={() => navigate('/')}
            aria-label="Go to home page"
          >
            <div className="bg-black p-2 rounded">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">SportShop</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-black ${
                  selectedCategory === item.id
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-gray-900'
                } ${item.isSpecial ? 'text-red-600 hover:text-red-700' : ''}`}
              >
                {item.label}
                {item.isNew && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    New
                  </span>
                )}
              </button>
            ))}
            
            {/* More Categories Dropdown */}
            {otherCategories.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => setIsMoreCategoriesOpen(!isMoreCategoriesOpen)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-black transition-all duration-200"
                >
                  <span>More</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                  isMoreCategoriesOpen ? 'opacity-100 visible' : ''
                }`}>
                  <div className="p-2">
                    {otherCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          onCategoryChange(category.id);
                          setIsMoreCategoriesOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-black focus:bg-white transition-all w-48 focus:w-64 text-sm"
              />
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-black focus:bg-white w-full text-sm"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onCategoryChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
                    selectedCategory === item.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  } ${item.isSpecial ? 'text-red-600 hover:text-red-700' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    {item.label}
                    {item.isNew && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </button>
              ))}
              
              {/* More Categories in Mobile */}
              {otherCategories.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    More Categories
                  </div>
                  {otherCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onProductClick={onProductClick}
      />
    </header>
  );
};



