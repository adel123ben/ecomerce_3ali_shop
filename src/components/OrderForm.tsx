import React, { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function OrderForm() {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    city: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.country || !form.city || !form.phone) {
      toast.error('Merci de remplir tous les champs obligatoires.');
      return;
    }
    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }
    setSubmitting(true);
    // Ici tu peux envoyer la commande à ton backend/supabase
    setTimeout(() => {
      clearCart();
      toast.success('Commande envoyée avec succès !');
      navigate('/order-success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white py-8 md:py-16">
      <form onSubmit={handleSubmit} className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <ol className="items-center flex w-full max-w-2xl text-center text-sm font-medium text-gray-500 sm:text-base">
          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] sm:after:hidden">
              Panier
            </span>
          </li>
          <li className="after:border-1 flex items-center text-primary-700 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] sm:after:hidden">
              Checkout
            </span>
          </li>
          <li className="flex shrink-0 items-center">Order summary</li>
        </ol>

        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Détails de livraison</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900">Nom*</label>
                  <input type="text" id="name" name="name" value={form.name} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">Email*</label>
                  <input type="email" id="email" name="email" value={form.email} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-900">Adresse*</label>
                  <input type="text" id="country" name="country" value={form.country} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-900">Ville*</label>
                  <input type="text" id="city" name="city" value={form.city} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500" required />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900">Téléphone*</label>
                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500" required />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Votre panier</h2>
              {items.length === 0 ? (
                <div className="text-gray-500">Votre panier est vide.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.price} DA x {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} DA</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end mt-4">
                <span className="text-lg font-bold text-gray-900">Total : {totalPrice.toFixed(2)} DA</span>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Valider la commande'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}