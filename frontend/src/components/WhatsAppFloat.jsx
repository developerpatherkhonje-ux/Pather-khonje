import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { X } from "lucide-react";

function WhatsAppFloat() {
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = "7439857694";
  const message =
    "Hello! I'm interested in your travel packages. Please provide more details.";

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-20 right-0 mb-2 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 min-w-[240px] overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent opacity-80 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  Need Help?
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(false);
                  }}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-800 font-medium">
                Chat with us on WhatsApp!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        {/* Pulse Ring */}
        <motion.div
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full bg-green-500/50 -z-10"
        />

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative z-10 bg-gradient-to-tr from-green-500 to-green-600 text-white rounded-full p-3 shadow-xl hover:shadow-green-500/40 transition-shadow duration-300 flex items-center justify-center group"
        >
          <FaWhatsapp className="h-6 w-6 drop-shadow-sm" />
        </motion.button>
      </div>
    </div>
  );
}

export default WhatsAppFloat;
