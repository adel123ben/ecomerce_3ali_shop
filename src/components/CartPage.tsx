import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, Phone, User, MessageCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

interface CartPageProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  notes?: string;
}

export const CartPage: React.FC<CartPageProps> = ({
  isOpen,
  onClose,
  onProductClick,
}) => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getTotalInDZD 
  } = useCartStore();

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    notes: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 100, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async () => {
    if (!formData.customer_name || !formData.customer_phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database
      const orderData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || '',
        customer_address: formData.customer_address || '',
        notes: formData.notes || '',
        total_amount: totalPrice,
        status: 'pending',
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          product_name: item.name,
          product_image: item.image_url,
        })),
      };

      // Here you would typically save to your database
      // For now, we'll just show the WhatsApp message
      
      // Create WhatsApp message
      const itemsList = items.map(item => 
        `• ${item.name} - ${item.price.toFixed(2)} DA x${item.quantity}`
      ).join('\n');

      const whatsappMessage = `🛒 *New Order*

*Customer Information:*
👤 Name: ${formData.customer_name}
📱 Phone: ${formData.customer_phone}
${formData.customer_email ? `📧 Email: ${formData.customer_email}` : ''}
${formData.customer_address ? `📍 Address: ${formData.customer_address}` : ''}

*Order Details:*
${itemsList}

*Total: ${totalPrice.toFixed(2)} DA* (${getTotalInDZD()})

${formData.notes ? `*Notes:* ${formData.notes}` : ''}

Please confirm this order and provide delivery information.`;

      // Open WhatsApp
      const whatsappNumber = '+1234567890'; // Replace with your admin WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      
      window.open(whatsappUrl, '_blank');
      
      // Clear cart and close
      clearCart();
      setShowOrderForm(false);
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_address: '',
        notes: '',
      });
      
      toast.success('Order submitted successfully! Check WhatsApp for confirmation.');
      onClose();
      // Redirige vers la page de succès
      navigate('/order-success');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center p-2 sm:p-4 transition-all duration-300 ${showOrderForm ? 'items-start pt-16 sm:pt-24' : 'items-center'}`}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto"
        style={{ marginTop: showOrderForm ? 0 : undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-black p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
              <p className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Start shopping to add items to your cart
              </p>
              <button
                onClick={onClose}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : showOrderForm ? (
            /* Order Form */
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Complete Your Order
                </h3>
                <p className="text-sm text-gray-600">
                  Fill in your details to complete your purchase
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange('customer_email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address}
                    onChange={(e) => handleInputChange('customer_address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter delivery address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Any special instructions or notes..."
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {item.price.toFixed(2)} DA
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{totalPrice.toFixed(2)} DA</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getTotalInDZD()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {item.price.toFixed(2)} DA
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {item.stock_quantity} available
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className={`p-1 rounded transition-colors ${
                        item.quantity >= item.stock_quantity
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} DA
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6">
            {!showOrderForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPrice.toFixed(2)} DA
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTotalInDZD()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOrderForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => setShowOrderForm(true)}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Checkout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>
                    {isSubmitting ? 'Processing...' : 'Submit Order via WhatsApp'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};