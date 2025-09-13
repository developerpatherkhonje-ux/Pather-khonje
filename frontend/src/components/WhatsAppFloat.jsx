import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = "7439857694";
  const message = "Hello! I'm interested in your travel packages. Please provide more details.";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 mb-2 min-w-[200px]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-800">Need Help?</p>
                <p className="text-xs text-gray-600 mt-1">Chat with us on WhatsApp!</p>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute bottom-[-6px] right-4 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 float-animation"
        style={{ animationDelay: '1s' }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

export default WhatsAppFloat;