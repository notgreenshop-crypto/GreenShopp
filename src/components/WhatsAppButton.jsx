import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = ({ primaryNumber, secondaryNumber }) => {
  const [showOptions, setShowOptions] = useState(false);

  const openWhatsApp = (number) => {
    window.open(`https://wa.me/${number}`, '_blank');
    setShowOptions(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showOptions && (primaryNumber && secondaryNumber) && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl p-4 animate-slideInUp">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Contact Us</h3>
            <button 
              onClick={() => setShowOptions(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => openWhatsApp(primaryNumber)}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all transform hover:scale-105"
            >
              <p className="text-sm font-semibold text-gray-900">Primary Support</p>
              <p className="text-xs text-gray-600">+{primaryNumber}</p>
            </button>
            {secondaryNumber && (
              <button
                onClick={() => openWhatsApp(secondaryNumber)}
                className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-all transform hover:scale-105"
              >
                <p className="text-sm font-semibold text-gray-900">Secondary Support</p>
                <p className="text-xs text-gray-600">+{secondaryNumber}</p>
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (primaryNumber && secondaryNumber) {
            setShowOptions(!showOptions);
          } else {
            openWhatsApp(primaryNumber);
          }
        }}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 animate-pulse-slow"
        aria-label="WhatsApp Support"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default WhatsAppButton;