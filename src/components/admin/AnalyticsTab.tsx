import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, MessageSquare, DollarSign, ShoppingCart, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Analytics {
  totalProducts: number;
  totalInquiries: number;
  totalOrders: number;
  totalRevenue: number;
  recentInquiries: number;
  recentOrders: number;
  popularProducts: Array<{ name: string; inquiries: number; orders: number }>;
  salesTrends: Array<{ date: string; orders: number; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number; color: string }>;
  topCategories: Array<{ name: string; products: number; revenue: number }>;
}

export const AnalyticsTab: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProducts: 0,
    totalInquiries: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentInquiries: 0,
    recentOrders: 0,
    popularProducts: [],
    salesTrends: [],
    orderStatusDistribution: [],
    topCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const now = new Date();
      const timeRangeDate = new Date();
      timeRangeDate.setDate(now.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total inquiries
      const { count: totalInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .neq('status', 'cancelled');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Get recent inquiries (last 7 days)
      const { count: recentInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get recent orders (last 7 days)
      const { count: recentOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get popular products (by inquiries and orders)
      const { data: inquiryData } = await supabase
        .from('inquiries')
        .select('product_id, product:products(name)')
        .gte('created_at', timeRangeDate.toISOString());

      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity')
        .gte('created_at', timeRangeDate.toISOString());

      // Process popular products
      const productStats: Record<string, { name: string; inquiries: number; orders: number }> = {};
      
      inquiryData?.forEach((inquiry) => {
        if (inquiry.product) {
          const productId = inquiry.product_id;
          if (!productStats[productId]) {
            productStats[productId] = { name: inquiry.product.name, inquiries: 0, orders: 0 };
          }
          productStats[productId].inquiries++;
        }
      });

      orderItemsData?.forEach((item) => {
        const productId = item.product_id;
        if (!productStats[productId]) {
          productStats[productId] = { name: item.product_name, inquiries: 0, orders: 0 };
        }
        productStats[productId].orders += item.quantity;
      });

      const popularProducts = Object.values(productStats)
        .sort((a, b) => (b.inquiries + b.orders) - (a.inquiries + a.orders))
        .slice(0, 5);

      // Get sales trends
      const { data: ordersData } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .gte('created_at', timeRangeDate.toISOString())
        .neq('status', 'cancelled')
        .order('created_at');

      // Process sales trends by day
      const salesByDay: Record<string, { orders: number; revenue: number }> = {};
      ordersData?.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { orders: 0, revenue: 0 };
        }
        salesByDay[date].orders++;
        salesByDay[date].revenue += order.total_amount;
      });

      const salesTrends = Object.entries(salesByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Get order status distribution
      const { data: statusData } = await supabase
        .from('orders')
        .select('status')
        .gte('created_at', timeRangeDate.toISOString());

      const statusCounts: Record<string, number> = {};
      statusData?.forEach((order) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      const statusColors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        shipped: '#8b5cf6',
        delivered: '#10b981',
        cancelled: '#ef4444',
      };

      const orderStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color: statusColors[status] || '#6b7280',
      }));

      // Get top categories
      const { data: categoriesData } = await supabase
        .from('products')
        .select(`
          category_id,
          price,
          category:categories(name)
        `);

      const categoryStats: Record<string, { name: string; products: number; revenue: number }> = {};
      categoriesData?.forEach((product) => {
        if (product.category) {
          const categoryId = product.category_id;
          if (!categoryStats[categoryId]) {
            categoryStats[categoryId] = { name: product.category.name, products: 0, revenue: 0 };
          }
          categoryStats[categoryId].products++;
          // Estimate revenue based on product price (in real app, use actual sales data)
          categoryStats[categoryId].revenue += product.price * 10; // Multiply by average sales
        }
      });

      const topCategories = Object.values(categoryStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setAnalytics({
        totalProducts: totalProducts || 0,
        totalInquiries: totalInquiries || 0,
        totalOrders: totalOrders || 0,
        totalRevenue,
        recentInquiries: recentInquiries || 0,
        recentOrders: recentOrders || 0,
        popularProducts,
        salesTrends,
        orderStatusDistribution,
        topCategories,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
              <p className="text-xs text-green-600">+{analytics.recentOrders} this week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalInquiries}</p>
              <p className="text-xs text-orange-600">+{analytics.recentInquiries} this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Sales Trends
          </h2>
          {analytics.salesTrends.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 flex items-end space-x-2">
                {analytics.salesTrends.map((trend, index) => {
                  const maxRevenue = Math.max(...analytics.salesTrends.map(t => t.revenue));
                  const height = maxRevenue > 0 ? (trend.revenue / maxRevenue) * 200 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">{trend.orders}</div>
                      <div
                        className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}px` }}
                        title={`${formatDate(trend.date)}: ${trend.orders} orders, ${formatCurrency(trend.revenue)}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {formatDate(trend.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 text-center">
                Revenue and order trends over time
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sales data available for the selected period
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Order Status Distribution
          </h2>
          {analytics.orderStatusDistribution.length > 0 ? (
            <div className="space-y-3">
              {analytics.orderStatusDistribution.map((status, index) => {
                const total = analytics.orderStatusDistribution.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (status.count / total) * 100 : 0;
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: status.color }}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{status.status}</span>
                        <span className="text-sm text-gray-600">{status.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ backgroundColor: status.color, width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <p className="text-xs text-gray-500">
                        {product.inquiries} inquiries • {product.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            analytics.popularProducts.length > 0
                              ? ((product.inquiries + product.orders) / 
                                 (analytics.popularProducts[0].inquiries + analytics.popularProducts[0].orders)) * 100
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
              <p className="text-gray-500">No product data available</p>
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
          {analytics.topCategories.length > 0 ? (
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {category.products} products • {formatCurrency(category.revenue)} est. revenue
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};