import React, { useState } from 'react';
import { AdminLayout } from './admin/AdminLayout';
import { ProductsTab } from './admin/ProductsTab';
import { InventoryTab } from './admin/InventoryTab';
import { InquiriesTab } from './admin/InquiriesTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { OrdersTab } from './admin/OrdersTab';

export const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('products');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'products':
        return <ProductsTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'inquiries':
        return <InquiriesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'orders':
        return <OrdersTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <AdminLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};