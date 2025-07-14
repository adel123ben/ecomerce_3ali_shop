import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CartPage } from './components/CartPage';
import { useAuth } from './hooks/useAuth';
import { Product, Category } from './types';
import { supabase } from './lib/supabase';
import Typewriter from './components/Typewriter';
import OrderSuccess from './components/OrderSuccess';
import { HeroCarousel } from './components/HeroCarousel';

// Modern, dismissible announcement bar
function AnnouncementBar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 w-full z-[100] flex items-center gap-x-6 overflow-hidden bg-orange-500 px-4 sm:px-6 py-1.5 sm:py-2 shadow-md h-9 sm:h-11">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 w-full justify-center">
        <p className="text-sm sm:text-base text-white font-semibold">
          <Typewriter text="30% de réduction ce mois-ci !" speed={0.04} />
        </p>
      </div>
      <div className="flex flex-1 justify-end">
        <button type="button" className="-m-2 p-2 focus-visible:outline-none" onClick={onClose}>
          <span className="sr-only">Fermer</span>
          <X className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // GSAP refs for animations
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescriptionRef = useRef<HTMLParagraphElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useGSAP(() => {
    if (selectedCategory === '' && !loading && !showLoader) {
      // Register ScrollTrigger plugin
      gsap.registerPlugin(ScrollTrigger);
      
      // Reset elements to initial state
      gsap.set(heroTitleRef.current, { opacity: 0, y: 30 });
      gsap.set(heroDescriptionRef.current, { opacity: 0, y: 30 });

      // Create scroll-triggered animations
      gsap.fromTo(heroTitleRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroTitleRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(heroDescriptionRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroDescriptionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, [selectedCategory, loading, showLoader]);

  // Handle initial loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if current path is admin route
    const path = window.location.pathname;
    setIsAdminRoute(path.startsWith('/admin'));
    
    // Listen for route changes
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsAdminRoute(path.startsWith('/admin'));
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAdminRoute]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === '' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (categoryId: string) => {
    if (categoryId === '') return '';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '';
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // Announcement bar state
  const [barVisible, setBarVisible] = useState(true);

  // Admin route logic
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <AdminLogin />;
    }

    return <AdminDashboard />;
  }

  // Customer-facing app
  return (
    <div className="min-h-screen bg-gray-50">
      <AnnouncementBar visible={barVisible} onClose={() => setBarVisible(false)} />
      {barVisible && <div className="h-9 sm:h-11" />} {/* Spacer for announcement bar height, only when bar is visible */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProductClick={handleProductClick}
        onCartClick={() => setIsCartOpen(true)}
        announcementBarVisible={barVisible}
      />
      <Routes>
        <Route
          path="/"
          element={
            showLoader ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 text-lg">Loading amazing products...</p>
                </div>
              </div>
            ) : (
              <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* TODO: carousel aded */}
                {selectedCategory === '' && <HeroCarousel />}
                {selectedCategory === '' && (
                  <div className="mb-12  mt-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-left bg-gradient-to-r from-gray-700 via-gray-600 to-gray-800 bg-clip-text text-transparent" ref={heroTitleRef}>
                      Premium Athletic Wear
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed text-left" ref={heroDescriptionRef}>
                      Discover our premium collection of high-performance sportswear designed for athletes and fitness enthusiasts who demand excellence
                    </p>
                  </div>
                )}
                <ProductGrid
                  products={filteredProducts}
                  loading={loading}
                  onProductClick={handleProductClick}
                  categoryName={getCategoryName(selectedCategory)}
                />
              </main>
            )
          }
        />
        <Route path="/product" element={<Navigate to="/" replace />} />
        <Route
          path="/product/:id"
          element={<ProductDetailRoute products={products} announcementBarVisible={barVisible} />}
        />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
      <CartPage
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProductClick={handleProductClick}
      />
      <Footer />
      <WhatsAppButton />
      <Toaster position="top-right" />
    </div>
  );
}

// Route handler for /product/:id
function ProductDetailRoute({ products, announcementBarVisible }: { products: Product[], announcementBarVisible: boolean }) {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === String(id));
  if (!product) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-500">The product you are looking for does not exist.</p>
      </div>
    );
  }
  return <ProductDetailPage product={product} announcementBarVisible={announcementBarVisible} />;
}

export default App;