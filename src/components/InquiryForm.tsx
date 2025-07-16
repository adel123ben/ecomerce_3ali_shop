import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  image_url?: string;
}

export const InquiryForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Récupère l'id du produit depuis l'URL
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url')
      .eq('id', id)
      .single();
    if (!error && data) setProduct(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !phone || !message || !customerName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('inquiries')
      .insert({
        product_id: productId,
        customer_name: customerName,
        phone,
        message,
        created_at: new Date().toISOString(),
      });
    setLoading(false);
    if (error) {
      toast.error('Erreur lors de l\'envoi de la demande');
    } else {
      toast.success('Votre demande a bien été envoyée !');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Demande / Problème sur le produit</h1>
        {product && (
          <div className="flex items-center mb-6">
            <img src={product.image_url || '/placeholder-product.jpg'} alt={product.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
            <span className="font-semibold text-gray-800">{product.name}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre nom complet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre numéro de téléphone"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Votre message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Expliquez votre problème ou posez votre question..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
        </form>
      </div>
    </div>
  );
}; 