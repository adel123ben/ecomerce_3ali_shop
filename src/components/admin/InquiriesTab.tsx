import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Calendar, Trash2, CheckCircle, Eye } from 'lucide-react';
import { Inquiry } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const InquiriesTab: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMessage, setViewMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          product:products(id, name, price, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    setDeletingId(inquiryId);
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', inquiryId);

      if (error) throw error;
      
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== inquiryId));
      toast.success('Inquiry deleted successfully');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    } finally {
      setDeletingId(null);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateWhatsAppLink = (inquiry: Inquiry) => {
    if (!inquiry.product) return '#';
    
    const message = `Hi! I'm interested in ${inquiry.product.name} (Price: ${inquiry.product.price.toFixed(2)} DA)

Name: ${inquiry.customer_name}
Phone: ${inquiry.phone}`;

    // Use a business WhatsApp number instead of customer's phone
    const businessPhone = '+213123456789'; // Replace with actual business number
    return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Inquiries</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchInquiries}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            Total: {inquiries.length} inquiries
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inquiry.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inquiry.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      {inquiry.product?.image_url && (
                        <img
                          src={inquiry.product.image_url}
                          alt={inquiry.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <span>{inquiry.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => setViewMessage(inquiry.message)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Voir le message complet"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <a
                        href={generateWhatsAppLink(inquiry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Contact via WhatsApp"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => deleteInquiry(inquiry.id)}
                        disabled={deletingId === inquiry.id}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete inquiry"
                      >
                        {deletingId === inquiry.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {inquiries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No customer inquiries yet</p>
            <p className="text-sm text-gray-400 mt-2">Customer inquiries will appear here when they submit product interest forms</p>
          </div>
        )}
      </div>

      {/* Modal pour afficher le message complet */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Message du client</h2>
            <div className="text-gray-800 whitespace-pre-line break-words mb-6 max-h-60 overflow-y-auto">{viewMessage}</div>
            <button
              onClick={() => setViewMessage(null)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};