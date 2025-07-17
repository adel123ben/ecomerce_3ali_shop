import React, { useEffect } from 'react';
import { LogOut, Package, MessageSquare, BarChart3, User, Archive, ShoppingBag, Image as ImageIcon, Megaphone, Menu, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentTab, onTabChange }) => {
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const scrollDivs = document.querySelectorAll('div.overflow-x-auto');
    scrollDivs.forEach(div => div.classList.add('custom-scrollbar-h'));
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'imageslider', label: 'ImageSlider', icon: ImageIcon },
    { id: 'announcementbar', label: 'AnnouncementBar', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SportShop Admin</span>
            </div>
            
            {/* Desktop: user/email + sign out, Mobile: burger menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              {/* Mobile dropdown menu */}
              {mobileMenuOpen && (
                <div className="absolute right-4 top-16 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 animate-fadeIn">
                  <div className="flex flex-col p-4 space-y-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); window.location = '/'; }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Home className="h-5 w-5" />
                      <span>Homepage</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700 break-all">{user?.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative custom-scrollbar-h">
              {/* Optional: fade effect for overflow */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent hidden sm:block" />
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 whitespace-nowrap py-2 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm ${
                      currentTab === item.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={{ minWidth: 90 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {children}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar-h::-webkit-scrollbar {
          height: 5px;
        }
        .custom-scrollbar-h::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar-h::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};