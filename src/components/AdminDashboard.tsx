import React, { useState } from 'react';
import { AdminLayout } from './admin/AdminLayout';
import { ProductsTab } from './admin/ProductsTab';
import { InventoryTab } from './admin/InventoryTab';
import { InquiriesTab } from './admin/InquiriesTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { OrdersTab } from './admin/OrdersTab';
import { ImageSliderTab } from './admin/ImageSliderTab';
import { AnnouncementBarTab } from './admin/AnnouncementBarTab';

export const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('products');

  const renderTabContent = () => {
    let content;
    switch (currentTab) {
      case 'products':
        content = <ProductsTab />;
        break;
      case 'inventory':
        content = <InventoryTab />;
        break;
      case 'orders':
        content = <OrdersTab />;
        break;
      case 'inquiries':
        content = <InquiriesTab />;
        break;
      case 'analytics':
        content = <AnalyticsTab />;
        break;
      case 'imageslider':
        content = <ImageSliderTab />;
        break;
      case 'announcementbar':
        content = <AnnouncementBarTab />;
        break;
      default:
        content = <ProductsTab />;
    }
    return content;
  };

  return (
    <AdminLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTabContent()}
    </AdminLayout>
  );
};