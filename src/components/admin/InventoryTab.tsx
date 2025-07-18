import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

interface InventoryItem extends Product {
  stock_quantity: number;
  low_stock_threshold: number;
  total_inquiries: number;
}

export const InventoryTab: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [inquiriesCount, setInquiriesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInventory();
    fetchInquiriesCount();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `);

      if (error) throw error;

      // Utilise les vraies valeurs de stock, low_stock_threshold fixé à 5
      const inventoryData: InventoryItem[] = (products || []).map((product) => ({
        ...product,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: 5, // valeur fixe, configurable si besoin
      }));

      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiriesCount = async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('product_id', { count: 'exact', head: false });
    if (error) return;
    // Compte le nombre d'inquiries par product_id
    const countMap: Record<string, number> = {};
    data?.forEach((inq) => {
      if (inq.product_id) {
        countMap[inq.product_id] = (countMap[inq.product_id] || 0) + 1;
      }
    });
    setInquiriesCount(countMap);
  };

  const filteredInventory = inventory.filter((item) => {
    switch (filter) {
      case 'low_stock':
        return item.in_stock && item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold;
      case 'out_of_stock':
        return !item.in_stock || item.stock_quantity <= 0;
      default:
        return true;
    }
  });

  const getStockStatus = (item: InventoryItem) => {
    if (!item.in_stock || item.stock_quantity <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    } else if (item.in_stock && item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold) {
      return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle };
    } else {
      return { status: 'In Stock', color: 'text-green-600 bg-green-100', icon: Package };
    }
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock_quantity), 0);
  const lowStockItems = inventory.filter(item => item.in_stock && item.stock_quantity > 0 && item.stock_quantity <= item.low_stock_threshold).length;
  const outOfStockItems = inventory.filter(item => !item.in_stock || item.stock_quantity <= 0).length;

  // Fonction utilitaire pour formater en Dinar Algérien
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div>
          <div className="hidden sm:flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'low_stock'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'out_of_stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out of Stock
            </button>
          </div>
          <div className="sm:hidden">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'low_stock' | 'out_of_stock')}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Items</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquiries
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.image_url || '/placeholder-product.jpg'}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.price)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stock_quantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.price * item.stock_quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiriesCount[item.id] || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No items found for the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
};