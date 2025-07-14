import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Analytics {
  totalProducts: number;
  totalInquiries: number;
  recentInquiries: number;
  popularProducts: Array<{ name: string; inquiries: number }>;
}

export const AnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProducts: 0,
    totalInquiries: 0,
    recentInquiries: 0,
    popularProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total inquiries
      const { count: totalInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      // Get recent inquiries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get popular products
      const { data: popularProductsData, error: popularError } = await supabase
        .from('inquiries')
        .select(`
          product_id,
          product:products(name)
        `);

      if (popularError) throw popularError;

      // Count inquiries per product
      const productCounts: Record<string, { name: string; count: number }> = {};
      popularProductsData?.forEach((inquiry) => {
        if (inquiry.product) {
          const productId = inquiry.product_id;
          if (!productCounts[productId]) {
            productCounts[productId] = { name: inquiry.product.name, count: 0 };
          }
          productCounts[productId].count++;
        }
      });

      const popularProducts = Object.values(productCounts)
        .map(({ name, count }) => ({ name, inquiries: count }))
        .sort((a, b) => b.inquiries - a.inquiries)
        .slice(0, 5);

      setAnalytics({
        totalProducts: totalProducts || 0,
        totalInquiries: totalInquiries || 0,
        recentInquiries: recentInquiries || 0,
        popularProducts,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalInquiries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last 7 Days</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentInquiries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Products</h2>
        {analytics.popularProducts.length > 0 ? (
          <div className="space-y-4">
            {analytics.popularProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{product.inquiries} inquiries</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          analytics.popularProducts.length > 0
                            ? (product.inquiries / analytics.popularProducts[0].inquiries) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No product inquiries yet</p>
          </div>
        )}
      </div>
    </div>
  );
};