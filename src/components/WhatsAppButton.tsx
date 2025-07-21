import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = '+1234567890'; // Replace with your business WhatsApp number
  const defaultMessage = 'Hi! I have a question about your products.';

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* WhatsApp Button */}
      <div className="relative z-50">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
              Chat with us on WhatsApp
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}

          <button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => {
              setIsHovered(true);
              setShowTooltip(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setShowTooltip(false);
            }}
            className={`group relative bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
              isHovered ? 'animate-pulse' : ''
            }`}
            aria-label="Chat on WhatsApp"
          >
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
            
            {/* Icon */}
            <MessageCircle className="h-6 w-6 relative z-10" />
            
            {/* Online Indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
              <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};