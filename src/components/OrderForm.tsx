import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, MessageSquare, ShoppingCart } from 'lucide-react';

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Full name is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_phone: z.string().min(10, 'Valid phone number is required'),
  customer_address: z.string().min(10, 'Shipping address is required'),
  special_instructions: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  singleProduct?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    quantity: number;
  };
}

export const OrderForm: React.FC<OrderFormProps> = ({ singleProduct }) => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  // Determine if this is a single product order or cart order
  const orderItems = singleProduct 
    ? [singleProduct] 
    : items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: item.quantity,
      }));

  const orderTotal = singleProduct 
    ? singleProduct.price * singleProduct.quantity 
    : totalPrice;

  const shippingCost = orderTotal > 5000 ? 0 : 500; // Free shipping over 5000 DA
  const finalTotal = orderTotal + shippingCost;

  const onSubmit = async (data: OrderFormData) => {
    if (orderItems.length === 0) {
      toast.error('No items to order');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          total_amount: finalTotal,
          status: 'pending',
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error('Failed to create order items');
      }

      // Clear cart if it was a cart checkout
      if (!singleProduct) {
        clearCart();
      }

      toast.success('Order placed successfully!');
      
      // Navigate to success page with order details
      navigate('/order-success', { 
        state: { 
          orderId: order.id,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
          customerAddress: data.customer_address,
          items: orderItems,
          subtotal: orderTotal,
          shippingCost: shippingCost,
          total: finalTotal,
          specialInstructions: data.special_instructions
        } 
      });

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Complete your order details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-2 lg:order-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Customer Details
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('customer_name')}
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customer_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      {...register('customer_email')}
                      type="email"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.customer_email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customer_email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      {...register('customer_phone')}
                      type="tel"
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="+213 XXX XXX XXX"
                    />
                  </div>
                  {errors.customer_phone && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customer_phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <textarea
                      {...register('customer_address')}
                      rows={3}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                      placeholder="Enter your complete shipping address"
                    />
                  </div>
                  {errors.customer_address && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.customer_address.message}</p>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <textarea
                    {...register('special_instructions')}
                    rows={3}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                    placeholder="Any special delivery instructions or notes..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Place Order - {finalTotal.toFixed(2)} DA</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-1 lg:order-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url || '/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {(item.price * item.quantity).toFixed(2)} DA
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {item.price.toFixed(2)} DA each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{orderTotal.toFixed(2)} DA</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)} DA`}
                </span>
              </div>
              {shippingCost === 0 && (
                <p className="text-xs text-green-600">Free shipping on orders over 5,000 DA</p>
              )}
              <div className="flex justify-between text-base sm:text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)} DA</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                🔒 Your order information is secure and encrypted. We'll send you a confirmation email once your order is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};